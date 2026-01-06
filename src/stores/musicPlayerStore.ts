import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Song {
  id: string;
  name: string;
  path: string;
  duration?: number;
}

interface MusicPlayerStore {
  // Playlist
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  
  // Current playback
  currentSong: Song | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  
  // Recently played
  recentlyPlayed: Song[];
  
  // Actions
  setCurrentSong: (song: Song | null, index?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  addToRecentlyPlayed: (song: Song) => void;
}

export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set, get) => ({
      songs: [],
      currentSong: null,
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      volume: 0.7,
      recentlyPlayed: [],
      
      setSongs: (songs) => set({ songs }),
      
      setCurrentSong: (song, index) => {
        if (song) {
          set({ 
            currentSong: song, 
            currentIndex: index ?? get().songs.findIndex(s => s.id === song.id),
            currentTime: 0,
          });
          get().addToRecentlyPlayed(song);
        } else {
          set({ currentSong: null, currentIndex: -1, currentTime: 0 });
        }
      },
      
      play: () => set({ isPlaying: true }),
      
      pause: () => set({ isPlaying: false }),
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      next: () => {
        const { songs, currentIndex } = get();
        if (songs.length === 0) return;
        const nextIndex = (currentIndex + 1) % songs.length;
        get().setCurrentSong(songs[nextIndex], nextIndex);
        get().play();
      },
      
      previous: () => {
        const { songs, currentIndex } = get();
        if (songs.length === 0) return;
        const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
        get().setCurrentSong(songs[prevIndex], prevIndex);
        get().play();
      },
      
      setCurrentTime: (time) => set({ currentTime: time }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      addToRecentlyPlayed: (song) => {
        const { recentlyPlayed } = get();
        const filtered = recentlyPlayed.filter(s => s.id !== song.id);
        const updated = [song, ...filtered].slice(0, 50); // Keep last 50
        set({ recentlyPlayed: updated });
      },
    }),
    {
      name: 'aymu-os-music-player',
      partialize: (state) => ({ 
        volume: state.volume,
        recentlyPlayed: state.recentlyPlayed,
      }),
    }
  )
);

