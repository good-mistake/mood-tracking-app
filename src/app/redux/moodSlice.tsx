import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MoodEntry {
  createdAt: string;
  mood: number;
  feelings: string[];
  journalEntry: string;
  sleepHours: number;
}
interface GuestMoodState {
  entries: MoodEntry[];
}
const initialState: GuestMoodState = {
  entries: [],
};

const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    setInitialGuestMoodEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
    },
    addMoodEntry: (state, action: PayloadAction<MoodEntry>) => {
      state.entries.push(action.payload);
    },
    updateMoodEntry: (state, action: PayloadAction<MoodEntry>) => {
      const index = state.entries.findIndex(
        (e) => e.createdAt === action.payload.createdAt
      );
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    clearGuestMood: (state) => {
      state.entries = [];
    },
  },
});

export const {
  addMoodEntry,
  updateMoodEntry,
  clearGuestMood,
  setInitialGuestMoodEntries,
} = moodSlice.actions;

export default moodSlice.reducer;
