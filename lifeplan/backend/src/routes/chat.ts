import { Router } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { askAiCoach } from '../lib/ai';
import { pool } from '../lib/db';
import { removeEmojis } from '../lib/sanitize';
import { requireAuth, type AuthedRequest } from '../middleware/auth';

export const chatRouter = Router();
chatRouter.use(requireAuth);

// Helper: Ensure legacy messages without session_id get assigned to a default session
async function migrateOrphanMessages(userId: number): Promise<void> {
  const [orphans] = await pool.query<RowDataPacket[]>(
    'SELECT id, content FROM chat_messages WHERE user_id = ? AND session_id IS NULL ORDER BY id ASC LIMIT 1',
    [userId],
  );
  if (orphans.length > 0) {
    const defaultTitle = orphans[0].content.slice(0, 30).trim() || 'การสนทนาก่อนหน้า';
    const [sessRes] = await pool.query<ResultSetHeader>(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [userId, defaultTitle],
    );
    await pool.query(
      'UPDATE chat_messages SET session_id = ? WHERE user_id = ? AND session_id IS NULL',
      [sessRes.insertId, userId],
    );
  }
}

// GET /chat/sessions - List chat sessions for user
chatRouter.get('/sessions', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  await migrateOrphanMessages(userId);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.title, s.created_at AS createdAt, s.updated_at AS updatedAt,
       (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY id DESC LIMIT 1) AS lastMessage
     FROM chat_sessions s
     WHERE s.user_id = ?
     ORDER BY s.updated_at DESC, s.id DESC`,
    [userId],
  );

  res.json({
    sessions: rows.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      lastMessage: r.lastMessage || null,
    })),
  });
});

// POST /chat/sessions - Create a new chat session
chatRouter.post('/sessions', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const rawTitle = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const title = removeEmojis(rawTitle) || 'การสนทนาใหม่';

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
    [userId, title],
  );

  res.status(201).json({
    session: {
      id: result.insertId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: null,
    },
  });
});

// PATCH /chat/sessions/:id - Rename a chat session
chatRouter.patch('/sessions/:id', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const sessionId = Number(req.params.id);
  const rawTitle = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const title = removeEmojis(rawTitle);

  if (!title) {
    return res.status(400).json({ error: 'ชื่อการสนทนาต้องไม่ว่างเปล่า' });
  }

  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE chat_sessions SET title = ? WHERE id = ? AND user_id = ?',
    [title, sessionId, userId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'ไม่พบการสนทนานี้' });
  }

  res.json({ ok: true, id: sessionId, title });
});

// DELETE /chat/sessions/:id - Delete a specific chat session and its messages
chatRouter.delete('/sessions/:id', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const sessionId = Number(req.params.id);

  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM chat_sessions WHERE id = ? AND user_id = ?',
    [sessionId, userId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'ไม่พบการสนทนานี้' });
  }

  res.json({ ok: true, deletedSessionId: sessionId });
});

// DELETE /chat/history - Delete chat messages / clear history
chatRouter.delete('/history', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const rawSessionId = req.query.sessionId ? Number(req.query.sessionId) : null;

  if (rawSessionId) {
    await pool.query('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [rawSessionId, userId]);
  } else {
    // Delete all sessions and orphan messages for this user
    await pool.query('DELETE FROM chat_sessions WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
  }

  res.json({ ok: true });
});

// GET /chat/history - Retrieve chat history for user (supports ?sessionId=...)
chatRouter.get('/history', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  await migrateOrphanMessages(userId);

  let targetSessionId = req.query.sessionId ? Number(req.query.sessionId) : null;

  if (!targetSessionId) {
    // Pick the most recently updated session
    const [latestSessions] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 1',
      [userId],
    );
    if (latestSessions.length > 0) {
      targetSessionId = latestSessions[0].id;
    }
  }

  if (!targetSessionId) {
    return res.json({ sessionId: null, messages: [] });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, role, content, created_at FROM chat_messages WHERE user_id = ? AND session_id = ? ORDER BY id ASC LIMIT 100',
    [userId, targetSessionId],
  );

  res.json({
    sessionId: targetSessionId,
    messages: rows.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      createdAt: r.created_at,
    })),
  });
});

// POST /chat - Send message and get AI advice
chatRouter.post('/', async (req: AuthedRequest, res) => {
  const userId = req.userId;
  const rawMessage = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!rawMessage) {
    return res.status(400).json({ error: 'ข้อความต้องไม่ว่างเปล่า' });
  }

  const message = removeEmojis(rawMessage);
  let sessionId = req.body.sessionId ? Number(req.body.sessionId) : null;

  // Verify or create session
  if (sessionId) {
    const [sessCheck] = await pool.query<RowDataPacket[]>(
      'SELECT id, title FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId],
    );
    if (sessCheck.length === 0) {
      sessionId = null;
    }
  }

  if (!sessionId) {
    const titleSnippet = message.slice(0, 32).trim() || 'การสนทนาใหม่';
    const [newSess] = await pool.query<ResultSetHeader>(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [userId, titleSnippet],
    );
    sessionId = newSess.insertId;
  } else {
    // If title is default, update with first question
    const titleSnippet = message.slice(0, 32).trim();
    await pool.query(
      'UPDATE chat_sessions SET title = ? WHERE id = ? AND title = "การสนทนาใหม่"',
      [titleSnippet, sessionId],
    );
  }

  // 1. Fetch user profile
  const [profiles] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM profiles WHERE user_id = ?',
    [userId],
  );

  const p = profiles[0] || {
    name: 'ผู้ใช้งาน',
    goal: 'สุขภาพดี',
    target_kcal: 2000,
    weight_kg: 70,
  };

  // 2. Fetch recent chat history in this session
  const [historyRows] = await pool.query<RowDataPacket[]>(
    'SELECT role, content FROM chat_messages WHERE user_id = ? AND session_id = ? ORDER BY id DESC LIMIT 8',
    [userId, sessionId],
  );

  const history = historyRows
    .reverse()
    .map((r) => ({ role: r.role as 'user' | 'assistant', content: r.content }));

  // 3. Save user message to database
  await pool.query(
    'INSERT INTO chat_messages (user_id, session_id, role, content) VALUES (?, ?, "user", ?)',
    [userId, sessionId, message],
  );

  // 4. Generate AI response
  const reply = await askAiCoach(
    message,
    {
      name: p.name,
      goal: p.goal,
      targetKcal: p.target_kcal,
      weightKg: Number(p.weight_kg),
      injuries: p.injuries,
    },
    history,
  );

  // 5. Save assistant reply to database
  await pool.query(
    'INSERT INTO chat_messages (user_id, session_id, role, content) VALUES (?, ?, "assistant", ?)',
    [userId, sessionId, reply],
  );

  // 6. Update session updated_at
  await pool.query(
    'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [sessionId],
  );

  res.json({ reply, sessionId });
});
