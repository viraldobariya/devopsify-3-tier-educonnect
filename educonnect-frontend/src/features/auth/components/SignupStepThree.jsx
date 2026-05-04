// src/features/auth/components/SignupStepThreeOtp.jsx
import React, { useEffect, useRef, useState } from 'react';
import { generateOtp } from '../../../utils/OtpGenerator';
import { sendOTP } from '../../../api/emailApi';
import { signUp } from '../../../api/authApi';
import { useNavigate } from 'react-router-dom';

const SignupStepThreeOtp = ({ prevStep, formData, updateFormData }) => {

  const [otp, setOtp] = useState('');
  const [lock, setLock] = useState(true);
  const fixOtp = useRef(generateOtp());
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const otpSent = useRef(false)

  useEffect(() => {
    const start = async () => {
      if (!otpSent.current){
        await sendOTP({to: formData.email, otp: fixOtp.current})
        otpSent.current = true;
        setTimeout(() => {
          setLock(false)
        }, 10000)
      }
    }
    start()
  })

  const handleRegister = async () => {
    if (otp != fixOtp.current){
      setErrorMessage("OTP is wrong.");
      return;
    }
    setLoading(true)
    try{
      const res = await signUp({...formData, avatar:null}, formData.avatar);
      console.log(res.data)
      if (res.status != 200){
      setErrorMessage("Something went wrong while signing up the user.")
      }
      else{
        updateFormData({})
        navigate("/login");
      }
    }
    catch (err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }

  };

  return (
    <fieldset disabled={loading} className="space-y-4">
      <input
        type="text"
        name="otp"
        placeholder="Enter 4-digit OTP"
        maxLength={4}
        value={otp}
        onChange={e => setOtp(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <p
          id="form-message"
          className={`text-red-500 text-xl transition-opacity duration-200 ${
            errorMessage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {errorMessage}
      </p>

      <div className="flex justify-between">
        <button
          disabled = {lock}
          onClick={prevStep}
          className={`bg-gray-300 text-black px-4 py-2 rounded cursor-pointer ${lock ? 'opacity-50' : ''}`}
        >
          Back
        </button>
        <button
          onClick={handleRegister}
          className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </div>
    </fieldset>
  );
};

export default SignupStepThreeOtp;
