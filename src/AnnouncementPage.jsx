import React, { useState, useEffect } from "react";

const AnnouncementPage = () => {
  const [query, setQuery] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [savedAnnouncements, setSavedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);

  // ✅ Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("http://localhost:5000/announcements");
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Connect to WebSocket
  const connectWebSocket = () => {
    const newWs = new WebSocket("ws://localhost:5001");

    newWs.onopen = () => console.log("🔗 WebSocket Connected");
    newWs.onerror = (error) => console.error("❌ WebSocket Error:", error);
    newWs.onclose = () => {
      console.log("⚠️ WebSocket Disconnected. Reconnecting in 5s...");
      setTimeout(connectWebSocket, 5000);
    };

    setWs(newWs);
  };

  useEffect(() => {
    fetchAnnouncements();
    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredAnnouncements(announcements);
      return;
    }
    const filtered = announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      (announcement.description?.toLowerCase() || "").includes(query.toLowerCase())
    );
    setFilteredAnnouncements(filtered);
  }, [query, announcements]);

  return (
    <div style={{ fontFamily: "'Fira Sans', sans-serif", maxWidth: "800px", margin: "40px auto", padding: "20px", backgroundColor: "#f5f5f5" }}>
      <header style={{ textAlign: "center", padding: "10px", background: "#667eea", color: "#fff", borderRadius: "8px", marginBottom: "20px" }}>
        <h1>Government Announcements</h1>
      </header>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search announcements..."
          style={{ padding: "10px", fontSize: "16px", width: "70%", borderRadius: "4px", border: "1px solid #ddd", marginRight: "10px" }}
        />
        <button
          onClick={() => setFilteredAnnouncements(announcements.filter(a => a.title.toLowerCase().includes(query.toLowerCase())))}
          style={{ padding: "10px 20px", width: "160px", height: "60px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "18px", background: "#ff9800", color: "#fff" }}
        >
          🔍 Search
        </button>
      </div>

      <div style={{ maxHeight: "400px", overflowY: "scroll", backgroundColor: "#ffffff", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>
        {loading ? (
          <p>Loading announcements...</p>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              <h3>{announcement.title}</h3>
              <p>{announcement.description}</p>
              <a href={announcement.link} target="_blank" rel="noopener noreferrer">Read More</a>
            </div>
          ))
        ) : (
          <p>No announcements found.</p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPage;
