import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./slices/userSlice";
import instructorReducer from "./slices/instructorSlice";

const userPersistConfig = { key: "user", storage };
const instructorPersistConfig = { key: "instructor", storage };

const rootReducers = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  instructor: persistReducer(instructorPersistConfig, instructorReducer),
});

const store = configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
