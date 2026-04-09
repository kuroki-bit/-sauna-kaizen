const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, "client", "dist")));

const saunas = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "saunas.json"), "utf-8")
);

// Get all saunas (ranking)
app.get("/api/saunas", (req, res) => {
  const { sort, area, tag } = req.query;
  let result = [...saunas];

  if (area && area !== "all") {
    result = result.filter((s) => s.area === area);
  }
  if (tag) {
    result = result.filter((s) => s.tags.includes(tag));
  }

  // Default sort by kaizenScore desc
  if (sort === "google") {
    result.sort((a, b) => b.googleScore - a.googleScore);
  } else if (sort === "potential") {
    result.sort((a, b) => b.potentialScore - a.potentialScore);
  } else {
    result.sort((a, b) => b.kaizenScore - a.kaizenScore);
  }

  res.json(result);
});

// Get single sauna detail
app.get("/api/saunas/:slug", (req, res) => {
  const sauna = saunas.find((s) => s.slug === req.params.slug);
  if (!sauna) return res.status(404).json({ error: "施設が見つかりません" });
  res.json(sauna);
});

// Get stats
app.get("/api/stats", (req, res) => {
  const totalFacilities = saunas.length;
  const avgKaizen = (
    saunas.reduce((sum, s) => sum + s.kaizenScore, 0) / saunas.length
  ).toFixed(1);
  const avgGoogle = (
    saunas.reduce((sum, s) => sum + s.googleScore, 0) / saunas.length
  ).toFixed(1);
  const topArea = Object.entries(
    saunas.reduce((acc, s) => {
      acc[s.area] = (acc[s.area] || 0) + s.kaizenScore;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0][0];

  res.json({ totalFacilities, avgKaizen, avgGoogle, topArea });
});

// SPA fallback
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Sauna Kaizen running on http://localhost:${PORT}`);
  });
}

module.exports = app;
