import React from "react";
import s from "./progress.module.scss";

const ProgressBar = React.forwardRef(({ progressRef }, ref) => (
  <div className={s.progressBar} ref={ref}>
    <div className={s.progress} ref={progressRef}></div>
  </div>
));

export default ProgressBar;
