import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './views/auth/Login'
import Register from './views/auth/Register'
import Feed from './views/Feed'
import BaseLayout from './components/layout/BaseLayout'

function App() {
  return (
    <BaseLayout>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Feed />} />
        </Routes>
      </Router>
    </BaseLayout>
  )
}

export default App