'use client'

import { useState } from 'react'

interface Scene {
  sceneNumber: number
  duration: number
  visualDescription: string
  narration: string
  textOverlay: string
}

interface ShortContent {
  title: string
  description: string
  scenes: Scene[]
  totalDuration: number
}

const themes = [
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'dinosaurs', name: 'Dinosaurs', emoji: '🦕' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'alphabet', name: 'ABC Learning', emoji: '🔤' },
  { id: 'numbers', name: 'Numbers', emoji: '🔢' },
  { id: 'colors', name: 'Colors', emoji: '🎨' },
  { id: 'shapes', name: 'Shapes', emoji: '⭐' },
]

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [duration, setDuration] = useState('30')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<ShortContent | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!selectedTheme && !customTopic) {
      setError('Please select a theme or enter a custom topic')
      return
    }

    setLoading(true)
    setError('')
    setContent(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: selectedTheme || customTopic,
          duration: parseInt(duration),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setContent(data)
    } catch (err) {
      setError('Failed to generate content. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!content) return

    const dataStr = JSON.stringify(content, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `youtube-short-${content.title.replace(/\s+/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 YouTube Kids Shorts Generator</h1>
        <p>Create engaging, educational content for kids in seconds!</p>
      </div>

      <div className="main-card">
        <div className="form-section">
          <div className="form-group">
            <label>Choose a Theme:</label>
            <div className="theme-grid">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTheme(theme.id)
                    setCustomTopic('')
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{theme.emoji}</div>
                  <div>{theme.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Or Enter Custom Topic:</label>
            <input
              type="text"
              placeholder="e.g., Fun facts about butterflies"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value)
                if (e.target.value) setSelectedTheme('')
              }}
            />
          </div>

          <div className="form-group">
            <label>Video Duration (seconds):</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="45">45 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </div>

          <button className="button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : '✨ Generate Short'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Creating your awesome kids short...</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {content && (
          <div className="results">
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>📝 Your Short is Ready!</h2>

            <div className="video-preview">
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                width: '80%'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{content.title}</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>9:16 Vertical Format</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
                  Duration: {content.totalDuration}s
                </p>
              </div>
            </div>

            <div className="script-section">
              <h3>📋 Video Script</h3>
              <p><strong>Title:</strong> {content.title}</p>
              <p style={{ marginTop: '10px' }}><strong>Description:</strong> {content.description}</p>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '15px' }}>Scenes:</h4>
                {content.scenes.map((scene) => (
                  <div key={scene.sceneNumber} className="scene">
                    <div className="scene-number">Scene {scene.sceneNumber} ({scene.duration}s)</div>
                    <p><strong>Visual:</strong> {scene.visualDescription}</p>
                    <p style={{ marginTop: '8px' }}><strong>Narration:</strong> {scene.narration}</p>
                    {scene.textOverlay && (
                      <p style={{ marginTop: '8px' }}><strong>Text:</strong> "{scene.textOverlay}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="button download-button" onClick={handleDownload}>
              💾 Download Script
            </button>
          </div>
        )}

        <div className="features">
          <div className="feature-card">
            <h3>🤖 AI-Powered</h3>
            <p>Advanced AI creates engaging, age-appropriate content automatically</p>
          </div>
          <div className="feature-card">
            <h3>📱 Short Format</h3>
            <p>Optimized for YouTube Shorts (9:16 vertical format)</p>
          </div>
          <div className="feature-card">
            <h3>🎓 Educational</h3>
            <p>Fun and educational content that kids love</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Fast</h3>
            <p>Generate complete video scripts in seconds</p>
          </div>
        </div>
      </div>
    </div>
  )
}
