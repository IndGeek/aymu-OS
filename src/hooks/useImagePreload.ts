import { useEffect } from 'react';

export function useImagePreload(imageUrls: string[]) {
    useEffect(() => {
        const images: HTMLImageElement[] = [];

        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            images.push(img);
        });

        // Cleanup function (optional, images will remain cached)
        return () => {
            images.forEach((img) => {
                img.src = '';
            });
        };
    }, [imageUrls]);
}

export function preloadImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
    });
}

export function preloadImages(imageUrls: string[]): Promise<void[]> {
    return Promise.all(imageUrls.map(preloadImage));
}
