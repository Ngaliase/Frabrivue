"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal, BookMarked, RefreshCcw, Scissors } from 'lucide-react';
import styles from './FabricGrid.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PAGE_SIZE = 8;

interface Fabric {
  id: number;
  name: string;
  type: string | null;
  meta_description: string | null;
  about_text: string | null;
  tags: string[] | null;
  properties: Record<string, string> | null;
  care_instructions: string | null;
}

const THUMB_COLORS: Record<string, string> = {
  fabric: '#c4b5a5',
  fiber: '#a5b4c4',
};

export default function FabricGrid() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(247); // known total from seed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchFabrics = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const skip = (p - 1) * PAGE_SIZE;
      const res = await fetch(`${API_BASE}/api/v1/fabrics/?skip=${skip}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error('Lỗi máy chủ');
      const data: Fabric[] = await res.json();
      setFabrics(data);
      if (p === 1) setTotal(Math.max(total, data.length < PAGE_SIZE ? data.length : 247));
    } catch {
      setError('Không thể kết nối đến máy chủ. Hãy chắc chắn Backend đang chạy tại cổng 8000.');
    } finally {
      setLoading(false);
    }
  }, [total]);

  useEffect(() => { fetchFabrics(page); }, [page]); // eslint-disable-line

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {error && (
          <div className={styles.errorBanner}>
            <RefreshCcw size={15} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {fabrics.map((fabric, idx) => (
              <div
                key={fabric.id}
                className={styles.card}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Thumbnail */}
                <div
                  className={styles.thumb}
                  style={{ background: fabric.type === 'fiber' ? 'var(--svg-color-2)' : 'var(--svg-color-1)' }}
                >
                  <div className={styles.thumbPattern} />
                  <Scissors size={22} strokeWidth={1.5} className={styles.thumbIcon} />
                </div>

                {/* Info */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{fabric.name}</h3>
                  <p className={styles.cardType}>{fabric.type === 'fiber' ? 'Sợi vải' : 'Loại vải'}</p>

                  {fabric.tags && fabric.tags.length > 0 && (
                    <div className={styles.tags}>
                      {fabric.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <p className={styles.cardDesc}>
                    {fabric.meta_description
                      ? fabric.meta_description.slice(0, 85) + (fabric.meta_description.length > 85 ? '...' : '')
                      : (fabric.about_text ? fabric.about_text.slice(0, 85) + '...' : 'Không có mô tả.')}
                  </p>

                  <Link href={`/fabrics/${fabric.id}`} className={styles.infoBtn}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination + Actions */}
        <div className={styles.bottomBar}>
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={15} />
            </button>

            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dot-${idx}`} className={styles.pageDots}>
                  <MoreHorizontal size={14} />
                </span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${page === p ? styles.pageActive : ''}`}
                  onClick={() => setPage(p as number)}
                >{p}</button>
              )
            )}

            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              aria-label="Trang sau"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className={styles.actionBtns}>
            <button className={styles.dbBtn} onClick={() => fetchFabrics(page)}>
              <RefreshCcw size={14} />
              Cập nhật CSDL
            </button>
            <Link href="/moodboard" className={styles.moodBtn}>
              <BookMarked size={14} />
              Quản lý bộ sưu tập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
