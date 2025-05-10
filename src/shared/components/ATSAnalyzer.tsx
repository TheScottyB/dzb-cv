// @ts-ignore
import React from 'react';
import type { ATSAnalysisResult } from '../../ats/scoring';
// @ts-ignore
import styles from './ATSAnalyzer.module.css';

interface ATSAnalyzerProps {
  analysisResult: ATSAnalysisResult;
  jobDescription?: string;
}

// Utility function to get color based on issue category
const getIssueColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'critical':
      return '#dc3545'; // Red
    case 'high':
      return '#fd7e14'; // Orange
    case 'medium':
      return '#ffc107'; // Yellow
    case 'low':
      return '#28a745'; // Green
    default:
      return '#6c757d'; // Gray
  }
};

// Utility function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#28a745'; // Green
  if (score >= 70) return '#ffc107'; // Yellow
  if (score >= 50) return '#fd7e14'; // Orange
  return '#dc3545'; // Red
};

export const ATSAnalyzer: React.FC<ATSAnalyzerProps> = ({ analysisResult, jobDescription }) => {
  return (
    <div className={styles['ats-analyzer']}>
      {analysisResult.issues.length > 0 && (
        <section className={styles['ats-issues-section']}>
          <h3>Detected Issues</h3>
          <ul className={styles['ats-issues-list']}>
            {analysisResult.issues.map((issue, index) => (
              <li
                key={`issue-${index}`}
                className={styles['ats-issue-item']}
                style={{ borderLeft: `4px solid ${getIssueColor(issue.category)}` }}
              >
                <div className={styles['issue-category']}>{issue.category}</div>
                <div className={styles['issue-message']}>{issue.message}</div>
                <div className={styles['issue-fix']}>
                  <strong>Fix:</strong> {issue.fix}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {jobDescription && (
        <section className={styles['ats-keywords-section']}>
          <h3>Keyword Analysis</h3>
          <div className={styles['keyword-relevance']}>
            Relevance Score: {analysisResult.keywords.relevanceScore}%
          </div>

          {analysisResult.keywords.found.length > 0 && (
            <div className={styles['keywords-found']}>
              <h4>Keywords Found</h4>
              <div className={styles['keyword-tags']}>
                {analysisResult.keywords.found.map((keyword, index) => (
                  <span
                    key={`found-${index}`}
                    className={`${styles['keyword-tag']} ${styles['found']}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysisResult.keywords.missing.length > 0 && (
            <div className={styles['keywords-missing']}>
              <h4>Missing Keywords</h4>
              <div className={styles['keyword-tags']}>
                {analysisResult.keywords.missing.map((keyword, index) => (
                  <span
                    key={`missing-${index}`}
                    className={`${styles['keyword-tag']} ${styles['missing']}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className={styles['ats-section-scores']}>
        <h3>Section Scores</h3>
        <div className={styles['section-scores-container']}>
          {Object.entries(analysisResult.sectionScores).map(([section, score]) => (
            <div key={section} className={styles['section-score-item']}>
              <div className={styles['section-name']}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </div>
              <div
                className={styles['section-score']}
                style={{ color: getScoreColor(score as number) }}
              >
                {score}/100
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['ats-improvements-section']}>
        <h3>Improvement Suggestions</h3>
        <ul className={styles['ats-improvements-list']}>
          {analysisResult.improvements
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority ?? 'low'] - priorityOrder[b.priority ?? 'low'];
            })
            .map((improvement, index) => (
              <li
                key={`improvement-${index}`}
                className={`${styles['ats-improvement-item']} ${styles[`priority-${improvement.priority}`]}`}
              >
                <div className={styles['improvement-priority']}>{improvement.priority}</div>
                <div className={styles['improvement-message']}>{improvement.message}</div>
                <div className={styles['improvement-fix']}>
                  <strong>Fix:</strong> {improvement.fix}
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
};

export default ATSAnalyzer;
