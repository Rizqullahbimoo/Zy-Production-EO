import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/login.jsx',
                'resources/js/register.jsx',
                'resources/js/admin-dashboard.jsx',
                'resources/js/home.jsx',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    esbuild: {
        // Use React 17+ automatic JSX runtime — no plugin needed, no version conflict
        jsx: 'automatic',
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
