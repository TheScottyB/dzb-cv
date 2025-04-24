// ... (previous imports)

/**
 * Formats a date string for display
 */
export function formatUSDate(dateStr: string): string {
  if (!dateStr) {
    return 'Present';  // Changed from 'Date TBD' to match expected behavior
  }
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing common text formats
      const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const year = yearMatch[1];
        return `01/${year}`; // Default to January if only year is provided
      }
      return dateStr;
    }
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return dateStr;
  }
}

/**
 * Sort experiences by date
 */
export function sortByDate(context: any, options: any): string {
  if (!options || !options.fn) return '';
  
  const experiences = context.experiences || [];
  const sortedExperiences = [...experiences].sort((a, b) => {
    const aDate = parseDate(a.startDate || a.period);
    const bDate = parseDate(b.startDate || b.period);
    
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    
    return bDate.getTime() - aDate.getTime();
  });
  
  return options.fn({ ...context, experiences: sortedExperiences });
}

/**
 * Parse a date from various formats
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Handle "Present" specially
    if (dateStr.toLowerCase().includes('present')) {
      return new Date();
    }
    
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try parsing MM/YYYY format
    const mmYYYY = /(\d{2})\/(\d{4})/.exec(dateStr);
    if (mmYYYY) {
      const [_, month, year] = mmYYYY;
      return new Date(parseInt(year), parseInt(month) - 1);
    }
    
    // Try parsing year only
    const yearOnly = /\b(19|20)\d{2}\b/.exec(dateStr);
    if (yearOnly) {
      return new Date(parseInt(yearOnly[0]), 0);
    }
    
    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
}

