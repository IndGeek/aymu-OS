import { AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/stores/systemStore';
import { BootScreen } from '@/components/os/BootScreen';
import { LoginScreen } from '@/components/os/LoginScreen';
import { Desktop } from '@/components/os/Desktop';

const Index = () => {
  const systemState = useSystemStore((state) => state.systemState);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {systemState === 'booting' && <BootScreen key="boot" />}
        {systemState === 'login' && <LoginScreen key="login" />}
        {systemState === 'desktop' && <Desktop key="desktop" />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
