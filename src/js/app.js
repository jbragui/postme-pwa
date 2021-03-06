/* Declaracion de variables globales */
let MAIN;
let MODAL_POST;
let BTN_SHOW_POST;
let BTN_CANCEL_POST;
let deferredPrompt;
let TITLE;
let DESCRIPTION;
let DB_POUCH;

// Funciones
const showPostModal = () => {
    MAIN.style.display = 'none';
    MODAL_POST.style.display = 'block';
    setTimeout(() => {
        MODAL_POST.style.transform = 'translateY(0)';
    }, 1);
};
const closePostModal = () => {
    MAIN.style.display = 'block';
    MODAL_POST.style.transform = 'translateY(100vh)';
};

const sendData = async (e) => {
    try {
        e.preventDefault();
        TITLE = document.querySelector('#title').value;
        DESCRIPTION = document.querySelector('#description').value;

        if (TITLE && DESCRIPTION) {
            console.log('Pasa validacion de datos');

            const post = {
                title: TITLE,
                description: DESCRIPTION
            };

            //Vamos a utilizar el SyncManager
            if (window.SyncManager) {
                //Grabar o armar nuestra logica
                const readySw = await navigator.serviceWorker.ready;
                await readySw.sync.register('new-post');
                post._id = new Date().toISOString();
                const registroAlmacenado = await DB_POUCH.put(post);
            } else {
                post.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('posts').add(post);
            }

            const data = {
                message: 'Registro exitoso',
                timeout: 1500
            };

            Message().MaterialSnackbar.showSnackbar(data);
        } else {
            const data = {
                message: 'Faltan campos por llenar',
                timeout: 1500
            };

            Message('error').MaterialSnackbar.showSnackbar(data);
        }
    } catch (error) {
        console.log('Error try catch');

        const data = {
            message: error.message,
            timeout: 1500
        };

        Message('error').MaterialSnackbar.showSnackbar(data);
    }

    //console.log('hola');
};

const requestPermission = async () => {
    const result = await Notification.requestPermission();
    if (result !== 'granted') {
        const data = {
            message: 'El usuario no activo las notificaciones',
            timeout: 1500
        };

        Message('error').MaterialSnackbar.showSnackbar(data);
    } else {
        //configuracionSubscription();
        showNotification();
    }
};

const showNotification = () => {
    navigator.serviceWorker.getRegistration()
        .then(instancia => {
            instancia.showNotification('Notificaciones exitosamente activadas', {
                body: 'El cuerpo de la notif',
                icon: 'src/images/icons/icon-144x144.png',
                image: 'src/images/computer.jpg',
                badge: 'src/images/icons/icon-144x144.png',
                dir: 'ltr',
                tag: 'notification-postme',
                requireInteraction: true,
                vibrate: [100, 50, 200],
                actions: [
                    { action: 'confirm', title: 'Aceptar', icon: 'src/images/icons/icon-144x144.png' },
                    { action: 'cancel', title: 'Cancelar', icon: 'src/images/icons/icon-144x144.png' }
                ]
            });
        })
        .catch(err => console.info(err.message));
};

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
})

// Cuando se cargue todo nuestro DOM
window.addEventListener('load', async () => {
    try {
        //Instancia de BD creada con PouchDB
        DB_POUCH = new PouchDB('posts');

        MAIN = document.querySelector('#main');
        MODAL_POST = document.querySelector('#modal-post-section');
        BTN_SHOW_POST = document.querySelector('#btn-upload-post');
        BTN_SHOW_POST.addEventListener('click', showPostModal);
        BTN_CANCEL_POST = document.querySelector('#btn-post-cancel');
        BTN_CANCEL_POST.addEventListener('click', closePostModal)

        //await Notification.requestPermission();

        if ('serviceWorker' in navigator) {
            const response = await navigator.serviceWorker.register('sw.js');
            /*if (response) {
                console.info('Service worker registrado');
                const ready = await navigator.serviceWorker.ready;
                ready.showNotification('Hola  curso-pwa', {
                    body: 'mensaje',
                    vibrate: [200, 100, 200, 100, 200, 100, 200]
                });
            }*/
        }

        window.Message = (option = 'success', container = document.querySelector('#toast-container')) => {
            container.classList.remove('success');
            container.classList.remove('error');
            container.classList.add(option);
            return container;
        }

        window.Loading = (option = 'block') => {
            document.querySelector('#loading').style.display = option;
        };

        //Loading();

        //Agarrando el boton enviar post
        const btnPostSubmit = document.querySelector('#btn-post-submit');
        btnPostSubmit.addEventListener('click', (e) => sendData(e));

        const bannerInstall = document.querySelector('#banner-install');
        bannerInstall.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const response = await deferredPrompt.userChoice;
                if (response.outcome === 'dismissed') {
                    console.error('El usuario cancelo la instalacion');
                }
            }
        });

        //Llamada al bot?n para activar notificaciones
        const btnActivateNotifications = document.querySelector('#banner-notifications');
        btnActivateNotifications.addEventListener('click', async () => {
            requestPermission();
        });
    } catch (error) {
        const data = {
            message: error.message,
            timeout: 5000
        };

        Message('error').MaterialSnackbar.showSnackbar(data);
    }
});