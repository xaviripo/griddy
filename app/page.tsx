'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import * as prand from 'pure-rand';

import Result from './Result';
import Modal from './Modal';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setAvailableItems, setCandidateLists, setColumnNames, setRowNames, CandidateLists } from '@/lib/gameSlice';
import Board from './Board';
import ManifestManager from './ManifestManager';

/*

TODO:

- Route and parametrize manifest URL
- Display possible solutions at the end
- Manifest JSON schema
- Add pics for items

*/

export type SelectedSquare = [0 | 1 | 2, 0 | 1 | 2] | null;

function shuffleArray(array: any[], rng: prand.RandomGenerator) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = prand.unsafeUniformIntDistribution(0, i, rng);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function guessesLeft(guesses: number): string {
  return `${guesses} ${guesses === 1 ? 'guess' : 'guesses'} left`;
}

export default function Page() {

  const dispatch = useAppDispatch();

  // Get the ?manifest=... search param, or null if it's not set
  const manifestURL: string | null = useSearchParams().get('manifest');

  const { status, content } = useAppSelector(state => state.manifest);
  const { playerResponses, guesses, over } = useAppSelector(state => state.game);

  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [utcDate, setUtcDate] = useState<string>('');

  useEffect(() => {

    if (content === null) {
      return;
    }

    dispatch(setAvailableItems(content.items));

    // The seed is the UNIX timestamp of 00:00 UTC time for the current UTC day
    const utcDate: string =
      new Date().toLocaleDateString("en-GB", {timeZone: 'UTC'}) // "31/12/2024"
      .split('/') // ["31", "12", "2024"]
      .toReversed() // ["2024", "12", "31"]
      .join('-'); // "2024-12-31"

    // Save the date of the puzzle
    setUtcDate(utcDate);

    // Get the UNIX timestamp at 00:00 UTC
    const seed = new Date(utcDate).valueOf();

    // Obtain the RNG with the given seed
    const rng = prand.xoroshiro128plus(seed);

    let candidateLists: CandidateLists;
    let columnNames: [string | null, string | null, string | null];
    let rowNames: [string | null, string | null, string | null];

    // TODO replace this while with a for to limit the max number of attempts to generate a table
    loop: while (true) {

      const categories = [...content.categories];
  
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

  }, [content]);

  return <>
    <div className="text-slate-200">
      <h1 className="pt-10 pb-0 text-center text-3xl">{content?.name}</h1>
      <h2 className="pt-0 pb-5 text-center text-xl">{utcDate}</h2>
      <ManifestManager manifestStatus={status} manifestURL={manifestURL}>
        <Board selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare} />
        <div className="m-10 text-center text-xl font-extralight">
          {
            over
            ? <Result>
                {content?.name}<br/>
                {utcDate}<br/>
                {[0, 1, 2].map(i => <span key={i}>
                  {[0, 1, 2].map(j => playerResponses[i][j] === null ? '❌' : '✅').join('')}
                  <br/>
                </span>)}
                {guessesLeft(guesses)}
              </Result>
            : <div>{guessesLeft(guesses)}</div>
          }
        </div>
        {selectedSquare &&
          createPortal(<Modal selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare}></Modal>, document.body)
        }
      </ManifestManager>
    </div>
  </>;
}
