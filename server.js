const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { mergeData } = require('./sync');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const DATA_DIR = path.join(__dirname, 'donnees');
const BACKUP_DIR = path.join(__dirname, 'backups');
const USERS_FILE = path.join(__dirname, 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const REFERENCE_FILE = path.join(__dirname, 'reference.json');
const MAX_BODY = 20 * 1024 * 1024;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf'
};

// Seuls ces fichiers sont publics: data.json, users.json et backups/ ne doivent jamais être servis
const PUBLIC_FILES = ['/index.html', '/manifest.json', '/sw.js', '/icon.svg', '/DancingScript.ttf'];

// ===== Utilisateurs =====
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}

// Empreinte vérifiable par l'app hors ligne (PBKDF2, disponible dans le navigateur du téléphone):
// elle est embarquée dans l'APK pour que les testeurs se connectent sans jamais joindre le PC
const OFFLINE_ITERATIONS = 150000;
function offlineVerifier(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), OFFLINE_ITERATIONS, 32, 'sha256').toString('hex');
    return { salt, hash, iterations: OFFLINE_ITERATIONS };
}

function credentials(password) {
    return { ...hashPassword(password), offline: offlineVerifier(password) };
}

function checkPassword(user, password) {
    const { hash } = hashPassword(password, user.salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'));
}

function readJson(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
    } catch (e) {
        return fallback;
    }
}

function loadUsers() {
    const users = readJson(USERS_FILE, null);
    if (users && Array.isArray(users.users) && users.users.length) return users;
    // Premier démarrage: compte par défaut blessed / blessed
    const created = { users: [{ username: 'blessed', role: 'admin', primary: true, createdAt: new Date().toISOString(), ...credentials('blessed') }] };
    fs.writeFileSync(USERS_FILE, JSON.stringify(created, null, 4), 'utf8');
    console.log('👤 Compte par défaut créé: blessed / blessed');
    return created;
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
}

// Les sessions survivent au redémarrage du serveur (le téléphone reste connecté)
const sessions = new Map(Object.entries(readJson(SESSIONS_FILE, {})));
function saveSessions() {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(Object.fromEntries(sessions), null, 4), 'utf8');
}

// Le compte principal (blessed à l'origine) garde data.json même s'il change de nom
function isPrimary(user) {
    return user.primary === true || (user.primary === undefined && user.username === 'blessed');
}

function dataFileFor(user) {
    if (isPrimary(user)) return DATA_FILE;
    return path.join(DATA_DIR, `${user.dataId || user.username}.json`);
}

function getSessionUser(req) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const session = token && sessions.get(token);
    if (!session) return null;
    const user = loadUsers().users.find(u => u.username === session.username);
    return user ? { username: user.username, role: user.role, primary: isPrimary(user), user, token } : null;
}

// ===== Outils HTTP =====
function sendJson(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > MAX_BODY) {
                reject(new Error('Données trop volumineuses'));
                req.destroy();
            }
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

