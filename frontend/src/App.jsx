import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Discovery from './pages/Discovery'
import Dashboard from './pages/Dashboard'
import './styles/index.css'

function Navbar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🧠</span>
          NeuroCog
        </Link>
        <ul className="navbar-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/discover" className={location.pathname === '/discover' ? 'active' : ''}>Discover</Link></li>
          <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
        </ul>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ marginTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discovery />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
