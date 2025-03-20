import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import { WebSocketServer } from "ws";

const app = express();
const parser = new Parser();

app.use(cors());
app.use(express.json());

const RSS_FEEDS = [
    "https://go.lsgkerala.gov.in/pages/rss.php",
    "https://www.pib.gov.in/PressReleaseRSS.aspx",
    "https://www.india.gov.in/rss/india/news.rss"
];

const fetchRSSFeeds = async () => {
    try {
        let announcements = [];
        for (const url of RSS_FEEDS) {
            const feed = await parser.parseURL(url);
            feed.items.forEach(item => {
                announcements.push({
                    id: item.guid || item.link,
                    title: item.title,
                    date: item.pubDate,
                    link: item.link,
                    description: item.contentSnippet || item.description
                });
            });
        }
        return announcements;
    } catch (error) {
        console.error("Error fetching RSS feeds:", error);
        return [];
    }
};

// API to fetch announcements
app.get("/announcements", async (req, res) => {
    const announcements = await fetchRSSFeeds();
    res.json(announcements);
});

// Start HTTP Server
const server = app.listen(5000, () => {
    console.log("Server running on port 5000");
});

// 🟢 **Create WebSocket Server**
const wss = new WebSocketServer({ port: 5001 });
console.log("WebSocket Server running on ws://localhost:5001");

// Function to broadcast new announcements
const broadcastAnnouncements = async () => {
    const announcements = await fetchRSSFeeds();
    const message = JSON.stringify({ type: "NEW_ANNOUNCEMENT", data: announcements });

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
};

// Fetch new announcements every 30 seconds & send updates
setInterval(broadcastAnnouncements, 30000);
