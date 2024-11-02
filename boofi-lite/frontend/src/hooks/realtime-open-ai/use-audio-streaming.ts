import { useRef } from 'react';
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools";

export default function useAudioStreaming() {
  const wavRecorderRef = useRef(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef(new WavStreamPlayer({ sampleRate: 24000 }));

  return {
    wavRecorder: wavRecorderRef.current,
    wavStreamPlayer: wavStreamPlayerRef.current,
  };
}
