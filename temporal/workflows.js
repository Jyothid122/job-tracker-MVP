import { defineSignal, defineQuery, setHandler, condition } from '@temporalio/workflow';
import { generateCoverLetter } from './activities.js';

// Signals for workflow control
export const updateApplicationStatusSignal = defineSignal('updateApplicationStatus');
export const reminderSignal = defineSignal('sendReminder');

// Queries for workflow state
export const getApplicationStatusQuery = defineQuery('getApplicationStatus');
export const getCoverLetterQuery = defineQuery('getCoverLetter');

export async function jobApplicationWorkflow(applicationData) {
  const { company, role, description, deadline, applicationId } = applicationData;
  
  let applicationStatus = 'applied';
  let coverLetter = null;
  let reminderSent = false;
  
  // Set up signal handlers
  setHandler(updateApplicationStatusSignal, (newStatus) => {
    applicationStatus = newStatus;
    console.log(`Application status updated to: ${newStatus}`);
  });
  
  setHandler(reminderSignal, () => {
    reminderSent = true;
    console.log('Reminder sent for application deadline');
  });
  
  // Set up query handlers
  setHandler(getApplicationStatusQuery, () => applicationStatus);
  setHandler(getCoverLetterQuery, () => coverLetter);
  
  try {
    // Step 1: Generate cover letter using LLM
    console.log(`Generating cover letter for ${role} at ${company}`);
    coverLetter = await generateCoverLetter(company, role, description);
    console.log('Cover letter generated successfully');
    
    // Step 2: Wait for application status updates
    console.log('Waiting for application status updates...');
    await condition(() => applicationStatus !== 'applied', '1 day');
    
    // Step 3: Set up deadline reminder
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline > 0) {
      console.log(`Setting up reminder for ${daysUntilDeadline} days before deadline`);
      
      // Wait until 3 days before deadline for reminder
      const reminderDays = Math.max(0, daysUntilDeadline - 3);
      if (reminderDays > 0) {
        await condition(() => reminderSent, `${reminderDays} days`);
      }
      
      // Send final reminder 1 day before deadline
      if (daysUntilDeadline > 1) {
        await condition(() => reminderSent, `${daysUntilDeadline - 1} days`);
      }
    }
    
    console.log(`Workflow completed for application ${applicationId}`);
    return {
      applicationId,
      status: applicationStatus,
      coverLetter,
      reminderSent,
      completedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}
