import React, { useState } from 'react';
import { isValidPassword } from '../../../utils/Validator';

const courses = [
  'COMPUTER_ENGINEERING',
  'INFORMATION_TECHNOLOGY',
  'ELECTRICAL_ENGINEERING',
  'ELECTRONICS_COMMUNICATION_ENGINEERING',
  'MECHANICAL_ENGINEERING',
  'CIVIL_ENGINEERING',
  'CHEMICAL_ENGINEERING',
  'AUTOMOBILE_ENGINEERING',
  'MECHATRONICS_ENGINEERING',
  'BIOMEDICAL_ENGINEERING',
  'AERONAUTICAL_ENGINEERING',
  'AGRICULTURAL_ENGINEERING',
  'MARINE_ENGINEERING',
  'MINING_ENGINEERING',
  'INDUSTRIAL_ENGINEERING',
  'TEXTILE_ENGINEERING',
  'PETROLEUM_ENGINEERING',
  'ENVIRONMENTAL_ENGINEERING',
  'STRUCTURAL_ENGINEERING',
  'ROBOTICS_ENGINEERING',
  'BCA',
  'MCA',
  'BSC_IT',
  'MSC_IT',
  'BBA',
  'MBA',
  'BCOM',
  'MCOM',
  'BA',
  'MA',
  'BSC',
  'MSC',
  'BPHARMA',
  'MPHARMA',
  'MBBS',
  'LLB',
  'LLM',
  'BARCH',
  'BDES',
  'BFA',
];

const universities = [
  'GUJARAT_UNIVERSITY',
  'SARDAR_PATEL_UNIVERSITY',
  'MAHARAJA_SAYAJIRAO_UNIVERSITY',
  'NIRMA_UNIVERSITY',
  'DDIT_UNIVERSITY',
  'GANPAT_UNIVERSITY',
  'PARUL_UNIVERSITY',
  'MARWADI_UNIVERSITY',
  'CHARUSAT_UNIVERSITY',
  'PANDIT_DINDAYAL_ENERGY_UNIVERSITY',
  'GUJARAT_TECHNOLOGICAL_UNIVERSITY',
  'SWARNIM_GUJARAT_TECHNOLOGICAL_UNIVERSITY',
  'KADI_SARVA_VISHWAVIDYALAYA',
  'RAI_UNIVERSITY',
  'INDIRA_GANDHI_OPEN_UNIVERSITY_GUJARAT',
  'GLS_UNIVERSITY',
  'VEER_NARMAD_SOUTH_GUJARAT_UNIVERSITY',
  'HEMCHANDRACHARYA_NORTH_GUJARAT_UNIVERSITY',
  'KRANTIGURU_SHYAMJI_KRISHNA_VERMA_KACHCHH_UNIVERSITY',
];

const skills = [
  'JAVA',
  'PYTHON',
  'REACT',
  'SPRING_BOOT',
  'FLUTTER',
  'AWS',
  'GIT',
  'JAVASCRIPT',
  'TYPESCRIPT',
  'NODEJS',
  'DJANGO',
  'MACHINE_LEARNING',
  'FIGMA',
  'PHOTOSHOP',
  'GITHUB',
  'TAILWIND',
  'C',
  'CPP',
  'ANGULAR',
  'GRAPHQL',
  'KUBERNETES',
  'SQL',
  'DATA_ANALYSIS',
  'TEAMWORK',
  'PUBLIC_SPEAKING',
  'LEADERSHIP',
  'MARKETING',
  'WRITING',
  'TRANSLATION',
];

const SignupStepTwo = ({ nextStep, prevStep, updateFormData, formData }) => {

  const [errorMessage, setErrorMessage] = useState('');

  const [localData, setLocalData] = useState({
    university: formData.university || '',
    skills: formData.skills || [],
    course: formData.course || '',
    password: formData.password || '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setLocalData({ ...localData, [name]: value });
  };

  const handleSkillToggle = skill => {
    const newSkills = localData.skills.includes(skill)
      ? localData.skills.filter(s => s !== skill)
      : [...localData.skills, skill];
    setLocalData({ ...localData, skills: newSkills });
  };

  const handleNext = () => {
    if (
      !localData.course ||
      !localData.university
    ) {
      setErrorMessage("Please fill all fields.")
      return;
    }
		if (!isValidPassword(localData.password)){
			setErrorMessage("Enter Password in length of 8 to 16, with atleast one Alphabet, Number and Special Character.");
			return;
		}
		setErrorMessage("");
    updateFormData(localData);
    nextStep();
  };

  return (
    <div className="space-y-4">
      <select
        name="university"
        value={localData.university}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-gray-800"
      >
        <option value="">Select University</option>
        {universities.map(uni => (
          <option key={uni} value={uni}>
            {uni.replaceAll('_', ' ')}
          </option>
        ))}
      </select>

      <select
        name="course"
        value={localData.course}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-gray-800"
      >
        <option value="">Select Course</option>
        {courses.map(course => (
          <option key={course} value={course}>
            {course.replaceAll('_', ' ')}
          </option>
        ))}
      </select>

      <div className="space-y-2">
        <p className="font-semibold">Select Skills</p>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
          {skills.map(skill => (
            <label key={skill} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localData.skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              {skill.replaceAll('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={localData.password}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          Back
        </button>
        <button
					type='button'
          onClick={handleNext}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Get OTP
        </button>
      </div>
      <p
        id="form-message"
        className={`text-red-500 text-sm transition-opacity duration-200 ${
          errorMessage ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {errorMessage}
      </p>
    </div>
  );
};

export default SignupStepTwo;
