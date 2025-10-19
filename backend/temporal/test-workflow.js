import JobApplicationWorkflowClient from './client.js';

async function testTemporalWorkflow() {
  console.log('🧪 Testing Temporal.io Workflow for Job Applications');
  console.log('==================================================\n');

  const client = new JobApplicationWorkflowClient();
  
  try {
    // Test data
    const testApplication = {
      applicationId: 'test-123',
      company: 'Google',
      role: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer with experience in distributed systems, cloud computing, and machine learning. The ideal candidate will have 5+ years of experience and strong problem-solving skills.',
      deadline: '2025-12-31'
    };

    console.log('1. Starting workflow...');
    const handle = await client.startJobApplicationWorkflow(testApplication);
    console.log(`✅ Workflow started with ID: ${handle.workflowId}\n`);

    // Wait a bit for workflow to process
    console.log('2. Waiting for cover letter generation...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('3. Getting cover letter...');
    const coverLetter = await client.getCoverLetter(handle.workflowId);
    console.log('✅ Cover letter generated:');
    console.log('---');
    console.log(coverLetter.content);
    console.log('---\n');

    console.log('4. Checking application status...');
    const status = await client.getApplicationStatus(handle.workflowId);
    console.log(`✅ Current status: ${status}\n`);

    console.log('5. Updating application status...');
    await client.updateApplicationStatus(handle.workflowId, 'interview_scheduled');
    console.log('✅ Status updated to: interview_scheduled\n');

    console.log('6. Sending reminder...');
    await client.sendReminder(handle.workflowId);
    console.log('✅ Reminder sent\n');

    console.log('7. Getting final workflow result...');
    const result = await client.getWorkflowResult(handle.workflowId);
    console.log('✅ Workflow completed:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🎉 All tests passed! Temporal workflow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testTemporalWorkflow();
