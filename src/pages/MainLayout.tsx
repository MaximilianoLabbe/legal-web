import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-0 lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

MainLayout.displayName = 'MainLayout';
