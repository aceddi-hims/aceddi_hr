import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthPayload } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Leave } from "@/models/Leave";

export async function GET() {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToMongo();
  const user = await User.findById(payload.uid).select("_id").lean();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leaves = await Leave.find({ user: user._id })
    .sort({ createdAt: -1 })
    .select("leaveType startDate endDate reason status createdAt")
    .lean();

  const stats = {
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  };

  return NextResponse.json({ leaves, stats });
}

export async function POST(req: Request) {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  };

  const leaveType = (body.leaveType ?? "").trim();
  const startDate = (body.startDate ?? "").trim();
  const endDate = (body.endDate ?? "").trim();
  const reason = (body.reason ?? "").trim();

  const allowedTypes = new Set(["paid", "unpaid", "vacation"]);
  if (!allowedTypes.has(leaveType)) {
    return NextResponse.json({ error: "Invalid leave type." }, { status: 400 });
  }
  if (!startDate || !endDate || !reason) {
    return NextResponse.json({ error: "Please fill in all leave fields." }, { status: 400 });
  }
  if (Date.parse(endDate) < Date.parse(startDate)) {
    return NextResponse.json({ error: "End date must be the same or after start date." }, { status: 400 });
  }

  await connectToMongo();
  const user = await User.findById(payload.uid).select("_id").lean();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await Leave.create({
    user: new mongoose.Types.ObjectId(String(user._id)),
    leaveType,
    startDate,
    endDate,
    reason,
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}

