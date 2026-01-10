import BackgroundScene from '@/components/3d/background-scene';
import ContactSection from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import TechStack from '@/components/sections/tech-stack';

export default function Home() {
  return (
    <>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TechStack />
          <Projects />
          <ContactSection />
        </main>
        <Footer />
      </div>
      <BackgroundScene />
    </>
  );
}
