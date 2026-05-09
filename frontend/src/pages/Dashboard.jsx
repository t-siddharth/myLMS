import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function RadarChart({ domains }) {
  const size = 260
  const center = size / 2
  const maxRadius = 100
  const labels = Object.keys(domains)
  const angleStep = (2 * Math.PI) / labels.length

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2
    const r = (value / 10) * maxRadius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const dataPoints = labels.map((_, i) => getPoint(i, domains[labels[i]].score))
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  const gridLevels = [2, 4, 6, 8, 10]

  const domainLabels = {
    attention_working_memory: 'Attention',
    executive_function: 'Exec. Function',
    memory_encoding: 'Memory',
    visuospatial: 'Visuospatial',
    language_complexity: 'Language',
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Grid circles */}
      {gridLevels.map(level => {
        const r = (level / 10) * maxRadius
        return (
          <circle key={level} cx={center} cy={center} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        )
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const end = getPoint(i, 10)
        return (
          <line key={i} x1={center} y1={center} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        )
      })}

      {/* Data polygon */}
      <path d={pathD}
        fill="rgba(99, 102, 241, 0.15)"
        stroke="url(#radarGrad)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))' }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill="var(--accent-primary)" stroke="white" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const labelPoint = getPoint(i, 12.5)
        return (
          <text key={label} x={labelPoint.x} y={labelPoint.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-sans)">
            {domainLabels[label] || label}
          </text>
        )
      })}

      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ScoreBar({ label, score, maxScore = 10, color }) {
  const pct = (score / maxScore) * 100
  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color || 'var(--accent-primary-light)' }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color || undefined }} />
      </div>
    </div>
  )
}

