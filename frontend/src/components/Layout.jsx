import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Job Tracker</h1>
        <div className="space-x-4">
          <Link
            to="/"
            className={`px-3 py-1 rounded ${
              location.pathname === "/" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Job Tracker
          </Link>
         
        </div>
      </nav>

      {/* Main content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
