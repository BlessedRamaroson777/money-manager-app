const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API pour sauvegarder les données
    if (req.url.split('?')[0] === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // Envoi depuis le téléphone: garder une copie horodatée, on ne perd jamais rien
                if (req.url.includes('source=phone')) {
                    fs.mkdirSync(BACKUP_DIR, { recursive: true });
                    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
                    fs.writeFileSync(path.join(BACKUP_DIR, `phone-${stamp}.json`), body, 'utf8');
                    console.log(`📱 Reçu du téléphone: ${(data.sorties || []).length} sorties, ${(data.entrees || []).length} entrées`);
                }
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Données sauvegardées!' }));
                console.log('✅ data.json mis à jour');
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // API pour charger les données
    if (req.url === '/api/load' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // Servir les fichiers statiques
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath.split('?')[0]);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Fichier non trouvé');
            } else {
                res.writeHead(500);
                res.end('Erreur serveur');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('🌟 ════════════════════════════════════════════ 🌟');
    console.log('   💰 Mon Porte-Monnaie - Serveur Démarré! 💰');
    console.log('🌟 ════════════════════════════════════════════ 🌟');
    console.log('');
    console.log(`   📍 Ouvre: http://localhost:${PORT}`);
    Object.values(os.networkInterfaces()).flat()
        .filter(i => i && i.family === 'IPv4' && !i.internal)
        .forEach(i => console.log(`   📱 Depuis le téléphone: http://${i.address}:${PORT}`));
    console.log('');
    console.log('   ✅ Les modifications seront sauvegardées dans data.json');
    console.log('   ⏹️  Appuie sur Ctrl+C pour arrêter');
    console.log('');
});
