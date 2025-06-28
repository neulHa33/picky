import React from 'react';
import Button from '../ui/Button';

interface FormActionsProps {
  saving: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onCancel, submitLabel = '저장' }) => (
  <div className="flex justify-end space-x-3">
    <Button
      type="button"
      onClick={onCancel}
      className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
    >
      취소
    </Button>
    <Button
      type="submit"
      loading={saving}
      className="border border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
    >
      {submitLabel}
    </Button>
  </div>
);

export default FormActions; 