"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Loader2, Calendar, User } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './page.module.css';
import { Post, Comment, PostBlock } from '@/types/fabric';
import { postsApi } from '@/utils/api';

// ── Block Renderer ──────────────────────────────────────────────────────────
function BlockRenderer({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className={styles.articleBody}>
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <p key={i} className={styles.articleParagraph}>
              {block.content}
            </p>
          );
        }
        if (block.type === 'image' && block.url) {
          return (
            <figure key={i} className={styles.articleFigure}>
              <img src={block.url} alt={block.caption || ''} className={styles.articleImage} />
              {block.caption && (
                <figcaption className={styles.figCaption}>{block.caption}</figcaption>
              )}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function PostDetailPage() {
  const t = useTranslations('FeedPage');
  const locale = useLocale();
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('Frabrivue_token');
    if (!token) { router.push('/auth'); return; }
    setAuthed(true);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.sub ? parseInt(payload.sub) : null);
    } catch { }

    Promise.all([
      postsApi.getPost(Number(id)),
      postsApi.getComments(Number(id)),
    ]).then(([postData, commentsData]) => {
      setPost(postData);
      setComments(commentsData);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [id, router]);

  useGSAP(() => {
    if (!loading && post && containerRef.current) {
      gsap.fromTo(`.${styles.articleCard}`,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [loading, post] });

  const handleLike = async () => {
    if (!post) return;
    const result = await postsApi.toggleLike(post.id);
    setPost(prev => prev ? { ...prev, is_liked: result.liked, likes_count: result.likes_count } : prev);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    await postsApi.deletePost(post.id);
    router.push('/feed');
  };

  const submitComment = async () => {
    if (!newComment.trim() || !post) return;
    setPostingComment(true);
    try {
      const comment = await postsApi.addComment(post.id, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev);
    } finally {
      setPostingComment(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}><Loader2 size={28} className={styles.spin} /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <p>{t('postNotFound')}</p>
          <Link href="/feed">{t('backToFeed')}</Link>
        </div>
      </div>
    );
  }

  const hasBlocks = post.blocks && post.blocks.length > 0;

  return (
    <div className={styles.page} ref={containerRef}>

      {/* Sticky back bar */}
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px' }}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className={styles.pageTitle}>
            <MessageCircle size={18} strokeWidth={1.8} />
            <h1>{t('postTitle')}</h1>
          </div>
        </div>
      </div>

      <div className={styles.articleWrap}>
        <article className={styles.articleCard}>

          {/* Author / meta */}
          <header className={styles.articleHeader}>
            <div className={styles.authorRow}>
              <div className={styles.avatar}>{post.user.full_name.charAt(0).toUpperCase()}</div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{post.user.full_name}</span>
                <span className={styles.articleDate}>
                  <Calendar size={12} /> {formatDate(post.created_at)}
                </span>
              </div>
              {authed && currentUserId === post.user.id && (
                <button className={styles.deleteBtn} onClick={handleDeletePost}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </header>

          {/* Main content */}
          {hasBlocks ? (
            <BlockRenderer blocks={post.blocks!} />
          ) : (
            <div className={styles.articleBody}>
              {post.content && <p className={styles.articleParagraph}>{post.content}</p>}
              {post.images && post.images.length > 0 && (
                <div className={styles.legacyImages}>
                  {post.images.map(img => (
                    <figure key={img.id} className={styles.articleFigure}>
                      <img src={img.image_url} alt="" className={styles.articleImage} />
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className={styles.postFooter}>
            <button
              className={`${styles.actionBtn} ${post.is_liked ? styles.liked : ''}`}
              onClick={handleLike}
            >
              <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} />
              <span>{post.likes_count} {t('likes')}</span>
            </button>
            <span className={styles.commentCount}>
              <MessageCircle size={18} />
              <span>{comments.length} {t('comments')}</span>
            </span>
          </div>
        </article>

        {/* Comments */}
        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>
            <MessageCircle size={18} />
            {t('commentsTitle')} ({comments.length})
          </h2>

          {comments.length === 0 && (
            <p className={styles.noComments}>{t('noComments')}</p>
          )}

          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.commentAvatar}>{comment.user.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <span className={styles.commentAuthor}>{comment.user.full_name}</span>
                  <span className={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                </div>
              </div>
              <p className={styles.commentText}>{comment.content}</p>
            </div>
          ))}

          {authed && (
            <div className={styles.commentInput}>
              <input
                type="text"
                placeholder={t('writeComment')}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
              />
              <button onClick={submitComment} disabled={postingComment}>
                {postingComment ? <Loader2 size={14} className={styles.spin} /> : <Send size={15} />}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}