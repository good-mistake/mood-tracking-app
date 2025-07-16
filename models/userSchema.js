import mongoose from "mongoose";
const moodSchema = new mongoose.Schema({
  createdAt: Date,
  mood: Number,
  feelings: [String],
  journalEntry: String,
  sleepHours: Number,
  id: String,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOnboarded: { type: Boolean, default: false },
  moodEntries: [moodSchema],
  profilePic: String,
  id: String,
  name: { type: String },
  fullName: { type: String },
});
export default mongoose.models.User || mongoose.model("User", userSchema);
