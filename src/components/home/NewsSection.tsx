"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import styles from './NewsSection.module.css';
import { articlesApi } from '@/utils/api';

interface Article {
  id: number;
  title: Record<string, string>;
  description: Record<string, string>;
  content: Record<string, string>;
  category: Record<string, string>;
  image_url: string;
  source_url: string;
  is_featured: number;
  created_at: string;
}

export default function NewsSection() {
  const locale = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesApi.getArticles(0, 4)
      .then(data => setArticles(data))
      .catch(err => console.error("Failed to load articles:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Tin Tức & Tiêu Điểm</h2>
            <div className={styles.divider}></div>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading articles...</div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>{locale === 'en' ? 'News & Highlights' : 'Tin Tức & Tiêu Điểm'}</h2>
            <div className={styles.divider}></div>
          </div>
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666', fontStyle: 'italic' }}>
            {locale === 'en' ? 'No articles available yet. We are currently updating our news feed...' : 'Chưa có bài viết nào. Hệ thống đang tiến hành dịch và cập nhật tin tức mới nhất...'}
          </div>
        </div>
      </section>
    );
  }

  // Find the first featured article, or fallback to the first article
  let featuredArticle = articles.find(a => a.is_featured === 1);
  if (!featuredArticle) {
    featuredArticle = articles[0];
  }

  const sideArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 3);

  const getLocalizedText = (obj: Record<string, string> | undefined, fallback: string = "") => {
    if (!obj) return fallback;
    return obj[locale] || obj['vi'] || fallback;
  };

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>{locale === 'en' ? 'News & Highlights' : 'Tin Tức & Tiêu Điểm'}</h2>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.newsGrid}>
          {/* Featured Article */}
          {featuredArticle && (
            <article className={styles.featuredArticle}>
              <Link href={`/news/${featuredArticle.id}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={featuredArticle.image_url || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                    alt={getLocalizedText(featuredArticle.title)}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
                <div className={styles.categoryBadge}>{getLocalizedText(featuredArticle.category, 'NEWS')}</div>
              </Link>
              <div className={styles.featuredContent}>
                <Link href={`/news/${featuredArticle.id}`} className={styles.textLink}>
                  <h3 className={styles.featuredTitle}>{getLocalizedText(featuredArticle.title)}</h3>
                </Link>
                <p className={styles.featuredDescription}>{getLocalizedText(featuredArticle.description)}</p>
                <Link href={`/news/${featuredArticle.id}`} className={styles.readMore}>
                  {locale === 'en' ? 'Read more' : 'Đọc tiếp'} <span className={styles.arrow}>→</span>
                </Link>
              </div>
            </article>
          )}

          {/* Side Articles */}
          <div className={styles.sideArticles}>
            {sideArticles.map(article => (
              <article key={article.id} className={styles.sideArticle}>
                <Link href={`/news/${article.id}`} className={styles.sideImageLink}>
                  <div className={styles.sideImageWrapper}>
                    <Image 
                      src={article.image_url || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={getLocalizedText(article.title)}
                      fill
                      className={styles.sideImage}
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                </Link>
                <div className={styles.sideContent}>
                  <div className={styles.sideCategory}>{getLocalizedText(article.category, 'NEWS')}</div>
                  <Link href={`/news/${article.id}`} className={styles.textLink}>
                    <h3 className={styles.sideTitle}>{getLocalizedText(article.title)}</h3>
                  </Link>
                  <p className={styles.sideDescription}>{getLocalizedText(article.description)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
