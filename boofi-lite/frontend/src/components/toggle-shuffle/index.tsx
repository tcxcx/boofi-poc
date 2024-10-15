import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";
import styles from "./shuffle.module.css";

interface ShuffleItemProps {
  text: string;
  onClick?: () => void;
}

const ShuffleItem: React.FC<ShuffleItemProps> = ({ text, onClick }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      const splitText = new SplitType(itemRef.current, {
        types: "words,chars",
      });
      const chars = splitText.chars;

      if (chars) {
        itemRef.current.addEventListener("mouseenter", () => {
          addShuffleEffect(chars);
        });
      }
    }
  }, []);

  const addShuffleEffect = (chars: HTMLElement[]) => {
    const originalText = chars.map((char) => char.textContent);
    const shuffleInterval = 10;
    const resetDelay = 75;
    const additionalDelay = 150;

    chars.forEach((char, index) => {
      setTimeout(() => {
        const interval = setInterval(() => {
          char.textContent = String.fromCharCode(
            97 + Math.floor(Math.random() * 26)
          );
        }, shuffleInterval);

        setTimeout(() => {
          clearInterval(interval);
          char.textContent = originalText[index];
        }, resetDelay + index * additionalDelay);
      }, index * shuffleInterval);
    });
  };

  return (
    <div className={styles.shuffleItem} onClick={onClick}>
      <div className={styles.itemLink} ref={itemRef}>
        <div className={styles.bgHover}></div>
        <a href="#">{text}</a>
      </div>
    </div>
  );
};

export default ShuffleItem;
