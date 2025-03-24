
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import Parser from "rss-parser";
import dotenv from "dotenv";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const parser = new Parser();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  date: String,
  link: String,
});

// ✅ Fetch RSS Feeds
const RSS_FEEDS = [
  "https://go.lsgkerala.gov.in/pages/rss.php",
  "https://www.pib.gov.in/PressReleaseRSS.aspx",
  "https://www.india.gov.in/rss/india/news.rss"
];

const fetchRSSNews = async () => {
  try {
    for (const url of RSS_FEEDS) {
      const feed = await parser.parseURL(url);
      feed.items.forEach(async (item) => {
        const existing = await Announcement.findOne({ id: item.guid || item.link });
        if (!existing) {
          await Announcement.create({
            id: item.guid || item.link,
            title: item.title,
            description: item.contentSnippet || "No description available.",
            date: item.pubDate || new Date().toISOString(),
            link: item.link,
          });
        }
      });
    }
    console.log("✅ RSS News Updated");
  } catch (error) {
    console.error("❌ RSS Fetch Error:", error);
  }
};

// Fetch latest announcements
app.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 }).limit(20);
    res.json(announcements);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

mongoose.connection.on("connected", () => console.log("✅ MongoDB Connected Successfully"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB Connection Error:", err));

// Start Express server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ WebSocket Server
const wss = new WebSocketServer({ port: 5001 });

wss.on("connection", (ws) => {
  console.log("🔗 WebSocket Connected");
  ws.on("message", (message) => console.log("📩 Received:", message));
  ws.on("close", () => console.log("⚠️ WebSocket Disconnected"));
});

// ✅ Fetch RSS News every 30 minutes
setInterval(fetchRSSNews, 1800000);

export { wss };
