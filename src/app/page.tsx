
import { generateSceneInfo, type GenerateSceneInfoOutput } from '@/ai/flows/generate-scene-info';
import BackgroundScene from '@/components/3d/background-scene';
import ContactSection from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import TechStack from '@/components/sections/tech-stack';
import GamesSection from '@/components/sections/games';

export default async function Home() {
  let sceneInfo: GenerateSceneInfoOutput = { weather: 'none', terrain: 'none' };
  try {
    // Generate a scene based on a generic prompt to get variety on each load.
    sceneInfo = await generateSceneInfo({ location: "the current location" });
  } catch (e) {
    console.error("Failed to generate scene info, using default.", e);
  }

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
