"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Tell Capgo the app booted successfully so it doesn't roll back the OTA update
      try {
        CapacitorUpdater.notifyAppReady();
      } catch (e) {
        console.log('CapacitorUpdater not available in this environment');
      }

      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/pos');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f6f0]">
      <div className="w-16 h-16 animate-pulse">
        <img src="/logo.png" alt="ServeWell" className="w-full h-full mix-blend-multiply opacity-50" />
      </div>
    </div>
  );
}
