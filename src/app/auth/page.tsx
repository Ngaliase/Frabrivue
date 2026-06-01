"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });

  useGSAP(() => {
    gsap.fromTo(`.${styles.formCard}`,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
    );
  }, { scope: containerRef });

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
        localStorage.setItem('Fabrivue_token', data.access_token);
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
    <div className={styles.page} ref={containerRef}>
      <video
        className={styles.bgVideo}
        autoPlay
        loop
        muted
        playsInline
        src="/images/background.mp4"
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> {t('backHome')}
        </Link>
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
