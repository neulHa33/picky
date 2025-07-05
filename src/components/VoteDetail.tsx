import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp, setDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Layout from './layout/Layout';

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
  deadline: Date;
  participants: number;
  totalVotes: number;
  votedBy: string[];
  userVotes?: { [userId: string]: string }; // 사용자별 투표 옵션 추적
}

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
}

const VoteDetail: React.FC = () => {
  const { voteId } = useParams<{ voteId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);
  const [isDeadlineOver, setIsDeadlineOver] = useState(false);
  const [serverNow, setServerNow] = useState<Date | null>(null);
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    // 서버시간
    const fetchServerTime = async () => {
      try {
        const dummyRef = doc(db, 'serverTime', 'now');
        await setDoc(dummyRef, { ts: serverTimestamp() });
        const snap = await getDoc(dummyRef);
        const ts = snap.data()?.ts;
        if (ts && ts.toDate) {
          setServerNow(ts.toDate());
        } else {
          setServerNow(new Date());
        }
      } catch {
        setServerNow(new Date());
      }
    };
    fetchServerTime();
  }, []);

  useEffect(() => {
    const fetchVote = async () => {
      if (!voteId) return;
      try {
        const voteDoc = await getDoc(doc(db, 'votes', voteId));
        if (voteDoc.exists()) {
          const data = voteDoc.data();
          const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate()
            : null;
          const deadline = data.deadline && typeof data.deadline.toDate === 'function'
            ? data.deadline.toDate()
            : null;
          if (!createdAt || !deadline) {
            setError('투표 정보가 올바르지 않습니다. (마감일 또는 생성일 누락)');
            setLoading(false);
            return;
          }
          const voteData: Vote = {
            id: voteDoc.id,
            title: data.title,
            description: data.description,
            options: data.options,
            createdBy: data.createdBy,
            createdByEmail: data.createdByEmail,
            createdAt,
            deadline,
            participants: data.participants || 0,
            totalVotes: data.totalVotes || 0,
            votedBy: data.votedBy || [],
            userVotes: data.userVotes || {}
          };
          setVote(voteData);
          if (currentUser && voteData.votedBy.includes(currentUser.uid)) {
            setHasVoted(true);
            setUserVotedOption(voteData.userVotes?.[currentUser.uid] || null);
          }
          const now = serverNow || new Date();
          setIsDeadlineOver(now > voteData.deadline);
        } else {
          setError('투표가 없습니다');
        }
      } catch (err: any) {
        setError(err.message || '투표 로딩 중 오류');
      } finally {
        setLoading(false);
      }
    };
    if (serverNow !== null) fetchVote();
  }, [voteId, currentUser, serverNow]);

  // Real-time comments listener
  useEffect(() => {
    if (!voteId) return;

    const commentsQuery = query(
      collection(db, 'votes', voteId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData: Comment[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          createdBy: data.createdBy,
          createdByEmail: data.createdByEmail,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date()
        };
      });
      setComments(commentsData);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    return () => unsubscribe();
  }, [voteId]);

  const handleVote = async () => {
    if (!selectedOption || !vote || !currentUser) return;

    setVoting(true);
    setError(null);

    try {
      const voteRef = doc(db, 'votes', vote.id);
      
      const updatedOptions = vote.options.map(option => 
        option.id === selectedOption 
          ? { ...option, votes: option.votes + 1 }
          : option
      );

      const updatedUserVotes = {
        ...vote.userVotes,
        [currentUser.uid]: selectedOption
      };

      await updateDoc(voteRef, {
        options: updatedOptions,
        participants: increment(1),
        totalVotes: increment(1),
        votedBy: arrayUnion(currentUser.uid),
        userVotes: updatedUserVotes
      });

      setVote({
        ...vote,
        options: updatedOptions,
        participants: vote.participants + 1,
        totalVotes: vote.totalVotes + 1,
        votedBy: [...vote.votedBy, currentUser.uid],
        userVotes: updatedUserVotes
      });
      
      setHasVoted(true);
      setUserVotedOption(selectedOption);
      setSelectedOption(null);
    } catch (err: any) {
      setError(err.message || 'Error submitting vote');
    } finally {
      setVoting(false);
    }
  };

  const handleCancelVote = async () => {
    if (!vote || !currentUser || !userVotedOption) return;

    setCanceling(true);
    setError(null);

    try {
      const voteRef = doc(db, 'votes', vote.id);
      
      // Update the vote counts (subtract 1 from the voted option)
      const updatedOptions = vote.options.map(option => 
        option.id === userVotedOption 
          ? { ...option, votes: Math.max(0, option.votes - 1) }
          : option
      );

      const updatedUserVotes = { ...vote.userVotes };
      delete updatedUserVotes[currentUser.uid];

      await updateDoc(voteRef, {
        options: updatedOptions,
        participants: increment(-1),
        totalVotes: increment(-1),
        votedBy: arrayRemove(currentUser.uid),
        userVotes: updatedUserVotes
      });

      setVote({
        ...vote,
        options: updatedOptions,
        participants: Math.max(0, vote.participants - 1),
        totalVotes: Math.max(0, vote.totalVotes - 1),
        votedBy: vote.votedBy.filter(id => id !== currentUser.uid),
        userVotes: updatedUserVotes
      });
      
      setHasVoted(false);
      setUserVotedOption(null);
    } catch (err: any) {
      setError(err.message || 'Error canceling vote');
    } finally {
      setCanceling(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !voteId || !newComment.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);

    try {
      await addDoc(collection(db, 'votes', voteId, 'comments'), {
        content: newComment.trim(),
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: serverTimestamp()
      });

      setNewComment('');
    } catch (err: any) {
      setCommentError(err.message || '댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (!vote || vote.totalVotes === 0) return 0;
    return Math.round((votes / vote.totalVotes) * 100);
  };

  if (loading) {
    return (
      <Layout maxWidth="4xl" padding="lg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">투표를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !vote) {
    return (
      <Layout maxWidth="4xl" padding="lg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">오류가 발생했습니다</h3>
            <p className="text-gray-600 mb-6">{error || '투표를 찾을 수 없습니다'}</p>
            <button
              onClick={() => navigate('/votes')}
              className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 hover:shadow-md font-medium"
            >
              투표 목록으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="4xl" padding="lg">
      <div className="space-y-8">
        {/* 투표 제목 및 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-pink-100">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {vote.title}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
              {vote.description}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {vote.createdByEmail}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {vote.createdAt.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {vote.participants}명 참여
                </span>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isDeadlineOver 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isDeadlineOver ? '마감됨' : '진행중'}
              </div>
            </div>
          </div>

          {/* 마감일 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700">마감일</span>
              <span className={`text-base font-medium ${
                isDeadlineOver ? 'text-red-600' : 'text-gray-900'
              }`}>
                {vote.deadline.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 투표 옵션들 */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-pink-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            투표 옵션
          </h2>
          
          <div className="space-y-4">
            {vote.options.map((option) => {
              const percentage = getPercentage(option.votes);
              const isSelected = selectedOption === option.id;
              const isUserVoted = userVotedOption === option.id;
              
              return (
                <div
                  key={option.id}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50'
                      : isUserVoted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                  } ${!hasVoted && !isDeadlineOver ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!hasVoted && !isDeadlineOver && currentUser) {
                      setSelectedOption(option.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      {!hasVoted && !isDeadlineOver && (
                        <input
                          type="radio"
                          name="voteOption"
                          checked={isSelected}
                          onChange={() => setSelectedOption(option.id)}
                          className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                        />
                      )}
                      <span className="text-base sm:text-lg font-medium text-gray-900">
                        {option.text}
                      </span>
                      {isUserVoted && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          내 선택
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-gray-900">
                        {option.votes}표
                      </div>
                      <div className="text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* 진행률 바 */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUserVoted ? 'bg-green-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 투표 버튼 */}
          {!isDeadlineOver && (
            <div className="mt-8 space-y-4">
              {!hasVoted ? (
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting || !currentUser}
                  className="w-full sm:w-auto px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md font-medium"
                >
                  {voting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      투표 중...
                    </span>
                  ) : (
                    '투표하기'
                  )}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleCancelVote}
                    disabled={canceling}
                    className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md font-medium"
                  >
                    {canceling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        취소 중...
                      </span>
                    ) : (
                      '투표 취소'
                    )}
                  </button>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      투표 완료!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-pink-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            댓글 ({comments.length})
          </h2>

          {/* 댓글 작성 폼 */}
          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성해주세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {submittingComment ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
              {commentError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="text-sm text-red-700">{commentError}</div>
                </div>
              )}
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-center">
                댓글을 작성하려면 <button onClick={() => navigate('/login')} className="text-pink-600 hover:text-pink-700 font-medium">로그인</button>이 필요합니다.
              </p>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.createdByEmail}
                      </span>
                      <span className="text-sm text-gray-500">
                        {comment.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VoteDetail; 