import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../components/Login';
import Signup from '../components/Signup';
import ForgotPassword from '../components/ForgotPassword';
import Home from '../components/Home';
import VoteList from '../components/VoteList';
import VoteDetail from '../components/VoteDetail';
import CreateVote from '../components/CreateVote';
import EditVote from '../components/EditVote';
import MyPage from '../components/MyPage';
import Dashboard from '../components/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/votes" element={<ProtectedRoute><VoteList /></ProtectedRoute>} />
      <Route path="/vote/:voteId" element={<ProtectedRoute><VoteDetail /></ProtectedRoute>} />
      <Route path="/write" element={<ProtectedRoute><CreateVote /></ProtectedRoute>} />
      <Route path="/create-vote" element={<ProtectedRoute><CreateVote /></ProtectedRoute>} />
      <Route path="/edit-vote/:voteId" element={<ProtectedRoute><EditVote /></ProtectedRoute>} />
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
