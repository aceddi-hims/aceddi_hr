import mongoose, { Schema } from "mongoose";

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "paid" | "unpaid" | "vacation";

export type LeaveDoc = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
};

const LeaveSchema = new Schema<LeaveDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leaveType: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true, maxlength: 2000 },
    status: { type: String, required: true, default: "pending", index: true },
  },
  { timestamps: true }
);

export const Leave = mongoose.models.Leave ?? mongoose.model<LeaveDoc>("Leave", LeaveSchema);

