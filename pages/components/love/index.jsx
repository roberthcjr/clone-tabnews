import style from "./styles.module.css";
import { useState } from "react";

export default function Love() {
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
    alert("Eu também te amo!");
  };

  return (
    <div className={style.main_frame}>
      <div className={style.content}>
        <div className={style.header}>
          <h1>Oi, amor. Você me ama?</h1>
        </div>
        <div className={style.body}>
          <button onClick={result}>Sim</button>
          <button
            onMouseOver={changeNoPosition}
            style={
              topPosition && leftPosition
                ? { top: topPosition + "px", left: leftPosition + "px" }
                : { "margin-right": "-200px" }
            }
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
