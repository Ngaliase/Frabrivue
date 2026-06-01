"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, MessageCircle, Send, Trash2, ArrowLeft, Loader2, PenSquare, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import styles from './page.module.css';
import { Post, Comment, PostBlock } from '@/types/fabric';
import { postsApi, usersApi } from '@/utils/api';
import BlockEditor from '@/components/layout/BlockEditor';

function getCurrentUserId(): number | null {
  try {
    const token = localStorage.getItem('Fabrivue_token');
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorBlocks, setEditorBlocks] = useState<PostBlock[]>([]);
  const [posting, setPosting] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('Fabrivue_token');
    if (!token) { router.push('/auth'); return false; }
    return true;
  }, [router]);

  useEffect(() => {
    if (!checkAuth()) return;
    setAuthed(true);
    setCurrentUserId(getCurrentUserId());
    usersApi.getMe().then(user => setIsAdmin(!!user.is_admin)).catch(() => { });
    postsApi.getFeed()
      .then(setPosts)
      .catch(() => { })
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
    const validBlocks = editorBlocks.filter(b =>
      (b.type === 'text' && b.content?.trim()) || (b.type === 'image' && b.url && !b.url.startsWith('blob:'))
    );
    if (validBlocks.length === 0) return;
    setPosting(true);
    try {
      const post = await postsApi.createPost({ blocks: validBlocks });
      setPosts(prev => [post, ...prev]);
      setEditorBlocks([]);
      setShowEditor(false);
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
          {authed && isAdmin && (
            <button
              className={styles.newPostBtn}
              onClick={() => setShowEditor(v => !v)}
            >
              {showEditor ? <X size={15} /> : <PenSquare size={15} />}
              {showEditor ? 'Huỷ' : 'Bài viết mới'}
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Block Editor (Admin) */}
        {authed && isAdmin && showEditor && (
          <div className={styles.createCard}>
            <div className={styles.createHeader}>
              <PenSquare size={18} />
              <span>Soạn bài viết</span>
            </div>
            <BlockEditor
              blocks={editorBlocks}
              onChange={setEditorBlocks}
              disabled={posting}
            />
            <div className={styles.postActions}>
              <span className={styles.blockCount}>{editorBlocks.length} blocks</span>
              <button
                className={styles.postBtn}
                onClick={handlePost}
                disabled={posting || editorBlocks.filter(b =>
                  (b.type === 'text' && b.content?.trim()) || (b.type === 'image' && b.url && !b.url.startsWith('blob:'))
                ).length === 0 || editorBlocks.some(b => b.type === 'image' && b.url?.startsWith('blob:'))}
              >
                {posting ? <Loader2 size={14} className={styles.spin} /> : <Send size={14} />}
                {posting ? t('posting') : t('post')}
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className={styles.feedGrid}>
            <div className={styles.centerColumn}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.postSkeleton} />
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyFeed}>
            <MessageCircle size={40} strokeWidth={1.2} />
            <p>{t('emptyFeed')}</p>
          </div>
        ) : (
          <div className={styles.feedGrid} ref={feedRef}>
            <div className={styles.leftColumn}>
              {posts.slice(1, 3).map(post => (
                <PostCard
                  key={post.id} post={post} locale={locale} authed={authed} currentUserId={currentUserId}
                  onLike={handleLike} onDelete={handleDelete} formatDate={formatDate} t={t} variant="side"
                />
              ))}
            </div>
            <div className={styles.centerColumn}>
              {posts.slice(0, 1).map(post => (
                <PostCard
                  key={post.id} post={post} locale={locale} authed={authed} currentUserId={currentUserId}
                  onLike={handleLike} onDelete={handleDelete} formatDate={formatDate} t={t} variant="main"
                />
              ))}
              {posts.slice(7).map(post => (
                <PostCard
                  key={post.id} post={post} locale={locale} authed={authed} currentUserId={currentUserId}
                  onLike={handleLike} onDelete={handleDelete} formatDate={formatDate} t={t} variant="side"
                />
              ))}
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.rightColumnHeader}>Nổi Bật</div>
              {posts.slice(3, 7).map(post => (
                <PostCard
                  key={post.id} post={post} locale={locale} authed={authed} currentUserId={currentUserId}
                  onLike={handleLike} onDelete={handleDelete} formatDate={formatDate} t={t} variant="list"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Block Renderer ─────────────────────────────────────────────────────────────
function BlockRenderer({ blocks, preview, variant }: { blocks: PostBlock[]; preview?: boolean; variant?: 'main' | 'side' | 'list' }) {
  if (variant === 'list') {
    const textBlock = blocks.find(b => b.type === 'text');
    const imgBlock = blocks.find(b => b.type === 'image' && b.url);
    return (
      <div className={styles.listVariantBlocks}>
        <div className={styles.listTextWrap}>
          {textBlock && <p className={styles.previewText}>{textBlock.content}</p>}
        </div>
        {imgBlock && (
          <figure className={styles.previewFigure}>
            <img src={imgBlock.url} alt={imgBlock.caption || ''} className={styles.previewImg} />
          </figure>
        )}
      </div>
    );
  }

  return (
    <div className={preview ? styles.previewBlocks : styles.articleBlocks}>
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <p key={i} className={preview ? styles.previewText : styles.articleText}>
              {block.content}
            </p>
          );
        }
        if (block.type === 'image' && block.url) {
          return (
            <figure key={i} className={preview ? styles.previewFigure : styles.articleFigure}>
              <img src={block.url} alt={block.caption || ''} className={preview ? styles.previewImg : styles.articleImg} />
              {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, locale, authed, currentUserId, onLike, onDelete, formatDate, t, variant = 'side' }: {
  post: Post;
  locale: string;
  authed: boolean;
  currentUserId: number | null;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  formatDate: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
  variant?: 'main' | 'side' | 'list';
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const hasBlocks = post.blocks && post.blocks.length > 0;

  // For preview: show first text + first image only
  const previewBlocks = hasBlocks ? post.blocks!.slice(0, 3) : null;

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

  const cardClassName = `${styles.postCard} ${variant === 'main' ? styles.postCardMain : variant === 'list' ? styles.postCardList : ''}`;

  return (
    <article className={cardClassName}>
      {/* Header */}
      {variant !== 'list' && (
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
      )}

      {/* Article Preview */}
      <Link href={`/posts/${post.id}`} className={styles.articleLink}>
        {hasBlocks ? (
          <BlockRenderer blocks={previewBlocks!} preview variant={variant} />
        ) : (
          <div className={variant === 'list' ? styles.listVariantBlocks : ''}>
            <div className={variant === 'list' ? styles.listTextWrap : ''}>
              {post.content && <p className={styles.previewText}>{post.content}</p>}
            </div>
            {post.images && post.images.length > 0 && (
              <div className={`${styles.imageGrid} ${styles[`imgGrid${Math.min(post.images.length, 4)}`]}`}>
                {variant === 'list' ? (
                  <img src={post.images[0].image_url} alt="" className={styles.previewImg} style={{ width: 90, height: 90, objectFit: 'cover' }} />
                ) : (
                  post.images.map(img => (
                    <img key={img.id} src={img.image_url} alt="" className={styles.postImg} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {hasBlocks && post.blocks!.length > 3 && variant !== 'list' && (
          <span className={styles.readMore}>Đọc thêm →</span>
        )}
      </Link>

      {/* Footer */}
      {variant !== 'list' && (
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
      )}

      {/* Comments */}
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
    </article>
  );
}