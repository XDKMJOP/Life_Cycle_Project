import React, { useState } from 'react';

export interface GenderPillSelectorProps {
  value: 'male' | 'female';
  onChange: (newSex: 'male' | 'female') => void;
  requireConfirmation?: boolean;
  onConfirmChange?: (newSex: 'male' | 'female') => Promise<void> | void;
  disabled?: boolean;
}

export const MaleAvatarSvg: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ display: 'block', borderRadius: '50%' }}
  >
    <circle cx="50" cy="50" r="50" fill="#e8f2fe" />
    {/* Body / Shirt */}
    <path d="M22 92 C22 72 34 68 50 68 C66 68 78 72 78 92 Z" fill="#2563eb" />
    {/* Shirt Collar */}
    <polygon points="50,68 43,80 50,76" fill="#ffffff" />
    <polygon points="50,68 57,80 50,76" fill="#ffffff" />
    {/* Tie */}
    <polygon points="50,76 46,92 54,92" fill="#1d4ed8" />
    {/* Neck */}
    <rect x="44" y="60" width="12" height="12" fill="#fedac0" rx="3" />
    {/* Head / Face */}
    <circle cx="50" cy="46" r="23" fill="#fedac0" />
    {/* Cheeks */}
    <circle cx="37" cy="51" r="3.5" fill="#fca5a5" opacity="0.6" />
    <circle cx="63" cy="51" r="3.5" fill="#fca5a5" opacity="0.6" />
    {/* Eyes */}
    <circle cx="41" cy="45" r="3" fill="#1e293b" />
    <circle cx="59" cy="45" r="3" fill="#1e293b" />
    {/* Smile */}
    <path
      d="M45 53 Q50 57 55 53"
      stroke="#1e293b"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Hair */}
    <path
      d="M27 44 C25 24 38 18 50 18 C62 18 75 24 73 44 C71 33 65 27 50 27 C35 27 29 33 27 44 Z"
      fill="#1e293b"
    />
    <path
      d="M32 38 Q48 30 67 36 Q54 24 32 38 Z"
      fill="#1e293b"
    />
  </svg>
);

