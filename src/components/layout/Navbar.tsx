import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="backdrop-blur-sm shadow-sm border-b border-[#C5D9D5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center">
            <h1 
              className="text-xl sm:text-2xl font-bold text-[#404040] cursor-pointer hover:text-[#2A2A2A] transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              Picky
            </h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <button
                onClick={() => navigate('/create-vote')}
                className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                투표생성
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                마이페이지
              </button>
            </div>
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-[#404040] bg-[#C5D9D5] px-3 py-1.5 rounded-full border border-[#B8CEC9]">
              {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            >
              로그아웃
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-[#404040] hover:text-[#2A2A2A] focus:outline-none focus:text-[#2A2A2A] p-2 rounded-lg hover:bg-[#C5D9D5] transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-4 space-y-1 bg-[#DFF2EF]/95 backdrop-blur-sm border-t border-[#C5D9D5] rounded-b-lg shadow-lg">
              <button
                onClick={() => { navigate('/votes'); closeMenu(); }}
                className="text-[#404040] bg-[#C5D9D5] hover:bg-[#B8CEC9] block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
              >
                모든투표
              </button>
              <button
                onClick={() => { navigate('/create-vote'); closeMenu(); }}
                className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
              >
                투표생성
              </button>
              <button
                onClick={() => { navigate('/mypage'); closeMenu(); }}
                className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
              >
                마이페이지
              </button>
              <div className="border-t border-[#C5D9D5] pt-3 mt-3 space-y-2">
                <div className="text-sm text-[#404040] bg-[#C5D9D5] px-4 py-2 rounded-lg border border-[#B8CEC9]">
                  {currentUser?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 