async function handleApi(req, res, url) {
    const route = url.pathname;

    if (route === '/api/login' && req.method === 'POST') {
        const { username, password } = JSON.parse(await readBody(req) || '{}');
        const name = String(username || '').trim().toLowerCase();
        const user = loadUsers().users.find(u => u.username === name);
        if (!user || !checkPassword(user, String(password || ''))) {
            return sendJson(res, 401, { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        if (!user.offline) {
            const all = loadUsers();
            const stored = all.users.find(u => u.username === user.username);
            stored.offline = offlineVerifier(String(password));
            saveUsers(all);
        }
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, { username: user.username, createdAt: new Date().toISOString() });
        saveSessions();
        console.log(`🔑 Connexion: ${user.username}`);
        return sendJson(res, 200, { success: true, token, username: user.username, role: user.role, primary: isPrimary(user) });
    }

    const me = getSessionUser(req);
    if (!me) return sendJson(res, 401, { success: false, error: 'Non connecté' });

    if (route === '/api/me' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, username: me.username, role: me.role, primary: me.primary });
    }

    // ===== Mon compte: changer son nom d'utilisateur et/ou son mot de passe =====
    if (route === '/api/account' && req.method === 'POST') {
        const { currentPassword, newUsername, newPassword } = JSON.parse(await readBody(req) || '{}');
        const users = loadUsers();
        const user = users.users.find(u => u.username === me.username);
        if (!checkPassword(user, String(currentPassword || ''))) {
            return sendJson(res, 403, { success: false, error: 'Mot de passe actuel incorrect' });
        }
        const name = String(newUsername || user.username).trim().toLowerCase();
        if (!USERNAME_RE.test(name)) {
            return sendJson(res, 400, { success: false, error: "Nom d'utilisateur: 3 à 30 caractères (lettres, chiffres, . _ -)" });
        }
        if (name !== user.username && users.users.some(u => u.username === name)) {
            return sendJson(res, 409, { success: false, error: "Ce nom d'utilisateur existe déjà" });
        }
        if (newPassword !== undefined && newPassword !== '' && String(newPassword).length < 4) {
            return sendJson(res, 400, { success: false, error: 'Nouveau mot de passe: 4 caractères minimum' });
        }
        const oldName = user.username;
        if (name !== oldName) {
            // Les données restent dans le même fichier malgré le changement de nom
            if (!isPrimary(user) && !user.dataId) user.dataId = oldName;
            if (user.primary === undefined) user.primary = isPrimary({ ...user, username: oldName });
            user.username = name;
            for (const s of sessions.values()) if (s.username === oldName) s.username = name;
            saveSessions();
        }
        if (newPassword) Object.assign(user, credentials(String(newPassword)));
        saveUsers(users);
        console.log(`👤 Compte modifié: ${oldName}${name !== oldName ? ` → ${name}` : ''}${newPassword ? ' (nouveau mot de passe)' : ''}`);
        return sendJson(res, 200, { success: true, username: user.username, role: user.role, primary: isPrimary(user) });
    }

    if (route === '/api/logout' && req.method === 'POST') {
        sessions.delete(me.token);
        saveSessions();
        return sendJson(res, 200, { success: true });
    }

    if (route === '/api/load' && req.method === 'GET') {
        const file = dataFileFor(me.user);
        const data = readJson(file, { sorties: [], entrees: [], soldesInitiaux: {} });
        return sendJson(res, 200, data);
    }

    if (route === '/api/save' && req.method === 'POST') {
        const body = await readBody(req);
        const data = JSON.parse(body);
        const file = dataFileFor(me.user);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        // Envoi depuis le téléphone: garder une copie horodatée, on ne perd jamais rien
        if (url.searchParams.get('source') === 'phone') {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            fs.writeFileSync(path.join(BACKUP_DIR, `phone-${me.username}-${stamp}.json`), body, 'utf8');
            console.log(`📱 Reçu du téléphone (${me.username}): ${(data.sorties || []).length} sorties, ${(data.entrees || []).length} entrées`);
        }
        // Fusion avec ce qui est déjà sur le PC (autre appareil, site web...) au lieu d'écraser
        const { data: merged, stats } = mergeData(readJson(file, null), data);
        fs.writeFileSync(file, JSON.stringify(merged, null, 4), 'utf8');
        if (stats.envoyees || stats.supprimees) console.log(`🔄 Synchro (${me.username}): +${stats.envoyees} opération(s), -${stats.supprimees}`);
        return sendJson(res, 200, { success: true, message: 'Données synchronisées!', data: merged, stats });
    }

    // ===== Repères partagés: moyennes et prix habituels calculés depuis les données de l'admin =====
    // (aucun nom, aucun revenu: seulement des moyennes par catégorie et des prix d'articles courants)
    if (route === '/api/reference' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, reference: readJson(REFERENCE_FILE, null) });
    }

    if (route === '/api/reference' && req.method === 'POST') {
        if (me.role !== 'admin') return sendJson(res, 403, { success: false, error: 'Réservé à l\'administrateur' });
        const reference = JSON.parse(await readBody(req));
        fs.writeFileSync(REFERENCE_FILE, JSON.stringify({ ...reference, updatedAt: new Date().toISOString() }, null, 4), 'utf8');
        return sendJson(res, 200, { success: true });
    }

    // ===== Gestion des utilisateurs (admin) =====
    if (route.startsWith('/api/users')) {
        if (me.role !== 'admin') return sendJson(res, 403, { success: false, error: 'Réservé à l\'administrateur' });
        const users = loadUsers();

        if (route === '/api/users' && req.method === 'GET') {
            return sendJson(res, 200, {
                success: true,
                users: users.users.map(u => ({ username: u.username, role: u.role, primary: isPrimary(u), createdAt: u.createdAt }))
            });
        }

        if (route === '/api/users' && req.method === 'POST') {
            const { username, password } = JSON.parse(await readBody(req) || '{}');
            const name = String(username || '').trim().toLowerCase();
            if (!USERNAME_RE.test(name)) {
                return sendJson(res, 400, { success: false, error: 'Nom d\'utilisateur: 3 à 30 caractères (lettres, chiffres, . _ -)' });
            }
            if (String(password || '').length < 4) {
                return sendJson(res, 400, { success: false, error: 'Mot de passe: 4 caractères minimum' });
            }
            if (users.users.some(u => u.username === name)) {
                return sendJson(res, 409, { success: false, error: 'Ce nom d\'utilisateur existe déjà' });
            }
            users.users.push({ username: name, role: 'user', dataId: name, createdAt: new Date().toISOString(), ...credentials(String(password)) });
            saveUsers(users);
            console.log(`👤 Utilisateur créé: ${name}`);
            return sendJson(res, 200, { success: true, username: name });
        }

        const match = route.match(/^\/api\/users\/([^/]+)(\/password)?$/);
        const target = match && users.users.find(u => u.username === decodeURIComponent(match[1]));
        if (match && !target) return sendJson(res, 404, { success: false, error: 'Utilisateur introuvable' });

        // Nouveau mot de passe choisi par l'admin (l'ancien ne peut pas être affiché: il est haché)
        if (match && match[2] && req.method === 'POST') {
            const { password } = JSON.parse(await readBody(req) || '{}');
            if (String(password || '').length < 4) return sendJson(res, 400, { success: false, error: 'Mot de passe: 4 caractères minimum' });
            Object.assign(target, credentials(String(password)));
            saveUsers(users);
            // L'ancien mot de passe ne doit plus ouvrir de session
            for (const [token, s] of sessions) if (s.username === target.username && token !== me.token) sessions.delete(token);
            saveSessions();
            console.log(`🔑 Nouveau mot de passe pour ${target.username}`);
            return sendJson(res, 200, { success: true });
        }

        if (match && !match[2] && req.method === 'DELETE') {
            if (isPrimary(target) || target.username === me.username) return sendJson(res, 400, { success: false, error: 'Ce compte ne peut pas être supprimé' });
            users.users = users.users.filter(u => u !== target);
            saveUsers(users);
            for (const [token, s] of sessions) if (s.username === target.username) sessions.delete(token);
            saveSessions();
            // Ses données: une dernière copie dans backups/, puis suppression
            const file = dataFileFor(target);
            if (fs.existsSync(file)) {
                fs.mkdirSync(BACKUP_DIR, { recursive: true });
                const stamp = new Date().toISOString().replace(/[:.]/g, '-');
                fs.copyFileSync(file, path.join(BACKUP_DIR, `supprime-${target.username}-${stamp}.json`));
                fs.unlinkSync(file);
            }
            console.log(`🗑️ Utilisateur supprimé avec ses données: ${target.username}`);
            return sendJson(res, 200, { success: true });
        }
    }

    return sendJson(res, 404, { success: false, error: 'Route inconnue' });
}

