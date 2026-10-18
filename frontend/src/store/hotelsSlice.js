import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api.js';

const fail = (e) => ({ message: e.message, errors: e.errors || {} });

export const fetchHotels = createAsyncThunk('hotels/fetchAll', async (params, { rejectWithValue }) => {
  try { return await api.getHotels(params); } catch (e) { return rejectWithValue(fail(e)); }
});

export const fetchHotel = createAsyncThunk('hotels/fetchOne', async (id, { rejectWithValue }) => {
  try { return await api.getHotel(id); } catch (e) { return rejectWithValue(fail(e)); }
});

// One thunk for both add (no id) and edit (id) - mirrors the single reusable form.
export const saveHotel = createAsyncThunk('hotels/save', async ({ id, formData }, { rejectWithValue }) => {
  try { return id ? await api.updateHotel(id, formData) : await api.createHotel(formData); }
  catch (e) { return rejectWithValue(fail(e)); }
});

export const removeHotel = createAsyncThunk('hotels/remove', async (id, { rejectWithValue }) => {
  try { await api.deleteHotel(id); return id; } catch (e) { return rejectWithValue(fail(e)); }
});

const initialState = {
  list: [],
  total: 0,
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  saving: false,
  saveError: null,
  fieldErrors: {},
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
      state.saveError = null;
      state.fieldErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (s) => { s.listStatus = 'loading'; s.listError = null; })
      .addCase(fetchHotels.fulfilled, (s, { payload }) => {
        s.listStatus = 'succeeded';
        s.list = payload.data;
        s.total = payload.total;
      })
      .addCase(fetchHotels.rejected, (s, { payload }) => {
        s.listStatus = 'failed';
        s.listError = payload?.message || 'Could not load hotels';
      })

      .addCase(fetchHotel.pending, (s) => { s.currentStatus = 'loading'; s.currentError = null; })
      .addCase(fetchHotel.fulfilled, (s, { payload }) => { s.currentStatus = 'succeeded'; s.current = payload; })
      .addCase(fetchHotel.rejected, (s, { payload }) => {
        s.currentStatus = 'failed';
        s.currentError = payload?.message || 'Could not load the hotel';
      })

      .addCase(saveHotel.pending, (s) => { s.saving = true; s.saveError = null; s.fieldErrors = {}; })
      .addCase(saveHotel.fulfilled, (s) => { s.saving = false; })
      .addCase(saveHotel.rejected, (s, { payload }) => {
        s.saving = false;
        s.saveError = payload?.message || 'Could not save the hotel';
        s.fieldErrors = payload?.errors || {};
      })

      .addCase(removeHotel.fulfilled, (s, { payload }) => {
        s.list = s.list.filter((h) => h.id !== payload);
        s.total = Math.max(0, s.total - 1);
      });
  },
});

export const { clearCurrent } = hotelsSlice.actions;
export default hotelsSlice.reducer;
