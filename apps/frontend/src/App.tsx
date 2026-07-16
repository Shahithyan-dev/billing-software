import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { MainLayout } from './layouts/MainLayout';

import { POS } from './pages/pos/POS';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { Kitchen } from './pages/kitchen/Kitchen';
import { Dashboard } from './pages/dashboard/Dashboard';

import { Loyalty } from './pages/loyalty/Loyalty';
import { Hardware } from './pages/hardware/Hardware';
import { Staff } from './pages/staff/Staff';
import { Inventory } from './pages/inventory/Inventory';
import { Reservations } from './pages/reservations/Reservations';
import { Security } from './pages/security/Security';
import { Settings } from './pages/settings/Settings';

// Placeholder Pages
const NotFound = () => <div className="p-4"><h1 className="text-2xl font-bold text-destructive">404 - Not Found</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="hardware" element={<Hardware />} />
          <Route path="staff" element={<Staff />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
