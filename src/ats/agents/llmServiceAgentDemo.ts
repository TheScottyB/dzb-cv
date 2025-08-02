/**
 * Demo script to test the LLMServiceAgent with the message bus.
 * Creates test instance, demonstrates message bus integration, and shows complete CV processing pipeline.
 */

import { AgentMessageBus } from '../../AgentMessageBus';
import LLMServiceAgent from './LLMServiceAgent';

// Mock CV data for testing
const mockCVData = {
  personalInfo: {
    name: { full: 'John Smith' },
    contact: {
      email: 'john.smith@example.com',
      phone: '+1-555-0123'
    }
  },
  experience: [
    {
      position: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2021-01',
      endDate: 'Present',
      responsibilities: [
        'Led development of microservices architecture',
        'Mentored junior developers',
        'Implemented CI/CD pipelines'
      ],
      description: 'Full-stack development using React, Node.js, and AWS'
    },
    {
      position: 'Software Engineer',
      company: 'StartupXYZ',
      startDate: '2019-03',
      endDate: '2020-12',
      responsibilities: [
        'Built user-facing web applications',
        'Collaborated with product team',
        'Optimized database queries'
      ],
      description: 'Frontend development with React and backend APIs'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      graduationDate: '2019-05'
    }
  ],
  skills: [
    { name: 'JavaScript', level: 'Advanced' },
    { name: 'React', level: 'Advanced' },
    { name: 'Node.js', level: 'Intermediate' },
    { name: 'AWS', level: 'Intermediate' },
    { name: 'Docker', level: 'Intermediate' }
  ]
};

// Create message bus
const messageBus = new AgentMessageBus();

// Set up event listeners to observe agent behavior
console.log('\n===== Setting up Message Bus Listeners =====');

messageBus.subscribe('cv:distill:complete', (result) => {
  console.log('\n[LISTENER] CV Distill Complete:', {
    requestId: result.requestId,
    originalLength: result.result?.metadata?.originalLength,
    distilledLength: result.result?.metadata?.distilledLength,
    reductionRatio: result.result?.reductionRatio,
    processingTime: result.result?.metadata?.processingTime
  });
});

messageBus.subscribe('cv:distill:error', (error) => {
  console.log('\n[LISTENER] CV Distill Error:', error);
});

messageBus.subscribe('cv:optimize:complete', (result) => {
  console.log('\n[LISTENER] CV Optimize Complete:', {
    requestId: result.requestId,
    fitsOnSinglePage: result.result?.layoutMetrics?.fitsOnSinglePage,
    estimatedLines: result.result?.layoutMetrics?.estimatedLines,
    optimizations: result.result?.optimizations
  });
});

messageBus.subscribe('cv:optimize:error', (error) => {
  console.log('\n[LISTENER] CV Optimize Error:', error);
});

messageBus.subscribe('cv:process:single-page:complete', (result) => {
  console.log('\n[LISTENER] Single-Page Processing Complete:', {
    requestId: result.requestId,
    success: result.success,
    processingTime: result.processingTime,
    distillMetrics: {
      reductionRatio: result.distilled?.reductionRatio,
      sectionsIncluded: result.distilled?.sectionsIncluded
    },
    optimizeMetrics: {
      fitsOnSinglePage: result.optimized?.layoutMetrics?.fitsOnSinglePage,
      estimatedLines: result.optimized?.layoutMetrics?.estimatedLines
    }
  });
});

messageBus.subscribe('cv:process:single-page:error', (error) => {
  console.log('\n[LISTENER] Single-Page Processing Error:', error);
});

messageBus.subscribe('agent:status', (status) => {
  console.log('\n[LISTENER] Agent Status:', status);
});

messageBus.subscribe('agent:health', (health) => {
  console.log('\n[LISTENER] Agent Health:', health);
});

// Create the LLM service agent
console.log('\n===== Initializing LLMServiceAgent =====');
const llmAgent = new LLMServiceAgent({
  messageBus,
  agentName: 'TestLLMAgent'
});

// Function to wait for a short time (simulate async operations)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
  console.log('\n===== Starting LLMServiceAgent Demo =====\n');

  // Test 1: Individual Distill Request
  console.log('📋 Test 1: Individual Distill Request');
  messageBus.publish('cv:distill', {
    requestId: 'test-distill-001',
    cvData: mockCVData,
    style: 'professional',
    maxLength: 1500
  });

  await wait(1000);

  // Test 2: Individual Optimize Request
  console.log('\n🎯 Test 2: Individual Optimize Request');
  messageBus.publish('cv:optimize', {
    requestId: 'test-optimize-001',
    distilledContent: 'John Smith\\nSenior Software Engineer at Tech Corp\\nExperienced in JavaScript, React, Node.js and AWS\\nLed development of microservices architecture and mentored junior developers.',
    layoutConstraints: {
      maxLines: 40,
      maxCharactersPerLine: 80,
      pageFormat: 'Letter' as const,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
    }
  });

  await wait(1000);

  // Test 3: Complete Single-Page Processing Pipeline
  console.log('\n🚀 Test 3: Complete Single-Page Processing Pipeline');
  messageBus.publish('cv:process:single-page', {
    requestId: 'test-pipeline-001',
    cvData: mockCVData,
    targetStyle: 'professional',
    layoutConstraints: {
      maxLines: 45,
      maxCharactersPerLine: 80,
      pageFormat: 'Letter' as const,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
    }
  });

  await wait(2000);

  // Test 4: Direct Agent Communication
  console.log('\n📡 Test 4: Direct Agent Communication');
  messageBus.publishDirect('TestLLMAgent', { action: 'status' });
  
  await wait(500);
  
  messageBus.publishDirect('TestLLMAgent', { action: 'health' });

  await wait(500);

  // Test 5: Monitor Active Requests
  console.log('\n📊 Test 5: Check Active Requests Count');
  console.log(`Active requests: ${llmAgent.getActiveRequestsCount()}`);

  console.log('\n===== Demo Complete =====');
  console.log('Check the output above to see how the agent processed each request.');
  console.log('The agent should have handled all message bus events and published appropriate responses.');
}

// Run the demo
runDemo().catch(console.error);

// For direct execution via:
// pnpm exec tsx src/ats/agents/llmServiceAgentDemo.ts
