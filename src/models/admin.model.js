import mongoose from "mongoose";
import bcrypt from "bcrypt";
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
