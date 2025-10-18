// src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AddApplicationForm from "./components/AddApplicationForm";

function App() {
  const [applications, setApplications] = useState([]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4 flex justify-between">
          <Link to="/" className="font-bold">Job Tracker</Link>
        </nav>
        <Routes>
<Route
  path="/"
  element={<Dashboard applications={applications} setApplications={setApplications} />}
/>

          <Route path="/add" element={<AddApplicationForm onAdd={(app) => setApplications([app, ...applications])} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
