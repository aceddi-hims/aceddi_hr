import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Leave } from "@/models/Leave";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const payload = await getAuthPayload();
  if (!payload) redirect("/login");

  await connectToMongo();
  const user = await User.findById(payload.uid).select("userId name department email").lean();
  if (!user) redirect("/login");

  const leaves = await Leave.find({ user: user._id })
    .sort({ createdAt: -1 })
    .select("leaveType startDate endDate reason status")
    .lean();

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  };

  return (
    <>
      <link rel="stylesheet" href="/dashboard-styles.css" />
      <DashboardClient
        user={{
          userId: user.userId,
          name: user.name,
          department: user.department,
          email: user.email,
        }}
        initialLeaves={leaves.map((l) => ({
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          reason: l.reason,
          status: l.status,
        }))}
        initialStats={stats}
      />
    </>
  );
}

