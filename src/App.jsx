import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ParcoursMindMap, { INIT_NODES as P_INIT_NODES } from "./ParcoursMindMap.jsx";

const PAL = ['#f5c540','#4ade80','#20c997','#4b5ce8','#e85555','#38bdf8','#a855f7','#f97316'];
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
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('mindmap');
  const [syncFs, setSyncFs] = useState(true);

  // ── État Parcours MA ──
  const [pNodes,    setPNodes]    = useState(P_INIT_NODES);
  const [pSelAll,   setPSelAll]   = useState(false);
  const [pSliderFs, setPSliderFs] = useState(0);
  const [pSliderW,  setPSliderW]  = useState(0);
  const [pSliderH,  setPSliderH]  = useState(0);
  const pBaseNodesRef = useRef(null);
  const pNodesRef = useRef(pNodes);

  // ── Undo / Redo ──
  const undoRef  = useRef([]);
  const redoRef  = useRef([]);
  const pUndoRef = useRef([]);
  const pRedoRef = useRef([]);
  const [histVer, setHistVer] = useState(0);

  const svgRef    = useRef(null);
  const inputRef  = useRef(null);
  const imgFileRef = useRef(null);
  const editValRef = useRef('');
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
  useEffect(() => { stateRef.current.syncFs = syncFs; }, [syncFs]);
  useEffect(() => { pNodesRef.current = pNodes; }, [pNodes]);

  // Load from storage & init viewBox to screen size
  useEffect(() => {
    loadSaved().then(d => {
      if (d?.nodes?.length) {
        setNodes(d.nodes);
        setEdges(d.edges || []);
        setDark(!!d.dark);
        if (d.edgeColor) setEdgeColor(d.edgeColor);
        if (d.pNodes?.length) setPNodes(d.pNodes);
        const mx = Math.max(10, ...d.nodes.map(n => parseInt(n.id.slice(1)) || 0));
        UID = mx + 1;
      }
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        if (d?.viewBox) setViewBox(d.viewBox);
        else setViewBox({ x: 0, y: 0, w: rect.width, h: rect.height });
      }
      setReady(true);
    });
  }, []);

  // Auto-save
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => save({ nodes, edges, dark, viewBox, edgeColor, pNodes }), 500);
    return () => clearTimeout(t);
  }, [nodes, edges, dark, viewBox, edgeColor, pNodes, ready]);

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

    const startGesture = (points, target) => {
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
          s.gesture = { type: 'move', id: node.id, ox: w.x - node.x, oy: w.y - node.y, snapSaved: false };
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
        const node = s.nodes.find(n => n.id === nodeId);
        if (node) {
          setSel(nodeId);
          setSelEdge(null);
          const w = toWorld(t.clientX, t.clientY);
          s.gesture = { type: 'move', id: nodeId, ox: w.x - node.x, oy: w.y - node.y, snapSaved: false };
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
      s.gesture = {
        type: 'pan',
        startX: t.clientX, startY: t.clientY,
        startVB: { ...s.viewBox },
      };
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
        setNodes(p => p.map(n => n.id === id ? { ...n, x: w.x - g.ox, y: w.y - g.oy } : n));
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

    const endGesture = () => { stateRef.current.gesture = null; };

    const onTS = (e) => { e.preventDefault(); startGesture([...e.touches], e.target); };
    const onTM = (e) => { e.preventDefault(); moveGesture([...e.touches]); };
    const onTE = (e) => { e.preventDefault(); if (e.touches.length === 0) endGesture(); };

    let mouseDown = false;
    const onMD = (e) => { mouseDown = true; startGesture([{ clientX: e.clientX, clientY: e.clientY }], e.target); };
    const onMM = (e) => { if (mouseDown) moveGesture([{ clientX: e.clientX, clientY: e.clientY }]); };
    const onMU = () => { mouseDown = false; endGesture(); };

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
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup',   onMU);
    svg.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      svg.removeEventListener('touchstart',  onTS);
      svg.removeEventListener('touchmove',   onTM);
      svg.removeEventListener('touchend',    onTE);
      svg.removeEventListener('touchcancel', onTE);
      svg.removeEventListener('mousedown', onMD);
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('mouseup',   onMU);
      svg.removeEventListener('wheel', onWheel);
    };
  }, [ready]);

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

  // Ctrl+A → select all
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        baseNodesRef.current = stateRef.current.nodes.map(n => ({ ...n }));
        setSliderFs(0); setSliderW(0); setSliderH(0);
        setSelAll(true);
        setSel(null);
        setSelEdge(null);
      }
      if (e.key === 'Escape') {
        setSelAll(false);
        setSel(null);
        setSelEdge(null);
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
    setSel(null);
    setSelEdge(null);
  };

  const onSliderFs = (val) => {
    setSliderFs(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, fs: Math.max(9, Math.min(40, (b.fs||13) + val)) } : n;
    }));
  };

  const onSliderW = (val) => {
    setSliderW(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, w: Math.max(80, b.w + val) } : n;
    }));
  };

  const onSliderH = (val) => {
    setSliderH(val);
    const base = baseNodesRef.current;
    if (!base) return;
    setNodes(p => p.map(n => {
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
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, fs: Math.max(6, Math.min(40, (b.fs || 10) + val)) } : n;
    }));
  };
  const onPSliderW = (val) => {
    setPSliderW(val);
    const base = pBaseNodesRef.current;
    if (!base) return;
    setPNodes(p => p.map(n => {
      const b = base.find(b => b.id === n.id);
      return b ? { ...n, w: Math.max(60, b.w + val) } : n;
    }));
  };
  const onPSliderH = (val) => {
    setPSliderH(val);
    const base = pBaseNodesRef.current;
    if (!base) return;
    setPNodes(p => p.map(n => {
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
  const activeSelAll     = tab === 'mindmap' ? selAll     : pSelAll;
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
        {[{k:'mindmap',l:'⬡ Map'},{k:'parcours',l:'☷ Parcours MA'}].map(b => (
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
          {k:'select',l:'↖'},{k:'add',l:'＋'},{k:'connect',l:'⟷'}
        ].map(b => (
          <button key={b.k} onClick={() => { setMode(b.k); setConn(null); setSelAll(false); }} style={{
            background: mode===b.k ? '#4b5ce8' : T.btnBg,
            color: mode===b.k ? '#fff' : T.btnTxt,
            border:'none', borderRadius:7, padding:'5px 10px',
            fontSize:13, cursor:'pointer', fontWeight: mode===b.k ? '600':'normal',
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
        </>}

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

      {/* Hidden image input */}
      <input ref={imgFileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value=''; }}
      />

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
                      stroke={isSel?'rgba(255,255,255,0.95)':isConn?'rgba(255,255,255,0.75)':'transparent'}
                      strokeWidth={isSel?3:isConn?2.5:0}
                      strokeDasharray={isConn?'6 3':'none'}
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
      {createPortal(
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

      {/* ── Onglet Parcours MA — toujours monté, juste caché ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: tab === 'parcours' ? 'block' : 'none',
      }}>
        <ParcoursMindMap dark={dark} nodes={pNodes} setNodes={setPNodes} onBeforeChange={pSaveSnap} syncFs={syncFs} />
      </div>
    </div>
  );
}
