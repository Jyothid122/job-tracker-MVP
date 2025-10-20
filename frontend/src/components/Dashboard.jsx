import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listApplications, updateApplicationStatus } from "../api";

export default function Dashboard() {
  const [showArchived, setShowArchived] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [appsState, setAppsState] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      try {
        const data = await listApplications();
        if (isMounted) setAppsState(Array.isArray(data) ? data : []);
      } catch (_) {}
    };
    fetchApps();
    const interval = setInterval(fetchApps, 10000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const today = new Date();
    setAppsState((prev) =>
      prev.map((app) => {
        const deadlineDate = new Date(app.deadline);
        const archiveDate = new Date(deadlineDate);
        archiveDate.setDate(deadlineDate.getDate() + 2);

        const reminder = !app.archived && today > deadlineDate && today <= archiveDate;
        const overdue = !app.archived && today > archiveDate;

        return { ...app, reminder, overdue, archived: app.archived || overdue };
      })
    );
  }, [appsState]);

  const handleAddApplication = (newApp) => {
    setAppsState(prev => [...prev, newApp]);
  };

  const handleGenerateCoverLetter = async (app) => {
    setLoadingId(app.id);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/generate-cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: app.company, role: app.role }),
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate cover letter");
    }
    setLoadingId(null);
  };

  const updateStatus = async (appId, newStatus) => {
    setAppsState((prev) => prev.map((app) => app.id === appId ? { ...app, status: newStatus } : app));
    try {
      await updateApplicationStatus({ id: appId, status: newStatus });
    } catch (_) {
      setAppsState((prev) => prev.map((app) => app.id === appId ? { ...app, status: app.status } : app));
    }
  };

  const activeApps = appsState.filter(app => !app.archived);
  const archivedApps = appsState.filter(app => app.archived);
  const displayedApps = showArchived ? archivedApps : activeApps;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-gray dark:text-white">Job Applications Tracker</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate("/add", { state: { onAdd: handleAddApplication } })} className="bg-primary text-white px-4 py-2 rounded-lg">Add Application</button>
            <button onClick={() => setShowArchived(!showArchived)} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">{showArchived ? "Show Active" : "Show Archived"}</button>
          </div>
        </div>

        {displayedApps.length === 0 ? (
          <p className="text-center text-gray-500">{showArchived ? "No archived applications" : "No applications yet."}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedApps.map((app) => (
              <div key={app.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border-l-4">
                <h3 className="font-bold text-lg">{app.company}</h3>
                <p className="text-primary">{app.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{app.description}</p>
                <span className="text-sm font-medium">Deadline: {app.deadline}</span>
                {!app.archived && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {["Pending","Interview","Offer","Rejected","Withdrawn"].map(status => (
                      <button key={status} onClick={() => updateStatus(app.id, status)} className={`px-2 py-1 rounded-full text-xs ${app.status === status ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"}`}>{status}</button>
                    ))}
                    <button onClick={() => handleGenerateCoverLetter(app)} className="bg-blue-600 text-white px-2 py-1 rounded">Generate Cover Letter</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-11/12 md:w-2/3 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Generated Cover Letter</h2>
              <div className="mb-4 whitespace-pre-wrap">{coverLetter}</div>
              <button onClick={() => setShowModal(false)} className="bg-primary text-white px-4 py-2 rounded-lg">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
