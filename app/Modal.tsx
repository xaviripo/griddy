import { FormEvent, useEffect } from 'react';

import './Modal.css';

export default function Modal({setLives, lives, table, availableItems, attempts, selectedSquare, setSelectedSquare, setAttempts, setAvailableItems}: any) {

  useEffect(() => {
    document.getElementById('search')!.focus();
  }, []);

  return <div className="modal" onKeyUp={e => {e.key === 'Escape' && setSelectedSquare(null)}} onClick={() => setSelectedSquare(null)}>
    <form onSubmit={e => processForm(e, {setLives, lives, table, availableItems, selectedSquare, attempts, setAttempts, setAvailableItems, setSelectedSquare})}>
      <input id="search" onClick={(e) => {e.stopPropagation()}} style={{display: 'block', margin: '10% auto'}} list="availableItems"></input>
      <datalist id="availableItems">{availableItems.map((item: string) => <option key={item} value={item}></option>)}</datalist>
    </form>
  </div>;

}

function processForm(e: FormEvent<HTMLFormElement>, {setLives, lives, table, attempts, availableItems, setAvailableItems, setAttempts, selectedSquare, setSelectedSquare}: any) {
  e.preventDefault();
  const value = (document.getElementById('search')! as HTMLInputElement).value;

  // Accept only values in availableItems
  if (!availableItems.includes(value)) {
    return;
  }

  (document.getElementById('search')! as HTMLInputElement).value = '';
  setAvailableItems(availableItems.filter((item: string) => item !== value));

  const [i, j] = selectedSquare;

  if (table[i][j].candidates.includes(value)) {
    const newAttempts = structuredClone(attempts);
    newAttempts[i][j] = value;
    setAttempts(newAttempts);
  }

  setLives(lives - 1);
  setSelectedSquare(null);

}
