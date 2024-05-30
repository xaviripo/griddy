import { useAppSelector } from "@/lib/hooks";
import { SelectedSquare } from "./page";

type BoardProps = {
  selectedSquare: SelectedSquare;
  setSelectedSquare: (_: SelectedSquare) => void;
};

export default function Board({ selectedSquare, setSelectedSquare }: BoardProps) {

  const { columnNames, rowNames, playerResponses, guesses } = useAppSelector(state => state.game);

  return <>
    <table>
      <thead>
        <tr>
          <th></th>
          {columnNames.map((columnName, i) => <th key={i}>{columnName}</th>)}
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2].map(i => <tr key={i}>
          <th scope="row">{rowNames[i]}</th>
          {
            [0, 1, 2].map(j => <td key={j} className={selectedSquare && selectedSquare[0] === i && selectedSquare[1] === j ? 'bg-orange-400' : ''}>{
              playerResponses[i][j] || <div className={`h-full m-0 ${guesses > 0 ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => {guesses > 0 && setSelectedSquare([i, j] as SelectedSquare)}}></div>
            }</td>)
          }
        </tr>)}
      </tbody>
    </table>
  </>;
}
