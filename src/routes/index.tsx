import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../components/Login';
import Signup from '../components/Signup';
import ForgotPassword from '../components/ForgotPassword';
import VoteList from '../components/VoteList';
import VoteDetail from '../components/VoteDetail';
import CreateVote from '../components/CreateVote';
import EditVote from '../components/EditVote';
import MyPage from '../components/MyPage';
import SearchResults from '../components/SearchResults';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - Accessible without login */}
      <Route path="/" element={<VoteList />} />
      <Route path="/votes" element={<VoteList />} />
      <Route path="/vote/:voteId" element={<VoteDetail />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      
      {/* Protected Routes - Require login */}
      <Route path="/write" element={
        <ProtectedRoute message="투표를 생성하려면 로그인이 필요합니다.">
          <CreateVote />
        </ProtectedRoute>
      } />
      <Route path="/create-vote" element={
        <ProtectedRoute message="투표를 생성하려면 로그인이 필요합니다.">
          <CreateVote />
        </ProtectedRoute>
      } />
      <Route path="/edit-vote/:voteId" element={
        <ProtectedRoute message="투표를 수정하려면 로그인이 필요합니다.">
          <EditVote />
        </ProtectedRoute>
      } />
      <Route path="/mypage" element={
        <ProtectedRoute message="마이페이지에 접근하려면 로그인이 필요합니다.">
          <MyPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
