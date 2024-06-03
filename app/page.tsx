'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import * as prand from 'pure-rand';
import { IDBPDatabase, openDB } from 'idb';
import stringify from 'fast-json-stable-stringify';

import Result from './Result';
import Modal from './Modal';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setAvailableItems, setCandidateLists, setColumnNames, setRowNames, CandidateLists, setState } from '@/lib/gameSlice';
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

  const { status, content, hash, url } = useAppSelector(state => state.manifest);
  const game = useAppSelector(state => state.game);

  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [utcDate, setUtcDate] = useState<string | null>(null);
  const [manifestId, setManifestId] = useState<number | null>(null);

  const dbPromise = useRef<Promise<IDBPDatabase<unknown>> | null>(null);
  // Initialize the ref INSIDE the if block so that openDB doesn't run every time the component is re-rendered
  if (dbPromise.current === null) {
    dbPromise.current = openDB('game', 1, {
      upgrade: (db, oldVersion) => {
        switch (oldVersion) {
          case 0: // New database
            const manifestsObjectStore = db.createObjectStore('manifests', { keyPath: 'id', autoIncrement: true });
            manifestsObjectStore.createIndex('url', 'url', { unique: false });
            manifestsObjectStore.createIndex('created', 'created', { unique: false });
            manifestsObjectStore.createIndex('hash', 'hash', { unique: false });
  
            const boardsObjectStore = db.createObjectStore('boards', { keyPath: 'date' });
            boardsObjectStore.createIndex('manifestURL', 'manifestURL', { unique: false });
            boardsObjectStore.createIndex('manifestId', 'manifestId', { unique: false });
            boardsObjectStore.createIndex('state', 'state', { unique: false });
  
            break;
        }
      },
    });
  }

  useEffect(() => {

    // Only run the whole thing if ALL of the manifest data is set
    if (content === null || hash === null || url === null) {
      return;
    }

    (async () => {

      const db = await dbPromise.current!;

      // The seed is the UNIX timestamp of 00:00 UTC time for the current UTC day
      const utcDate: string = new Date()
        .toLocaleDateString('en-GB', {timeZone: 'UTC'}) // "31/12/2024"
        .split('/') // ["31", "12", "2024"]
        .toReversed() // ["2024", "12", "31"]
        .join('-'); // "2024-12-31"

      // Save the date of the puzzle
      setUtcDate(utcDate);

      // First check if a puzzle is started (via utcDate in boards objectStorage) and THEN if it isn't, check the manifest stuff
      const currentBoard = await db.get('boards', utcDate);

      // Today's board had already been started?
      if (currentBoard !== undefined) {
        dispatch(setState(currentBoard.state));
        setManifestId(currentBoard.manifestId);
        return;
      }

      // Will contain ALL the previous manifests with the URL that the user requested
      const previousManifestCandidates = [];
      const tx = db.transaction('manifests', 'readonly');
      for await (const cursor of tx.store.index('url').iterate(url)) {
        previousManifestCandidates.push(cursor.value);
      }

      // Sort all those manifests by date, from bigger (closer to the present) to smaller (in the past)
      previousManifestCandidates.sort((a, b) => b.date - a.date);

      const newestManifest = previousManifestCandidates[0];
      if (newestManifest !== undefined && newestManifest.hash === hash && stringify(newestManifest.content) === stringify(content)) {
        // We have a match!
        setManifestId(newestManifest.id);
      } else {
        // Gotta create a new entry for this manifest
        const newManifestId = await db.add('manifests', {
          url, hash, content, created: new Date()
        });
        setManifestId(newManifestId as number);
      }

      // Now, create a new entry for today's board and assign it the manifest id
      dispatch(setAvailableItems(content.items));

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

    })();

  }, [dispatch, content, hash, url]);

  // Persistence hook: this hook listens to any changes to the (persistable) state, and saves it to the DB
  useEffect(() => {

    if (utcDate === null || manifestId === null || manifestURL === null) {
      return;
    }

    (async () => {
      const db = await dbPromise.current!;
      await db.put('boards', { manifestId, manifestURL, date: utcDate, state: game });
    })();

  }, [game, utcDate, manifestId, manifestURL]);

  return <>
    <div className="text-slate-200">
      <h1 className="pt-10 pb-0 text-center text-3xl">{content?.name}</h1>
      <h2 className="pt-0 pb-5 text-center text-xl">{utcDate}</h2>
      <ManifestManager manifestStatus={status} manifestURL={manifestURL}>
        <Board selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare} />
        <div className="m-10 text-center text-xl font-extralight">
          {
            game.over
            ? <Result>
                {content?.name}<br/>
                {utcDate}<br/>
                {[0, 1, 2].map(i => <span key={i}>
                  {[0, 1, 2].map(j => game.playerResponses[i][j] === null ? '❌' : '✅').join('')}
                  <br/>
                </span>)}
                {guessesLeft(game.guesses)}
              </Result>
            : <div>{guessesLeft(game.guesses)}</div>
          }
        </div>
        {selectedSquare &&
          createPortal(<Modal selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare}></Modal>, document.body)
        }
      </ManifestManager>
    </div>
  </>;
}
