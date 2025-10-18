export default function getDemoApplications(nextId) {
  const applications = [
    {
      id: nextId++,
      company: "ActiveCorp",
      role: "Frontend Developer",
      description: "Building responsive UI components using React.",
      deadline: "2025-10-23", // Future deadline → Active
      status: "Applied",
      createdAt: "2025-10-01",
      archived: false,
      reminder: false,
      overdue: false,
      resume: null
    },
    {
      id: nextId++,
      company: "ReminderCorp",
      role: "Backend Developer",
      description: "Develop scalable APIs with Node.js and Express.",
      deadline: "2025-10-16", // Deadline passed, within 2-day grace → Reminder
      status: "Applied",
      createdAt: "2025-10-01",
      archived: false,
      reminder: true,
      overdue: false,
      resume: null
    },
    {
      id: nextId++,
      company: "OverdueCorp",
      role: "QA Engineer",
      description: "Manual and automated testing of web applications.",
      deadline: "2025-10-14", // Deadline + 2-day grace passed → Auto-archived
      status: "Applied",
      createdAt: "2025-10-01",
      archived: true,
      reminder: false,
      overdue: true,
      resume: null
    },
    {
      id: nextId++,
      company: "IBM",
      role: "Senior Application Developer",
      description: "Manage CI/CD pipelines and cloud deployments.",
      deadline: "2025-10-08", // Old archived
      status: "Archived",
      createdAt: "2025-09-20",
      archived: true,
      reminder: false,
      overdue: false,
      resume: null
    }
  ];

  return { applications, nextId };
}
