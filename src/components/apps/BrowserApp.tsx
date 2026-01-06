import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Home, RotateCw, Search, Globe, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrowserAppProps {
    windowId: string;
    fileId?: string;
}

export function BrowserApp({ windowId, fileId }: BrowserAppProps) {
    const homeUrl = 'https://www.google.com/webhp?igu=1';
    const [url, setUrl] = useState(homeUrl);
    const [displayUrl, setDisplayUrl] = useState('https://www.google.com');
    const [isLoading, setIsLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    useEffect(() => {
        const lastUrl = localStorage.getItem('browser-url');
        const lastDisplayUrl = localStorage.getItem('browser-display-url');

        if (lastUrl && lastDisplayUrl) {
            setUrl(lastUrl);
            setDisplayUrl(lastDisplayUrl);
        }
    }, []);

    const storeVisitedUrl = (newUrl: string, newDisplayUrl: string) => {
        localStorage.setItem('browser-url', newUrl);
        localStorage.setItem('browser-display-url', newDisplayUrl);
    };

    const refreshBrowser = () => {
        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = iframeRef.current.src;
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const goToHome = () => {
        setUrl(homeUrl);
        setDisplayUrl('https://www.google.com');
        storeVisitedUrl(homeUrl, 'https://www.google.com');
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let newUrl = (e.target as HTMLInputElement).value.trim();

            if (newUrl.length === 0) return;

            if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = 'https://' + newUrl;
            }

            const encodedUrl = encodeURI(newUrl);
            let finalUrl = encodedUrl;
            let finalDisplayUrl = encodedUrl;

            if (newUrl.includes('google.com')) {
                finalUrl = homeUrl;
                finalDisplayUrl = 'https://www.google.com';
            }

            setUrl(finalUrl);
            setDisplayUrl(finalDisplayUrl);
            storeVisitedUrl(finalUrl, finalDisplayUrl);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500);

            (e.target as HTMLInputElement).blur();
        }
    };

    const handleDisplayUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayUrl(e.target.value);
    };

    const isSecure = displayUrl.startsWith('https://');

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-black/30 backdrop-blur-xl">
                <div className="flex items-center gap-1">
                    {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.history.back()}
                        disabled={!canGoBack}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Go back"
                    >
                        <ChevronLeft className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.history.forward()}
                        disabled={!canGoForward}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Go forward"
                    >
                        <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                    </motion.button> */}

                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={refreshBrowser}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                        title="Refresh"
                    >
                        <RotateCw className={`w-4 h-4 text-white/70 group-hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToHome}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                        title="Home"
                    >
                        <Home className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                    </motion.button>
                </div>

                <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity" />
                    <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all">
                        {isSecure ? (
                            <Lock className="w-4 h-4 text-green-400 shrink-0" />
                        ) : (
                            <Globe className="w-4 h-4 text-white/50 shrink-0" />
                        )}

                        <input
                            type="text"
                            value={displayUrl}
                            onChange={handleDisplayUrlChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search or enter website name"
                            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 selection:bg-blue-500/30"
                            spellCheck={false}
                            autoComplete="off"
                        />

                        <Search className="w-4 h-4 text-white/40 shrink-0" />
                    </div>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {isLoading && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-10 origin-left"
                    />
                )}

                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full border-0 bg-white"
                    title="Browser Content"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />
            </div>
        </div>
    );
}
