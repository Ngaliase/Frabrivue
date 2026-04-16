import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>FABNIVO</Link>
          <p className={styles.description}>
            Nền tảng công nghệ thời trang tích hợp AI hàng đầu, mang đến cho bạn thông tin chính xác về các loại vải, gợi ý phong cách, và đo lường bền vững.
          </p>
          <div className={styles.newsletter}>
            <p>Đăng ký nhận bản tin</p>
            <form>
              <input type="email" placeholder="Email của bạn" />
              <button type="button">Đăng ký</button>
            </form>
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Tính năng</h4>
          <a href="#identify">Nhận Diện Vải</a>
          <a href="#stylist">Trợ Lý Stylist</a>
          <a href="#calculator">Đo Số Lượng Vải</a>
          <a href="#eco">Thang Điểm Eco</a>
          <a href="#tryon">Thử Đồ Ảo (GANs)</a>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Hỗ trợ</h4>
          <Link href="/faq">Câu hỏi thường gặp</Link>
          <Link href="/privacy">Bảo mật thông tin</Link>
          <Link href="/terms">Điều khoản sử dụng</Link>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Fabnivo. All rights reserved.</p>
        <p>Việt Nam</p>
      </div>
    </footer>
  );
}
