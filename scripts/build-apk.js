// Génère BlessedMoney.apk avec les données à jour du PC:
//   1. copie la page web et ses fichiers dans www/
//   2. copie data.json (les données du compte principal) dans l'APK
//   3. npx cap sync android, puis gradlew assembleDebug
// Usage: npm run apk
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const WEB_FILES = ['index.html', 'manifest.json', 'sw.js', 'icon.svg', 'DancingScript.ttf'];

fs.mkdirSync(www, { recursive: true });
for (const file of WEB_FILES) {
    fs.copyFileSync(path.join(root, file), path.join(www, file));
}

const data = JSON.parse(fs.readFileSync(path.join(root, 'data.json'), 'utf8').replace(/^\uFEFF/, ''));
fs.writeFileSync(path.join(www, 'data.json'), JSON.stringify(data), 'utf8');
console.log(`📦 Données embarquées: ${data.sorties.length} dépenses, ${data.entrees.length} revenus`);

const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit', env: process.env });

if (!process.env.JAVA_HOME) {
    const studioJdk = 'C:\\Program Files\\Android\\Android Studio\\jbr';
    if (fs.existsSync(studioJdk)) process.env.JAVA_HOME = studioJdk;
}

run('npx cap sync android');
const androidDir = path.join(root, 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run(`"${gradlew}" assembleDebug`, androidDir);

console.log('');
console.log('✅ APK prêt: android/app/build/outputs/apk/debug/BlessedMoney.apk');
console.log('   Installe-le PAR-DESSUS l\'app existante (sans la désinstaller) pour garder tes données.');
