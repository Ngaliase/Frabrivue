"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Globe, Sparkles, BookMarked, LogIn, Sun } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const [search, setSearch] = useState('');

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Fabri<span>vo</span>
        </Link>

        {/* Language Toggle */}
        <div className={styles.langSwitch}>
          <Globe size={13} className={styles.globeIcon} />
          <button
            className={lang === 'VI' ? styles.langActive : styles.langBtn}
            onClick={() => setLang('VI')}
          >VI</button>
          <span className={styles.langDivider}>|</span>
          <button
            className={lang === 'EN' ? styles.langActive : styles.langBtn}
            onClick={() => setLang('EN')}
          >EN</button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tra cứu >300 loại vải"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Nav actions */}
        <div className={styles.navActions}>
          <Link href="/moodboard" className={styles.iconNavBtn} title="Bộ sưu tập">
            <BookMarked size={18} />
          </Link>
          <Link href="/auth" className={styles.iconNavBtn} title="Đăng nhập">
            <LogIn size={18} />
          </Link>
          <Link href="/quiz" className={styles.quizBtn}>
            <Sparkles size={15} />
            Quiz Cá Nhân
          </Link>
        </div>
      </div>
    </header>
  );
}
