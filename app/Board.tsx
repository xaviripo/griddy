import { useAppSelector } from "@/lib/hooks";
import { SelectedSquare } from "./page";

type BoardProps = {
  selectedSquare: SelectedSquare;
  setSelectedSquare: (_: SelectedSquare) => void;
};

export default function Board({ selectedSquare, setSelectedSquare }: BoardProps) {

  const { columnNames, rowNames, playerResponses, guesses } = useAppSelector(state => state.game);

  const bgColor = (i: number, j: number) => selectedSquare && selectedSquare[0] === i && selectedSquare[1] === j ? 'bg-slate-200' : '';

  const thClassNames = 'size-24 md:size-36 lg:size-48 font-extralight p-1 md:p-1.5 lg:p-4';

  return <>
    <table className="m-auto text-xs md:text-lg lg:text-xl">
      <thead>
        <tr>
          <th></th>
          {columnNames.map((columnName, i) => <th className={thClassNames + ' h-auto md:h-auto lg:h-auto align-bottom'} key={i}>{columnName}</th>)}
          <th className={thClassNames + ' h-auto md:h-auto lg:h-auto align-bottom border-none w-0 md:w-36 lg:w-48'}></th>
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2].map(i => <tr key={i}>
          <th className={thClassNames} scope="row">{rowNames[i]}</th>
          {
            [0, 1, 2].map(j => <td key={j} className={bgColor(i, j) + ' size-24 md:size-36 lg:size-48 text-center border p-0'}>{
              playerResponses[i][j] || <div className={`h-full m-0 ${guesses > 0 ? 'cursor-pointer hover:bg-slate-200' : 'cursor-default'}`} onClick={() => {guesses > 0 && setSelectedSquare([i, j] as SelectedSquare)}}></div>
            }</td>)
          }
        </tr>)}
      </tbody>
    </table>
  </>;
}
