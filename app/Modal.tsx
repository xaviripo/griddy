import { ChangeEventHandler, Dispatch, FormEvent, FormEventHandler, KeyboardEventHandler, MouseEventHandler, SetStateAction, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { setResponse } from '../lib/gameSlice';
import { SelectedSquare } from './page';
import Button from './Button';
import TextInput from './TextInput';

export default function Modal({ selectedSquare, setSelectedSquare }: { selectedSquare: SelectedSquare, setSelectedSquare: Dispatch<SetStateAction<SelectedSquare>> }) {

  // TODO figure out how to get type inference on these
  const availableItems = useAppSelector(state => state.game.availableItems);
  const dispatch = useAppDispatch();

  const [input, setInput] = useState(''); // Declare a state variable...

  useEffect(() => {
    document.getElementById('search')!.focus();
  }, []);

  // Process the form
  const formSubmitHandler = (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    // Accept only values in availableItems
    if (!availableItems.includes(input)) {
      return;
    }

    // A square should be selected
    if (selectedSquare === null) {
      return;
    }

    // Update state
    dispatch(setResponse([selectedSquare, input]));

    // Empty search field
    setInput('');

    // Deselect square
    setSelectedSquare(null);

  }

  // Close the modal if user hits Escape
  const modalKeyUpHandler: KeyboardEventHandler<HTMLDivElement> = e => {
    if (e.key === 'Escape') {
      setSelectedSquare(null);
    }
  };

  // Close the modal if user clicks anywhere other than an input
  const modalClickHandler: MouseEventHandler<HTMLDivElement> = e => {
    setSelectedSquare(null);
  };

  return <div className="m-0 fixed top-0 left-0 h-full w-full bg-slate-700/75" onKeyUp={modalKeyUpHandler} onClick={modalClickHandler}>
    <form className="h-full flex justify-center items-center" onSubmit={formSubmitHandler}>
      <TextInput id="search" value={input} onClick={e => {e.stopPropagation()}} onChange={e => {setInput(e.target.value)}} list={input.length >= 3 ? 'availableItems' : ''}/>
      <Button type="submit" onClick={e => {e.stopPropagation()}}>Try</Button>
      <datalist id="availableItems">{availableItems.map((item: string) => <option key={item} value={item}></option>)}</datalist>
    </form>
  </div>;

}
