"use client";

import React, { useState, useEffect } from 'react';
import PharmacyPOS from './PharmacyPOS';
import StandardPOS from './StandardPOS';

export default function POSRouter() {
  const [businessType, setBusinessType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyncobill_restaurant_details');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBusinessType(parsed.businessType);
      }
    }
  }, []);

  if (businessType === null) {
    return <div className="h-full flex items-center justify-center">Loading POS...</div>;
  }

  if (businessType === 'pharmacy') {
    return <PharmacyPOS />;
  }

  return <StandardPOS />;
}
