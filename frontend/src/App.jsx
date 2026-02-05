import { Routes, Route } from 'react-router-dom'
import { HomePage } from './multi-page'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Ajouter ici les autres routes au fur et à mesure */}
    </Routes>
  )
}

export default App
