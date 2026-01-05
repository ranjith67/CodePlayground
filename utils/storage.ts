import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Snippet {
  id: string;
  code: string;
  timestamp: number;
}

const STORAGE_KEY = 'playground_history';

// Simple ID generator to avoid native dependencies like react-native-get-random-values
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveSnippet = async (code: string): Promise<Snippet> => {
  try {
    const history = await getHistory();
    const newSnippet: Snippet = {
      id: generateId(),
      code,
      timestamp: Date.now(),
    };
    
    // valid check to avoid saving empty or duplicate recent snippets could be added here
    // for now, just save everything
    const updatedHistory = [newSnippet, ...history];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newSnippet;
  } catch (e) {
    console.error('Failed to save snippet', e);
    throw e;
  }
};

export const getHistory = async (): Promise<Snippet[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch(e) {
        console.error("Failed to clear history", e);
    }
}
