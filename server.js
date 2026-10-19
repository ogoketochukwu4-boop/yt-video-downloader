import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/api/video-info', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    const data = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      author: info.videoDetails.author.name,
      timestamp: info.videoDetails.lengthSeconds,
      formats: formats.map(f => ({
        itag: f.itag,
        quality: f.quality,
        resolution: f.qualityLabel || `${f.width}x${f.height}`,
        mime: f.mime,
        contentLength: f.contentLength,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo
      }))
    };
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
});

app.get('/api/download', async (req, res) => {
  const { url, itag } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { itag: itag ? Number(itag) : undefined });
    if (!format) {
      return res.status(400).json({ error: 'Invalid format selected' });
    }
    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
    ytdl(url, { format }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
