import { Worker } from '@temporalio/worker';
import { jobApplicationWorkflow } from './workflows.js';
import { generateCoverLetter, sendReminder, updateApplicationStatus } from './activities.js';

async function run() {
  // Create a new Worker instance
  const worker = await Worker.create({
    workflowsPath: new URL('./workflows.js', import.meta.url).pathname,
    activities: {
      generateCoverLetter,
      sendReminder,
      updateApplicationStatus,
    },
    taskQueue: 'job-application-queue',
  });

  // Start the worker
  console.log('Temporal worker started on task queue: job-application-queue');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
