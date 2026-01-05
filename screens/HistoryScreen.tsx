import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList } from '../App';
import { SnippetHistoryEntry, clearHistory, loadHistory } from '../services/history';

type Props = BottomTabScreenProps<RootStackParamList, 'History'>;

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<SnippetHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    const entries = await loadHistory();
    setHistory(entries);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory]),
  );

  const handleSelect = (entry: SnippetHistoryEntry) => {
    navigation.navigate('Playground', { code: entry.code });
  };

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  const renderItem = ({ item }: { item: SnippetHistoryEntry }) => {
    const preview = item.code.split('\n').slice(0, 2).join(' ').slice(0, 80);
    const summary = item.error ? `Error: ${item.error}` : (item.logs[0] || 'No output');
    const date = new Date(item.createdAt).toLocaleString();
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
        <Text style={styles.codePreview}>{preview}</Text>
        <Text style={styles.summary}>{summary}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>{date}</Text>
          <Text style={styles.duration}>{item.durationMs} ms</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Run History</Text>
        <TouchableOpacity onPress={handleClear} disabled={!history.length} style={[styles.clearButton, !history.length && styles.buttonDisabled]}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#22c55e" />
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Run a snippet to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 20,
    fontWeight: '700',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  clearText: {
    color: '#f87171',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  list: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 6,
  },
  codePreview: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  summary: {
    color: '#d1d5db',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: '#9ca3af',
    fontSize: 11,
  },
  duration: {
    color: '#9ca3af',
    fontSize: 11,
  },
});

export default HistoryScreen;