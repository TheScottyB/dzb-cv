import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { useCVStore } from '../hooks/useCVStore';
import './TemplatesPage.css';

interface Props {
  store: ReturnType<typeof useCVStore>;
}

const templates = [
  {
    id: 'modern' as const,
    name: 'Modern',
    description: 'Clean two-column layout with professional styling and skill categories.',
    preview: 'Two-column grid layout',
  },
  {
    id: 'basic' as const,
    name: 'Basic',
    description: 'Classic single-column Markdown template, great for ATS systems.',
    preview: 'Simple single-column layout',
  },
];

export function TemplatesPage({ store }: Props) {
  const navigate = useNavigate();

  function selectTemplate(id: 'modern' | 'basic') {
    store.setTemplate(id);
    navigate('/editor');
  }

  return (
    <div className="templates-page">
      <h1>Choose a Template</h1>
      <p className="templates-subtitle">Select a template to get started with your CV.</p>

      <div className="template-grid">
        {templates.map(t => (
          <button
            key={t.id}
            className={`template-card${store.template === t.id ? ' selected' : ''}`}
            onClick={() => selectTemplate(t.id)}
          >
            <div className="template-preview">{t.preview}</div>
            <h3>{t.name}</h3>
            <p>{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
