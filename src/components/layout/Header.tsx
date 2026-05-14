"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Globe, Sparkles, BookMarked, LogIn, User, LogOut, X, MessageCircle, Menu, Info } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const token = localStorage.getItem('Frabrivue_token');
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = () => {
    localStorage.removeItem('Frabrivue_token');
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
        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Left Side */}
        <div className={styles.headerLeft}>
          <div className={styles.navLinksLeft}>
            <Link href="/moodboard" className={styles.textNavBtn}>
              <BookMarked size={16} className={styles.navIcon} />
              {t('moodboardTitle')}
            </Link>
            <Link href="/quiz" className={styles.textNavBtn}>
              <Sparkles size={16} className={styles.navIcon} />
              {t('quiz')}
            </Link>
            <Link href="/feed" className={styles.textNavBtn}>
              <MessageCircle size={16} className={styles.navIcon} />
              {t('feedTitle')}
            </Link>
          </div>

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
        </div>

        {/* Center Logo */}
        <div className={styles.headerCenter}>
          <Link href="/" className={styles.logo}>
            <img src="/logo1.png" alt="Frabrivue Logo" className={styles.logoIcon} />
          </Link>
        </div>

        {/* Right Side */}
        <div className={styles.headerRight}>
          <div className={styles.navActions}>
            <Link href="/about" className={styles.textNavBtn}>
              {t('aboutTitle')}
            </Link>

            {isLoggedIn ? (
              <div className={styles.userMenu}>
                <Link href="/moodboard" className={styles.textNavBtn}>
                  <User size={16} className={styles.navIcon} />
                  {t('account')}
                </Link>
                <button onClick={handleLogout} className={styles.textNavBtn}>
                  <LogOut size={16} className={styles.navIcon} />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link href="/auth" className={styles.textNavBtn}>
                <LogIn size={16} className={styles.navIcon} />
                {t('login')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay & Drawer */}
        <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`${styles.mobileMenuDrawer} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
            <Link href="/" className={styles.logo} onClick={() => setIsMobileMenuOpen(false)}>
              <img src="/logo1.png" alt="Logo" className={styles.logoIcon} />
            </Link>
            <button className={styles.mobileMenuClose} onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className={styles.mobileNav}>
            <Link href="/moodboard" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
              <BookMarked size={20} />
              {t('moodboardTitle')}
            </Link>
            <Link href="/quiz" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
              <Sparkles size={20} />
              {t('quiz')}
            </Link>
            <Link href="/feed" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
              <MessageCircle size={20} />
              {t('feedTitle')}
            </Link>
            <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
              <Info size={20} />
              {t('aboutTitle')}
            </Link>
          </nav>

          <div className={styles.mobileMenuFooter}>
            <div className={styles.langSwitchMobile}>
              <Globe size={16} />
              <button
                className={locale === 'vi' ? styles.langActive : styles.langBtn}
                onClick={() => changeLocale('vi')}
              >VI</button>
              <button
                className={locale === 'en' ? styles.langActive : styles.langBtn}
                onClick={() => changeLocale('en')}
              >EN</button>
            </div>

            {isLoggedIn ? (
              <div className={styles.mobileAuth}>
                <Link href="/moodboard" className={styles.mobileAuthBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={18} />
                  {t('account')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={styles.mobileAuthBtn}
                >
                  <LogOut size={18} />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link href="/auth" className={styles.mobileAuthBtn} onClick={() => setIsMobileMenuOpen(false)}>
                <LogIn size={18} />
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
