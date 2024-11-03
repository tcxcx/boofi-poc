// frontend/src/components/blockchain-assistant/boofi-ghost-card/BooFiGhostCard.tsx

import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '@/lib/wavtools';
import { instructions } from '@/utils/conversation-config';
import { WavRenderer } from '@/utils/wav-render';
import { Button } from '@/components/ui/button';
import { useAssistantStore, Message, AssistantState } from '@/store/assistantStore';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import useRealtimeClient from '@/hooks/realtime-open-ai/use-realtime-client';
import { useRealtimeHandlers } from '@/hooks/realtime-open-ai/use-realtime-handlers';
import useAudioStreaming from '@/hooks/realtime-open-ai/use-audio-streaming';
import { SkeletonGradient } from '@/components/ui/skeleton-gradient';
import { BooFiConsole } from './console';
import '@/components/blockchain-assistant/boofi-ghost-card/styles.scss';


export default function BooFiGhostCard() {
  const { isRecording, setIsRecording, setAudioLevel } = useAssistantStore();
  const { wavRecorder, wavStreamPlayer } = useAudioStreaming();
  const {
    getClient,
    isReady,
  } = useRealtimeClient();

  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // **Initialize Realtime Handlers Only When the Client is Ready**
  const client = isReady ? getClient() : null;
  useRealtimeHandlers(client, wavStreamPlayer);

  const toggleRecording = async () => {
    if (!isReady) return;
    setIsRecording(!isRecording);
  };

  const startRecording = async () => {
    if (!wavRecorder || !isReady) return;
    try {
      await wavRecorder.begin();
      await wavRecorder.record((data) => getClient().appendInputAudio(data.mono));
      animateAudio();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!wavRecorder || !wavRecorder.recording) return;
    try {
      await wavRecorder.pause();
      getClient().createResponse();
      setAudioLevel(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const animateAudio = () => {
    if (!wavRecorder || !canvasRef.current) return;

    const frequencies = wavRecorder.getFrequencies('voice');
    const level =
      frequencies.values.reduce((sum, val) => sum + val, 0) /
      frequencies.values.length;
    setAudioLevel(level);

    // Draw visualization
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      WavRenderer.drawBars(canvas, ctx, frequencies.values, '#0099ff', 50, 2, 1);
    }

    requestAnimationFrame(animateAudio);
  };

  // Update transcriptions from assistant store
  useEffect(() => {
    const unsubscribe = useAssistantStore.subscribe(
      (state: AssistantState) => {
        const messages = state.messages;
        const assistantMessages = messages.filter(
          (msg: Message) => msg.role === 'assistant'
        );
        const lastMessages = assistantMessages
          .slice(-3)
          .map((msg: Message) => msg.content);
        setTranscriptions(lastMessages);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Recording State Changes
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  if (!isReady) {
    return <SkeletonGradient />;
  }

  return (
    <div className="flex flex-col items-center h-full">
      {/* <Image
        src="/images/ai-boofi.png"
        alt="Boofi Ghost"
        width={100}
        height={100}
        className="mb-4"
      /> */}
      {/* Display last three transcriptions */}
      {/* <div className="transcriptions mb-4 text-center">
        {transcriptions.map((text, index) => (
          <p key={index} className="text-sm text-white">
            {text}
          </p>
        ))}
      </div>
      <Separator className="w-full my-2" />

      <div className="relative flex flex-col items-center mb-2">
        <canvas ref={canvasRef} width={200} height={50} className="mb-4" />
        <Button
          variant="charly"
          onClick={toggleRecording}
          className="w-full mt-4 inline-flex items-center justify-center"
        >
          {isRecording ? 'Stop Speaking' : 'Press to Speak'}
        </Button>
      </div> */}

      <BooFiConsole />
    </div>
  );
}
