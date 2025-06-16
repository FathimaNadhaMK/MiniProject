// server.js in frontend/Traffic/
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 0; // 0 means random available port

// Serve static files from traffic/build
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html")); // ✅ Fix this line
});

const server = app.listen(PORT, () => {
  const actualPort = server.address().port;

  const configPath = path.resolve(__dirname, "../../public/config.json");

  const trafficUrl = `http://localhost:${actualPort}`;

  const configData = { trafficUrl };
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

  console.log(`🚦 Traffic server running at ${trafficUrl}`);
  console.log(`📄 Wrote to: ${configPath}`);
});
