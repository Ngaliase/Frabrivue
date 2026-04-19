import { useTranslations } from 'next-intl';
import { HelpCircle, Settings } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <button className={styles.footerBtn}>
          <HelpCircle size={15} strokeWidth={1.8} />
          {t('help')}
        </button>
        <button className={styles.footerBtn}>
          <Settings size={15} strokeWidth={1.8} />
          {t('settings')}
        </button>
      </div>
    </footer>
  );
}
