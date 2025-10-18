Job Application Tracker

A simple MVP to track job applications, generate cover letters using LLM APIs, show reminders before deadlines, and auto-archive overdue applications.

Features

Add job applications: Company, role, description, resume, deadline

Update status: Pending, Interview, Offer, Rejected, Withdrawn

In-app reminders: Highlight overdue applications

Auto-archive: Applications after a grace period

Generate cover letters: Using AI APIs

Dashboard: View active, reminder, overdue, and archived applications

Tech Stack

Frontend: React, TailwindCSS, React Router

Backend: Node.js (Express) or Serverless Functions

LLM Integration: Gemini / AI SDK

Workflow: Temporal.io (reminders & auto-archive)

Hosting: Vercel

Installation
# Clone the repo
git clone <repo-url>
cd <repo-folder>

# Install frontend dependencies
npm install
npm start
# Runs frontend on http://localhost:3000

# Backend setup
cd backend
npm install
npm start

# Update .env variables as needed

Usage

Open the app at http://localhost:3000

Add job applications and set deadlines

Dashboard shows:

Red reminders for overdue applications

Auto-archive after grace period

Generate cover letters directly from the dashboard

Notes

Keep your .env updated with API keys for LLM integration.

The dashboard color-codes applications by status for easy tracking.
