import React from 'react';
import type { VoteOption } from '../../types/vote';
import Input from '../ui/Input';

interface VoteOptionsProps {
  options: VoteOption[];
  onOptionChange: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
}

const VoteOptions: React.FC<VoteOptionsProps> = ({ options, onOptionChange, onAddOption, onRemoveOption }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      투표옵션 ({options.length}/4)
    </label>
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              value={option.text}
              onChange={(e) => onOptionChange(option.id, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          </div>
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => onRemoveOption(option.id)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
    {options.length < 4 && (
      <button
        type="button"
        onClick={onAddOption}
        className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        옵션추가
      </button>
    )}
  </div>
);

export default VoteOptions; 