"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft, ChevronRight, MoreHorizontal, BookMarked, RefreshCcw,
  Scissors, LayoutGrid, Briefcase, GraduationCap, Dumbbell,
  PartyPopper, Moon, Heart, Sparkles, Search, Info
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLocale } from 'next-intl';
import styles from './FabricGrid.module.css';
import { Fabric } from '@/types/fabric';
import { getLocaleValue } from '@/utils/fabric-utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PAGE_SIZE = 8;

// interface Fabric {
//   id: number;
//   name: string;
//   type: string | null;
//   image_url: string | null;
//   meta_description: string | null;
//   about_text: string | null;
//   tags: string[] | null;
//   categories: string[] | null;
//   style_concepts: string[] | null;
//   properties: Record<string, string> | null;
//   care_instructions: string | null;
// }

// Category filter tabs
const CATEGORY_TABS = [
  { key: '', labelKey: 'all', icon: LayoutGrid },
  { key: 'hang_ngay', labelKey: 'hang_ngay', icon: Sparkles },
  { key: 'cong_so', labelKey: 'cong_so', icon: Briefcase },
  { key: 'di_hoc', labelKey: 'di_hoc', icon: GraduationCap },
  { key: 'the_thao', labelKey: 'the_thao', icon: Dumbbell },
  { key: 'su_kien', labelKey: 'su_kien', icon: PartyPopper },
  { key: 'da_tiec', labelKey: 'da_tiec', icon: Moon },
  { key: 'dam_cuoi', labelKey: 'dam_cuoi', icon: Heart },
];

// Localized labels will be handled by tCat and tConcept hooks

