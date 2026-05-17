import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('.sidebar-desktop');
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    });

    const sidebar = document.querySelector('.sidebar-desktop');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
      setSidebarWidth(sidebar.offsetWidth);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          minHeight: '100vh',
          padding: '24px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 76px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
