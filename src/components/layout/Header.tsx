"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Globe, Sparkles, BookMarked, LogIn, User, LogOut } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Header.module.css';

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fabrivo_token');
    setIsLoggedIn(false);
  };

  const changeLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : ''}`} ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Fabri<span>vo</span>
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
        <div className={`${styles.searchWrap} ${isSearchOpen ? styles.searchOpen : ''}`}>
          <button 
            className={styles.searchToggle} 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title={t('searchPlaceholder')}
          >
            <Search size={18} />
          </button>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus={isSearchOpen}
            />
          </div>
        </div>

        {/* Nav actions */}
        <div className={styles.navActions}>
          <Link href="/moodboard" className={styles.iconNavBtn} title={t('moodboardTitle')}>
            <BookMarked size={18} />
          </Link>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <Link href="/moodboard" className={styles.iconNavBtn} title={t('account')}>
                <User size={18} />
              </Link>
              <button onClick={handleLogout} className={styles.iconNavBtn} title={t('logout')}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth" className={styles.iconNavBtn} title={t('login')}>
              <LogIn size={18} />
            </Link>
          )}

          <Link href="/quiz" className={styles.iconNavBtn} title={t('quiz')}>
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
