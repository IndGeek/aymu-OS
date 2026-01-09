import { useState, useEffect, useRef } from 'react';
import { Music, ListMusic, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useMusicPlayerStore, type Song } from '@/stores/musicPlayerStore';
import { useFileStore } from '@/stores/fileStore';
import { Slider } from '@/components/ui/slider';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { motion } from 'framer-motion';

interface MusicPlayerAppProps {
  windowId: string;
  fileId?: string;
}

type ViewMode = 'all' | 'recent';

export function MusicPlayerApp({ windowId, fileId }: MusicPlayerAppProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [audioFiles, setAudioFiles] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getNodeById = useFileStore((state) => state.getNodeById);

  const {
    songs,
    setSongs,
    currentSong,
    currentIndex,
    isPlaying,
    currentTime,
    volume,
    recentlyPlayed,
    setCurrentSong,
    play,
    pause,
    togglePlay,
    next,
    previous,
    setCurrentTime,
    setVolume,
  } = useMusicPlayerStore();

  // Scan music directory on mount
  useEffect(() => {
    const scanMusicFiles = async () => {
      try {
        const allSongs: Song[] = [];

        // Try to fetch old music manifest file (for backward compatibility)
        try {
          const response = await fetch('/musics/music-manifest.json');
          if (response.ok) {
            const manifest = await response.json();
            if (manifest.songs && Array.isArray(manifest.songs)) {
              allSongs.push(...manifest.songs);
            }
          }
        } catch (error) {
          console.log('Old music manifest not found, continuing...');
        }

        // Try to fetch new static music manifest
        try {
          const response = await fetch('/static/file-system-seed.manifest.json');
          if (response.ok) {
            const manifest = await response.json();
            if (manifest.songs && Array.isArray(manifest.songs)) {
              // Convert manifest format to Song format
              const staticSongs: Song[] = manifest.songs.map((song: any) => ({
                id: `static-${song.id}`,
                name: song.name,
                path: song.path.replace('./', '/static/'),
              }));
              allSongs.push(...staticSongs);
            }
          }
        } catch (error) {
          console.log('Static music manifest not found, continuing...');
        }

        // If we found songs, use them
        if (allSongs.length > 0) {
          setAudioFiles(allSongs);
          setSongs(allSongs);
          return;
        }

        // Fallback: Use known music files
        const knownFiles: Song[] = [
          {
            id: '1',
            name: 'In The Glow of Our Love',
            path: '/musics/In The Glow of Our Love - SFoura (Official Music).mp3',
          },
          {
            id: "2",
            name: "Unstoppable",
            path: "/musics/Unstoppable.mp3"
          }
        ];

        setAudioFiles(knownFiles);
        setSongs(knownFiles);
      } catch (error) {
        console.error('Error scanning music files:', error);
        // Fallback on error
        const knownFiles: Song[] = [
          {
            id: '1',
            name: 'In The Glow of Our Love',
            path: '/musics/In The Glow of Our Love - SFoura (Official Music).mp3',
          },
          {
            id: '2',
            name: 'Unstoppable',
            path: '/musics/Unstoppable.mp3'
          }
        ];
        setAudioFiles(knownFiles);
        setSongs(knownFiles);
      }
    };

    scanMusicFiles();
  }, [setSongs]);

  // Handle fileId - when opened from Finder with a specific music file
  useEffect(() => {
    if (fileId && songs.length > 0) {
      // Get the file node from the file store
      const fileNode = getNodeById(fileId);
      if (fileNode && fileNode.content) {
        // The content field stores the public path to the music file
        const musicPath = fileNode.content;

        // Find the song in our songs list that matches this path
        const songToPlay = songs.find(song => song.path === musicPath);

        if (songToPlay) {
          const index = songs.findIndex(s => s.id === songToPlay.id);
          setCurrentSong(songToPlay, index);
          play();
        }
      }
    }
  }, [fileId, songs, getNodeById, setCurrentSong, play]);


  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        next();
      });

      audio.addEventListener('loadedmetadata', () => {
        if (currentSong) {
          // Update song duration if available
          const updatedSongs = songs.map(s =>
            s.id === currentSong.id
              ? { ...s, duration: audio.duration }
              : s
          );
          setSongs(updatedSongs);
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.path;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    } else if (audioRef.current && !currentSong) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [currentSong, isPlaying]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSongClick = (song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    setCurrentSong(song, index);
    play();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDuration = () => {
    if (!audioRef.current) return 0;
    return audioRef.current.duration || 0;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const displayedSongs = viewMode === 'all' ? songs : recentlyPlayed;

  return (
    <div className="h-full flex flex-col text-sm">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/5 p-3 flex flex-col gap-4 shrink-0" style={{ background: 'rgba(20, 20, 20, 0.6)' }}>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Library</p>
            <div className="flex flex-col gap-0.5">
              <button
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${viewMode === 'all'
                  ? 'bg-primary/20 text-foreground'
                  : 'text-foreground/90 hover:bg-muted/50'
                  }`}
                onClick={() => setViewMode('all')}
              >
                <ListMusic className="w-4 h-4" />
                <span>All Songs</span>
              </button>
              <div className="divider pt-4"></div>
              <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Favorites</p>
              <button
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${viewMode === 'recent'
                  ? 'bg-primary/20 text-foreground'
                  : 'text-foreground/80 hover:bg-muted/50'
                  }`}
                onClick={() => setViewMode('recent')}
              >
                <Music className="w-4 h-4" />
                <span>Recently Played</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            {displayedSongs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {viewMode === 'all' ? 'No songs found' : 'No recently played songs'}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {displayedSongs.map((song, index) => (
                  <button
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${currentSong?.id === song.id
                      ? 'bg-neutral-500/40 text-primary'
                      : 'bg-muted-foreground/10 hover:bg-muted/50 text-secondary'
                      }`}
                    onClick={() => handleSongClick(song)}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${currentSong?.id === song.id ? 'bg-primary/60' : 'bg-neutral-500/20'}`}>
                      <Music className={`w-5 h-5 ${currentSong?.id === song.id ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-white">{song.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {song.duration ? formatTime(song.duration) : ''}
                      </div>
                    </div>
                    {currentSong?.id === song.id && isPlaying && (
                      <div className="shrink-0">
                        <AudioVisualizer />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Bar */}
      {currentSong && (
        <div className="relative" style={{ background: 'rgba(20, 20, 20, 0.8)' }}>
          {/* Progress Bar at Top */}
          <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer">
            <SliderPrimitive.Root
              value={[currentTime]}
              max={getDuration() || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="relative flex w-full touch-none select-none items-center h-1"
            >
              <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden bg-transparent">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none" />
            </SliderPrimitive.Root>
          </div>

          {/* Player Content */}
          <div className="h-20 p-3 flex items-center gap-4 pt-4">
            {/* Song Info with Visualizer */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {isPlaying ? <AudioVisualizer /> : <Music className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{currentSong.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(getDuration())}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={previous}
                disabled={songs.length === 0}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                className="p-3 rounded-lg bg-primary text-white hover:brightness-110 transition-all"
                onClick={togglePlay}
                disabled={!currentSong}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={next}
                disabled={songs.length === 0}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <button
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              >
                {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <SliderPrimitive.Root
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted/50">
                  <SliderPrimitive.Range className="absolute h-full bg-foreground/60" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-foreground/60 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
              </SliderPrimitive.Root>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Audio Visualizer Component (3 bars)
function AudioVisualizer() {
  const [heights, setHeights] = useState([30, 50, 40]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate audio visualization with random heights
      setHeights([
        Math.random() * 40 + 20,
        Math.random() * 60 + 30,
        Math.random() * 50 + 25,
      ]);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-1 h-6">
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 bg-primary rounded-full"
          style={{ height: `${height}%` }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.15 }}
        />
      ))}
    </div>
  );
}

