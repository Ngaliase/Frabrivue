import { HelpCircle, Settings } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <button className={styles.footerBtn}>
          <HelpCircle size={15} strokeWidth={1.8} />
          Trợ giúp
        </button>
        <button className={styles.footerBtn}>
          <Settings size={15} strokeWidth={1.8} />
          Cài đặt
        </button>
      </div>
    </footer>
  );
}
