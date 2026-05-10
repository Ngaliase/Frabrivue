"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ImagePlus, Heart, MessageCircle, Send, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import styles from './page.module.css';
import { Post, Comment, UserSummary } from '@/types/fabric';
import { postsApi } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getCurrentUserId(): number | null {
  try {
    const token = localStorage.getItem('fabrivo_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ? parseInt(payload.sub) : null;
  } catch {
    return null;
  }
}

export default function FeedPage() {
  const t = useTranslations('FeedPage');
  const locale = useLocale();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('fabrivo_token');
    if (!token) { router.push('/auth'); return false; }
    return true;
  }, [router]);

  useEffect(() => {
    if (!checkAuth()) return;
    setAuthed(true);
    setCurrentUserId(getCurrentUserId());
    postsApi.getFeed()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checkAuth]);

  useGSAP(() => {
    if (!loading && posts.length > 0 && feedRef.current) {
      gsap.fromTo(
        feedRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.2)' }
      );
    }
  }, { scope: containerRef, dependencies: [loading, posts] });

  const handlePost = async () => {
    if (!newContent.trim() && newImages.length === 0) return;
    setPosting(true);
    try {
      const post = await postsApi.createPost({ content: newContent, image_urls: newImages });
      setPosts(prev => [post, ...prev]);
      setNewContent('');
      setNewImages([]);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    const result = await postsApi.toggleLike(postId);
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: result.liked, likes_count: result.likes_count }
        : p
    ));
  };

  const handleDelete = async (postId: number) => {
    await postsApi.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    await postsApi.deleteComment(postId, commentId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('justNow');
    if (mins < 60) return t('minutesAgo', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('hoursAgo', { n: hours });
    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US');
  };

  return (
    <div className={styles.page} ref={containerRef}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
          <Link href="/" className={styles.backBtn}><ArrowLeft size={16} /> {t('home')}</Link>
          <div className={styles.pageTitle}>
            <MessageCircle size={20} strokeWidth={1.8} />
            <h1>{t('feedTitle')}</h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
        {/* Create Post Form */}
        {authed && (
          <div className={styles.createCard}>
            <textarea
              className={styles.postInput}
              placeholder={t('placeholder')}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
            />
            {newImages.length > 0 && (
              <div className={styles.imagePreviewRow}>
                {newImages.map((url, i) => (
                  <div key={i} className={styles.imgThumb}>
                    <img src={url} alt="" />
                    <button
                      className={styles.removeImgBtn}
                      onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                    >x</button>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.postActions}>
              <label className={styles.attachBtn} title={t('addImages')}>
                <ImagePlus size={16} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    const urls = files.map(f => URL.createObjectURL(f));
                    setNewImages(prev => [...prev, ...urls]);
                  }}
                />
              </label>
              <button
                className={styles.postBtn}
                onClick={handlePost}
                disabled={posting || (!newContent.trim() && newImages.length === 0)}
              >
                {posting ? <Loader2 size={14} className={styles.spin} /> : <Send size={14} />}
                {posting ? t('posting') : t('post')}
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className={styles.feed}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.postSkeleton} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyFeed}>
            <MessageCircle size={40} strokeWidth={1.2} />
            <p>{t('emptyFeed')}</p>
          </div>
        ) : (
          <div className={styles.feed} ref={feedRef}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                locale={locale}
                authed={authed}
                currentUserId={currentUserId}
                onLike={handleLike}
                onDelete={handleDelete}
                onDeleteComment={handleDeleteComment}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, locale, authed, currentUserId, onLike, onDelete, onDeleteComment, formatDate, t }: {
  post: Post;
  locale: string;
  authed: boolean;
  currentUserId: number | null;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteComment: (postId: number, commentId: number) => void;
  formatDate: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const data = await postsApi.getComments(post.id);
        setComments(data);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(v => !v);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const comment = await postsApi.addComment(post.id, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className={styles.postCard}>
      {/* Header */}
      <div className={styles.postHeader}>
        <Link href={`/posts/${post.id}`} className={styles.avatar}>
          {post.user.full_name.charAt(0).toUpperCase()}
        </Link>
        <div className={styles.meta}>
          <Link href={`/posts/${post.id}`} className={styles.userName}>{post.user.full_name}</Link>
          <span className={styles.postTime}>{formatDate(post.created_at)}</span>
        </div>
        {authed && currentUserId === post.user.id && (
          <button className={styles.deleteBtn} onClick={() => onDelete(post.id)}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && <p className={styles.postContent}>{post.content}</p>}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`${styles.imageGrid} ${styles[`imgGrid${Math.min(post.images.length, 4)}`]}`}>
          {post.images.map(img => (
            <Link key={img.id} href={`/posts/${post.id}`}>
              <img src={img.image_url} alt="" className={styles.postImg} />
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.postFooter}>
        <button
          className={`${styles.actionBtn} ${post.is_liked ? styles.liked : ''}`}
          onClick={() => onLike(post.id)}
        >
          <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
          <span>{post.likes_count > 0 ? post.likes_count : ''} {t('likes')}</span>
        </button>
        <button className={styles.actionBtn} onClick={toggleComments}>
          <MessageCircle size={16} />
          <span>{post.comments_count > 0 ? post.comments_count : ''} {t('comments')}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={styles.commentsSection}>
          {loadingComments ? (
            <div className={styles.loadingComments}><Loader2 size={14} className={styles.spin} /></div>
          ) : (
            <>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <span className={styles.commentAuthor}>{comment.user.full_name}</span>
                  <p className={styles.commentText}>{comment.content}</p>
                  {authed && currentUserId === comment.user.id && (
                    <button
                      className={styles.deleteCommentBtn}
                      onClick={() => onDeleteComment(post.id, comment.id)}
                    >x</button>
                  )}
                </div>
              ))}
            </>
          )}
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
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}