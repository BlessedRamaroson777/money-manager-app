// Regroupe le SDK Firebase en un seul fichier (firebase-sdk.js) chargé par index.html.
// Lancé automatiquement par "npm start" et "npm run apk".
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const out = path.join(root, 'firebase-sdk.js');
const entry = path.join(root, 'firebase', 'entry.js');

function buildFirebase() {
    // Déjà à jour: rien à faire (démarrage plus rapide)
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(entry).mtimeMs) return;
    require('esbuild').buildSync({
        entryPoints: [entry],
        bundle: true,
        format: 'iife',
        minify: true,
        target: ['chrome90'],
        outfile: out,
        legalComments: 'none',
    });
    console.log(`🔥 SDK Firebase regroupé: firebase-sdk.js (${Math.round(fs.statSync(out).size / 1024)} Ko)`);
}

buildFirebase();
module.exports = buildFirebase;
