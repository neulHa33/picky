import { MIN_OPTIONS, ERROR_MESSAGES } from '../constants/vote';
import type { VoteOption } from '../types/vote';

export function validateVoteForm({ title, description, options }: { title: string; description: string; options: VoteOption[] }) {
  if (!title.trim()) {
    return 'Title is required';
  }
  if (!description.trim()) {
    return 'Description is required';
  }
  const validOptions = options.filter(option => option.text.trim() !== '');
  if (validOptions.length < MIN_OPTIONS) {
    return ERROR_MESSAGES.AT_LEAST_TWO_OPTIONS;
  }
  if (validOptions.length !== options.length) {
    return ERROR_MESSAGES.ALL_OPTIONS_REQUIRED;
  }
  return null;
}

export function generateOptionId(existingOptions: VoteOption[]): string {
  // Use a simple increment or timestamp-based id
  const ids = existingOptions.map(opt => parseInt(opt.id, 10)).filter(n => !isNaN(n));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return (maxId + 1).toString();
} 