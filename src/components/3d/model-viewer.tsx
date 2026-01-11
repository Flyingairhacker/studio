"use client";

import { Suspense } from "react";

export default function ModelViewer({ modelUrl }: { modelUrl: string }) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full border border-dashed border-foreground/20 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground font-code">[ No Sketchfab Embed URL Provided ]</p>
      </div>
    );
  }

  // Ensure the URL has the necessary embed parameters
  const url = new URL(modelUrl);
  url.searchParams.set('autostart', '1');
  url.searchParams.set('ui_infos', '0');
  url.searchParams.set('ui_controls', '0');
  url.searchParams.set('ui_stop', '0');
  url.searchParams.set('ui_watermark', '0');
  url.searchParams.set('ui_hint', '0');
  url.searchParams.set('camera', '0');
  url.searchParams.set('transparent', '1');


  return (
    <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
       <iframe
          title="Sketchfab Model"
          src={url.toString()}
          allow="autoplay; fullscreen; vr"
          allowFullScreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          className="w-full h-full border-0 rounded-md"
        />
    </Suspense>
  );
}
