import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const EXAM_FILE = path.join(DATA_DIR, "exam.json");
const MEDIA_DIR = path.join(__dirname, "public", "media");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images/audio
  app.use(express.json({ limit: "50mb" }));

  // API: Save Exam
  app.post("/api/save-exam", (req, res) => {
    try {
      const examData = req.body;
      
      // We could extract base64 to separate files here to keep JSON small,
      // but for simplicity and to fulfill "database of github" (one file),
      // we'll save it all to the JSON file for now.
      // Node.js can handle large JSON files fine.
      
      fs.writeFileSync(EXAM_FILE, JSON.stringify(examData, null, 2));
      res.json({ success: true, message: "Exam saved to project database!" });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ success: false, error: "Failed to save exam data." });
    }
  });

  // API: Load Exam
  app.get("/api/load-exam", (req, res) => {
    try {
      if (fs.existsSync(EXAM_FILE)) {
        const data = fs.readFileSync(EXAM_FILE, "utf-8");
        res.json(JSON.parse(data));
      } else {
        res.status(404).json({ error: "No exam data found." });
      }
    } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ error: "Failed to load exam data." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
