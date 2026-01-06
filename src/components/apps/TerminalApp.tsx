import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '@/stores/systemStore';
import { useFileStore } from '@/stores/fileStore';
import { Folder, FileText } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';

interface TerminalAppProps {
  windowId: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'ls';
  content: string;
  color?: string;
  lsItems?: { name: string; isFolder: boolean }[];
}

export function TerminalApp({ windowId }: TerminalAppProps) {
  const currentUser = useSystemStore((state) => state.currentUser);
  const getChildren = useFileStore((state) => state.getChildren);
  const getNodeByPath = useFileStore((state) => state.getNodeByPath);
  const createFolder = useFileStore((state) => state.createFolder);
  const deleteNode = useFileStore((state) => state.deleteNode);
  const openWindow = useWindowStore((state) => state.openWindow);

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'AymuOS terminal [v0.1.0]' },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDir, setCurrentDir] = useState('/home');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt = `${currentUser?.username || 'user'}@aymu:${currentDir}$`;

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addOutput = (content: string, color?: string) => {
    setLines((prev) => [...prev, { type: 'output', content, color }]);
  };

  const executeCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    setLines((prev) => [...prev, { type: 'input', content: `${prompt} ${cmd}` }]);

    switch (command) {
      case '':
        break;

      case 'help':
        addOutput('Available commands:');
        addOutput('  ls        - list directory contents');
        addOutput('  cd <dir>  - change directory');
        addOutput('  pwd       - print working directory');
        addOutput('  cat <file>- display file contents');
        addOutput('  mkdir <dir> - create directory');
        addOutput('  rm <path>   - remove file or directory');
        addOutput('  notepad <file> - open file in Notepad');
        addOutput('  clear     - clear terminal');
        addOutput('  neofetch  - system information');
        addOutput('  echo      - display text');
        addOutput('  whoami    - display current user');
        addOutput('  date      - display current date/time');
        addOutput('  tree      - display directory tree');
        addOutput('  uname     - system information');
        addOutput('  uptime    - system uptime');
        addOutput('  history   - command history');
        addOutput('  exit      - close terminal');
        addOutput('  help      - show this help');
        break;

      case 'ls':
        const files = getChildren(currentDir);
        if (files.length === 0) {
          addOutput('(empty directory)');
        } else {
          const lsItems = files.map(f => ({
            name: f.type === 'folder' ? `${f.name}/` : f.name,
            isFolder: f.type === 'folder'
          }));
          setLines((prev) => [...prev, { type: 'ls', content: '', lsItems }]);
        }
        break;

      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentDir('/home');
        } else if (args[0] === '..') {
          const parent = currentDir.split('/').slice(0, -1).join('/') || '/';
          setCurrentDir(parent);
        } else if (args[0].startsWith('/')) {
          const node = getNodeByPath(args[0]);
          if (node && node.type === 'folder') {
            setCurrentDir(args[0]);
          } else {
            addOutput(`cd: ${args[0]}: No such directory`);
          }
        } else {
          const newPath = `${currentDir}/${args[0]}`.replace(/\/+/g, '/');
          const node = getNodeByPath(newPath);
          if (node && node.type === 'folder') {
            setCurrentDir(newPath);
          } else {
            addOutput(`cd: ${args[0]}: No such directory`);
          }
        }
        break;

      case 'pwd':
        addOutput(currentDir);
        break;

      case 'cat':
        if (!args[0]) {
          addOutput('cat: missing file operand');
        } else {
          const filePath = args[0].startsWith('/')
            ? args[0]
            : `${currentDir}/${args[0]}`.replace(/\/+/g, '/');
          const file = getNodeByPath(filePath);
          if (file && file.type === 'file') {
            addOutput(file.content || '(empty file)');
          } else {
            addOutput(`cat: ${args[0]}: No such file`);
          }
        }
        break;

      case 'notepad':
        if (!args[0]) {
          // Open a blank notepad window
          openWindow('notepad', 'Notepad');
        } else {
          const target = args[0];
          const filePath = target.startsWith('/')
            ? target
            : `${currentDir}/${target}`.replace(/\/+/g, '/');
          const file = getNodeByPath(filePath);
          if (file && file.type === 'file') {
            openWindow('notepad', file.name, undefined, file.id);
          } else {
            addOutput(`notepad: ${target}: No such file`);
          }
        }
        break;

      case 'mkdir':
        if (!args[0]) {
          addOutput('mkdir: missing operand');
        } else {
          const name = args[0];
          if (name.includes('/')) {
            addOutput('mkdir: nested paths not supported, create one folder at a time');
            break;
          }
          const existing = getChildren(currentDir).find(
            (n) => n.name === name && n.type === 'folder'
          );
          if (existing) {
            addOutput(`mkdir: cannot create directory '${name}': File exists`);
            break;
          }
          createFolder(currentDir, name);
        }
        break;

      case 'rm':
        if (!args[0]) {
          addOutput('rm: missing operand');
        } else {
          const target = args[0];
          const fullPath = target.startsWith('/')
            ? target
            : `${currentDir}/${target}`.replace(/\/+/g, '/');
          const node = getNodeByPath(fullPath);
          if (!node) {
            addOutput(`rm: cannot remove '${target}': No such file or directory`);
          } else {
            deleteNode(node.id);
          }
        }
        break;

      case 'clear':
        setLines([]);
        break;

      case 'neofetch': {
        addOutput('');

        const aymuAscii = [
          '                 @@               ',
          '               %@@@@              ',
          '              @@@@@@              ',
          '             @@@@@@@@             ',
          '           +@@@@  @@@             ',
          '          -@@@@  .@@@@            ',
          '          @@@@.    @@@            ',
          '         @@@@@ ..=@@@@@-.         ',
          '        @@@@@@@@%= .@@@%          ',
          '       #@@@@@@@#.   @@@@-         ',
          '      %@@@@@*        @@@@         ',
          '     .@@@@#          +@@@@        ',
          '     @@@@.            @@@@@.      ',
          '     %@%                +%@@%     ',
        ];

        const sysInfo = [
          'OS: AymuOS v0.1.0',
          'Host: Browser Runtime',
          'Kernel: Web Engine',
          `Uptime: ${Math.floor(performance.now() / 1000)}s`,
          'Shell: aymu-sh 1.0',
          `Resolution: ${window.innerWidth}x${window.innerHeight}`,
          'DE: AymuDE',
          'WM: AymuWM',
          'Terminal: AymuTerm',
          `CPU: ${navigator.hardwareConcurrency || 4} cores`,
          'Memory: Unlimited (Browser)'
        ];

        const gap = '   ';
        const asciiWidth = aymuAscii[0].length;
        const maxLines = Math.max(aymuAscii.length, sysInfo.length);

        for (let i = 0; i < maxLines; i++) {
          const left = aymuAscii[i] || ' '.repeat(asciiWidth);
          const right = sysInfo[i] || '';
          addOutput(left + gap + right);
        }

        addOutput('');
        break;
      }



      case 'echo': {
        const text = cmd.slice(5).trim(); // keeps spacing
        const cleaned = text.replace(/^["']|["']$/g, '');
        addOutput(cleaned);
        break;
      }

      case 'whoami':
        addOutput(currentUser?.username || 'user');
        break;

      case 'date':
        addOutput(new Date().toString());
        break;

      case 'tree': {
        const renderTree = (path: string, prefix = '') => {
          const children = getChildren(path);
          children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            addOutput(prefix + connector + child.name);
            if (child.type === 'folder') {
              renderTree(
                `${path}/${child.name}`.replace(/\/+/g, '/'),
                prefix + (isLast ? '    ' : '│   ')
              );
            }
          });
        };

        renderTree(currentDir);
        break;
      }

      case 'uname':
        if (args.includes('-a')) {
          addOutput('AymuOS WebKernel 1.0 Browser Runtime x86_64');
        } else {
          addOutput('AymuOS');
        }
        break;

      case 'uptime':
        addOutput(`up ${Math.floor(performance.now() / 1000)} seconds`);
        break;

      case 'history':
        commandHistory.forEach((cmd, i) => {
          addOutput(`${i + 1}  ${cmd}`);
        });
        break;

      case 'exit':
        useWindowStore.getState().closeWindow(windowId);
        break;

      default:
        addOutput(`${command}: command not found`);
        addOutput('Type "help" for available commands.');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      setCommandHistory((prev) => [...prev, currentInput]);
      setHistoryIndex(-1);
    }
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!currentInput.trim()) return;

      const parts = currentInput.split(' ');
      if (parts.length < 2) return;

      const command = parts[0];
      const rawArg = parts[parts.length - 1];

      // Only attempt path completion for common file/dir commands
      if (!['cd', 'cat', 'notepad'].includes(command)) return;

      let dirPath = currentDir;
      let partialName = rawArg;
      const isAbsolute = rawArg.startsWith('/');

      if (rawArg.includes('/')) {
        const lastSlash = rawArg.lastIndexOf('/');
        const baseDir = rawArg.slice(0, lastSlash) || '/';
        partialName = rawArg.slice(lastSlash + 1);
        dirPath = isAbsolute
          ? baseDir || '/'
          : `${currentDir}/${baseDir}`.replace(/\/+/g, '/');
      } else if (isAbsolute) {
        dirPath = '/';
        partialName = rawArg.slice(1);
      }

      const children = getChildren(dirPath);
      if (!children || children.length === 0) return;

      const matches = children.filter((item) =>
        item.name.toLowerCase().startsWith(partialName.toLowerCase())
      );
      if (matches.length === 0) return;

      const match = matches[0];

      const prefix =
        rawArg.includes('/')
          ? rawArg.slice(0, rawArg.lastIndexOf('/') + 1)
          : isAbsolute
            ? '/'
            : '';

      const completedArg = `${prefix}${match.name}`;

      const newInput = [...parts.slice(0, parts.length - 1), completedArg].join(
        ' '
      );
      setCurrentInput(newInput);
    }
  };

  const renderCommandLine = (content: string) => {
    const afterPrompt = content.split('$')[1] || '';
    const parts = afterPrompt.trim().split(' ');

    return (
      <span>
        <span className="terminal-green">{content.split('$')[0]}$</span>
        <span> </span>
        {parts.map((part, i) => {
          if (i === 0) {
            return <span key={i} className="text-amber-400">{part} </span>;
          } else if (part.startsWith('-')) {
            return <span key={i} className="text-indigo-300">{part} </span>;
          } else {
            return <span key={i} className="text-indigo-400">{part} </span>;
          }
        })}
      </span>
    );
  };

  return (
    <div
      className="h-full bg-neutral-900/80 backdrop-blur-xl p-4 overflow-auto cursor-text font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
      ref={scrollRef}
    >
      {/* Output Lines */}
      {lines.map((line, idx) => (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
          {line.type === 'input' ? (
            renderCommandLine(line.content)
          ) : line.type === 'ls' && line.lsItems ? (
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {line.lsItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {item.isFolder ? (
                    <Folder className="w-3.5 h-3.5 text-cyan-400/70" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-muted-foreground/70" />
                  )}
                  <span className={item.isFolder ? 'text-cyan-400' : 'text-terminal-white'}>
                    {item.name}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className={line.color || 'text-terminal-white'}>{line.content}</span>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex mt-1">
        <span className="terminal-green">{prompt} </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-amber-400 caret-primary pl-[10px]"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
