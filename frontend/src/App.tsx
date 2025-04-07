import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './views/auth/Login'
import Register from './views/auth/Register'
import Feed from './views/Feed'
import BaseLayout from './components/layout/BaseLayout'
import ForgotPassword from './views/auth/ForgotPassword'

function App() {
  return (
    <Router>
      <BaseLayout>
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/oubli-mot-de-passe" element={<ForgotPassword />} />
          <Route path="/" element={<Feed />} />
        </Routes>
      </BaseLayout>
    </Router>
  )
}

export default App