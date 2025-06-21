import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Picky from './Picky';
import Navbar from './layout/Navbar';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  region: string;
  profileImageBase64: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              region: data.region,
              profileImageBase64: data.profileImageBase64,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User Profile Section */}
        {userProfile && (
          <div className="mb-8 bg-white rounded-lg shadow p-6 border border-pink-100">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {userProfile.profileImageBase64 ? (
                  <img
                    src={userProfile.profileImageBase64}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-pink-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center border-4 border-pink-200">
                    <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <p className="text-gray-600">{userProfile.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  Region: {userProfile.region.replace('-', ' ')}
                </p>
                <p className="text-xs text-gray-400">
                  Member since {userProfile.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Picky />
      </main>
    </div>
  );
};

export default Dashboard; 