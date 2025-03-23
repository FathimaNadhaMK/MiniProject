import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  id: { 
    type: String, 
    unique: true, 
    required: true,
    index: true // Added index for better performance
  },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String, required: true },
  description: { type: String },
  source: { type: String, required: true }
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;