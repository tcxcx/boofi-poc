// use-realtime-client.tsx

import { useEffect, useState, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

const LOCAL_RELAY_SERVER_URL: string =
  process.env.NEXT_PUBLIC_APP_LOCAL_RELAY_SERVER_URL || '';

export function useRealtimeClient() {
  const [client, setClient] = useState<RealtimeClient | null>(null);

  useEffect(() => {
    const storedApiKey = LOCAL_RELAY_SERVER_URL
      ? ''
      : localStorage.getItem('tmp::voice_api_key') || '';

    if (!LOCAL_RELAY_SERVER_URL && !storedApiKey) {
      const apiKey = prompt('Please enter your OpenAI API Key');
      if (apiKey) {
        localStorage.setItem('tmp::voice_api_key', apiKey);
      }
    }

    const apiKey = LOCAL_RELAY_SERVER_URL
      ? ''
      : localStorage.getItem('tmp::voice_api_key') || '';

    if (apiKey || LOCAL_RELAY_SERVER_URL) {
      const newClient = new RealtimeClient(
        LOCAL_RELAY_SERVER_URL
          ? { url: LOCAL_RELAY_SERVER_URL }
          : {
              apiKey,
              dangerouslyAllowAPIKeyInBrowser: true,
            }
      );
      setClient(newClient);
    }

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  const getClient = useCallback(() => {
    if (!client) {
      throw new Error('RealtimeClient not initialized');
    }
    return client;
  }, [client]);

  return { getClient, isReady: !!client };
}
