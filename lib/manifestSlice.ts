import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import stringify from 'fast-json-stable-stringify';

type Category = {
  name: string,
  members: string[],
};

type Manifest = {
  version: string,
  name: string,
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
  hash: number | null,
  status: ManifestStatus,
};

const initialState: ManifestState = {
  url: null,
  content: null,
  hash: null,
  status: ManifestStatus.Empty,
};


/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    A fast and simple 53-bit string hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
const hash = function(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
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
    removeManifest: (state) => {
      state.url = null;
      state.content = null;
      state.hash = null;
      state.status = ManifestStatus.Empty;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchManifest.pending, (state, action) => {
      state.content = null;
      state.hash = null;
      state.status = ManifestStatus.Loading;
    });
    builder.addCase(fetchManifest.fulfilled, (state, { payload }) => {
      state.content = payload;
      state.hash = hash(stringify(payload));
      state.status = ManifestStatus.Valid;
    });
    builder.addCase(fetchManifest.rejected, (state, action) => {
      state.content = null;
      state.hash = null;
      state.status = ManifestStatus.Invalid;
    });
    
  }
});

export const { removeManifest } = manifestSlice.actions;

export default manifestSlice.reducer;
