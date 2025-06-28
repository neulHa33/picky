import { useState } from 'react';
import type { Vote, VoteOption } from '../types/vote';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useVoteEdit() {
  // voteId를 인자로 받는 fetchVote 함수 반환
  const fetchVote = async (voteId: string): Promise<Vote | null> => {
    const voteDoc = await getDoc(doc(db, 'votes', voteId));
    if (!voteDoc.exists()) return null;
    const data = voteDoc.data();
    // 필드 안전 처리
    const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
      ? data.createdAt.toDate()
      : null;
    const deadline = data.deadline && typeof data.deadline.toDate === 'function'
      ? data.deadline.toDate()
      : null;
    if (!createdAt || !deadline) return null;
    return {
      id: voteDoc.id,
      title: data.title,
      description: data.description,
      options: data.options,
      createdBy: data.createdBy,
      createdByEmail: data.createdByEmail,
      createdAt,
      deadline,
      participants: data.participants || 0,
      totalVotes: data.totalVotes || 0
    };
  };
  return { fetchVote };
} 