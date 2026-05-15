import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import styles from './page.module.css';
import { articlesApi } from '@/utils/api';
import { ArrowRight, Newspaper } from 'lucide-react';

export default async function NewsArchivePage() {
  const locale = await getLocale();
  let articles = [];

  try {
    articles = await articlesApi.getArticles(0, 50);
  } catch (err) {
    console.error("Failed to load articles:", err);
  }

  const getLocalizedText = (obj: any, fallback: string = "") => {
    if (!obj) return fallback;
    if (typeof obj === 'string') return obj;
    return obj[locale] || obj['vi'] || fallback;
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.tagLine}>
              <Newspaper size={16} />
              <span>{locale === 'en' ? 'INSIGHTS & TRENDS' : 'XU HƯỚNG & TIN TỨC'}</span>
            </div>
            <h1 className={styles.heroTitle}>
              {locale === 'en' ? 'Fashion Chronicles' : 'Nhật Ký Thời Trang'}
            </h1>
            <p className={styles.heroSubtitle}>
              {locale === 'en' 
                ? 'Exploring the intersection of tradition, sustainability, and modern design in the heart of Vietnam.' 
                : 'Khám phá sự giao thoa giữa truyền thống, bền vững và thiết kế hiện đại tại tâm điểm của Việt Nam.'}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.archiveSection}>
        <div className={styles.container}>
          {articles.length === 0 ? (
            <div className={styles.noData}>
              <p>{locale === 'en' ? 'No articles found.' : 'Không có bài viết nào.'}</p>
            </div>
          ) : (
            <div className={styles.magazineGrid}>
              {articles.map((article: any, index: number) => {
                const title = getLocalizedText(article.title);
                const description = getLocalizedText(article.description);
                const category = getLocalizedText(article.category, 'NEWS');
                
                // First article is larger (featured-style in grid)
                const isFeatured = index === 0;

                return (
                  <Link 
                    href={`/news/${article.id}`} 
                    key={article.id} 
                    className={`${styles.articleCard} ${isFeatured ? styles.featuredCard : ''}`}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={article.image_url || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80'}
                        alt={title}
                        fill
                        className={styles.articleImage}
                      />
                      <div className={styles.categoryBadge}>{category}</div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        {new Date(article.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <h2 className={styles.cardTitle}>{title}</h2>
                      <p className={styles.cardSnippet}>{description}</p>
                      <div className={styles.readMore}>
                        <span>{locale === 'en' ? 'Read Full Story' : 'Đọc bài viết'}</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
