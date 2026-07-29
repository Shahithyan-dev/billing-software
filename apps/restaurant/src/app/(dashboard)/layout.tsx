"use client";

import React, { useEffect, useState } from 'react';
import RestaurantLayout from '@/components/RestaurantLayout';
import RetailLayout from '@/components/RetailLayout';

export default function UnifiedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [businessType, setBusinessType] = useState<'restaurant' | 'dress' | null>(null);

  useEffect(() => {
    // Attempt to read the business type from the normalized tenant data we save in localStorage
    const stored = localStorage.getItem('zyncobill_restaurant_details');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const features = localStorage.getItem('zyncobill_sidebar');
        // A simple heuristic to detect retail vs restaurant based on their sidebar features
        if (features && features.includes('Items') && features.includes('Parties')) {
          setBusinessType('dress');
        } else {
          setBusinessType('restaurant');
        }
      } catch (e) {
        setBusinessType('restaurant');
      }
    } else {
      // Fallback
      setBusinessType('restaurant');
    }
  }, []);

  if (!businessType) {
    return <div className="h-screen flex items-center justify-center bg-[#f8fafc] text-[#1e3a8a] font-bold text-xl">Loading Workspace...</div>;
  }

  if (businessType === 'dress') {
    return <RetailLayout>{children}</RetailLayout>;
  }

  return <RestaurantLayout>{children}</RestaurantLayout>;
}
