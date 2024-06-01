import { MouseEventHandler, ReactNode } from 'react';

import Button from './Button';

type ResultProps = {
  children: ReactNode;
};

export default function Result({ children }: ResultProps) {

  const clickHandler: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    navigator.clipboard.writeText(document.getElementById('copyText')?.innerText ?? '');
  };

  return <div className="relative m-0 w-full">
    <div className="ml-auto">
      <div id="copyText">{children}</div>
      <Button onClick={clickHandler}>Copy result</Button>
      {/* <button className="m-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded hover:cursor-pointer" onClick={clickHandler}>Copy result</button> */}
    </div>
  </div>;
}
