"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookMarked, ArrowLeft, Trash2, LogIn, Scissors, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import { useTranslations, useLocale } from 'next-intl';
import { MoodItem } from '@/types/fabric';
import { getLocaleValue } from '@/utils/fabric-utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// interface Fabric {
//   id: number;
//   name: string;
//   type: string | null;
//   meta_description: string | null;
//   tags: string[] | null;
// }
// interface MoodItem {
//   id: number;
//   fabric: Fabric;
//   note: string | null;
//   added_at: string;
// }

export default function MoodboardPage() {
  const t = useTranslations('MoodboardPage');
  const locale = useLocale();
  const [items, setItems] = useState<MoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('fabrivo_token');
    if (!token) { setLoading(false); return; }
    setAuthed(true);
    fetch(`${API_BASE}/api/v1/moodboards/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useGSAP(() => {
    if (!loading && items.length > 0 && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
    
    if (!loading && !authed) {
      gsap.fromTo(`.${styles.emptyState} > *`,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [loading, items, authed] });

  const remove = async (id: number) => {
    const token = localStorage.getItem('fabrivo_token');
    setItems(prev => prev.filter(i => i.id !== id));
    console.log('Remove moodboard item', id, token);
  };

  return (
    <div className={styles.page} ref={containerRef}>
      {/* Header */}
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> {t('home')}
          </Link>
          <div className={styles.pageTitle}>
            <BookMarked size={20} strokeWidth={1.8} />
            <h1>{t('myCollection')}</h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Not logged in */}
        {!authed && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <BookMarked size={48} strokeWidth={1.2} className={styles.emptyIcon} />
            </div>
            <h2>{t('notLoggedIn')}</h2>
            <p>{t('loginMessage')}</p>
            <Link href="/auth" className={styles.authLink}>
              <LogIn size={16} /> {t('loginNow')}
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {/* Logged in – empty */}
        {authed && !loading && items.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <BookMarked size={48} strokeWidth={1.2} className={styles.emptyIcon} />
            </div>
            <h2>{t('emptyCollection')}</h2>
            <p>{t('exploreMessage')}</p>
            <Link href="/" className={styles.authLink}>
              <Scissors size={16} /> {t('exploreFabrics')}
            </Link>
          </div>
        )}

        {/* Grid */}
        {authed && !loading && items.length > 0 && (
          <div className={styles.grid} ref={gridRef}>
            {items.map((item) => (
              <div
                key={item.id}
                className={styles.card}
              >
                <div className={styles.cardThumb}>
                  <Scissors size={24} strokeWidth={1.4} className={styles.thumbIcon} />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{getLocaleValue(item.fabric.name, locale)}</h3>
                  <p className={styles.cardType}>{item.fabric.type === 'fiber' ? t('fiber') : t('fabricType')}</p>
                  {item.fabric.tags && (
                    <div className={styles.tags}>
                      {item.fabric.tags.slice(0, 2).map(t => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  )}
                  {item.note && <p className={styles.note}>📝 {item.note}</p>}
                  <p className={styles.date}>
                    {t('added')} {new Date(item.added_at).toLocaleDateString('vi-VN')}
                  </p>
                  <div className={styles.cardActions}>
                    <Link href={`/fabrics/${item.fabric.id}`} className={styles.viewBtn}>
                      <ExternalLink size={13} /> {t('viewDetails')}
                    </Link>
                    <button className={styles.removeBtn} onClick={() => remove(item.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
