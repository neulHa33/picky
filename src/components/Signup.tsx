import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { Link, useNavigate } from 'react-router-dom';

const schema = yup.object({
  firstName: yup.string().required('성을 입력해 주세요.'),
  lastName: yup.string().required('이름을 입력해 주세요.'),
  email: yup.string().email('이메일 형식이 올바르지 않습니다.').required('이메일을 입력해 주세요.'),
  password: yup.string().min(6, '비밀번호는 6자 이상이어야 합니다.').required('비밀번호를 입력해 주세요.'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호 확인을 입력해 주세요.'),
  region: yup.string().required('지역을 선택해 주세요.'),
}).required();

type FormData = yup.InferType<typeof schema>;

const regions = [
  { value: '', label: '지역을 선택해 주세요.' },
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'australia', label: 'Australia' },
  { value: 'antarctica', label: 'Antarctica' },
];

const Signup: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      setError(null);
      
      // Create local preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUserToFirestore = async (userId: string, userData: FormData, profileImageBase64: string | null) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        region: userData.region,
        profileImageBase64,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Save user data to Firestore with base64 image
      await saveUserToFirestore(user.uid, data, imagePreview);

      console.log('User registered successfully');
      reset();
      setProfileImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google 회원가입 중 오류가 발생했습니다.');
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
              회원가입
            </h2>
            <p className="text-[#404040] text-base sm:text-lg">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-[#2A2A2A] hover:text-[#404040] transition-colors">
                로그인
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <label className="block text-base font-medium text-[#404040] mb-3">
                  프로필 이미지
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C5D9D5] to-[#B8CEC9] flex items-center justify-center overflow-hidden border-4 border-[#C5D9D5] mx-auto sm:mx-0 shadow-lg">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-[#404040] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C5D9D5] file:text-[#404040] hover:file:bg-[#B8CEC9] transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-[#404040]">최대 크기: 5MB. 지원 형식: JPG, PNG, GIF</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-base font-medium text-[#404040] mb-3">
                    성
                  </label>
                  <input
                    {...register('firstName')}
                    id="firstName"
                    type="text"
                    className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                      errors.firstName ? 'border-red-300' : 'border-[#C5D9D5]'
                    }`}
                    placeholder="성"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-base font-medium text-[#404040] mb-3">
                    이름
                  </label>
                  <input
                    {...register('lastName')}
                    id="lastName"
                    type="text"
                    className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                      errors.lastName ? 'border-red-300' : 'border-[#C5D9D5]'
                    }`}
                    placeholder="이름"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-base font-medium text-[#404040] mb-3">
                  이메일 주소
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
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
                  type="password"
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                    errors.password ? 'border-red-300' : 'border-[#C5D9D5]'
                  }`}
                  placeholder="비밀번호를 입력하세요"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-base font-medium text-[#404040] mb-3">
                  비밀번호 확인
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                    errors.confirmPassword ? 'border-red-300' : 'border-[#C5D9D5]'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="region" className="block text-base font-medium text-[#404040] mb-3">
                  지역
                </label>
                <select
                  {...register('region')}
                  id="region"
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5D9D5] focus:border-[#C5D9D5] text-base transition-colors bg-white ${
                    errors.region ? 'border-red-300' : 'border-[#C5D9D5]'
                  }`}
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="mt-2 text-sm text-red-600">{errors.region.message}</p>
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
                    회원가입 중...
                  </span>
                ) : (
                  '회원가입'
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
              onClick={handleGoogleSignup}
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

export default Signup; 