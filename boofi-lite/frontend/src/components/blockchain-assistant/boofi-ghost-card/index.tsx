import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools";
import { useAssistantStore } from "@/store/assistantStore";
import { useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function BooFiGhostCard() {
  const { isRecording, setIsRecording, addMessage, audioLevel, setAudioLevel } = useAssistantStore();
  const recorderRef = useRef<WavRecorder | null>(null);
  const streamPlayerRef = useRef<WavStreamPlayer | null>(null);
  const animationRef = useRef<number | null>(null);

  const toggleRecording = () => setIsRecording(!isRecording);

  const startRecording = async () => {
    if (!recorderRef.current) return;
    try {
      await recorderRef.current.begin();
      await recorderRef.current.record();
      await streamPlayerRef.current?.connect();
      animateAudio();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !recorderRef.current.recording) return;
    try {
      await recorderRef.current.pause();
      await streamPlayerRef.current?.interrupt();
      setAudioLevel(0);
      addMessage({ id: nanoid(), role: "user", content: "Simulated voice message from user." });
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const animateAudio = () => {
    if (!recorderRef.current) return;
    const frequencies = recorderRef.current.getFrequencies("voice");
    const level = frequencies.values.reduce((sum, val) => sum + val, 0) / frequencies.values.length;
    setAudioLevel(level);
    animationRef.current = requestAnimationFrame(animateAudio);
  };

  useEffect(() => {
    isRecording ? startRecording() : stopRecording();
  }, [isRecording]);

  return (
    <div className="flex flex-col items-center">
      <Image src="/images/ai-boofi.png" alt="Boofi Ghost" width={100} height={100} className="mb-4" />
      <Separator className="w-full my-2" />
      <div className="relative flex flex-col items-center mb-2">
        <Mic className="h-6 w-6 relative" />
        <Button variant="charly" onClick={toggleRecording} className="w-full mt-4">
          {isRecording ? "Stop Speaking" : "Press to Speak"}
        </Button>
      </div>
    </div>
  );
}
