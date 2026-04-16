import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ParcoursMindMap, { INIT_NODES as P_INIT_NODES, INIT_EDGES as P_INIT_EDGES } from "./ParcoursMindMap.jsx";
import WeeklyPlanning from "./WeeklyPlanning.jsx";
import WorkflowMindMap from "./WorkflowMindMap.jsx";

const PAL = ['#f5c540','#4ade80','#20c997','#4b5ce8','#e85555','#38bdf8','#a855f7','#f97316'];

// ── Workflow GINA ─────────────────────────────────────────────────
const GINA_INIT_NODES = [
  { id:'gn_start', x:1100, y:80,  w:340, h:56,
    text:'RDV agenda GEORGIA · 2162162\nMotif : 1ère consult. chir. derma', color:'#3a1a6e', fs:11 },
  { id:'gn_msg1', x:1100, y:200, w:310, h:52,
    text:'📤 MSG : "11111 derma → chir ?"\nAllow reply = OUI', color:'#4b5ce8', fs:11 },
  { id:'gn_q', x:1100, y:330, w:220, h:44,
    text:'Réponse reçue ?', color:'#f5c540', fs:13 },
  { id:'gn_nr', x:350, y:450, w:210, h:44,
    text:'❌ Pas de réponse', color:'#64748b', fs:12 },
  { id:'gn_elig', x:350, y:570, w:290, h:66,
    text:'Éligible ?\n• CMU ou AME\n• OU <22 ans hors 75 / 92200 / 92300', color:'#f97316', fs:10 },
  { id:'gn_non_e', x:130, y:710, w:170, h:44,
    text:'NON éligible\n→ attendre', color:'#475569', fs:10 },
  { id:'gn_oui_e', x:480, y:710, w:160, h:44,
    text:'OUI éligible\n→ NO REPLY', color:'#e85555', fs:11 },
  { id:'gn_delai', x:480, y:830, w:240, h:82,
    text:'Délai NO REPLY :\n< 24h → après 4h\n24–48h → après 6h\n48–72h → après 12h\n> 72h → après 48h', color:'#e85555', fs:9 },
  { id:'gn_nr_act', x:480, y:980, w:260, h:72,
    text:'1. MSG "11111 NO REPLY chir"\n   Allow reply = NON\n2. Bloquer fiche patient\n3. Annuler le RDV\n4. ✅ Marquer traitée', color:'#c0392b', fs:9 },
  { id:'gn_rep', x:1700, y:450, w:210, h:44,
    text:'✅ Réponse reçue', color:'#20c997', fs:12 },
  { id:'gn_class', x:1700, y:570, w:210, h:44,
    text:'Classifier la réponse', color:'#20c997', fs:12 },
  { id:'gn_chir', x:880, y:720, w:160, h:44,
    text:'CHIRURGIE', color:'#a855f7', fs:13 },
  { id:'gn_c_cmu', x:640, y:860, w:215, h:64,
    text:'CMU →\n"AAchir Cmu lesion\nbenigne insiste chir"\nAllow reply = OUI', color:'#a855f7', fs:9 },
  { id:'gn_c_ame', x:870, y:860, w:215, h:64,
    text:'AME →\n"AAAME chir avertissement\ndépassement"\nAllow reply = OUI', color:'#a855f7', fs:9 },
  { id:'gn_c_norm', x:1110, y:860, w:230, h:64,
    text:'NON CMU/AME →\nTransférer vers agenda\nChir Derm 2205691\nmême jour / heure', color:'#a855f7', fs:9 },
  { id:'gn_c_annul', x:755, y:990, w:240, h:44,
    text:'CMU/AME refuse → annuler RDV', color:'#e85555', fs:9 },
  { id:'gn_dm', x:1580, y:720, w:150, h:44,
    text:'DERMATO', color:'#38bdf8', fs:13 },
  { id:'gn_dm_etr', x:1430, y:860, w:170, h:44,
    text:'Étranger\n→ SKIP, rien faire', color:'#475569', fs:10 },
  { id:'gn_dm_noetr', x:1650, y:860, w:170, h:44,
    text:'NON étranger', color:'#38bdf8', fs:12 },
  { id:'gn_dm_act', x:1650, y:975, w:270, h:72,
    text:'1. MSG "11111 REPLY erreur RDV\n   CHIR + Annulation GINA"\n   Allow reply = NON\n2. Annuler le RDV', color:'#38bdf8', fs:9 },
  { id:'gn_dm_cmu', x:1490, y:1110, w:220, h:44,
    text:'CMU/AME → bloquer patient\n(demandes + prise RDV)', color:'#e85555', fs:9 },
  { id:'gn_dm_noc', x:1760, y:1110, w:190, h:44,
    text:'NON CMU/AME\n→ pas de blocage', color:'#20c997', fs:9 },
  { id:'gn_amb', x:2010, y:720, w:150, h:44,
    text:'AMBIGU', color:'#64748b', fs:13 },
  { id:'gn_amb_act', x:2010, y:860, w:240, h:56,
    text:'Ne pas répondre\n→ Ajouter tableau ambigus\n(décision manuelle)', color:'#475569', fs:9 },
  { id:'gn_rule', x:1100, y:1230, w:360, h:44,
    text:'✅ Toujours marquer "Traitée" après traitement', color:'#20c997', fs:10 },
];
const GINA_INIT_EDGES = [
  { id:'ge01', from:'gn_start',    to:'gn_msg1' },
  { id:'ge02', from:'gn_msg1',     to:'gn_q' },
  { id:'ge03', from:'gn_q',        to:'gn_nr' },
  { id:'ge04', from:'gn_q',        to:'gn_rep' },
  { id:'ge05', from:'gn_nr',       to:'gn_elig' },
  { id:'ge06', from:'gn_elig',     to:'gn_non_e' },
  { id:'ge07', from:'gn_elig',     to:'gn_oui_e' },
  { id:'ge08', from:'gn_oui_e',    to:'gn_delai' },
  { id:'ge09', from:'gn_delai',    to:'gn_nr_act' },
  { id:'ge10', from:'gn_rep',      to:'gn_class' },
  { id:'ge11', from:'gn_class',    to:'gn_chir' },
  { id:'ge12', from:'gn_class',    to:'gn_dm' },
  { id:'ge13', from:'gn_class',    to:'gn_amb' },
  { id:'ge14', from:'gn_chir',     to:'gn_c_cmu' },
  { id:'ge15', from:'gn_chir',     to:'gn_c_ame' },
  { id:'ge16', from:'gn_chir',     to:'gn_c_norm' },
  { id:'ge17', from:'gn_c_cmu',    to:'gn_c_annul' },
  { id:'ge18', from:'gn_c_ame',    to:'gn_c_annul' },
  { id:'ge19', from:'gn_dm',       to:'gn_dm_etr' },
  { id:'ge20', from:'gn_dm',       to:'gn_dm_noetr' },
  { id:'ge21', from:'gn_dm_noetr', to:'gn_dm_act' },
  { id:'ge22', from:'gn_dm_act',   to:'gn_dm_cmu' },
  { id:'ge23', from:'gn_dm_act',   to:'gn_dm_noc' },
  { id:'ge24', from:'gn_amb',      to:'gn_amb_act' },
];
let UID = 10;
const gid = () => `n${UID++}`;

