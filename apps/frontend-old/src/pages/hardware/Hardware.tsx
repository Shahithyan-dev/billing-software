import React, { useState } from 'react';
import { Cpu, Printer, ScanLine, KeySquare, MonitorSpeaker, RefreshCcw, Power } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Hardware {
  id: string;
  name: string;
  type: 'Printer' | 'Scanner' | 'Drawer' | 'Display';
  port: string;
  status: 'Online' | 'Offline' | 'Error';
  icon: any;
}

export const Hardware = () => {
  const [devices, setDevices] = useState<Hardware[]>([
    { id: '1', name: 'Epson TM-T88VI', type: 'Printer', port: 'USB001', status: 'Online', icon: Printer },
    { id: '2', name: 'Kitchen KOT Printer', type: 'Printer', port: '192.168.1.50', status: 'Online', icon: Printer },
    { id: '3', name: 'Honeywell Voyager', type: 'Scanner', port: 'COM3', status: 'Offline', icon: ScanLine },
    { id: '4', name: 'Cash Drawer 1', type: 'Drawer', port: 'RJ11 (via Epson)', status: 'Online', icon: KeySquare },
    { id: '5', name: 'Customer Pole Display', type: 'Display', port: 'COM4', status: 'Online', icon: MonitorSpeaker },
  ]);

  const testDevice = (id: string, name: string) => {
    alert(`Testing connection to ${name} via Electron IPC bridge...`);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Online') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'Offline') return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-500" />
            Hardware Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage local peripherals via Native Electron IPC Hooks</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" />
          Scan for Devices
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => (
          <div key={device.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative group">
            
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(device.status)}`}>
              {device.status}
            </div>

            <div className="p-6 pb-2">
              <div className="bg-muted p-4 rounded-xl w-16 h-16 flex items-center justify-center text-foreground mb-4 group-hover:scale-110 transition-transform">
                <device.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">{device.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Type: {device.type}</p>
              <p className="text-sm text-muted-foreground">Port: {device.port}</p>
            </div>

            <div className="mt-auto p-4 border-t border-border bg-muted/30 grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => testDevice(device.id, device.name)}>
                Test Device
              </Button>
              <Button 
                variant={device.type === 'Drawer' ? 'default' : 'secondary'} 
                size="sm" 
                className="w-full text-xs flex items-center gap-2"
                onClick={() => {
                  if (device.type === 'Drawer') alert('Kicking Cash Drawer via RJ11 port...');
                }}
              >
                <Power className="w-3 h-3" />
                {device.type === 'Drawer' ? 'Kick Drawer' : 'Reconnect'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
