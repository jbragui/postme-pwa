self.addEventListener('install', (event) => {
    console.info('SW install');
});

self.addEventListener('activate', async (event) => {
    console.info('SW activate');
});

self.addEventListener('fetch', (event) => {
    console.info('SW fetch');
});