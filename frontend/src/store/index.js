import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './hotelsSlice.js';

export default configureStore({ reducer: { hotels: hotelsReducer } });
