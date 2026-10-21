// Fusion des données entre le téléphone, le site web et le fichier du PC.
// Chaque opération a un "uid" stable et une date de modification "maj":
//  - même uid des deux côtés  -> on garde la version modifiée le plus récemment
//  - opération sans uid (données d'avant la synchro) -> reconnue par son contenu
//    (date + description + montant + source), pour ne pas créer de doublons
//  - suppressions -> gardées dans "supprimes" pour ne pas ressusciter une opération effacée
// Ce fichier sert à la fois au serveur Node (require) et à l'app (balise <script>, window.BlessedSync)
(function (root) {
const webCrypto = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues)
    ? globalThis.crypto
    : require('crypto').webcrypto;

const MAX_TOMBSTONES = 5000;

function newUid() {
    return [...webCrypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
}

function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function signature(item, kind) {
    if (kind === 'sorties') return `${item.date}|${norm(item.description)}|${item.montant}|${item.source}`;
    if (kind === 'entrees') return `${item.date}|${norm(item.source)}|${item.montant}|${item.destinataire}`;
    // transferts, dettes: toujours créés avec un uid, la signature ne sert qu'en secours
    return `${item.date}|${item.montant}|${norm(item.de || item.personne)}|${norm(item.vers || item.sens)}`;
}

function mergeList(stored, incoming, kind, dead) {
    const result = (stored || []).map(x => ({ ...x, uid: x.uid || newUid() }));
    const byUid = new Map(result.map((x, i) => [x.uid, i]));
    const bySig = new Map();
    result.forEach((x, i) => {
        const k = signature(x, kind);
        if (!bySig.has(k)) bySig.set(k, []);
        bySig.get(k).push(i);
    });
    const matched = new Set();
    let added = 0;

    for (const item of incoming || []) {
        if (item.uid && byUid.has(item.uid)) {
            const i = byUid.get(item.uid);
            matched.add(i);
            if ((item.maj || 0) > (result[i].maj || 0)) result[i] = { ...item, id: result[i].id };
            continue;
        }
        if (!item.uid) {
            // Ancienne opération: déjà présente de l'autre côté ? (une pour une, les doublons réels restent)
            const i = (bySig.get(signature(item, kind)) || []).find(j => !matched.has(j));
            if (i !== undefined) {
                matched.add(i);
                continue;
            }
        }
        result.push({ ...item, uid: item.uid || newUid() });
        matched.add(result.length - 1);
        added++;
    }

    const alive = result.filter(x => !(dead.has(x.uid) && dead.get(x.uid) >= (x.maj || 0)));

    // Les "id" servent à l'affichage (modifier / supprimer): ils doivent être uniques
    const seen = new Set();
    let next = Date.now();
    for (const x of alive) {
        if (x.id === undefined || x.id === null || seen.has(x.id)) {
            while (seen.has(next)) next++;
            x.id = next++;
        }
        seen.add(x.id);
    }
    return { list: alive, added, removed: result.length - alive.length };
}

function mergeData(stored, incoming) {
    stored = stored || {};
    incoming = incoming || {};

    const tombstones = new Map();
    for (const t of [...(stored.supprimes || []), ...(incoming.supprimes || [])]) {
        if (t && t.uid) tombstones.set(t.uid, Math.max(tombstones.get(t.uid) || 0, t.at || 0));
    }
    const supprimes = [...tombstones.entries()]
        .map(([uid, at]) => ({ uid, at }))
        .sort((a, b) => b.at - a.at)
        .slice(0, MAX_TOMBSTONES);

    const s = mergeList(stored.sorties, incoming.sorties, 'sorties', tombstones);
    const e = mergeList(stored.entrees, incoming.entrees, 'entrees', tombstones);
    const t = mergeList(stored.transferts, incoming.transferts, 'transferts', tombstones);
    const d = mergeList(stored.dettes, incoming.dettes, 'dettes', tombstones);

    // Soldes et planification: la version modifiée en dernier gagne (égalité -> le PC)
    const soldesFromIncoming = (incoming.majSoldes || 0) > (stored.majSoldes || 0);
    const planFromIncoming = (incoming.majPlan || 0) > (stored.majPlan || 0) || (!stored.plan && incoming.plan);
    // Réglages (comptes, prix de base): la version modifiée en dernier gagne
    const reglagesFromIncoming = (incoming.majReglages || 0) > (stored.majReglages || 0) || (!stored.reglages && incoming.reglages);

    const data = {
        sorties: s.list,
        entrees: e.list,
        transferts: t.list,
        dettes: d.list,
        reglages: (reglagesFromIncoming ? incoming.reglages : stored.reglages) || incoming.reglages,
        soldesInitiaux: (soldesFromIncoming ? incoming.soldesInitiaux : stored.soldesInitiaux) || incoming.soldesInitiaux || {},
        plan: (planFromIncoming ? incoming.plan : stored.plan) || incoming.plan,
        majSoldes: Math.max(stored.majSoldes || 0, incoming.majSoldes || 0),
        majPlan: Math.max(stored.majPlan || 0, incoming.majPlan || 0),
        majReglages: Math.max(stored.majReglages || 0, incoming.majReglages || 0),
        supprimes,
    };
    return {
        data,
        stats: { envoyees: s.added + e.added + t.added + d.added, supprimees: s.removed + e.removed + t.removed + d.removed }
    };
}

const api = { mergeData, signature };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.BlessedSync = api;
})(typeof window !== 'undefined' ? window : globalThis);
