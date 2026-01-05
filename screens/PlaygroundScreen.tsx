import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList } from '../App';
import createEditorHtml from '../utils/editorHtml';
import { addHistoryEntry } from '../services/history';

type Props = BottomTabScreenProps<RootStackParamList, 'Playground'>;

const DEFAULT_SNIPPET = `// Example snippet
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('Mobile Dev');
console.log(message);
message;`;

const PlaygroundScreen: React.FC<Props> = ({ route }) => {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const initialCode = route.params?.code || DEFAULT_SNIPPET;
  const htmlContent = useMemo(
    () => createEditorHtml(initialCode),
    [initialCode],
  );

  const postMessage = useCallback((payload: Record<string, unknown>) => {
    webViewRef.current?.postMessage(JSON.stringify(payload));
  }, []);

  useEffect(() => {
    setReady(false);
    setLogs([]);
    setError(null);
    setDuration(null);
  }, [htmlContent]);

  const handleRun = () => {
    if (!ready) {
      return;
    }
    setRunning(true);
    postMessage({ type: 'RUN' });
  };

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        // Ignore non-JSON messages that might come from the WebView.
        return;
      }

      if (!data || typeof data !== 'object') {
        return;
      }

      if (data.type === 'READY') {
        setReady(true);
        if (route.params?.code) {
          postMessage({ type: 'SET_CODE', code: route.params.code });
        }
        return;
      }

      if (data.type === 'RESULT') {
        setRunning(false);
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setError(data.error || null);
        setDuration(typeof data.duration === 'number' ? data.duration : null);
        await addHistoryEntry({
          code: typeof data.code === 'string' ? data.code : '',
          logs: Array.isArray(data.logs) ? data.logs : [],
          error: data.error || null,
          durationMs: typeof data.duration === 'number' ? data.duration : 0,
        });
      }
    },
    [postMessage, route.params?.code],
  );

  useEffect(() => {
    if (ready && route.params?.code) {
      postMessage({ type: 'SET_CODE', code: route.params.code });
    }
  }, [postMessage, ready, route.params?.code]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>JS Playground</Text>
          <Text style={styles.subtitle}>
            Monaco editor running inside a sandboxed WebView
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.runButton, !ready && styles.runButtonDisabled]}
          onPress={handleRun}
          disabled={!ready || running}
        >
          {running ? (
            <ActivityIndicator color="#0f111a" />
          ) : (
            <>
              <Ionicons name="play" size={16} color="#0f111a" />
              <Text style={styles.runText}>Run</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.editorWrapper}>
        {!ready && (
          <View style={styles.loadingLayer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.loadingText}>Loading Monaco editor…</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleMessage}
          keyboardDisplayRequiresUserAction={false}
          androidLayerType="hardware"
          hideKeyboardAccessoryView={false}
          setBuiltInZoomControls={false}
          allowFileAccess={false}
          allowUniversalAccessFromFileURLs={false}
          automaticallyAdjustContentInsets={false}
          style={styles.webview}
          onShouldStartLoadWithRequest={() => true}
        />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.sectionTitle}>Output</Text>
        {duration !== null && (
          <Text style={styles.duration}>{duration} ms</Text>
        )}
      </View>
      <ScrollView style={styles.outputBox}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : logs.length ? (
          logs.map((item, idx) => (
            <Text key={idx.toString()} style={styles.logText}>
              {item}
            </Text>
          ))
        ) : (
          <Text style={styles.placeholder}>Tap Run to see console output</Text>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  runButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  runButtonDisabled: {
    opacity: 0.5,
  },
  runText: {
    color: '#0f111a',
    fontWeight: '700',
  },
  editorWrapper: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
  },
  webview: {
    height: '100%',
    backgroundColor: '#111827',
  },
  loadingLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0c10',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 8,
  },
  loadingText: {
    color: '#e5e7eb',
    fontSize: 12,
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    color: '#9ca3af',
    fontSize: 12,
  },
  outputBox: {
    minHeight: 120,
    maxHeight: 200,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#0f111a',
  },
  logText: {
    color: '#d1d5db',
    fontFamily: 'Menlo',
    marginBottom: 4,
  },
  errorText: {
    color: '#f87171',
    fontFamily: 'Menlo',
  },
  placeholder: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default PlaygroundScreen;
