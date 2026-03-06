"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTopError("");
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setTopError(data.detail || "Login failed. Please try again.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/playground");
    } catch {
      setTopError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500 text-center">
          Log in to Prompt Playground
        </p>

        {topError && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {topError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#4F46E5] hover:text-[#4338CA]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
