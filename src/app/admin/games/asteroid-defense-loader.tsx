
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AsteroidDefense = dynamic(() => import('./asteroid-defense'), {
  loading: () => <Skeleton className="h-[460px] w-full max-w-sm mx-auto" />,
  ssr: false,
});

export default function AsteroidDefenseLoader() {
    return <AsteroidDefense />;
}
