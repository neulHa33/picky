import React from 'react';
import Input from '../ui/Input';

interface VoteBasicInfoProps {
  formData: { title: string; description: string };
  onFormDataChange: (data: { title: string; description: string }) => void;
}

const VoteBasicInfo: React.FC<VoteBasicInfoProps> = ({ formData, onFormDataChange }) => (
  <>
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
        투표제목
      </label>
      <Input
        id="title"
        type="text"
        value={formData.title}
        onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
        placeholder="Enter your question title"
        required
      />
    </div>
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
        설명
      </label>
      <textarea
        id="description"
        rows={3}
        value={formData.description}
        onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="Provide more details about your question"
        required
      />
    </div>
  </>
);

export default VoteBasicInfo; 