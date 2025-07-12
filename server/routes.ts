import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { commentCode } from "./services/openai";
import { convertImage } from "./services/fileProcessor";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Comment code endpoint
  app.post("/api/comment-code", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }
      
      const commentedCode = await commentCode(code, language);
      
      res.json({ commentedCode });
    } catch (error) {
      console.error("Code commenting error:", error);
      res.status(500).json({ error: "Failed to comment code" });
    }
  });

  // Image conversion endpoint
  app.post("/api/convert-image", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      
      const { format } = req.body;
      
      if (!format) {
        return res.status(400).json({ error: "Output format is required" });
      }
      
      const convertedBuffer = await convertImage(req.file.buffer, format);
      
      res.set({
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="converted.${format}"`
      });
      
      res.send(convertedBuffer);
    } catch (error) {
      console.error("Image conversion error:", error);
      res.status(500).json({ error: "Failed to convert image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
