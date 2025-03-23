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
      const data = await response.json();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // ✅ WebSocket Connection
    const connectWebSocket = () => {
      const newWs = new WebSocket("ws://localhost:5001");
      setWs(newWs);

      newWs.onopen = () => console.log("🔗 WebSocket Connected");
      newWs.onerror = (error) => console.error("❌ WebSocket Error:", error);
      newWs.onclose = () => {
        console.log("⚠️ WebSocket Disconnected. Reconnecting in 5s...");
        setTimeout(connectWebSocket, 5000);
      };

      newWs.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "NEW_ANNOUNCEMENT") {
          handleNewAnnouncements(message.data);
        }
      };
    };

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


  // ✅ Handle new announcements & notifications
  const handleNewAnnouncements = (newAnnouncements) => {
    const unseenAnnouncements = newAnnouncements.filter(
      (announcement) => !announcements.some((a) => a.id === announcement.id)
    );

    if (unseenAnnouncements.length > 0) {
      setAnnouncements((prev) => [...unseenAnnouncements, ...prev]);
      setFilteredAnnouncements((prev) => [...unseenAnnouncements, ...prev]);
      showNotification(unseenAnnouncements);
    }
  };

  // ✅ Show browser notification for new announcements
  const showNotification = (newAnnouncements) => {
    if (Notification.permission === "granted") {
      newAnnouncements.forEach((announcement) => {
        new Notification("📢 New Announcement!", {
          body: announcement.title,
          icon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Loudspeaker.svg",
          requireInteraction: true,
        });
      });
    }
  };

  // ✅ Request Notification Permission on Load
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log(`🔔 Notification permission: ${permission}`);
      });
    }
  }, []);

  // ✅ Search Announcements
  const handleSearch = () => {
    if (!query.trim()) {
      setFilteredAnnouncements(announcements);
      return;
    }
    const filtered = announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      announcement.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAnnouncements(filtered);
  };

  // ✅ Save announcement to local storage
  const toggleSave = (announcement) => {
    let updatedSaved = [...savedAnnouncements];
    if (savedAnnouncements.find((a) => a.id === announcement.id)) {
      updatedSaved = savedAnnouncements.filter((a) => a.id !== announcement.id);
    } else {
      updatedSaved.push(announcement);
    }
    setSavedAnnouncements(updatedSaved);
    localStorage.setItem("savedAnnouncements", JSON.stringify(updatedSaved));
  };

  // ✅ Load saved announcements from local storage
  useEffect(() => {
    const saved = localStorage.getItem("savedAnnouncements");
    if (saved) {
      setSavedAnnouncements(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Fira Sans', sans-serif", maxWidth: "800px", margin: "40px auto", padding: "20px", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header style={{ textAlign: "center", padding: "10px", background: "#667eea", color: "#fff", borderRadius: "8px", marginBottom: "20px" }}>
        <h1>Government Announcements</h1>
      </header>

      {/* Search Bar */}
      <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search announcements..."
    style={{ padding: "10px", fontSize: "16px", width: "70%", borderRadius: "4px", border: "1px solid #ddd", marginRight: "10px" }}
/>
<button onClick={handleSearch} style={{ padding: "10px 20px", backgroundColor: "#667eea", color: "#fff", borderRadius: "4px", border: "none", cursor: "pointer" }}>
    🔍 Search
</button>

     

      {/* Announcements */}
      <div style={{ maxHeight: "400px", overflowY: "scroll", backgroundColor: "#fff", padding: "10px", borderRadius: "4px" }}>
        {loading ? (
          <p>Loading announcements...</p>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              <h3>{announcement.title}</h3>
              <p style={{ fontSize: "14px", color: "#666" }}>{announcement.date}</p>
              <p>{announcement.description}</p>
              <a href={announcement.link} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "none" }}>
                Read more
              </a>
              <button 
                onClick={() => toggleSave(announcement)} 
                style={{
                  marginLeft: "10px", 
                  padding: "5px 10px", 
                  backgroundColor: savedAnnouncements.find(a => a.id === announcement.id) ? "gray" : "green", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: "pointer"
                }}>
                {savedAnnouncements.find(a => a.id === announcement.id) ? "Saved" : "Save"}
              </button>
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
