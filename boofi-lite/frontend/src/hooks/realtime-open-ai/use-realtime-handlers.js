import { useEffect } from 'react';
import { useAssistantStore } from '@/store/assistantStore';

export function useRealtimeHandlers(client, wavStreamPlayer) {
  const addMessage = useAssistantStore((state) => state.addMessage);

  useEffect(() => {
    if (!client) return;

    client.on('conversation.updated', ({ item, delta }) => {
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

    client.on('error', (error) => {
      console.error('RealtimeClient Error:', error);
    });

    return () => {
      client.off('conversation.updated');
      client.off('error');
    };
  }, [client, wavStreamPlayer, addMessage]);
}
