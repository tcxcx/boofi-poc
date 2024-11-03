import { useEffect } from 'react';
import { useAssistantStore } from '@/store/assistantStore';

export function useRealtimeHandlers(client: any, wavStreamPlayer: any) {
  useEffect(() => {
    if (!client) return;

    const addMessage = useAssistantStore.getState().addMessage;

    client.on('conversation.updated', ({ item, delta }: { item: any, delta: any }) => {
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }

      if (item.status === 'completed') {
        addMessage({
          id: item.id,
          role: item.role,
          content: item.formatted.transcript || item.formatted.text || '',
        });
      }
    });

    client.on('error', (error: any) => {
      console.error('RealtimeClient Error:', error);
    });

    return () => {
      client.off('conversation.updated');
      client.off('error');
    };
  }, [client, wavStreamPlayer]);
}
