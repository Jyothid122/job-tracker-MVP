import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApplication } from "../api";

export default function AddApplicationForm({ onAdd }) {
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

  const navigate = useNavigate();

  // Clear errors when user starts typing
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
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors = {};
    
    if (!company.trim()) {
      newErrors.company = "Company name is required";
    }
    
    if (!role.trim()) {
      newErrors.role = "Role/position is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Job description is required";
    }
    
    if (!deadline) {
      newErrors.deadline = "Application deadline is required";
    } else {
      // Check if deadline is in the future
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (deadlineDate < today) {
        newErrors.deadline = "Application deadline must be in the future";
      }
    }
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      await createApplication({ company, role, description, deadline, resume });
      if (typeof onAdd === "function") {
        onAdd({ company, role, description, deadline, resume });
      }
      setSubmitSuccess(true);
      
      // Show success message for 2 seconds before navigating
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 pb-2 justify-between bg-background-light dark:bg-background-dark">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-dark-gray dark:text-white flex size-12 shrink-0 items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-dark-gray dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Add New Application
        </h2>
        <div className="size-12 shrink-0" />
      </div>

      {/* Desktop Container */}
      <div className="max-w-4xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-dark-gray dark:text-white flex items-center gap-2 hover:bg-light-gray dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-dark-gray dark:text-white text-2xl font-bold">Add New Application</h1>
          <div className="w-20" />
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-900 md:mx-6 md:mt-6 md:rounded-xl md:shadow-lg">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 md:p-8 pb-0">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 flex items-center gap-4 animate-pulse">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
                </div>
                <div>
                  <h3 className="text-green-800 dark:text-green-200 font-semibold text-lg">Application Submitted Successfully!</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    Your application has been created and a workflow has been started. Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
            {/* Two Column Layout for Desktop */}
            <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-dark-gray dark:text-white text-base font-medium leading-normal pb-2">Company Name</p>
                <input
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-dark-gray dark:text-white focus:outline-0 focus:ring-0 border h-14 placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal ${
                    errors.company 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-light-gray dark:bg-gray-800 focus:border-primary'
                  }`}
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    clearError('company');
                  }}
                  disabled={isSubmitting || submitSuccess}
                  required
                />
                {errors.company && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.company}</p>
                )}
              </label>

              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-dark-gray dark:text-white text-base font-medium leading-normal pb-2">Role / Position</p>
                <input
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-dark-gray dark:text-white focus:outline-0 focus:ring-0 border h-14 placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal ${
                    errors.role 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-light-gray dark:bg-gray-800 focus:border-primary'
                  }`}
                  placeholder="Enter role or position"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    clearError('role');
                  }}
                  disabled={isSubmitting || submitSuccess}
                  required
                />
                {errors.role && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.role}</p>
                )}
              </label>
            </div>

            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-dark-gray dark:text-white text-base font-medium leading-normal pb-2">Job Description</p>
              <textarea
                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-dark-gray dark:text-white focus:outline-0 focus:ring-0 border min-h-36 placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal ${
                  errors.description 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-700 bg-light-gray dark:bg-gray-800 focus:border-primary'
                }`}
                placeholder="Paste the job description here"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError('description');
                }}
                disabled={isSubmitting || submitSuccess}
                required
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </label>

            <div className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between border border-gray-300 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-dark-gray dark:text-white flex items-center justify-center rounded-lg bg-light-gray dark:bg-gray-800 shrink-0 size-10">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <p className="text-dark-gray dark:text-white text-base font-normal leading-normal flex-1 truncate">
                  {resume ? resume.name : "Resume"}
                </p>
              </div>
              <div className="shrink-0">
                <label className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-light-gray dark:bg-gray-800 text-dark-gray dark:text-white text-sm font-medium leading-normal w-fit">
                  <span className="truncate">Upload Resume</span>
                  <input
                    type="file"
                    className="hidden"
                    disabled={isSubmitting || submitSuccess}
                    onChange={(e) => setResume(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  />
                </label>
              </div>
            </div>

            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-dark-gray dark:text-white text-base font-medium leading-normal pb-2">Application Deadline</p>
              <div className="relative">
                <input
                  type="date"
                  className={`hide-native-date-icon form-input flex w-full min-w-0 flex-1 overflow-hidden rounded-lg text-dark-gray dark:text-white focus:outline-0 focus:ring-0 border h-14 placeholder:text-gray-500 pl-[15px] pr-12 text-base font-normal leading-normal ${
                    errors.deadline 
                      ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-light-gray dark:bg-gray-800 focus:border-primary'
                  }`}
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    clearError('deadline');
                  }}
                  disabled={isSubmitting || submitSuccess}
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="material-symbols-outlined text-dark-gray dark:text-white">calendar_today</span>
                </div>
              </div>
              {errors.deadline && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.deadline}</p>
              )}
            </label>
          </form>

          {/* Submit Button */}
          <div className="p-4 md:p-8 pt-0 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess}
              className={`w-full flex items-center justify-center rounded-lg h-14 text-base font-medium leading-normal transition-colors ${
                isSubmitting || submitSuccess
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                  Submitting Application...
                </>
              ) : submitSuccess ? (
                <>
                  <span className="material-symbols-outlined mr-2">check_circle</span>
                  Successfully Submitted!
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}