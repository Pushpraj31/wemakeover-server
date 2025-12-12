import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      index: true, // optimize queries by email
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    message: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
      index: true, // allow filtering messages by status
    },
  },
  { timestamps: true }
);

// optional: compound index for faster filtering
contactMessageSchema.index({ email: 1, status: 1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
