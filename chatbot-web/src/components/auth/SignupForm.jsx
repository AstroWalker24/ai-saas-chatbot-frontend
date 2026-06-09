import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Bot, ArrowRight, ArrowLeft, Check } from 'lucide-react';

// ── Utilities ────────────────────────────────────────────────────────────────

function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_CONFIG = [
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f97316' },
  { label: 'Good',   color: '#eab308' },
  { label: 'Strong', color: '#22c55e' },
];

const STEPS = [
  { id: 1, label: 'Account'  },
  { id: 2, label: 'Security' },
  { id: 3, label: 'Finish'   },
];

// Slide direction variants
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center:        ({ x: 0, opacity: 1 }),
  exit:  (dir) => ({ x: dir > 0 ? -36 : 36, opacity: 0 }),
};

// ── Root Component ────────────────────────────────────────────────────────────

export default function SignupForm({ onSwitchToLogin, onNavigate }) {
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);
  const [success, setSuccess]     = useState(false);

  // Form data
  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({});

  const firstInputRef = useRef(null);

  // Auto-focus first input after step transition completes
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [step]);

  const strength    = getPasswordStrength(password);
  const strengthCfg = STRENGTH_CONFIG[strength - 1];
  const pwMatch     = Boolean(confirm && password === confirm);
  const pwMismatch  = Boolean(confirm && password !== confirm);

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(s) {
    const errs = {};
    if (s === 1) {
      if (!name.trim())                                   errs.name  = 'Name is required';
      else if (name.trim().length < 2)                   errs.name  = 'At least 2 characters required';
      if (!email.trim())                                  errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    }
    if (s === 2) {
      if (!password)             errs.password = 'Password is required';
      else if (password.length < 8) errs.password = 'At least 8 characters required';
      else if (strength < 2)    errs.password = 'Password is too weak';
      if (!confirm)              errs.confirm  = 'Please confirm your password';
      else if (pwMismatch)       errs.confirm  = 'Passwords do not match';
    }
    if (s === 3) {
      if (!termsAccepted) errs.terms = 'You must accept the terms to continue';
    }
    return errs;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function advance() {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step === 3) { setSuccess(true); setTimeout(() => onNavigate?.('chat'), 1800); return; }
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

  // ── Success State ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel signup-card signup-success"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
          className="success-icon"
        >
          <Check size={30} color="white" strokeWidth={3} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="success-title"
        >
          Account Created
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="success-subtitle"
        >
          Welcome to Nexus AI.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="success-redirect"
        >
          Redirecting…
        </motion.p>
      </motion.div>
    );
  }

  // ── Main Card ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel signup-card"
    >
      {/* Progress Indicator */}
      <StepProgress step={step} />

      {/* Animated Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.27, ease: [0.32, 0, 0.67, 0] }}
          className="step-content"
        >
          {step === 1 && (
            <Step1
              name={name}   setName={setName}
              email={email} setEmail={setEmail}
              errors={errors}
              firstInputRef={firstInputRef}
              onKeyDown={handleKeyDown}
              onNext={advance}
              onSwitchToLogin={onSwitchToLogin}
            />
          )}
          {step === 2 && (
            <Step2
              password={password}   setPassword={setPassword}
              confirm={confirm}     setConfirm={setConfirm}
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
          {step === 3 && (
            <Step3
              name={name} email={email}
              termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted}
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

function StepProgress({ step }) {
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

// ── Step 1 — Account ──────────────────────────────────────────────────────────

function Step1({ name, setName, email, setEmail, errors, firstInputRef, onKeyDown, onNext, onSwitchToLogin }) {
  return (
    <div className="step-inner">
      <div className="step-header">
        <div className="auth-bot-icon step-bot-icon">
          <Bot size={22} className="icon-violet" />
        </div>
        <h2 className="step-title">Create Your Account</h2>
        <p className="step-subtitle">Let's get you started.</p>
      </div>

      <div className="step-fields" onKeyDown={onKeyDown}>
        <div className="form-group">
          <label className="form-label" htmlFor="s1-name">Full Name</label>
          <input
            id="s1-name"
            ref={firstInputRef}
            type="text"
            placeholder="John Doe"
            className={`input-field input-compact${errors.name ? ' input-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-describedby={errors.name ? 's1-name-err' : undefined}
          />
          {errors.name && (
            <motion.span
              id="s1-name-err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="field-error"
              role="alert"
            >
              {errors.name}
            </motion.span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="s1-email">Email Address</label>
          <input
            id="s1-email"
            type="email"
            placeholder="name@example.com"
            className={`input-field input-compact${errors.email ? ' input-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-describedby={errors.email ? 's1-email-err' : undefined}
          />
          {errors.email && (
            <motion.span
              id="s1-email-err"
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
        Continue
        <ArrowRight size={16} className="arrow-icon" />
      </motion.button>

      <p className="auth-footer">
        Already have an account?{' '}
        <button type="button" className="signup-link btn-text" onClick={onSwitchToLogin}>
          Sign In
        </button>
      </p>
    </div>
  );
}

// ── Step 2 — Security ─────────────────────────────────────────────────────────

function Step2({
  password, setPassword, confirm, setConfirm,
  showPassword, setShowPassword, showConfirm, setShowConfirm,
  strength, strengthCfg, pwMatch, pwMismatch,
  errors, firstInputRef, onKeyDown, onNext, onBack,
}) {
  return (
    <div className="step-inner">
      <div className="step-header">
        <h2 className="step-title">Secure Your Account</h2>
        <p className="step-subtitle">Choose a strong password.</p>
      </div>

      <div className="step-fields" onKeyDown={onKeyDown}>
        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="s2-password">Password</label>
          <div className="password-wrapper">
            <input
              id="s2-password"
              ref={firstInputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field input-compact input-password${errors.password ? ' input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.password ? 's2-pwd-err' : undefined}
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
              id="s2-pwd-err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="field-error"
              role="alert"
            >
              {errors.password}
            </motion.span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="s2-confirm">Confirm Password</label>
          <div className="password-wrapper">
            <input
              id="s2-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field input-compact input-password${errors.confirm ? ' input-error' : ''}${pwMatch ? ' input-success' : ''}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.confirm ? 's2-conf-err' : undefined}
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
              id="s2-conf-err"
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
          Continue
          <ArrowRight size={16} className="arrow-icon" />
        </motion.button>
      </div>
    </div>
  );
}

// ── Step 3 — Review & Finish ──────────────────────────────────────────────────

function Step3({ name, email, termsAccepted, setTermsAccepted, errors, firstInputRef, onKeyDown, onNext, onBack }) {
  return (
    <div className="step-inner">
      <div className="step-header">
        <h2 className="step-title">Almost Done</h2>
        <p className="step-subtitle">Review and create your account.</p>
      </div>

      {/* Summary */}
      <div className="account-summary">
        <div className="summary-row">
          <span className="summary-key">Name</span>
          <span className="summary-val">{name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Email</span>
          <span className="summary-val">{email}</span>
        </div>
      </div>

      {/* Terms */}
      <label className="terms-row" onKeyDown={onKeyDown}>
        <input
          ref={firstInputRef}
          type="checkbox"
          className="terms-checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          aria-describedby={errors.terms ? 's3-terms-err' : undefined}
        />
        <span className="terms-text">
          I agree to the{' '}
          <a href="#" className="terms-link" onClick={(e) => e.stopPropagation()}>
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="terms-link" onClick={(e) => e.stopPropagation()}>
            Privacy Policy
          </a>
        </span>
      </label>

      {errors.terms && (
        <motion.span
          id="s3-terms-err"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="field-error"
          role="alert"
        >
          {errors.terms}
        </motion.span>
      )}

      {/* Create Account */}
      <motion.button
        type="button"
        className="btn btn-primary btn-step-cta"
        onClick={onNext}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        style={{ marginTop: '0.875rem' }}
      >
        Create Account
        <ArrowRight size={16} className="arrow-icon" />
      </motion.button>

      {/* Social */}
      <div className="divider" style={{ margin: '1.25rem 0 1rem' }}>
        <div className="divider-line" />
        <span className="divider-text">OR</span>
        <div className="divider-line" />
      </div>

      <div className="social-logins">
        <motion.button className="btn btn-social" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </motion.button>
        <motion.button className="btn btn-social" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </motion.button>
      </div>

      <div className="step3-footer">
        <button type="button" className="btn-text step3-back" onClick={onBack}>
          <ArrowLeft size={13} />
          Back
        </button>
      </div>
    </div>
  );
}
