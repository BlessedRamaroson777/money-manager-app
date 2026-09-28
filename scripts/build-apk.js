// Génère l'APK Blessed Money.
//
//   npm run apk            -> ton téléphone: tes données à jour + l'adresse du PC pour la synchro
//   npm run apk:testeurs   -> pour les testeurs (même à l'autre bout du monde): AUCUNE donnée personnelle,
//                             pas de compte admin, pas d'adresse du PC; les comptes créés sur le web
//                             sont embarqués et marchent hors ligne
//
// Dans les deux cas: les comptes (empreinte PBKDF2, jamais le mot de passe) et les repères sont embarqués.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const TESTEURS = process.argv.includes('--testeurs');
const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const WEB_FILES = ['index.html', 'manifest.json', 'sw.js', 'icon.svg', 'DancingScript.ttf'];
const readJson = (file, fallback) => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch (e) { return fallback; }
};
const writeWww = (name, value) => fs.writeFileSync(path.join(www, name), JSON.stringify(value), 'utf8');

console.log(TESTEURS ? '🧪 APK pour les testeurs' : '📱 APK pour ton téléphone');

fs.mkdirSync(www, { recursive: true });
for (const file of WEB_FILES) {
    fs.copyFileSync(path.join(root, file), path.join(www, file));
}

// ----- Données du compte principal -----
if (TESTEURS) {
    writeWww('data.json', { sorties: [], entrees: [] });
    console.log('🔒 Aucune donnée personnelle embarquée');
} else {
    const data = readJson(path.join(root, 'data.json'), { sorties: [], entrees: [] });
    writeWww('data.json', data);
    console.log(`📦 Données embarquées: ${data.sorties.length} dépenses, ${data.entrees.length} revenus`);
}

// ----- Adresse du PC (seulement pour ton téléphone, sur le même Wi-Fi) -----
const pcFile = path.join(www, 'pc.json');
if (fs.existsSync(pcFile)) fs.unlinkSync(pcFile);
if (!TESTEURS) {
    const lanIp = Object.values(os.networkInterfaces()).flat()
        .find(i => i && i.family === 'IPv4' && !i.internal && /^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))/.test(i.address));
    if (lanIp) {
        const pcUrl = `http://${lanIp.address}:${process.env.PORT || 3000}`;
        writeWww('pc.json', { pcUrl });
        console.log(`📡 Adresse du PC embarquée: ${pcUrl}`);
    }
}

// ----- Comptes utilisables hors ligne -----
const users = readJson(path.join(root, 'users.json'), { users: [] }).users || [];
const isPrimary = u => u.primary === true || (u.primary === undefined && u.username === 'blessed');
const eligible = users.filter(u => !TESTEURS || (!isPrimary(u) && u.role !== 'admin'));
const accounts = eligible
    .filter(u => u.offline)
    .map(u => ({ username: u.username, role: u.role, primary: isPrimary(u), offline: u.offline }));
writeWww('accounts.json', { mode: TESTEURS ? 'testeurs' : 'perso', accounts });
console.log(`👥 Comptes embarqués: ${accounts.map(a => a.username).join(', ') || 'aucun'}`);
const missing = eligible.filter(u => !u.offline).map(u => u.username);
if (missing.length) {
    console.log(`⚠️  Pas encore utilisables hors ligne: ${missing.join(', ')}`);
    console.log('    -> sur le site web, page Utilisateurs: "Nouveau mot de passe" (ou connecte-toi une fois avec ce compte), puis relance la commande.');
}

// ----- Repères pour les nouveaux utilisateurs -----
const reference = readJson(path.join(root, 'reference.json'), null);
if (reference) {
    writeWww('reference.json', reference);
    console.log(`📊 Repères embarqués (${reference.items.length} prix habituels)`);
}

// ----- Build -----
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit', env: process.env });
if (!process.env.JAVA_HOME) {
    const studioJdk = 'C:\\Program Files\\Android\\Android Studio\\jbr';
    if (fs.existsSync(studioJdk)) process.env.JAVA_HOME = studioJdk;
}
run('npx cap sync android');
const androidDir = path.join(root, 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run(`"${gradlew}" assembleDebug`, androidDir);

const built = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'BlessedMoney.apk');
console.log('');
if (TESTEURS) {
    const out = path.join(root, 'apk', 'BlessedMoney-testeurs.apk');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(built, out);
    console.log('✅ APK testeurs prêt: apk/BlessedMoney-testeurs.apk');
    console.log('   À envoyer aux testeurs avec leurs identifiants (page Utilisateurs du site web).');
} else {
    console.log('✅ APK prêt: android/app/build/outputs/apk/debug/BlessedMoney.apk');
    console.log('   Installe-le PAR-DESSUS l\'app existante (sans la désinstaller) pour garder tes données.');
}
// Remettre www/ comme pour ton téléphone (les données personnelles ne restent pas vides dans le projet)
if (TESTEURS) {
    writeWww('data.json', readJson(path.join(root, 'data.json'), { sorties: [], entrees: [] }));
}
