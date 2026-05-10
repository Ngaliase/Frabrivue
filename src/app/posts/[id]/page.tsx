"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './page.module.css';
import { Post, Comment } from '@/types/fabric';
import { postsApi } from '@/utils/api';

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
    const token = localStorage.getItem('fabrivo_token');
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
      gsap.fromTo(`.${styles.postCard}`,
        { y: 20, opacity: 0 },
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  return (
    <div className={styles.page} ref={containerRef}>
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className={styles.pageTitle}>
            <MessageCircle size={20} strokeWidth={1.8} />
            <h1>{t('postTitle')}</h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
        {/* Post */}
        <div className={styles.postCard}>
          <div className={styles.postHeader}>
            <div className={styles.avatar}>
              {post.user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.meta}>
              <span className={styles.userName}>{post.user.full_name}</span>
              <span className={styles.postTime}>{formatDate(post.created_at)}</span>
            </div>
            {authed && currentUserId === post.user.id && (
              <button className={styles.deleteBtn} onClick={handleDeletePost}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {post.content && <p className={styles.postContent}>{post.content}</p>}

          {post.images && post.images.length > 0 && (
            <div className={`${styles.imageGrid} ${styles[`imgGrid${Math.min(post.images.length, 4)}`]}`}>
              {post.images.map(img => (
                <img key={img.id} src={img.image_url} alt="" className={styles.postImg} />
              ))}
            </div>
          )}

          <div className={styles.postFooter}>
            <button
              className={`${styles.actionBtn} ${post.is_liked ? styles.liked : ''}`}
              onClick={handleLike}
            >
              <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
              <span>{post.likes_count} {t('likes')}</span>
            </button>
            <span className={styles.commentCount}>
              <MessageCircle size={16} />
              <span>{comments.length} {t('comments')}</span>
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>{t('commentsTitle')}</h2>
          {comments.length === 0 && <p className={styles.noComments}>{t('noComments')}</p>}
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.commentAvatar}>{comment.user.full_name.charAt(0).toUpperCase()}</div>
                <span className={styles.commentAuthor}>{comment.user.full_name}</span>
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
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}