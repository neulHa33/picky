export type OptionId = string;

export interface VoteOption {
  id: OptionId;
  text: string;
  votes: number;
}

export interface VoteEditFormData {
  title: string;
  description: string;
}

export interface VoteEditState {
  vote: Vote | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: VoteEditFormData;
  options: VoteOption[];
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
  deadline: Date;
  participants: number;
  totalVotes: number;
} 