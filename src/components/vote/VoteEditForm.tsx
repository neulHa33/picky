import React from 'react';
import type { VoteOption } from '../../types/vote';
import VoteBasicInfo from './VoteBasicInfo';
import VoteOptions from './VoteOptions';
import FormActions from './FormActions';

interface VoteEditFormProps {
  formData: { title: string; description: string };
  options: VoteOption[];
  error: string | null;
  saving: boolean;
  onFormDataChange: (data: { title: string; description: string }) => void;
  onOptionChange: (id: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
}

const VoteEditForm: React.FC<VoteEditFormProps> = ({
  formData,
  options,
  error,
  saving,
  onFormDataChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onCancel,
  onSubmit,
  onDelete,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <VoteBasicInfo formData={formData} onFormDataChange={onFormDataChange} />
      <VoteOptions options={options} onOptionChange={onOptionChange} onAddOption={onAddOption} onRemoveOption={onRemoveOption} />
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <FormActions saving={saving} onCancel={onCancel} onDelete={onDelete} submitLabel="저장" />
    </form>
  );
};

export default VoteEditForm; 