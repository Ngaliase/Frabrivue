'use client';

import React, { useEffect, useRef } from 'react';
import styles from './page.module.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslations } from 'next-intl';
import { Cpu, BookOpen, Leaf, Sparkles, Target, Eye } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const features = [
    {
      icon: <Cpu size={28} />,
      titleKey: 'feature1Title' as const,
      descKey: 'feature1Desc' as const,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <BookOpen size={28} />,
      titleKey: 'feature2Title' as const,
      descKey: 'feature2Desc' as const,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <Leaf size={28} />,
      titleKey: 'feature3Title' as const,
      descKey: 'feature3Desc' as const,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <Sparkles size={28} />,
      titleKey: 'feature4Title' as const,
      descKey: 'feature4Desc' as const,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <>
      <Header transparent={true} />
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero}>
          <video
            className={styles.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            src="/images/background.mp4"
          />
          <div className={styles.overlay}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('pageTitle')}</h1>
            <p className={styles.heroSubtitle}>{t('pageSubtitle')}</p>
            <div className={styles.heroLine} />
          </div>
        </section>

        <div className={styles.container}>

          {/* About Section */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp}`}>
            <div className={styles.sectionLabel}>01</div>
            <h2 className={styles.sectionTitle}>{t('aboutTitle')}</h2>
            <div className={styles.textBlock}>
              <p>{t('aboutP1')}</p>
              <p>{t('aboutP2')}</p>
            </div>
          </div>

          {/* Mission */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp} ${styles.missionSection}`}>
            <div className={styles.sectionLabel}>02</div>
            <div className={styles.sectionInner}>
              <div className={styles.sectionLeft}>
                <Target className={styles.sectionIcon} size={40} />
                <h2 className={styles.sectionTitle}>{t('missionTitle')}</h2>
                <p>{t('missionP1')}</p>
                <p className={styles.striveLabel}>{t('missionStrive')}</p>
              </div>
              <div className={styles.sectionRight}>
                <ul className={styles.missionList}>
                  {(['missionItem1', 'missionItem2', 'missionItem3', 'missionItem4'] as const).map((key, i) => (
                    <li key={key} className={styles.missionItem}>
                      <span className={styles.missionNum}>{String(i + 1).padStart(2, '0')}</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Why FABRIVUE */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp}`}>
            <div className={styles.sectionLabel}>03</div>
            <h2 className={styles.sectionTitle}>{t('whyTitle')}</h2>
            <div className={styles.whyGrid}>
              <div className={styles.whyCard}>
                <p>{t('whyP1')}</p>
              </div>
              <div className={styles.whyCard}>
                <p>{t('whyP2')}</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp}`}>
            <div className={styles.sectionLabel}>04</div>
            <h2 className={styles.sectionTitle}>{t('featuresTitle')}</h2>
            <div className={styles.featuresGrid}>
              {features.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIconWrap} style={{ background: f.gradient }}>
                    {f.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{t(f.titleKey)}</h3>
                  <p className={styles.featureDesc}>{t(f.descKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp}`}>
            <div className={styles.visionCard}>
              <Eye className={styles.visionIcon} size={44} />
              <div className={styles.visionSectionLabel}>05</div>
              <h2 className={styles.sectionTitle}>{t('visionTitle')}</h2>
              <p className={styles.visionText}>{t('visionP1')}</p>
            </div>
          </div>

          {/* Contact */}
          <div ref={addToRefs} className={`${styles.section} ${styles.fadeUp}`}>
            <div className={styles.contactCard}>
              <svg
                className={styles.contactIcon}
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <div className={styles.contactSectionLabel}>06</div>
              <h2 className={styles.sectionTitle}>{t('contactTitle')}</h2>
              <p className={styles.contactText}>{t('contactP1')}</p>
              <a
                href="https://www.facebook.com/profile.php?id=61590448468345"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactBtn}
              >
                {t('contactButton')}
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}