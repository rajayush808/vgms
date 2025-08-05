import { useState } from "react";
import { signup } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [values, setValues] = useState({
    username: "", // ✅ changed from name
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signup(values);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to sign up. Please try again."
      );
    }
  };

  return (
    <section className="w-full flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-900 p-8 rounded-xl shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-white mb-6">Create account</h1>

        <label className="block mb-4">
          <span className="text-gray-400">Username</span>
          <input
            name="username" // ✅ changed from name
            required
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
            onChange={handleChange}
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
            onChange={handleChange}
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-400">Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
            onChange={handleChange}
          />
        </label>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium">
          Sign up
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 underline">
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
}
