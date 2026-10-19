import React, { useState } from 'react';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
    if (error) setError('');
    if (videoInfo) setVideoInfo(null);
    if (selectedFormat) setSelectedFormat(null);
  };

  const fetchVideoInfo = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube video URL');
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})(.*)?$/;
    if (!youtubeRegex.test(videoUrl)) {
      setError('Please enter a valid YouTube video URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(videoUrl)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info');
      }
      setVideoInfo(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching video info');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat) {
      setError('Please select a video format');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(videoUrl)}&itag=${selectedFormat.itag}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download video');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoInfo.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'An error occurred while downloading the video');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Video Downloader</h1>
        <p>Download YouTube videos in various formats and qualities</p>
      </header>

      <main className="main">
        <div className="input-section">
          <div className="input-group">
            <input
              type="text"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="Paste YouTube video URL here"
              className="url-input"
            />
            <button
              onClick={fetchVideoInfo}
              disabled={loading || !videoUrl}
              className={`fetch-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Loading...' : 'Get Info'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {videoInfo && (
          <div className="video-info-section">
            <div className="video-preview">
              <img src={videoInfo.thumbnail} alt={videoInfo.title} className="thumbnail" />
              <div className="video-details">
                <h2 className="title">{videoInfo.title}</h2>
                <p className="author">By {videoInfo.author}</p>
                <p className="duration">Duration: {Math.floor(videoInfo.timestamp / 60)}:{String(videoInfo.timestamp % 60).padStart(2, '0')}</p>
              </div>
            </div>

            <div className="format-section">
              <h3>Select Quality & Format</h3>
              <div className="formats-grid">
                {videoInfo.formats.map((format) => (
                  <div
                    key={format.itag}
                    className={`format-card ${selectedFormat?.itag === format.itag ? 'selected' : ''}`}
                    onClick={() => setSelectedFormat(format)}
                  >
                    <div className="format-quality">
                      {format.resolution}
                      {format.quality}
                    </div>
                    <div className="format-info">
                      <span>{format.mime}</span>
                      <span>{format.hasAudio ? '✓ Audio' : '✗ Audio'}</span>
                      <span>{format.hasVideo ? '✓ Video' : '✗ Video'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="download-section">
              <button
                onClick={handleDownload}
                disabled={downloading || !selectedFormat}
                className={`download-btn ${downloading ? 'loading' : ''}`}
              >
                {downloading ? 'Downloading...' : 'Download Video'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Developed with ❤️ for downloading YouTube content</p>
      </footer>
    </div>
  );
}

export default App;
