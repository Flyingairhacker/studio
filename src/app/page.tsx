
import BackgroundScene from '@/components/3d/background-scene';
import ContactSection from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import TechStack from '@/components/sections/tech-stack';
import GamesSection from '@/components/sections/games';
import { getFirebaseAdmin } from '@/lib/firebase/server-app';
import type { GenerateSceneInfoOutput } from '@/ai/flows/generate-scene-info';

async function getBrandingData(): Promise<GenerateSceneInfoOutput> {
  try {
    const { db } = getFirebaseAdmin();
    const brandingDoc = await db.collection('branding').doc('live-branding').get();
    
    if (brandingDoc.exists) {
      const data = brandingDoc.data();
      return {
        weather: data?.weather || 'none',
        terrain: data?.terrain || 'none',
      };
    }
  } catch (error) {
    console.error("Failed to fetch branding data from Firestore:", error);
    // This catch block will handle the missing environment variables error gracefully.
  }
  
  // Return a default if Firestore fails for any reason.
  return { weather: 'none', terrain: 'none' };
}


export default async function Home() {
  const sceneInfo = await getBrandingData();

  return (
    <>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TechStack />
          <Projects />
          <GamesSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
      <BackgroundScene weather={sceneInfo.weather} terrain={sceneInfo.terrain} />
    </>
  );
}