export default function FabricGrid() {
  const t = useTranslations('FabricGrid');
  const tCat = useTranslations('Categories');
  const tConcept = useTranslations('Concepts');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlSeason = searchParams.get('season') || '';
  const urlTrending = searchParams.get('trending') || '';

  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(247);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [weatherInfo, setWeatherInfo] = useState<{
    temperature: number;
    location: string;
    season: string;
    suggestion: string;
    description: string;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!loading && fabrics.length > 0 && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.2)' }
      );
    }
  }, { scope: gridRef, dependencies: [fabrics, loading] });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchFabrics = useCallback(async (p: number, category: string, query: string, season: string, trending: string) => {
    setLoading(true);
    setError('');
    setWeatherInfo(null);
    try {
      const skip = (p - 1) * PAGE_SIZE;
      const params = new URLSearchParams({ skip: String(skip), limit: String(PAGE_SIZE) });
      if (category) params.set('category', category);
      if (query) params.set('search', query);
      if (trending === 'true') params.set('trending', 'true');

      let url = `${API_BASE}/api/v1/fabrics/?${params}`;
      
      // If seasonal view (coming from Hero or URL param)
      if (season && !category && !query && trending !== 'true') {
        url = `${API_BASE}/api/v1/fabrics/current-season`;
      } else if (season) {
        params.set('season', season);
        url = `${API_BASE}/api/v1/fabrics/?${params}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(t('serverError') as string);
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setFabrics(data);
        if (data.length < PAGE_SIZE) {
          setTotal((p - 1) * PAGE_SIZE + data.length);
        } else {
          setTotal(Math.max(total, p * PAGE_SIZE + 1));
        }
      } else {
        // SeasonalFabricResponse format
        setFabrics(data.fabrics);
        setWeatherInfo(data.weather);
        const fabricCount = data.fabrics.length;
        if (fabricCount < PAGE_SIZE) {
          setTotal((p - 1) * PAGE_SIZE + fabricCount);
        } else {
          setTotal(Math.max(total, p * PAGE_SIZE + 1));
        }
      }
    } catch {
      setError(t('connectionError') as string);
    } finally {
      setLoading(false);
    }
  }, [total, t]);

  // Re-fetch when URL query, season or trending changes
  useEffect(() => {
    setPage(1);
    fetchFabrics(1, activeCategory, urlQuery, urlSeason, urlTrending);

    // Auto-scroll to results when search or filter is applied
    if (urlQuery || urlSeason || urlTrending || activeCategory) {
      const element = document.getElementById('fabric-grid-section');
      if (element) {
        // Small delay to allow the grid to start rendering/loading
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [urlQuery, activeCategory, urlSeason, urlTrending, fetchFabrics]);

  useEffect(() => {
    fetchFabrics(page, activeCategory, urlQuery, urlSeason, urlTrending);
  }, [page, activeCategory, urlQuery, urlSeason, urlTrending, fetchFabrics]);

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

  const getSeasonLabel = (s: string) => {
    const labels: Record<string, string> = {
      spring: 'Mùa Xuân',
      summer: 'Mùa Hạ',
      autumn: 'Mùa Thu',
      winter: 'Mùa Đông'
    };
    return labels[s] || s;
  };

  return (
    <section className={styles.section} id="fabric-grid-section">
      <div className="container">
        {/* Search result indicator */}
        {urlQuery && (
          <div className={styles.searchBanner}>
            <Search size={15} />
            <span>Kết quả tìm kiếm cho: <strong>&ldquo;{urlQuery}&rdquo;</strong></span>
            <span className={styles.searchCount}>{total} kết quả</span>
          </div>
        )}

        {/* Seasonal indicator */}
        {urlSeason && (
          <div className={`${styles.searchBanner} ${styles.seasonalBanner}`}>
            <Sparkles size={15} className={styles.seasonalIcon} />
            <span>Gợi ý cho <strong>{weatherInfo ? weatherInfo.season : getSeasonLabel(urlSeason)}</strong></span>
            <span className={styles.searchCount}>{total} loại vải phù hợp</span>
          </div>
        )}

        {/* Trending indicator */}
        {urlTrending === 'true' && (
          <div className={`${styles.searchBanner} ${styles.trendingBanner}`}>
            <Sparkles size={15} className={styles.trendingIcon} />
            <span>Các loại vải <strong>thịnh hành nhất hiện nay</strong> (Cotton, Tencel, Linen)</span>
          </div>
        )}

        {/* Weather Suggestion Box */}
        {weatherInfo && (
          <div className={styles.weatherBox}>
            <div className={styles.weatherHeader}>
              <div className={styles.weatherTemp}>
                <span className={styles.tempVal}>{weatherInfo.temperature}°C</span>
                <span className={styles.location}>{weatherInfo.location}</span>
              </div>
              <div className={styles.weatherTitle}>
                <h3>Dự báo thời tiết & Gợi ý trang phục</h3>
              </div>
            </div>
            <p className={styles.weatherDesc}>{weatherInfo.description}</p>
            <div className={styles.suggestionDivider}></div>
            <p className={styles.suggestionText}>{weatherInfo.suggestion}</p>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className={styles.filterBar}>
          {CATEGORY_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`${styles.filterTab} ${activeCategory === tab.key ? styles.filterTabActive : ''}`}
                onClick={() => setActiveCategory(tab.key)}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{tCat(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

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
        ) : fabrics.length === 0 ? (
          <div className={styles.emptyState}>
            <Scissors size={40} strokeWidth={1.2} className={styles.emptyIcon} />
            <p>Không tìm thấy loại vải nào phù hợp.</p>
          </div>
        ) : (
          <div className={styles.grid} ref={gridRef}>
            {fabrics.map((fabric, idx) => (
              <div
                key={fabric.id}
                className={styles.card}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Thumbnail */}
                <div className={styles.thumb}>
                  {fabric.image_url ? (
                    <img
                      src={fabric.image_url}
                      alt={getLocaleValue(fabric.name, locale)}
                      className={styles.thumbImg}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className={styles.thumbPattern}
                      style={{ background: fabric.type === 'fiber' ? 'var(--svg-color-2)' : 'var(--svg-color-1)' }}
                    />
                  )}

                  {/* Style concept badge */}
                  {fabric.style_concepts && fabric.style_concepts.length > 0 && (
                    <span className={styles.conceptBadge}>
                      {tConcept.has(fabric.style_concepts[0]) ? tConcept(fabric.style_concepts[0]) : fabric.style_concepts[0].replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{getLocaleValue(fabric.name, locale)}</h3>
                  <p className={styles.cardType}>{fabric.type === 'fiber' ? t('fiberType') : t('fabricType')}</p>

                  {fabric.categories && fabric.categories.length > 0 && (
                    <div className={styles.tags}>
                      {fabric.categories.slice(0, 2).map(cat => {
                        const tab = CATEGORY_TABS.find(tb => tb.key === cat);
                        return (
                          <span key={cat} className={styles.catTag}>
                            {tab ? tCat(tab.labelKey) : (cat.replace(/_/g, ' '))}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className={styles.cardDesc}>
                    <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', opacity: 0.7 }} />
                    {fabric.about_text
                      ? getLocaleValue(fabric.about_text, locale).slice(0, 100) + (getLocaleValue(fabric.about_text, locale).length > 100 ? '...' : '')
                      : (fabric.meta_description ? getLocaleValue(fabric.meta_description, locale).slice(0, 100) + '...' : t('noDescription'))}
                  </p>

                  <Link href={`/fabrics/${fabric.id}`} className={styles.infoBtn}>
                    {t('viewDetails')}
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
              aria-label={t('previousPage')}
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
              aria-label={t('nextPage')}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className={styles.actionBtns}>
            <button className={styles.dbBtn} onClick={() => fetchFabrics(page, activeCategory, urlQuery, urlSeason, urlTrending)}>
              <RefreshCcw size={14} />
              {t('updateDatabase')}
            </button>
            <Link href="/moodboard" className={styles.moodBtn}>
              <BookMarked size={14} />
              {t('manageCollection')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

