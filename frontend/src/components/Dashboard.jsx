import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listApplications, updateApplicationStatus } from "../api";

export default function Dashboard({ applications, setApplications }) {
  const [showArchived, setShowArchived] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [appsState, setAppsState] = useState(applications);

  const navigate = useNavigate();

  // Initial fetch + poll every 10s
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchApps = async () => {
      try {
        const data = await listApplications();
        if (isMounted) setAppsState(Array.isArray(data) ? data : []);
      } catch (_) {
        if (isMounted) setAppsState(Array.isArray(applications) ? applications : []);
      }
    };

    fetchApps();
    intervalId = setInterval(fetchApps, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [applications]);

  // Set reminders and auto-archive
  useEffect(() => {
    const today = new Date();
    setAppsState((prev = []) =>
      prev.map((app) => {
        const deadlineDate = new Date(app.deadline);
        const archiveDate = new Date(deadlineDate);
        archiveDate.setDate(deadlineDate.getDate() + 2); // 2-day grace

        const reminder = !app.archived && today > deadlineDate && today <= archiveDate;
        const overdue = !app.archived && today > archiveDate;

        return {
          ...app,
          reminder,
          overdue,
          archived: app.archived || overdue
        };
      })
    );
  }, [applications]);

  const activeApps = appsState.filter((app) => !app.archived);
  const archivedApps = appsState.filter((app) => app.archived);
  const displayedApps = showArchived ? archivedApps : activeApps;

  const handleGenerateCoverLetter = async (app) => {
    setLoadingId(app.id);

    try {
      const response = await fetch("http://localhost:5000/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: app.company, role: app.role }),
      });

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate cover letter");
    }

    setLoadingId(null);
  };

  const updateStatus = async (appId, newStatus) => {
    setAppsState((prev = []) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    try {
      await updateApplicationStatus({ id: appId, status: newStatus });
    } catch (_) {
      setAppsState((prev = []) =>
        prev.map((app) => (app.id === appId ? { ...app, status: app.status } : app))
      );
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray dark:text-white mb-2">
              {showArchived ? "Archived Applications" : "Job Applications"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {showArchived
                ? `${archivedApps.length} archived applications`
                : `${activeApps.length} active applications`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              onClick={() => navigate("/add")}
            >
              <span className="material-symbols-outlined">add</span>
              Add Application
            </button>
            <button
              className="bg-light-gray dark:bg-gray-800 text-dark-gray dark:text-white px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
              onClick={() => setShowArchived((prev) => !prev)}
            >
              <span className="material-symbols-outlined">
                {showArchived ? "visibility" : "archive"}
              </span>
              {showArchived ? "View Active" : "View Archived"}
            </button>
          </div>
        </div>

        {/* Applications List */}
        {displayedApps.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
                {showArchived ? "archive" : "work"}
              </span>
              <h3 className="text-xl font-semibold text-dark-gray dark:text-white mb-2">
                {showArchived ? "No archived applications" : "No applications yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {showArchived
                  ? "Applications will appear here after their deadline passes."
                  : "Start tracking your job applications by adding your first one."}
              </p>
              {!showArchived && (
                <button
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => navigate("/add")}
                >
                  Add Your First Application
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedApps.map((app) => (
              <div
                key={app.id}
                className={`bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border-l-4 transition-all duration-200 hover:shadow-xl ${
                  app.archived
                    ? "border-gray-400 opacity-75"
                    : app.reminder
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : app.overdue
                    ? "border-red-700 bg-red-100 dark:bg-red-900/40"
                    : "border-primary"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-dark-gray dark:text-white mb-1">
                      {app.company}
                    </h3>
                    <p className="text-primary font-medium">{app.role}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.archived
                        ? "bg-gray-500 text-white"
                        : app.reminder
                        ? "bg-red-500 text-white"
                        : app.overdue
                        ? "bg-red-700 text-white"
                        : app.status === "Pending"
                        ? "bg-gray-400 text-white"
                        : app.status === "Interview"
                        ? "bg-blue-500 text-white"
                        : app.status === "Offer"
                        ? "bg-success-green text-white"
                        : app.status === "Rejected"
                        ? "bg-red-500 text-white"
                        : app.status === "Withdrawn"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {app.archived
                      ? "Archived"
                      : app.reminder
                      ? "Reminder"
                      : app.overdue
                      ? "Overdue"
                      : app.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                    {app.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-gray-500 text-base">
                      schedule
                    </span>
                    <span
                      className={`font-medium ${
                        app.reminder || app.overdue
                          ? "text-red-600 font-bold"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      Deadline: {app.deadline}
                    </span>
                    {app.reminder && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {!app.archived && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {["Pending", "Interview", "Offer", "Rejected", "Withdrawn"].map(
                        (status) => (
                          <button
                            key={status}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              app.status === status
                                ? "bg-primary text-white"
                                : "bg-light-gray dark:bg-gray-800 text-dark-gray dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => updateStatus(app.id, status)}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
