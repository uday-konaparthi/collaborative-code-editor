import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './redux/user';
import codeReducer from './redux/codeSlice';
import roomReducer from './redux/room';
import themeReducer from './redux/themeSlice'

// 1. Persist config with whitelist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'room'],
};

// 2. Root reducer
const rootReducer = combineReducers({
  user: userReducer,
  room: roomReducer,
  code: codeReducer, 
  theme: themeReducer
});

// 3. Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// 5. Export persistor
export const persistor = persistStore(store);
