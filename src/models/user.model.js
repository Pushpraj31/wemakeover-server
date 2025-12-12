import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Prevent password from being returned by default
    },
    passwordChangedAt: {
      type: Date,
    },


    role: {
      type: String,
      enum: ["user", "admin"], // only allow these values
      default: "user", // every new user defaults to "user"
    },

    isVerfied: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  
  // IMPORTANT: mark when password was changed
  this.passwordChangedAt = Date.now();
  
  next();
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Model export (after all schema definitions)
export const User = mongoose.model("User", userSchema);
