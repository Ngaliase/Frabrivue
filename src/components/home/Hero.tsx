"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Hero.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HeroImage {
  id: number;
  image_url: string | null;
  name: string;
}

export default function Hero() {
  const t = useTranslations('Hero');
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [imgLoading, setImgLoading] = useState(true);

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

    // 3. AI Float Animation removed as per user request to integrate into main button
  }, { scope: containerRef });

  // Fetch hero images from API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/fabrics/?limit=20`);
        if (res.ok) {
          const data: HeroImage[] = await res.json();
          const imagesWithUrl = data.filter(f => f.image_url);
          setHeroImages(imagesWithUrl);
        }
      } catch {
        // silently fail - keep placeholder colors
      } finally {
        setImgLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  const scrollToGrid = () => {
    const grid = document.getElementById('fabric-grid-section');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePopularStylesClick = () => {
    router.push('/?trending=true');
    setTimeout(scrollToGrid, 100);
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
          <Link href="/studio" className={styles.shopBtn}>
            <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {t('tryAILbl')}
          </Link>
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.cards}>
            <div className={styles.card} onClick={handleSeasonalClick}>
              {heroImages[0]?.image_url ? (
                <img
                  src={heroImages[0].image_url}
                  alt={t('newArrivals')}
                  className={styles.cardImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.cardImgPlaceholder1}></div>
              )}
              <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>{t('newArrivals')}</span>
                <button className={styles.cardLink} onClick={scrollToGrid}>&bull; {t('shopNow')}</button>
              </div>
            </div>
            <div className={styles.card} onClick={handlePopularStylesClick}>
              {heroImages[1]?.image_url ? (
                <img
                  src={heroImages[1].image_url}
                  alt={t('popularStyles')}
                  className={styles.cardImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.cardImgPlaceholder2}></div>
              )}
              <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>{t('popularStyles')}</span>
                <button className={styles.cardLink} onClick={handlePopularStylesClick}>&bull; {t('shopNow')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
