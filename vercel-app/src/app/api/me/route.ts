import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToMongo();
  const user = await User.findById(payload.uid).select("userId name department email role").lean();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    user: {
      userId: user.userId,
      name: user.name,
      department: user.department,
      email: user.email,
      role: user.role,
    },
  });
}

