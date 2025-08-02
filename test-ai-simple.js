// Simple test to check if AI system works
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Testing AI System Components...');

// Test 1: Check if AgentMessageBus exists
try {
  const messageBusPath = path.join(__dirname, 'src', 'AgentMessageBus.js');
  console.log('📁 Checking:', messageBusPath);
  fs.accessSync(messageBusPath);
  console.log('✅ AgentMessageBus.js exists');
} catch (error) {
  console.log('❌ AgentMessageBus.js missing:', error.message);
}

// Test 2: Check compiled files
try {
  const { AgentMessageBus } = await import('./src/AgentMessageBus.js');
  console.log('✅ AgentMessageBus imported successfully');
  
  const messageBus = new AgentMessageBus();
  console.log('✅ AgentMessageBus instantiated successfully');
} catch (error) {
  console.log('❌ AgentMessageBus import failed:', error.message);
}

console.log('🎯 Test complete!');
