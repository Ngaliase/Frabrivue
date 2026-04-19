import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AIScanner from '@/components/home/AIScanner';

export default function Studio() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AIScanner />
      <Footer />
    </main>
  );
}
