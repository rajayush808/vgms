import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const base =
    "px-4 py-2 rounded-lg transition hover:bg-gray-700 hover:text-white";
  const active = "bg-gray-700 text-white";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-900 text-gray-300 border-b border-gray-800">
      <Link to="/" className="flex items-center space-x-3">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          VGMS
        </div>
      </Link>

      <nav className="hidden md:flex space-x-1">
        {user ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/games" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Browse Games
            </NavLink>
            <NavLink to="/library" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              My Library
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Statistics
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/games" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Browse Games
            </NavLink>
          </>
        )}
      </nav>

      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
              Login
            </NavLink>
            <NavLink 
              to="/signup" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white"
            >
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
