import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'GymTracker',
        short_name: 'GymTracker',
        description: 'Track your workouts and progress',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b', // Match dark theme
        theme_color: '#09090b',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
