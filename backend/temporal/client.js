import { Connection, Client } from '@temporalio/client';
import { jobApplicationWorkflow } from './workflows.js';

export class JobApplicationWorkflowClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      const connection = await Connection.connect({
        address: 'localhost:7233',
        connectTimeout: '30s',
        keepAliveTime: '30s',
        keepAliveTimeout: '5s',
        keepAlivePermitWithoutCalls: true,
      });
      
      this.client = new Client({
        connection,
        namespace: 'default',
      });
      
      console.log('Connected to Temporal server');
    } catch (error) {
      console.error('Failed to connect to Temporal server:', error);
      throw error;
    }
  }

  async startJobApplicationWorkflow(applicationData) {
    if (!this.client) {
      await this.connect();
    }

    const { company, role, description, deadline, applicationId } = applicationData;
    
    console.log(`Starting workflow for application: ${applicationId}`);
    
    const handle = await this.client.workflow.start(jobApplicationWorkflow, {
      args: [applicationData],
      taskQueue: 'job-application-queue',
      workflowId: `job-application-${applicationId}`,
    });

    console.log(`Workflow started with ID: ${handle.workflowId}`);
    return handle;
  }

  async updateApplicationStatus(workflowId, status) {
    if (!this.client) {
      await this.connect();
    }

    const handle = this.client.workflow.getHandle(workflowId);
    await handle.signal('updateApplicationStatus', status);
    
    console.log(`Sent status update signal: ${status}`);
  }

  async sendReminder(workflowId) {
    if (!this.client) {
      await this.connect();
    }

    const handle = this.client.workflow.getHandle(workflowId);
    await handle.signal('sendReminder');
    
    console.log('Sent reminder signal');
  }

  async getApplicationStatus(workflowId) {
    if (!this.client) {
      await this.connect();
    }

    const handle = this.client.workflow.getHandle(workflowId);
    const status = await handle.query('getApplicationStatus');
    
    return status;
  }

  async getCoverLetter(workflowId) {
    if (!this.client) {
      await this.connect();
    }

    const handle = this.client.workflow.getHandle(workflowId);
    const coverLetter = await handle.query('getCoverLetter');
    
    return coverLetter;
  }

  async getWorkflowResult(workflowId) {
    if (!this.client) {
      await this.connect();
    }

    const handle = this.client.workflow.getHandle(workflowId);
    const result = await handle.result();
    
    return result;
  }
}

export default JobApplicationWorkflowClient;
