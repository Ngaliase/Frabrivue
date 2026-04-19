"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookMarked, Scissors, Info, Sparkles, Droplets } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import { useTranslations } from 'next-intl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FabricDetail {
  id: number;
  type: string | null;
  name: string;
  image_url: string | null;
  meta_description: string | null;
  about_text: string | null;
  tags: string[] | null;
  categories: string[] | null;
  age_groups: string[] | null;
  style_concepts: string[] | null;
  seasons: string[] | null;
  properties: Record<string, string> | null;
  care_instructions: string | null;
  additional_info: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  hang_ngay: 'Hàng ngày',
  cong_so: 'Công sở',
  di_hoc: 'Đi học',
  the_thao: 'Thể thao',
  su_kien: 'Sự kiện',
  da_tiec: 'Dạ tiệc',
  dam_cuoi: 'Đám cưới',
};

const CONCEPT_LABELS: Record<string, string> = {
  casual: 'Casual',
  formal: 'Formal',
  smart_casual: 'Smart Casual',
  sporty: 'Sporty',
  elegant: 'Elegant',
  bohemian: 'Bohemian',
  streetwear: 'Streetwear',
};

export default function FabricDetailPage() {
  const t = useTranslations('FabricDetailPage');
  const { id } = useParams();
  const router = useRouter();

  const [fabric, setFabric] = useState<FabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/fabrics/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(t('fabricNotFound'));
        return res.json();
      })
      .then(data => setFabric(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, t]);

  useGSAP(() => {
    if (!loading && fabric && containerRef.current) {
      gsap.fromTo(`.${styles.graphicCard}`, 
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(`.${styles.contentArea} > *`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, { scope: containerRef, dependencies: [loading, fabric] });

  const handleSaveToMoodboard = async () => {
    const token = localStorage.getItem('fabrivo_token');
    if (!token) {
      alert(t('loginPrompt'));
      router.push('/auth');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moodboards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fabric_id: Number(id) })
      });
      if (!res.ok) throw new Error(t('saveError'));
      alert(t('saveSuccess'));
    } catch {
      alert(t('saveDuplicate'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <Scissors size={32} className={styles.spinner} />
          <p>{t('loadingFabric')}</p>
        </div>
      </div>
    );
  }

  if (error || !fabric) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <p>{error}</p>
          <Link href="/" className={styles.backBtn}>{t('backHome')}</Link>
        </div>
      </div>
    );
  }

  const propEntries = fabric.properties ? Object.entries(fabric.properties) : [];

  return (
    <div className={styles.page} ref={containerRef}>
      {/* Sticky Header */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> {t('back')}
          </button>

          <button
            className={styles.saveBtn}
            onClick={handleSaveToMoodboard}
            disabled={saving}
          >
            <BookMarked size={15} />
            {saving ? t('saving') : t('saveCollection')}
          </button>
        </div>
      </div>

      <div className={`container ${styles.layoutGrid}`}>
        {/* Left Side: Graphic / Thumbnail */}
        <div className={styles.graphicCard}>
          <div className={styles.graphicBox}>
            {fabric.image_url ? (
               <img src={fabric.image_url} alt={fabric.name} className={styles.fabricImg} />
            ) : (
              <>
                <div className={styles.graphicPattern} />
                <Scissors size={80} strokeWidth={1} className={styles.graphicIcon} />
              </>
            )}
          </div>
          <div className={styles.graphicMeta}>
            <span className={styles.graphicType}>
              {fabric.type === 'fiber' ? t('naturalFiber') : t('fabricType')}
            </span>
            <span className={styles.graphicId}>{t('idLabel')}{fabric.id}</span>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className={styles.contentArea}>
          <div>
            <h1 className={styles.fabricName}>{fabric.name}</h1>
            
            {/* New Badges Section */}
            {(fabric.categories || fabric.style_concepts) && (
              <div className={styles.badgeRow}>
                {fabric.categories?.map(cat => (
                  <span key={cat} className={styles.catBadge}>
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                ))}
                {fabric.style_concepts?.map(concept => (
                  <span key={concept} className={styles.conceptBadge}>
                    {CONCEPT_LABELS[concept] || concept}
                  </span>
                ))}
              </div>
            )}

            {fabric.tags && fabric.tags.length > 0 && (
              <div className={styles.tags}>
                {fabric.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {(fabric.meta_description || fabric.about_text) && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Info size={18} /> {t('inDepthExplanation')}
              </h2>
              <p className={styles.descText}>
                {fabric.about_text || fabric.meta_description}
              </p>
            </div>
          )}

          {propEntries.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Sparkles size={18} /> {t('fabricProperties')}
              </h2>
              <div className={styles.propGrid}>
                {propEntries.map(([key, val]) => (
                  <div key={key} className={styles.propItem}>
                    <span className={styles.propLabel}>{key.replace(/_/g, ' ')}</span>
                    <span className={styles.propValue}>{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fabric.care_instructions && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Droplets size={18} /> {t('careInstructions')}
              </h2>
              <div className={styles.careBox}>
                {fabric.care_instructions}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
