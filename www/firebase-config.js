// Configuration Firebase du projet "money-manager-app".
// Ces valeurs ne sont pas secrètes (elles sont faites pour être dans l'app): la protection
// des données vient des règles Firestore (voir firestore.rules).
window.FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDIUqLcZ_zLuvte30_n-MWE7-e_D1sM0og',
    authDomain: 'money-manager-app-3d130.firebaseapp.com',
    projectId: 'money-manager-app-3d130',
    storageBucket: 'money-manager-app-3d130.firebasestorage.app',
    messagingSenderId: '436988601416',
    appId: '1:436988601416:web:5b8e72f87e12e15cca647d',
};

// Compte principal (blessed): administrateur dès le premier démarrage
window.FIREBASE_ADMIN_UID = 'P1oF3qxA6KOq7mwm1pUTtkbVgMo2';

// Les noms d'utilisateur deviennent des adresses techniques (jamais affichées, aucun mail envoyé)
window.FIREBASE_EMAIL_DOMAIN = 'blessed-money.app';
