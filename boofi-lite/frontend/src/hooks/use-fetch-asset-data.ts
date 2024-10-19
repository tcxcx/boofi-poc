// src/hooks/use-fetch-asset-data.ts

import axios from 'axios';
import { AssetData } from '@/lib/types';

type ViewTab = 'lend' | 'withdraw' | 'borrow' | 'repay';

export const fetchAssetData = async (viewTab: ViewTab): Promise<AssetData[]> => {
  try {
    const response = await axios.get<AssetData[]>(`/api/asset-data?viewTab=${viewTab}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Asset data:', error);
    throw error;
  }
};
