import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import EditProfile from './pages/EditProfile'
import ResourceDetail from './pages/ResourceDetail'
import UploadWizard from './pages/UploadWizard'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Chat from './pages/Chat'
import JoinGroup from './pages/JoinGroup'
import Leaderboard from './pages/Leaderboard'
import Collections from './pages/Collections'
import Notifications from './pages/Notifications'
import SearchResults from './pages/SearchResults'
import Trending from './pages/Trending'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import AdminModeration from './pages/AdminModeration'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyOTP from './pages/VerifyOTP'
import ContactUs from './pages/ContactUs'
import AuthSuccess from './pages/AuthSuccess'
import TalentDevelopment from './pages/TalentDevelopment'
import AIAgents from './pages/AIAgents'

import ResumeBuilder from './pages/ResumeBuilder'
import PeerTutoring from './pages/PeerTutoring'
import Notes from './pages/Notes'
import AgentDocs from './pages/AgentDocs'

// Coding Pages
import CodingProblemsList from './pages/coding/CodingProblemsList'
import CodingProblemSolve from './pages/coding/CodingProblemSolve'
import UploadCodingProblem from './pages/coding/UploadCodingProblem'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>
  if (!user || !['admin', 'moderator'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth-success" element={<AuthSuccess />} />

      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/join/:code" element={<JoinGroup />} />



      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="trending" element={<Trending />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="upload" element={<UploadWizard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<PublicProfile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="resources/:id" element={<ResourceDetail />} />
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:id" element={<Chat />} />
        <Route path="groups" element={<Groups />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="collections" element={<Collections />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="contact" element={<ContactUs />} />
        
        {/* Professional Talent Development */}
        <Route path="talent" element={<TalentDevelopment />} />
        
        {/* AI Agents */}
        <Route path="ai-agents" element={<AIAgents />} />
        
        {/* New Educational Features */}
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="tutoring" element={<PeerTutoring />} />
        <Route path="notes" element={<Notes />} />
        <Route path="agent-docs" element={<AgentDocs />} />
        
        {/* Coding Features */}
        <Route path="coding/problems" element={<CodingProblemsList />} />
        <Route path="coding/solve/:id" element={<CodingProblemSolve />} />
        <Route path="coding/admin/upload" element={<UploadCodingProblem />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="moderation" element={<AdminModeration />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
