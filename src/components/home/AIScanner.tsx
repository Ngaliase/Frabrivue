"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Leaf, Loader2, Snowflake, Flame, Sun, Wind, Scan, AlertCircle, FileText, Shirt, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './AIScanner.module.css';

interface AIResult {
  fabric: string;
  accuracy: number;
  ecoFriendly: boolean;
  traits: string[];
  care: string[];
  durability?: number;
  breathability?: number;
  comfort?: number;
}

const SEASONS = [
  { key: 'spring', Icon: Wind },
  { key: 'summer', Icon: Sun },
  { key: 'autumn', Icon: Flame },
  { key: 'winter', Icon: Snowflake },
];

const MODEL_URLS: Record<string, string> = {
  spring: 'https://res.cloudinary.com/di39ls7dp/image/upload/v1778779561/fabrivo_models/spring.jpg',
  summer: 'https://res.cloudinary.com/di39ls7dp/image/upload/v1778779562/fabrivo_models/summer.jpg',
  autumn: 'https://res.cloudinary.com/di39ls7dp/image/upload/v1778779562/fabrivo_models/autumn.jpg',
  winter: 'https://res.cloudinary.com/di39ls7dp/image/upload/v1778779563/fabrivo_models/winter.jpg',
};

export default function AIScanner() {
  const t = useTranslations('AIScanner');
  const locale = useLocale();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState('autumn');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      [`.${styles.zoneLeft}`, `.${styles.zoneCenter}`, `.${styles.zoneRight}`],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );
  }, { scope: sectionRef });

  useGSAP(() => {
    if (result) {
      gsap.fromTo(
        `.${styles.resultContent} > div`,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, { dependencies: [result], scope: sectionRef });

  const confidenceToAccuracy = (confidence: string): number => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 92;
      case 'medium': return 70;
      case 'low': return 45;
      default: return 60;
    }
  };

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Bước 1: POST → nhận task_id ngay lập tức (<1s)
      const startRes = await fetch(`${apiUrl}/api/v1/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Lỗi máy chủ (${startRes.status})`);
      }

      const startData = await startRes.json();
      const { task_id, status: initialStatus } = startData;

      // Nếu từ cache thì status đã completed luôn
      if (initialStatus === 'completed') {
        const statusRes = await fetch(`${apiUrl}/api/v1/predict/status/${task_id}`);
        const statusData = await statusRes.json();
        applyResult(statusData);
        return;
      }

      // Bước 2: Poll mỗi 3 giây cho đến khi AI xong (tối đa 300s = 5 phút)
      const maxAttempts = 100;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 3000));

        const statusRes = await fetch(`${apiUrl}/api/v1/predict/status/${task_id}`);
        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();

        if (statusData.status === 'completed') {
          applyResult(statusData);
          return;
        }
        if (statusData.status === 'failed') {
          throw new Error(statusData.error_message || 'AI không thể nhận diện vải');
        }
        // still pending — keep polling
      }

      throw new Error('Quá thời gian chờ phản hồi từ AI. Vui lòng thử lại.');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTryOn = async () => {
    if (!uploadedImageUrl) return;
    
    setTryOnLoading(true);
    setTryOnResult(null);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const personImageUrl = MODEL_URLS[activeSeason];

      // 1. Start Task
      const startRes = await fetch(`${apiUrl}/api/v1/try-on/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clothing_image_url: uploadedImageUrl,
          person_image_url: personImageUrl,
        }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Lỗi máy chủ (${startRes.status})`);
      }

      const { task_id, status: initialStatus } = await startRes.json();
      
      if (initialStatus === 'completed') {
        // Cache hit case
        const statusRes = await fetch(`${apiUrl}/api/v1/try-on/status/${task_id}`);
        const statusData = await statusRes.json();
        setTryOnResult(statusData.result_image_url);
        setTryOnLoading(false);
        return;
      }

      // 2. Poll Status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiUrl}/api/v1/try-on/status/${task_id}`);
          if (!statusRes.ok) return;
          
          const statusData = await statusRes.json();
          if (statusData.status === 'completed') {
            setTryOnResult(statusData.result_image_url);
            setTryOnLoading(false);
            clearInterval(pollInterval);
          } else if (statusData.status === 'failed') {
            setError(statusData.error_message || 'AI gặp lỗi khi xử lý');
            setTryOnLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);

      // Cleanup interval after 2 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (tryOnLoading) {
          setTryOnLoading(false);
          setError('Hết thời gian chờ xử lý AI');
        }
      }, 120000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể thực hiện Try-On';
      setError(errorMessage);
      setTryOnLoading(false);
    }
  };

  const applyResult = (statusData: { 
    image_url?: string; 
    fabric?: { 
      name?: { vi?: string; en?: string }; 
      tags?: string[]; 
      care_instructions?: Record<string, string> 
    }; 
    confidence_score?: string;
    durability?: number;
    breathability?: number;
    comfort?: number;
    predicted_label?: string;
  }) => {
    if (statusData.image_url) {
      setUploadedImageUrl(statusData.image_url);
    }
    const fabric = statusData.fabric;
    const isVi = locale === 'vi';

    // Get localized fabric name
    let fabricName = isVi
      ? (fabric?.name?.vi || fabric?.name?.en)
      : (fabric?.name?.en || fabric?.name?.vi);

    // Fallback to predicted_label if no DB match found
    if (!fabricName && statusData.predicted_label) {
      fabricName = statusData.predicted_label;
    }

    if (!fabricName) {
      fabricName = isVi ? 'Không xác định' : 'Unknown';
    }

    // Tags: string[] or { "vi": [...], "en": [...] } or { "vi": "val", "en": "val" }
    const rawTags: unknown = fabric?.tags || [];
    let tags: string[];
    if (Array.isArray(rawTags)) {
      tags = rawTags.filter(Boolean).map(t => String(t));
    } else if (typeof rawTags === 'object' && rawTags) {
      const localeTags = isVi ? (rawTags as Record<string, unknown>).vi : (rawTags as Record<string, unknown>).en;
      if (Array.isArray(localeTags)) {
        tags = localeTags.filter(Boolean).map(t => String(t));
      } else if (typeof localeTags === 'string') {
        tags = [localeTags];
      } else {
        tags = Object.values(rawTags as Record<string, unknown>).flatMap(v =>
          Array.isArray(v) ? v.map(String) : [String(v)]
        );
      }
    } else {
      tags = [];
    }

    // Care instructions: { "en": "...", "vi": "..." } or { "en": {...}, "vi": {...} } or array or string
    const rawCare: unknown = fabric?.care_instructions || {};
    let careList: string[] = [];

    if (typeof rawCare === 'string') {
      // String format: split by comma or period
      careList = rawCare.split(/[,.]/).map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(rawCare)) {
      // Array format
      careList = rawCare.filter(Boolean).map(item => String(item));
    } else if (typeof rawCare === 'object') {
      // Language-keyed format: { "en": "...", "vi": "..." } or { "en": {...}, "vi": {...} }
      const localeCare = isVi ? (rawCare as Record<string, unknown>).vi : (rawCare as Record<string, unknown>).en;
      if (typeof localeCare === 'string') {
        // Simple string per language: "Giặt máy..."
        careList = localeCare.split(/[,.]/).map(s => s.trim()).filter(Boolean);
      } else if (typeof localeCare === 'object' && localeCare) {
        // Object per language: { "wash": "..." }
        careList = Object.values(localeCare as Record<string, unknown>).filter(Boolean).map(v => String(v));
      }
    }

    const allTags = Array.isArray(rawTags) ? tags : Object.values(rawTags as Record<string, unknown>).flatMap(v => Array.isArray(v) ? v : Object.values(v as Record<string, unknown>));
    const isEco = allTags.some((tag: string) =>
      ['cotton', 'linen', 'hemp', 'organic', 'sustainable', 'bông', 'lanh'].some(
        eco => tag.toLowerCase().includes(eco)
      )
    );

    setResult({
      fabric: fabricName,
      accuracy: confidenceToAccuracy(statusData.confidence_score || ''),
      ecoFriendly: isEco,
      traits: tags.slice(0, 4),
      care: careList.slice(0, 3),
      durability: statusData.durability,
      breathability: statusData.breathability,
      comfort: statusData.comfort,
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeSeason);
  }, [activeSeason]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.studioHeader}>
          <h2 className={styles.sectionTitle}>{t('section_title')}</h2>
          <p className={styles.sectionDesc}>{t('section_description')}</p>
        </div>

        <div className={styles.studioWorkspace}>
          {/* LEFT ZONE: AI Scanner (Input) */}
          <div className={styles.zoneLeft}>
            <div className={styles.zoneHeader}>
              <Scan size={18} />
              <h3>{t('scanner_header')}</h3>
            </div>
            <div
              className={`${styles.uploadBox} ${preview ? styles.hasPreview : ''} ${dragOver ? styles.dragActive : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className={styles.previewImg} />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadIconWrap}>
                    <Upload size={28} strokeWidth={1.5} />
                  </div>
                  <p className={styles.uploadLabel}>{t('upload_label')}</p>
                  <div className={styles.uploadActions}>
                    <span className={styles.uploadChip}><Upload size={14} /> {t('upload_file')}</span>
                    <span className={styles.uploadChip}><Camera size={14} /> {t('upload_camera')}</span>
                  </div>
                  <span className={styles.uploadHint}>{t('upload_hint')}</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            {loading && (
              <div className={styles.loadingState}>
                <Loader2 size={24} className={styles.spinner} />
                <p>{t('loading_message')}</p>
              </div>
            )}

            {error && !loading && (
              <div className={styles.infoBox} style={{ borderColor: '#e74c3c', color: '#e74c3c' }}>
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            {!result && !loading && preview && !error && (
              <div className={styles.infoBox}>
                <AlertCircle size={16} />
                <p>{t('info_message')}</p>
              </div>
            )}
          </div>

          {/* CENTER ZONE: The Changing Room Mirror (Model) */}
          <div className={styles.zoneCenter}>
            <div className={styles.mirrorContainer}>
              <div className={styles.mirrorLight}></div>
              <div className={styles.modelSilhouette}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MODEL_URLS[activeSeason]} alt={`${activeSeason} fashion model`} className={styles.modelImg} />
                
                {(tryOnResult || tryOnLoading) && (
                  <div className={styles.tryOnOverlay}>
                    {tryOnLoading ? (
                      <div className={styles.tryOnLoading}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p>AI đang thiết kế...</p>
                      </div>
                    ) : (
                      <div className={styles.tryOnResult}>
                        <img src={tryOnResult!} alt="Try-On Result" className={styles.resultImg} />
                        <button className={styles.resetTryOn} onClick={() => setTryOnResult(null)}>
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.mirrorStand}></div>
            </div>
            <div className={styles.modelLabel}>
              <strong>{t('model_label')} {t(`seasons.${activeSeason}.label`)}</strong>
              <span>{t('model_material')} {t(`seasons.${activeSeason}.material`)}</span>
            </div>
          </div>

          {/* RIGHT ZONE: Analysis Results */}
          <div className={styles.zoneRight}>
            <div className={styles.zoneHeader}>
              <FileText size={18} />
              <h3>{t('analysis_header')}</h3>
            </div>

            <div className={styles.resultPanel}>
              {!result && !loading && (
                <div className={styles.emptyState}>
                  <FileText size={48} strokeWidth={1} className={styles.emptyIcon} />
                  <p>{t('empty_state')}</p>
                </div>
              )}

              {result && !loading && (
                <div className={styles.resultContent}>
                  <div className={styles.resultMain}>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>{t('fabric_type_label')}</span>
                      <strong className={styles.resultHighlight}>{result.fabric}</strong>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>{t('accuracy_label')}</span>
                      <div className={styles.accuracyWrap}>
                        <div className={styles.accuracyBar}>
                          <div className={styles.accuracyFill} style={{ width: `${result.accuracy}%` }} />
                        </div>
                        <span className={styles.accuracyNum}>{result.accuracy}%</span>
                      </div>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>{t('eco_label')}</span>
                      {result.ecoFriendly
                        ? <span className={styles.ecoYes}><Leaf size={14} /> {t('eco_friendly')}</span>
                        : <span className={styles.ecoNo}>{t('eco_not_certified')}</span>}
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>{t('eco_index_label')}</span>
                      <span className={result.ecoFriendly ? styles.ecoYes : styles.ecoNo}>
                        {result.ecoFriendly ? t('eco_status_friendly') : t('eco_status_unfriendly')}
                      </span>
                    </div>

                    {result.durability !== undefined && (
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Độ bền</span>
                        <div className={styles.accuracyWrap}>
                          <div className={styles.accuracyBar}>
                            <div className={styles.accuracyFill} style={{ width: `${result.durability * 10}%`, backgroundColor: '#3498db' }} />
                          </div>
                          <span className={styles.accuracyNum}>{result.durability}/10</span>
                        </div>
                      </div>
                    )}

                    {result.breathability !== undefined && (
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Độ thoáng khí</span>
                        <div className={styles.accuracyWrap}>
                          <div className={styles.accuracyBar}>
                            <div className={styles.accuracyFill} style={{ width: `${result.breathability * 10}%`, backgroundColor: '#2ecc71' }} />
                          </div>
                          <span className={styles.accuracyNum}>{result.breathability}/10</span>
                        </div>
                      </div>
                    )}

                    {result.comfort !== undefined && (
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Cảm giác mặc</span>
                        <div className={styles.accuracyWrap}>
                          <div className={styles.accuracyBar}>
                            <div className={styles.accuracyFill} style={{ width: `${result.comfort * 10}%`, backgroundColor: '#f1c40f' }} />
                          </div>
                          <span className={styles.accuracyNum}>{result.comfort}/10</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.resultSection}>
                    <p className={styles.resultSub}>{t('traits_title')}</p>
                    <div className={styles.tagList}>
                      {result.traits.map(tr => <span key={tr} className={styles.traitTag}>{tr}</span>)}
                    </div>
                  </div>
                  <div className={styles.resultSection}>
                    <p className={styles.resultSub}>{t('care_title')}</p>
                    <ul className={styles.careList}>
                      {result.care.map(c => <li key={c}>{c}</li>)}
                    </ul>
                  </div>

                  <button 
                    className={styles.tryOnButton} 
                    onClick={handleTryOn} 
                    disabled={tryOnLoading || !uploadedImageUrl}
                  >
                    {tryOnLoading ? <Loader2 size={18} className={styles.spinner} /> : <Shirt size={18} />}
                    {t('try_on_button') || 'Thử trang phục ngay'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ZONE: Fabric Wardrobe / Categories */}
        <div className={styles.studioWardrobe}>
          <div className={styles.wardrobeHeader}>
            <h3>{t('wardrobe_header')}</h3>
          </div>
          <div className={styles.seasonTabs}>
            {SEASONS.map(({ key, Icon }) => (
               <button
                key={key}
                className={`${styles.seasonTab} ${activeSeason === key ? styles.seasonActive : ''}`}
                onClick={() => {
                  setActiveSeason(key);
                  setTryOnResult(null);
                  setTryOnLoading(false);
                }}
                data-season={key}
              >
                <div className={styles.seasonIconWrap}>
                  <Icon size={24} strokeWidth={1.5} className={styles.seasonIcon} />
                </div>
                <div className={styles.seasonText}>
                  <span className={styles.seasonLabel}>{t(`seasons.${key}.label`)}</span>
                  <span className={styles.seasonSub}>{t('model_material')} {t(`seasons.${key}.material`)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
