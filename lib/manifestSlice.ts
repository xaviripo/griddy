import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { GetThunkAPI, PayloadAction } from '@reduxjs/toolkit';

type Category = {
  name: string,
  members: string[],
};

type Manifest = {
  version: string,
  items: string[],
  categories: Category[],
};

export enum ManifestStatus {
  Empty, // No manifest given yet
  Loading, // No manifest processed yet
  Invalid, // Invalid file or format
  Valid, // A manifest has successfully been provided, and it is synctactically correct
};

export interface ManifestState {
  url: string | null,
  content: Manifest | null,
  status: ManifestStatus,
};

const initialState: ManifestState = {
  url: null,
  content: null,
  status: ManifestStatus.Empty,
};

export const fetchManifest = createAsyncThunk<Manifest, string>('manifest/fetchManifest', async (url, { dispatch }) => {
  dispatch(manifestSlice.actions.setURL(url));
  const response = await fetch(url, { method: 'GET' });
  const manifest: Manifest = await response.json();
  return manifest;
});

export const manifestSlice = createSlice({
  name: 'manifest',
  initialState,
  reducers: {
    setURL: (state, { payload }: PayloadAction<string | null>) => {
      state.url = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchManifest.pending, (state, action) => {
      state.status = ManifestStatus.Loading;
    });
    builder.addCase(fetchManifest.fulfilled, (state, { payload }) => {
      state.content = payload;
      state.status = ManifestStatus.Valid;
    });
    builder.addCase(fetchManifest.rejected, (state, action) => {
      state.status = ManifestStatus.Invalid;
    });
    
  }
});

export default manifestSlice.reducer;
