import { ReactNode } from 'react';

import './Result.css';

type ResultProps = {
  children: ReactNode;
};

export default function Result({ children }: ResultProps) {
  return <div className="parent"><div className="result">
    <div id="copyText">{children}</div>
    <button onClick={e => {
      e.preventDefault();
      navigator.clipboard.writeText(document.getElementById('copyText')!.innerText);
    }}>Copy result</button>
  </div></div>;
}
