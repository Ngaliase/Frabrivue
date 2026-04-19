"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Scissors } from 'lucide-react';
import styles from './page.module.css';
import { useTranslations } from 'next-intl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const t = useTranslations('AuthPage');
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ email: '', password: '', full_name: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await fetch(`${API_BASE}/api/v1/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail ?? t('registrationFailed'));
        setSuccess(t('registrationSuccess'));
        setMode('login');
      } else {
        const body = new URLSearchParams({ username: form.email, password: form.password });
        const res = await fetch(`${API_BASE}/api/v1/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail ?? t('loginFailed'));
        localStorage.setItem('fabrivo_token', data.access_token);
        setSuccess(t('loginSuccess'));
        setTimeout(() => { window.location.href = '/'; }, 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.leftPanel}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> {t('backHome')}
        </Link>
        <div className={styles.brandArea}>
          <div className={styles.brandLogo}>
            <Scissors size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.brandName}>Fabri<span>vo</span></h1>
          <p className={styles.brandTagline}>{t('brandTagline')}</p>
        </div>
        <div className={styles.decorGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.decorCell} />
          ))}
        </div>
      </div>

      {/* Right panel – Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          {/* Tab switcher */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${mode === 'login' ? styles.modeActive : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >
              <LogIn size={15} /> {t('loginTab')}
            </button>
            <button
              className={`${styles.modeTab} ${mode === 'register' ? styles.modeActive : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            >
              <UserPlus size={15} /> {t('registerTab')}
            </button>
          </div>

          <h2 className={styles.formTitle}>
            {mode === 'login' ? t('loginTitle') : t('registerTitle')}
          </h2>
          <p className={styles.formSub}>
            {mode === 'login'
              ? t('loginSubtitle')
              : t('registerSubtitle')}
          </p>

          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <form onSubmit={submit} className={styles.form}>
            {mode === 'register' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('fullNameLabel')}</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder={t('fullNamePlaceholder')}
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('emailLabel')}</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('passwordLabel')}</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.btnSpinner} />
              ) : (
                <>{mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === 'login' ? t('loginButton') : t('registerButton')}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
