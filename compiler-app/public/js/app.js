// CodeSphere Local - Simple Online Compiler Client

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation & Header
  const languageSelect = document.getElementById('languageSelect');
  const langIcon = document.getElementById('langIcon');
  const engineStatus = document.getElementById('engineStatus');
  const statusLabel = document.getElementById('statusLabel');
  const engineEndpoint = document.getElementById('engineEndpoint');
  const engineName = document.getElementById('engineName');
  const runBtn = document.getElementById('runBtn');

  // Code Editor Elements
  const currentFileName = document.getElementById('currentFileName');
  const editorStats = document.getElementById('editorStats');
  const langMeta = document.getElementById('langMeta');
  const codeEditor = document.getElementById('codeEditor');
  const lineGutter = document.getElementById('lineGutter');
  const resetCodeBtn = document.getElementById('resetCodeBtn');
  const clearCodeBtn = document.getElementById('clearCodeBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  // Terminal Workbench Elements (Interactive Input & Output)
  const terminalInputCol = document.getElementById('terminalInputCol');
  const customInput = document.getElementById('customInput');
  const runWithInputBtn = document.getElementById('runWithInputBtn');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const inputStatusHint = document.getElementById('inputStatusHint');

  const statusBadge = document.getElementById('statusBadge');
  const metricsPill = document.getElementById('metricsPill');
  const metricTime = document.getElementById('metricTime');
  const metricMem = document.getElementById('metricMem');
  const clearOutputBtn = document.getElementById('clearOutputBtn');

  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const outputBlocks = document.getElementById('outputBlocks');

  const stdoutSec = document.getElementById('stdoutSec');
  const stdoutText = document.getElementById('stdoutText');
  const stderrSec = document.getElementById('stderrSec');
  const stderrText = document.getElementById('stderrText');
  const stderrLabel = document.getElementById('stderrLabel');
  const compileSec = document.getElementById('compileSec');
  const compileText = document.getElementById('compileText');

  // State
  let currentLangId = '71'; // Python default
  let isExecuting = false;
  let inputPromptShown = false;

  // ==========================================================================
  // Language & Template Management
  // ==========================================================================

  function setLanguage(langId) {
    currentLangId = String(langId);
    const config = LANGUAGE_CONFIGS[currentLangId];
    if (!config) return;

    langIcon.textContent = config.icon;
    currentFileName.textContent = config.filename;
    langMeta.textContent = `${config.name} ${config.version} • UTF-8`;

    // Load clean starter template
    codeEditor.value = config.template || '';
    updateLineNumbers();
    updateCursorStats();
  }

  // ==========================================================================
  // Editor Functionality (Line Numbers, Indentation, Stats, Copy, Reset, Clear)
  // ==========================================================================

  function updateLineNumbers() {
    const lines = codeEditor.value.split('\n');
    const lineCount = lines.length;
    let gutterHtml = '';
    for (let i = 1; i <= lineCount; i++) {
      gutterHtml += `<div class="gutter-num">${i}</div>`;
    }
    lineGutter.innerHTML = gutterHtml;
  }

  function updateCursorStats() {
    const textBeforeCursor = codeEditor.value.substring(0, codeEditor.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    editorStats.textContent = `Line ${currentLine}, Col ${currentCol}`;
  }

  function insertTextAtCursor(insertText) {
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;

    let success = false;
    try {
      success = document.execCommand('insertText', false, insertText);
    } catch (err) {
      success = false;
    }

    if (!success) {
      const val = codeEditor.value;
      codeEditor.value = val.substring(0, start) + insertText + val.substring(end);
      codeEditor.selectionStart = codeEditor.selectionEnd = start + insertText.length;
    }
    updateLineNumbers();
    updateCursorStats();
  }

  // Handle Tab and Shift+Tab key
  function handleTabKey(isShift) {
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;
    const text = codeEditor.value;

    if (!isShift) {
      // Single-line or no selection: insert 4 spaces
      if (start === end) {
        insertTextAtCursor('    ');
        return;
      }

      // Multi-line selection: indent each line by 4 spaces
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = text.indexOf('\n', end);
      const effectiveEnd = lineEnd === -1 ? text.length : lineEnd;

      const lines = text.substring(lineStart, effectiveEnd).split('\n');
      const indented = lines.map(l => '    ' + l).join('\n');

      codeEditor.value = text.substring(0, lineStart) + indented + text.substring(effectiveEnd);
      codeEditor.selectionStart = start + 4;
      codeEditor.selectionEnd = end + (4 * lines.length);
      updateLineNumbers();
      updateCursorStats();
    } else {
      // Shift+Tab: Unindent each selected line by up to 4 spaces
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = text.indexOf('\n', end);
      const effectiveEnd = lineEnd === -1 ? text.length : lineEnd;

      const lines = text.substring(lineStart, effectiveEnd).split('\n');
      let firstLineReduced = 0;
      let totalReduced = 0;

      const unindented = lines.map((line, idx) => {
        let spacesToRemove = 0;
        for (let i = 0; i < 4 && i < line.length && line[i] === ' '; i++) {
          spacesToRemove++;
        }
        if (idx === 0) firstLineReduced = spacesToRemove;
        totalReduced += spacesToRemove;
        return line.substring(spacesToRemove);
      }).join('\n');

      codeEditor.value = text.substring(0, lineStart) + unindented + text.substring(effectiveEnd);
      codeEditor.selectionStart = Math.max(lineStart, start - firstLineReduced);
      codeEditor.selectionEnd = Math.max(codeEditor.selectionStart, end - totalReduced);
      updateLineNumbers();
      updateCursorStats();
    }
  }

  // Handle Backspace on indented lines (removes up to 4 spaces/one indent level)
  function handleBackspaceKey() {
    const start = codeEditor.selectionStart;
    const text = codeEditor.value;

    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBeforeCursor = text.substring(lineStart, start);

    // If everything before the cursor on this line is spaces, delete 4 spaces or to previous tab stop
    if (textBeforeCursor.length > 0 && /^ +$/.test(textBeforeCursor)) {
      const spacesToDelete = textBeforeCursor.length % 4 === 0 ? 4 : (textBeforeCursor.length % 4);
      const newPos = start - spacesToDelete;
      codeEditor.value = text.substring(0, newPos) + text.substring(start);
      codeEditor.selectionStart = codeEditor.selectionEnd = newPos;
      updateLineNumbers();
      updateCursorStats();
      return true;
    }
    return false;
  }

  // Handle Enter key auto-indentation (Python `:` and C/C++/Java `{`)
  function handleEnterKey() {
    const start = codeEditor.selectionStart;
    const text = codeEditor.value;

    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const lineBeforeCursor = text.substring(lineStart, start);

    // Current line base indentation
    const indentMatch = lineBeforeCursor.match(/^(\s*)/);
    let baseIndent = indentMatch ? indentMatch[1] : '';

    let extraIndent = '';

    if (currentLangId === '71') {
      // Python: Check if line ends with ':' (ignoring comments and trailing whitespace)
      const cleanLine = lineBeforeCursor.replace(/#.*$/, '').trimEnd();
      if (cleanLine.endsWith(':')) {
        extraIndent = '    '; // 4 spaces
      }
    } else {
      // C, C++, Java: check if line ends with '{'
      const cleanLine = lineBeforeCursor.replace(/\/\/.*$/, '').trimEnd();
      if (cleanLine.endsWith('{')) {
        extraIndent = '    ';
      }
    }

    const insertText = '\n' + baseIndent + extraIndent;
    insertTextAtCursor(insertText);
  }

  // Handle auto-dedent for Python closing block statements (else:, elif:, except:, finally:)
  function handlePythonColonDedent() {
    if (currentLangId !== '71') return false;

    const start = codeEditor.selectionStart;
    const text = codeEditor.value;

    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const lineBeforeCursor = text.substring(lineStart, start);

    // Check if line before cursor matches 4+ leading spaces followed by dedent keyword:
    // e.g. "    else", "    elif ...", "    except ...", "    finally"
    const dedentRegex = /^(\s{4,})(else|elif(\s+.*)?|except(\s+.*)?|finally)$/;
    if (dedentRegex.test(lineBeforeCursor)) {
      // Remove 4 spaces from the start of the line and append the colon ':'
      const spacesToStrip = 4;
      const newLine = lineBeforeCursor.substring(spacesToStrip) + ':';
      const afterCursor = text.substring(codeEditor.selectionEnd);

      codeEditor.value = text.substring(0, lineStart) + newLine + afterCursor;
      const newPos = lineStart + newLine.length;
      codeEditor.selectionStart = codeEditor.selectionEnd = newPos;
      updateLineNumbers();
      updateCursorStats();
      return true;
    }

    return false;
  }

  // Keyboard Event Listener on Code Editor
  codeEditor.addEventListener('keydown', (e) => {
    // 1. Ctrl+Enter or Cmd+Enter: Execute Run
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeRun();
      return;
    }

    // 2. Tab and Shift+Tab Handling
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabKey(e.shiftKey);
      return;
    }

    // 3. Backspace Handling on Indented Lines
    if (e.key === 'Backspace' && codeEditor.selectionStart === codeEditor.selectionEnd) {
      if (handleBackspaceKey()) {
        e.preventDefault();
        return;
      }
    }

    // 4. Auto-Dedent on typing ':' for Python else:, elif:, except:, finally:
    if (e.key === ':' && codeEditor.selectionStart === codeEditor.selectionEnd) {
      if (handlePythonColonDedent()) {
        e.preventDefault();
        return;
      }
    }

    // 5. Enter Key Auto-Indentation
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      handleEnterKey();
      return;
    }
  });

  codeEditor.addEventListener('input', () => {
    updateLineNumbers();
    updateCursorStats();
  });

  codeEditor.addEventListener('click', updateCursorStats);
  codeEditor.addEventListener('keyup', updateCursorStats);

  codeEditor.addEventListener('scroll', () => {
    lineGutter.scrollTop = codeEditor.scrollTop;
  });

  // Stdin textarea must NEVER trigger execution on Enter.
  // Enter and Shift+Enter strictly insert newlines.
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Prevent any parent or global listeners from capturing Enter
      e.stopPropagation();
      // Allow browser's default textarea newline insertion
    }
  });

  // Language Change Listener
  languageSelect.addEventListener('change', (e) => {
    const newLang = e.target.value;
    const currentCode = codeEditor.value.trim();
    const currentDefault = (LANGUAGE_CONFIGS[currentLangId]?.template || '').trim();

    if (currentCode && currentCode !== currentDefault) {
      if (confirm('Switching languages will replace current code with the starter template. Continue?')) {
        setLanguage(newLang);
      } else {
        languageSelect.value = currentLangId;
      }
    } else {
      setLanguage(newLang);
    }
  });

  // Reset Code Button
  resetCodeBtn.addEventListener('click', () => {
    if (confirm('Reset editor to starter template for this language?')) {
      setLanguage(currentLangId);
    }
  });

  // Clear Code Button
  clearCodeBtn.addEventListener('click', () => {
    codeEditor.value = '';
    updateLineNumbers();
    updateCursorStats();
  });

  // Copy Code Button
  copyCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEditor.value);
      copyCodeBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        copyCodeBtn.innerHTML = '<span>📋</span> Copy';
      }, 1500);
    } catch (err) {
      alert('Failed to copy code to clipboard.');
    }
  });

  // Clear Output Button
  clearOutputBtn.addEventListener('click', () => {
    emptyState.classList.remove('hidden');
    outputBlocks.classList.add('hidden');
    statusBadge.classList.add('hidden');
    metricsPill.classList.add('hidden');
  });

  // Clear Input Button
  clearInputBtn.addEventListener('click', () => {
    customInput.value = '';
    customInput.focus();
    inputStatusHint.textContent = 'Program stdin';
    inputStatusHint.style.color = '';
  });

  // ==========================================================================
  // Health Check
  // ==========================================================================

  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Status ' + res.status);
      const data = await res.json();

      if (data.judge0 && data.judge0.connected) {
        engineStatus.className = 'engine-status connected';
        statusLabel.textContent = 'Judge0: Connected';
        engineEndpoint.textContent = data.judge0.url.replace('http://', '');
        engineName.textContent = `Judge0 v${data.judge0.version}`;
      } else {
        engineStatus.className = 'engine-status disconnected';
        statusLabel.textContent = 'Judge0: Disconnected';
        engineEndpoint.textContent = (data.judge0 && data.judge0.url) || 'Unreachable';
      }
    } catch (err) {
      engineStatus.className = 'engine-status disconnected';
      statusLabel.textContent = 'Judge0: Disconnected';
      engineEndpoint.textContent = 'Disconnected';
    }
  }

  // ==========================================================================
  // Interactive RUN Flow & Execution Handler
  // ==========================================================================

  function codeExpectsInput(code, langId) {
    if (!code) return false;
    if (langId === '71') {
      return /\b(input|sys\.stdin)\b/.test(code);
    } else if (langId === '50') {
      return /\b(scanf|getchar|gets|fgets|read)\b/.test(code);
    } else if (langId === '54') {
      return /\b(cin|scanf|getline|getchar)\b/.test(code);
    } else if (langId === '62') {
      return /\b(Scanner|System\.in|BufferedReader|Console)\b/.test(code);
    }
    return false;
  }

  async function handleMainRunClick() {
    const code = codeEditor.value;
    const expectsInput = codeExpectsInput(code, currentLangId);
    const hasInput = customInput.value.trim().length > 0;

    // If code expects input and the user hasn't provided any input yet:
    // Prompt the user in the interactive terminal input area!
    if (expectsInput && !hasInput && !inputPromptShown) {
      inputPromptShown = true;
      terminalInputCol.classList.add('highlight-focus');
      customInput.focus();
      inputStatusHint.textContent = '👉 Enter input below, then click [Run with Input] (or hit Run again)';
      inputStatusHint.style.color = 'var(--accent-cyan)';
      setTimeout(() => {
        terminalInputCol.classList.remove('highlight-focus');
      }, 3000);
      return;
    }

    inputPromptShown = false;
    inputStatusHint.textContent = 'Program stdin';
    inputStatusHint.style.color = '';
    await executeRun();
  }

  async function executeRun() {
    if (isExecuting) return;

    const sourceCode = codeEditor.value.trim();
    if (!sourceCode) {
      alert('Please enter some code before running.');
      return;
    }

    isExecuting = true;
    runBtn.disabled = true;
    runWithInputBtn.disabled = true;

    // Show loading state in Terminal Output
    emptyState.classList.add('hidden');
    outputBlocks.classList.add('hidden');
    loadingState.classList.remove('hidden');
    statusBadge.classList.add('hidden');
    metricsPill.classList.add('hidden');

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_id: Number(currentLangId),
          source_code: codeEditor.value,
          stdin: customInput.value
        })
      });

      const data = await response.json();
      loadingState.classList.add('hidden');

      if (!response.ok || !data.success) {
        showError(data.error || 'Server error occurred during execution.');
        return;
      }

      displayResult(data.result);
    } catch (err) {
      loadingState.classList.add('hidden');
      showError(err.message || 'Network error communicating with compiler backend.');
    } finally {
      isExecuting = false;
      runBtn.disabled = false;
      runWithInputBtn.disabled = false;
    }
  }

  function displayResult(res) {
    outputBlocks.classList.remove('hidden');

    const statusDesc = res.status?.description || 'Unknown';
    const statusId = res.status?.id;

    // Status Badge
    statusBadge.textContent = statusDesc;
    statusBadge.className = 'status-badge';

    if (statusId === 3) {
      // Accepted
      statusBadge.classList.add('success');
    } else if (statusId === 6 || statusId >= 7) {
      // Compilation Error or Runtime Error
      statusBadge.classList.add('error');
    } else {
      statusBadge.classList.add('warn');
    }
    statusBadge.classList.remove('hidden');

    // Metrics Pill
    metricTime.textContent = `Time: ${res.time || '< 0.01s'}`;
    metricMem.textContent = `Mem: ${res.memory || '--'}`;
    metricsPill.classList.remove('hidden');

    // Stdout
    if (res.stdout) {
      stdoutSec.classList.remove('hidden');
      stdoutText.textContent = res.stdout;
    } else {
      stdoutSec.classList.add('hidden');
    }

    // Stderr / Runtime Error
    if (res.stderr) {
      stderrSec.classList.remove('hidden');
      stderrLabel.textContent = statusId >= 7 ? 'RUNTIME ERROR / STDERR:' : 'STDERR:';
      stderrText.textContent = res.stderr;
    } else {
      stderrSec.classList.add('hidden');
    }

    // Compile Output
    if (res.compile_output) {
      compileSec.classList.remove('hidden');
      compileText.textContent = res.compile_output;
    } else {
      compileSec.classList.add('hidden');
    }

    // If no outputs at all
    if (!res.stdout && !res.stderr && !res.compile_output) {
      stdoutSec.classList.remove('hidden');
      stdoutText.textContent = '(Program executed successfully with no output)';
    }
  }

  function showError(msg) {
    outputBlocks.classList.remove('hidden');
    statusBadge.textContent = 'Execution Failed';
    statusBadge.className = 'status-badge error';
    statusBadge.classList.remove('hidden');

    stdoutSec.classList.add('hidden');
    compileSec.classList.add('hidden');
    stderrSec.classList.remove('hidden');
    stderrLabel.textContent = 'ERROR:';
    stderrText.textContent = msg;
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  runBtn.addEventListener('click', executeRun);
  runWithInputBtn.addEventListener('click', executeRun);

  // Start with Python
  setLanguage('71');
  checkHealth();

  setInterval(checkHealth, 30000);
});
