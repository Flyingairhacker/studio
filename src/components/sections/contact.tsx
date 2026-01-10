"use client";

import dynamic from 'next/dynamic'
import { Skeleton } from '../ui/skeleton';

const ContactClient = dynamic(() => import('./contact-client'), {
  loading: () => (
    <section id="contact" className="container mx-auto px-4 py-20 md:px-6 md:py-32">
        <div className="text-center">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="max-w-3xl mx-auto mt-16 p-8">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    </section>
  ),
  ssr: false
})

export default function ContactSection() {
    return <ContactClient />;
}
