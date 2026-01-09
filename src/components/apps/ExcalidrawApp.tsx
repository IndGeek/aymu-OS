import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

export function ExcalidrawApp() {
    const url = 'https://excalidraw.com';
    const [isLoading, setIsLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">

            <div className="flex-1 relative overflow-hidden">
                {isLoading && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 z-10 origin-left"
                    />
                )}

                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full border-0 bg-black"
                    title="Photopea Content"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />
            </div>
        </div>
    );
}
