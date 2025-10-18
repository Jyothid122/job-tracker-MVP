import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import MockWorkflowSystem from "../temporal/mock-workflow.js";
import getDemoApplications from "./demoData.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory storage for applications (use DB in production)
let applications = [];
let nextId = 1;

const demoData = getDemoApplications(nextId);
applications = demoData.applications;
nextId = demoData.nextId;

// Initialize Mock Workflow System
const workflowSystem = new MockWorkflowSystem(applications);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Routes ---

// Get all applications
app.get("/applications", (req, res) => {
  res.json(applications);
});

// Create new application
app.post("/applications", upload.single('resume'), async (req, res) => {
  try {
    const { company, role, description, deadline } = req.body;
    const resumeFile = req.file;

    const application = {
      id: nextId++,
      company,
      role,
      description,
      deadline,
      status: 'applied',
      createdAt: new Date().toISOString(),
      resume: resumeFile
        ? {
            filename: resumeFile.filename,
            originalName: resumeFile.originalname,
            path: resumeFile.path
          }
        : null
    };

    applications.push(application);

    // Start workflow
    try {
      const workflowResult = await workflowSystem.startApplicationWorkflow(application);
      application.workflowId = workflowResult.workflowId;
      console.log(`Started workflow for application ${application.id}`);
    } catch (workflowError) {
      console.error('Failed to start workflow:', workflowError);
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application status
app.post("/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = applications.find(app => app.id === parseInt(id));
    if (!application) return res.status(404).json({ error: 'Application not found' });

    application.status = status;
    application.updatedAt = new Date().toISOString();

    try {
      await workflowSystem.updateApplicationStatus(parseInt(id), status);
      console.log(`Updated workflow status for application ${id} to: ${status}`);
    } catch (workflowError) {
      console.error('Failed to update workflow status:', workflowError);
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get cover letter
app.get("/applications/:id/cover-letter", async (req, res) => {
  try {
    const { id } = req.params;
    const application = applications.find(app => app.id === parseInt(id));
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const coverLetter = await workflowSystem.getCoverLetter(parseInt(id));
    res.json({ coverLetter });
  } catch (error) {
    console.error('Error getting cover letter:', error);
    res.status(500).json({ error: 'Failed to get cover letter' });
  }
});

// Get workflow status
app.get("/applications/:id/workflow-status", async (req, res) => {
  try {
    const { id } = req.params;
    const application = applications.find(app => app.id === parseInt(id));
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const workflowStatus = await workflowSystem.getWorkflowStatus(parseInt(id));
    res.json(workflowStatus);
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({ error: 'Failed to get workflow status' });
  }
});

// Send reminder for application
app.post("/applications/:id/reminder", async (req, res) => {
  try {
    const { id } = req.params;
    const application = applications.find(app => app.id === parseInt(id));
    if (!application) return res.status(404).json({ error: 'Application not found' });

    await workflowSystem.sendReminder(parseInt(id));
    res.json({ success: true, message: 'Reminder sent' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Get all active workflows
app.get("/workflows", async (req, res) => {
  try {
    const activeWorkflows = workflowSystem.getActiveWorkflows();
    res.json(activeWorkflows);
  } catch (error) {
    console.error('Error getting workflows:', error);
    res.status(500).json({ error: 'Failed to get workflows' });
  }
});

// --- Overdue and Archived Endpoints ---

// Get overdue applications
app.get("/applications/overdue", (req, res) => {
  try {
    const now = new Date();
    const overdue = applications.filter(app => {
      const deadline = new Date(app.deadline);
      return app.status !== 'archived' && now > deadline;
    });
    res.json(overdue);
  } catch (error) {
    console.error('Error fetching overdue applications:', error);
    res.status(500).json({ error: 'Failed to fetch overdue applications' });
  }
});

// Get archived applications
app.get("/applications/archived", (req, res) => {
  try {
    const archivedApps = applications.filter(app => app.status === 'archived');
    res.json(archivedApps);
  } catch (error) {
    console.error('Error fetching archived applications:', error);
    res.status(500).json({ error: 'Failed to fetch archived applications' });
  }
});

// Generate cover letter
app.post("/generate-cover-letter", async (req, res) => {
  const { company, role } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Write a professional cover letter for the position of ${role} at ${company}.` }
      ],
      max_tokens: 250
    });

    const coverLetter = response.choices[0].message.content;
    res.json({ coverLetter });
  } catch (err) {
    console.error("OpenAI API failed:", err.message);
    const fallbackLetter = `Dear Hiring Manager at ${company},

I am excited to apply for the role of ${role}. I believe my skills match the requirements.

Best regards,
[Team]`;

    res.json({ coverLetter: fallbackLetter });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
