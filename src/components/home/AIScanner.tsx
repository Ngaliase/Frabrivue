"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Leaf, ChevronRight, Loader2, Snowflake, Flame, Sun, Wind } from 'lucide-react';
import styles from './AIScanner.module.css';

interface AIResult {
  fabric: string;
  accuracy: number;
  ecoFriendly: boolean;
  traits: string[];
  care: string[];
}

const MOCK_RESULT: AIResult = {
  fabric: 'Lụa Satin',
  accuracy: 98,
  ecoFriendly: true,
  traits: ['Mềm mại', 'Bóng bẩy', 'Thoáng khí'],
  care: ['Giặt khô', 'Tránh ánh nắng trực tiếp'],
};

const SEASONS = [
  { key: 'spring', label: 'XUÂN', sub: 'Tuyết Mưa', Icon: Wind },
  { key: 'summer', label: 'HẠ', sub: 'Vải Lanh', Icon: Sun },
  { key: 'autumn', label: 'THU', sub: 'Lụa Satin', Icon: Flame },
  { key: 'winter', label: 'ĐÔNG', sub: 'Vải Dạ Len', Icon: Snowflake },
];

export default function AIScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState('autumn');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setLoading(false);
    }, 1800);
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
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>

        {/* LEFT – Upload zone */}
        <div className={styles.leftCol}>
          <h2 className={styles.sectionTitle}>Quét Vải &amp; Gợi Ý Theo Mùa</h2>
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
                <p className={styles.uploadLabel}>Tải Lên / Chụp Ảnh</p>
                <div className={styles.uploadActions}>
                  <span className={styles.uploadChip}><Upload size={12} /> Tải lên</span>
                  <span className={styles.uploadChip}><Camera size={12} /> Chụp ảnh</span>
                </div>
                <span className={styles.uploadHint}>Kéo thả hoặc nhấp để chọn ảnh</span>
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
        </div>

        {/* CENTER – Fashion model illustration */}
        <div className={styles.centerCol}>
          <div className={styles.modelArea}>
            <div className={styles.modelLabel}>
              <strong>Người Mẫu</strong>
              <span>(Chuyển đổi theo Mùa)</span>
            </div>
            <div className={styles.modelSilhouette}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/models/${activeSeason}.png`} alt={`${activeSeason} fashion model`} className={styles.modelImg} />
            </div>
            <ChevronRight size={16} className={styles.arrowIcon} />
          </div>
        </div>

        {/* RIGHT – AI Result panel */}
        <div className={styles.rightCol}>
          <div className={styles.resultPanel}>
            <h3 className={styles.resultTitle}>Kết Quả Nhận Diện Vải</h3>
            {loading && (
              <div className={styles.loadingState}>
                <Loader2 size={28} className={styles.spinner} />
                <p>Đang phân tích...</p>
              </div>
            )}
            {result && !loading && (
              <div className={`${styles.resultContent} ${styles.animateResult}`}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Độ chính xác:</span>
                  <div className={styles.accuracyBar}>
                    <div className={styles.accuracyFill} style={{ width: `${result.accuracy}%` }} />
                  </div>
                  <span className={styles.accuracyNum}>{result.accuracy}%</span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Vải:</span>
                  <strong>{result.fabric}</strong>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Thân thiện môi trường:</span>
                  {result.ecoFriendly
                    ? <span className={styles.ecoYes}><Leaf size={13} /> Có</span>
                    : <span className={styles.ecoNo}>Không</span>}
                </div>
                <div className={styles.resultSection}>
                  <p className={styles.resultSub}>Đặc tính:</p>
                  <ul>{result.traits.map(t => <li key={t}>{t}</li>)}</ul>
                </div>
                <div className={styles.resultSection}>
                  <p className={styles.resultSub}>Cách bảo quản:</p>
                  <ul>{result.care.map(c => <li key={c}>{c}</li>)}</ul>
                </div>
              </div>
            )}
            {!result && !loading && (
              <p className={styles.emptyState}>Hãy tải lên ảnh vải để nhận kết quả nhận diện</p>
            )}
          </div>
        </div>
      </div>

      {/* Season Tabs */}
      <div className={`container ${styles.seasonRow}`}>
        <h3 className={styles.catTitle}>Danh mục vải</h3>
        <div className={styles.seasonTabs}>
          {SEASONS.map(({ key, label, sub, Icon }) => (
            <button
              key={key}
              className={`${styles.seasonTab} ${activeSeason === key ? styles.seasonActive : ''}`}
              onClick={() => setActiveSeason(key)}
              data-season={key}
            >
              <Icon size={18} strokeWidth={1.8} className={styles.seasonIcon} />
              <div className={styles.seasonText}>
                <span className={styles.seasonLabel}>{label}</span>
                <span className={styles.seasonSub}>{sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
