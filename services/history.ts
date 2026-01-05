import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type SnippetHistoryEntry = {
  id: string;
  code: string;
  logs: string[];
  error?: string | null;
  durationMs: number;
  createdAt: number;
};

const STORAGE_KEY = '@snippet_history_v1';
const MAX_ENTRIES = 50;

const readStorage = async (): Promise<SnippetHistoryEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to read snippet history', error);
    return [];
  }
};

const writeStorage = async (entries: SnippetHistoryEntry[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to persist snippet history', error);
  }
};

export const loadHistory = async () => {
  return readStorage();
};

export const addHistoryEntry = async (
  payload: Omit<SnippetHistoryEntry, 'id' | 'createdAt'>,
) => {
  const entry: SnippetHistoryEntry = {
    ...payload,
    id: uuidv4(),
    createdAt: Date.now(),
  };
  const existing = await readStorage();
  const next = [entry, ...existing].slice(0, MAX_ENTRIES);
  await writeStorage(next);
  return next;
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear snippet history', error);
  }
};
