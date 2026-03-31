// // File: src/features/auth/pages/SignupPage.jsx
// import React, { useState } from 'react';
// import SignupStepOne from '../components/SignupStepOne';
// import SignupStepTwo from '../components/SignupStepTwo';
// import SignupStepThreeOtp from '../components/SignupStepThree';

// const SignupPage = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     username: '',
//     email: '',
//     avatar: '',
//     university: '',
//     skills: [],
//     course: '',
//     password: '',
//     role: 'USER'
//   });

//   const nextStep = () => setStep(prev => prev + 1);
//   const prevStep = () => setStep(prev => prev - 1);
//   const updateFormData = newData => {
//     setFormData(prev => ({ ...prev, ...newData }));
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">
//         <div className="mb-6 text-center">
//           <h2 className="text-2xl font-semibold text-gray-800">Sign Up</h2>
//           <p className="text-gray-500">Step {step} of 3</p>
//         </div>

//         {step === 1 && (
//           <SignupStepOne
//             nextStep={nextStep}
//             updateFormData={updateFormData}
//             formData={formData}
//           />
//         )}

//         {step === 2 && (
//           <SignupStepTwo
//             nextStep={nextStep}
//             prevStep={prevStep}
//             updateFormData={updateFormData}
//             formData={formData}
//           />
//         )}

//         {step === 3 && (
//           <SignupStepThreeOtp
//             prevStep={prevStep}
//             formData={formData}
//             updateFormData={updateFormData}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SignupPage;


import React, { useState } from 'react';
import SignupStepOne from '../components/SignupStepOne';
import SignupStepTwo from '../components/SignupStepTwo';
import SignupStepThreeOtp from '../components/SignupStepThree';
import { FiArrowLeft } from 'react-icons/fi';

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    avatar: '',
    university: '',
    skills: [],
    course: '',
    password: '',
    role: 'USER'
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  const updateFormData = newData => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="w-full max-w-2xl">
        {/* Animated Background Card */}
        <div className="card-glass p-8 scale-in relative">
          {/* Back button (shown except on first step) */}
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="absolute top-6 left-6 text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <FiArrowLeft className="text-lg" /> Back
            </button>
          )}

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold font-display text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text mb-2">
                Join EduConnect
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>

            {/* Premium Progress Indicator */}
            <div className="flex justify-center items-center mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    step >= i 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg' 
                      : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                  }`}>
                    {step > i ? '✓' : i}
                    {step >= i && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  {i < 3 && (
                    <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                      step > i ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-700'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-gray-400 text-lg">
              Step {step} of 3 - {step === 1 ? 'Personal Information' : step === 2 ? 'Educational Details' : 'Verification'}
            </p>
          </div>

          {/* Form Steps */}
          <div className="fade-in">
            {step === 1 && (
              <SignupStepOne
                nextStep={nextStep}
                updateFormData={updateFormData}
                formData={formData}
              />
            )}

            {step === 2 && (
              <SignupStepTwo
                nextStep={nextStep}
                prevStep={prevStep}
                updateFormData={updateFormData}
                formData={formData}
              />
            )}

            {step === 3 && (
              <SignupStepThreeOtp
                prevStep={prevStep}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-300 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Additional Visual Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;