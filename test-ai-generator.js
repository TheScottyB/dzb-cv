// Test AI generator directly
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Testing AI Generator...');

try {
  // Import with proper ES module extension
  const { generateAICV } = await import('./src/shared/tools/ai-generator.js');
  console.log('✅ AI Generator imported successfully');

  const options = {
    name: 'Dawn Zurick Beilfuss',
    email: 'DZ4100@gmail.com', 
    output: 'dawn-ai-direct.pdf',
    style: 'professional'
  };

  console.log('🚀 Starting AI CV generation...');
  const result = await generateAICV(options);
  
  if (result.success) {
    console.log('🎉 AI CV generated successfully!');
    console.log('📁 File:', result.filePath);
  } else {
    console.log('❌ AI CV generation failed:', result.error);
  }
  
} catch (error) {
  console.log('💥 AI Generator test failed:', error.message);
  console.log('Stack:', error.stack);
}

console.log('🎯 AI Generator test complete!');
