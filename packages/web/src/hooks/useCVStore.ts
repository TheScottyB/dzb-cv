import { useState, useCallback } from 'react';
import type { CVData, Experience, Education, Skill } from '@dzb-cv/types';

const emptyCVData: CVData = {
  personalInfo: {
    name: { first: '', last: '', full: '' },
    contact: { email: '', phone: '' },
  },
  experience: [],
  education: [],
  skills: [],
};

export type TemplateName = 'basic' | 'modern';

interface CVStore {
  cvData: CVData;
  template: TemplateName;
  saved: boolean;
  setTemplate: (t: TemplateName) => void;
  updatePersonalInfo: (field: string, value: string) => void;
  addExperience: () => void;
  updateExperience: (index: number, exp: Experience) => void;
  removeExperience: (index: number) => void;
  addEducation: () => void;
  updateEducation: (index: number, edu: Education) => void;
  removeEducation: (index: number) => void;
  addSkill: () => void;
  updateSkill: (index: number, skill: Skill) => void;
  removeSkill: (index: number) => void;
  markSaved: () => void;
}

export function useCVStore(): CVStore {
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<TemplateName>('modern');
  const [saved, setSaved] = useState(false);

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setSaved(false);
    setCvData(prev => {
      const next = { ...prev, personalInfo: { ...prev.personalInfo } };
      switch (field) {
        case 'fullName': {
          const parts = value.split(' ');
          const first = parts[0] || '';
          const last = parts.slice(1).join(' ') || '';
          next.personalInfo.name = { first, last, full: value };
          break;
        }
        case 'email':
          next.personalInfo.contact = { ...next.personalInfo.contact, email: value };
          break;
        case 'phone':
          next.personalInfo.contact = { ...next.personalInfo.contact, phone: value };
          break;
        case 'address':
          next.personalInfo.contact = { ...next.personalInfo.contact, address: value };
          break;
        case 'professionalTitle':
          next.personalInfo.professionalTitle = value;
          break;
        case 'summary':
          next.personalInfo.summary = value;
          break;
      }
      return next;
    });
  }, []);

  const addExperience = useCallback(() => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        position: '',
        employer: '',
        startDate: '',
        responsibilities: [],
      }],
    }));
  }, []);

  const updateExperience = useCallback((index: number, exp: Experience) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map((e, i) => i === index ? exp : e),
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
      }],
    }));
  }, []);

  const updateEducation = useCallback((index: number, edu: Education) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((e, i) => i === index ? edu : e),
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const addSkill = useCallback(() => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'intermediate' }],
    }));
  }, []);

  const updateSkill = useCallback((index: number, skill: Skill) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => i === index ? skill : s),
    }));
  }, []);

  const removeSkill = useCallback((index: number) => {
    setSaved(false);
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const markSaved = useCallback(() => setSaved(true), []);

  return {
    cvData, template, saved,
    setTemplate, updatePersonalInfo,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addSkill, updateSkill, removeSkill,
    markSaved,
  };
}
