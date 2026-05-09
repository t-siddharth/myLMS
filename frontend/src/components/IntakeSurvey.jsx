import { useState } from 'react'

const IKIGAI_QUESTIONS = [
  { id: 'love', prompt: 'Describe a time you lost track of time because you were so engaged in something.', placeholder: 'What were you doing? Why did it captivate you?' },
  { id: 'good_at', prompt: 'What have people told you you\'re naturally good at?', placeholder: 'Think about feedback from colleagues, friends, or mentors...' },
  { id: 'world_needs', prompt: 'What problems in the world do you wish you could solve?', placeholder: 'What injustice or gap keeps you up at night?' },
  { id: 'paid_for', prompt: 'What skills or expertise could you see yourself being paid for?', placeholder: 'Think broadly — teaching, building, analyzing, creating...' },
]

const SELF_REG_ITEMS = [
  { id: 'sr1', text: 'When I study, I check whether I understand the material.' },
  { id: 'sr2', text: 'I set specific goals before starting a learning task.' },
  { id: 'sr3', text: 'I adjust my approach when something isn\'t working.' },
  { id: 'sr4', text: 'I can stay focused even when material is difficult.' },
  { id: 'sr5', text: 'I reflect on what I\'ve learned after completing a task.' },
  { id: 'sr6', text: 'I prefer structured schedules over flexible timelines.' },
  { id: 'sr7', text: 'I learn best when I can discuss ideas with others.' },
  { id: 'sr8', text: 'I enjoy figuring things out on my own before asking for help.' },
  { id: 'sr9', text: 'I connect new information to things I already know.' },
  { id: 'sr10', text: 'I feel motivated when I can see my progress.' },
]

function LikertScale({ value, onChange }) {
  return (
    <div className="likert-group">
      <span className="text-muted" style={{ fontSize: '0.75rem', width: '60px' }}>Disagree</span>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`likert-option ${value === n ? 'active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <span className="text-muted" style={{ fontSize: '0.75rem', width: '60px', textAlign: 'right' }}>Agree</span>
    </div>
  )
}

export default function IntakeSurvey({ onComplete }) {
  const [section, setSection] = useState(0) // 0: demographics, 1: ikigai, 2: self-reg
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education_level: '',
    transition_type: '',
    current_status: '',
    goals: '',
    interests: '',
    skills: '',
    languages: '',
    experience: '',
    ikigai: {},
    self_regulation: {},
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateIkigai = (id, value) => {
    setFormData(prev => ({
      ...prev,
      ikigai: { ...prev.ikigai, [id]: value }
    }))
  }

  const updateSelfReg = (id, value) => {
    setFormData(prev => ({
      ...prev,
      self_regulation: { ...prev.self_regulation, [id]: value }
    }))
  }

  const handleNext = () => {
    if (section < 2) {
      setSection(prev => prev + 1)
    } else {
      onComplete(formData)
    }
  }

  return (
    <div className="glass-card">
      {/* Section indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        {['About You', 'Your Ikigai', 'How You Learn'].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setSection(i)}
            className={`chip ${section === i ? 'chip--accent' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Section 0: Demographics */}
      {section === 0 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <h3>Tell us about yourself</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '-0.5rem' }}>
            This helps us understand your context and goals. Everything here is used to build your strengths — never to judge.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="First name" value={formData.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Age Range</label>
              <select className="form-select" value={formData.age} onChange={e => updateField('age', e.target.value)}>
                <option value="">Select...</option>
                <option>18-24</option>
                <option>25-34</option>
                <option>35-44</option>
                <option>45-54</option>
                <option>55+</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Highest Education Level</label>
            <select className="form-select" value={formData.education_level} onChange={e => updateField('education_level', e.target.value)}>
              <option value="">Select...</option>
              <option>High School / GED</option>
              <option>Some College</option>
              <option>Associate's Degree</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>Doctoral / Professional</option>
              <option>Trade / Vocational Certificate</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">What best describes your current situation?</label>
            <select className="form-select" value={formData.transition_type} onChange={e => updateField('transition_type', e.target.value)}>
              <option value="">Select...</option>
              <option>Changing careers</option>
              <option>Re-entering education</option>
              <option>Upskilling in current field</option>
              <option>Exploring — not sure yet</option>
              <option>Starting first career</option>
              <option>Returning after a break</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">What are your goals? What do you hope to achieve?</label>
            <textarea className="form-textarea" placeholder="Be as specific or as broad as you'd like..." value={formData.goals} onChange={e => updateField('goals', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Your Interests (comma-separated)</label>
              <input className="form-input" placeholder="e.g., education, design, data" value={formData.interests} onChange={e => updateField('interests', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Languages You Speak</label>
              <input className="form-input" placeholder="e.g., English, Spanish, Mandarin" value={formData.languages} onChange={e => updateField('languages', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills & Experience (comma-separated)</label>
            <input className="form-input" placeholder="e.g., teaching, Python, project management, public speaking" value={formData.skills} onChange={e => updateField('skills', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Brief Work / Life Experience Summary</label>
            <textarea className="form-textarea" placeholder="What have you done professionally or personally that shapes who you are?" value={formData.experience} onChange={e => updateField('experience', e.target.value)} style={{ minHeight: '80px' }} />
          </div>
        </div>
      )}

      {/* Section 1: Ikigai */}
      {section === 1 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div>
            <h3>Your Ikigai — Your Reason for Being</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 'var(--space-xs)' }}>
              Ikigai is a Japanese concept meaning "a life worth living." These reflections help us understand 
              what drives you — so we can recommend paths aligned with your purpose, not just your skills.
            </p>
          </div>

          {IKIGAI_QUESTIONS.map((q) => (
            <div key={q.id} className="form-group">
              <label className="form-label" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {q.prompt}
              </label>
              <textarea
                className="form-textarea"
                placeholder={q.placeholder}
                value={formData.ikigai[q.id] || ''}
                onChange={e => updateIkigai(q.id, e.target.value)}
                style={{ minHeight: '90px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Self-Regulation */}
      {section === 2 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <h3>How You Learn</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 'var(--space-xs)' }}>
              Rate how much you agree with each statement. There are no right or wrong answers — 
              this helps us understand your natural learning patterns.
            </p>
          </div>

          {SELF_REG_ITEMS.map((item) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <span style={{ fontSize: '0.9rem' }}>{item.text}</span>
              <LikertScale
                value={formData.self_regulation[item.id]}
                onChange={(val) => updateSelfReg(item.id, val)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
        {section > 0 ? (
          <button className="btn btn-ghost" onClick={() => setSection(prev => prev - 1)}>
            ← Back
          </button>
        ) : <div />}
        <button className="btn btn-primary" onClick={handleNext}>
          {section < 2 ? 'Continue →' : 'Complete Survey →'}
        </button>
      </div>
    </div>
  )
}
