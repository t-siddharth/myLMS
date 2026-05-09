import { useState, useRef, useEffect } from 'react'

const AI_QUESTIONS = [
  { id: 'recall', text: "Welcome! I just watched the same video you did. Let's talk about it. What were the main ideas or takeaways you noticed?", type: 'recall' },
  { id: 'comprehension', text: "Interesting perspective! Can you explain one of those ideas in your own words — as if you were teaching it to someone?", type: 'comprehension' },
  { id: 'application', text: "How does anything from the video connect to your own life or work experience? Even a small connection counts.", type: 'application' },
  { id: 'analysis', text: "What surprised you most about the video, and why? Was there anything you disagreed with?", type: 'analysis' },
  { id: 'creation', text: "Last question: If you could change or add one thing to what the video discussed, what would it be? Think creatively.", type: 'creation' },
]

export default function AudioChat({ onComplete, surveyData }) {
  const [messages, setMessages] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [responses, setResponses] = useState({})
  const chatEndRef = useRef(null)

  useEffect(() => {
    // Start with first AI question
    const timer = setTimeout(() => {
      setMessages([{
        role: 'ai',
        text: AI_QUESTIONS[0].text,
        questionType: AI_QUESTIONS[0].type
      }])
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!userInput.trim()) return

    const userMsg = { role: 'user', text: userInput.trim() }
    const newResponses = { ...responses, [AI_QUESTIONS[currentQuestion].id]: userInput.trim() }
    setResponses(newResponses)
    setMessages(prev => [...prev, userMsg])
    setUserInput('')

    const nextQ = currentQuestion + 1

    if (nextQ < AI_QUESTIONS.length) {
      setIsTyping(true)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: AI_QUESTIONS[nextQ].text,
          questionType: AI_QUESTIONS[nextQ].type
        }])
        setCurrentQuestion(nextQ)
        setIsTyping(false)
      }, 1000 + Math.random() * 500)
    } else {
      // All questions answered
      setIsTyping(true)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "Thank you for sharing your thoughts! 🙏 I've learned a lot about how you think and connect ideas. Your responses will help us build your cognitive profile. Let's move to the final step!",
          isFinal: true
        }])
        setIsTyping(false)
      }, 1200)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const allDone = currentQuestion >= AI_QUESTIONS.length - 1 && Object.keys(responses).length >= AI_QUESTIONS.length

  return (
    <div className="glass-card">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-xs)' }}>
          Chat with <span className="text-gradient">NeuroCog AI</span>
        </h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          I'll ask you {AI_QUESTIONS.length} questions about the video you watched. 
          Answer naturally — there are no right or wrong responses.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
          {AI_QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                background: i <= currentQuestion ? 'var(--accent-primary)' : 'var(--border-subtle)',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-container" style={{ minHeight: '300px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message--${msg.role === 'ai' ? 'ai' : 'user'}`}>
            <div className="chat-avatar">
              {msg.role === 'ai' ? '🧠' : '👤'}
            </div>
            <div className="chat-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message chat-message--ai">
            <div className="chat-avatar">🧠</div>
            <div className="chat-bubble">
              <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ animation: 'pulse-glow 1s infinite', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span style={{ animation: 'pulse-glow 1s infinite 0.2s', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span style={{ animation: 'pulse-glow 1s infinite 0.4s', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {!allDone ? (
        <div className="chat-input-area">
          <input
            className="form-input"
            placeholder="Type your response..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!userInput.trim() || isTyping}
            style={{ opacity: userInput.trim() && !isTyping ? 1 : 0.5 }}
          >
            Send
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onComplete(responses)}>
            Continue to Brain Games →
          </button>
        </div>
      )}
    </div>
  )
}
