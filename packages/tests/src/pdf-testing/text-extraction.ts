import type { PDFDocument, PDFPage } from 'pdf-lib';

interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SectionContent {
  name: string;
  content: TextBlock[];
  bounds: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export async function extractPDFContent(
  doc: PDFDocument
): Promise<SectionContent[]> {
  // Note: This is a placeholder. In a real implementation,
  // you would use pdf.js or a similar library to extract
  // text content with positioning information
  const sections: SectionContent[] = [];
  
  return sections;
}

export function analyzePDFLayout(sections: SectionContent[]): {
  columnCount: number;
  margins: { top: number; right: number; bottom: number; left: number };
  lineSpacing: number;
} {
  // Analyze layout based on text positions
  const allBounds = sections.map(s => s.bounds);
  
  return {
    columnCount: detectColumns(sections),
    margins: calculateMargins(allBounds),
    lineSpacing: calculateLineSpacing(sections)
  };
}

function detectColumns(sections: SectionContent[]): number {
  // Analyze text block positions to detect column layout
  const blocks = sections.flatMap(s => s.content);
  const xPositions = new Set(blocks.map(b => b.x));
  
  // Simple heuristic: if there are multiple distinct x positions
  // with significant gaps, assume multiple columns
  const sortedX = Array.from(xPositions).sort((a, b) => a - b);
  const gaps = sortedX.slice(1).map((x, i) => x - sortedX[i]);
  const significantGaps = gaps.filter(g => g > 50); // arbitrary threshold
  
  return significantGaps.length + 1;
}

function calculateMargins(bounds: SectionContent['bounds'][]): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const lefts = bounds.map(b => b.left);
  const rights = bounds.map(b => b.right);
  const tops = bounds.map(b => b.top);
  const bottoms = bounds.map(b => b.bottom);

  return {
    left: Math.min(...lefts),
    right: Math.max(...rights),
    top: Math.max(...tops),
    bottom: Math.min(...bottoms)
  };
}

function calculateLineSpacing(sections: SectionContent[]): number {
  const blocks = sections.flatMap(s => s.content);
  const yPositions = blocks.map(b => b.y).sort((a, b) => b - a);
  const spacings = yPositions.slice(1).map((y, i) => y - yPositions[i]);
  
  // Return the most common spacing
  return mode(spacings);
}

function mode(numbers: number[]): number {
  const counts = new Map<number, number>();
  numbers.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
  
  let maxCount = 0;
  let maxValue = numbers[0];
  
  for (const [value, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxValue = value;
    }
  }
  
  return maxValue;
}

export const textMatchers = {
  toHaveSection(sections: SectionContent[], sectionName: string) {
    const section = sections.find(s => s.name.toLowerCase() === sectionName.toLowerCase());
    return {
      pass: !!section,
      message: () => `Expected to find section "${sectionName}"`
    };
  },

  toHaveCorrectLayout(
    sections: SectionContent[],
    expected: { columnCount: number; margins: any; lineSpacing: number }
  ) {
    const layout = analyzePDFLayout(sections);
    const pass = (
      layout.columnCount === expected.columnCount &&
      Math.abs(layout.lineSpacing - expected.lineSpacing) < 1
    );
    
    return {
      pass,
      message: () => 
        `Expected layout to match ${JSON.stringify(expected)}, ` +
        `but got ${JSON.stringify(layout)}`
    };
  }
};

