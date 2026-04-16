import Image from 'next/image';
import styles from './AIStyleSection.module.css';

export default function AIStyleSection() {
  return (
    <section className={styles.section} id="tryon">
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Thử Vải Lên Người ảo</h2>
          <p className={styles.description}>
            Tải lên mẫu họa tiết của vải, công nghệ GANs (Generative AI) của chúng tôi sẽ ốp hoàn hảo chất liệu đó lên mô hình 3D, giúp bạn hình dung độ phù hợp trước khi quyết định mua.
          </p>
          
          <div className={styles.uploadBox}>
            <div className={styles.uploadIcon}>
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>Tải lên ảnh mẫu vải</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-medium-gray)' }}>Kéo thả hoặc nhấn để chọn file (JPG, PNG)</p>
          </div>
        </div>
        
        <div className={styles.visual}>
          <Image 
            src="/images/model2.png" 
            alt="Virtual Try-On AI" 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            style={{ objectFit: 'cover', borderRadius: '0 8px 8px 0' }} 
          />
        </div>
      </div>
    </section>
  );
}
