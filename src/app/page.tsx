import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FabricGrid from '@/components/home/FabricGrid';
import FeedSection from '@/components/home/FeedSection';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header transparent={true} />
      <Hero />
      <FeedSection />
      <div id="fabric-grid-section">
        <FabricGrid />
      </div>
      <Footer />
    </main>
  );
}
