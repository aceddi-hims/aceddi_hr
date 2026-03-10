import mongoose, { Schema } from "mongoose";

export type UserDoc = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  department: string;
  email: string;
  role: "employee" | "admin";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDoc>(
  {
    userId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    department: { type: String, required: true, trim: true, maxlength: 255 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 255 },
    role: { type: String, required: true, default: "employee" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User ?? mongoose.model<UserDoc>("User", UserSchema);

