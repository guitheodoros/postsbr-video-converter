const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { execFile } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(cors());

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "PostSBR video converter online" });
});

app.get("/debug", (req, res) => {
  res.json({
    ffmpegPath,
    ffmpegExists: fs.existsSync(ffmpegPath),
    platform: os.platform(),
    arch: os.arch()
  });
});

app.post("/convert", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo de vídeo enviado" });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath + ".mp4";

  execFile(ffmpegPath, [
    "-y",
    "-nostdin",
    "-threads", "2",
    "-i", inputPath,
    "-c:v", "libx264",
    "-threads", "2",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    "-fps_mode", "cfr",
    "-movflags", "+faststart",
    outputPath
  ], { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
    fs.unlink(inputPath, () => {});

    if (err) {
      console.error("ffmpeg error:", { code: err.code, signal: err.signal, killed: err.killed, message: err.message });
      return res.status(500).json({
        error: "Falha na conversão do vídeo",
        code: err.code,
        signal: err.signal,
        killed: err.killed,
        stderr: String(stderr).slice(-2000)
      });
    }

    res.sendFile(outputPath, (sendErr) => {
      fs.unlink(outputPath, () => {});
      if (sendErr) console.error("send error:", sendErr);
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("PostSBR video converter listening on port " + PORT);
});
