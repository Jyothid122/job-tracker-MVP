import JobApplicationWorkflowClient from './client.js';

class TemporalIntegration {
  constructor() {
    this.workflowClient = new JobApplicationWorkflowClient();
    this.activeWorkflows = new Map(); // Track active workflows by application ID
  }

  async initialize() {
    try {
      await this.workflowClient.connect();
      console.log('Temporal integration initialized');
    } catch (error) {
      console.error('Failed to initialize Temporal integration:', error);
      // Don't throw error - allow application to continue without Temporal
    }
  }

  async startApplicationWorkflow(applicationData) {
    try {
      const { id, company, role, description, deadline } = applicationData;
      
      console.log(`Starting Temporal workflow for application ${id}: ${role} at ${company}`);
      
      const handle = await this.workflowClient.startJobApplicationWorkflow({
        applicationId: id,
        company,
        role,
        description,
        deadline
      });

      // Store workflow reference
      this.activeWorkflows.set(id, {
        workflowId: handle.workflowId,
        handle,
        applicationData
      });

      console.log(`Workflow started for application ${id} with ID: ${handle.workflowId}`);
      
      return {
        workflowId: handle.workflowId,
        status: 'started'
      };
      
    } catch (error) {
      console.error('Error starting workflow:', error);
      // Return a mock workflow ID to prevent breaking the application
      return {
        workflowId: `mock-workflow-${Date.now()}`,
        status: 'failed_to_start',
        error: error.message
      };
    }
  }

  async updateApplicationStatus(applicationId, status) {
    try {
      const workflow = this.activeWorkflows.get(applicationId);
      if (!workflow) {
        throw new Error(`No active workflow found for application ${applicationId}`);
      }

      await this.workflowClient.updateApplicationStatus(workflow.workflowId, status);
      console.log(`Updated application ${applicationId} status to: ${status}`);
      
      return { success: true, status };
      
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  async getCoverLetter(applicationId) {
    try {
      const workflow = this.activeWorkflows.get(applicationId);
      if (!workflow) {
        throw new Error(`No active workflow found for application ${applicationId}`);
      }

      const coverLetter = await this.workflowClient.getCoverLetter(workflow.workflowId);
      console.log(`Retrieved cover letter for application ${applicationId}`);
      
      return coverLetter;
      
    } catch (error) {
      console.error('Error getting cover letter:', error);
      throw new Error(`Failed to get cover letter: ${error.message}`);
    }
  }

  async sendReminder(applicationId) {
    try {
      const workflow = this.activeWorkflows.get(applicationId);
      if (!workflow) {
        throw new Error(`No active workflow found for application ${applicationId}`);
      }

      await this.workflowClient.sendReminder(workflow.workflowId);
      console.log(`Sent reminder for application ${applicationId}`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw new Error(`Failed to send reminder: ${error.message}`);
    }
  }

  async getWorkflowStatus(applicationId) {
    try {
      const workflow = this.activeWorkflows.get(applicationId);
      if (!workflow) {
        return { status: 'not_found' };
      }

      const status = await this.workflowClient.getApplicationStatus(workflow.workflowId);
      return { status, workflowId: workflow.workflowId };
      
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return { status: 'error', error: error.message };
    }
  }

  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.entries()).map(([id, workflow]) => ({
      applicationId: id,
      workflowId: workflow.workflowId,
      company: workflow.applicationData.company,
      role: workflow.applicationData.role
    }));
  }
}

export default TemporalIntegration;
