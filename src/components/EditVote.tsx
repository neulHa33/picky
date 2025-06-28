import React, { useReducer, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './layout/Navbar';
import { useVoteEdit } from '../hooks/useVoteEdit';
import VoteEditForm from './vote/VoteEditForm';
import { MAX_OPTIONS, MIN_OPTIONS, ERROR_MESSAGES } from '../constants/vote';
import { validateVoteForm, generateOptionId } from '../utils/vote';
import { useErrorHandler } from '../hooks/useErrorHandler';
import type { Vote, VoteOption, OptionId, VoteEditFormData, VoteEditState } from '../types/vote';

type VoteEditAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VOTE'; payload: Vote }
  | { type: 'SET_FORM_DATA'; payload: { title: string; description: string } }
  | { type: 'SET_OPTIONS'; payload: VoteOption[] };

const initialState: VoteEditState = {
  vote: null,
  loading: true,
  saving: false,
  error: null,
  formData: {
    title: '',
    description: ''
  },
  options: []
};

function reducer(state: VoteEditState, action: VoteEditAction): VoteEditState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VOTE':
      return { ...state, vote: action.payload };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    default:
      return state;
  }
}

const EditVote: React.FC = () => {
  const { voteId } = useParams<{ voteId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [state, dispatch] = useReducer(reducer, initialState);

  const { fetchVote } = useVoteEdit();

  const { error, setError, showError } = useErrorHandler();

  useEffect(() => {
    const fetchVoteData = async () => {
      if (!voteId) return;
      try {
        const voteData = await fetchVote(voteId);
        if (voteData) {
          // Check if current user is the creator
          if (voteData.createdBy !== currentUser?.uid) {
            setError('자신이 생성한 글만 수정할 수 있습니다.');
            return;
          }
          dispatch({ type: 'SET_VOTE', payload: voteData });
          dispatch({ type: 'SET_FORM_DATA', payload: { title: voteData.title, description: voteData.description } });
          dispatch({ type: 'SET_OPTIONS', payload: voteData.options });
        } else {
          setError('Vote not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching vote');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    fetchVoteData();
  }, [voteId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errorMsg = validateVoteForm({
      title: state.formData.title,
      description: state.formData.description,
      options: state.options,
    });
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const voteRef = doc(db, 'votes', voteId!);
      
      await updateDoc(voteRef, {
        title: state.formData.title,
        description: state.formData.description,
        options: state.options
      });

      console.log('Vote updated successfully');
      navigate(`/vote/${voteId}`);
    } catch (err: any) {
      setError(err.message || 'Error updating vote');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const onFormDataChange = (data: VoteEditFormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data });
  };

  const onOptionChange = (id: OptionId, text: string) => {
    const updated = state.options.map(option => option.id === id ? { ...option, text } : option);
    dispatch({ type: 'SET_OPTIONS', payload: updated });
  };

  const onAddOption = () => {
    if (state.options.length < MAX_OPTIONS) {
      const newId = generateOptionId(state.options);
      dispatch({ type: 'SET_OPTIONS', payload: [...state.options, { id: newId, text: '', votes: 0 }] });
    }
  };

  const onRemoveOption = (id: OptionId) => {
    if (state.options.length > MIN_OPTIONS) {
      dispatch({ type: 'SET_OPTIONS', payload: state.options.filter(option => option.id !== id) });
    }
  };

  const onCancel = useCallback(() => {
    navigate('/mypage');
  }, [navigate]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vote...</p>
        </div>
      </div>
    );
  }

  if (error || !state.vote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Vote not found'}</p>
          <button
            onClick={() => navigate('/mypage')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">글 수정</h1>
            </div>

            <VoteEditForm
              formData={state.formData}
              options={state.options}
              error={error}
              saving={state.saving}
              onFormDataChange={onFormDataChange}
              onOptionChange={onOptionChange}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVote; 