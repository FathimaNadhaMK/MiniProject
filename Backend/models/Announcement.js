import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  date: String,
  link: String,
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