function PathCard({ path, onSelect }) {
  const typeConfig = {
    strength: { gradient: 'var(--gradient-primary)', icon: '💪', label: 'Strength-Leveraging' },
    growth: { gradient: 'var(--gradient-cool)', icon: '🌱', label: 'Growth-Stretching' },
    interest: { gradient: 'var(--gradient-warm)', icon: '🎯', label: 'Interest-Aligned' },
  }
  const config = typeConfig[path.type] || typeConfig.strength
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`glass-card path-card path-card--${path.type}`}>
      <div className="path-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
            <span style={{ fontSize: '1.3rem' }}>{config.icon}</span>
            <span className="chip chip--accent" style={{ fontSize: '0.7rem' }}>{config.label}</span>
          </div>
          <h4 className="path-card-title">{path.name}</h4>
        </div>
        <span className={`confidence-badge ${path.confidence >= 0.8 ? 'confidence-high' : path.confidence >= 0.7 ? 'confidence-medium' : 'confidence-low'}`}>
          {Math.round(path.confidence * 100)}% match
        </span>
      </div>

      <p className="path-card-body">{path.rationale}</p>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
        <span className="chip chip--success" style={{ fontSize: '0.75rem' }}>
          ⏱ {path.estimated_weeks} weeks
        </span>
        {path.competencies.map(c => (
          <span key={c} className="chip" style={{ fontSize: '0.75rem' }}>{c}</span>
        ))}
      </div>

      {/* Expandable details */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setExpanded(!expanded)}
        style={{ marginBottom: expanded ? 'var(--space-md)' : 0 }}
      >
        {expanded ? '▾ Hide details' : '▸ Why we recommend this'}
      </button>

      {expanded && (
        <div className="animate-fade-in" style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <strong style={{ color: 'var(--accent-success)' }}>Leverages your strengths in:</strong>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: '4px', flexWrap: 'wrap' }}>
              {path.strengths_leveraged.map(s => (
                <span key={s} className="chip chip--success" style={{ fontSize: '0.75rem' }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <strong style={{ color: 'var(--accent-secondary)' }}>Develops growth in:</strong>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: '4px', flexWrap: 'wrap' }}>
              {path.growth_areas.map(g => (
                <span key={g} className="chip" style={{ fontSize: '0.75rem', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>{g}</span>
              ))}
            </div>
          </div>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Courses included:</strong>
            <ul style={{ marginTop: '4px', paddingLeft: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
              {path.courses.map(c => (
                <li key={c.name} style={{ marginBottom: '2px' }}>
                  {c.name} <span className="text-muted">({c.type})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onSelect(path)}>
        Choose This Path
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [selectedPath, setSelectedPath] = useState(null)
  const [overrideReason, setOverrideReason] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('neurocog_profile')
    if (stored) {
      setProfile(JSON.parse(stored))
    }
  }, [])

  if (!profile) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '450px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🧠</div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>No Profile Yet</h3>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
            Complete the Discovery process to see your cognitive profile and personalized learning paths.
          </p>
          <Link to="/discover" className="btn btn-primary">
            Start Discovery →
          </Link>
        </div>
      </div>
    )
  }

  const { cognitive_domains, motivational_profile, asset_inventory, discovery_stage, paths } = profile

  const handleSelectPath = (path) => {
    setSelectedPath(path)
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>
            Your <span className="text-gradient">Cognitive Profile</span>
          </h1>
          <p className="text-secondary">
            Based on your survey, handwritten notes, conversation, and brain games
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <span className={`confidence-badge ${discovery_stage.confidence >= 0.7 ? 'confidence-high' : 'confidence-medium'}`}>
              Profile Confidence: {Math.round(discovery_stage.confidence * 100)}%
            </span>
            <span className="chip chip--accent">
              {discovery_stage.phase_label}
            </span>
          </div>
        </div>

        {/* Profile Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-3xl)'
        }}>
          {/* Cognitive Domains Radar */}
          <div className="glass-card animate-fade-in-up animate-delay-1">
            <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: '1.15rem' }}>
              🧬 Cognitive Domains
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
              <RadarChart domains={cognitive_domains} />
            </div>
            <div>
              {Object.entries(cognitive_domains).map(([key, data]) => {
                const labels = {
                  attention_working_memory: 'Attention & Working Memory',
                  executive_function: 'Executive Function',
                  memory_encoding: 'Memory Encoding',
                  visuospatial: 'Visuospatial Processing',
                  language_complexity: 'Language Complexity',
                }
                return (
                  <div key={key} style={{ marginBottom: 'var(--space-sm)' }}>
                    <ScoreBar label={labels[key] || key} score={data.score} />
                    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: '-4px', marginBottom: 'var(--space-sm)' }}>
                      {data.evidence.map((e, i) => (
                        <span key={i} className="chip" style={{ fontSize: '0.7rem' }}>{e}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Motivational Profile */}
          <div className="glass-card animate-fade-in-up animate-delay-2">
            <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: '1.15rem' }}>
              🎯 Motivational Profile (CUTRICE)
            </h3>
            {Object.entries(motivational_profile).map(([key, score]) => {
              const labels = {
                competence: 'Competence',
                usefulness: 'Usefulness',
                tension_reversed: 'Productive Struggle',
                relatedness: 'Relatedness',
                importance: 'Importance',
                choice: 'Choice & Autonomy',
                enjoyment: 'Enjoyment',
              }
              const colors = {
                competence: '#6366f1',
                usefulness: '#06b6d4',
                tension_reversed: '#f59e0b',
                relatedness: '#ec4899',
                importance: '#a855f7',
                choice: '#10b981',
                enjoyment: '#f97316',
              }
              return <ScoreBar key={key} label={labels[key] || key} score={score} color={colors[key]} />
            })}

            {/* Asset Inventory */}
            <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>📦 Your Asset Inventory</h4>
              
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Skills</span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {asset_inventory.prior_skills.map(s => (
                    <span key={s} className="chip chip--accent">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Languages</span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {asset_inventory.languages.map(l => (
                    <span key={l} className="chip chip--success">{l}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Domain Knowledge</span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {asset_inventory.domain_knowledge.map(d => (
                    <span key={d} className="chip">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Path Recommendations */}
        <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="section-header">
            <h2>Your Recommended <span className="text-gradient">Learning Paths</span></h2>
            <p>Three pathways tailored to your profile — you choose which fits you best</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {paths.map(path => (
              <PathCard key={path.id} path={path} onSelect={handleSelectPath} />
            ))}
          </div>
        </div>

        {/* Selected path confirmation */}
        {selectedPath && (
          <div className="glass-card animate-fade-in-up" style={{ 
            maxWidth: '600px', 
            margin: '0 auto var(--space-3xl)',
            border: '1px solid var(--accent-success)',
            background: 'rgba(16, 185, 129, 0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>✨</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>
                You selected: {selectedPath.name}
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
                This is saved to your profile. In the full system, this would activate your 
                learning pathway and begin course enrollment.
              </p>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Want a different path? You can always change your mind.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
