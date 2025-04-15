import './styles.css'
import {useState} from 'react';
 
export default function MyApp() {
  const [topPosition, setTopPosition] = useState(0);
  const [leftPosition, setLeftPosition] = useState(0);

  const changeNoPosition = () => {
    const maxWidth = window.innerWidth - 100; 
    const maxHeight = window.innerHeight - 50;

    const newTop = Math.floor(Math.random() * maxHeight);
    const newLeft = Math.floor(Math.random() * maxWidth);

    setTopPosition(newTop);
    setLeftPosition(newLeft);
  };

  const result = () => {
    alert("Assim que eu gosto");
  }

  return <div className="main_frame">
    <div className='content'>
      <div className="header"><h1>Oi, amor. Você me ama?</h1></div> 
      <div className="body">
        <button onClick = {result}>
          Sim
        </button>
        <button onMouseOver={changeNoPosition} style={(topPosition && leftPosition) ? {top: topPosition+'px', left: leftPosition+'px'} : {'margin-right': '-200px'}}>
          Não
        </button>
      </div>
    </div>
</div>
}