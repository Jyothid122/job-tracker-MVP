# Temporal.io Workflow for Job Application Tracking

## 🎯 Overview

This Temporal.io workflow automates the job application process by:
1. **Generating personalized cover letters** using LLM APIs
2. **Tracking application status** throughout the hiring process
3. **Sending deadline reminders** before important dates
4. **Managing the complete application lifecycle**

## 🏗️ Architecture

### Components

1. **Workflow** (`workflows.js`) - Orchestrates the entire process
2. **Activities** (`activities.js`) - Contains business logic (LLM calls, notifications)
3. **Client** (`client.js`) - Interface to start and manage workflows
4. **Integration** (`integration.js`) - Connects Temporal with the backend API
5. **Worker** (`worker.js`) - Executes workflows and activities

### Workflow Process

```
Application Created → Workflow Started → Cover Letter Generated → Status Tracking → Reminders → Completion
```

## 🚀 Features

### 1. Automated Cover Letter Generation
- Uses OpenAI GPT-4 to generate personalized cover letters
- Analyzes job description and company information
- Creates professional, role-specific content
- No fallback responses - uses real LLM API

### 2. Application Status Tracking
- Monitors application status changes
- Updates workflow state in real-time
- Supports statuses: applied, interview_scheduled, rejected, accepted, withdrawn

### 3. Deadline Reminder System
- Calculates days until application deadline
- Sends reminders 3 days before deadline
- Final reminder 1 day before deadline
- Configurable reminder intervals

### 4. Workflow Management
- Signals for status updates
- Queries for current state
- Long-running workflows (can run for months)
- Fault-tolerant execution

## 📋 API Endpoints

### Backend Integration
- `POST /applications` - Creates application and starts workflow
- `GET /applications/:id/cover-letter` - Retrieves generated cover letter
- `GET /applications/:id/workflow-status` - Gets workflow status
- `POST /applications/:id/reminder` - Manually trigger reminder
- `GET /workflows` - List all active workflows

## 🔧 Setup and Usage

### Prerequisites
- Node.js 18+
- Temporal Server running on localhost:7233
- OpenAI API key in environment variables

### Installation
```bash
cd temporal
npm install
```

### Start Temporal Worker
```bash
./start-worker.sh
```

### Test Workflow
```bash
node test-workflow.js
```

## 🧪 Testing

The workflow includes comprehensive testing:
- Cover letter generation with real LLM API
- Status update handling
- Reminder system
- Workflow completion
- Error handling

## 🔄 Workflow States

1. **Started** - Workflow initiated
2. **Cover Letter Generated** - LLM has created personalized cover letter
3. **Status Tracking** - Monitoring application status changes
4. **Reminder Sent** - Deadline reminders activated
5. **Completed** - Workflow finished

## 📊 Monitoring

- Real-time workflow status queries
- Application tracking across multiple jobs
- Deadline monitoring and alerts
- LLM API usage tracking

## 🛡️ Error Handling

- Graceful LLM API failure handling
- Workflow retry mechanisms
- Status update validation
- Deadline calculation errors

