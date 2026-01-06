import { useState } from 'react';
import { Delete } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

interface CalculatorAppProps {
  windowId: string;
}

export function CalculatorApp({ windowId }: CalculatorAppProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    soundManager.playTick();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    soundManager.playTick();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    soundManager.playTick();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    soundManager.playTick();
    setDisplay(String(-parseFloat(display)));
  };

  const inputPercent = () => {
    soundManager.playTick();
    setDisplay(String(parseFloat(display) / 100));
  };

  const performOperation = (nextOperation: string) => {
    soundManager.playTick();
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    soundManager.playTick();
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = previousValue / inputValue;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const Button = ({ 
    children, 
    onClick, 
    className = '',
    wide = false 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    wide?: boolean;
  }) => (
    <button
      className={`h-14 rounded-xl font-medium text-xl transition-all hover:brightness-110 active:scale-95 ${
        wide ? 'col-span-2' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col p-4 bg-card/50">
      {/* Display */}
      <div className="flex-1 flex items-end justify-end p-4">
        <span className="text-5xl font-light truncate">
          {display}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={clear} className="bg-muted text-foreground">AC</Button>
        <Button onClick={toggleSign} className="bg-muted text-foreground">±</Button>
        <Button onClick={inputPercent} className="bg-muted text-foreground">%</Button>
        <Button onClick={() => performOperation('÷')} className="bg-primary text-white">÷</Button>

        <Button onClick={() => inputDigit('7')} className="bg-muted/50 text-foreground">7</Button>
        <Button onClick={() => inputDigit('8')} className="bg-muted/50 text-foreground">8</Button>
        <Button onClick={() => inputDigit('9')} className="bg-muted/50 text-foreground">9</Button>
        <Button onClick={() => performOperation('×')} className="bg-primary text-white">×</Button>

        <Button onClick={() => inputDigit('4')} className="bg-muted/50 text-foreground">4</Button>
        <Button onClick={() => inputDigit('5')} className="bg-muted/50 text-foreground">5</Button>
        <Button onClick={() => inputDigit('6')} className="bg-muted/50 text-foreground">6</Button>
        <Button onClick={() => performOperation('-')} className="bg-primary text-white">−</Button>

        <Button onClick={() => inputDigit('1')} className="bg-muted/50 text-foreground">1</Button>
        <Button onClick={() => inputDigit('2')} className="bg-muted/50 text-foreground">2</Button>
        <Button onClick={() => inputDigit('3')} className="bg-muted/50 text-foreground">3</Button>
        <Button onClick={() => performOperation('+')} className="bg-primary text-white">+</Button>

        <Button onClick={() => inputDigit('0')} className="bg-muted/50 text-foreground" wide>0</Button>
        <Button onClick={inputDot} className="bg-muted/50 text-foreground">.</Button>
        <Button onClick={calculate} className="bg-primary text-white">=</Button>
      </div>
    </div>
  );
}
