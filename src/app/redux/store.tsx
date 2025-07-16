import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./user";
import moodReducer from "./moodSlice";
import { combineReducers } from "redux";
import { useDispatch } from "react-redux";
const rootReducer = combineReducers({
  user: userReducer,
  mood: moodReducer,
});

const persistedReducer = persistReducer({ key: "root", storage }, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
