import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';
import { articlesApi } from '@/utils/api';

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const locale = await getLocale();
  let article = null;
  
  try {
    article = await articlesApi.getArticle(parseInt(resolvedParams.id));
  } catch (err) {
    console.error("Failed to load article:", err);
  }

  if (!article) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>{locale === 'en' ? 'Article Not Found' : 'Không tìm thấy bài viết'}</h2>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> {locale === 'en' ? 'Back to Home' : 'Về trang chủ'}
          </Link>
        </div>
      </div>
    );
  }

  const getLocalizedText = (obj: Record<string, string> | undefined, fallback: string = "") => {
    if (!obj) return fallback;
    return obj[locale] || obj['vi'] || fallback;
  };

  const title = getLocalizedText(article.title);
  const description = getLocalizedText(article.description);
  const content = getLocalizedText(article.content);
  const category = getLocalizedText(article.category, 'NEWS');

  // Format content to have paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> {locale === 'en' ? 'Back to Home' : 'Về trang chủ'}
        </Link>
        
        <article className={styles.article}>
          <header className={styles.header}>
            <div className={styles.categoryBadge}>{category}</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
            
            <div className={styles.meta}>
              <span className={styles.date}>
                {new Date(article.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {article.source_url && (
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  {locale === 'en' ? 'Original Source' : 'Nguồn gốc'}
                </a>
              )}
            </div>
          </header>

          <div className={styles.heroImageWrapper}>
            <Image
              src={article.image_url || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
              alt={title}
              fill
              className={styles.heroImage}
              priority
            />
          </div>

          <div className={styles.content}>
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
