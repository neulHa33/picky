import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './layout/Navbar';

const schema = yup.object({
  title: yup.string().required('Question title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
}).required();

type FormData = yup.InferType<typeof schema>;

interface VoteOption {
  id: string;
  text: string;
}

const CreateVote: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<VoteOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const addOption = () => {
    if (options.length < 5) {
      const newId = (options.length + 1).toString();
      setOptions([...options, { id: newId, text: '' }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    // Validate options
    const validOptions = options.filter(option => option.text.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (validOptions.length !== options.length) {
      setError('All options must have text');
      return;
    }

    setLoading(true);

    try {
      const voteData = {
        title: data.title,
        description: data.description,
        options: validOptions.map(option => ({
          id: option.id,
          text: option.text.trim(),
          votes: 0
        })),
        createdBy: currentUser?.uid,
        createdByEmail: currentUser?.email,
        createdAt: new Date(),
        participants: 0,
        totalVotes: 0
      };

      const docRef = await addDoc(collection(db, 'votes'), voteData);
      console.log('Vote created successfully with ID:', docRef.id);
      
      reset();
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' }
      ]);
      
      navigate(`/vote/${docRef.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 border border-pink-100">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-pink-700">투표생성</h1>
              <p className="mt-2 text-gray-600">투표를 만들어서 고민 해결해보세요! 여러 사람들이 도와줄 거에요.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  투표 제목
                </label>
                <input
                  {...register('title')}
                  id="title"
                  type="text"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                  placeholder="투표 제목을 입력해 주세요."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  설명
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                  placeholder="해당 투표에 대한 설명을 입력해 주세요."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  투표 옵션 ({options.length}/4)
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(option.id, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                          placeholder={`옵션 ${index + 1}`}
                        />
                      </div>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-pink-300 shadow-sm text-sm leading-4 font-medium rounded-md text-pink-700 bg-pink-50 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    옵션추가
                  </button>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      생성중...
                    </span>
                  ) : (
                    '생성'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVote; 