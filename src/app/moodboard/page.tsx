"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookMarked, ArrowLeft, Trash2, LogIn, Scissors, ExternalLink } from 'lucide-react';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Fabric {
  id: number;
  name: string;
  type: string | null;
  meta_description: string | null;
  tags: string[] | null;
}
interface MoodItem {
  id: number;
  fabric: Fabric;
  note: string | null;
  added_at: string;
}

export default function MoodboardPage() {
  const [items, setItems] = useState<MoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

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

  const remove = async (id: number) => {
    const token = localStorage.getItem('fabrivo_token');
    // Optimistic UI update
    setItems(prev => prev.filter(i => i.id !== id));
    // Note: Backend DELETE endpoint would go here when implemented
    console.log('Remove moodboard item', id, token);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> Trang chủ
          </Link>
          <div className={styles.pageTitle}>
            <BookMarked size={20} strokeWidth={1.8} />
            <h1>Bộ Sưu Tập Của Tôi</h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Not logged in */}
        {!authed && !loading && (
          <div className={styles.emptyState}>
            <BookMarked size={48} strokeWidth={1.2} className={styles.emptyIcon} />
            <h2>Bạn chưa đăng nhập</h2>
            <p>Hãy đăng nhập để lưu và quản lý bộ sưu tập vải yêu thích của bạn</p>
            <Link href="/auth" className={styles.authLink}>
              <LogIn size={16} /> Đăng nhập ngay
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
            <BookMarked size={48} strokeWidth={1.2} className={styles.emptyIcon} />
            <h2>Bộ sưu tập trống</h2>
            <p>Hãy khám phá các loại vải và thêm chúng vào bộ sưu tập của bạn</p>
            <Link href="/" className={styles.authLink}>
              <Scissors size={16} /> Khám phá loại vải
            </Link>
          </div>
        )}

        {/* Grid */}
        {authed && !loading && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={styles.card}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className={styles.cardThumb}>
                  <Scissors size={24} strokeWidth={1.4} className={styles.thumbIcon} />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{item.fabric.name}</h3>
                  <p className={styles.cardType}>{item.fabric.type === 'fiber' ? 'Sợi vải' : 'Loại vải'}</p>
                  {item.fabric.tags && (
                    <div className={styles.tags}>
                      {item.fabric.tags.slice(0, 2).map(t => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  )}
                  {item.note && <p className={styles.note}>📝 {item.note}</p>}
                  <p className={styles.date}>
                    Thêm: {new Date(item.added_at).toLocaleDateString('vi-VN')}
                  </p>
                  <div className={styles.cardActions}>
                    <Link href={`/fabrics/${item.fabric.id}`} className={styles.viewBtn}>
                      <ExternalLink size={13} /> Xem chi tiết
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
