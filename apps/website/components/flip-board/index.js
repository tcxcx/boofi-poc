'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { HeroTextIn } from 'pages/home';
import cn from 'clsx'
import s from './flip.module.scss'
import { GitCompareArrows } from 'lucide-react';
import Header from './header';

const ROWS = 6;
const COLS = 6;
const BLOCK_SIZE = 50;
const COOLDOWN = 1000;
let isFlipped = false;

export const FlipBoard = () => {
  const boardRef = useRef(null);
  const blocksContainerRef = useRef(null);

  useEffect(() => {
    createBoard();
    initializeTileAnimations();
    const blockInfo = createBlocks();
    document.addEventListener('mousemove', (event) => highlightBlock(event, blockInfo));

    return () => {
      document.removeEventListener('mousemove', highlightBlock);
    };
  }, []);

  function createTile(row, col) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <div class="tile-face tile-front"></div>
      <div class="tile-face tile-back"></div>
    `;

    const bgPosition = `${col * 20}% ${row * 20}%`;
    tile.querySelector(".tile-front").style.backgroundPosition = bgPosition;
    tile.querySelector(".tile-back").style.backgroundPosition = bgPosition;

    return tile;
  }

  function createBoard() {
    if (boardRef.current) {
      const board = boardRef.current;
      board.innerHTML = '';
      for (let i = 0; i < ROWS; i++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < COLS; j++) {
          row.appendChild(createTile(i, j));
        }
        board.appendChild(row);
      }
    }
  }

  function initializeTileAnimations() {
    const tiles = boardRef.current.querySelectorAll(".tile");
    tiles.forEach((tile, index) => {
      let lastEnterTime = 0;
      tile.addEventListener("mouseenter", () => {
        const currentTime = Date.now();
        if (currentTime - lastEnterTime > COOLDOWN) {
          lastEnterTime = currentTime;
          const tiltY = getTiltY(index);
          animateTile(tile, tiltY);
        }
      });
    });
  }

  function getTiltY(index) {
    if (index % 6 === 0) return -40;
    if (index % 6 === 5) return 40;
    if (index % 6 === 1) return -20;
    if (index % 6 === 4) return 20;
    if (index % 6 === 2) return -10;
    return 10;
  }

  function animateTile(tile, tiltY) {
    gsap
      .timeline()
      .set(tile, { rotateX: isFlipped ? 180 : 0, rotateY: 0 })
      .to(tile, {
        rotateX: isFlipped ? 450 : 270,
        rotateY: tiltY,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(
        tile,
        {
          rotateX: isFlipped ? 540 : 360,
          rotateY: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.25"
      );
  }

  function flipAllTiles() {
    isFlipped = !isFlipped;
    const tiles = boardRef.current.querySelectorAll(".tile");
    gsap.to(tiles, {
      rotateX: isFlipped ? 180 : 0,
      duration: 1,
      stagger: {
        amount: 0.5,
        from: "random",
      },
      ease: "power2.inOut",
    });
  }

  function createBlocks() {
    const blockContainer = blocksContainerRef.current;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const numCols = Math.ceil(screenWidth / BLOCK_SIZE);
    const numRows = Math.ceil(screenHeight / BLOCK_SIZE);
    const numBlocks = numCols * numRows;

    blockContainer.innerHTML = '';
    for (let i = 0; i < numBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("block");
      block.dataset.index = i;
      blockContainer.appendChild(block);
    }

    return { numCols, numBlocks };
  }

  function highlightBlock(event, blockInfo) {
    const { numCols } = blockInfo;
    const blockContainer = blocksContainerRef.current;
    
    if (!blockContainer) return; // Add this check
    
    const rect = blockContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / BLOCK_SIZE);
    const row = Math.floor(y / BLOCK_SIZE);
    const index = row * numCols + col;
  
    const block = blockContainer.children[index];
    if (block) {
      block.classList.add("highlight");
      setTimeout(() => {
        block.classList.remove("highlight");
      }, 250);
    }
  }
  

  return (
    <>
      <body>
        <nav className="nav">
          <button onClick={flipAllTiles} className="navButton font-slussen">
            <h2 className={cn('h3', s.subtitle)}> <GitCompareArrows /></h2>
          </button>
        </nav>

        <section className="board" ref={boardRef}></section>

        <div className="blocks-container">
          <div id="blocks" ref={blocksContainerRef}></div>
        </div>
      </body>
    </>
  );
};

export default FlipBoard;
