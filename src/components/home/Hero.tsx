import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageContainer}>
        <Image 
          src="/images/hero.png" 
          alt="Mùa Xuân Vải Tuyết Mưa" 
          fill 
          priority
          style={{ objectFit: 'cover' }} 
        />
        <div className={styles.overlay}></div>
      </div>
      
      <div className={`${styles.content} animate-fade-in`}>
        <h3 className={styles.subtitle}>Bộ Sưu Tập Mùa Xuân</h3>
        <h1 className={styles.title}>Thanh Lịch.<br/>Vải Tuyết Mưa.</h1>
        <p className={styles.description}>
          Khám phá những đặc tính tuyệt vời của Vải Tuyết Mưa trong tiết trời mùa xuân với sự định hướng phong cách từ Trợ lý AI của Fabnivo.
        </p>
        <div className={styles.actionsBox}>
          <button className="btn-primary">Quét Bề Mặt Vải Ngay</button>
          <button className="btn-secondary">Gợi ý thiết kế</button>
        </div>
      </div>
    </section>
  );
}
