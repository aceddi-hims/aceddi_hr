"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LeaveItem = {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
};

export default function DashboardClient(props: {
  user: { userId: string; name: string; department: string; email: string };
  initialLeaves: LeaveItem[];
  initialStats: { pending: number; approved: number; rejected: number };
}) {
  const router = useRouter();
  const [active, setActive] = useState<"dashboard" | "submit-leave" | "my-leaves" | "profile">("dashboard");
  const [leaves, setLeaves] = useState<LeaveItem[]>(props.initialLeaves);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const s = { pending: 0, approved: 0, rejected: 0 };
    for (const l of leaves) {
      if (l.status === "pending") s.pending++;
      if (l.status === "approved") s.approved++;
      if (l.status === "rejected") s.rejected++;
    }
    return s;
  }, [leaves]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function submitLeave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);
      const leaveType = String(form.get("leaveType") ?? "");
      const startDate = String(form.get("startDate") ?? "");
      const endDate = String(form.get("endDate") ?? "");
      const reason = String(form.get("reason") ?? "");

      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Error submitting leave.");
        return;
      }

      // Refresh list
      const res2 = await fetch("/api/leaves");
      const data2 = (await res2.json()) as { leaves?: LeaveItem[]; error?: string };
      if (res2.ok && data2.leaves) setLeaves(data2.leaves);

      (e.target as HTMLFormElement).reset();
      setMsg("Leave request submitted successfully!");
      setActive("my-leaves");
    } catch {
      setErr("Error submitting leave.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>ACEDDI HR</h2>
        <nav>
          <a
            href="#dashboard"
            className={`nav-link ${active === "dashboard" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActive("dashboard");
            }}
          >
            Dashboard
          </a>
          <a
            href="#submit-leave"
            className={`nav-link ${active === "submit-leave" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActive("submit-leave");
            }}
          >
            Submit Leave
          </a>
          <a
            href="#my-leaves"
            className={`nav-link ${active === "my-leaves" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActive("my-leaves");
            }}
          >
            My Leaves
          </a>
          <a
            href="#profile"
            className={`nav-link ${active === "profile" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActive("profile");
            }}
          >
            Profile
          </a>
          <a
            href="#logout"
            className="nav-link logout"
            onClick={(e) => {
              e.preventDefault();
              void logout();
            }}
          >
            Logout
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h1>Employee Dashboard</h1>
          <span className="user-name">{props.user.name}</span>
        </header>

        <div className="content-area">
          {msg ? <div style={{ marginBottom: 12, color: "#065f46", fontWeight: 600 }}>{msg}</div> : null}
          {err ? <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 600 }}>{err}</div> : null}

          <section id="dashboard" className={`section ${active === "dashboard" ? "active" : ""}`}>
            <h2>Welcome Back!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Pending Leaves</h3>
                <p>{stats.pending}</p>
              </div>
              <div className="stat-card">
                <h3>Approved Leaves</h3>
                <p>{stats.approved}</p>
              </div>
              <div className="stat-card">
                <h3>Rejected Leaves</h3>
                <p>{stats.rejected}</p>
              </div>
            </div>
          </section>

          <section id="submit-leave" className={`section ${active === "submit-leave" ? "active" : ""}`}>
            <h2>Submit Leave Request</h2>
            <form onSubmit={submitLeave}>
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type:</label>
                <select id="leaveType" name="leaveType" required defaultValue="">
                  <option value="">Select Leave Type</option>
                  <option value="paid">Paid Leave</option>
                  <option value="unpaid">Leave Without Pay</option>
                  <option value="vacation">Vacation Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input type="date" id="startDate" name="startDate" required />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input type="date" id="endDate" name="endDate" required />
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason:</label>
                <textarea id="reason" name="reason" rows={4} required />
              </div>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          </section>

          <section id="my-leaves" className={`section ${active === "my-leaves" ? "active" : ""}`}>
            <h2>My Leave Applications</h2>
            <div className="leaves-list">
              {leaves.length === 0 ? (
                <div className="leave-card">
                  <h3>No leave applications yet</h3>
                  <p>Submit your first leave request from the "Submit Leave" section.</p>
                </div>
              ) : (
                leaves.map((leave, idx) => (
                  <div key={idx} className={`leave-card status-${leave.status}`}>
                    <h3>{leave.leaveType.toUpperCase()}</h3>
                    <p>
                      <strong>From:</strong> {leave.startDate} <strong>To:</strong> {leave.endDate}
                    </p>
                    <p>
                      <strong>Reason:</strong> {leave.reason}
                    </p>
                    <p className="status">
                      <strong>Status:</strong>{" "}
                      <span className={`badge badge-${leave.status}`}>{leave.status.toUpperCase()}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="profile" className={`section ${active === "profile" ? "active" : ""}`}>
            <h2>My Profile</h2>
            <div className="profile-info">
              <p>
                <strong>User ID:</strong> <span>{props.user.userId}</span>
              </p>
              <p>
                <strong>Name:</strong> <span>{props.user.name}</span>
              </p>
              <p>
                <strong>Department:</strong> <span>{props.user.department}</span>
              </p>
              <p>
                <strong>Email:</strong> <span>{props.user.email}</span>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

