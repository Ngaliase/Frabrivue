"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Hero.module.css';

export default function Hero() {
  const t = useTranslations('Hero');
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const aiBtnRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    // 1. Staggered text slide sequence
    gsap.fromTo(
      `.${styles.mainText} > *`,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );

    // 2. Cards slide in from left
    gsap.fromTo(
      `.${styles.cards} > div`,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.6 }
    );

    // 3. AI Float Animation
    if (aiBtnRef.current) {
      gsap.fromTo(aiBtnRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.7, delay: 0.8, ease: 'back.out(1.7)' }
      );
      gsap.to(aiBtnRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      });
    }
  }, { scope: containerRef });

  const scrollToGrid = () => {
    const grid = document.getElementById('fabric-grid-section');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSeasonalClick = () => {
    const month = new Date().getMonth() + 1;
    let season = 'winter';
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    
    router.push(`/?season=${season}`);
    setTimeout(scrollToGrid, 100);
  };

  return (
    <section className={styles.hero} ref={containerRef}>
      <video
        className={styles.heroVideo}
        autoPlay
        loop
        muted
        playsInline
        src="/images/background.mp4"
      />
      <div className={styles.overlay}></div>
      <div className={`container ${styles.content}`}>
        <div className={styles.mainText}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
          <button className={styles.shopBtn} onClick={scrollToGrid}>
            {t('shopNow')}
          </button>
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.cards}>
            <div className={styles.card} onClick={handleSeasonalClick}>
              <div className={styles.cardImgPlaceholder1}></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>{t('newArrivals')}</span>
                <button className={styles.cardLink}>&bull; {t('shopNow')}</button>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardImgPlaceholder2}></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>{t('popularStyles')}</span>
                <button className={styles.cardLink} onClick={scrollToGrid}>&bull; {t('shopNow')}</button>
              </div>
            </div>
          </div>
          
          <Link href="/studio" className={styles.aiBtn} ref={aiBtnRef}>
            <span className={styles.aiBtnText}>{t('tryAILbl')}</span>
            <div className={styles.aiIconWrap}>
              <Sparkles size={16} className={styles.aiIcon} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
