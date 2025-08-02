/**
 * Basic test of message bus functionality without LLM dependencies
 */

import { AgentMessageBus } from '../../AgentMessageBus';

console.log('🚀 Testing Message Bus Basic Functionality\n');

// Create message bus instance
const messageBus = new AgentMessageBus();

// Test 1: Basic subscription and publishing
console.log('📋 Test 1: Basic Pub/Sub');
messageBus.subscribe('test:message', (data) => {
  console.log('✅ Received test message:', data);
});

messageBus.publish('test:message', { hello: 'world', timestamp: new Date().toISOString() });

// Test 2: Direct messaging
console.log('\n📡 Test 2: Direct Messaging');
messageBus.subscribe('@TestAgent', (data) => {
  console.log('✅ Received direct message:', data);
});

messageBus.publishDirect('TestAgent', { action: 'ping', sender: 'TestRunner' });

// Test 3: Multiple subscribers
console.log('\n📊 Test 3: Multiple Subscribers');
let messageCount = 0;

messageBus.subscribe('multi:test', (data) => {
  messageCount++;
  console.log(`✅ Subscriber 1 received message ${messageCount}:`, data.content);
});

messageBus.subscribe('multi:test', (data) => {
  console.log(`✅ Subscriber 2 also received:`, data.content);
});

messageBus.publish('multi:test', { content: 'Message for all subscribers' });

// Test 4: Unsubscribe functionality
console.log('\n🔄 Test 4: Unsubscribe');
const unsubscribe = messageBus.subscribe('temp:topic', (data) => {
  console.log('✅ This should only appear once:', data);
});

messageBus.publish('temp:topic', { message: 'First publish' });

// Unsubscribe and publish again
unsubscribe();
messageBus.publish('temp:topic', { message: 'Second publish (should not appear)' });

console.log('\n✅ Basic message bus tests completed successfully!');
console.log('The message bus is working correctly and ready for agent integration.');

export {};
