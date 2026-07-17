"use client";

import React from 'react';
import { Settings as SettingsIcon, CloudSync, DatabaseBackup, Store, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Settings = () => {
  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-slate-500" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure multi-branch sync, cloud backups, and local database</p>
        </div>
        <Button className="flex items-center gap-2">
          Save Configuration
        </Button>
      </header>

      <div className="flex-1 overflow-auto bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col gap-8">
        
        {/* Multi-Branch Configuration */}
        <section>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Store className="w-5 h-5 text-indigo-500" />
            Multi-Branch Synchronization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Branch ID</label>
              <input type="text" className="w-full bg-background border border-input rounded-md px-4 py-2" defaultValue="BR-NEWYORK-01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">HQ Cloud Endpoint</label>
              <input type="text" className="w-full bg-background border border-input rounded-md px-4 py-2" defaultValue="https://hq.restaurantos.com/api/sync" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Sync Frequency</label>
              <select className="w-full bg-background border border-input rounded-md px-4 py-2">
                <option>Real-time (WebSockets)</option>
                <option>Every 5 Minutes</option>
                <option>Hourly Batch</option>
                <option>End of Day Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cloud Backup & Offline-First */}
        <section>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
            <DatabaseBackup className="w-5 h-5 text-green-500" />
            Data & Cloud Backup
          </h3>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
            <div>
              <p className="font-bold">Offline-First Engine</p>
              <p className="text-sm text-muted-foreground">Store data locally in MongoDB/Prisma and push to cloud automatically.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-bold text-green-500">Active</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <CloudSync className="w-4 h-4" />
              Force Cloud Sync Now
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10">
              Clear Local Cache
            </Button>
          </div>
        </section>

        {/* Licensing & Security */}
        <section>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Enterprise Licensing
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">License Key</label>
              <div className="flex gap-2">
                <input type="password" value="XXXX-XXXX-XXXX-XXXX" readOnly className="flex-1 bg-background border border-input rounded-md px-4 py-2 text-muted-foreground" />
                <Button variant="outline"><Key className="w-4 h-4 mr-2"/> Verify License</Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground p-4 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-600">
              Your Enterprise License is valid until <strong>December 31, 2026</strong>. Hardware integration modules (ESC/POS Printers, Biometrics) are active.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
