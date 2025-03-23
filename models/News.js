import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: String,
  link: { type: String, unique: true },
  description: String,
  pubDate: Date,
  location: [String],
});

// Indexes
newsSchema.index({ pubDate: -1 });
newsSchema.index({ location: 1 });
newsSchema.index({ pubDate: 1 }, { expireAfterSeconds: 259200 }); // Auto-delete after 3 days

const News = mongoose.model("News", newsSchema);

export default News;