const server = http.createServer(async (req, res) => {
    // CORS: l'app Android (https://localhost) appelle ce serveur via le Wi-Fi
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
        try {
            await handleApi(req, res, url);
        } catch (error) {
            sendJson(res, 500, { success: false, error: error.message });
        }
        return;
    }

    // Servir les fichiers statiques (liste blanche)
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!PUBLIC_FILES.includes(filePath)) {
        res.writeHead(404);
        res.end('Fichier non trouvé');
        return;
    }

    fs.readFile(path.join(__dirname, filePath), (err, content) => {
        if (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500);
            res.end(err.code === 'ENOENT' ? 'Fichier non trouvé' : 'Erreur serveur');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'text/plain' });
        res.end(content);
    });
});

loadUsers();

server.listen(PORT, () => {
    console.log('');
    console.log('🌸 ════════════════════════════════════════════ 🌸');
    console.log('        Blessed Money - Serveur Démarré!');
    console.log('🌸 ════════════════════════════════════════════ 🌸');
    console.log('');
    console.log(`   📍 Ouvre: http://localhost:${PORT}`);
    Object.values(os.networkInterfaces()).flat()
        .filter(i => i && i.family === 'IPv4' && !i.internal)
        .forEach(i => console.log(`   📱 Depuis le téléphone: http://${i.address}:${PORT}`));
    console.log('');
    console.log('   🔑 Connexion par défaut: blessed / blessed');
    console.log('   ⏹️  Appuie sur Ctrl+C pour arrêter');
    console.log('');
});
