import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    due_date: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Due date must be a future date.",
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "overdue"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
