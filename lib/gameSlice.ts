import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Coordinate = [0 | 1 | 2, 0 | 1 | 2];

export type CandidateLists = [[string[], string[], string[]], [string[], string[], string[]], [string[], string[], string[]]];

export type PlayerResponses = [[string | null, string | null, string | null], [string | null, string | null, string | null], [string | null, string | null, string | null]];

export interface GameState {
  /**
   * List of available items that have not been attempted yet
   */
  availableItems: string[];
  columnNames: [string | null, string | null, string | null];
  rowNames: [string | null, string | null, string | null];
  /**
   * For each coordinate, the possible solutions
   */
  candidateLists: CandidateLists;
  /**
   * For each coordinate, the introduced solution, or null if none
   */
  playerResponses: PlayerResponses;
  /**
   * Number of guesses left
   */
  guesses: number;
  /**
   * Whether the game has finished
   */
  over: boolean;
};

const initialState: GameState = {
  availableItems: [],
  columnNames: [null, null, null],
  rowNames: [null, null, null],
  candidateLists: [[[], [], []], [[], [], []], [[], [], []]],
  playerResponses: [[null, null, null], [null, null, null], [null, null, null]],
  guesses: 10,
  over: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setAvailableItems: (state, { payload }: PayloadAction<string[]>) => {
      state.availableItems = payload;
    },
    setCandidateLists: (state, { payload }: PayloadAction<CandidateLists>) => {
      state.candidateLists = payload;
    },
    setColumnNames: (state, { payload }: PayloadAction<[string | null, string | null, string | null]>) => {
      state.columnNames = payload;
    },
    setRowNames: (state, { payload }: PayloadAction<[string | null, string | null, string | null]>) => {
      state.rowNames = payload;
    },
    setResponse: (state, { payload: [[i, j], response] }: PayloadAction<[Coordinate, string]>) => {
      if (!state.availableItems.includes(response) || state.playerResponses[i][j] !== null || state.guesses === 0) {
        return;
      }
      if (state.candidateLists[i][j].includes(response)) {
        state.candidateLists[i][j] = state.candidateLists[i][j].filter(candidate => candidate !== response);
        state.playerResponses[i][j] = response;
      }
      state.availableItems = state.availableItems.filter(candidate => candidate !== response);
      state.guesses -= 1;
      state.over = state.guesses === 0 || state.playerResponses.flat().every(response => response !== null);
    },
  },
});

export const { setAvailableItems, setCandidateLists, setColumnNames, setRowNames, setResponse } = gameSlice.actions;

export default gameSlice.reducer;
