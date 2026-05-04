import React from 'react';
import { Tag } from 'antd';

const SkillTagGroup = ({ skills }) => {
  const getTagColor = (skill) => {
    // You can customize colors based on skill categories
    if (skill.includes('_')) {
      return 'purple';
    }
    return 'default';
  };

  return (
    <div>
      {skills.map((skill, index) => (
        <Tag 
          key={index} 
          color={getTagColor(skill)}
          style={{ marginBottom: 8 }}
        >
          {skill.replace(/_/g, ' ')}
        </Tag>
      ))}
    </div>
  );
};

export default SkillTagGroup;