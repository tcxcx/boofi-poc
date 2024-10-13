"use client";

import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

const songs = [
  {
    name: " Cyberfunk - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-cyberfunk.mp3",
  },
  {
    name: " Light Rain - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-light-rain.mp3",
  },
  {
    name: " Lucid Dreaming - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-lucid-dreaming.mp3",
  },
  {
    name: " Lunar Leisure - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-lunar-leisure.mp3",
  },
  {
    name: " Midnight Room - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-midnight-room-5.mp3",
  },
  {
    name: " Reminiscence - FSM TEAM & < e s c p > 👻",
    src: "/audio/lofi-reminiscence.mp3",
  },
  { name: "Lofi Song 7 - FSM TEAM & < e s c p >", src: "/audio/lofi-song.mp3" },
];
const Music: React.FC<{}> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  const playPreviousSong = () => {
    setCurrentSongIndex((prevIndex) =>
      prevIndex === 0 ? songs.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <>
      <Footer
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        playNextSong={playNextSong}
        playPreviousSong={playPreviousSong}
        currentSong={songs[currentSongIndex].name}
      />
      <audio ref={audioRef} src={songs[currentSongIndex].src} loop />
    </>
  );
};

export default Music;
