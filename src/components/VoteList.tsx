import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Navbar from './layout/Navbar';

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
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'participants'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const VOTES_PER_PAGE = 10;

  useEffect(() => {
    fetchVotes(true);
  }, [sortBy, sortOrder]);

  const fetchVotes = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setVotes([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let votesQuery = query(
        collection(db, 'votes'),
        orderBy(sortBy, sortOrder),
        limit(VOTES_PER_PAGE)
      );

      if (!reset && lastDoc) {
        votesQuery = query(
          collection(db, 'votes'),
          orderBy(sortBy, sortOrder),
          startAfter(lastDoc),
          limit(VOTES_PER_PAGE)
        );
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

      if (reset) {
        setVotes(newVotes);
      } else {
        setVotes(prev => [...prev, ...newVotes]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === VOTES_PER_PAGE);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSortChange = (newSortBy: 'createdAt' | 'participants') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">투표 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">모든 투표</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">정렬:</span>
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  sortBy === 'createdAt'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSortChange('participants')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  sortBy === 'participants'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                Popularity {sortBy === 'participants' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          {votes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">투표가 없습니다.</p>
              <button
                onClick={() => navigate('/create-vote')}
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                첫 투표 생성
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-pink-100 hover:border-pink-200"
                    onClick={() => navigate(`/vote/${vote.id}`)}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {vote.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {vote.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>👥 {vote.participants} 참여자</span>
                        <span>📅 {vote.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        by {vote.createdByEmail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => fetchVotes(false)}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        로딩중...
                      </span>
                    ) : (
                      '더보기'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoteList; 