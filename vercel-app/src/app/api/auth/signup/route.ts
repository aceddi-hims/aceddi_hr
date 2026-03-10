import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      name?: string;
      department?: string;
      email?: string;
      password?: string;
    };

    const userId = (body.userId ?? "").trim();
    const name = (body.name ?? "").trim();
    const department = (body.department ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!userId || !name || !department || !email || !password) {
      return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await connectToMongo();

    const existing = await User.findOne({ $or: [{ email }, { userId }] }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email or User ID already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId,
      name,
      department,
      email,
      role: "employee",
      passwordHash,
    });

    await setAuthCookie({ uid: String(user._id), email: user.email, name: user.name });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}

