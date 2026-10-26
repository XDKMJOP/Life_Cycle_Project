import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../lib/db';
import { signToken } from '../middleware/auth';

export const authRouter = Router();

const credSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

authRouter.post('/register', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid input' });
  const { email, password } = parsed.data;

  const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (exists.length) return res.status(409).json({ error: 'email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hash],
  );
  res.status(201).json({ token: signToken(r.insertId), userId: r.insertId });
});

authRouter.post('/login', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid input' });
  const { email, password } = parsed.data;

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, password_hash FROM users WHERE email = ?',
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'wrong email or password' });
  }
  res.json({ token: signToken(user.id), userId: user.id });
});
