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
        <a
          href="https://www.facebook.com/profile.php?id=61590448468345"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerBtn}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
          {t('facebook')}
        </a>
        <button className={styles.footerBtn}>
          <Settings size={15} strokeWidth={1.8} />
          {t('settings')}
        </button>
      </div>
    </footer>
  );
}
