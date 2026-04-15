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

const PREFECTURE_AREAS = {
  "東京都": ["新宿", "渋谷", "赤坂", "神田", "錦糸町", "後楽園", "両国", "下北沢", "代官山", "代々木上原", "麻布十番", "四谷三丁目", "大井町", "高輪"],
  "神奈川県": ["横浜", "川崎", "相模原", "藤沢", "厚木", "小田原"],
  "埼玉県": ["さいたま", "川越", "浦和", "大宮", "所沢", "越谷"],
  "千葉県": ["千葉", "船橋", "柏", "松戸", "市川", "成田"],
  "茨城県": ["水戸", "つくば", "土浦", "日立"],
  "栃木県": ["宇都宮", "小山", "栃木", "那須塩原"],
  "群馬県": ["前橋", "高崎", "太田", "伊勢崎"],
};

// Get all saunas (ranking)
app.get("/api/saunas", (req, res) => {
  const { sort, area, tag } = req.query;
  let result = [...saunas];

  if (area && area !== "all") {
    if (PREFECTURE_AREAS[area]) {
      result = result.filter((s) => PREFECTURE_AREAS[area].includes(s.area));
    } else {
      result = result.filter((s) => s.area === area);
    }
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
