import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { doc, addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from './layout/Layout';

const schema = yup.object({
  title: yup.string().required('Question title is required').min(5, '5자 이상 입력해주세요'),
  description: yup.string().required('Description is required').min(10, '10자 이상 입력해주세요'),
  deadline: yup.string().required('마감일을 선택해 주세요.')
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
      setError('최소 2개의 옵션이 필요합니다.');
      return;
    }
    if (validOptions.length !== options.length) {
      setError('모든 옵션에 텍스트가 입력되어야 합니다.');
      return;
    }
    // Validate deadline
    const deadlineDate = new Date(data.deadline);
    const now = new Date();
    const onYearLater = new Date();
    onYearLater.setFullYear(now.getFullYear() + 1);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= now) {
      setError('마감일은 현재 시간 이후여야 합니다.');
      return;
    }
    if (deadlineDate > onYearLater) {
      setError('마감일은 1년 이내로 설정해 주세요.');
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
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(deadlineDate),
        participants: 0,
        totalVotes: 0
      };
      const docRef = await addDoc(collection(db, 'votes'), voteData);
      console.log('투표 생성에 성공했습니다.');
      reset();
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' }
      ]);
      navigate(`/vote/${docRef.id}`);
    } catch (err: any) {
      setError(err.message || '투표 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout maxWidth="4xl" padding="lg">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#DFF2EF] rounded-xl shadow-lg p-6 sm:p-8 border border-[#C5D9D5]">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">투표생성</h1>
            <p className="text-lg">투표를 만들어서 고민 해결해보세요! 여러 사람들이 도와줄 거에요.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Question Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-medium text-[#404040] mb-3">
                투표 제목
              </label>
              <input
                {...register('title')}
                id="title"
                type="text"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                  errors.title ? 'border-red-300' : 'border-[#C5D9D5]'
                }`}
                placeholder="투표 제목을 입력해 주세요."
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-medium text-[#404040] mb-3">
                설명
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                  errors.description ? 'border-red-300' : 'border-[#C5D9D5]'
                }`}
                placeholder="해당 투표에 대한 설명을 입력해 주세요."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="block text-lg font-medium text-[#404040] mb-4">
                투표 옵션 ({options.length}/4)
              </label>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="block w-full px-4 py-3 border border-[#C5D9D5] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white"
                        placeholder={`옵션 ${index + 1}`}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-600 hover:text-red-800 p-3 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="mt-4 inline-flex items-center px-4 py-2 border border-[#C5D9D5] shadow-sm text-base font-medium rounded-lg text-[#404040] bg-[#C5D9D5] hover:bg-[#B8CEC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5D9D5] transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  옵션 추가
                </button>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-lg font-medium text-[#404040] mb-3">
                마감일
              </label>
              <input
                {...register('deadline')}
                id="deadline"
                type="datetime-local"
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                  errors.deadline ? 'border-red-300' : 'border-[#C5D9D5]'
                }`}
              />
              {errors.deadline && (
                <p className="mt-2 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#C5D9D5] hover:bg-[#B8CEC9] text-[#404040] px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#404040]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  '투표 생성하기'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-[#C5D9D5] text-[#404040] rounded-lg hover:bg-[#C5D9D5] transition-all duration-200 text-base font-medium"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateVote; 