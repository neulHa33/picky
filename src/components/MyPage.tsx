import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './layout/Navbar';

interface Vote {
  id: string;
  title: string;
  description: string;
  participants: number;
  totalVotes: number;
  createdAt: Date;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  region: string;
  profileImageBase64: string | null;
}

const MyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'created' | 'participated' | 'profile'>('created');
  const [createdVotes, setCreatedVotes] = useState<Vote[]>([]);
  const [participatedVotes, setParticipatedVotes] = useState<Vote[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const createdQuery = query(
        collection(db, 'votes'),
        where('createdBy', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const createdSnapshot = await getDocs(createdQuery);
      const createdVotesList: Vote[] = createdSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          participants: data.participants || 0,
          totalVotes: data.totalVotes || 0,
          createdAt: data.createdAt.toDate()
        };
      });
      setCreatedVotes(createdVotesList);

      const participatedQuery = query(
        collection(db, 'votes'),
        where('votedBy', 'array-contains', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const participatedSnapshot = await getDocs(participatedQuery);
      const participatedVotesList: Vote[] = participatedSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          participants: data.participants || 0,
          totalVotes: data.totalVotes || 0,
          createdAt: data.createdAt.toDate()
        };
      });
      setParticipatedVotes(participatedVotesList);

      // Fetch user profile
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('email', '==', currentUser?.email)
      ));
      if (!userDoc.empty) {
        const data = userDoc.docs[0].data();
        setUserProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          region: data.region,
          profileImageBase64: data.profileImageBase64
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (voteId: string) => {
    if (activeTab === 'created') {
      navigate(`/edit-vote/${voteId}`);
    } else {
      navigate(`/vote/${voteId}`);
    }
  };

  const renderVoteList = (votes: Vote[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩중...</p>
        </div>
      );
    }

    if (votes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer border border-pink-100 hover:border-pink-200"
            onClick={() => handleVoteClick(vote.id)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{vote.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vote.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>참여자 : {vote.participants}</span>
              <span>생성일 : {vote.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">마이페이지</h1>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-pink-500'
                  : 'border-transparent text-gray-500 hover:text-pink-700 hover:border-pink-300'
              }`}
            >
              내가 쓴 글 ({createdVotes.length})
            </button>
            <button
              onClick={() => setActiveTab('participated')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participated'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-pink-700 hover:border-pink-300'
              }`}
            >
              내가 투표한 글 ({participatedVotes.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-pink-700 hover:border-pink-300'
              }`}
            >
              설정
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow border">
          {activeTab === 'created' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">내가 쓴 글</h2>
                <button
                  onClick={() => navigate('/create-vote')}
                  className="px-4 py-2 text-white rounded-md hover:bg-pink-600 transition-colors"
                >
                  투표생성
                </button>
              </div>
              {renderVoteList(createdVotes, "아직 투표를 생성하지 않았습니다.")}
            </div>
          )}

          {activeTab === 'participated' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">내가 투표한 글</h2>
              {renderVoteList(participatedVotes, "참여한 투표가 없습니다.")}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileEditForm 
              userProfile={userProfile} 
              onUpdate={fetchUserData}
              loading={profileLoading}
              setLoading={setProfileLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Profile Edit Form Component
interface ProfileEditFormProps {
  userProfile: UserProfile | null;
  onUpdate: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userProfile, onUpdate, loading, setLoading }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    region: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        region: userProfile.region,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setImagePreview(userProfile.profileImageBase64);
    }
  }, [userProfile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일을 선택해 주세요');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      setProfileImage(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('이름을 입력해 주세요.');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('성을 입력해 주세요.');
      return false;
    }
    if (!formData.region) {
      setError('지역을 선택해 주세요.');
      return false;
    }
    if (showEmailField && !formData.email.trim()) {
      setError('이메일을 입력해 주세요.');
      return false;
    }
    if (showEmailField && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return false;
    }
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setError('현재 비밀번호를 입력해 주세요.');
        return false;
      }
      if (!formData.newPassword) {
        setError('새로운 비밀번호를 입력해 주세요.');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError('새로운 비밀번호는 6자 이상이어야 합니다.');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('새로운 비밀번호가 일치하지 않습니다.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (showEmailField || showPasswordFields) {
        if (!formData.currentPassword) {
          throw new Error('현재 비밀번호를 입력해 주세요.');
        }

        const credential = EmailAuthProvider.credential(
          currentUser?.email || '',
          formData.currentPassword
        );
        await reauthenticateWithCredential(currentUser!, credential);
      }

      if (showEmailField && formData.email !== userProfile?.email) {
        await updateEmail(currentUser!, formData.email);
      }

      if (showPasswordFields && formData.newPassword) {
        await updatePassword(currentUser!, formData.newPassword);
      }

      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('email', '==', currentUser?.email)
      ));

      if (!userDoc.empty) {
        const docRef = doc(db, 'users', userDoc.docs[0].id);
        await updateDoc(docRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          region: formData.region,
          profileImageBase64: imagePreview,
          updatedAt: new Date()
        });
      }

      setSuccess('프로필이 성공적으로 업데이트되었습니다!');
      setShowPasswordFields(false);
      setShowEmailField(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setProfileImage(null);
      
      // Refresh user data
      onUpdate();
    } catch (err: any) {
      setError(err.message || '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="p-6 text-center text-gray-500">
        프로필 로딩중...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">프로필 설정</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로필 이미지
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              성
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              required
            />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <button
              type="button"
              onClick={() => setShowEmailField(!showEmailField)}
              className="text-sm text-pink-600 hover:text-pink-500"
            >
              {showEmailField ? '취소' : '변경'}
            </button>
          </div>
          {showEmailField ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              placeholder="Enter new email"
            />
          ) : (
            <input
              type="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
            />
          )}
        </div>

        {/* 지역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            지역
          </label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            required
          >
            <option value="">지역을 선택해 주세요.</option>
            <option value="north-america">North America</option>
            <option value="south-america">South America</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="africa">Africa</option>
            <option value="australia">Australia</option>
            <option value="antarctica">Antarctica</option>
          </select>
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">비밀번호 변경</h3>
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-sm text-pink-600 hover:text-pink-500"
            >
              {showPasswordFields ? '취소' : '변경'}
            </button>
          </div>
          
          {showPasswordFields && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="현재 비밀번호를 입력해 주세요."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  새로운 비밀번호
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="새로운 비밀번호를 입력해 주세요."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  새로운 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="새로운 비밀번호를 입력해 주세요."
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '업데이트중...' : '업데이트'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyPage; 