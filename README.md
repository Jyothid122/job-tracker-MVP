Job Application Tracker
Overview
A simple MVP to track job applications, generate cover letters using LLM APIs, show reminders before deadlines, and auto-archive overdue applications.

Features
Add job applications (company, role, description, resume, deadline)
Update status (Pending, Interview, Offer, Rejected, Withdrawn)
In-app reminders for overdue applications
Auto-archive after grace period
Generate cover letters using AI APIs
Dashboard showing active, reminder, overdue, and archived applications
.......................................................................................................................................................................................
Tech Stack
Frontend: React, TailwindCSS, React Router
Backend: Node.js (Express) or serverless functions
LLM Integration: Gemini / AI SDK
Workflow: Temporal.io (for reminders & auto-archive)
Hosting: Vercel 
.........................................................................................................................................................................................
Installation
Clone the repo:
git clone <your-repo-url>
cd <repo-folder>
.......................................................................................................................................................................................

Install dependencies:
npm install
Run the project:
npm start
This runs the frontend on http://localhost:3000.
........................................................................................................................................................................................
backend API:
cd backend
npm install
npm start

Update .env variables as needed.

Usage

Go to http://localhost:3000

Add applications and set deadlines

Dashboard will show reminders in red for overdue applications and auto-archive after grace period

Generate cover letters from the dashboard
