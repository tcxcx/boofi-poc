"use client";
import React from "react";
import s from './vertical-card.module.scss'

const Card = React.forwardRef(({ id, phase, date, title, span }, ref) => (
  <div className={s.card} id={`card-${id}`} ref={ref}>
    <div className={s.cardPhase}>
      <p>Phase #{phase}</p>
    </div>
    <div className={s.cardTitle}>
      <p>From {date}</p>
      <h1>
        {title} <span>{span}</span>
      </h1>
    </div>
  </div>
));

export default Card;
