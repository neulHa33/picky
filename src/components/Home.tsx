import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
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

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [topVotes, setTopVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopVotes = async () => {
      try {
        const votesQuery = query(
          collection(db, 'votes'),
          orderBy('participants', 'desc'),
          limit(5)
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
      } finally {
        setLoading(false);
      }
    };

    fetchTopVotes();
  }, []);

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pink-700 mb-4">인기투표</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading popular votes...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topVotes.map((vote) => (
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
                      <span>👥 {vote.participants} participants</span>
                      <span>📅 {vote.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      by {vote.createdByEmail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && topVotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No votes found. Be the first to create a vote!</p>
              <button
                onClick={() => navigate('/create-vote')}
                className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                Create Your First Vote
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home; 