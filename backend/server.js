import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import MockWorkflowSystem from "./temporal/mock-workflow.js";
import getDemoApplications from "./demoData.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Use /tmp for serverless file uploads (Vercel)
const upload = multer({ dest: '/tmp/uploads/' });

// In-memory storage
let applications = [];
let nextId = 1;
const demoData = getDemoApplications(nextId);
applications = demoData.applications;
nextId = demoData.nextId;

// Initialize Temporal workflow
const workflowSystem = new MockWorkflowSystem(applications);

// Initialize OpenAI / LLM (Gemini)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Routes ---

app.get("/applications", (req, res) => res.json(applications));

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
      resume: resumeFile ? {
        filename: resumeFile.filename,
        originalName: resumeFile.originalname,
        path: resumeFile.path
      } : null
    };

    applications.push(application);

    try {
      const workflowResult = await workflowSystem.startApplicationWorkflow(application);
      application.workflowId = workflowResult.workflowId;
    } catch (workflowError) {
      console.error('Workflow failed:', workflowError);
    }

    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

app.post("/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appItem = applications.find(a => a.id === parseInt(id));
    if (!appItem) return res.status(404).json({ error: 'Application not found' });

    appItem.status = status;
    appItem.updatedAt = new Date().toISOString();

    try {
      await workflowSystem.updateApplicationStatus(parseInt(id), status);
    } catch (workflowError) {
      console.error('Workflow update failed:', workflowError);
    }

    res.json(appItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Overdue and archived
app.get("/applications/overdue", (req, res) => {
  const now = new Date();
  const overdue = applications.filter(app => app.status !== 'archived' && new Date(app.deadline) < now);
  res.json(overdue);
});

app.get("/applications/archived", (req, res) => {
  const archived = applications.filter(app => app.status === 'archived');
  res.json(archived);
});

app.post("/generate-cover-letter", async (req, res) => {
  const { company, role } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional assistant who writes concise, professional cover letters." },
        { role: "user", content: `Write a professional cover letter for the role of ${role} at ${company}.` }
      ],
      max_tokens: 350
    });

    const coverLetter = response.choices?.[0]?.message?.content ?? "";
    res.json({ coverLetter });
  } catch (err) {
    console.error("LLM API failed:", err.message);
    res.json({ coverLetter: `Dear Hiring Manager at ${company},\n\nI am excited to apply for the role of ${role}. Best regards, [Team]` });
  }
});

// Workflow info
app.get("/applications/:id/workflow-status", async (req, res) => {
  const { id } = req.params;
  const workflowStatus = await workflowSystem.getWorkflowStatus(parseInt(id));
  res.json(workflowStatus);
});

app.get("/workflows", (req, res) => {
  res.json(workflowSystem.getActiveWorkflows());
});

// --- Local server port ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
});

// --- Vercel serverless export ---
export default app;
