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
import ModeratorDashboard from './views/modération/ModeratorDashboard'
import ModeratorRoute from './components/features/auth/ModeratorRoute'
import ResourceDetail from './views/ResourceDetail'
import SearchResults from './views/SearchResults'
import CategoryFeed from './views/Category/CategoryFeed'
import AllCategories from './views/Category/AllCategories'
import { ToastProvider } from './contexts/ToastContext'
import ToastTester from './components/ui/ToastTester'
import PWAUpdateNotification from './components/ui/PWAUpdateNotification'
import './styles/content-styles.css'

const SHOW_TOAST_TESTER = false;

function App() {
  return (
    <Router>
      <ToastProvider>
        <BaseLayout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/oubli-mot-de-passe" element={<ForgotPassword />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/feed/ressource/:id" element={<ResourceDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/categories/:categoryId" element={<ProtectedRoute><CategoryFeed /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><AllCategories /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/moderator" element={<ModeratorRoute><ModeratorDashboard /></ModeratorRoute>} />
          </Routes>
          
          {/* Testeur de toasts - à supprimer en production */}
          {SHOW_TOAST_TESTER && <ToastTester />}
          
          {/* Composants PWA */}
          <PWAUpdateNotification />
        </BaseLayout>
      </ToastProvider>
    </Router>
  )
}

export default App