import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const message = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log('User logged in successfully');
      reset();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Check if user doc exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Create user doc with default values
        await setDoc(userDocRef, {
          firstName: null,
          lastName: null,
          email: user.email,
          region: null,
          profileImageBase64: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-[#DFF2EF]/95 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8 border border-[#C5D9D5]">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#404040] mb-2">
              Picky
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#404040] mb-4">
              로그인
            </h2>
            {message && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            )}
            <p className="text-[#404040] text-base sm:text-lg">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-medium text-[#2A2A2A] hover:text-[#404040] transition-colors">
                회원가입
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-base font-medium text-[#404040] mb-3">
                  이메일 주소
                </label>
                <input
                  {...register('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                    errors.email ? 'border-red-300' : 'border-[#C5D9D5]'
                  }`}
                  placeholder="이메일 주소를 입력하세요"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-medium text-[#404040] mb-3">
                  비밀번호
                </label>
                <input
                  {...register('password')}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                    errors.password ? 'border-red-300' : 'border-[#C5D9D5]'
                  }`}
                  placeholder="비밀번호를 입력하세요"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-[#404040] bg-[#C5D9D5] hover:bg-[#B8CEC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5D9D5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#404040]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C5D9D5]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#DFF2EF] text-[#404040]">또는</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center py-3 px-4 border border-[#C5D9D5] rounded-lg shadow-sm bg-white text-base font-medium text-[#404040] hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5D9D5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.68 2.7 30.74 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.04l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.01-2.97-1.01-6.18 0-9.15l-7.98-6.2C.7 17.29 0 20.56 0 24c0 3.44.7 6.71 1.96 9.7l8.71-6.8z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.6 2.15-8.71 2.15-6.38 0-11.87-3.63-14.33-8.94l-8.71 6.8C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Google로 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 