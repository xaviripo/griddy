import './Result.css';

export default function Result(copyText: React.JSX.Element) {
  return <div className="parent"><div className="result">
    <div id="copyText">{copyText}</div>
    <button onClick={e => {
      e.preventDefault();
      navigator.clipboard.writeText(document.getElementById('copyText')!.innerText);
    }}>Copy result</button>
  </div></div>;
}
