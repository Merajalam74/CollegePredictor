import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import JeeMains from './pages/JeeMains.jsx'
import JeeAdvanced from './pages/JeeAdvanced.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jee-mains" element={<JeeMains />} />
        <Route path="/jee-advanced" element={<JeeAdvanced />} />
      </Routes>
    </Layout>
  )
}
export default App