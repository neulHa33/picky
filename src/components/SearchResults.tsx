import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './layout/Layout';

interface Vote {
  id: string;
  title: string;
  description: string;
  participants: number;
  totalVotes: number;
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchVotes = async () => {
      if (!queryParam.trim()) {
        setVotes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const votesRef = collection(db, 'votes');
        
        // Get all votes and filter client-side for better search results
        const votesQuery = query(
          votesRef,
          orderBy('createdAt', 'desc'),
          limit(100) // Limit to prevent performance issues
        );

        const snapshot = await getDocs(votesQuery);
        
        // Filter votes that match the search query
        const filteredVotes: Vote[] = [];
        const searchTerm = queryParam.toLowerCase().trim();

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const title = data.title?.toLowerCase() || '';
          const description = data.description?.toLowerCase() || '';
          
          // Check if title or description contains the search term
          if (title.includes(searchTerm) || description.includes(searchTerm)) {
            filteredVotes.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              participants: data.participants || 0,
              totalVotes: data.totalVotes || 0,
              createdBy: data.createdBy,
              createdByEmail: data.createdByEmail,
              createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
                ? data.createdAt.toDate() 
                : new Date()
            });
          }
        });

        setVotes(filteredVotes);
      } catch (err: any) {
        console.error('Error searching votes:', err);
        setError('검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    searchVotes();
  }, [queryParam]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (loading) {
    return (
      <Layout maxWidth="7xl" padding="lg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">검색 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="7xl" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#404040] mb-4">
            검색 결과
          </h1>
          <p className="text-[#404040] text-lg sm:text-xl max-w-3xl mx-auto">
            "{queryParam}"에 대한 검색 결과입니다
          </p>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-[#C5D9D5]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#404040]">
              검색 결과 ({votes.length}개)
            </h2>
            <button
              onClick={() => navigate('/votes')}
              className="px-4 py-2 bg-[#C5D9D5] text-[#404040] rounded-lg hover:bg-[#B8CEC9] transition-all duration-200 font-medium"
            >
              전체 목록으로
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">{error}</p>
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-6">다른 키워드로 검색해보세요.</p>
              <button
                onClick={() => navigate('/votes')}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 font-medium"
              >
                전체 투표 보기
              </button>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow-sm border border-[#C5D9D5] overflow-hidden">
                  <table className="min-w-full divide-y divide-[#C5D9D5]">
                    <thead className="bg-[#F8F9FA]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#404040] uppercase tracking-wider">
                          투표 제목
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#404040] uppercase tracking-wider">
                          작성자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#404040] uppercase tracking-wider">
                          참여자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#404040] uppercase tracking-wider">
                          생성일
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#C5D9D5]">
                      {votes.map((vote) => (
                        <tr
                          key={vote.id}
                          onClick={() => navigate(`/vote/${vote.id}`)}
                          className="hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-[#404040]">
                                {highlightText(vote.title, queryParam)}
                              </div>
                              <div className="text-sm text-[#404040] line-clamp-2">
                                {highlightText(vote.description, queryParam)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#404040]">
                            {vote.createdByEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-[#404040] font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {vote.participants}명
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#404040]">
                            {vote.createdAt.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {votes.map((vote) => (
                  <div
                    key={vote.id}
                    onClick={() => navigate(`/vote/${vote.id}`)}
                    className="bg-white rounded-lg shadow-sm border border-[#C5D9D5] p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-[#404040] line-clamp-2 group-hover:text-[#2A2A2A] transition-colors flex-1 mr-3 leading-tight">
                        {highlightText(vote.title, queryParam)}
                      </h3>
                      <div className="flex items-center gap-2 text-[#404040] font-medium text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {vote.participants}명
                      </div>
                    </div>
                    <p className="text-[#404040] text-sm mt-2 line-clamp-3">
                      {highlightText(vote.description, queryParam)}
                    </p>
                    <div className="flex items-center justify-between mt-4 text-sm text-[#404040]">
                      <span>{vote.createdByEmail}</span>
                      <span>{vote.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults; 