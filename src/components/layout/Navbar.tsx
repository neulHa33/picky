import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMenu();
    }
  };

  return (
    <nav className="backdrop-blur-sm shadow-sm border-b border-[#C5D9D5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center">
            <h1 
              className="text-xl sm:text-2xl font-bold text-[#404040] cursor-pointer hover:text-[#2A2A2A] transition-colors"
              onClick={() => navigate('/')}
            >
              Picky
            </h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 ml-8">
              {currentUser ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-[#404040] hover:text-[#2A2A2A] hover:bg-[#C5D9D5] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="투표 검색..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-[#C5D9D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-[#404040] placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-[#404040] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-sm text-[#404040] bg-[#C5D9D5] px-3 py-1.5 rounded-full border border-[#B8CEC9]">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <span className="text-sm text-[#404040] bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                게스트
              </span>
            )}
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
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearch} className="px-2 pb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="투표 검색..."
                    className="w-full px-4 py-2 pl-10 pr-4 border border-[#C5D9D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-[#404040] placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
              
              <button
                onClick={() => { navigate('/votes'); closeMenu(); }}
                className="text-[#404040] bg-[#C5D9D5] hover:bg-[#B8CEC9] block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
              >
                모든투표
              </button>
              
              {currentUser ? (
                <>
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
                      {currentUser.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-[#C5D9D5] pt-3 mt-3 space-y-2">
                  <div className="text-sm text-[#404040] bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                    게스트
                  </div>
                  <button
                    onClick={() => { navigate('/login'); closeMenu(); }}
                    className="bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => { navigate('/signup'); closeMenu(); }}
                    className="bg-white border border-[#C5D9D5] hover:bg-[#F8F9FA] text-[#404040] w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 