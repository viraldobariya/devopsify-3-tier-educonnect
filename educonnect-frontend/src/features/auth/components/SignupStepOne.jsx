// src/features/auth/components/SignupStepOne.jsx
import React, { useState } from 'react';
import { checkAvailability } from '../../../api/authApi';
import { isValidEmail } from '../../../utils/Validator';

const SignupStepOne = ({ nextStep, updateFormData, formData }) => {
  const [loading, setLoading] = useState(false);

  const [localData, setLocalData] = useState({
    fullName: formData.fullName || '',
    username: formData.username || '',
    email: formData.email || '',
    avatar: formData.avatar || null,
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setLocalData({ ...localData, [name]: value });
  };

  const handleFileChange = e => {
    setLocalData({ ...localData, [e.target.name]: e.target.files[0] });
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (
      !localData.username ||
      !localData.email ||
      !localData.fullName ||
      !localData.avatar
    ) {
      setErrorMessage('Please provide all the fields.');
      return;
    }
    if (!isValidEmail(localData.email)) {
      setErrorMessage('Please provide valid email.');
      return;
    }
    setLoading(true);
    let availability;
    try{
      availability = await checkAvailability({
          username: localData.username,
          email: localData.email,
        });
    }
    catch (err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
    if (!availability?.data?.availability) {
      setErrorMessage('Username or Email is Already Used.');
      return;
    }
    updateFormData(localData);
    setErrorMessage('');
    nextStep();
  };

  return (
    <div>
      <fieldset disabled={loading} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={localData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={localData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={localData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="w-full">
          <label
            htmlFor="avatar"
            className="inline-block px-4 py-2 bg-gray-800 border rounded cursor-pointer hover:bg-gray-700 text-white"
          >
            {localData.avatar ? localData.avatar.name : 'Choose Avatar'}
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          type='button'
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Loading...' : 'Next'}
        </button>
        <p
          id="form-message"
          className={`text-red-500 text-sm transition-opacity duration-200 ${
            errorMessage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {errorMessage}
        </p>
      </fieldset>
    </div>
  );
};

export default SignupStepOne;
