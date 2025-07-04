import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
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

const VoteList: React.FC = () => {
  const navigate = useNavigate(); 
  const [votes, setVotes] = useState<Vote[]>([]); // 투표 목록 상태
  const [topVotes, setTopVotes] = useState<Vote[]>([]); // 상단 인기 투표 3개 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [sortBy, setSortBy] = useState<'createdAt' | 'participants'>('createdAt'); // 정렬 기준(생성일/참여자수)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 정렬 방향 (내림차순/오름차순)
  
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const [totalVotes, setTotalVotes] = useState(0); // 총 투표 개수
  const [pageDocs, setPageDocs] = useState<any[]>([]); // 페이지별 시작점 문서 저장

  const VOTES_PER_PAGE = 10; // 페이지당 투표 수

  useEffect(() => {
    fetchTotalVotes(); // 전체 투표 수 계산
    fetchVotes(); // 첫 페이지 투표 데이터 불러오기
    fetchTopVotes(); // 인기 투표 3개 가져오기
  }, []);

  useEffect(() => {
    fetchVotes(); // currentPage가 변경될 때마다 해당 페이지 투표 데이터를 새로 불러옴
  }, [currentPage]);


  const fetchTotalVotes = async () => {
    try {
      const votesRef = collection(db, 'votes');
      const snapshot = await getCountFromServer(votesRef);
      const total = snapshot.data().count;
      setTotalVotes(total);
      setTotalPages(Math.ceil(total / VOTES_PER_PAGE));
    } catch (error) {
      console.error('Error fetching total votes:', error);
    }
  };

  const fetchVotes = async () => {
    setLoading(true);

    try {
      let votesQuery;

      if (currentPage === 1) {
        votesQuery = query(
          collection(db, 'votes'),
          orderBy(sortBy, sortOrder),
          limit(VOTES_PER_PAGE)
        );
      } else {
        const startAfterDoc = pageDocs[currentPage - 2];
        if (startAfterDoc) {
          votesQuery = query(
            collection(db, 'votes'),
            orderBy(sortBy, sortOrder),
            startAfter(startAfterDoc),
            limit(VOTES_PER_PAGE)
          );
        } else {
          const allDocsQuery = query(
            collection(db, 'votes'),
            orderBy(sortBy, sortOrder),
            limit((currentPage - 1) * VOTES_PER_PAGE)
          );
          const allDocsSnapshot = await getDocs(allDocsQuery);
          const allDocs = allDocsSnapshot.docs;
          
          if (allDocs.length >= (currentPage - 1) * VOTES_PER_PAGE) {
            const startAfterDoc = allDocs[allDocs.length - 1];
            votesQuery = query(
              collection(db, 'votes'),
              orderBy(sortBy, sortOrder),
              startAfter(startAfterDoc),
              limit(VOTES_PER_PAGE)
            );
          } else {
            setVotes([]);
            setLoading(false);
            return;
          }
        }
      }

      const snapshot = await getDocs(votesQuery);
      const newVotes: Vote[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          participants: data.participants || 0,
          totalVotes: data.totalVotes || 0,
          createdBy: data.createdBy,
          createdByEmail: data.createdByEmail,
          createdAt: data.createdAt.toDate()
        };
      });

      setVotes(newVotes);

      if (snapshot.docs.length > 0) {
        const newPageDocs = [...pageDocs];
        newPageDocs[currentPage - 1] = snapshot.docs[snapshot.docs.length - 1];
        setPageDocs(newPageDocs);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopVotes = async () => {
    try {
      const votesQuery = query(
        collection(db, 'votes'),
        orderBy('participants', 'desc'),
        limit(3)
      );
      const snapshot = await getDocs(votesQuery);
      const votes: Vote[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          participants: data.participants || 0,
          totalVotes: data.totalVotes || 0,
          createdBy: data.createdBy,
          createdByEmail: data.createdByEmail,
          createdAt: data.createdAt.toDate()
        };
      });
      setTopVotes(votes);
    } catch (error) {
      console.error('투표 로딩 중 오류:', error);
    }
  };

  const sortedVotes = useMemo(() => {
    const sorted = [...votes];
    if (sortBy === 'participants') {
      return sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? a.participants - b.participants
          : b.participants - a.participants
      );
    } else {
      return sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
  }, [votes, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: 'createdAt' | 'participants'): void => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors"
        >
          ← 이전
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-pink-500 text-white border border-pink-500 shadow-md'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-200'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors"
        >
          다음 →
        </button>
      );
    }

    return pages;
  };

  if (loading && currentPage === 1) {
    return (
      <Layout maxWidth="7xl" padding="lg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">투표 목록을 불러오는 중...</p>
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
            모든 투표
          </h1>
          <p className="text-[#404040] text-lg sm:text-xl max-w-3xl mx-auto">
            다양한 주제의 투표들을 확인하고 참여해보세요
          </p>
        </div>

        {/* Top Votes Section */}
        {topVotes.length > 0 && (
          <div className="rounded-xl shadow-lg p-6 sm:p-8 border border-[#C5D9D5]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#404040] mb-6">
              🔥 인기 투표
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topVotes.map((vote) => (
                <div
                  key={vote.id}
                  onClick={() => navigate(`/vote/${vote.id}`)}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#C5D9D5] hover:border-[#B8CEC9] overflow-hidden transform hover:-translate-y-1"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-[#404040] mb-3 line-clamp-2 group-hover:text-[#2A2A2A] transition-colors leading-tight">
                    {vote.title}
                  </h3>
                  <p className="text-[#404040] text-sm mb-4 line-clamp-3">
                    {vote.description}
                  </p>
                  <div className="flex items-center gap-2 text-[#404040] font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {vote.participants}명 참여
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="rounded-xl shadow-lg p-6 sm:p-8 border border-[#C5D9D5]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#404040]">
              전체 투표 목록
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'createdAt'
                    ? 'bg-[#C5D9D5] text-[#404040] shadow-md'
                    : 'bg-[#F8F9FA] text-[#404040] hover:bg-[#C5D9D5] hover:text-[#404040]'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => handleSortChange('participants')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'participants'
                    ? 'bg-[#C5D9D5] text-[#404040] shadow-md'
                    : 'bg-[#F8F9FA] text-[#404040] hover:bg-[#C5D9D5] hover:text-[#404040]'
                }`}
              >
                인기순
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C5D9D5] border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#404040] text-lg">투표를 불러오는 중...</p>
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#404040] text-lg">아직 투표가 없습니다.</p>
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
                      {sortedVotes.map((vote) => (
                        <tr
                          key={vote.id}
                          onClick={() => navigate(`/vote/${vote.id}`)}
                          className="hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-[#404040]">{vote.title}</div>
                              <div className="text-sm text-[#404040] line-clamp-2">{vote.description}</div>
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
                {sortedVotes.map((vote) => (
                  <div
                    key={vote.id}
                    onClick={() => navigate(`/vote/${vote.id}`)}
                    className="bg-white rounded-lg shadow-sm border border-[#C5D9D5] p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-[#404040] line-clamp-2 group-hover:text-[#2A2A2A] transition-colors flex-1 mr-3 leading-tight">
                        {vote.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[#404040] font-medium text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {vote.participants}명
                      </div>
                    </div>
                    <p className="text-[#404040] text-sm mt-2 line-clamp-3">
                      {vote.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 text-sm text-[#404040]">
                      <span>{vote.createdByEmail}</span>
                      <span>{vote.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VoteList;
