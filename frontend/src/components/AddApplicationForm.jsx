import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createApplication } from "../api";

export default function AddApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const onAdd = location.state?.onAdd;

  const today = new Date();
  const defaultDeadline = new Date(today);
  defaultDeadline.setDate(today.getDate() + 28); // 4 weeks = 28 days
  const defaultDeadlineStr = defaultDeadline.toISOString().split("T")[0];

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadlineStr);
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!company.trim()) newErrors.company = "Company name is required";
    if (!role.trim()) newErrors.role = "Role/position is required";
    if (!description.trim()) newErrors.description = "Job description is required";
    if (!deadline) newErrors.deadline = "Application deadline is required";
    else {
      const deadlineDate = new Date(deadline);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (deadlineDate < todayDate) newErrors.deadline = "Deadline must be in the future";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const createdApp = await createApplication({ company, role, description, deadline, resume });
      if (typeof onAdd === "function") onAdd(createdApp);

      setSubmitSuccess(true);

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-dark-gray dark:text-white mb-6">
          Add New Application
        </h1>

        {submitSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 animate-pulse">
            <h3 className="text-green-800 dark:text-green-200 font-semibold">Application Submitted!</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <label className="flex flex-col">
              <span className="text-dark-gray dark:text-white mb-1">Company Name</span>
              <input
                type="text"
                value={company}
                onChange={(e) => { setCompany(e.target.value); clearError("company"); }}
                disabled={isSubmitting || submitSuccess}
                className={`form-input rounded-lg p-3 border ${
                  errors.company ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
            </label>

            <label className="flex flex-col">
              <span className="text-dark-gray dark:text-white mb-1">Role / Position</span>
              <input
                type="text"
                value={role}
                onChange={(e) => { setRole(e.target.value); clearError("role"); }}
                disabled={isSubmitting || submitSuccess}
                className={`form-input rounded-lg p-3 border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-dark-gray dark:text-white mb-1">Job Description</span>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
              disabled={isSubmitting || submitSuccess}
              className={`form-input rounded-lg p-3 border min-h-[120px] ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </label>

          <label className="flex flex-col">
            <span className="text-dark-gray dark:text-white mb-1">Deadline</span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); clearError("deadline"); }}
              disabled={isSubmitting || submitSuccess}
              className={`form-input rounded-lg p-3 border ${
                errors.deadline ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
            <span>{resume ? resume.name : "Upload Resume"}</span>
            <input
              type="file"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              disabled={isSubmitting || submitSuccess}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              isSubmitting || submitSuccess ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : submitSuccess ? "Submitted!" : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
