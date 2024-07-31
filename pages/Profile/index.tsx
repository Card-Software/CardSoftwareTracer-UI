import React, { useEffect, useState } from 'react';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import { User } from '@/models/User';

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const user = userAuthenticationService.getUser();
    if (user) {
      setUserInfo(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastname,
        email: user.email,
        password: '',
        confirmPassword: '',
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (userInfo) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      // Here you would typically call an API to save the changes
      // For simplicity, we're just updating local state
      setUserInfo({
        ...userInfo,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      // If password is changed, you would need to send a request to update it
      if (formData.password) {
        // Update password logic here
      }

      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing && userInfo) {
      // Reset formData to current user info when entering edit mode
      setFormData({
        firstName: userInfo.firstName,
        lastName: userInfo.lastname,
        email: userInfo.email,
        password: '',
        confirmPassword: '',
      });
    }
  };

  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-500 p-4">
      <div className="w-full max-w-screen-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="rounded-t-lg bg-teal-600 p-6 text-white">
          <div className="flex items-center">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-300">
              <span className="text-3xl font-bold text-gray-600">
                {userInfo.firstName[0]}
                {userInfo.lastname[0]}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-4xl font-bold">
                {userInfo.firstName} {userInfo.lastname}
              </h1>
              <p className="text-xl">{userInfo.email}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Save
                </button>
                <button
                  onClick={toggleEdit}
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                <strong>First Name:</strong> {userInfo.firstName}
              </p>
              <p className="text-lg font-medium text-gray-900">
                <strong>Last Name:</strong> {userInfo.lastName}
              </p>
              <p className="text-lg font-medium text-gray-900">
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p className="text-lg font-medium text-gray-900">
                <strong>Password:</strong>{' '}
                {userInfo.password || 'No password available'}
              </p>
              <button
                onClick={toggleEdit}
                className="mt-4 inline-flex items-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
