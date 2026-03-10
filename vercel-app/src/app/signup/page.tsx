"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, department, email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign up failed.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <div className="signup-container">
        <div className="signup-box">
          <h1>Create Account</h1>

          {error ? (
            <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 600 }}>{error}</div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="userId">User ID:</label>
              <input type="text" id="userId" required value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department:</label>
              <input
                type="text"
                id="department"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <p className="login-link">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

