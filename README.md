# Code Playground (React Native)

A mobile sandbox application for writing and running JavaScript code snippets. Features Monaco Editor with syntax highlighting, code execution in a WebView, and persistent history of executed snippets.

## Features

- ✨ **Monaco Editor** - Full-featured code editor with JavaScript syntax highlighting (loaded from CDN)
- 🚀 **Code Execution** - Run JavaScript code safely inside a WebView sandbox
- 📝 **Console Output** - Capture and display console.log, errors, and return values
- 📚 **History** - Automatically save executed snippets with timestamps and results
- 💾 **Local Storage** - History persisted using AsyncStorage (up to 50 entries)
- 🎨 **Modern UI** - Dark theme with clean, mobile-optimized interface

## Project Structure

```
CodePlayground/
├── screens/
│   ├── PlaygroundScreen.tsx  # Main code editor and execution screen
│   └── HistoryScreen.tsx     # History of executed snippets
├── services/
│   └── history.ts             # History storage and management
├── utils/
│   └── editorHtml.ts         # Monaco editor HTML template
├── App.tsx                    # Main app with navigation
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment set up
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```sh
npm install
```

### Running the App

```sh
# Start Metro bundler
npm start

# Run on Android (in a separate terminal)
npm run android

# Run on iOS (in a separate terminal)
npm run ios
```

## How to Use

1. **Edit Code** - Tap inside the Monaco editor in the Playground tab to start typing
2. **Run Code** - Tap the green "Run" button to execute your JavaScript
3. **View Output** - Results appear in the output section below the editor
4. **Check History** - Switch to the History tab to see all previous runs
5. **Reopen Snippets** - Tap any history item to load it back into the editor
6. **Clear History** - Use the "Clear" button in the History tab to remove all entries

## Technical Details

### Code Execution

- JavaScript code runs inside a WebView using `new Function()` with strict mode
- Console methods (log, error, warn, info) are proxied to capture output
- Execution time is measured and displayed
- Errors are caught and displayed in the output area

### Monaco Editor

- Loaded from CDN: `cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs`
- Configured with dark theme (`vs-dark`)
- Automatic layout adjustment for mobile screens
- Minimap disabled for better mobile experience

### History Storage

- Uses `@react-native-async-storage/async-storage` for persistence
- Stores up to 50 most recent entries
- Each entry includes: code, logs, error (if any), execution time, and timestamp

## Security Considerations

⚠️ **Important**: This is a convenience sandbox for trusted code snippets. It is **not** a production-grade security sandbox.

### Current Security Measures

- Code executes only inside the WebView (isolated from native modules)
- No direct access to React Native APIs or device features
- Console is proxied to prevent direct access to native console
- WebView configured with restricted file access

### Security Limitations

- WebView JavaScript can still use standard Web APIs (fetch, XMLHttpRequest, etc.)
- Code can make network requests if device has internet access
- Untrusted code could potentially exfiltrate data
- Monaco Editor is loaded from CDN (consider self-hosting for production)

### Recommendations for Production

- For untrusted user code, use a server-side sandbox (e.g., Docker containers)
- Implement resource limits (execution time, memory, network)
- Use a dedicated JavaScript runtime with explicit permission gating
- Self-host Monaco Editor or use a pinned CDN version
- Add code validation and sanitization before execution

## Dependencies

- `react-native-webview` - WebView component for Monaco editor
- `@react-native-async-storage/async-storage` - Local storage for history
- `@react-navigation/native` & `@react-navigation/bottom-tabs` - Navigation
- `react-native-vector-icons` - Tab bar icons
- `uuid` - Generate unique IDs for history entries

## License

This project is for interview/demonstration purposes.
