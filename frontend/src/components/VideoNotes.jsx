import { useState, useRef } from 'react'

const CURATED_VIDEOS = [
  { id: 'design', title: 'The Design of Everyday Things', url: 'https://www.youtube.com/embed/yY96hTb8WgI', topic: 'Design Thinking' },
  { id: 'science', title: 'How We Learn', url: 'https://www.youtube.com/embed/JC82Il2cjqA', topic: 'Learning Science' },
  { id: 'tech', title: 'The Future of AI', url: 'https://www.youtube.com/embed/aircAruvnKk', topic: 'Technology' },
]

export default function VideoNotes({ onComplete }) {
  const [phase, setPhase] = useState('intro') // intro, watching, upload
  const [selectedVideo] = useState(CURATED_VIDEOS[1])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    onComplete({
      video_id: selectedVideo.id,
      video_topic: selectedVideo.topic,
      image: uploadedImage,
      image_data: imagePreview,
      timestamp: new Date().toISOString(),
    })
  }

  if (phase === 'intro') {
    return (
      <div className="glass-card animate-fade-in">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📝</div>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Watch & Take Handwritten Notes</h3>
          <p className="text-secondary" style={{ maxWidth: '500px', margin: '0 auto var(--space-lg)', fontSize: '0.95rem' }}>
            You'll watch a short video (about 5 minutes). While watching, <strong style={{ color: 'var(--text-primary)' }}>take notes by hand</strong> — 
            on paper, with a pen or pencil. Write however feels natural to you.
          </p>
          <div className="glass-card" style={{ 
            background: 'rgba(99, 102, 241, 0.06)', 
            border: '1px solid rgba(99, 102, 241, 0.15)',
            textAlign: 'left',
            maxWidth: '450px',
            margin: '0 auto var(--space-xl)',
            padding: 'var(--space-md) var(--space-lg)'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
              <strong style={{ color: 'var(--accent-primary-light)' }}>Why handwritten?</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your handwritten notes reveal how you organize information, what you prioritize, 
              and how you connect ideas — things that typed notes can't capture. There's no 
              right or wrong way to take notes.
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase('watching')}>
            I'm Ready — Show the Video →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'watching') {
    return (
      <div className="glass-card animate-fade-in">
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>
          Watching: <span className="text-gradient">{selectedVideo.topic}</span>
        </h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
          Take handwritten notes as you watch. When you're done, click "Upload My Notes" below.
        </p>

        {/* Video embed */}
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--border-glass)'
        }}>
          <iframe
            src={selectedVideo.url}
            title={selectedVideo.title}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase('upload')}>
            📸 Upload My Notes →
          </button>
        </div>
      </div>
    )
  }

  // Upload phase
  return (
    <div className="glass-card animate-fade-in">
      <h3 style={{ marginBottom: 'var(--space-sm)' }}>Upload Your Handwritten Notes</h3>
      <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
        Take a clear photo or scan of your handwritten notes. Make sure the text is readable.
      </p>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {!imagePreview ? (
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-zone-icon">📷</div>
          <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Click to upload your notes
          </p>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Supports JPG, PNG, HEIC • Max 10MB
          </p>
        </div>
      ) : (
        <div className="upload-zone has-file" onClick={() => fileInputRef.current?.click()}>
          <img
            src={imagePreview}
            alt="Your handwritten notes"
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-md)'
            }}
          />
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            ✓ Image uploaded — click to change
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!uploadedImage}
          style={{ opacity: uploadedImage ? 1 : 0.5 }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
