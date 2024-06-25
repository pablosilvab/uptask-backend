import mongoose, { Document, Schema } from "mongoose";

export const userStatus = {
  CONFIRMED: "confirmed",
  NOT_CONFIRMED: "pending",
  INVITED: "invited",
} as const;

export type UserStatus = (typeof userStatus)[keyof typeof userStatus];

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  status: UserStatus;
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(userStatus),
    default: userStatus.NOT_CONFIRMED,
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
