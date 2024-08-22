import { useAppSelector } from "@/lib/hooks";
import { SelectedSquare } from "./page";
import { useState } from "react";

type BoardProps = {
  selectedSquare: SelectedSquare;
  setSelectedSquare: (_: SelectedSquare) => void;
  starTitles: string[];
  starChecks: boolean[];
};

export default function Board({ selectedSquare, setSelectedSquare, starTitles, starChecks }: BoardProps) {

  const { columnNames, rowNames, playerResponses, guesses } = useAppSelector(state => state.game);

  const [hover0, setHover0] = useState<boolean>(false);
  const [hover1, setHover1] = useState<boolean>(false);
  const [hover2, setHover2] = useState<boolean>(false);

  const bgColor = (i: number, j: number) => {
    // A square is selected and the writing modal is open
    if (selectedSquare && selectedSquare[0] === i && selectedSquare[1] === j) {
      return 'bg-slate-200';
    }
    // User is hovering star 0 title
    if (hover0 && i === j) {
      return 'bg-slate-200';
    }
    if (hover1 && i + j == 2) {
      return 'bg-slate-200';
    }
    if (hover2 && (i + j) % 2 != 0) {
      return 'bg-slate-200';
    }
    return '';
  };

  const thClassNames = 'size-24 md:size-36 lg:size-48 font-extralight p-1 md:p-1.5 lg:p-4';

  return <>
    <table className="m-auto text-xs md:text-lg lg:text-xl">
      <thead>
        <tr>
          <th className={thClassNames + ' h-auto md:h-auto lg:h-auto'} onMouseEnter={() => setHover0(true)} onMouseLeave={() => setHover0(false)}>{starChecks[0] ? '★' : '☆'} {starTitles[0]}</th>
          {columnNames.map((columnName, i) => <th className={thClassNames + ' h-auto md:h-auto lg:h-auto'} key={i}>{columnName}</th>)}
          <th className={thClassNames + ' h-auto md:h-auto lg:h-auto border-none w-0 md:w-36 lg:w-48'}></th>
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2].map(i => <tr key={i}>
          <th className={thClassNames} scope="row">{rowNames[i]}</th>
          {
            [0, 1, 2].map(j => <td id={'square' + i + j} key={j} className={bgColor(i, j) + ' size-24 md:size-36 lg:size-48 text-center border p-0'}>{
              playerResponses[i][j] || <div className={`h-full m-0 ${guesses > 0 ? 'cursor-pointer hover:bg-slate-200' : 'cursor-default'}`} onClick={() => {guesses > 0 && setSelectedSquare([i, j] as SelectedSquare)}}></div>
            }</td>)
          }
        </tr>)}
        <tr>
          <th className={thClassNames} scope="row" onMouseEnter={() => setHover1(true)} onMouseLeave={() => setHover1(false)}>{starChecks[1] ? '★' : '☆'} {starTitles[1]}</th>
          <td className={'size-24 md:size-36 lg:size-48 text-center p-0'}></td>
          <td className={'size-24 md:size-36 lg:size-48 font-extralight text-center p-1 md:p-1.5 lg:p-4'} onMouseEnter={() => setHover2(true)} onMouseLeave={() => setHover2(false)}>{starChecks[2] ? '★' : '☆'} {starTitles[2]}</td>
          <td className={'size-24 md:size-36 lg:size-48 text-center p-0'}></td>
        </tr>
      </tbody>
    </table>
  </>;
}
