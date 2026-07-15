import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { EditorPage } from './pages/EditorPage';
import { PreviewPage } from './pages/PreviewPage';
import { useCVStore } from './hooks/useCVStore';
import './App.css';

export function App() {
  const store = useCVStore();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/templates', label: 'Templates' },
    { to: '/editor', label: 'Editor' },
    { to: '/preview', label: 'Preview' },
  ];

  return (
    <div className="app">
      <nav className="app-nav" role="navigation" aria-label="Main navigation">
        <Link to="/" className="app-logo">DZB CV</Link>
        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={location.pathname === item.to ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<TemplatesPage store={store} />} />
          <Route path="/editor" element={<EditorPage store={store} />} />
          <Route path="/preview" element={<PreviewPage store={store} />} />
        </Routes>
      </main>
    </div>
  );
}
