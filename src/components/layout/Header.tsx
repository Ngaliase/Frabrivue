"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Globe, Sparkles, BookMarked, LogIn, User, LogOut, X, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Header.module.css';

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(!!searchParams.get('q'));
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useGSAP(() => {
    if (transparent && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, { scope: headerRef, dependencies: [transparent] });

  useEffect(() => {
    const token = localStorage.getItem('fabrivo_token');
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = () => {
    localStorage.removeItem('fabrivo_token');
    setIsLoggedIn(false);
  };

  const changeLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/');
    }
    setIsSearchOpen(false);
  };

  const handleClear = () => {
    setSearch('');
    router.push('/');
  };

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : ''}`} ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Frabrivue Logo" className={styles.logoIcon} />
          Frabrivue
        </Link>

        {/* Language Toggle */}
        <div className={styles.langSwitch}>
          <Globe size={13} className={styles.globeIcon} />
          <button
            className={locale === 'vi' ? styles.langActive : styles.langBtn}
            onClick={() => changeLocale('vi')}
          >VI</button>
          <span className={styles.langDivider}>|</span>
          <button
            className={locale === 'en' ? styles.langActive : styles.langBtn}
            onClick={() => changeLocale('en')}
          >EN</button>
        </div>

        {/* Search */}
        <form
          className={`${styles.searchWrap} ${isSearchOpen ? styles.searchOpen : ''}`}
          onSubmit={handleSearch}
        >
          <button
            type="button"
            className={styles.searchToggle}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title={t('searchPlaceholder')}
          >
            <Search size={18} />
          </button>
          <div className={styles.searchInputContainer}>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setIsSearchOpen(false)}
            />
            {search && (
              <button type="button" className={styles.searchClear} onClick={handleClear}>
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Nav actions */}
        <div className={styles.navActions}>
          <Link href="/moodboard" className={styles.textNavBtn}>
            {t('moodboardTitle')}
          </Link>

          <Link href="/feed" className={styles.textNavBtn}>
            {t('feedTitle')}
          </Link>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <Link href="/moodboard" className={styles.textNavBtn}>
                {t('account')}
              </Link>
              <button onClick={handleLogout} className={styles.textNavBtn}>
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link href="/auth" className={styles.textNavBtn}>
              {t('login')}
            </Link>
          )}

          <Link href="/quiz" className={styles.textNavBtn}>
            {t('quiz')}
          </Link>
        </div>
      </div>
    </header>
  );
}
