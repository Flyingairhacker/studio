
'use client';

import { useState } from 'react';
import type { GenerateSceneInfoOutput } from '@/ai/flows/generate-scene-info';
import BackgroundScene from '@/components/3d/background-scene';
import ContactSection from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import TechStack from '@/components/sections/tech-stack';
import GamesSection from '@/components/sections/games';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import SceneControl from '@/components/3d/scene-control';

export default function Home() {
  const [sceneInfo, setSceneInfo] = useState<GenerateSceneInfoOutput>({ weather: 'none', terrain: 'none' });

  return (
    <>
      <FirebaseClientProvider>
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
        <SceneControl onSceneInfoChange={setSceneInfo} />
        <BackgroundScene weather={sceneInfo.weather} terrain={sceneInfo.terrain} />
      </FirebaseClientProvider>
    </>
  );
}
