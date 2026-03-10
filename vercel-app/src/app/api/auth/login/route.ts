import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    await connectToMongo();
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setAuthCookie({ uid: String(user._id), email: user.email, name: user.name });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

