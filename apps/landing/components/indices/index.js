import React from "react";
import s from "./indices.module.scss";

const indicesData = [
  {
    id: "index-1",
    date: "May 15th",
    description: "Beta Launch",
  },
  {
    id: "index-2",
    date: "July 1st",
    description: "Public Release",
  },
  {
    id: "index-3",
    date: "August 20th",
    description: "API Integration",
  },
  {
    id: "index-4",
    date: "October 5th",
    description: "Pro Features",
  },
];

const Indices = React.forwardRef(({ setIndicesRef }, ref) => (
  <div className={s.indices} ref={ref}>
    {indicesData.map((index, i) => (
      <div
        key={index.id}
        className={s.index}
        id={index.id}
        ref={(el) => setIndicesRef(el, i)}
      >
        <p>{index.date}</p>
        <p>{index.description}</p>
      </div>
    ))}
  </div>
));

export default Indices;
