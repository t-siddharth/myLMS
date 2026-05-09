import { Link } from 'react-router-dom'

const features = [
  {
    icon: '📝',
    title: 'Handwriting Analysis',
    description: 'Your handwritten notes reveal cognitive patterns invisible to traditional assessments — how you organize, prioritize, and connect ideas.'
  },
  {
    icon: '🧬',
    title: '5-Domain Cognitive Profile',
    description: 'We map your strengths across Attention, Executive Function, Memory, Visuospatial Processing, and Language — backed by neuroscience.'
  },
  {
    icon: '🎯',
    title: 'Personalized Learning Paths',
    description: 'Three tailored pathways — leveraging your strengths, stretching growth areas, or following your passions — with transparent confidence scores.'
  },
  {
    icon: '🌱',
    title: 'Strengths-First Philosophy',
    description: 'We start with what you\'re already great at. No deficits, no labels — just a clear map of your unique cognitive landscape.'
  },
  {
    icon: '🔄',
    title: 'Living Profile',
    description: 'Your profile evolves as you learn. Every course, reflection, and milestone refines our understanding of how you grow best.'
  },
  {
    icon: '🗺️',
    title: 'Career Transition Ready',
    description: 'Designed for people changing careers, re-entering education, or discovering new directions. Low-risk exploration, high-impact discovery.'
  }
]

export default function Landing() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content animate-fade-in-up">
          <h1>
            Discover How You{' '}
            <span className="text-gradient">Think & Learn</span>
          </h1>
          <p>
            NeuroCog builds your cognitive profile from handwritten notes, reflections, and conversation — 
            then recommends the learning path that fits how your brain actually works. 
            No standardized tests. No labels. Just insight.
          </p>
          <div className="hero-actions">
            <Link to="/discover" className="btn btn-primary btn-lg" id="cta-start-discovery">
              Begin Discovery →
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg" id="cta-learn-more">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <h2>Built on <span className="text-gradient">Neuroscience</span>, Not Guesswork</h2>
            <p>
              Grounded in domain-based cognitive profiling, self-determination theory, 
              and asset-based community development — frameworks validated by decades of research.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card animate-fade-in-up animate-delay-${i % 4 + 1}`}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-sm)' }}>
                  {feature.title}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: 'var(--space-3xl) 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Your Discovery Journey</h2>
            <p>Four steps to understanding how you learn best</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-lg)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              { step: '01', title: 'Tell Us About You', desc: 'Quick survey covering your goals, interests, and what drives you.', color: 'var(--accent-primary)' },
              { step: '02', title: 'Watch & Take Notes', desc: 'Watch a short video and take handwritten notes — your natural way.', color: 'var(--accent-secondary)' },
              { step: '03', title: 'Chat with AI', desc: 'Brief text conversation to explore your thinking and reasoning.', color: 'var(--accent-purple)' },
              { step: '04', title: 'Get Your Profile', desc: 'Receive your cognitive profile and personalized learning paths.', color: 'var(--accent-success)' }
            ].map((item, i) => (
              <div key={item.step} className={`glass-card animate-fade-in-up animate-delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: item.color,
                  opacity: 0.4,
                  marginBottom: 'var(--space-sm)'
                }}>
                  {item.step}
                </div>
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>{item.title}</h4>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--space-3xl) 0', textAlign: 'center' }}>
        <div className="container animate-fade-in-up">
          <h2 style={{ marginBottom: 'var(--space-md)' }}>
            Ready to Discover Your <span className="text-gradient">Cognitive Strengths</span>?
          </h2>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)', maxWidth: '500px', margin: '0 auto var(--space-xl)' }}>
            The entire discovery process takes about 30 minutes. No tests, no scores — just genuine insight into how you think.
          </p>
          <Link to="/discover" className="btn btn-primary btn-lg">
            Start Your Discovery →
          </Link>
        </div>
      </section>
    </div>
  )
}
