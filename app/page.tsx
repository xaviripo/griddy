'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useSearchParams } from 'next/navigation';
import * as prand from 'pure-rand';

import Result from './Result';
import Modal from './Modal';
 

/*

TODO:

- Switch to Redux
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


type Cell = {catColName: string, catRowName: string, candidates: string[]};


function generateTable(categories: Category[]): Table {

  const rng = prand.xoroshiro128plus(1234);

  // Select 6 categories at random
  loop: while (true) {
    shuffleArray(categories, rng);
    const catsRow = categories.slice(0, 3);
    const catsCol = categories.slice(3, 6);

    // Can't call it a Table yet because it's empty!
    const table: Cell[][] = [];

    // Iterate through all rows and cols and check that each intersection has the minimum amount of candidates
    for (const catRow of catsRow) {
      const row: Cell[] = [];
      for (const catCol of catsCol) {
        const candidates = catRow.members.filter(item => catCol.members.includes(item));
        if (candidates.length < 3) continue loop;
        row.push({catColName: catCol.name, catRowName: catRow.name, candidates});
      }
      table.push(row);
    }

    return table as Table;
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

type Row = [Cell, Cell, Cell];

type Table = [Row, Row, Row];

type SelectedSquare = [0 | 1 | 2, 0 | 1 | 2] | null;

type Attempts = [
  [string | null, string | null, string | null],
  [string | null, string | null, string | null],
  [string | null, string | null, string | null]
];

enum ManifestStatus {
  Loading, // No manifest processed yet
  Valid, // A manifest has successfully been provided
  Invalid, // A manifest has been provided, but it failed upon loading or it has an invalid format
  Empty, // User has not filled the manifest parameter
};

export default function Page() {

  const searchParams = useSearchParams();
  const manifestURL = searchParams.get('manifest');

  const [manifestStatus, setManifestStatus] = useState<ManifestStatus>(ManifestStatus.Loading);
  const [table, setTable] = useState<Table | null>();
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [attempts, setAttempts] = useState<Attempts>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [lives, setLives] = useState<number>(10);

  useEffect(() => {

    // No manifest provided
    if (manifestURL === null) {
      setManifestStatus(ManifestStatus.Empty);
      return;
    }

    fetch(manifestURL, { method: 'GET' })
      .then(response => response.json())
      .then((data: Manifest) => {
        setAvailableItems(data.items);

        const table = generateTable(data.categories);

        // For debugging:
        // for (const row of table) {
        //   for (const {catColName, catRowName, candidates} of row) {
        //     console.log(catColName, catRowName, candidates);
        //   }
        // }
        // console.log('---');

        setTable(table);
        setManifestStatus(ManifestStatus.Valid);

      })
      .catch(error => {
        setManifestStatus(ManifestStatus.Invalid);
      });
  }, []);

  if (manifestStatus === ManifestStatus.Empty) {
    return "No manifest provided!";
  } else if (manifestStatus === ManifestStatus.Invalid) {
    return "Invalid manifest provided!";
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
            {table && table[0].map(({catColName}, i) => <th key={i}>{catColName}</th>)}
          </tr>
        </thead>
        <tbody>
          {table && table.map((row, i) => <tr key={i}>
            <th scope="row">{row.length > 0 ? row[0].catRowName : ''}</th>
            {
              row.map((_, j) => <td key={j} style={selectedSquare ? (selectedSquare[0] === i && selectedSquare[1] === j ? {backgroundColor: 'Orange'} : {}) : {}}>{
                attempts[i][j] || <div style={{height: '100%', margin: 0, cursor: lives > 0 ? 'pointer' : 'default'}} onClick={() => {lives > 0 && setSelectedSquare([i, j] as SelectedSquare)}}></div>
              }</td>)
            }
          </tr>)}
        </tbody>
      </table>
      { table &&
        (finished({lives, attempts})
        ? Result(<>
            {attempts.map((row, i) => <span key={i}>
              {row.map(attempt => attempt === null ? '❌' : '✅').join('')}
              <br></br>
            </span>)}
            {guessesLeft(lives)}
          </>)
        : <div style={{marginLeft: 'auto', marginTop: '20px', textAlign: 'center', fontSize: 20}}>{guessesLeft(lives)}</div>)
      }
      {selectedSquare &&
        createPortal(<Modal setLives={setLives} lives={lives} table={table} selectedSquare={selectedSquare} availableItems={availableItems} attempts={attempts} setAttempts={setAttempts} setAvailableItems={setAvailableItems} setSelectedSquare={setSelectedSquare}></Modal>, document.body)
      }
    </>
  );
}

function guessesLeft(lives: number): string {
  return `${lives} ${lives === 1 ? 'guess' : 'guesses'} left`;
}

function finished({lives, attempts}: {lives: number, attempts: Attempts}) {
  if (lives === 0) return true;
  const isFilled = (elem: any) => elem !== null;
  return attempts.map(row => row.every(isFilled)).every(elem => elem);
}


