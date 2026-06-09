import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Email'  },
  { id: 2, label: 'Verify' },
  { id: 3, label: 'Reset'  },
];

const RESEND_SECONDS = 60;
const CODE_LENGTH    = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_CFG = [
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f97316' },
  { label: 'Good',   color: '#eab308' },
  { label: 'Strong', color: '#22c55e' },
];

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ?  32 : -32, opacity: 0 }),
  center:          ({ x: 0, opacity: 1 }),
  exit:   (dir) => ({ x: dir > 0 ? -32 :  32, opacity: 0 }),
};

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [step,      setStep]      = useState(1);
  const [direction, setDirection] = useState(1);
  const [success,   setSuccess]   = useState(false);

  // Field state
  const [email,    setEmail]    = useState('');
  const [code,     setCode]     = useState(Array(CODE_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({});
  const [countdown,    setCountdown]    = useState(RESEND_SECONDS);
  const [resendActive, setResendActive] = useState(false);

  const firstInputRef = useRef(null);

  // Auto-focus first input on step change
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 310);
    return () => clearTimeout(t);
  }, [step]);

  // Resend countdown — starts when step 2 is entered
  useEffect(() => {
    if (step !== 2) return;
    setCountdown(RESEND_SECONDS);
    setResendActive(false);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); setResendActive(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const strength    = getPasswordStrength(password);
  const strengthCfg = STRENGTH_CFG[strength - 1];
  const pwMatch     = Boolean(confirm && password === confirm);
  const pwMismatch  = Boolean(confirm && password !== confirm);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(s) {
    const errs = {};
    if (s === 1) {
      if (!email.trim())
        errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errs.email = 'Enter a valid email address';
    }
    if (s === 2) {
      const full = code.join('');
      if (full.length < CODE_LENGTH)
        errs.code = 'Enter all 6 digits';
      else if (!/^\d{6}$/.test(full))
        errs.code = 'Code must be 6 digits';
    }
    if (s === 3) {
      if (!password)
        errs.password = 'Password is required';
      else if (password.length < 8)
        errs.password = 'At least 8 characters required';
      else if (strength < 2)
        errs.password = 'Password is too weak';
      if (!confirm)
        errs.confirm = 'Please confirm your password';
      else if (pwMismatch)
        errs.confirm = 'Passwords do not match';
    }
    return errs;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function advance() {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step === 3) { setSuccess(true); return; }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function retreat() {
    setErrors({});
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); advance(); }
  }

  function handleResend() {
    setCode(Array(CODE_LENGTH).fill(''));
    setErrors({});
    setCountdown(RESEND_SECONDS);
    setResendActive(false);
    // Restart countdown
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); setResendActive(true); return 0; }
        return c - 1;
      });
    }, 1000);
    setTimeout(() => firstInputRef.current?.focus(), 60);
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel fp-card fp-success"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
          className="success-icon"
        >
          <Check size={30} color="white" strokeWidth={3} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="success-title"
        >
          Password Reset
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="success-subtitle"
        >
          Your password has been updated successfully.
        </motion.p>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary btn-step-cta"
          onClick={onBackToLogin}
          style={{ marginTop: '1.25rem', width: '100%' }}
        >
          Back to Sign In
          <ArrowRight size={16} className="arrow-icon" />
        </motion.button>
      </motion.div>
    );
  }

  // ── Main Card ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel fp-card"
    >
      {/* Progress */}
      <FPProgress step={step} />

      {/* Animated Steps */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.26, ease: [0.32, 0, 0.67, 0] }}
        >
          {step === 1 && (
            <EmailStep
              email={email} setEmail={setEmail}
              errors={errors}
              firstInputRef={firstInputRef}
              onKeyDown={handleKeyDown}
              onNext={advance}
              onBackToLogin={onBackToLogin}
            />
          )}
          {step === 2 && (
            <CodeStep
              email={email}
              code={code} setCode={setCode}
              countdown={countdown} resendActive={resendActive}
              onResend={handleResend}
              errors={errors}
              firstInputRef={firstInputRef}
              onNext={advance}
              onBack={retreat}
            />
          )}
          {step === 3 && (
            <ResetStep
              password={password} setPassword={setPassword}
              confirm={confirm}   setConfirm={setConfirm}
              showPassword={showPassword} setShowPassword={setShowPassword}
              showConfirm={showConfirm}   setShowConfirm={setShowConfirm}
              strength={strength} strengthCfg={strengthCfg}
              pwMatch={pwMatch} pwMismatch={pwMismatch}
              errors={errors}
              firstInputRef={firstInputRef}
              onKeyDown={handleKeyDown}
              onNext={advance}
              onBack={retreat}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ── Progress Indicator ────────────────────────────────────────────────────────

function FPProgress({ step }) {
  return (
    <div
      className="step-progress"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label={`Step ${step} of 3`}
    >
      {STEPS.map((s, i) => {
        const done   = step > s.id;
        const active = step === s.id;
        return (
          <React.Fragment key={s.id}>
            <div className="step-progress-item">
              <motion.div
                className={`step-dot ${done ? 'step-dot--done' : active ? 'step-dot--active' : 'step-dot--idle'}`}
                animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {done
                  ? <Check size={10} strokeWidth={3} />
                  : <span className="step-dot-number">{s.id}</span>
                }
              </motion.div>
              <span className={`step-label ${active ? 'step-label--active' : done ? 'step-label--done' : ''}`}>
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="step-connector">
                <motion.div
                  className="step-connector-fill"
                  initial={false}
                  animate={{ scaleX: step > s.id ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1 — Email ────────────────────────────────────────────────────────────

function EmailStep({ email, setEmail, errors, firstInputRef, onKeyDown, onNext, onBackToLogin }) {
  return (
    <div className="step-inner fp-step-inner">
      <div className="step-header">
        <div className="fp-step-icon fp-step-icon--mail">
          <Mail size={20} color="white" />
        </div>
        <h2 className="step-title">Forgot Password?</h2>
        <p className="step-subtitle">Enter your email and we'll send a recovery code.</p>
      </div>

      <div className="step-fields" onKeyDown={onKeyDown}>
        <div className="form-group">
          <label className="form-label" htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email"
            ref={firstInputRef}
            type="email"
            placeholder="name@example.com"
            className={`input-field input-compact${errors.email ? ' input-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-describedby={errors.email ? 'fp-email-err' : undefined}
          />
          {errors.email && (
            <motion.span
              id="fp-email-err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="field-error"
              role="alert"
            >
              {errors.email}
            </motion.span>
          )}
        </div>
      </div>

      <motion.button
        type="button"
        className="btn btn-primary btn-step-cta"
        onClick={onNext}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        Send Recovery Code
        <ArrowRight size={16} className="arrow-icon" />
      </motion.button>

      <p className="auth-footer" style={{ marginTop: '1.25rem' }}>
        <button type="button" className="fp-back-link btn-text" onClick={onBackToLogin}>
          <ArrowLeft size={13} />
          Back to Sign In
        </button>
      </p>
    </div>
  );
}

// ── Step 2 — OTP Code ─────────────────────────────────────────────────────────

function CodeStep({ email, code, setCode, countdown, resendActive, onResend, errors, firstInputRef, onNext, onBack }) {
  const inputRefs = useRef([]);

  // Sync first ref for auto-focus
  const setFirstRef = useCallback((el) => {
    inputRefs.current[0] = el;
    if (firstInputRef) firstInputRef.current = el;
  }, [firstInputRef]);

  function handleChange(index, raw) {
    const char = raw.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (code[index]) {
        const next = [...code];
        next[index] = '';
        setCode(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...code];
        next[index - 1] = '';
        setCode(next);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)             inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (e.key === 'Enter') { e.preventDefault(); onNext(); }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!text) return;
    const next = [...code];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    const focusIdx = Math.min(text.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1••••$2');

  return (
    <div className="step-inner fp-step-inner">
      <div className="step-header">
        <div className="fp-step-icon fp-step-icon--key">
          <KeyRound size={20} color="white" />
        </div>
        <h2 className="step-title">Check Your Email</h2>
        <p className="step-subtitle">
          We sent a 6-digit code to{' '}
          <span className="fp-email-pill">{maskedEmail}</span>
        </p>
      </div>

      {/* OTP Grid */}
      <div className="otp-grid" onPaste={handlePaste} aria-label="Verification code">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={i === 0 ? setFirstRef : (el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`otp-input${digit ? ' otp-input--filled' : ''}${errors.code ? ' input-error' : ''}`}
            aria-label={`Digit ${i + 1}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {errors.code && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="field-error"
          style={{ textAlign: 'center', marginTop: '-0.25rem' }}
          role="alert"
        >
          {errors.code}
        </motion.span>
      )}

      {/* Resend row */}
      <div className="resend-row">
        {resendActive ? (
          <button type="button" className="resend-btn" onClick={onResend}>
            <RefreshCw size={13} />
            Resend code
          </button>
        ) : (
          <span className="resend-countdown">
            Resend in <strong>{countdown}s</strong>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="step-actions" style={{ marginTop: '0.25rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={15} />
          Back
        </button>
        <motion.button
          type="button"
          className="btn btn-primary btn-step-next"
          onClick={onNext}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Verify Code
          <ArrowRight size={16} className="arrow-icon" />
        </motion.button>
      </div>
    </div>
  );
}

// ── Step 3 — New Password ─────────────────────────────────────────────────────

function ResetStep({
  password, setPassword, confirm, setConfirm,
  showPassword, setShowPassword, showConfirm, setShowConfirm,
  strength, strengthCfg, pwMatch, pwMismatch,
  errors, firstInputRef, onKeyDown, onNext, onBack,
}) {
  return (
    <div className="step-inner fp-step-inner">
      <div className="step-header">
        <div className="fp-step-icon fp-step-icon--lock">
          <Lock size={20} color="white" />
        </div>
        <h2 className="step-title">New Password</h2>
        <p className="step-subtitle">Choose a strong password for your account.</p>
      </div>

      <div className="step-fields" onKeyDown={onKeyDown}>
        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="fp-password">New Password</label>
          <div className="password-wrapper">
            <input
              id="fp-password"
              ref={firstInputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field input-compact input-password${errors.password ? ' input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.password ? 'fp-pwd-err' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="strength-container"
              >
                <div className="strength-bars" role="meter" aria-label="Password strength">
                  {[1, 2, 3, 4].map((level) => (
                    <motion.div
                      key={level}
                      className="strength-segment"
                      animate={{ backgroundColor: strength >= level ? strengthCfg?.color : 'rgba(255,255,255,0.1)' }}
                      transition={{ duration: 0.25 }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthCfg?.color }}>
                  {strengthCfg?.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {errors.password && (
            <motion.span
              id="fp-pwd-err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="field-error"
              role="alert"
            >
              {errors.password}
            </motion.span>
          )}
        </div>

        {/* Confirm */}
        <div className="form-group">
          <label className="form-label" htmlFor="fp-confirm">Confirm Password</label>
          <div className="password-wrapper">
            <input
              id="fp-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field input-compact input-password${errors.confirm ? ' input-error' : ''}${pwMatch ? ' input-success' : ''}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.confirm ? 'fp-conf-err' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <AnimatePresence>
              {pwMatch && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  className="match-icon"
                  aria-label="Passwords match"
                >
                  <Check size={13} color="#22c55e" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {errors.confirm && (
            <motion.span
              id="fp-conf-err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="field-error"
              role="alert"
            >
              {errors.confirm}
            </motion.span>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={15} />
          Back
        </button>
        <motion.button
          type="button"
          className="btn btn-primary btn-step-next"
          onClick={onNext}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Reset Password
          <ArrowRight size={16} className="arrow-icon" />
        </motion.button>
      </div>
    </div>
  );
}
