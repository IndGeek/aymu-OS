import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Gauge, Clock } from 'lucide-react';

interface MonitorAppProps {
  windowId: string;
}

export function MonitorApp({ windowId }: MonitorAppProps) {
  const [cpuUsage, setCpuUsage] = useState(Math.random() * 30 + 10);
  const [memoryUsage, setMemoryUsage] = useState(Math.random() * 40 + 20);
  const [uptime, setUptime] = useState(0);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const startTime = performance.now();
    
    const interval = setInterval(() => {
      setCpuUsage(Math.random() * 30 + 10); // will implement later with vm
      setMemoryUsage((prev) => Math.min(90, prev + (Math.random() - 0.5) * 5));
      setUptime(Math.floor((performance.now() - startTime) / 1000));
      setFps(Math.floor(55 + Math.random() * 10));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    percentage,
    color 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    unit: string;
    percentage?: number;
    color: string;
  }) => (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-medium">
            {value} <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
        </div>
      </div>
      {percentage !== undefined && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full p-4 overflow-auto">
      <h2 className="text-lg font-medium mb-4">System Monitor</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Cpu}
          label="CPU Usage"
          value={cpuUsage.toFixed(1)}
          unit="%"
          percentage={cpuUsage}
          color="bg-gradient-to-br from-cyan-500 to-blue-500"
        />
        
        <StatCard
          icon={HardDrive}
          label="Memory Usage"
          value={memoryUsage.toFixed(1)}
          unit="%"
          percentage={memoryUsage}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
        />
        
        <StatCard
          icon={Gauge}
          label="Frame Rate"
          value={fps}
          unit="FPS"
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
        
        <StatCard
          icon={Clock}
          label="Uptime"
          value={formatUptime(uptime)}
          unit=""
          color="bg-gradient-to-br from-orange-500 to-amber-500"
        />
      </div>

      <div className="mt-6 glass-panel p-4">
        <h3 className="text-sm font-medium mb-3">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform</span>
            <span>{navigator.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cores</span>
            <span>{navigator.hardwareConcurrency || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User Agent</span>
            <span className="truncate max-w-xs text-right">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Language</span>
            <span>{navigator.language}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Screen</span>
            <span>{window.screen.width}x{window.screen.height}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
