//Solo para PouchDB
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js');

const CACHE_NAME_CORE = 'cache-v1';
const CACHE_FILES_CORE = [
    'src/images/icons/icon-144x144.png',
    'src/css/app.css',
    'src/js/app.js',
    'src/js/db.js',
    'src/js/firebase.js',
    'index.html',
    'post.html',
    'src/images/computer.jpg',
    '/'
];

const CACHE_NAME_INMUTABLE = 'inmutable-v1';
const CACHE_FILES_INMUTABLE = [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v95/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'https://code.getmdl.io/1.3.0/material.brown-lime.min.css',
    'https://code.getmdl.io/1.3.0/material.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js'
];

const CACHE_NAME_DYNAMIC = 'dynamic-v1';

self.addEventListener('install', (event) => {
    const guardandoCache = caches.open(CACHE_NAME_CORE)
        .then(cache => {
            console.log(cache);
            return cache.addAll(CACHE_FILES_CORE);
        })
        .catch(error => console.log(error.message));

    const guardandoCacheInmutable = caches.open(CACHE_NAME_INMUTABLE)
        .then(cache => {
            console.log(cache);
            return cache.addAll(CACHE_FILES_INMUTABLE);
        })
        .catch(error => console.log(error.message));

    self.skipWaiting();
    event.waitUntil(Promise.all([guardandoCache, guardandoCacheInmutable]));

    console.info('SW install');
});

self.addEventListener('activate', async (event) => {
    //Eliminando caches obsoletos
    const obtenerCaches = caches.keys()
        .then(allCaches => allCaches.filter(cache => ![CACHE_NAME_CORE, CACHE_NAME_INMUTABLE, CACHE_NAME_DYNAMIC].includes(cache)).filter(cacheName => caches.delete(cacheName)))
        .catch(err => console.error(err.message))

    console.info('Cache limpiado exitosamente');
    event.waitUntil(obtenerCaches);

    console.info('SW activate');
});

self.addEventListener('fetch', (event) => {
    console.info('SW fetch');

    if (!(event.request.url.indexOf('http') === 0)) {
        return;
    }

    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    //Primera estrategia: solo caché
    //const soloCache = caches.match(event.request);
    //event.respondWith(soloCache);

    //Segunda estrategia: solo red
    //const soloRed = fetch(event.request);
    //event.respondWith(soloRed);

    //Tercera estrategia: caché pidiendo ayuda a la red
    //const cacheAyudaRed = caches.match(event.request).
    //    then(page => page || fetch(event.request));
    //event.respondWith(cacheAyudaRed);

    const cacheAyudaRed = caches.match(event.request)
        .then(page => page || fetch(event.request)
            .then(eventRequest => {
                return caches.open(CACHE_NAME_DYNAMIC).then(cache => {
                    if (![].concat(CACHE_FILES_CORE, CACHE_FILES_INMUTABLE).indexOf(event.request.url) || eventRequest.type === 'opaque') {
                        cache.put(event.request, eventRequest.clone());
                    }

                    return eventRequest;
                });
            }));
    event.respondWith(cacheAyudaRed);

    //Cuarta estrategia: red pidiendo ayuda al caché
    /*const respuesta = new Response('Esta es la parte que falló');

    const redAyudaCache = fetch(event.request)
        .then(page => page)
        .catch(murioInternet => {
            return caches.match(event.request)
                .then(archivoBuscado => archivoBuscado.status !== 200)
                .catch(archivo => respuesta);
        })
    event.respondWith(redAyudaCache);*/

    //Quinta estrategia: caché luego red
    /*const cacheLuegoRed = caches.open(CACHE_NAME_DYNAMIC)
        .then(cache => {
            return fetch(event.request)
                .then(response => {
                    if (![].concat(CACHE_FILES_CORE, CACHE_FILES_INMUTABLE).indexOf(event.request.url)) {
                        cache.put(event.request, response.clone());
                    }
                    
                    return response;
                })
        });
    event.respondWith(cacheLuegoRed);*/
});

self.addEventListener('sync', (event) => {
    console.info('SW sync');

    if (event.tag === 'new-post') {
        const urlRD = 'https://postme-app-4c696-default-rtdb.firebaseio.com/postme-app-4c696-default-rtdb.json';
        const dbPost = new PouchDB('posts');

        dbPost.allDocs({ include_docs: true })
            .then(docs => {
                docs.rows.forEach(registro => {
                    const doc = registro.doc;

                    fetch(urlRD, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(doc)
                    })
                        .then(response => {
                            console.info('Envio exitoso a firebase Real Time DB');
                            dbPost.remove(doc);
                        })
                        .catch(err => console.info(err.message));
                })
            })
    }
});

self.addEventListener('push', (event) => {
    console.info('SW push');
});

self.addEventListener('notificationclick', (event) => {
    console.info('SW notification click');

    const notification = event.notification;
    const action = event.action;

    if (action === 'confirm') {
        //Cualquier accion
        console.info('Se cerro y no se hace nada');
        notification.close();
    } else {
        notification.close();
    }
});

self.addEventListener('notificationclose', (event) => {
    console.info('SW notification close');
});
