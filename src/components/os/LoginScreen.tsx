import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import { useSystemStore, defaultUsers } from '@/stores/systemStore';
import { soundManager } from '@/lib/sounds';
import type { User } from '@/types/os';

export function LoginScreen() {
  const setSystemState = useSystemStore((state) => state.setSystemState);
  const setCurrentUser = useSystemStore((state) => state.setCurrentUser);

  const handleUserSelect = (user: User) => {
    soundManager.playTick();
    setCurrentUser(user);

    setTimeout(() => {
      soundManager.playLoginSuccess();
      setSystemState('desktop');
    }, 400);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-nebula flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <motion.div
          className="w-24 h-24 flex items-center justify-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img src="/icons/aymuos.png" alt="AYMUOS" className="w-full h-full object-contain" />
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="text-5xl font-light tracking-wider mb-2">
            <span className="font-semibold">AYMU</span>
            <span className="text-muted-foreground ml-2">OS</span>
          </h1>
          <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase">
            The Open source Operating System for the web
          </p>
        </motion.div>

        <motion.p
          className="text-lg text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Select User
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 w-80"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {defaultUsers.map((user, index) => (
            <motion.button
              key={user.id}
              className="user-card group"
              onClick={() => handleUserSelect(user)}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-full border border-border/50">
            ⚙ Original Distribution
          </span>
          <span className="px-2 py-1 rounded-full border border-primary/50 text-primary">
            ❤ AymuOS v0.1.0
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
