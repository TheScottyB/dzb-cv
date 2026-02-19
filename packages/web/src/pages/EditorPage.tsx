import React, { useState } from 'react';
import type { useCVStore } from '../hooks/useCVStore';
import './EditorPage.css';

interface Props {
  store: ReturnType<typeof useCVStore>;
}

export function EditorPage({ store }: Props) {
  const { cvData, updatePersonalInfo, saved, markSaved } = store;
  const [showSaveMsg, setShowSaveMsg] = useState(false);

  function handleSave() {
    markSaved();
    setShowSaveMsg(true);
    setTimeout(() => setShowSaveMsg(false), 2000);
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>CV Editor</h1>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>

      {showSaveMsg && <div className="save-message">Information saved</div>}

      {/* Personal Information */}
      <section className="editor-section">
        <h2>Personal Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={cvData.personalInfo.name.full}
              onChange={e => updatePersonalInfo('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={cvData.personalInfo.contact.email}
              onChange={e => updatePersonalInfo('email', e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={cvData.personalInfo.contact.phone}
              onChange={e => updatePersonalInfo('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              value={cvData.personalInfo.contact.address || ''}
              onChange={e => updatePersonalInfo('address', e.target.value)}
              placeholder="City, State"
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="professionalTitle">Professional Title</label>
            <input
              id="professionalTitle"
              type="text"
              value={cvData.personalInfo.professionalTitle || ''}
              onChange={e => updatePersonalInfo('professionalTitle', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              rows={3}
              value={cvData.personalInfo.summary || ''}
              onChange={e => updatePersonalInfo('summary', e.target.value)}
              placeholder="Brief professional summary..."
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="editor-section">
        <div className="section-header">
          <h2>Experience</h2>
          <button className="btn btn-sm" onClick={store.addExperience}>+ Add Experience</button>
        </div>
        {cvData.experience.map((exp, i) => (
          <div key={i} className="entry-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Position</label>
                <input
                  value={exp.position}
                  onChange={e => store.updateExperience(i, { ...exp, position: e.target.value })}
                  placeholder="Job title"
                />
              </div>
              <div className="form-group">
                <label>Employer</label>
                <input
                  value={exp.employer}
                  onChange={e => store.updateExperience(i, { ...exp, employer: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  value={exp.startDate}
                  onChange={e => store.updateExperience(i, { ...exp, startDate: e.target.value })}
                  placeholder="2020-01"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  value={exp.endDate || ''}
                  onChange={e => store.updateExperience(i, { ...exp, endDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
              <div className="form-group full-width">
                <label>Responsibilities (one per line)</label>
                <textarea
                  rows={3}
                  value={exp.responsibilities.join('\n')}
                  onChange={e => store.updateExperience(i, {
                    ...exp,
                    responsibilities: e.target.value.split('\n').filter(r => r.trim()),
                  })}
                  placeholder="Led development of..."
                />
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => store.removeExperience(i)}>
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="editor-section">
        <div className="section-header">
          <h2>Education</h2>
          <button className="btn btn-sm" onClick={store.addEducation}>+ Add Education</button>
        </div>
        {cvData.education.map((edu, i) => (
          <div key={i} className="entry-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Degree</label>
                <input
                  value={edu.degree}
                  onChange={e => store.updateEducation(i, { ...edu, degree: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  value={edu.field || ''}
                  onChange={e => store.updateEducation(i, { ...edu, field: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  value={edu.institution}
                  onChange={e => store.updateEducation(i, { ...edu, institution: e.target.value })}
                  placeholder="University name"
                />
              </div>
              <div className="form-group">
                <label>Graduation Date</label>
                <input
                  value={edu.graduationDate || ''}
                  onChange={e => store.updateEducation(i, { ...edu, graduationDate: e.target.value })}
                  placeholder="2020"
                />
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => store.removeEducation(i)}>
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="editor-section">
        <div className="section-header">
          <h2>Skills</h2>
          <button className="btn btn-sm" onClick={store.addSkill}>Add Skill</button>
        </div>
        {cvData.skills.map((skill, i) => (
          <div key={i} className="skill-row">
            <input
              value={skill.name}
              onChange={e => store.updateSkill(i, { ...skill, name: e.target.value })}
              placeholder="e.g., JavaScript"
              className="skill-input"
            />
            <select
              aria-label="Skill Level"
              value={skill.level || 'intermediate'}
              onChange={e => store.updateSkill(i, { ...skill, level: e.target.value })}
              className="skill-level"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button className="btn btn-danger btn-sm" onClick={() => store.removeSkill(i)}>
              Remove
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
