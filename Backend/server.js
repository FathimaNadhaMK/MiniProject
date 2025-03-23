import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import { WebSocketServer } from "ws";
import NodeCache from "node-cache";
import rateLimit from "express-rate-limit";

const app = express();
const parser = new Parser();
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use(limiter);

const RSS_FEEDS = [
  "https://go.lsgkerala.gov.in/pages/rss.php",
  "https://www.pib.gov.in/PressReleaseRSS.aspx",
  "https://www.india.gov.in/rss/india/news.rss"
];

// Helper functions
const helpers = {
  getSourceName: (url) => {
    const sources = {
      'go.lsgkerala.gov.in': 'Local Self Government (Kerala)',
      'pib.gov.in': 'Press Information Bureau',
      'india.gov.in': 'National Portal of India'
    };
    return sources[new URL(url).hostname] || 'Unknown Source';
  },

  removeDuplicates: (arr) => {
    return arr.filter((v, i, a) => 
      a.findIndex(t => (t.id === v.id)) === i
    );
  },

  formatDate: (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  }
};

const fetchRSSFeeds = async () => {
  let announcements = [];
  
  await Promise.all(RSS_FEEDS.map(async (url) => {
    try {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        announcements.push({
          id: item.guid || item.link,
          title: item.title?.trim() || 'No Title',
          date: helpers.formatDate(item.pubDate),
          link: item.link,
          description: item.contentSnippet?.substring(0, 200) + '...' || '',
          source: helpers.getSourceName(url)
        });
      });
    } catch (error) {
      console.error(`🚨 Error fetching ${url}:`, error.message);
    }
  }));

  return helpers.removeDuplicates(announcements);
};

// API endpoint with caching
app.get("/announcements", async (req, res) => {
  try {
    const cached = cache.get("announcements");
    if (cached) return res.json(cached);

    const announcements = await fetchRSSFeeds();
    cache.set("announcements", announcements);
    res.json(announcements);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// WebSocket Server
const server = app.listen(5000, () => {
  console.log("HTTP Server running on port 5000");
});

const wss = new WebSocketServer({ port: 5001 });
console.log("WebSocket Server running on ws://localhost:5001");

// Real-time updates
const broadcastAnnouncements = async () => {
  try {
    const announcements = await fetchRSSFeeds();
    const message = JSON.stringify({ 
      type: "NEW_ANNOUNCEMENT", 
      data: announcements 
    });

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error("Broadcast error:", error);
  }
};

setInterval(broadcastAnnouncements, 30000);