import { Dispatch, FormEvent, SetStateAction, useEffect } from 'react';

import './Modal.css';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { setResponse } from '../lib/gameSlice';
import { SelectedSquare } from './page';



export default function Modal({ selectedSquare, setSelectedSquare }: any) {

  // TODO figure out how to get type inference on these
  const availableItems = useAppSelector(state => state.game.availableItems);
  const dispatch = useAppDispatch();

  const processForm = (e: FormEvent<HTMLFormElement>, { selectedSquare, setSelectedSquare }: { selectedSquare: SelectedSquare, setSelectedSquare: Dispatch<SetStateAction<SelectedSquare>> }) => {
    e.preventDefault();
    const value = (document.getElementById('search')! as HTMLInputElement).value;
  
    // Accept only values in availableItems
    if (!availableItems.includes(value)) {
      return;
    }

    // A square should be selected
    if (selectedSquare === null) {
      return;
    }

    // Update state
    dispatch(setResponse([selectedSquare, value]));

    // Empty search field
    (document.getElementById('search')! as HTMLInputElement).value = '';

    // Deselect square
    setSelectedSquare(null);

  }

  useEffect(() => {
    document.getElementById('search')!.focus();
  }, []);

  return <div className="modal" onKeyUp={e => {e.key === 'Escape' && setSelectedSquare(null)}} onClick={() => setSelectedSquare(null)}>
    <form onSubmit={e => processForm(e, { selectedSquare, setSelectedSquare})}>
      <input id="search" onClick={(e) => {e.stopPropagation()}} style={{display: 'block', margin: '10% auto'}} list="availableItems"></input>
      <datalist id="availableItems">{availableItems.map((item: string) => <option key={item} value={item}></option>)}</datalist>
    </form>
  </div>;

}
