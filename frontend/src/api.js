const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function listApplications() {
  const res = await fetch(`${BASE_URL}/applications`);
  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`List failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function createApplication({ company, role, description, deadline, resume }) {
  const formData = new FormData();
  formData.append("company", company);
  formData.append("role", role);
  formData.append("description", description);
  formData.append("deadline", deadline);
  if (resume) formData.append("resume", resume);

  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`Create failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function updateApplicationStatus({ id, status }) {
  const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`Update status failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function safeReadText(res) {
  try {
    return await res.text();
  } catch (_) {
    return "";
  }
}