const save = async (d) => {
  try {
    await fetch('/api/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
  } catch {}
};
const loadSaved = async () => {
  try {
    const r = await fetch('/api/board');
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
};

const INIT_NODES = [
  // ── MISSIONS hub ──
  { id:'missions', x:1150, y:720, w:210, h:52, text:'MISSIONS mikamomo', color:'#1e2a4a', fs:13 },

  // ── Maison Abeille yellow cluster ──
  { id:'ma',         x:700, y:680, w:160, h:44, text:'Maison Abeille',              color:'#f5c540', fs:13 },
  { id:'site_chir',  x:180, y:370, w:240, h:42, text:'SITE CHIRURGIE DERMATOLOGIQUE', color:'#f5c540', fs:10 },
  { id:'site_dermo', x:160, y:450, w:170, h:40, text:'SITE DERMOSCAN',              color:'#f5c540', fs:11 },
  { id:'site_skin',  x:160, y:530, w:170, h:40, text:'SITE SKINLASER',              color:'#f5c540', fs:11 },
  { id:'arbo',       x:180, y:630, w:210, h:42, text:'ARBORESCENCE DE RDV',         color:'#f5c540', fs:11 },
  { id:'contacts',   x:600, y:370, w:300, h:100,
    text:'contact@maisonabeille.com voir IA\nmaisonabeilleparis@gmail.com\nmaisonabelledoctolib@gmail.com\nWhatsApp 0780971111',
    color:'#f5c540', fs:10 },
  { id:'site_ma',    x:430, y:520, w:200, h:40, text:'SITE MAISON ABEILLE',         color:'#f5c540', fs:11 },
  { id:'data',       x:960, y:540, w:190, h:40, text:'VALORISER LA DATA',           color:'#f5c540', fs:11 },

  // ── Green ──
  { id:'reseaux', x:1150, y:400, w:180, h:44, text:'RÉSEAUX SOCIAUX', color:'#20c997', fs:12 },

  // ── Red ──
  { id:'justice', x:380, y:830, w:220, h:44, text:'dossier doctolib justice', color:'#e85555', fs:11 },

  // ── Teal ──
  { id:'ampa', x:700, y:900, w:190, h:42, text:'SITE ASSO AMPA', color:'#20c997', fs:11 },

  // ── Light blue cluster (bottom) ──
  { id:'american',  x:850, y:960, w:160, h:42, text:'American',                color:'#60aaee', fs:12 },
  { id:'bot_ia',    x:900, y:1040, w:240, h:42, text:'BOT IA GMAIL WHATSAPP',  color:'#60aaee', fs:11 },
  { id:'gagenda',   x:540, y:1120, w:190, h:42, text:'GOOGLE AGENDA',          color:'#60aaee', fs:11 },
  { id:'calendly',  x:900, y:1130, w:160, h:42, text:'CALENDLY',               color:'#60aaee', fs:12 },
  { id:'auto_doct', x:260, y:1140, w:240, h:42, text:'AUTOMATISATION DOCTOLIB', color:'#60aaee', fs:10 },

  // ── WORKFLOWS cluster ──
  { id:'workflows', x:1680, y:720, w:240, h:50, text:'WORKFLOWS MAISON ABEILLE', color:'#3a1a6e', fs:12 },

  { id:'apicrypt',       x:1780, y:290, w:280, h:56,
    text:'APICRYPT DOCTOLIB — ENVOI MSG RÉSULTATS AVEC FICHIER ANAPATH', color:'#3a1a6e', fs:9 },
  { id:'install_api',    x:1400, y:410, w:160, h:42, text:'installe apicrypt', color:'#3a1a6e', fs:11 },
  { id:'benin',          x:1720, y:410, w:110, h:42, text:'BENIN',             color:'#3a1a6e', fs:12 },
  { id:'malin',          x:1880, y:410, w:110, h:42, text:'MALIN',             color:'#3a1a6e', fs:12 },
  { id:'doctolib_visio', x:2160, y:400, w:250, h:50,
    text:'DOCTOLIB — ENVOI MSG POUR PRENDRE RDV VISIO', color:'#3a1a6e', fs:9 },
  { id:'scraper',        x:1880, y:550, w:280, h:64,
    text:'SCRAPER TOUS LES RÉSULTATS POUR ÉDUQUER CLAUDE ENTRE BENIN ET MALIN', color:'#3a1a6e', fs:9 },
  { id:'seloquer',       x:2260, y:570, w:190, h:44, text:'a éduquer le fichier', color:'#3a1a6e', fs:11 },

  { id:'remise',         x:1490, y:630, w:250, h:48,
    text:'REMISE DES RÉSULTATS ANAPATH', color:'#3a1a6e', fs:11 },
  { id:'mails_chir',     x:2030, y:640, w:280, h:54,
    text:'ENVOYER MAILS À TOUS LES CHIRURGIENS SI LISTING DE RDV', color:'#3a1a6e', fs:9 },
  { id:'avis_google',    x:2030, y:730, w:260, h:50,
    text:'GESTION DES AVIS GOOGLE ET BLOCAGE DOCTOLIB', color:'#3a1a6e', fs:9 },
  { id:'sheet_url',      x:2390, y:700, w:280, h:44,
    text:'docs.google.com/spreadsheets/…', color:'#3a1a6e', fs:9 },
  { id:'drive_excel',    x:2390, y:790, w:220, h:44, text:'CRÉER AUTRE DRIVE EXCELL', color:'#3a1a6e', fs:10 },

  { id:'inventaire',     x:1490, y:830, w:160, h:46, text:'INVENTAIRE',       color:'#3a1a6e', fs:13 },
  { id:'amazon',         x:1900, y:830, w:160, h:46, text:'AMAZON',           color:'#3a1a6e', fs:13 },
  { id:'auto_cmd',       x:1620, y:930, w:250, h:50,
    text:'automatiser COMMANDES CONSOMMABLES', color:'#3a1a6e', fs:10 },
  { id:'pennylane',      x:2210, y:900, w:220, h:46, text:'PENNYLANE PAIEMENT', color:'#3a1a6e', fs:12 },
  { id:'fournisseurs',   x:1900, y:990, w:180, h:44, text:'FOURNISSEURS',       color:'#3a1a6e', fs:12 },

  { id:'raniellopoulou', x:1150, y:880, w:280, h:56,
    text:'DR KANELLOPOULOU : ENVOI MESSAGES DOCTOLIB AVANT LES RDV', color:'#3a1a6e', fs:9 },
  { id:'ecrire_cond',    x:1150, y:970, w:200, h:44, text:'écrire les conditions', color:'#3a1a6e', fs:11 },
  { id:'esign',          x:1550, y:1040, w:220, h:46, text:'E-SIGNATURE DES DEVIS', color:'#3a1a6e', fs:12 },
  { id:'lovable_url',    x:1920, y:1080, w:340, h:44,
    text:'https://specfiles-brass-richardson-encoding.trycloudflare.com/', color:'#3a1a6e', fs:8 },
  { id:'nepting',        x:1200, y:1070, w:260, h:46,
    text:'NEPTING RAPPROCHEMENT EXCELL', color:'#3a1a6e', fs:10 },
  { id:'rabah',          x:1200, y:1170, w:280, h:54,
    text:'RABAH APPELER POUR SÉPARER LAGACHE 0613012642', color:'#3a1a6e', fs:9 },
  { id:'lano',           x:1550, y:1130, w:260, h:46,
    text:'LABO REPORTER DEPUIS MEDIPATH', color:'#3a1a6e', fs:10 },
  { id:'msg_doct',       x:1920, y:1170, w:230, h:46,
    text:'ENVOYER MESSAGE DANS DOCTOLIB', color:'#3a1a6e', fs:10 },
];

const INIT_EDGES = [
  // MISSIONS hub
  { id:'e1',  from:'missions', to:'ma' },
  { id:'e3',  from:'missions', to:'reseaux' },
  { id:'e4',  from:'missions', to:'workflows' },
  { id:'e5',  from:'missions', to:'justice' },
  { id:'e6',  from:'missions', to:'ampa' },
  { id:'e7',  from:'missions', to:'american' },
  { id:'e8',  from:'ma',       to:'data' },

  // Maison Abeille yellow cluster
  { id:'e10', from:'ma', to:'site_chir' },
  { id:'e11', from:'ma', to:'site_dermo' },
  { id:'e12', from:'ma', to:'site_skin' },
  { id:'e13', from:'ma', to:'arbo' },
  { id:'e14', from:'ma', to:'contacts' },
  { id:'e15', from:'ma', to:'site_ma' },

  // American / BOT / automation cluster
  { id:'e20', from:'american', to:'bot_ia' },
  { id:'e21', from:'bot_ia',   to:'calendly' },
  { id:'e22', from:'calendly', to:'gagenda' },
  { id:'e24', from:'gagenda',  to:'auto_doct' },

  // Workflows cluster
  { id:'e30', from:'workflows',    to:'apicrypt' },
  { id:'e31', from:'apicrypt',     to:'install_api' },
  { id:'e32', from:'apicrypt',     to:'benin' },
  { id:'e33', from:'apicrypt',     to:'malin' },
  { id:'e34', from:'malin',        to:'doctolib_visio' },
  { id:'e35', from:'benin',        to:'scraper' },
  { id:'e36', from:'malin',        to:'scraper' },
  { id:'e37', from:'scraper',      to:'seloquer' },
  { id:'e38', from:'doctolib_visio', to:'seloquer' },
  { id:'e39', from:'workflows',    to:'remise' },
  { id:'e40', from:'workflows',    to:'mails_chir' },
  { id:'e41', from:'workflows',    to:'avis_google' },
  { id:'e42', from:'avis_google',  to:'sheet_url' },
  { id:'e43', from:'sheet_url',    to:'drive_excel' },
  { id:'e44', from:'workflows',    to:'inventaire' },
  { id:'e45', from:'inventaire',   to:'amazon' },
  { id:'e46', from:'inventaire',   to:'auto_cmd' },
  { id:'e47', from:'amazon',       to:'pennylane' },
  { id:'e48', from:'auto_cmd',     to:'fournisseurs' },
  { id:'e49', from:'workflows',    to:'raniellopoulou' },
  { id:'e50', from:'raniellopoulou', to:'ecrire_cond' },
  { id:'e51', from:'workflows',    to:'esign' },
  { id:'e52', from:'esign',        to:'lovable_url' },
  { id:'e53', from:'workflows',    to:'nepting' },
  { id:'e54', from:'nepting',      to:'rabah' },
  { id:'e55', from:'workflows',    to:'lano' },
  { id:'e56', from:'lano',         to:'msg_doct' },
  { id:'e57', from:'remise',       to:'mails_chir' },
];

function fitToNodes(nds, rect) {
  if (!nds?.length || !rect?.width || !rect?.height) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nds) {
    minX = Math.min(minX, n.x - n.w / 2);
    minY = Math.min(minY, n.y - n.h / 2);
    maxX = Math.max(maxX, n.x + n.w / 2);
    maxY = Math.max(maxY, n.y + n.h / 2);
  }
  if (!isFinite(minX)) return null;
  const pad = Math.max(maxX - minX, maxY - minY) * 0.1;
  const cW = maxX - minX + pad * 2, cH = maxY - minY + pad * 2;
  const aspect = rect.width / rect.height;
  let fW, fH;
  if (cW / cH > aspect) { fW = cW; fH = cW / aspect; }
  else                   { fH = cH; fW = cH * aspect; }
  return { x: (minX + maxX) / 2 - fW / 2, y: (minY + maxY) / 2 - fH / 2, w: fW, h: fH };
}

// Construit la chaîne de descendants (from→to) à partir d'un nœud
function buildDescChain(nodeId, edges, nodes, cursorW) {
  const chain = new Set([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const eg of edges) {
      if (chain.has(eg.from) && !chain.has(eg.to)) { chain.add(eg.to); changed = true; }
    }
  }
  const offsets = {};
  for (const id of chain) {
    const n = nodes.find(n => n.id === id);
    if (n) offsets[id] = { ox: cursorW.x - n.x, oy: cursorW.y - n.y };
  }
  return { chain, offsets };
}

function borderPt(n, tx, ty) {
  const dx = tx - n.x, dy = ty - n.y;
  if (!dx && !dy) return { x: n.x, y: n.y };
  const hw = n.w/2 + 1, hh = n.h/2 + 1;
  const tX = dx ? hw/Math.abs(dx) : Infinity;
  const tY = dy ? hh/Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: n.x + dx*t, y: n.y + dy*t };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [nodes, setNodes] = useState(INIT_NODES);
  const [edges, setEdges] = useState(INIT_EDGES);
  const [dark, setDark]   = useState(false);
  const [mode, setMode]   = useState('select');
  const [sel, setSel]     = useState(null);
  const [selAll, setSelAll] = useState(false);
  const [sliderFs, setSliderFs] = useState(0);
  const [sliderW,  setSliderW]  = useState(0);
  const [sliderH,  setSliderH]  = useState(0);
  const baseNodesRef = useRef(null);
  const [selEdge, setSelEdge] = useState(null);
  const [edgeColor, setEdgeColor] = useState('#888888');
  const [conn, setConn]   = useState(null);
  const [connDrag, setConnDrag] = useState(null); // { fromId, x, y } preview ligne pendant drag
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('mindmap');
  const [syncFs, setSyncFs] = useState(true);
  const [planningCells, setPlanningCells] = useState({});
  const [ginaData,      setGinaData]      = useState(null);
  const [clipboard,     setClipboard]     = useState([]); // partagé entre tous les onglets
  const [triggerEditIdP, setTriggerEditIdP] = useState(null); // déclencheur édition Parcours MA
  const [multiSel, setMultiSel] = useState(new Set());
  const [rectDraw, setRectDraw] = useState(null);

  // ── État Parcours MA ──
  const [pNodes,    setPNodes]    = useState(P_INIT_NODES);
  const [pEdges,    setPEdges]    = useState(P_INIT_EDGES);
  const [pMode,     setPMode]     = useState('select');
  const [pConn,     setPConn]     = useState(null);
  const [pSelAll,   setPSelAll]   = useState(false);
  const [pSliderFs, setPSliderFs] = useState(0);
  const [pSliderW,  setPSliderW]  = useState(0);
  const [pSliderH,  setPSliderH]  = useState(0);
  const pBaseNodesRef = useRef(null);
  const pNodesRef = useRef(pNodes);
  const [pViewBox,   setPViewBox]   = useState({ x: -60, y: -10, w: 2620, h: 1380 });
  const [pSel,       setPSel]       = useState(null);
  const [pMultiSel,  setPMultiSel]  = useState(new Set());
  const [pRectDraw,  setPRectDraw]  = useState(null);
  const pWrapRef    = useRef(null);
  const pViewBoxRef = useRef({ x: -60, y: -10, w: 2620, h: 1380 });
  const pRectSelRef = useRef(null);

  // ── Undo / Redo ──
  const undoRef  = useRef([]);
  const redoRef  = useRef([]);
  const pUndoRef = useRef([]);
  const pRedoRef = useRef([]);
  const [histVer, setHistVer] = useState(0);

  const svgRef      = useRef(null);
  const inputRef    = useRef(null);
  const imgFileRef  = useRef(null);
  const editValRef  = useRef('');
  const rectSelRef  = useRef(null); // {sx,sy,ex,ey} en world coords
  useEffect(() => { editValRef.current = editVal; }, [editVal]);

  const stateRef = useRef({
    viewBox: { x: 0, y: 0, w: 1000, h: 800 },
    nodes: INIT_NODES,
    mode: 'select',
    conn: null,
    editId: null,
    gesture: null,
  });
  useEffect(() => { stateRef.current.viewBox = viewBox; }, [viewBox]);
  useEffect(() => { stateRef.current.nodes = nodes; }, [nodes]);
  useEffect(() => { stateRef.current.mode = mode; }, [mode]);
  useEffect(() => { stateRef.current.conn = conn; }, [conn]);
  useEffect(() => { stateRef.current.editId = editId; }, [editId]);
  useEffect(() => { stateRef.current.edges  = edges;  }, [edges]);
  useEffect(() => { stateRef.current.syncFs   = syncFs;   }, [syncFs]);
  useEffect(() => { stateRef.current.multiSel  = multiSel;  }, [multiSel]);
  useEffect(() => { stateRef.current.tab       = tab;       }, [tab]);
  useEffect(() => { stateRef.current.sel       = sel;       }, [sel]);
  useEffect(() => { stateRef.current.clipboard = clipboard; }, [clipboard]);
  useEffect(() => { stateRef.current.pSel      = pSel;      }, [pSel]);
  useEffect(() => { stateRef.current.pMultiSel = pMultiSel; }, [pMultiSel]);
  useEffect(() => { pNodesRef.current = pNodes; }, [pNodes]);
  useEffect(() => { pViewBoxRef.current = pViewBox; }, [pViewBox]);

  // Load from storage & init viewBox to screen size
  useEffect(() => {
    loadSaved().then(d => {
      if (d?.nodes?.length) {
        setNodes(d.nodes);
        setEdges(d.edges || []);
        setDark(!!d.dark);
        if (d.edgeColor) setEdgeColor(d.edgeColor);
        if (d.pNodes?.length) setPNodes(d.pNodes);
        if (d.pEdges?.length) setPEdges(d.pEdges);
        if (d.pViewBox) { setPViewBox(d.pViewBox); pViewBoxRef.current = d.pViewBox; }
        if (d.planningCells) setPlanningCells(d.planningCells);
        if (d.ginaNodes?.length) setGinaData({ nodes: d.ginaNodes, edges: d.ginaEdges || [], viewBox: d.ginaViewBox });
        const mx = Math.max(10, ...d.nodes.map(n => parseInt(n.id.slice(1)) || 0));
        UID = mx + 1;
      }
      const rectFallback = { width: window.innerWidth, height: window.innerHeight };
      const useNodes = d?.nodes?.length ? d.nodes : INIT_NODES;
      const fit = fitToNodes(useNodes, rectFallback);
      setViewBox(fit || { x: 0, y: 0, w: rectFallback.width, h: rectFallback.height });
      setReady(true);
    });
  }, []);

  // Auto-save
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => save({
      nodes, edges, dark, viewBox, edgeColor, pNodes, pEdges, pViewBox,
      planningCells,
      ginaNodes: ginaData?.nodes, ginaEdges: ginaData?.edges, ginaViewBox: ginaData?.viewBox,
    }), 500);
    return () => clearTimeout(t);
  }, [nodes, edges, dark, viewBox, edgeColor, pNodes, pEdges, pViewBox, planningCells, ginaData, ready]);

  useEffect(() => {
    if (editId) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 15);
  }, [editId]);

  const commitEdit = () => {
    const id = stateRef.current.editId;
    if (!id) return;
    const val = editValRef.current.trim();
    if (val) setNodes(p => p.map(n => n.id === id ? { ...n, text: val } : n));
    setEditId(null);
  };

  // ─── NATIVE TOUCH/MOUSE LISTENERS ───
  useEffect(() => {
    if (!ready) return;
    const svg = svgRef.current;
    if (!svg) return;

    const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const toWorld = (cx, cy) => {
      const rect = svg.getBoundingClientRect();
      const vb = stateRef.current.viewBox;
      return {
        x: vb.x + ((cx - rect.left) / rect.width) * vb.w,
        y: vb.y + ((cy - rect.top)  / rect.height) * vb.h,
      };
    };

    const hitTarget = (target) => {
      let el = target;
      while (el && el !== svg) {
        if (el.getAttribute && el.getAttribute('data-role')) return el;
        el = el.parentNode;
      }
      return null;
    };

    const startGesture = (points, target, button = 0) => {
      const s = stateRef.current;

      if (points.length >= 2) {
        s.gesture = {
          type: 'pinch',
          startDist: dist(points[0], points[1]),
          startVB: { ...s.viewBox },
          startMid: {
            x: (points[0].clientX + points[1].clientX) / 2,
            y: (points[0].clientY + points[1].clientY) / 2,
          },
        };
        return;
      }

      const t = points[0];
      const hit = hitTarget(target);

      if (s.editId) commitEdit();

      if (hit?.getAttribute('data-role') === 'grip') {
        const node = s.nodes.find(n => n.id === hit.getAttribute('data-id'));
        if (node) {
          const w = toWorld(t.clientX, t.clientY);
          const { chain, offsets } = buildDescChain(node.id, s.edges || [], s.nodes, w);
          s.gesture = { type: 'move', id: node.id, ox: w.x - node.x, oy: w.y - node.y, chain, offsets, snapSaved: false };
        }
        return;
      }

      if (hit?.getAttribute('data-role') === 'resize') {
        const node = s.nodes.find(n => n.id === hit.getAttribute('data-id'));
        if (node) {
          const w = toWorld(t.clientX, t.clientY);
          s.gesture = {
            type: 'resize', id: node.id,
            sx: w.x, sy: w.y, ow: node.w, oh: node.h, ofs: node.fs || 13,
            lockW: hit.getAttribute('data-lockw') === '1',
            snapSaved: false,
          };
        }
        return;
      }

      if (hit?.getAttribute('data-role') === 'edge') {
        const eid = hit.getAttribute('data-id');
        setSelEdge(eid);
        setSel(null);
        s.gesture = { type: 'tap' };
        return;
      }

      if (hit?.getAttribute('data-role') === 'node') {
        const nodeId = hit.getAttribute('data-id');
        if (s.mode === 'connect') {
          if (!s.conn) {
            setConn(nodeId);
          } else if (s.conn !== nodeId) {
            const from = s.conn;
            s.saveSnap?.();
            setEdges(p => {
              const dup = p.find(e =>
                (e.from === from && e.to === nodeId) ||
                (e.from === nodeId && e.to === from));
              return dup ? p : [...p, { id: gid(), from, to: nodeId }];
            });
            setConn(null);
            setMode('select');
          }
          s.gesture = { type: 'tap' };
          return;
        }
        // Clic gauche → connect drag (faire un lien)
        if (button === 0) {
          const w = toWorld(t.clientX, t.clientY);
          setConn(nodeId);
          setConnDrag({ fromId: nodeId, x: w.x, y: w.y });
          s.gesture = { type: 'connect_drag', fromId: nodeId, lastClientX: t.clientX, lastClientY: t.clientY };
          return;
        }
        // Clic droit maintenu → déplacer le nœud + ses descendants
        const node = s.nodes.find(n => n.id === nodeId);
        if (node) {
          setSel(nodeId);
          setSelEdge(null);
          const w = toWorld(t.clientX, t.clientY);
          const { chain, offsets } = buildDescChain(nodeId, s.edges || [], s.nodes, w);
          s.gesture = { type: 'move', id: nodeId, ox: w.x - node.x, oy: w.y - node.y, chain, offsets, snapSaved: false };
        }
        return;
      }

      if (s.mode === 'add') {
        s.saveSnap?.();
        const w = toWorld(t.clientX, t.clientY);
        const color = PAL[Math.floor(Math.random() * PAL.length)];
        const nn = { id: gid(), x: w.x, y: w.y, w: 140, h: 48, text: 'Nouveau', color, fs: 14 };
        setNodes(p => [...p, nn]);
        setMode('select');
        setSel(nn.id);
        setSelEdge(null);
        setTimeout(() => { setEditId(nn.id); setEditVal('Nouveau'); }, 30);
        s.gesture = { type: 'tap' };
        return;
      }

      setSel(null);
      setSelEdge(null);
      setSelAll(false);
      setMultiSel(new Set());
      if (button === 2) {
        // Clic droit sur vide → créer un nœud taille moyenne
        s.saveSnap?.();
        const w = toWorld(t.clientX, t.clientY);
        const color = PAL[Math.floor(Math.random() * PAL.length)];
        const nds = s.nodes;
        const avgW  = nds.length ? Math.round(nds.reduce((a, n) => a + (n.w  || 140), 0) / nds.length) : 140;
        const avgH  = nds.length ? Math.round(nds.reduce((a, n) => a + (n.h  ||  48), 0) / nds.length) :  48;
        const avgFs = nds.length ? Math.round(nds.reduce((a, n) => a + (n.fs ||  14), 0) / nds.length) :  14;
        const nn = { id: gid(), x: w.x, y: w.y, w: avgW, h: avgH, text: 'Nouveau', color, fs: avgFs };
        setNodes(p => [...p, nn]);
        setSel(nn.id);
        setTimeout(() => { setEditId(nn.id); setEditVal('Nouveau'); }, 30);
        s.gesture = { type: 'tap' };
      } else {
        // Clic gauche sur vide → pan
        s.gesture = {
          type: 'pan',
          startX: t.clientX, startY: t.clientY,
          startVB: { ...s.viewBox },
        };
      }
    };

    const moveGesture = (points) => {
      const s = stateRef.current;
      const g = s.gesture;
      if (!g) return;
      const rect = svg.getBoundingClientRect();

      if (g.type === 'pinch' && points.length >= 2) {
        const newDist = dist(points[0], points[1]);
        const scale = g.startDist / newDist;
        const cx = (points[0].clientX + points[1].clientX) / 2;
        const cy = (points[0].clientY + points[1].clientY) / 2;
        const worldMx = g.startVB.x + ((g.startMid.x - rect.left) / rect.width)  * g.startVB.w;
        const worldMy = g.startVB.y + ((g.startMid.y - rect.top)  / rect.height) * g.startVB.h;
        const newW = g.startVB.w * scale;
        const newH = g.startVB.h * scale;
        const minW = rect.width * 0.2;
        const maxW = rect.width * 30;
        if (newW < minW || newW > maxW) return;
        setViewBox({
          x: worldMx - ((cx - rect.left) / rect.width) * newW,
          y: worldMy - ((cy - rect.top)  / rect.height) * newH,
          w: newW, h: newH,
        });
        return;
      }

      if (g.type === 'pan' && points.length >= 1) {
        const t = points[0];
        const dx = t.clientX - g.startX;
        const dy = t.clientY - g.startY;
        const scaleX = g.startVB.w / rect.width;
        const scaleY = g.startVB.h / rect.height;
        setViewBox({
          x: g.startVB.x - dx * scaleX,
          y: g.startVB.y - dy * scaleY,
          w: g.startVB.w, h: g.startVB.h,
        });
        return;
      }

      if (g.type === 'move' && points.length >= 1) {
        if (!g.snapSaved) { s.saveSnap?.(); g.snapSaved = true; }
        const t = points[0];
        const w = toWorld(t.clientX, t.clientY);
        const id = g.id;
        if (g.chain && g.offsets) {
          // Déplacer nœud + descendants (chain)
          setNodes(p => p.map(n => {
            const off = g.offsets[n.id];
            return off ? { ...n, x: w.x - off.ox, y: w.y - off.oy } : n;
          }));
        } else if (g.groupOffsets) {
          setNodes(p => p.map(n => {
            const off = g.groupOffsets[n.id];
            return off ? { ...n, x: w.x + off.ox, y: w.y + off.oy } : n;
          }));
        } else {
          setNodes(p => p.map(n => n.id === id ? { ...n, x: w.x - g.ox, y: w.y - g.oy } : n));
        }
        return;
      }

      if (g.type === 'connect_drag' && points.length >= 1) {
        const t = points[0];
        const w = toWorld(t.clientX, t.clientY);
        g.lastClientX = t.clientX;
        g.lastClientY = t.clientY;
        setConnDrag({ fromId: g.fromId, x: w.x, y: w.y });
        return;
      }

      if (g.type === 'resize' && points.length >= 1) {
        if (!g.snapSaved) { s.saveSnap?.(); g.snapSaved = true; }
        const t = points[0];
        const w = toWorld(t.clientX, t.clientY);
        const dw = w.x - g.sx, dh = w.y - g.sy;
        const id = g.id;
        const newW = Math.max(80, g.ow + dw);
        const newH = Math.max(36, g.oh + dh);
        const scaleF = g.lockW ? newH / g.oh : (newW / g.ow + newH / g.oh) / 2;
        setNodes(p => p.map(n => n.id === id ? {
          ...n,
          w: g.lockW ? n.w : newW,
          h: newH,
          ...(s.syncFs ? { fs: Math.max(6, Math.min(40, Math.round(g.ofs * scaleF))) } : {}),
        } : n));
        return;
      }
    };

    const endGesture = () => {
      const s = stateRef.current;
      const g = s.gesture;

      if (g?.type === 'connect_drag') {
        const cx = g.lastClientX, cy = g.lastClientY;
        let toId = null;
        if (cx != null && cy != null) {
          const el = document.elementFromPoint(cx, cy);
          const hit = el ? hitTarget(el) : null;
          if (hit?.getAttribute('data-role') === 'node') toId = hit.getAttribute('data-id');
        }
        if (toId && toId !== g.fromId) {
          // Lien vers nœud existant
          s.saveSnap?.();
          setEdges(p => {
            const dup = p.find(e =>
              (e.from === g.fromId && e.to === toId) ||
              (e.from === toId && e.to === g.fromId));
            return dup ? p : [...p, { id: gid(), from: g.fromId, to: toId }];
          });
        } else if (!toId && cx != null && cy != null) {
          // Lâcher dans le vide → nouveau nœud connecté + taille moyenne
          const w = toWorld(cx, cy);
          const color = PAL[Math.floor(Math.random() * PAL.length)];
          const nds = s.nodes;
          const avgW  = nds.length ? Math.round(nds.reduce((a, n) => a + (n.w  || 140), 0) / nds.length) : 140;
          const avgH  = nds.length ? Math.round(nds.reduce((a, n) => a + (n.h  ||  48), 0) / nds.length) :  48;
          const avgFs = nds.length ? Math.round(nds.reduce((a, n) => a + (n.fs ||  14), 0) / nds.length) :  14;
          const nn = { id: gid(), x: w.x, y: w.y, w: avgW, h: avgH, text: 'Nouveau', color, fs: avgFs };
          s.saveSnap?.();
          setNodes(p => [...p, nn]);
          setEdges(p => [...p, { id: gid(), from: g.fromId, to: nn.id }]);
          setSel(nn.id);
        }
        setConnDrag(null);
        setConn(null);
        if (s.mode === 'connect') setMode('select');
      }

      s.gesture = null;
    };

    const onTS = (e) => { e.preventDefault(); startGesture([...e.touches], e.target); };
    const onTM = (e) => { e.preventDefault(); moveGesture([...e.touches]); };
    const onTE = (e) => { e.preventDefault(); if (e.touches.length === 0) endGesture(); };

    let mouseDown = false;
    const onMD = (e) => {
      if (e.button === 2) e.preventDefault();
      mouseDown = true;
      startGesture([{ clientX: e.clientX, clientY: e.clientY }], e.target, e.button);
    };
    const onMM = (e) => { if (mouseDown) moveGesture([{ clientX: e.clientX, clientY: e.clientY }]); };
    const onMU = () => { mouseDown = false; endGesture(); };
    const onContextMenu = (e) => e.preventDefault();

    const onWheel = (e) => {
      e.preventDefault();
      const s = stateRef.current;
      const vb = s.viewBox;
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      const rect = svg.getBoundingClientRect();
      const newW = vb.w * scale;
      const newH = vb.h * scale;
      const minW = rect.width * 0.2;
      const maxW = rect.width * 8;
      if (newW < minW || newW > maxW) return;
      const worldX = vb.x + ((e.clientX - rect.left) / rect.width) * vb.w;
      const worldY = vb.y + ((e.clientY - rect.top)  / rect.height) * vb.h;
      setViewBox({
        x: worldX - ((e.clientX - rect.left) / rect.width) * newW,
        y: worldY - ((e.clientY - rect.top)  / rect.height) * newH,
        w: newW, h: newH,
      });
    };

    svg.addEventListener('touchstart',  onTS, { passive: false });
    svg.addEventListener('touchmove',   onTM, { passive: false });
    svg.addEventListener('touchend',    onTE, { passive: false });
    svg.addEventListener('touchcancel', onTE, { passive: false });
    svg.addEventListener('mousedown', onMD);
    svg.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup',   onMU);
    svg.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      svg.removeEventListener('touchstart',  onTS);
      svg.removeEventListener('touchmove',   onTM);
      svg.removeEventListener('touchend',    onTE);
      svg.removeEventListener('touchcancel', onTE);
      svg.removeEventListener('mousedown', onMD);
      svg.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('mouseup',   onMU);
      svg.removeEventListener('wheel', onWheel);
    };
  }, [ready]);

  // ── Rect-select : système indépendant du gesture handler ──
  useEffect(() => {
    if (mode !== 'rect') { setRectDraw(null); return; }

    const getWorld = (clientX, clientY) => {
      const svgEl = svgRef.current;
      if (!svgEl) return { x: 0, y: 0 };
      const r = svgEl.getBoundingClientRect();
      const vb = stateRef.current.viewBox;
      return {
        x: vb.x + ((clientX - r.left) / r.width) * vb.w,
        y: vb.y + ((clientY - r.top)  / r.height) * vb.h,
      };
    };

    const onMove = (e) => {
      const rs = rectSelRef.current;
      if (!rs) return;
      const w = getWorld(e.clientX, e.clientY);
      rs.ex = w.x; rs.ey = w.y;
      setRectDraw({ x1: rs.sx, y1: rs.sy, x2: w.x, y2: w.y });
    };

    const onUp = () => {
      const rs = rectSelRef.current;
      if (!rs) return;
      const minX = Math.min(rs.sx, rs.ex), maxX = Math.max(rs.sx, rs.ex);
      const minY = Math.min(rs.sy, rs.ey), maxY = Math.max(rs.sy, rs.ey);
      const currNodes = stateRef.current.nodes;
      const selected = new Set(
        currNodes.filter(n =>
          n.x - n.w/2 < maxX && n.x + n.w/2 > minX &&
          n.y - n.h/2 < maxY && n.y + n.h/2 > minY
        ).map(n => n.id)
      );
      if (selected.size > 0) {
        baseNodesRef.current = currNodes.map(n => ({...n}));
        setSliderFs(0); setSliderW(0); setSliderH(0);
        setMultiSel(selected);
      }
      rectSelRef.current = null;
      setRectDraw(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      setRectDraw(null);
    };
  }, [mode]);

  // ── Rect-select Parcours MA ──────────────────────────────────
  useEffect(() => {
    if (pMode !== 'rect') { setPRectDraw(null); return; }

    const getWorld = (clientX, clientY) => {
      const wrap = pWrapRef.current;
      if (!wrap) return { x: 0, y: 0 };
      const r  = wrap.getBoundingClientRect();
      const vb = pViewBoxRef.current;
      return {
        x: vb.x + ((clientX - r.left) / r.width)  * vb.w,
        y: vb.y + ((clientY - r.top)  / r.height) * vb.h,
      };
    };

    const onMove = (e) => {
      const rs = pRectSelRef.current;
      if (!rs) return;
      const w = getWorld(e.clientX, e.clientY);
      rs.ex = w.x; rs.ey = w.y;
      setPRectDraw({ x1: rs.sx, y1: rs.sy, x2: w.x, y2: w.y });
    };

    const onUp = () => {
      const rs = pRectSelRef.current;
      if (!rs) return;
      const minX = Math.min(rs.sx, rs.ex), maxX = Math.max(rs.sx, rs.ex);
      const minY = Math.min(rs.sy, rs.ey), maxY = Math.max(rs.sy, rs.ey);
      const selected = new Set(
        pNodesRef.current.filter(n =>
          n.x - n.w/2 < maxX && n.x + n.w/2 > minX &&
          n.y - n.h/2 < maxY && n.y + n.h/2 > minY
        ).map(n => n.id)
      );
      if (selected.size > 0) {
        pBaseNodesRef.current = pNodesRef.current.map(n => ({...n}));
        setPSliderFs(0); setPSliderW(0); setPSliderH(0);
        setPMultiSel(selected);
      }
      pRectSelRef.current = null;
      setPRectDraw(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      setPRectDraw(null);
    };
  }, [pMode]);

  useEffect(() => {
    const p = (e) => e.preventDefault();
    document.addEventListener('gesturestart',  p);
    document.addEventListener('gesturechange', p);
    document.addEventListener('gestureend',    p);
    return () => {
      document.removeEventListener('gesturestart',  p);
      document.removeEventListener('gesturechange', p);
      document.removeEventListener('gestureend',    p);
    };
  }, []);

  // ── Keyboard shortcuts (tab-aware) ──────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const t = stateRef.current.tab;

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (t === 'mindmap') {
          baseNodesRef.current = stateRef.current.nodes.map(n => ({ ...n }));
          setSliderFs(0); setSliderW(0); setSliderH(0);
          setSelAll(true); setMultiSel(new Set()); setSel(null); setSelEdge(null);
        } else if (t === 'parcours') {
          pBaseNodesRef.current = pNodesRef.current.map(n => ({ ...n }));
          setPSliderFs(0); setPSliderW(0); setPSliderH(0);
          setPSelAll(true); setPMultiSel(new Set()); setPSel(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (t === 'mindmap') copyMap();
        else if (t === 'parcours') copyParcours();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (t === 'mindmap') pasteMap();
        else if (t === 'parcours') pasteParcours();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (t === 'mindmap') {
          const ms = stateRef.current.multiSel || new Set();
          const s  = stateRef.current.sel;
          const toDelete = ms.size > 0 ? ms : s ? new Set([s]) : null;
          if (!toDelete) return;
          saveSnap();
          setNodes(p => p.filter(n => !toDelete.has(n.id)));
          setEdges(p => p.filter(e => !toDelete.has(e.from) && !toDelete.has(e.to)));
          setMultiSel(new Set()); setSel(null);
        } else if (t === 'parcours') {
          const ms = stateRef.current.pMultiSel || new Set();
          const s  = stateRef.current.pSel;
          const toDelete = ms.size > 0 ? ms : s ? new Set([s]) : null;
          if (!toDelete) return;
          pSaveSnap();
          setPNodes(p => p.filter(n => !toDelete.has(n.id)));
          setPEdges(p => p.filter(e => !toDelete.has(e.from) && !toDelete.has(e.to)));
          setPMultiSel(new Set()); setPSel(null);
        }
      }
      if (e.key === 'Escape') {
        setSelAll(false); setMultiSel(new Set()); setRectDraw(null); setSel(null); setSelEdge(null);
        setPSelAll(false); setPMultiSel(new Set()); setPRectDraw(null); setPSel(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const T = dark ? {
    bg:'#0e0e1a', dot:'rgba(255,255,255,0.04)', bar:'rgba(18,18,32,0.97)',
    bBorder:'rgba(255,255,255,0.09)', line:'rgba(255,255,255,0.25)',
    sub:'rgba(255,255,255,0.3)', btnBg:'rgba(255,255,255,0.08)', btnTxt:'#bbb',
  } : {
    bg:'#efefea', dot:'rgba(0,0,0,0.07)', bar:'rgba(255,255,255,0.97)',
    bBorder:'rgba(0,0,0,0.09)', line:'rgba(0,0,0,0.3)',
    sub:'rgba(0,0,0,0.3)', btnBg:'rgba(0,0,0,0.06)', btnTxt:'#555',
  };

  const zoomBy = (factor) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vb = viewBox;
    const newW = vb.w * factor;
    const newH = vb.h * factor;
    const minW = rect.width * 0.2;
    const maxW = rect.width * 8;
    if (newW < minW || newW > maxW) return;
    const cx = rect.width / 2, cy = rect.height / 2;
    const worldX = vb.x + (cx / rect.width) * vb.w;
    const worldY = vb.y + (cy / rect.height) * vb.h;
    setViewBox({
      x: worldX - (cx / rect.width) * newW,
      y: worldY - (cy / rect.height) * newH,
      w: newW, h: newH,
    });
  };

  const resetView = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setViewBox({ x: 0, y: 0, w: rect.width, h: rect.height });
  };

  const getZoomPct = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 100;
    return Math.round((rect.width / viewBox.w) * 100);
  };

  const activateSelAll = () => {
    baseNodesRef.current = nodes.map(n => ({ ...n }));
    setSliderFs(0);
    setSliderW(0);
    setSliderH(0);
    setSelAll(true);
    setMultiSel(new Set());
    setSel(null);
    setSelEdge(null);
  };

  const onSliderFs = (val) => {
    setSliderFs(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
      if (!selAll && !multiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, fs: Math.max(9, Math.min(40, (b.fs||13) + val)) } : n;
    }));
  };

  const onSliderW = (val) => {
    setSliderW(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
      if (!selAll && !multiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, w: Math.max(80, b.w + val) } : n;
    }));
  };

  const onSliderH = (val) => {
    setSliderH(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
      if (!selAll && !multiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, h: Math.max(36, b.h + val) } : n;
    }));
  };

  // ── Fonctions slider Parcours MA ──
  const activatePSelAll = () => {
    pBaseNodesRef.current = pNodes.map(n => ({ ...n }));
    setPSliderFs(0); setPSliderW(0); setPSliderH(0);
    setPSelAll(true);
  };
  const onPSliderFs = (val) => {
    setPSliderFs(val);
    const base = pBaseNodesRef.current;
    if (!base) return;
    setPNodes(p => p.map(n => {
      if (!pSelAll && !pMultiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, fs: Math.max(6, Math.min(40, (b.fs || 10) + val)) } : n;
    }));
  };
  const onPSliderW = (val) => {
    setPSliderW(val);
    const base = pBaseNodesRef.current;
    if (!base) return;
    setPNodes(p => p.map(n => {
      if (!pSelAll && !pMultiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, w: Math.max(60, b.w + val) } : n;
    }));
  };
  const onPSliderH = (val) => {
    setPSliderH(val);
    const base = pBaseNodesRef.current;
    if (!base) return;
    setPNodes(p => p.map(n => {
      if (!pSelAll && !pMultiSel.has(n.id)) return n;
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, h: Math.max(24, b.h + val) } : n;
    }));
  };

  // ── Undo / Redo ──────────────────────────────────────────────
  const saveSnap = () => {
    undoRef.current = [...undoRef.current, {
      nodes: stateRef.current.nodes.map(n => ({...n})),
      edges: stateRef.current.edges ? [...stateRef.current.edges] : [],
    }].slice(-50);
    redoRef.current = [];
    setHistVer(v => v + 1);
  };
  const pSaveSnap = () => {
    pUndoRef.current = [...pUndoRef.current, pNodesRef.current.map(n => ({...n}))].slice(-50);
    pRedoRef.current = [];
    setHistVer(v => v + 1);
  };
  stateRef.current.saveSnap = saveSnap;

  const undo = () => {
    if (!undoRef.current.length) return;
    const snap = undoRef.current[undoRef.current.length - 1];
    undoRef.current = undoRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, {
      nodes: stateRef.current.nodes.map(n => ({...n})),
      edges: stateRef.current.edges ? [...stateRef.current.edges] : [],
    }];
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setHistVer(v => v + 1);
  };
  const redo = () => {
    if (!redoRef.current.length) return;
    const snap = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    undoRef.current = [...undoRef.current, {
      nodes: stateRef.current.nodes.map(n => ({...n})),
      edges: stateRef.current.edges ? [...stateRef.current.edges] : [],
    }];
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setHistVer(v => v + 1);
  };
  const pUndo = () => {
    if (!pUndoRef.current.length) return;
    const snap = pUndoRef.current[pUndoRef.current.length - 1];
    pUndoRef.current = pUndoRef.current.slice(0, -1);
    pRedoRef.current = [...pRedoRef.current, pNodesRef.current.map(n => ({...n}))];
    setPNodes(snap);
    setHistVer(v => v + 1);
  };
  const pRedo = () => {
    if (!pRedoRef.current.length) return;
    const snap = pRedoRef.current[pRedoRef.current.length - 1];
    pRedoRef.current = pRedoRef.current.slice(0, -1);
    pUndoRef.current = [...pUndoRef.current, pNodesRef.current.map(n => ({...n}))];
    setPNodes(snap);
    setHistVer(v => v + 1);
  };

  const delSel = () => {
    if (!sel) return;
    saveSnap();
    setNodes(p => p.filter(n => n.id !== sel));
    setEdges(p => p.filter(e => e.from !== sel && e.to !== sel));
    setSel(null);
  };

  const openEdit = (id) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setEditId(id);
    setEditVal(node.text);
  };

  // ── Copy / Paste (partagé entre tous les onglets) ──────────────
  const copyMap = () => {
    const ms = stateRef.current.multiSel || new Set();
    const s  = stateRef.current.sel;
    const ids = ms.size > 0 ? ms : s ? new Set([s]) : new Set();
    if (!ids.size) return;
    setClipboard(stateRef.current.nodes.filter(n => ids.has(n.id)));
  };
  const pasteMap = () => {
    const cb = stateRef.current.clipboard;
    if (!cb?.length) return;
    saveSnap();
    const newNodes = cb.map(n => ({ ...n, id: gid(), x: n.x + 50, y: n.y + 50 }));
    setNodes(p => [...p, ...newNodes]);
    setMultiSel(new Set(newNodes.map(n => n.id)));
  };
  const copyParcours = () => {
    const ms = stateRef.current.pMultiSel || new Set();
    const s  = stateRef.current.pSel;
    const ids = ms.size > 0 ? ms : s ? new Set([s]) : new Set();
    if (!ids.size) return;
    setClipboard(pNodesRef.current.filter(n => ids.has(n.id)));
  };
  const pasteParcours = () => {
    const cb = stateRef.current.clipboard;
    if (!cb?.length) return;
    pSaveSnap();
    const newNodes = cb.map(n => ({
      ...n,
      id: `pe_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      x: n.x + 50, y: n.y + 50,
    }));
    setPNodes(p => [...p, ...newNodes]);
    setPMultiSel(new Set(newNodes.map(n => n.id)));
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const imgBitmap = await createImageBitmap(file);
      const natW = imgBitmap.width, natH = imgBitmap.height;

      const maxDim = 1200;
      let drawW = natW, drawH = natH;
      if (natW > maxDim || natH > maxDim) {
        const ratio = Math.min(maxDim / natW, maxDim / natH);
        drawW = Math.round(natW * ratio);
        drawH = Math.round(natH * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = drawW; canvas.height = drawH;
      canvas.getContext('2d').drawImage(imgBitmap, 0, 0, drawW, drawH);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const base64 = canvas.toDataURL(mime, 0.88).split(',')[1];
      const ext = mime === 'image/png' ? 'png' : 'jpg';

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename: `img.${ext}`, contentType: mime }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);

      const maxNode = 320;
      let nodeW = natW, nodeH = natH;
      if (natW > maxNode || natH > maxNode) {
        const r = Math.min(maxNode / natW, maxNode / natH);
        nodeW = Math.round(natW * r);
        nodeH = Math.round(natH * r);
      }

      const vb = stateRef.current.viewBox;
      const nn = {
        id: gid(),
        x: vb.x + vb.w / 2,
        y: vb.y + vb.h / 2,
        w: nodeW, h: nodeH,
        text: '', color: 'transparent', fs: 13,
        imageUrl: url,
      };
      setNodes(p => [...p, nn]);
      setSel(nn.id);
      setMode('select');
    } catch (e) {
      alert('Erreur upload : ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const selNode = nodes.find(n => n.id === sel);

  // ── Vars actives selon l'onglet ──
  const activeSelAll     = tab === 'mindmap' ? (selAll || multiSel.size > 0) : (pSelAll || pMultiSel.size > 0);
  const activeSliderFs   = tab === 'mindmap' ? sliderFs   : pSliderFs;
  const activeSliderW    = tab === 'mindmap' ? sliderW    : pSliderW;
  const activeSliderH    = tab === 'mindmap' ? sliderH    : pSliderH;
  const doToggleSelAll   = tab === 'mindmap'
    ? () => { selAll  ? setSelAll(false)  : activateSelAll(); }
    : () => { pSelAll ? setPSelAll(false) : activatePSelAll(); };
  const doSliderFs = tab === 'mindmap' ? onSliderFs  : onPSliderFs;
  const doSliderW  = tab === 'mindmap' ? onSliderW   : onPSliderW;
  const doSliderH  = tab === 'mindmap' ? onSliderH   : onPSliderH;

  if (!ready) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh', background:'#0e0e1a', color:'#555', fontFamily:'system-ui' }}>
      Chargement…
    </div>
  );

  const scale = svgRef.current ? svgRef.current.getBoundingClientRect().width / viewBox.w : 1;

  return (
    <div style={{
      position:'fixed', inset:0,
      background:T.bg, overflow:'hidden',
      fontFamily:'system-ui,sans-serif',
      touchAction:'none', overscrollBehavior:'none',
      userSelect:'none', WebkitUserSelect:'none',
    }}>

      {/* Toolbar */}
      <div style={{
        position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
        zIndex:30, display:'flex', alignItems:'center', gap:4, flexWrap:'wrap',
        background:T.bar, backdropFilter:'blur(16px)',
        border:`1px solid ${T.bBorder}`, borderRadius:11,
        padding:'5px 8px', boxShadow:'0 3px 20px rgba(0,0,0,0.15)',
        maxWidth:'calc(100vw - 12px)', justifyContent:'center'
      }}>
        {/* ── Onglets ── */}
        {[{k:'mindmap',l:'⬡ Map'},{k:'planning',l:'▦ Planning'},{k:'gina',l:'⚕ GINA'},{k:'parcours',l:'☷ Parcours MA'}].map(b => (
          <button key={b.k} onClick={() => setTab(b.k)} style={{
            background: tab===b.k ? '#f5c540' : T.btnBg,
            color: tab===b.k ? '#1a1a1a' : T.btnTxt,
            border: 'none', borderRadius: 7, padding: '5px 11px',
            fontSize: 12, cursor: 'pointer',
            fontWeight: tab===b.k ? '700' : 'normal',
            whiteSpace: 'nowrap',
          }}>{b.l}</button>
        ))}
        <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />

        {tab === 'mindmap' && [
          {k:'select',l:'↖'},{k:'rect',l:'⬚'},{k:'add',l:'＋'},{k:'connect',l:'⟷'}
        ].map(b => (
          <button key={b.k} onClick={() => { setMode(b.k); setConn(null); setSelAll(false); if(b.k!=='rect'){setMultiSel(new Set());setRectDraw(null);} }} style={{
            background: mode===b.k ? '#4b5ce8' : T.btnBg,
            color: mode===b.k ? '#fff' : T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 10px',
            fontSize:13, cursor:'pointer', fontWeight: mode===b.k ? '600':'normal',
            whiteSpace:'nowrap', minWidth:28
          }}>{b.l}</button>
        ))}
        {tab === 'parcours' && [
          {k:'select',l:'↖'},{k:'rect',l:'⬚'},{k:'add',l:'＋'},{k:'connect',l:'⟷'}
        ].map(b => (
          <button key={b.k} onClick={() => {
            setPMode(b.k); setPConn(null);
            if (b.k !== 'rect') { setPMultiSel(new Set()); setPRectDraw(null); }
          }} style={{
            background: pMode===b.k ? '#4b5ce8' : T.btnBg,
            color: pMode===b.k ? '#fff' : T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 10px',
            fontSize:13, cursor:'pointer', fontWeight: pMode===b.k ? '600':'normal',
            whiteSpace:'nowrap', minWidth:28
          }}>{b.l}</button>
        ))}
        <button onClick={doToggleSelAll} style={{
          background: activeSelAll ? '#f97316' : T.btnBg,
          color: activeSelAll ? '#fff' : T.btnTxt,
          border:'none', borderRadius:7, padding:'5px 10px',
          fontSize:12, cursor:'pointer', fontWeight: activeSelAll ? '600':'normal',
          whiteSpace:'nowrap'
        }}>⊞ Tout</button>
        <button onClick={() => setSyncFs(v => !v)} title="Synchro taille texte / case" style={{
          background: syncFs ? 'rgba(32,201,151,0.18)' : T.btnBg,
          color: syncFs ? '#20c997' : T.sub,
          border: syncFs ? '1px solid rgba(32,201,151,0.5)' : `1px solid ${T.bBorder}`,
          borderRadius:7, padding:'5px 9px',
          fontSize:11, cursor:'pointer', whiteSpace:'nowrap',
          fontWeight: syncFs ? '700' : 'normal',
        }}>⇔A {syncFs ? 'ON' : 'OFF'}</button>

        {tab === 'mindmap' && selNode && <>
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          {!selNode.imageUrl && <>
            <button onClick={() => openEdit(selNode.id)} style={{
              background:T.btnBg, color:'#20c997', border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer'
            }}>✏</button>
            <span style={{color:T.sub, fontSize:10, minWidth:28}}>A {selNode.fs || 13}</span>
            <input type="range" min={6} max={40} step={1} value={selNode.fs || 13}
              onChange={e => setNodes(p => p.map(n => n.id === sel ? { ...n, fs: Number(e.target.value) } : n))}
              style={{width:72, accentColor:'#20c997', cursor:'pointer'}}
            />
            <div style={{display:'flex',gap:3,alignItems:'center'}}>
              {PAL.map(c => (
                <div key={c} onClick={() => { saveSnap(); setNodes(p => p.map(n => n.id===sel?{...n,color:c}:n)); }}
                  style={{
                    width:16, height:16, borderRadius:4, background:c, cursor:'pointer',
                    border: selNode.color===c ? `2px solid ${dark?'#fff':'#222'}` : '2px solid transparent',
                    boxSizing:'border-box', flexShrink:0,
                  }} />
              ))}
            </div>
          </>}
          {sel && (
            <button onClick={delSel} style={{
              background:'rgba(232,85,85,0.12)', color:'#e85555', border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer'
            }}>✕</button>
          )}
        </>}

        {activeSelAll && <>
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          {tab === 'mindmap' && multiSel.size > 0 && !selAll && (
            <span style={{color:'rgba(75,92,232,0.9)', fontSize:10, minWidth:24, fontWeight:'600'}}>{multiSel.size}⬚</span>
          )}
          {tab === 'parcours' && pMultiSel.size > 0 && (
            <span style={{color:'rgba(75,92,232,0.9)', fontSize:10, minWidth:24, fontWeight:'600'}}>{pMultiSel.size}⬚</span>
          )}
          <span style={{color:T.sub, fontSize:10, minWidth:28}}>A {activeSliderFs > 0 ? '+' : ''}{activeSliderFs}</span>
          <input type="range" min={-8} max={14} step={1} value={activeSliderFs}
            onChange={e => doSliderFs(Number(e.target.value))}
            style={{width:72, accentColor:'#f97316', cursor:'pointer'}}
          />
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <span style={{color:T.sub, fontSize:10, minWidth:36}}>W {activeSliderW > 0 ? '+' : ''}{activeSliderW}</span>
          <input type="range" min={-100} max={200} step={5} value={activeSliderW}
            onChange={e => doSliderW(Number(e.target.value))}
            style={{width:72, accentColor:'#f97316', cursor:'pointer'}}
          />
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <span style={{color:T.sub, fontSize:10, minWidth:36}}>H {activeSliderH > 0 ? '+' : ''}{activeSliderH}</span>
          <input type="range" min={-20} max={80} step={2} value={activeSliderH}
            onChange={e => doSliderH(Number(e.target.value))}
            style={{width:72, accentColor:'#f97316', cursor:'pointer'}}
          />
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <button onClick={() => { tab === 'mindmap' ? copyMap() : copyParcours(); }} title="Copier (Ctrl+C)" style={{
            background: clipboard.length ? 'rgba(32,201,151,0.15)' : T.btnBg,
            color: clipboard.length ? '#20c997' : T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 9px', fontSize:12, cursor:'pointer',
          }}>⎘</button>
          <button onClick={() => { tab === 'mindmap' ? pasteMap() : pasteParcours(); }} title="Coller (Ctrl+V)" style={{
            background: T.btnBg, color: T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 9px', fontSize:12,
            cursor: clipboard.length ? 'pointer' : 'default',
            opacity: clipboard.length ? 1 : 0.35,
          }}>⎗</button>
        </>}

        {/* ⎘/⎗ even when only one node selected (no multi-sel active) */}
        {!activeSelAll && (sel || pSel) && <>
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <button onClick={() => { tab === 'mindmap' ? copyMap() : copyParcours(); }} title="Copier (Ctrl+C)" style={{
            background: T.btnBg, color: T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 9px', fontSize:12, cursor:'pointer',
          }}>⎘</button>
          <button onClick={() => { tab === 'mindmap' ? pasteMap() : pasteParcours(); }} title="Coller (Ctrl+V)" style={{
            background: T.btnBg, color: T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 9px', fontSize:12,
            cursor: clipboard.length ? 'pointer' : 'default',
            opacity: clipboard.length ? 1 : 0.35,
          }}>⎗</button>
        </>}

        {/* Paste when nothing selected but clipboard has content */}
        {!activeSelAll && !sel && !pSel && clipboard.length > 0 && (tab === 'mindmap' || tab === 'parcours') && <>
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <button onClick={() => { tab === 'mindmap' ? pasteMap() : pasteParcours(); }} title="Coller (Ctrl+V)" style={{
            background: T.btnBg, color: T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 9px', fontSize:12, cursor:'pointer',
          }}>⎗</button>
        </>}

        {/* ✏ for Parcours MA single selection */}
        {tab === 'parcours' && pSel && !pMultiSel.size && (() => {
          const pn = pNodes.find(n => n.id === pSel);
          return pn ? <>
            <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
            <button onClick={() => setTriggerEditIdP(pSel + '|' + Date.now())} style={{
              background:T.btnBg, color:'#20c997', border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer',
            }} title="Éditer le texte">✏</button>
            <button onClick={() => {
              pSaveSnap();
              setPNodes(p => p.filter(n => n.id !== pSel));
              setPEdges(p => p.filter(e => e.from !== pSel && e.to !== pSel));
              setPSel(null);
            }} style={{
              background:'rgba(232,85,85,0.12)', color:'#e85555', border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer',
            }}>✕</button>
          </> : null;
        })()}

        {tab === 'mindmap' && selEdge && <>
          <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
          <span style={{color:T.sub, fontSize:10, marginRight:2}}>lien</span>
          <div style={{display:'flex',gap:3,alignItems:'center'}}>
            {['#888888','#333333','#4b5ce8','#20c997','#e85555','#f5c540','#a855f7'].map(c => (
              <div key={c} onClick={() => setEdgeColor(c)}
                style={{
                  width:16, height:16, borderRadius:4, background:c, cursor:'pointer',
                  border: edgeColor===c ? `2px solid ${dark?'#fff':'#222'}` : '2px solid transparent',
                  boxSizing:'border-box', flexShrink:0,
                }} />
            ))}
          </div>
          <button onClick={() => {
            saveSnap();
            setEdges(p => p.filter(e => e.id !== selEdge));
            setSelEdge(null);
          }} style={{
            background:'rgba(232,85,85,0.12)', color:'#e85555', border:'none',
            borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer'
          }}>✕</button>
        </>}

        <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
        {/* Undo / Redo */}
        {(() => {
          const canUndo = tab === 'mindmap' ? undoRef.current.length > 0 : pUndoRef.current.length > 0;
          const canRedo = tab === 'mindmap' ? redoRef.current.length > 0 : pRedoRef.current.length > 0;
          const doUndo  = tab === 'mindmap' ? undo : pUndo;
          const doRedo  = tab === 'mindmap' ? redo : pRedo;
          return (<>
            <button onClick={doUndo} title="Annuler" style={{
              background:T.btnBg, color:T.btnTxt, border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:13, cursor: canUndo ? 'pointer' : 'default',
              opacity: canUndo ? 1 : 0.3, whiteSpace:'nowrap',
            }}>←</button>
            <button onClick={doRedo} title="Rétablir" style={{
              background:T.btnBg, color:T.btnTxt, border:'none',
              borderRadius:7, padding:'5px 9px', fontSize:13, cursor: canRedo ? 'pointer' : 'default',
              opacity: canRedo ? 1 : 0.3, whiteSpace:'nowrap',
            }}>→</button>
          </>);
        })()}
        <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
        <button onClick={() => zoomBy(1.25)} style={{
          background:T.btnBg, color:T.btnTxt, border:'none',
          borderRadius:7, padding:'5px 9px', fontSize:13, cursor:'pointer', fontWeight:'bold'
        }}>−</button>
        <button onClick={resetView} style={{
          background:T.btnBg, color:T.btnTxt, border:'none',
          borderRadius:7, padding:'5px 7px', fontSize:10, cursor:'pointer', minWidth:38
        }}>{getZoomPct()}%</button>
        <button onClick={() => zoomBy(0.8)} style={{
          background:T.btnBg, color:T.btnTxt, border:'none',
          borderRadius:7, padding:'5px 9px', fontSize:13, cursor:'pointer', fontWeight:'bold'
        }}>＋</button>

        <div style={{width:1,height:18,background:T.bBorder,margin:'0 2px'}} />
        <button onClick={() => setDark(d => !d)} style={{
          background:T.btnBg, color:T.btnTxt, border:'none',
          borderRadius:7, padding:'5px 9px', fontSize:11, cursor:'pointer'
        }}>{dark ? '☀' : '◑'}</button>
      </div>

      {mode === 'add' && (
        <div style={{
          position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
          background:'rgba(75,92,232,0.14)', border:'1px solid rgba(75,92,232,0.4)',
          color:'#4b5ce8', padding:'7px 22px', borderRadius:20,
          fontSize:12, zIndex:10, pointerEvents:'none', whiteSpace:'nowrap'
        }}>Touchez pour créer un nœud</div>
      )}
      {conn && (
        <div style={{
          position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
          background:'rgba(32,201,151,0.12)', border:'1px solid rgba(32,201,151,0.4)',
          color:'#20c997', padding:'7px 22px', borderRadius:20,
          fontSize:12, zIndex:10, pointerEvents:'none', whiteSpace:'nowrap'
        }}>→ Touchez un nœud pour relier</div>
      )}
      {pConn && tab === 'parcours' && (
        <div style={{
          position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
          background:'rgba(32,201,151,0.12)', border:'1px solid rgba(32,201,151,0.4)',
          color:'#20c997', padding:'7px 22px', borderRadius:20,
          fontSize:12, zIndex:30, pointerEvents:'none', whiteSpace:'nowrap'
        }}>→ Cliquez un nœud pour relier</div>
      )}

      {/* Hidden image input */}
      <input ref={imgFileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value=''; }}
      />

      {/* Overlay rect-select — intercepte les events souris en mode ⬚ */}
      {mode === 'rect' && (
        <div
          style={{ position:'absolute', inset:0, zIndex:25, cursor:'crosshair' }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            const svgEl = svgRef.current;
            if (!svgEl) return;
            const r   = svgEl.getBoundingClientRect();
            const vb  = stateRef.current.viewBox;
            const wx  = vb.x + ((e.clientX - r.left) / r.width)  * vb.w;
            const wy  = vb.y + ((e.clientY - r.top)  / r.height) * vb.h;
            rectSelRef.current = { sx: wx, sy: wy, ex: wx, ey: wy };
            setRectDraw({ x1: wx, y1: wy, x2: wx, y2: wy });
          }}
        />
      )}

      {/* SVG */}
      <svg ref={svgRef} width="100%" height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display:'block', touchAction:'none', userSelect:'none' }}
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="0.8" cy="0.8" r="0.9" fill={T.dot} />
          </pattern>
        </defs>
        <rect data-role="bg" x={viewBox.x - 5000} y={viewBox.y - 5000}
          width={viewBox.w + 10000} height={viewBox.h + 10000} fill={T.bg}/>
        <rect data-role="bg" x={viewBox.x - 5000} y={viewBox.y - 5000}
          width={viewBox.w + 10000} height={viewBox.h + 10000} fill="url(#dots)"/>

        {/* Rectangle de sélection */}
        {rectDraw && (
          <rect
            x={Math.min(rectDraw.x1, rectDraw.x2)}
            y={Math.min(rectDraw.y1, rectDraw.y2)}
            width={Math.abs(rectDraw.x2 - rectDraw.x1)}
            height={Math.abs(rectDraw.y2 - rectDraw.y1)}
            fill="rgba(75,92,232,0.08)"
            stroke="rgba(75,92,232,0.75)"
            strokeWidth={Math.max(1, 2 / (scale || 1))}
            strokeDasharray={`${6 / (scale||1)} ${3 / (scale||1)}`}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Preview ligne connect drag */}
        {connDrag && (() => {
          const fromNode = nodes.find(n => n.id === connDrag.fromId);
          if (!fromNode) return null;
          const p1 = borderPt(fromNode, connDrag.x, connDrag.y);
          return (
            <line
              x1={p1.x} y1={p1.y} x2={connDrag.x} y2={connDrag.y}
              stroke="#20c997" strokeWidth={2} strokeDasharray="6 4"
              strokeLinecap="round" style={{ pointerEvents: 'none' }}
            />
          );
        })()}

        {/* Edges */}
        {edges.map(eg => {
          const a = nodes.find(n => n.id === eg.from);
          const b = nodes.find(n => n.id === eg.to);
          if (!a || !b) return null;
          const p1 = borderPt(a, b.x, b.y);
          const p2 = borderPt(b, a.x, a.y);
          const isSelE = selEdge === eg.id;
          return (
            <g key={eg.id} data-role="edge" data-id={eg.id}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="transparent" strokeWidth={24} />
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={edgeColor}
                strokeWidth={isSelE ? 4 : 2}
                strokeLinecap="round"
                style={{ pointerEvents:'none' }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isSel = sel === node.id;
          const isConn = conn === node.id;
          const isMultiSel = multiSel.has(node.id);
          const R = 8;
          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
              <g data-role="node" data-id={node.id}>
                {node.imageUrl ? (
                  <>
                    <rect x={-node.w/2+2} y={-node.h/2+3}
                      width={node.w} height={node.h} rx={R}
                      fill="rgba(0,0,0,0.18)" />
                    <clipPath id={`clip-${node.id}`}>
                      <rect x={-node.w/2} y={-node.h/2} width={node.w} height={node.h} rx={R} />
                    </clipPath>
                    <image href={node.imageUrl}
                      x={-node.w/2} y={-node.h/2}
                      width={node.w} height={node.h}
                      preserveAspectRatio="xMidYMid meet"
                      clipPath={`url(#clip-${node.id})`}
                      style={{ pointerEvents:'none' }}
                    />
                    <rect x={-node.w/2} y={-node.h/2}
                      width={node.w} height={node.h} rx={R}
                      fill="transparent"
                      stroke={isSel?'rgba(255,255,255,0.95)':isConn?'rgba(255,255,255,0.75)':'rgba(255,255,255,0.15)'}
                      strokeWidth={isSel?3:isConn?2.5:1}
                      strokeDasharray={isConn?'6 3':'none'}
                    />
                  </>
                ) : (
                  <>
                    <rect x={-node.w/2+2} y={-node.h/2+3}
                      width={node.w} height={node.h} rx={R}
                      fill="rgba(0,0,0,0.15)" />
                    <rect x={-node.w/2} y={-node.h/2}
                      width={node.w} height={node.h} rx={R}
                      fill={node.color}
                      stroke={isSel?'rgba(255,255,255,0.95)':isConn?'rgba(255,255,255,0.75)':isMultiSel?'rgba(75,92,232,0.95)':'transparent'}
                      strokeWidth={isSel?3:isConn?2.5:isMultiSel?2.5:0}
                      strokeDasharray={isConn?'6 3':isMultiSel?'5 3':'none'}
                    />
                    {node.id !== editId && (() => {
                      const lines = node.text.split('\n');
                      const fs = node.fs || 13;
                      const lh = fs * 1.25;
                      const topOff = -((lines.length - 1) * lh) / 2;
                      return lines.map((line, i) => (
                        <text key={i} x={0} y={topOff + i * lh}
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize={fs} fill="#fff" fontWeight="600"
                          fontFamily="system-ui,sans-serif"
                          style={{ pointerEvents:'none', userSelect:'none' }}
                        >
                          {line}
                        </text>
                      ));
                    })()}
                  </>
                )}
              </g>
              {/* Handle déplacement — toujours visible, coin haut-gauche */}
              <g data-role="grip" data-id={node.id} style={{ cursor: 'grab' }}>
                <rect x={-node.w/2} y={-node.h/2} width={20} height={20} rx={4}
                  fill="rgba(0,0,0,0.25)" />
                <text x={-node.w/2+10} y={-node.h/2+11} textAnchor="middle"
                  fontSize="10" fill="rgba(255,255,255,0.85)"
                  style={{ pointerEvents:'none', userSelect:'none' }}>⠿</text>
              </g>
              {isSel && (
                <>
                  <g data-role="resize" data-id={node.id} data-lockw="1">
                    <rect x={-22} y={node.h/2-5} width={44} height={13} rx={5}
                      fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
                    <line x1={-10} y1={node.h/2+1.5} x2={10} y2={node.h/2+1.5}
                      stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                  <g data-role="resize" data-id={node.id} data-lockw="0">
                    <rect x={node.w/2-21} y={node.h/2-21} width={21} height={21} rx={5}
                      fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
                    <text x={node.w/2-10.5} y={node.h/2-5.5} textAnchor="middle"
                      fontSize="14" fill="#333" fontWeight="bold"
                      style={{pointerEvents:'none'}}>⤡</text>
                  </g>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating text editor */}
      {editId && (() => {
        const node = nodes.find(n => n.id === editId);
        if (!node || !svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const screenX = ((node.x - viewBox.x) / viewBox.w) * rect.width;
        const screenY = ((node.y - viewBox.y) / viewBox.h) * rect.height;
        const sW = node.w * scale;
        const sH = node.h * scale;
        return (
          <div style={{
            position:'fixed',
            left: rect.left + screenX - sW/2,
            top:  rect.top  + screenY - sH/2,
            width: sW, height: sH,
            zIndex:50, display:'flex', alignItems:'center',
          }}>
            <input ref={inputRef}
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if(e.key==='Enter') commitEdit(); if(e.key==='Escape') setEditId(null); }}
              style={{
                width:'100%', height:'100%', boxSizing:'border-box',
                background: node.color,
                border:'2px solid rgba(255,255,255,0.8)',
                borderRadius: 8,
                color:'#fff', fontFamily:'system-ui,sans-serif',
                fontSize: (node.fs||13) * scale, fontWeight:'600',
                textAlign:'center', outline:'none', padding:`0 ${10}px`,
                boxShadow:`0 0 0 3px ${node.color}55`,
              }}
            />
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{
        position:'absolute', bottom:14, left:14,
        color:T.sub, fontSize:11, lineHeight:1.8, pointerEvents:'none'
      }}>
        <div>Nœud → glisser pour déplacer</div>
        <div>Fond → scroll · 2 doigts → zoom</div>
      </div>

      {/* FAB image — portal sur document.body pour échapper overflow:hidden */}
      {tab !== 'planning' && tab !== 'gina' && createPortal(
        <button
          onClick={() => imgFileRef.current?.click()}
          disabled={uploading}
          style={{
            position:'fixed', bottom:28, right:20, zIndex:9999,
            width:72, height:72, borderRadius:36,
            background: uploading ? '#f97316' : '#4b5ce8',
            color:'#fff', border:'3px solid rgba(255,255,255,0.6)',
            boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
            fontSize:13, fontWeight:'800',
            cursor: uploading ? 'wait' : 'pointer',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            lineHeight:1.1, gap:2,
          }}
        >
          <span style={{fontSize:22, lineHeight:1}}>+</span>
          <span style={{fontSize:11}}>IMG</span>
        </button>,
        document.body
      )}

      {/* ── Onglet Planning ── */}
      {tab === 'planning' && (
        <WeeklyPlanning cells={planningCells} onChange={setPlanningCells} dark={dark} />
      )}

      {/* ── Onglet GINA ── */}
      {tab === 'gina' && ready && (
        <WorkflowMindMap
          initNodes={GINA_INIT_NODES}
          initEdges={GINA_INIT_EDGES}
          initViewBox={{ x: -80, y: -30, w: 2300, h: 1400 }}
          savedData={ginaData}
          onChange={setGinaData}
          dark={dark}
          clipboard={clipboard}
          onClipboardChange={setClipboard}
        />
      )}

      {/* ── Onglet Parcours MA — toujours monté, juste caché ── */}
      <div ref={pWrapRef} style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: tab === 'parcours' ? 'block' : 'none',
      }}>
        {/* Rect-select overlay */}
        {pMode === 'rect' && (
          <div
            style={{ position:'absolute', inset:0, zIndex:25, cursor:'crosshair' }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              const wrap = pWrapRef.current;
              if (!wrap) return;
              const r  = wrap.getBoundingClientRect();
              const vb = pViewBoxRef.current;
              const wx = vb.x + ((e.clientX - r.left) / r.width)  * vb.w;
              const wy = vb.y + ((e.clientY - r.top)  / r.height) * vb.h;
              pRectSelRef.current = { sx: wx, sy: wy, ex: wx, ey: wy };
              setPRectDraw({ x1: wx, y1: wy, x2: wx, y2: wy });
            }}
          />
        )}
        <ParcoursMindMap
          dark={dark} nodes={pNodes} setNodes={setPNodes}
          onBeforeChange={pSaveSnap} syncFs={syncFs}
          edges={pEdges} setEdges={setPEdges}
          viewBox={pViewBox} setViewBox={setPViewBox}
          sel={pSel} setSel={setPSel}
          multiSel={pMultiSel} rectDraw={pRectDraw}
          addMode={pMode === 'add'} onAddNode={(wx, wy) => {
            pSaveSnap();
            const nn = { id: `pe_${Date.now()}`, x: wx, y: wy, w: 160, h: 42, text: 'Nouveau', color: '#4b5ce8', fs: 10 };
            setPNodes(p => [...p, nn]);
            setPSel(nn.id);
            setPMode('select');
          }}
          triggerEditId={triggerEditIdP}
          connectMode={pMode === 'connect'} conn={pConn}
          onConnNode={(nodeId) => {
            if (!pConn) {
              setPConn(nodeId);
            } else if (pConn !== nodeId) {
              pSaveSnap();
              setPEdges(p => {
                const dup = p.find(e =>
                  (e.from === pConn && e.to === nodeId) ||
                  (e.from === nodeId && e.to === pConn)
                );
                return dup ? p : [...p, { id: `pe_${Date.now()}`, from: pConn, to: nodeId }];
              });
              setPConn(null);
              setPMode('select');
            }
          }}
        />
      </div>
    </div>
  );
}
