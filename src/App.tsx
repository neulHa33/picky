import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Signup from './components/Signup'
import CreateVote from './components/CreateVote'
import VoteDetail from './components/VoteDetail'
import EditVote from './components/EditVote'
import MyPage from './components/MyPage'
import VoteList from './components/VoteList'
import SearchResults from './components/SearchResults'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          /* 공개 라우트 */
          <Route path="/votes" element={<VoteList />} />
          <Route path="/vote/:voteId" element={<VoteDetail />} />
          <Route path="/search" element={<SearchResults />} />

          /* 비공개 라우트 */
          <Route path="/create-vote" element={<ProtectedRoute><CreateVote /></ProtectedRoute>} />
          <Route path="/edit-vote/:voteId" element={<ProtectedRoute><EditVote /></ProtectedRoute>} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          
          <Route path="/" element={<ProtectedRoute><VoteList /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
