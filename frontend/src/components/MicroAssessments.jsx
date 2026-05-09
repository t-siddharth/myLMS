import { useState, useEffect, useCallback } from 'react'

// Stroop test colors and words
const STROOP_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7']
const STROOP_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple']

function StroopTask({ onComplete }) {
  const [trials, setTrials] = useState([])
  const [currentTrial, setCurrentTrial] = useState(0)
  const [results, setResults] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [phase, setPhase] = useState('intro') // intro, playing, done
  const TOTAL_TRIALS = 12

  useEffect(() => {
    // Generate trials
    const generated = []
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const wordIdx = Math.floor(Math.random() * STROOP_NAMES.length)
      let colorIdx = Math.floor(Math.random() * STROOP_COLORS.length)
      // 50% congruent, 50% incongruent
      if (i % 2 !== 0) {
        while (colorIdx === wordIdx) {
          colorIdx = Math.floor(Math.random() * STROOP_COLORS.length)
        }
      } else {
        colorIdx = wordIdx
      }
      generated.push({
        word: STROOP_NAMES[wordIdx],
        displayColor: STROOP_COLORS[colorIdx],
        correctAnswer: STROOP_NAMES[colorIdx],
        isCongruent: wordIdx === colorIdx,
      })
    }
    setTrials(generated)
  }, [])

  const handleAnswer = (answer) => {
    const elapsed = Date.now() - startTime
    const trial = trials[currentTrial]
    const isCorrect = answer === trial.correctAnswer
    
    setResults(prev => [...prev, { 
      trial: currentTrial, 
      correct: isCorrect, 
      reactionTime: elapsed,
      congruent: trial.isCongruent
    }])

    if (currentTrial + 1 < TOTAL_TRIALS) {
      setCurrentTrial(prev => prev + 1)
      setStartTime(Date.now())
    } else {
      setPhase('done')
    }
  }

  if (phase === 'intro') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🎨</div>
        <h4 style={{ marginBottom: 'var(--space-sm)' }}>Color Match Challenge</h4>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)', maxWidth: '400px', margin: '0 auto var(--space-lg)' }}>
          You'll see a color word displayed in a color. Tap the button matching 
          <strong style={{ color: 'var(--text-primary)' }}> the color of the text</strong>, 
          not the word itself. Go as fast as you can!
        </p>
        <button className="btn btn-primary" onClick={() => { setPhase('playing'); setStartTime(Date.now()) }}>
          Start Challenge
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const avgRT = results.reduce((a, b) => a + b.reactionTime, 0) / results.length
    const accuracy = results.filter(r => r.correct).length / results.length
    
    setTimeout(() => {
      onComplete({
        type: 'stroop',
        accuracy,
        avgReactionTime: avgRT,
        results,
        congruentAccuracy: results.filter(r => r.congruent && r.correct).length / results.filter(r => r.congruent).length,
        incongruentAccuracy: results.filter(r => !r.congruent && r.correct).length / results.filter(r => !r.congruent).length,
      })
    }, 100)

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>✅</div>
        <h4>Challenge Complete!</h4>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          {Math.round(accuracy * 100)}% accuracy • {Math.round(avgRT)}ms avg response time
        </p>
      </div>
    )
  }

  const trial = trials[currentTrial]
  if (!trial) return null

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {currentTrial + 1} / {TOTAL_TRIALS}
        </span>
      </div>
      
      <div style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: trial.displayColor,
        marginBottom: 'var(--space-xl)',
        padding: 'var(--space-xl) 0',
        userSelect: 'none'
      }}>
        {trial.word}
      </div>

      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
        ↑ What COLOR is this text displayed in?
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {STROOP_NAMES.map((name, i) => (
          <button
            key={name}
            className="btn btn-secondary"
            onClick={() => handleAnswer(name)}
            style={{
              borderColor: STROOP_COLORS[i],
              color: STROOP_COLORS[i],
              minWidth: '80px'
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

function DigitSpan({ onComplete }) {
  const [phase, setPhase] = useState('intro')
  const [level, setLevel] = useState(3)
  const [sequence, setSequence] = useState([])
  const [displayIdx, setDisplayIdx] = useState(-1)
  const [userInput, setUserInput] = useState('')
  const [results, setResults] = useState([])
  const [isReversed, setIsReversed] = useState(false)
  const [showingSequence, setShowingSequence] = useState(false)

  const generateSequence = useCallback((len) => {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 10))
  }, [])

  const startRound = useCallback(() => {
    const seq = generateSequence(level)
    setSequence(seq)
    setDisplayIdx(0)
    setShowingSequence(true)
    setUserInput('')
  }, [level, generateSequence])

  useEffect(() => {
    if (showingSequence && displayIdx >= 0 && displayIdx < sequence.length) {
      const timer = setTimeout(() => {
        setDisplayIdx(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (showingSequence && displayIdx >= sequence.length) {
      setShowingSequence(false)
      setDisplayIdx(-1)
    }
  }, [displayIdx, sequence.length, showingSequence])

  const checkAnswer = () => {
    const expected = isReversed ? [...sequence].reverse().join('') : sequence.join('')
    const correct = userInput === expected

    setResults(prev => [...prev, {
      level,
      correct,
      reversed: isReversed,
      sequence: sequence.join(''),
      userAnswer: userInput,
    }])

    if (correct && level < 9) {
      setLevel(prev => prev + 1)
      setTimeout(() => {
        const seq = generateSequence(level + 1)
        setSequence(seq)
        setDisplayIdx(0)
        setShowingSequence(true)
        setUserInput('')
      }, 500)
    } else {
      if (!isReversed) {
        setIsReversed(true)
        setLevel(3)
        setTimeout(() => {
          const seq = generateSequence(3)
          setSequence(seq)
          setDisplayIdx(0)
          setShowingSequence(true)
          setUserInput('')
        }, 1000)
      } else {
        const forwardMax = Math.max(...results.filter(r => !r.reversed && r.correct).map(r => r.level), 0)
        const backwardMax = Math.max(...results.filter(r => r.reversed && r.correct).map(r => r.level), 0)
        onComplete({
          type: 'digit_span',
          forward_max: forwardMax,
          backward_max: backwardMax,
          results,
        })
      }
    }
  }

  if (phase === 'intro') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🔢</div>
        <h4 style={{ marginBottom: 'var(--space-sm)' }}>Number Memory</h4>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)', maxWidth: '400px', margin: '0 auto var(--space-lg)' }}>
          You'll see a sequence of numbers, one at a time. Then type them back in order. 
          The sequence gets longer each round. How far can you go?
        </p>
        <button className="btn btn-primary" onClick={() => { setPhase('playing'); startRound() }}>
          Start Challenge
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <span className="chip chip--accent">
          {isReversed ? '🔄 Reverse Mode' : '➡️ Forward Mode'} • Level {level}
        </span>
      </div>

      {showingSequence ? (
        <div style={{
          fontSize: '4rem',
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
          color: 'var(--accent-primary)',
          padding: 'var(--space-2xl) 0',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {displayIdx < sequence.length ? sequence[displayIdx] : '...'}
        </div>
      ) : (
        <div style={{ padding: 'var(--space-lg) 0' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
            {isReversed ? 'Type the numbers in REVERSE order:' : 'Type the numbers in order:'}
          </p>
          <input
            className="form-input"
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', maxWidth: '300px', margin: '0 auto' }}
            value={userInput}
            onChange={e => setUserInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            autoFocus
            placeholder="..."
          />
          <div style={{ marginTop: 'var(--space-md)' }}>
            <button className="btn btn-primary" onClick={checkAnswer}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MicroAssessments({ onComplete }) {
  const [currentGame, setCurrentGame] = useState(0) // 0: stroop, 1: digit span
  const [gameResults, setGameResults] = useState({})

  const handleStroopComplete = (data) => {
    setGameResults(prev => ({ ...prev, stroop: data }))
    setTimeout(() => setCurrentGame(1), 1500)
  }

  const handleDigitComplete = (data) => {
    const allResults = { ...gameResults, digit_span: data }
    setGameResults(allResults)
    setTimeout(() => onComplete(allResults), 500)
  }

  return (
    <div className="glass-card">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-xs)' }}>
          <span className="text-gradient">Brain Games</span> — Quick & Fun
        </h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          Two quick challenges (under 5 minutes total). These aren't tests — they're 
          games that help us understand your attention and working memory patterns.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <span className={`chip ${currentGame === 0 ? 'chip--accent' : currentGame > 0 ? 'chip--success' : ''}`}>
            {currentGame > 0 ? '✓' : '1.'} Color Match
          </span>
          <span className={`chip ${currentGame === 1 ? 'chip--accent' : ''}`}>
            2. Number Memory
          </span>
        </div>
      </div>

      <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentGame === 0 && <StroopTask onComplete={handleStroopComplete} />}
        {currentGame === 1 && <DigitSpan onComplete={handleDigitComplete} />}
      </div>
    </div>
  )
}
