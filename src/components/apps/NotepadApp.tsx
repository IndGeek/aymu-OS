import { useState, useRef } from 'react';
import { Plus, X, FolderOpen, Save, Eye, EyeOff, Type } from 'lucide-react';
import { useFileStore } from '@/stores/fileStore';
import { soundManager } from '@/lib/sounds';

type Language =
  | 'plaintext'
  | 'markdown'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'css'
  | 'html'
  | 'bash'
  | 'python';

type ViewMode = 'edit' | 'preview' | 'split';

interface NotepadAppProps {
  windowId: string;
  fileId?: string;
}

interface Tab {
  id: string;
  title: string;
  content: string;
  fileId?: string;
  isModified: boolean;
  language: Language;
}

export function NotepadApp({ windowId, fileId }: NotepadAppProps) {
  const getNodeById = useFileStore((state) => state.getNodeById);
  
  // Initialize with the file if provided
  const detectLanguageFromName = (name: string): Language => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
    if (lower.endsWith('.js') || lower.endsWith('.cjs') || lower.endsWith('.mjs')) return 'javascript';
    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.css')) return 'css';
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'bash';
    if (lower.endsWith('.py')) return 'python';
    return 'plaintext';
  };

  const initialTab = (): Tab => {
    if (fileId) {
      const file = getNodeById(fileId);
      if (file && file.type === 'file') {
        return {
          id: '1',
          title: file.name,
          content: file.content || '',
          fileId: file.id,
          isModified: false,
          language: detectLanguageFromName(file.name),
        };
      }
    }
    return {
      id: '1',
      title: 'Untitled.txt',
      content: '',
      isModified: false,
      language: 'plaintext',
    };
  };

  const [tabs, setTabs] = useState<Tab[]>([initialTab()]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [savePath, setSavePath] = useState('/home/Documents');
  const [saveDialogPath, setSaveDialogPath] = useState('/home/Documents');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const createFile = useFileStore((state) => state.createFile);
  const updateFileContent = useFileStore((state) => state.updateFileContent);
  const getChildren = useFileStore((state) => state.getChildren);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const rootFolders = getChildren('/home').filter((f) => f.type === 'folder');
  const saveDialogItems = getChildren(saveDialogPath).filter((f) => f.type === 'folder');

  const handleNewTab = () => {
    soundManager.playTick();
    const id = Math.random().toString(36).substring(2, 9);
    setTabs((prev) => [
      ...prev,
      { id, title: 'Untitled.txt', content: '', isModified: false, language: 'plaintext' },
    ]);
    setActiveTabId(id);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playTick();
    
    if (tabs.length === 1) {
      // Keep at least one tab
      setTabs([{ id: '1', title: 'Untitled.txt', content: '', isModified: false, language: 'plaintext' }]);
      setActiveTabId('1');
      return;
    }

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const handleContentChange = (content: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, content, isModified: true } : t
      )
    );
  };

  const handleLanguageChange = (language: Language) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, language } : t
      )
    );
  };

  const wrapSelection = (wrapper: (selected: string) => string) => {
    const textarea = editorRef.current;
    if (!textarea || !activeTab) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = activeTab.content.slice(0, start);
    const selected = activeTab.content.slice(start, end);
    const after = activeTab.content.slice(end);

    const newSelected = wrapper(selected || '');
    const newContent = before + newSelected + after;
    handleContentChange(newContent);

    // Try to restore a sensible selection
    const cursorPos = before.length + newSelected.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const applyMarkdownBold = () => wrapSelection((s) => `**${s || 'bold'}**`);
  const applyMarkdownItalic = () => wrapSelection((s) => `*${s || 'italic'}*`);
  const applyMarkdownUnderline = () => wrapSelection((s) => `<u>${s || 'underline'}</u>`);
  const applyMarkdownBullets = () => {
    const textarea = editorRef.current;
    if (!textarea || !activeTab) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = activeTab.content.slice(0, start);
    const selected = activeTab.content.slice(start, end) || 'List item';
    const after = activeTab.content.slice(end);

    const lines = selected.split('\n');
    const bulletLines = lines.map((line) => (line.trim().startsWith('- ') ? line : `- ${line.trim() || 'List item'}`));
    const newSelected = bulletLines.join('\n');
    const newContent = before + newSelected + after;
    handleContentChange(newContent);

    const cursorPos = before.length + newSelected.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const getParentPath = (path: string) => {
    if (path === '/' || path === '') return '/';
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) return '/';
    return '/' + segments.slice(0, -1).join('/');
  };

  const handleSaveDialogFolderClick = (path: string) => {
    setSaveDialogPath(path);
    setSavePath(path);
  };

  const handleSave = () => {
    if (!activeTab) return;
    
    if (activeTab.fileId) {
      // Update existing file
      updateFileContent(activeTab.fileId, activeTab.content);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, isModified: false } : t
        )
      );
    } else {
      // Show save dialog for new file
      const baseName = activeTab.title.replace(/\.[^/.]+$/, '');
      setSaveFileName(baseName);
      setSaveDialogPath(savePath);
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    if (!saveFileName.trim()) return;
    
    const extension =
      activeTab?.language === 'markdown'
        ? '.md'
        : activeTab?.language === 'javascript'
        ? '.js'
        : activeTab?.language === 'typescript'
        ? '.ts'
        : activeTab?.language === 'json'
        ? '.json'
        : activeTab?.language === 'css'
        ? '.css'
        : activeTab?.language === 'html'
        ? '.html'
        : activeTab?.language === 'bash'
        ? '.sh'
        : activeTab?.language === 'python'
        ? '.py'
        : '.txt';

    const fileName = saveFileName.endsWith(extension) ? saveFileName : `${saveFileName}${extension}`;
    const file = createFile(savePath, fileName, activeTab?.content || '');
    
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              title: fileName,
              fileId: file.id,
              isModified: false,
              language: detectLanguageFromName(fileName),
            }
          : t
      )
    );
    
    setShowSaveDialog(false);
    soundManager.playTick();
  };

  const charCount = activeTab?.content.length || 0;
  const lineCount = activeTab?.content.split('\n').length || 1;

  const isMarkdown = activeTab?.language === 'markdown';

  const highlightCode = (code: string, language: Language) => {
    // Extremely lightweight, regex-based syntax highlighting.
    // This is intentionally simple to avoid extra dependencies.
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const patterns: { regex: RegExp; cls: string }[] = [];

    if (language === 'json') {
      patterns.push(
        { regex: /\"([^\"\\]*(\\.[^\"\\]*)*)\"(?=\s*:)/g, cls: 'text-amber-300' }, // keys
        { regex: /\"([^\"\\]*(\\.[^\"\\]*)*)\"/g, cls: 'text-emerald-300' }, // strings
        { regex: /\b(true|false|null)\b/g, cls: 'text-sky-300' },
        { regex: /\b-?\d+(\.\d+)?\b/g, cls: 'text-violet-300' }
      );
    } else if (language === 'javascript' || language === 'typescript') {
      patterns.push(
        { regex: /\b(const|let|var|function|return|if|else|for|while|async|await|class|extends|implements|new|import|from|export|as|type|interface)\b/g, cls: 'text-sky-300' },
        { regex: /\"([^\"\\]*(\\.[^\"\\]*)*)\"|'([^'\\]*(\\.[^'\\]*)*)'|`([^`\\]*(\\.[^`\\]*)*)`/g, cls: 'text-emerald-300' },
        { regex: /\/\/.*/g, cls: 'text-zinc-500' },
        { regex: /\/\*[\s\S]*?\*\//g, cls: 'text-zinc-500' }
      );
    } else if (language === 'css') {
      patterns.push(
        { regex: /\/\*[\s\S]*?\*\//g, cls: 'text-zinc-500' },
        { regex: /\.[a-zA-Z0-9_-]+/g, cls: 'text-sky-300' },
        { regex: /#[a-zA-Z0-9_-]+/g, cls: 'text-violet-300' },
        { regex: /\b(\d+px|\d+rem|\d+vh|\d+vw|%\b)/g, cls: 'text-emerald-300' }
      );
    } else if (language === 'html') {
      patterns.push(
        { regex: /(&lt;!--[\s\S]*?--&gt;)/g, cls: 'text-zinc-500' },
        { regex: /(&lt;\/?[a-zA-Z0-9-]+)(?=[\s&gt;])/g, cls: 'text-sky-300' },
        { regex: /\s([a-zA-Z-:]+)=/g, cls: 'text-emerald-300' },
        { regex: /\"([^\"\\]*(\\.[^\"\\]*)*)\"/g, cls: 'text-amber-300' }
      );
    } else if (language === 'bash') {
      patterns.push(
        { regex: /(#.*)$/gm, cls: 'text-zinc-500' },
        { regex: /\b(cd|ls|echo|cat|grep|tail|head|chmod|chown|mkdir|rm|cp|mv|sudo|apt|npm|yarn)\b/g, cls: 'text-sky-300' },
        { regex: /\$[A-Za-z_][A-Za-z0-9_]*/g, cls: 'text-emerald-300' }
      );
    } else if (language === 'python') {
      patterns.push(
        { regex: /#.*/g, cls: 'text-zinc-500' },
        { regex: /\b(def|class|return|if|elif|else|for|while|import|from|as|with|True|False|None|in|not|and|or)\b/g, cls: 'text-sky-300' },
        { regex: /\"([^\"\\]*(\\.[^\"\\]*)*)\"|'([^'\\]*(\\.[^'\\]*)*)'/g, cls: 'text-emerald-300' }
      );
    } else if (language === 'markdown') {
      patterns.push(
        { regex: /^#{1,6}\s.+$/gm, cls: 'text-sky-300 font-semibold' },
        { regex: /\*\*([^*]+)\*\*/g, cls: 'font-semibold text-foreground' },
        { regex: /_([^_]+)_/g, cls: 'italic text-foreground' },
        { regex: /^[-*]\s.+$/gm, cls: 'text-foreground' },
        { regex: /`([^`]+)`/g, cls: 'text-amber-300' }
      );
    }

    for (const { regex, cls } of patterns) {
      escaped = escaped.replace(regex, (match) => `<span class="${cls}">${match}</span>`);
    }

    return escaped;
  };

  const renderMarkdownPreview = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block ```
      if (line.trim().startsWith('```')) {
        const langToken = line.trim().slice(3).trim().toLowerCase();
        let lang: Language = 'plaintext';
        if (langToken === 'js' || langToken === 'javascript') lang = 'javascript';
        else if (langToken === 'ts' || langToken === 'typescript') lang = 'typescript';
        else if (langToken === 'json') lang = 'json';
        else if (langToken === 'css') lang = 'css';
        else if (langToken === 'html') lang = 'html';
        else if (langToken === 'bash' || langToken === 'sh') lang = 'bash';
        else if (langToken === 'py' || langToken === 'python') lang = 'python';

        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const code = codeLines.join('\n');
        elements.push(
          <pre
            key={`code-${i}-${elements.length}`}
            className="bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto mb-2"
          >
            <code
              dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }}
            />
          </pre>
        );
        i++; // Skip closing ```
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const Tag = (`h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements);
        elements.push(
          <Tag key={`h-${i}-${elements.length}`} className="font-semibold mt-2 mb-1">
            {text}
          </Tag>
        );
        i++;
        continue;
      }

      // Bullet list
      if (/^[-*]\s+/.test(line.trim())) {
        const items: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}-${elements.length}`} className="list-disc list-inside mb-2 space-y-0.5">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
        continue;
      }

      if (line.trim().length === 0) {
        elements.push(<div key={`br-${i}-${elements.length}`} className="h-2" />);
        i++;
        continue;
      }

      // Inline formatting: bold, italic, underline, code
      const segments: JSX.Element[] = [];
      let remaining = line;
      let segKey = 0;

      const pushText = (text: string) => {
        if (!text) return;
        segments.push(<span key={`text-${i}-${segKey++}`}>{text}</span>);
      };

      const patterns = [
        { regex: /\*\*([^*]+)\*\*/, render: (m: RegExpMatchArray) => <strong key={`b-${i}-${segKey++}`}>{m[1]}</strong> },
        { regex: /\*([^*]+)\*/, render: (m: RegExpMatchArray) => <em key={`i-${i}-${segKey++}`}>{m[1]}</em> },
        { regex: /<u>(.*?)<\/u>/, render: (m: RegExpMatchArray) => <u key={`u-${i}-${segKey++}`}>{m[1]}</u> },
        { regex: /`([^`]+)`/, render: (m: RegExpMatchArray) => (
          <code
            key={`code-inline-${i}-${segKey++}`}
            className="bg-muted/70 px-1 py-0.5 rounded text-xs font-mono"
          >
            {m[1]}
          </code>
        ) },
      ];

      while (remaining.length > 0) {
        let closestIndex = Infinity;
        let closestMatch: RegExpMatchArray | null = null;
        let closestPatternIndex = -1;

        patterns.forEach((p, idx) => {
          const match = remaining.match(p.regex);
          if (match && match.index !== undefined && match.index < closestIndex) {
            closestIndex = match.index;
            closestMatch = match;
            closestPatternIndex = idx;
          }
        });

        if (!closestMatch || closestPatternIndex === -1 || closestMatch.index === undefined) {
          pushText(remaining);
          break;
        }

        if (closestMatch.index > 0) {
          pushText(remaining.slice(0, closestMatch.index));
        }

        const pattern = patterns[closestPatternIndex];
        segments.push(pattern.render(closestMatch));

        const consumed = closestMatch.index + closestMatch[0].length;
        remaining = remaining.slice(consumed);
      }

      elements.push(
        <p key={`p-${i}-${elements.length}`} className="mb-1">
          {segments}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border/50 bg-card/30">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 border-r border-border/30 min-w-0 ${
                tab.id === activeTabId
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
              onClick={() => {
                soundManager.playTick();
                setActiveTabId(tab.id);
              }}
            >
              <span className="truncate max-w-32 text-sm">
                {tab.isModified && '• '}
                {tab.title}
              </span>
              <button
                className="p-0.5 hover:bg-muted rounded opacity-60 hover:opacity-100"
                onClick={(e) => handleCloseTab(tab.id, e)}
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
        <button
          className="p-2 hover:bg-muted/30"
          onClick={handleNewTab}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 hover:bg-muted/50 rounded"
            title="Open"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:bg-muted/50 rounded"
            onClick={handleSave}
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          {isMarkdown && (
            <div className="flex items-center gap-1 ml-3">
              <button
                className="px-2 py-1 text-xs rounded-md bg-muted/40 hover:bg-muted/70 flex items-center gap-1"
                onClick={applyMarkdownBold}
                title="Bold"
              >
                <span className="font-semibold">B</span>
              </button>
              <button
                className="px-2 py-1 text-xs rounded-md bg-muted/40 hover:bg-muted/70 italic"
                onClick={applyMarkdownItalic}
                title="Italic"
              >
                I
              </button>
              <button
                className="px-2 py-1 text-xs rounded-md bg-muted/40 hover:bg-muted/70 underline"
                onClick={applyMarkdownUnderline}
                title="Underline"
              >
                U
              </button>
              <button
                className="px-2 py-1 text-xs rounded-md bg-muted/40 hover:bg-muted/70 flex items-center gap-1"
                onClick={applyMarkdownBullets}
                title="Bulleted list"
              >
                <span className="text-xs">•</span>
                <span className="text-xs">•</span>
                <span className="text-xs">•</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isMarkdown && (
            <div className="flex items-center gap-1 text-xs bg-muted/30 rounded-md p-0.5">
              <button
                className={`px-2 py-1 rounded-sm flex items-center gap-1 ${
                  viewMode === 'edit' ? 'bg-background text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setViewMode('edit')}
              >
                Edit
              </button>
              <button
                className={`px-2 py-1 rounded-sm flex items-center gap-1 ${
                  viewMode === 'preview' ? 'bg-background text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setViewMode('preview')}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                className={`px-2 py-1 rounded-sm flex items-center gap-1 ${
                  viewMode === 'split' ? 'bg-background text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setViewMode('split')}
              >
                <EyeOff className="w-3 h-3" />
                Split
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex">
        {/* Text editor pane */}
        {(viewMode === 'edit' || viewMode === 'split' || !isMarkdown) && (
          <div className={`h-full ${isMarkdown && viewMode === 'split' ? 'w-1/2 border-r border-border/40' : 'w-full'} overflow-hidden`}>
            <textarea
              ref={editorRef}
              value={activeTab?.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full p-4 bg-transparent resize-none outline-none font-mono text-sm"
              placeholder={isMarkdown ? 'Write your markdown here...' : 'Start typing...'}
              spellCheck={false}
            />
          </div>
        )}

        {/* Markdown preview pane */}
        {(isMarkdown && (viewMode === 'preview' || viewMode === 'split')) && (
          <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto px-4 py-3`}>
            <div className="prose prose-invert max-w-none text-sm">
              {renderMarkdownPreview(activeTab?.content || '')}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-border/50 text-xs text-muted-foreground">
        <span>{charCount} chars</span>
        <span>Ln {lineCount}</span>
        <div className="flex items-center gap-1">
          <Type className="w-3 h-3" />
          <select
            value={activeTab?.language || 'plaintext'}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="bg-transparent border-none text-xs outline-none focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="plaintext">Plain Text</option>
            <option value="markdown">Markdown</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="bash">Bash</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-4 w-[520px] space-y-3 shadow-xl border border-border/80">
            <h3 className="text-sm font-medium text-foreground mb-1">Save File</h3>

            {/* Folder browser */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="truncate text-muted-foreground">
                  Location: <span className="text-foreground">{saveDialogPath}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="px-2 py-1 rounded-md bg-muted/40 hover:bg-muted/70"
                    onClick={() => {
                      const parent = getParentPath(saveDialogPath);
                      setSaveDialogPath(parent);
                      setSavePath(parent);
                    }}
                  >
                    Up
                  </button>
                </div>
              </div>

              <div className="border border-border/60 rounded-md bg-muted/30 max-h-56 overflow-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {/* Root /home and user folders when at /home */}
                    {saveDialogPath === '/home' && rootFolders.map((item) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => handleSaveDialogFolderClick(item.path)}
                      >
                        <td className="px-3 py-1.5 text-foreground">{item.name}</td>
                        <td className="px-3 py-1.5 text-right text-muted-foreground">Folder</td>
                      </tr>
                    ))}
                    {saveDialogItems.map((item) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => handleSaveDialogFolderClick(item.path)}
                      >
                        <td className="px-3 py-1.5 text-foreground">{item.name}</td>
                        <td className="px-3 py-1.5 text-right text-muted-foreground">Folder</td>
                      </tr>
                    ))}
                    {saveDialogItems.length === 0 && (
                      <tr>
                        <td className="px-3 py-2 text-muted-foreground text-center">
                          No subfolders in this directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom row: file name + actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60 mt-1">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">
                  File name
                </label>
                <input
                  type="text"
                  value={saveFileName}
                  onChange={(e) => setSaveFileName(e.target.value)}
                  className="os-input w-full text-xs"
                  placeholder="filename"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <button
                  className="os-button-secondary"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="os-button-primary"
                  onClick={handleSaveAs}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
