import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import AIStyleSection from '@/components/home/AIStyleSection';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <AIStyleSection />
      <Footer />
    </main>
  );
}
