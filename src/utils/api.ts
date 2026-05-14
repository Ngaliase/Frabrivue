import { Post, Comment, LikeResponse, PostBlock } from '@/types/fabric';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('Frabrivue_token');
  }
  return null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('Frabrivue_token');
        window.location.href = '/auth';
      }
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export const usersApi = {
  getMe: () => request<{ id: number; email: string; full_name: string; is_admin: number }>('/api/v1/users/me'),
};

export const postsApi = {
  getFeed: () => request<Post[]>('/api/v1/posts/'),
  getMyPosts: () => request<Post[]>('/api/v1/posts/me'),
  getPost: (id: number) => request<Post>(`/api/v1/posts/${id}`),
  createPost: (data: { content?: string; image_urls?: string[]; blocks?: PostBlock[] }) =>
    request<Post>('/api/v1/posts/', { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id: number) =>
    request<{ message: string }>('/api/v1/posts/' + id, { method: 'DELETE' }),
  toggleLike: (id: number) =>
    request<LikeResponse>('/api/v1/posts/' + id + '/like', { method: 'POST' }),
  getComments: (postId: number) => request<Comment[]>('/api/v1/posts/' + postId + '/comments'),
  addComment: (postId: number, content: string) =>
    request<Comment>('/api/v1/posts/' + postId + '/comments', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (postId: number, commentId: number) =>
    request<{ message: string }>(
      '/api/v1/posts/' + postId + '/comments/' + commentId,
      { method: 'DELETE' }
    ),
};

export const articlesApi = {
  getArticles: (skip = 0, limit = 20) => request<any[]>(`/api/v1/articles/?skip=${skip}&limit=${limit}`),
  getArticle: (id: number) => request<any>(`/api/v1/articles/${id}`),
  crawlArticle: (url: string) => request<{ message: string }>('/api/v1/articles/crawl', {
    method: 'POST',
    body: JSON.stringify({ url })
  })
};

export async function uploadImage(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  return res.json();
}
