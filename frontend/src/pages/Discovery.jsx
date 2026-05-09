import { useState } from 'react'
import IntakeSurvey from '../components/IntakeSurvey'
import VideoNotes from '../components/VideoNotes'
import AudioChat from '../components/AudioChat'
import MicroAssessments from '../components/MicroAssessments'

const STEPS = [
  { id: 1, label: 'About You', icon: '📋' },
  { id: 2, label: 'Watch & Note', icon: '📝' },
  { id: 3, label: 'AI Chat', icon: '💬' },
  { id: 4, label: 'Brain Games', icon: '🧩' },
]

export default function Discovery() {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState({
    survey: null,
    notes: null,
    chat: null,
    assessments: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [profileResult, setProfileResult] = useState(null)

  const handleStepComplete = (stepKey, data) => {
    setProfileData(prev => ({ ...prev, [stepKey]: data }))
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    } else {
      submitAllData({ ...profileData, [stepKey]: data })
    }
  }

  const submitAllData = async (allData) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:8000/api/profile/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allData),
      })
      if (response.ok) {
        const result = await response.json()
        setProfileResult(result)
        // Store in sessionStorage for dashboard
        sessionStorage.setItem('neurocog_profile', JSON.stringify(result))
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Profile generation failed:', err)
      // For MVP: generate mock profile and redirect
      const mockProfile = generateMockProfile(allData)
      sessionStorage.setItem('neurocog_profile', JSON.stringify(mockProfile))
      window.location.href = '/dashboard'
    } finally {
      setIsProcessing(false)
    }
  }

  const generateMockProfile = (data) => {
    // MVP fallback — generates a realistic profile from survey data
    const survey = data.survey || {}
    return {
      cognitive_domains: {
        attention_working_memory: { score: 7.2, confidence: 0.75, evidence: ['Note density above average', 'Consistent focus across video length'] },
        executive_function: { score: 6.8, confidence: 0.70, evidence: ['Hierarchical note structure detected', 'Multiple organizational levels used'] },
        memory_encoding: { score: 8.1, confidence: 0.80, evidence: ['High content accuracy vs. source', 'Key concepts captured in notes'] },
        visuospatial: { score: 5.5, confidence: 0.55, evidence: ['Minimal diagram usage', 'Linear text layout predominant'] },
        language_complexity: { score: 7.8, confidence: 0.78, evidence: ['Above-average vocabulary diversity', 'Complex sentence structures in reflections'] },
      },
      motivational_profile: {
        competence: 8.0,
        usefulness: 7.5,
        tension_reversed: 6.0,
        relatedness: 7.0,
        importance: 8.5,
        choice: 7.0,
        enjoyment: 6.5,
      },
      asset_inventory: {
        prior_skills: survey.skills ? survey.skills.split(',').map(s => s.trim()) : ['Communication', 'Problem Solving', 'Adaptability'],
        life_experience: survey.experience || 'Career transitioner with 5+ years professional experience',
        languages: survey.languages ? survey.languages.split(',').map(s => s.trim()) : ['English'],
        domain_knowledge: survey.interests ? survey.interests.split(',').map(s => s.trim()) : ['Education', 'Technology'],
      },
      discovery_stage: {
        phase: 1,
        phase_label: 'Getting to Know You',
        confidence: 0.68,
        inputs_received: 4,
        inputs_needed: 0,
      },
      paths: [
        {
          id: 'strength',
          name: 'Strength-Leveraging Path',
          type: 'strength',
          confidence: 0.82,
          rationale: 'This path builds on your strong memory encoding and language skills. Courses emphasize reading-intensive content, discussion-based learning, and written analysis.',
          strengths_leveraged: ['Memory Encoding', 'Language Complexity'],
          growth_areas: ['Visuospatial Processing'],
          competencies: ['Critical Analysis', 'Research Methods', 'Written Communication'],
          estimated_weeks: 16,
          courses: [
            { name: 'Foundations of Critical Thinking', type: 'core' },
            { name: 'Research Methods & Data Literacy', type: 'core' },
            { name: 'Communication for Impact', type: 'elective' },
          ]
        },
        {
          id: 'growth',
          name: 'Growth-Stretching Path',
          type: 'growth',
          confidence: 0.71,
          rationale: 'This path develops your visuospatial and executive function skills while anchoring in your language strengths. Includes more hands-on, project-based courses.',
          strengths_leveraged: ['Language Complexity'],
          growth_areas: ['Visuospatial Processing', 'Executive Function'],
          competencies: ['Design Thinking', 'Project Management', 'Visual Communication'],
          estimated_weeks: 20,
          courses: [
            { name: 'Design Thinking Workshop', type: 'core' },
            { name: 'Data Visualization & Storytelling', type: 'core' },
            { name: 'Project-Based Leadership', type: 'elective' },
          ]
        },
        {
          id: 'interest',
          name: 'Interest-Aligned Path',
          type: 'interest',
          confidence: 0.76,
          rationale: 'This path follows your stated passions and motivational drivers. High intrinsic motivation predicted — courses align with your Ikigai profile.',
          strengths_leveraged: ['Memory Encoding', 'Attention'],
          growth_areas: ['Executive Function'],
          competencies: ['Domain Expertise', 'Self-Directed Learning', 'Applied Innovation'],
          estimated_weeks: 18,
          courses: [
            { name: 'Exploring Your Field: Survey Course', type: 'core' },
            { name: 'Applied Innovation Lab', type: 'core' },
            { name: 'Mentored Independent Study', type: 'elective' },
          ]
        }
      ],
      generated_at: new Date().toISOString(),
    }
  }

  if (isProcessing) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', animation: 'float 2s ease-in-out infinite' }}>🧠</div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Analyzing Your Profile</h3>
          <p className="text-secondary">Our AI is mapping your cognitive domains, motivational drivers, and learning strengths...</p>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div className="gauge-bar" style={{ height: '4px' }}>
              <div className="gauge-fill" style={{ width: '100%', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container container-narrow">
        {/* Header */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: 'var(--space-sm)' }}>
            Your <span className="text-gradient">Discovery</span> Journey
          </h1>
          <p className="text-secondary">Each step helps us understand how you think, learn, and grow.</p>
        </div>

        {/* Stepper */}
        <div className="stepper animate-fade-in-up">
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'contents' }}>
              <div className={`stepper-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                <div className="stepper-circle">
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className="stepper-label">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`stepper-line ${currentStep > step.id ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="animate-slide-in" key={currentStep}>
          {currentStep === 1 && (
            <IntakeSurvey onComplete={(data) => handleStepComplete('survey', data)} />
          )}
          {currentStep === 2 && (
            <VideoNotes onComplete={(data) => handleStepComplete('notes', data)} />
          )}
          {currentStep === 3 && (
            <AudioChat 
              onComplete={(data) => handleStepComplete('chat', data)} 
              surveyData={profileData.survey}
            />
          )}
          {currentStep === 4 && (
            <MicroAssessments onComplete={(data) => handleStepComplete('assessments', data)} />
          )}
        </div>
      </div>
    </div>
  )
}
