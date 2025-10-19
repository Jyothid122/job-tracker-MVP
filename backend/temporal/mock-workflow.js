import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class MockWorkflowSystem {
  constructor(applicationsRef) {
    this.workflows = new Map();
    this.reminders = new Map();
    this.applications = applicationsRef;
  }

  async startApplicationWorkflow(applicationData) {
    const { id, company, role, description, deadline } = applicationData;
    const workflowId = `workflow-${id}-${Date.now()}`;
    
    console.log(`Starting workflow for application ${id}: ${role} at ${company}`);
    
    this.workflows.set(id, {
      workflowId,
      applicationData,
      status: 'applied',
      coverLetter: null,
      createdAt: new Date(),
      lastUpdated: new Date(),
      archived: false
    });

    // Generate cover letter
    try {
      const coverLetter = await this.generateCoverLetter(company, role, description);
      this.workflows.get(id).coverLetter = coverLetter;
      console.log(`Cover letter generated for application ${id}`);
    } catch (error) {
      console.error('Error generating cover letter:', error);
    }

    // Setup automatic reminder and auto-archive
    this.setupDeadlineAutomation(id, deadline);

    return { workflowId, status: 'started' };
  }

  async generateCoverLetter(company, role, jobDescription) {
    try {
      const prompt = `Write a professional, personalized cover letter for the position of ${role} at ${company}.
      
Job Description: ${jobDescription}

Requirements:
- Professional and engaging tone
- Highlight relevant skills and experience
- Show enthusiasm for the role and company
- Keep it concise (3-4 paragraphs)
- Address it to "Hiring Manager"
- Include a strong closing statement`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        content: response.choices[0].message.content,
        generatedAt: new Date().toISOString(),
        company,
        role
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return {
        content: `Dear Hiring Manager at ${company},\n\nI am excited to apply for ${role}. I believe my skills match the requirements.\n\nBest regards,\n[Team]`,
        generatedAt: new Date().toISOString(),
        company,
        role
      };
    }
  }

  setupDeadlineAutomation(applicationId, deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();

    // Reminder: 3 days before deadline
    const reminderDate = new Date(deadlineDate);
    reminderDate.setDate(deadlineDate.getDate() - 3);
    const timeUntilReminder = reminderDate - now;

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        console.log(`Sending automatic reminder for application ${applicationId}`);
        this.reminders.set(applicationId, { sent: true, sentAt: new Date() });
      }, timeUntilReminder);
    }

    // Auto-archive: 2 days after deadline
    const archiveDate = new Date(deadlineDate);
    archiveDate.setDate(deadlineDate.getDate() + 2);
    const timeUntilArchive = archiveDate - now;

    if (timeUntilArchive > 0) {
      setTimeout(() => {
        const workflow = this.workflows.get(applicationId);
        if (workflow) {
          workflow.archived = true;
          workflow.status = 'archived';
          workflow.lastUpdated = new Date();
          console.log(`Application ${applicationId} auto-archived after grace period`);
        }
      }, timeUntilArchive);
    }
  }

  updateApplicationStatus(applicationId, status) {
    const workflow = this.workflows.get(applicationId);
    if (!workflow) throw new Error(`No workflow found for application ${applicationId}`);
    workflow.status = status;
    workflow.lastUpdated = new Date();
    return { success: true, status };
  }

  getCoverLetter(applicationId) {
    const workflow = this.workflows.get(applicationId);
    if (!workflow) throw new Error(`No workflow found for application ${applicationId}`);
    return workflow.coverLetter;
  }

  getWorkflowStatus(applicationId) {
    const workflow = this.workflows.get(applicationId);
    if (!workflow) return { status: 'not_found' };
    return {
      status: workflow.status,
      workflowId: workflow.workflowId,
      lastUpdated: workflow.lastUpdated,
      archived: workflow.archived
    };
  }

  sendReminder(applicationId) {
    const workflow = this.workflows.get(applicationId);
    if (!workflow) throw new Error(`No workflow found for application ${applicationId}`);
    this.reminders.set(applicationId, { sent: true, sentAt: new Date() });
    return { sent: true, message: `Reminder sent for application ${applicationId}` };
  }

  getActiveWorkflows() {
    return Array.from(this.workflows.entries()).map(([id, workflow]) => ({
      applicationId: id,
      workflowId: workflow.workflowId,
      company: workflow.applicationData.company,
      role: workflow.applicationData.role,
      status: workflow.status,
      archived: workflow.archived
    }));
  }

  checkOverdueApplications() {
    const now = new Date();
    const overdue = [];

    for (const app of this.applications) {
      const deadline = new Date(app.deadline);
      const gracePeriod = new Date(deadline);
      gracePeriod.setDate(gracePeriod.getDate() + 2); // 2-day grace

      if (app.status !== 'archived' && now > deadline) {
        overdue.push(app);
      }

      if (app.status !== 'archived' && now > gracePeriod) {
        app.status = 'archived';
        app.updatedAt = new Date().toISOString();
        console.log(`Application ${app.id} (${app.company}) archived automatically.`);
      }
    }

    return overdue;
  }
}

export default MockWorkflowSystem;
