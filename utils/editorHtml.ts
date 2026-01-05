const createEditorHtml = (initialCode: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      background: #0f111a;
      -webkit-tap-highlight-color: transparent;
    }
    #container {
      width: 100%;
      height: 100%;
      outline: none;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    let editor;
    let runCode = () => {};
    const initialCode = ${JSON.stringify(initialCode)};
    const postMessage = (payload) => {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    };

    const safeStringify = (value) => {
      try { return String(value); } catch (err) { return '[unserializable]'; }
    };

    const handleMessage = (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch (e) { return; }
      if (!data || typeof data !== 'object') return;
      if (data.type === 'RUN') {
        runCode();
        return;
      }
      if (data.type === 'SET_CODE' && typeof data.code === 'string') {
        if (editor) {
          editor.setValue(data.code);
        }
      }
    };

    require.config({
      paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs' }
    });

    require(['vs/editor/editor.main'], function () {
      editor = monaco.editor.create(document.getElementById('container'), {
        value: initialCode,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        readOnly: false,
        contextmenu: true,
      });
      window.editor = editor;

      const container = document.getElementById('container');
      if (container) {
        container.addEventListener('touchstart', function(e) {
          e.stopPropagation();
          setTimeout(function() {
            if (editor) {
              editor.focus();
            }
          }, 100);
        }, { passive: true });
        
        container.addEventListener('click', function(e) {
          e.stopPropagation();
          if (editor) {
            editor.focus();
          }
        }, { passive: true });
      }

      runCode = function runCode() {
        const code = editor.getValue();
        const logs = [];
        const consoleProxy = {
          log: (...args) => logs.push(args.map(safeStringify).join(' ')),
          error: (...args) => logs.push(args.map(safeStringify).join(' ')),
          warn: (...args) => logs.push(args.map(safeStringify).join(' ')),
          info: (...args) => logs.push(args.map(safeStringify).join(' ')),
        };

        let error = null;
        const start = performance.now();
        try {
          const fn = new Function('console', '"use strict";\\n' + code);
          const result = fn(consoleProxy);
          if (result !== undefined) {
            logs.push(safeStringify(result));
          }
        } catch (err) {
          error = err ? err.message || String(err) : 'Unknown error';
        }
        const duration = Math.round(performance.now() - start);
        postMessage({ type: 'RESULT', code, logs, error, duration });
      };

      window.document.addEventListener('message', (event) => handleMessage(event.data));
      window.addEventListener('message', (event) => handleMessage(event.data));
      postMessage({ type: 'READY' });
      window.runCode = runCode;
    });
  </script>
</body>
</html>`;

export default createEditorHtml;
