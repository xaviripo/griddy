'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useSearchParams } from 'next/navigation';
import * as prand from 'pure-rand';

import Result from './Result';
import Modal from './Modal';

import { useAppSelector, useAppDispatch } from '../lib/hooks';
import {
  GameState,
  setAvailableItems,
  setCandidateLists,
  setColumnNames,
  setRowNames,
  CandidateLists,
  PlayerResponses
} from '../lib/gameSlice';

/*

TODO:

- Move styles to tailwind
- Route and parametrize manifest URL
- Show suggestions only after typing 3 characters
- Display possible solutions at the end
- Get rid of the ! and the as HTMLInputElement
- Manifest JSON schema

*/

function shuffleArray(array: any[], rng: any) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = prand.unsafeUniformIntDistribution(0, i, rng);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

type Category = {
  name: string,
  members: string[],
};

type Manifest = {
  version: string,
  items: string[],
  categories: Category[],
};

export type SelectedSquare = [0 | 1 | 2, 0 | 1 | 2] | null;

enum ManifestStatus {
  Loading, // No manifest processed yet
  Valid, // A manifest has successfully been provided
  Invalid, // A manifest has been provided, but it failed upon loading or it has an invalid format
  Empty, // User has not filled the manifest parameter
};

export default function Page() {

  // Get the ?manifest=... search param, or null if it's not set
  const searchParams = useSearchParams();
  const manifestURL: string | null = searchParams.get('manifest');

  // TODO figure out how to get type inference on these
  const columnNames = useAppSelector<GameState, [string | null, string | null, string | null]>(state => state.columnNames);
  const rowNames = useAppSelector<GameState, [string | null, string | null, string | null]>(state => state.rowNames);
  const playerResponses = useAppSelector<GameState, PlayerResponses>(state => state.playerResponses);
  const guesses = useAppSelector<GameState, number>(state => state.guesses);
  const over = useAppSelector<GameState, boolean>(state => state.over);
  const dispatch = useAppDispatch();

  const [manifestStatus, setManifestStatus] = useState<ManifestStatus>(ManifestStatus.Loading);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);

  useEffect(() => {

    // No manifest provided
    if (manifestURL === null) {
      setManifestStatus(ManifestStatus.Empty);
      return;
    }

    fetch(manifestURL, { method: 'GET' })
      .then(response => response.json())
      .then(({ items, categories }: Manifest) => {
        dispatch(setAvailableItems(items));

        const rng = prand.xoroshiro128plus(1234); // TODO seed this correctly

        let candidateLists: CandidateLists;
        let columnNames: [string | null, string | null, string | null];
        let rowNames: [string | null, string | null, string | null];
  
        // TODO replace this while with a for to limit the max number of attempts to generate a table
        loop: while (true) {
      
          // Select 6 categories at random
          shuffleArray(categories, rng);
          const catsRow = categories.slice(0, 3);
          const catsCol = categories.slice(3, 6);
          
          // Can't call it a Table yet because it's empty!
          candidateLists = [[[], [], []], [[], [], []], [[], [], []]];
          columnNames = [null, null, null];
          rowNames = [null, null, null];
          
          // Iterate through all rows and cols and check that each intersection has the minimum amount of candidates
          for (const i of [0, 1, 2]) {
            rowNames[i] = catsRow[i].name;
            for (const j of [0, 1, 2]) {
              columnNames[j] = catsCol[j].name;

              const candidates = catsRow[i].members.filter((item: string) => catsCol[j].members.includes(item));
              if (candidates.length < 3) {
                continue loop;
              }
              candidateLists[i][j] = candidates;

            }
          }

          break;
        }

        dispatch(setCandidateLists(candidateLists));
        dispatch(setColumnNames(columnNames));
        dispatch(setRowNames(rowNames));
        setManifestStatus(ManifestStatus.Valid);

      })
      .catch(error => {
        setManifestStatus(ManifestStatus.Invalid);
      });
  }, []);

  if (manifestStatus === ManifestStatus.Empty) {
    return 'No manifest provided!';
  } else if (manifestStatus === ManifestStatus.Invalid) {
    return 'Invalid manifest provided!';
  }

  if ([columnNames, rowNames, playerResponses, guesses, over, dispatch].some((elem: any) => elem === undefined)) {
    return;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
            {columnNames.map((columnName, i) => <th key={i}>{columnName}</th>)}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map(i => <tr key={i}>
            <th scope="row">{rowNames[i]}</th>
            {
              [0, 1, 2].map(j => <td key={j} style={selectedSquare ? (selectedSquare[0] === i && selectedSquare[1] === j ? {backgroundColor: 'Orange'} : {}) : {}}>{
                playerResponses[i][j] || <div style={{height: '100%', margin: 0, cursor: guesses > 0 ? 'pointer' : 'default'}} onClick={() => {guesses > 0 && setSelectedSquare([i, j] as SelectedSquare)}}></div>
              }</td>)
            }
          </tr>)}
        </tbody>
      </table>
      {
        over
        ? Result(<>
            {[0, 1, 2].map(i => <span key={i}>
              {[0, 1, 2].map(j => playerResponses[i][j] === null ? '❌' : '✅').join('')}
              <br></br>
            </span>)}
            {guessesLeft(guesses)}
          </>)
        : <div style={{marginLeft: 'auto', marginTop: '20px', textAlign: 'center', fontSize: 20}}>{guessesLeft(guesses)}</div>
      }
      {selectedSquare &&
        createPortal(<Modal selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare}></Modal>, document.body)
      }
    </>
  );
}

function guessesLeft(guesses: number): string {
  return `${guesses} ${guesses === 1 ? 'guess' : 'guesses'} left`;
}
