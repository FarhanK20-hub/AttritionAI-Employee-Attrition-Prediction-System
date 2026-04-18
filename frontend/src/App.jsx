import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'

export default function App() {
  const [results, setResults] = useState(null)
  const navigate = useNavigate()

  const handleResults = (data) => {
    setResults(data)
    navigate('/dashboard')
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<UploadPage onResults={handleResults} />} />
        <Route
          path="/dashboard"
          element={<DashboardPage results={results} />}
        />
        <Route
          path="/employee/:id"
          element={<EmployeeDetailPage results={results} />}
        />
      </Routes>
    </Layout>
  )
}
