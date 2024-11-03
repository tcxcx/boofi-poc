
import { useEffect, useRef, useCallback, useState } from 'react'
import { RealtimeClient } from '@openai/realtime-api-beta'

/**
 * Running a local relay server will allow you to hide your API key
 * and run custom logic on the server
 *
 * Set the local relay server address to:
 * NEXT_PUBLIC_APP_LOCAL_RELAY_SERVER_URL=http://localhost:8080
 *
 * This will also require you to set OPENAI_API_KEY= in a `.env` file
 * You can run it with `npm run relay`, in parallel with `npm start`
 */
export const LOCAL_RELAY_SERVER_URL: string =
  process.env.NEXT_PUBLIC_APP_LOCAL_RELAY_SERVER_URL || '';


export default function useRealtimeClient() {
  const [client, setClient] = useState<RealtimeClient | null>(null);

  useEffect(() => {
    /**
     * Ask user for API Key
     * If we're using the local relay server, we don't need this
     */
    const storedApiKey = LOCAL_RELAY_SERVER_URL
      ? ''
      : localStorage.getItem('tmp::voice_api_key') || '';
    
    if (storedApiKey !== '') {
      localStorage.setItem('tmp::voice_api_key', storedApiKey);
    }

    if (storedApiKey || LOCAL_RELAY_SERVER_URL) {
      const newClient = new RealtimeClient(
        LOCAL_RELAY_SERVER_URL
          ? { url: LOCAL_RELAY_SERVER_URL }
          : {
              apiKey: storedApiKey,
              dangerouslyAllowAPIKeyInBrowser: true,
            }
      );
      setClient(newClient);
    }

    return () => {
      if (client) {
        client.reset();
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