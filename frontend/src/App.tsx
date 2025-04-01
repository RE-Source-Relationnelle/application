import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './views/auth/Login'
import Feed from './views/Feed'
import BaseLayout from './components/layout/BaseLayout'

function App() {
  return (
    <BaseLayout>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Feed />} />
        </Routes>
      </Router>
    </BaseLayout>
  )
}

export default App