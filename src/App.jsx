import './App.css'

function App() {
  return (
    <div className="app">
      <div className="welcome-container">
        <div className="glow-orb"></div>
        <div className="glow-orb secondary"></div>

        <h1 className="welcome-title">
          <span className="wave">👋</span> Hello World
        </h1>

        <p className="welcome-subtitle">
          Welcome to your new React app
        </p>

        <div className="card">
          <p>Edit <code>src/App.jsx</code> and save to test hot reload</p>
        </div>

        <div className="badge-row">
          <span className="badge">React 18</span>
          <span className="badge">Vite</span>
          <span className="badge">Fast Refresh</span>
        </div>
      </div>
    </div>
  )
}

export default App

