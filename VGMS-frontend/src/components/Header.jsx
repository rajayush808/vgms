import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const base =
    "px-4 py-2 rounded-lg transition hover:bg-gray-800 hover:text-white";
  const active = "bg-gray-800 text-white";

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-900 text-gray-300">
      <Link to="/" className="text-xl font-semibold">
        VGMS
      </Link>

      <nav className="space-x-3">
        <NavLink to="/login" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
          Login
        </NavLink>
        <NavLink to="/signup" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>
          Sign Up
        </NavLink>
      </nav>
    </header>
  );
}
