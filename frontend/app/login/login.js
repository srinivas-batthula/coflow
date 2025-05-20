import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function LoginForm({ onSwitch }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const success = await login(email, password);
    if (success) {
      router.push("/");
    }
    // error is handled by zustand store and shown below
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col justify-center h-full transition-opacity duration-700 ease-in-out"
    >
      <h2
        className="text-2xl font-bold mb-6 text-purple-700 text-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Login
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">Email</label>
        <input
          ref={emailRef}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Password</label>
        <input
          ref={passwordRef}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />
      </div>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-purple-700 font-semibold hover:underline cursor-pointer"
          onClick={onSwitch}
        >
          Sign Up
        </button>
      </p>
    </form>
  );
}
