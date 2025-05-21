import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './views/auth/Login'
import Register from './views/auth/Register'
import Feed from './views/Feed'
import BaseLayout from './components/layout/BaseLayout'
import ForgotPassword from './views/auth/ForgotPassword'
import Profile from './views/user/Profile'
import ProtectedRoute from './components/features/auth/ProtectedRoute'
import AdminDashboard from './views/admin/AdminDashboard'
import AdminRoute from './components/features/auth/AdminRoute'
import ResourceDetail from './views/ResourceDetail'


function App() {
  return (
    <Router>
      <BaseLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/oubli-mot-de-passe" element={<ForgotPassword />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feed/ResourceDetail/:id" element={<ResourceDetail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </BaseLayout>
    </Router>
  )
}

export default App