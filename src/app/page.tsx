import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AIScanner from '@/components/home/AIScanner';
import FabricGrid from '@/components/home/FabricGrid';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AIScanner />
      <FabricGrid />
      <Footer />
    </main>
  );
}
