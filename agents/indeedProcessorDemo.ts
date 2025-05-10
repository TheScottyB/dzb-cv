/**
 * Demo script to test the IndeedLinkProcessorAgent with a real Indeed URL.
 * Creates test instance, processes URL, displays extracted data, and shows message bus integration.
 */

import { IndeedLinkProcessorAgent } from './IndeedLinkProcessorAgent';

// Mock message bus for demonstration
const mockMessageBus = {
  subscribers: {} as Record<string, Array<(data: any) => void>>,

  subscribe(topic: string, handler: (data: any) => void) {
    this.subscribers[topic] = this.subscribers[topic] || [];
    this.subscribers[topic].push(handler);
    console.log(`[MockBus] Subscribed to topic: ${topic}`);
  },

  publish(topic: string, data: any) {
    console.log(`[MockBus] Published to topic: ${topic}`, data);
    const handlers = this.subscribers[topic] || [];
    handlers.forEach((handler) => handler(data));
  },
};

// Create a listener to show the message bus works
mockMessageBus.subscribe('indeed:jobInfoExtracted', (jobInfo) => {
  console.log('\n[JobInfoListener] Received job info from message bus:');
  console.log(`Title: ${jobInfo.title || 'Unknown'}`);
  console.log(`Company: ${jobInfo.company || 'Unknown'}`);
  console.log(`Location: ${jobInfo.location || 'Unknown'}`);
  console.log('Details:', jobInfo.details);
});

// Test URL provided
const testUrl =
  'https://cts.indeed.com/v3/H4sIAAAAAAAA_02TWa-iWBSF_4tJ-9TUBY4M3sR0EJBBBkEQ8YUc4CAzyCRQqf9eVvdLZ69kZ39rJftp_dyMm-9NOgxt_319f7_f7x9ZHSMUL0VNFWrJJ4LxV1QW_0i6pjrkTZiRMPisIg5RjJPEXG3jNgwNWlKh6wS4HRGCwSNAkwQRJRQEt1VzKDZ7OMdow4thUhg4r2f35NR3srz6D17rbOvlOgJ24rKG4m6Bmb86BQhEy1O7fjwCxECKYaMOkEWPFjATNsyOVp1ipkh4zEAtwzjiUJj0l-3yV2_VIzmRC-jN1awbXojZVnJv42SzI-TFJJjkoUEskQLvzIWOJmuZb7S7d53JggQCUdTD9uVYU4pOxDE2VYrvJJw4NpyP2ST2r9FTRIcy8oYCyrRzUmFpYvNEWAiZ_KaVtkDGi4nFfZG6cqrU-KGnlx3Zr5KSGQ8cn2eeamgNaFCnAZ2_G-f0yLxJtkvsEKdaUfjeizZXf-uVJ_tVlmIVSOPErRfP4oboWtLn8AWo24Mdm6W93WjGxy18DycFLH6v0mM3YI4nORVZZpe9jLpzS0pJgzFu2bFl-hTz0_Vp1SVcJTHsgmKvLoU1iJkiDfy4aLheo4F_r4-xToN-Yi2VPJmrGbOrNb4l3Ey1Nn1aeGEvGsyp4XsQPhY91sSEHZunRqd2uh7q0Z5w-YCFj5Z8LoWgSS6cwmKOARGnxSVEqKY52Mdb7KXA4qMU-vXJYejXSzCz6UfFpWtJJBT2kx5Vb1pbYjRGqZp3JM63nIxpyNs7ybAawIuz0FNv47rA9lfqcLns2p-HDwaUaIA9jfVZy6s-XfQmAL3tddDHev1xLbFibJg6AQXfLuzx-KSVBeOI-LhhepRLXJVXYTgasCJqYnLWUdnR1pC2f5azUaQB1TxxcFXSh92L_TzuLmg3g4eXHwLVLB9UPJG1n1gc6xRCXdf0xfTI--psqoSodMvL2DJwEkAhA5e75CApFHRcHYb8uD2RXJZAeD0X9BIAiB8vKIbfb8JOW7V8sRQX9CpuXqgQxvNHl_2TCobudfaeCEXdF4DQHVjicKw_6VPvtlVxQEOqILzHUxS_gmimU6hf-edfQPho8_em2nz_3ERlFhVO2jXjM_00eOhG9LH-o0uLPgi2bbl8WAs7VA9O8UF_rqYf-P-lXONsmJ7xcYY_iX-LC_Y43fYkYnFy8-vXbxadb8AjBAAA/alzbw5l74hV5kolJwJpHsrWG8Tu240PvjfQExrRLCY';

// Create the agent instance
const processor = new IndeedLinkProcessorAgent({
  registry: {},
  messageBus: mockMessageBus,
});

console.log('\n===== Testing IndeedLinkProcessorAgent =====\n');

// Process the URL
const jobInfo = processor.processLink(testUrl);

// Direct output of processed result
console.log('\n===== Direct Result from processLink() =====');
console.log('Job Title:', jobInfo.title || 'Could not extract title');
console.log('Company:', jobInfo.company || 'Could not extract company');
console.log('Location:', jobInfo.location || 'Could not extract location');
console.log('Job Details:', jobInfo.details || 'No details available');

console.log('\n===== End of Test =====');

// For direct execution via:
// pnpm exec tsx agents/indeedProcessorDemo.ts
