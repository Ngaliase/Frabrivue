"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookMarked, Scissors, Info, Sparkles, Droplets } from 'lucide-react';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FabricDetail {
  id: number;
  type: string | null;
  name: string;
  url: string | null;
  meta_description: string | null;
  about_text: string | null;
  tags: string[] | null;
  properties: Record<string, string> | null;
  care_instructions: string | null;
  additional_info: string | null;
}

export default function FabricDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [fabric, setFabric] = useState<FabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/fabrics/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy loại vải này');
        return res.json();
      })
      .then(data => setFabric(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveToMoodboard = async () => {
    const token = localStorage.getItem('fabrivo_token');
    if (!token) {
      alert('Vui lòng đăng nhập để lưu vào bộ sưu tập!');
      router.push('/auth');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moodboards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fabric_id: Number(id) })
      });
      if (!res.ok) throw new Error('Lỗi khi lưu');
      alert('Đã lưu thành công vào Bộ Sưu Tập!');
    } catch {
      alert('Chưa thể lưu, có thể loại vải này đã có trong bộ sưu tập.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <Scissors size={32} className={styles.spinner} />
          <p>Đang tải thông tin vải...</p>
        </div>
      </div>
    );
  }

  if (error || !fabric) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <p>{error}</p>
          <Link href="/" className={styles.backBtn}>Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const propEntries = fabric.properties ? Object.entries(fabric.properties) : [];

  return (
    <div className={styles.page}>
      {/* Sticky Header */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          
          <button 
            className={styles.saveBtn} 
            onClick={handleSaveToMoodboard}
            disabled={saving}
          >
            <BookMarked size={15} /> 
            {saving ? 'Đang lưu...' : 'Lưu vào bộ sưu tập'}
          </button>
        </div>
      </div>

      <div className={`container ${styles.layoutGrid}`}>
        {/* Left Side: Graphic / Thumbnail */}
        <div className={styles.graphicCard}>
          <div className={styles.graphicBox}>
            <div className={styles.graphicPattern} />
            <Scissors size={80} strokeWidth={1} className={styles.graphicIcon} />
          </div>
          <div className={styles.graphicMeta}>
            <span className={styles.graphicType}>
              {fabric.type === 'fiber' ? 'Sợi tự nhiên' : 'Loại vải'}
            </span>
            <span className={styles.graphicId}>ID: {fabric.id}</span>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className={styles.contentArea}>
          <div>
            <h1 className={styles.fabricName}>{fabric.name}</h1>
            {fabric.tags && fabric.tags.length > 0 && (
              <div className={styles.tags} style={{ marginTop: '16px' }}>
                {fabric.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {(fabric.meta_description || fabric.about_text) && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Info size={18} /> Giải thích chuyên sâu
              </h2>
              <p className={styles.descText}>
                {fabric.about_text || fabric.meta_description}
              </p>
            </div>
          )}

          {propEntries.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Sparkles size={18} /> Đặc tính cấu tạo
              </h2>
              <div className={styles.propGrid}>
                {propEntries.map(([key, val]) => (
                  <div key={key} className={styles.propItem}>
                    <span className={styles.propLabel}>{key.replace(/_/g, ' ')}</span>
                    <span className={styles.propValue}>{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fabric.care_instructions && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Droplets size={18} /> Hướng dẫn bảo quản
              </h2>
              <div className={styles.careBox}>
                {fabric.care_instructions}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
