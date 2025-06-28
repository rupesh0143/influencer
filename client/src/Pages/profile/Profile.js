import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import {
  ShareIcon,
  ChatBubbleBottomCenterTextIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Use useParams to get id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // console.log('Fetching profile for ID:', id); // Debug log
        const response = await fetch(`http://localhost:8000/profile/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('Fetched data:', data); // Debug log

        if (data.success) {
          setUser(data.data); // Assuming data.data is the user object
        } else {
          setError(data.error || 'Profile not found');
        }
      } catch (err) {
        setError('An error occurred while fetching the profile');
        console.error('Fetch error:', err);
      }
    };

    fetchProfile();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-red-500 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
          <img
            src={user.profileImage || '//DESKTOP-C7DL6LE/image/imgF3.jpg'}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-200"
          />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <div className="mt-3 sm:mt-0 flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                  Follow
                </button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 transition">
                  Message
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{user.bio || 'No bio available'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm text-gray-700">
              <div>
                <p className="font-medium">Platform</p>
                <p>{user.socialMediaPlatform || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Followers</p>
                <p>{user.followerCount?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="font-medium">Engagement</p>
                <p>{user.engagementRate ? `${user.engagementRate}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Services</p>
                <p>{user.serviceCount || '0'}</p>
              </div>
              <div>
                <p className="font-medium">Rating</p>
                <p>{user.averageRating ? `${user.averageRating}/5` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Niche</p>
                <p>{user.niche || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Available Services</p>
              <ul className="flex flex-wrap gap-2">
                {(user.availableServices || []).map((service, i) => (
                  <li
                    key={i}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-3 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
          <p>Last updated just now</p>
          <div className="flex gap-4">
            <button className="flex items-center gap-1 hover:text-red-500 transition">
              <HeartIcon className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
              Comment
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition">
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;