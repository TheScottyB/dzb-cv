import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Create your CV</h1>
        <p className="hero-subtitle">
          Build a professional CV in minutes. Choose a template, fill in your details,
          and download a polished PDF.
        </p>
        <Link to="/templates">
          <button className="btn btn-primary btn-lg">Get Started</button>
        </Link>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Professional Templates</h3>
          <p>Choose from modern and classic designs optimized for ATS systems.</p>
        </div>
        <div className="feature-card">
          <h3>Easy Editor</h3>
          <p>Fill in your experience, education, and skills with an intuitive form.</p>
        </div>
        <div className="feature-card">
          <h3>PDF Download</h3>
          <p>Export your CV as a high-quality PDF ready for applications.</p>
        </div>
      </section>
    </div>
  );
}
