"use client";

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <Link href="/" className={styles.logo}>
          FABNIVO
        </Link>
        
        {/* Desktop Nav */}
        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
          <a href="#features" className={styles.navLink} onClick={() => setIsOpen(false)}>Tính Năng Băng AI</a>
          <a href="#stylist" className={styles.navLink} onClick={() => setIsOpen(false)}>AI Stylist</a>
          <a href="#calculator" className={styles.navLink} onClick={() => setIsOpen(false)}>Đo Lượng Vải</a>
          <a href="#eco" className={styles.navLink} onClick={() => setIsOpen(false)}>Eco-Score</a>
        </nav>

        <div className={styles.actions}>
          <button className={styles.langBtn}>VN / EN</button>
          {/* Hamburger for mobile */}
          <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
