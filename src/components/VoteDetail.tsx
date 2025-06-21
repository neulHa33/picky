import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './layout/Navbar';

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
  participants: number;
  totalVotes: number;
  votedBy: string[];
}

const VoteDetail: React.FC = () => {
  const { voteId } = useParams<{ voteId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchVote = async () => {
      if (!voteId) return;

      try {
        const voteDoc = await getDoc(doc(db, 'votes', voteId));
        if (voteDoc.exists()) {
          const data = voteDoc.data();
          const voteData: Vote = {
            id: voteDoc.id,
            title: data.title,
            description: data.description,
            options: data.options,
            createdBy: data.createdBy,
            createdByEmail: data.createdByEmail,
            createdAt: data.createdAt.toDate(),
            participants: data.participants || 0,
            totalVotes: data.totalVotes || 0,
            votedBy: data.votedBy || []
          };
          
          setVote(voteData);
          
          // Check if current user has already voted
          if (currentUser && voteData.votedBy.includes(currentUser.uid)) {
            setHasVoted(true);
          }
        } else {
          setError('Vote not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching vote');
      } finally {
        setLoading(false);
      }
    };

    fetchVote();
  }, [voteId, currentUser]);

  const handleVote = async () => {
    if (!selectedOption || !vote || !currentUser) return;

    setVoting(true);
    setError(null);

    try {
      const voteRef = doc(db, 'votes', vote.id);
      
      // Update the vote counts
      const updatedOptions = vote.options.map(option => 
        option.id === selectedOption 
          ? { ...option, votes: option.votes + 1 }
          : option
      );

      await updateDoc(voteRef, {
        options: updatedOptions,
        participants: increment(1),
        totalVotes: increment(1),
        votedBy: arrayUnion(currentUser.uid)
      });

      setVote({
        ...vote,
        options: updatedOptions,
        participants: vote.participants + 1,
        totalVotes: vote.totalVotes + 1,
        votedBy: [...vote.votedBy, currentUser.uid]
      });
      
      setHasVoted(true);
      setSelectedOption(null);
    } catch (err: any) {
      setError(err.message || 'Error submitting vote');
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (!vote || vote.totalVotes === 0) return 0;
    return Math.round((votes / vote.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">투표 로딩중...</p>
        </div>
      </div>
    );
  }

  if (error || !vote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Vote not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{vote.title}</h1>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  ← 돌아가기
                </button>
              </div>
              <p className="text-gray-600 mb-4">{vote.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>작성자: {vote.createdByEmail}</span>
                <span>•</span>
                <span>{vote.createdAt.toLocaleDateString()}</span>
                <span>•</span>
                <span>{vote.participants} 참여자</span>
              </div>
            </div>

            {/* Voting Section */}
            {!hasVoted && currentUser && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cast Your Vote</h3>
                <div className="space-y-3">
                  {vote.options.map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="vote"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-gray-900">{option.text}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voting ? 'Submitting...' : 'Submit Vote'}
                </button>
              </div>
            )}

            {/* Results */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {hasVoted ? '투표 결과' : '투표 결과'}
              </h3>
              <div className="space-y-4">
                {vote.options.map((option) => {
                  const percentage = getPercentage(option.votes);
                  const isWinning = vote.totalVotes > 0 && option.votes === Math.max(...vote.options.map(o => o.votes));
                  
                  return (
                    <div key={option.id} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {option.text}
                          {isWinning && vote.totalVotes > 0 && (
                            <span className="ml-2 text-green-600">🏆</span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500">
                          {option.votes} votes ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isWinning ? 'bg-green-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  총 투표수: {vote.totalVotes} • 참여자: {vote.participants}
                </p>
                {hasVoted && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ 투표 완료
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteDetail; 