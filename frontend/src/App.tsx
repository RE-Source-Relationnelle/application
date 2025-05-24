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
import SearchResults from './views/SearchResults'
import { ToastProvider } from './contexts/ToastContext'
import ToastTester from './components/ui/ToastTester'
import './styles/content-styles.css' // Importer les styles pour le contenu WYSIWYG

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
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
          
          {/* Testeur de toasts - à supprimer en production */}
          {SHOW_TOAST_TESTER && <ToastTester />}
        </BaseLayout>
      </ToastProvider>
    </Router>
  )
}

export default App