export interface MoodEntry {
  createdAt: string;
  mood: number;
  feelings: string[];
  journalEntry: string;
  sleepHours: number;
  id?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  isOnboarded: boolean;
  profilePic?: string;
  moodEntries: MoodEntry[];
  fullName: string;
  name: string;
  isGuest?: boolean;
}
export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
