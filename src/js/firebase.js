var firebaseConfig = {
    apiKey: "AIzaSyD6v-0F5hXZnrOWgE5V5AYjwXFcL7cvz5o",
    authDomain: "postme-app-4c696.firebaseapp.com",
    projectId: "postme-app-4c696",
    storageBucket: "postme-app-4c696.appspot.com",
    messagingSenderId: "836475511381",
    appId: "1:836475511381:web:0683dd6376aa20be202adc",
    measurementId: "G-FELXGZPWGD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

var db = firebase.firestore();

dayjs.extend(window.dayjs_plugin_relativeTime);
const locale = {
    name: 'es',
    monthsShort: 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_'),
    weekdays: 'domingo_lunes_martes_miercoles_jueves_viernes_sabado'.split('_'),
    weekdaysShort: 'dom._lun._mar._mie._jue._vie._sab.'.split('_'),
    weekdaysMin: 'do_lu_ma_mi_ju_vi_sa'.split('_'),
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Setiembre_Octubre_Noviembre_Diciembre'.split('_'),
    weekStart: 1,
    formats: {
        LT: 'H:mm',
        LTS: 'H:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D de MMMM de YYYY',
        LLL: 'D de MMMM de YYYY H:mm',
        LLLL: 'dddd, D de MMMM de YYYY H:mm'
    },
    relativeTime: {
        future: 'en %s',
        past: 'hace %s',
        s: 'unos segundos',
        m: 'un minuto',
        mm: '%d minutos',
        h: 'una hora',
        hh: '%d horas',
        d: 'un dia',
        dd: '%d dias',
        M: 'un mes',
        MM: '%d meses',
        y: 'un año',
        yy: '%d años'
    },
    ordinal: (n) => `${n}°`
};

dayjs.locale(locale, null, true);
dayjs.locale('es');
