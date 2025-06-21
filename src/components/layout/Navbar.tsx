import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b-2 border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-pink-600">Picky</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                홈
              </button>
              <button
                onClick={() => navigate('/votes')}
                className="text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                모든투표
              </button>
              <button
                onClick={() => navigate('/create-vote')}
                className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                투표생성
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                마이페이지
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 bg-pink-50 px-3 py-1 rounded-full">
              {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 