export const FemaleAvatarSvg: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ display: 'block', borderRadius: '50%' }}
  >
    <circle cx="50" cy="50" r="50" fill="#fef3c7" />
    {/* Hair back / sides */}
    <path
      d="M22 52 C21 32 32 18 50 18 C68 18 79 32 78 52 C78 70 72 76 72 76 L28 76 C28 76 22 70 22 52 Z"
      fill="#1e293b"
    />
    {/* Body / Shirt */}
    <path d="M24 92 C24 74 35 70 50 70 C65 70 76 74 76 92 Z" fill="#f59e0b" />
    {/* Collar */}
    <polygon points="50,70 43,80 50,77" fill="#ffffff" />
    <polygon points="50,70 57,80 50,77" fill="#ffffff" />
    {/* Neck */}
    <rect x="44" y="62" width="12" height="12" fill="#fedac0" rx="3" />
    {/* Head / Face */}
    <circle cx="50" cy="48" r="22" fill="#fedac0" />
    {/* Bangs */}
    <path
      d="M26 44 C26 28 36 23 50 23 C64 23 74 28 74 44 C70 34 62 34 50 34 C38 34 30 34 26 44 Z"
      fill="#1e293b"
    />
    {/* Cheeks */}
    <circle cx="36" cy="53" r="3.5" fill="#f472b6" opacity="0.65" />
    <circle cx="64" cy="53" r="3.5" fill="#f472b6" opacity="0.65" />
    {/* Eyes */}
    <circle cx="41" cy="47" r="3" fill="#1e293b" />
    <circle cx="59" cy="47" r="3" fill="#1e293b" />
    {/* Smile */}
    <path
      d="M46 55 Q50 59 54 55"
      stroke="#1e293b"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const GenderPillSelector: React.FC<GenderPillSelectorProps> = ({
  value,
  onChange,
  requireConfirmation = false,
  onConfirmChange,
  disabled = false,
}) => {
  const [pendingSex, setPendingSex] = useState<'male' | 'female' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelect = (targetSex: 'male' | 'female') => {
    if (disabled || isProcessing) return;
    if (targetSex === value) return; // already active

    if (requireConfirmation) {
      setPendingSex(targetSex);
    } else {
      onChange(targetSex);
    }
  };

  const handleConfirm = async () => {
    if (!pendingSex) return;
    setIsProcessing(true);
    try {
      if (onConfirmChange) {
        await onConfirmChange(pendingSex);
      } else {
        onChange(pendingSex);
      }
    } finally {
      setIsProcessing(false);
      setPendingSex(null);
    }
  };

  const handleCancel = () => {
    if (isProcessing) return;
    setPendingSex(null);
  };

  return (
    <div className="gender-pill-container">
      {/* Pills Stack / Group matching User Image 1 */}
      <div className="gender-pills-wrap">
        {/* MALE PILL (Avatar on Left, 'Male' on Right) */}
        <button
          type="button"
          className={`gender-pill-btn male-pill ${value === 'male' ? 'active' : 'inactive'}`}
          onClick={() => handleSelect('male')}
          disabled={disabled || isProcessing}
          aria-label="เลือกเพศชาย (Male)"
        >
          <div className="gender-avatar-knob">
            <MaleAvatarSvg size={44} />
          </div>
          <div className="gender-pill-label">
            <span className="gender-pill-main-text">Male</span>
            <span className="gender-pill-sub-text">เพศชาย</span>
          </div>
        </button>

        {/* FEMALE PILL ('Female' on Left, Avatar on Right) */}
        <button
          type="button"
          className={`gender-pill-btn female-pill ${value === 'female' ? 'active' : 'inactive'}`}
          onClick={() => handleSelect('female')}
          disabled={disabled || isProcessing}
          aria-label="เลือกเพศหญิง (Female)"
        >
          <div className="gender-pill-label text-left">
            <span className="gender-pill-main-text">Female</span>
            <span className="gender-pill-sub-text">เพศหญิง</span>
          </div>
          <div className="gender-avatar-knob">
            <FemaleAvatarSvg size={44} />
          </div>
        </button>
      </div>

      {/* Program Summary Tag */}
      <div className={`gender-program-summary ${value}`}>
        <div className="program-summary-header">
          {value === 'male' ? 'โปรแกรมฝึกเพศชาย 50 ท่า' : 'โปรแกรมฝึกเพศหญิง 50 ท่า'}
        </div>
        <div className="program-summary-desc">
          {value === 'male'
            ? 'อุปกรณ์ 25 ท่า (อก บ่า หลัง แขน ขา) + บอดี้เวท 25 ท่า (กระจายฝึก 30 วัน)'
            : 'เน้นก้น สะโพก เอวคอด (อุปกรณ์ 25 ท่า + บอดี้เวท 25 ท่า กระจายฝึก 30 วัน)'}
        </div>
      </div>

      {/* CONFIRMATION / WARNING MODAL */}
      {pendingSex && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="gender-warning-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="gender-warning-header">
              <div className="warning-icon-badge">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="gender-warning-title">ยืนยันการเปลี่ยนเพศ</h3>
            </div>

            <div className="gender-warning-body">
              <p className="warning-primary-msg">
                คำเตือน: หากคุณเปลี่ยนเพศเป็น{' '}
                <strong>{pendingSex === 'female' ? 'เพศหญิง' : 'เพศชาย'}</strong>{' '}
                ระบบจะทำการปรับเปลี่ยนโปรแกรมการฝึกและท่าออกกำลังกายทั้ง 50 ท่าใหม่ทั้งหมด
                ให้ตรงกับสรีระและเป้าหมายของเพศ{pendingSex === 'female' ? 'หญิง' : 'ชาย'}
              </p>

              <div className="warning-change-card">
                <div className="change-row">
                  <span className="change-label">เพศเดิม:</span>
                  <span className="change-val current">
                    {value === 'male' ? 'เพศชาย (Male)' : 'เพศหญิง (Female)'}
                  </span>
                </div>
                <div className="change-row">
                  <span className="change-label">เพศใหม่:</span>
                  <span className="change-val target">
                    {pendingSex === 'male' ? 'เพศชาย (Male)' : 'เพศหญิง (Female)'}
                  </span>
                </div>
                <div className="change-divider" />
                <div className="change-detail">
                  {pendingSex === 'female' ? (
                    <>
                      ท่าฝึกจะเปลี่ยนเป็น <strong>โปรแกรมหญิง 50 ท่า</strong> (เน้นก้น สะโพก เอวคอด)
                      พร้อมโมเดลท่าฝึกหญิงและภาพ GIF ของผู้หญิงทั้งหมด
                    </>
                  ) : (
                    <>
                      ท่าฝึกจะเปลี่ยนเป็น <strong>โปรแกรมชาย 50 ท่า</strong> (เน้นอก บ่า หลัง แขน ขา)
                      พร้อมโมเดลท่าฝึกชายและภาพ GIF ของผู้ชายทั้งหมด
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="gender-warning-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={`modal-confirm-btn ${pendingSex}`}
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'กำลังอัปเดตแผน...'
                  : `ยืนยันเปลี่ยนเป็นเพศ${pendingSex === 'male' ? 'ชาย' : 'หญิง'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
