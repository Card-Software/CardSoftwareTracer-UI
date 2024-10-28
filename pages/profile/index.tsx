import React, { useEffect, useState } from 'react';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import Layout from '@/app/layout';
import { userProxy } from '@/proxies/user.proxy';
import withAuth from '@/hoc/auth';

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string | undefined;
    password: string;
    confirmPassword: string;
    userId: string | undefined;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userId: '',
  });

  useEffect(() => {
    const user = userAuthenticationService.getUser();
    if (user) {
      setUserInfo(user);
      setFormData({
        userId: user.id,
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

      if (formData.password) {
        userInfo.password = formData.password;
      }
      userInfo.firstName = formData.firstName;
      userInfo.lastname = formData.lastName;
      await userProxy.updateUser(userInfo);
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing && userInfo) {
      setFormData({
        firstName: userInfo.firstName,
        lastName: userInfo.lastname,
        email: userInfo.email || undefined,
        password: '',
        confirmPassword: '',
        userId: userInfo.id || undefined,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reset password fields
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  if (!userInfo) return <p>Loading...</p>;

  return (
    <Layout>
      <div className="">
        <div className="flex flex-col">
          <div className="text-2xl" style={{ color: 'var(--primary-color)' }}>
            Profile
          </div>
          <div
            className="my-4 mt-1 w-full border-b-4"
            style={{ borderColor: 'var(--primary-color)' }}
          ></div>
          <div className="mt-8 flex flex-row">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              <span
                className="text-3xl font-bold"
                style={{ color: 'var(--primary-color)' }}
              >
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
            <div className="flex flex-1 items-end justify-end">
              <button
                onClick={toggleEdit}
                className="mt-4 inline-flex items-center rounded-md border border-blue-600 bg-white px-4 py-2 text-base font-medium text-blue-600 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Box for displaying First Name, Last Name, and Password */}
      <div className="mt-12">
        <div className="rounded-lg border border-gray-300 p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-900">
                <strong>First Name</strong>
              </p>
              <p>{userInfo.firstName}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-900">
                <strong>Last Name</strong>
              </p>
              <p>{userInfo.lastname}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-900">
                <strong>Password</strong>
              </p>
              <p>{'**********'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* New box for editing passwords when in edit mode */}
      {isEditing && (
        <div className="mt-8 rounded-lg border border-gray-300 p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-lg font-medium text-gray-900"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="confirmPassword"
                className="text-lg font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default withAuth(ProfilePage);
