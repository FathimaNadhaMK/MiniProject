import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true, // ✅ Indexed for fast lookups
    },
    title: {
      type: String,
      required: true,
      trim: true, // ✅ Removes extra spaces
    },
    date: {
      type: Date,
      required: true,
      default: Date.now, // ✅ Ensures default date
      index: true, // ✅ Indexing for sorting efficiency
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "No description available.",
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // ✅ Adds `createdAt` & `updatedAt`
);

// ✅ Compound Index: Improves query performance on frequently used fields
announcementSchema.index({ source: 1, date: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
