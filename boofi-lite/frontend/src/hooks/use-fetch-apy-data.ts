import axios from 'axios';

export interface APYData {
  borrowAPY: number;
  lendAPY: number;
  // Add other relevant fields
}

export const fetchAPYData = async (): Promise<APYData> => {
  try {
    const response = await axios.get<APYData>('/api/apy-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching APY data:', error);
    throw error;
  }
};
