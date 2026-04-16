import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ── Palette couleurs ───────────────────────────────────────────
const C = {
  entry:  '#1a3a6e',
  mg:     '#166534',
  dep:    '#1e40af',
  chir:   '#991b1b',
  scan:   '#b45309',
  med:    '#78350f',
  asst:   '#5b21b6',
  toos:   '#075985',
  derm:   '#4c1d95',
  nsp:    '#334155',
  admin:  '#0c4a6e',
  postop: '#7c2d12',
  warn:   '#b91c1c',
  laser:  '#92400e',
};

const PAL_P = [
  // Jaunes/oranges
  '#f5c540','#fbbf24','#f97316','#fb923c',
  // Verts
  '#4ade80','#20c997','#10b981','#166534',
  // Bleus
  '#38bdf8','#4b5ce8','#1e40af','#075985','#0c4a6e',
  // Violets/roses
  '#a855f7','#7c3aed','#5b21b6','#4c1d95','#db2777',
  // Rouges
  '#e85555','#b91c1c','#991b1b','#7c2d12',
  // Bruns/ambre
  '#b45309','#92400e','#78350f',
  // Neutres
  '#334155','#475569','#64748b','#94a3b8',
  // Très clair / très foncé
  '#e2e8f0','#1e293b',
];

// ── Nœuds initiaux (x/y = centre) ─────────────────────────────
export const INIT_NODES = [
  // ── TITRE ─────────────────────────────────────────────────────
  { id:'title', x:1165, y:48,  w:900, h:52,
    text:'EXPLICATION DES PARCOURS — MAISON ABEILLE', color:C.entry, fs:13, bold:true },

  // ── ENTRÉE ────────────────────────────────────────────────────
  { id:'bv',    x:1165, y:130, w:520, h:48,
    text:'BIENVENUE — Orientation vers le bon parcours (≈ 1 min)', color:C.entry, fs:10 },
  { id:'motif', x:1165, y:218, w:460, h:56,
    text:'MOTIF PRINCIPAL ?\n1 RDV = 1 SEUL MOTIF', color:C.entry, fs:13, bold:true },

  // ── P1 — MÉDECINE GÉNÉRALE ────────────────────────────────────
  { id:'p1_h', x:100, y:335, w:220, h:52,
    text:'P1\nMÉDECINE GÉNÉRALE', color:C.mg, fs:11, bold:true },
  { id:'mg1',  x:100, y:420, w:210, h:42, text:'Type de consultation ?', color:C.mg, fs:10 },
  { id:'mg_a', x:90,  y:472, w:190, h:30, text:'Consultation médicale', color:C.mg, fs:9 },
  { id:'mg_b', x:90,  y:510, w:190, h:30, text:'Certificat / doc médical', color:C.mg, fs:9 },
  { id:'mg_c', x:90,  y:548, w:190, h:30, text:'Suivi médical', color:C.mg, fs:9 },
  { id:'mg_d', x:90,  y:586, w:190, h:30, text:'Orientation spécialiste', color:C.mg, fs:9 },
  { id:'mg_e', x:100, y:648, w:210, h:48,
    text:'LÉSION CUTANÉE\nen vue trt chirurgical', color:C.mg, fs:10, bold:true },
  { id:'mg_f', x:100, y:748, w:210, h:62,
    text:'Avis médical + diagnostic\n→ Orientation chir si indiqué\n(parfois J-même possible)', color:C.mg, fs:9 },

  // ── P2 — DÉPISTAGE ────────────────────────────────────────────
  { id:'p2_h', x:365, y:335, w:220, h:52,
    text:'P2\nDÉPISTAGE CUTANÉ', color:C.dep, fs:11, bold:true },
  { id:'a1',   x:365, y:420, w:210, h:42, text:'Type de demande ?', color:C.dep, fs:10 },
  { id:'a1a',  x:355, y:472, w:190, h:30, text:'Contrôle de routine', color:C.dep, fs:9 },
  { id:'a1b',  x:355, y:510, w:190, h:30, text:'Lésion qui a changé / inquiète', color:C.dep, fs:9 },
  { id:'a1c',  x:355, y:548, w:190, h:30, text:'Cartographie Fotofinder', color:C.dep, fs:9 },
  { id:'a2',   x:365, y:622, w:210, h:48,
    text:'Souhait :\ndermoscopie seule / retrait J-même ?', color:C.dep, fs:9 },
  { id:'a3',   x:365, y:716, w:210, h:48,
    text:'Antécédents cancer cutané ?\n(perso / famille / non)', color:C.dep, fs:9 },

  // ── P3 — CHIRURGIE DERMATOLOGIQUE ────────────────────────────
  { id:'p3_h', x:630, y:335, w:230, h:52,
    text:'P3\nCHIRURGIE DERMATO', color:C.chir, fs:11, bold:true },
  { id:'b1',   x:630, y:420, w:220, h:42, text:'Type de lésion ?', color:C.chir, fs:10 },
  { id:'b1a',  x:620, y:472, w:200, h:30, text:'Grain de beauté (nævus)', color:C.chir, fs:9 },
  { id:'b1b',  x:620, y:510, w:200, h:30, text:'Kyste / Lipome', color:C.chir, fs:9 },
  { id:'b1c',  x:620, y:548, w:200, h:30, text:'Chéloïde / Cicatrice', color:C.chir, fs:9 },
  { id:'b1d',  x:620, y:586, w:200, h:30, text:'Excroissance / Verrue', color:C.chir, fs:9 },
  { id:'b1e',  x:620, y:624, w:200, h:30, text:'Ne sait pas exactement', color:C.chir, fs:9 },
  { id:'b2',   x:630, y:712, w:220, h:60,
    text:'Intention :\nMédicalement suspecte\nInquiétant / Gênant bénin / Esthétique', color:C.chir, fs:9 },
  { id:'b3',   x:630, y:822, w:220, h:46,
    text:'Préférence :\nconsultation d\'abord / chir directe ?', color:C.chir, fs:9 },
  { id:'b4',   x:630, y:918, w:220, h:58,
    text:'⚠️ Info obligatoire\nAnesthésie locale — Pièce → anapath\n✓ Je confirme', color:C.chir, fs:9 },

  // ── P4 — LASER / ESTHÉTIQUE ───────────────────────────────────
  { id:'p4_h',    x:1255, y:295, w:1080, h:50,
    text:'P4 — LASER / ESTHÉTIQUE MÉDICALE', color:C.laser, fs:12, bold:true },

  // P4-A : 1ère consult + visage → Scanner 3D
  { id:'p4a_h',   x:845,  y:385, w:230, h:52,
    text:'1ÈRE CONSULT + VISAGE\n→ SCANNER 3D BILAN', color:C.scan, fs:10, bold:true },
  { id:'p4a1',    x:835,  y:464, w:210, h:36,
    text:'Rougeurs / Vaisseaux\ntélangiectasies · taches rubis · varicosités', color:C.scan, fs:8 },
  { id:'p4a2',    x:835,  y:510, w:210, h:36,
    text:'Mélasma · Taches brunes\nlentigos · hyperpigmentation', color:C.scan, fs:8 },
  { id:'p4a3',    x:835,  y:554, w:210, h:30, text:'Cicatrices d\'acné / Rides', color:C.scan, fs:9 },
  { id:'p4a_out', x:845,  y:620, w:210, h:46,
    text:'→ Protocole laser personnalisé\n(après bilan 3D)', color:C.scan, fs:9 },

  // P4-B : Actes par médecin
  { id:'p4b_h',   x:1110, y:385, w:230, h:52,
    text:'PAR MÉDECIN\n(dermato ou MG)', color:C.med, fs:10, bold:true },
  { id:'p4b1',    x:1110, y:468, w:210, h:40, text:'Détatouage laser', color:C.med, fs:10 },

  // P4-C : Actes délégables assistante
  { id:'p4c_h',   x:1385, y:385, w:230, h:52,
    text:'ACTES DÉLÉGABLES\nASSISTANTE', color:C.asst, fs:10, bold:true },
  { id:'p4c1',    x:1375, y:458, w:210, h:30, text:'Épilation définitive', color:C.asst, fs:9 },
  { id:'p4c2',    x:1375, y:496, w:210, h:30, text:'Hair bleaching', color:C.asst, fs:9 },
  { id:'p4c3',    x:1375, y:534, w:210, h:30, text:'HIFU — raffermissement visage', color:C.asst, fs:9 },
  { id:'p4c4',    x:1375, y:572, w:210, h:30, text:'Lips bleaching', color:C.asst, fs:9 },

  // P4-D : Actes Toosonix HIFU
  { id:'p4d_h',   x:1660, y:385, w:230, h:52,
    text:'ACTES TOOSONIX\nHIFU', color:C.toos, fs:10, bold:true },
  { id:'p4d1',    x:1650, y:458, w:210, h:36,
    text:'Verrues\n(⚠️ pieds → Dr Chrelias — chir)', color:C.toos, fs:9 },
  { id:'p4d2',    x:1650, y:502, w:210, h:30, text:'Kératoses actiniques', color:C.toos, fs:9 },
  { id:'p4d3',    x:1650, y:540, w:210, h:30, text:'Kératoses séborrhéiques', color:C.toos, fs:9 },
  { id:'p4d4',    x:1650, y:578, w:210, h:30, text:'Hydrocystomes / Syringomes', color:C.toos, fs:9 },
  { id:'p4d5',    x:1650, y:616, w:210, h:30, text:'Condylomes', color:C.toos, fs:9 },

  // ── P5 — DERMATO GÉNÉRALE ────────────────────────────────────
  { id:'p5_h',    x:1940, y:335, w:230, h:56,
    text:'P5 — DERMATO GÉNÉRALE\n⚠️ CRÉNEAUX LIMITÉS', color:C.derm, fs:10, bold:true },
  { id:'d1',      x:1940, y:424, w:220, h:42, text:'Type de problème ?', color:C.derm, fs:10 },
  { id:'d1a',     x:1930, y:476, w:200, h:30, text:'Problème chronique connu', color:C.derm, fs:9 },
  { id:'d1b',     x:1930, y:514, w:200, h:30, text:'Problème récent — avis', color:C.derm, fs:9 },
  { id:'d1c',     x:1930, y:552, w:200, h:30, text:'Demande spécifique', color:C.derm, fs:9 },
  { id:'d1_note', x:1940, y:630, w:220, h:62,
    text:'Spécialité MA :\ndépistage · chirurgie · laser\nDispo consultations générales limitée', color:C.derm, fs:9 },

  // ── P6 — JE NE SAIS PAS ──────────────────────────────────────
  { id:'p6_h',     x:2225, y:335, w:220, h:52,
    text:'JE NE SAIS PAS\nOrientation guidée', color:C.nsp, fs:11, bold:true },
  { id:'nsp1',     x:2225, y:420, w:210, h:44,
    text:'Identifier finalité\nlaser / chirurgicale ?', color:C.nsp, fs:10 },
  { id:'nsp_y',    x:2100, y:514, w:200, h:52,
    text:'OUI — lésion identifiable\n→ orienter bon parcours', color:C.nsp, fs:9 },
  { id:'nsp_chir', x:2100, y:622, w:200, h:54,
    text:'Finalité chir + pré-consult\n→ Consultation lésions\ncutanées vue trt chir', color:C.chir, fs:9 },
  { id:'nsp_n',    x:2380, y:514, w:210, h:58,
    text:'NON — finalité\nnon laser / non chir\n→ Dermato générale\n(⚠️ peu de créneaux)', color:C.derm, fs:9 },

  // ── COUVERTURE ADMINISTRATIVE ─────────────────────────────────
  { id:'adm_h',   x:870,  y:1050, w:310, h:52,
    text:'COUVERTURE ADMINISTRATIVE\n(tous parcours)', color:C.admin, fs:10, bold:true },
  { id:'adm_a',   x:720,  y:1152, w:200, h:34, text:'Carte Vitale + mutuelle', color:C.admin, fs:9 },
  { id:'adm_b',   x:950,  y:1152, w:140, h:34, text:'CMU / CSS', color:C.admin, fs:9 },
  { id:'adm_c',   x:1120, y:1152, w:200, h:34, text:'⚠️ AME → Hôpital', color:C.warn, fs:9, bold:true },
  { id:'adm_d',   x:865,  y:1196, w:290, h:34,
    text:'Étranger / assurance privée / sans mutuelle', color:C.admin, fs:9 },

  // ── DEVIS ─────────────────────────────────────────────────────
  { id:'devis_h', x:1460, y:1050, w:300, h:52,
    text:'DEVIS\n(si chirurgie ou esthétique médicale)', color:C.admin, fs:10, bold:true },
  { id:'dv1',     x:1360, y:1150, w:220, h:44,
    text:'Devis seul\n(patient envoie à sa mutuelle)', color:C.admin, fs:9 },
  { id:'dv2',     x:1630, y:1150, w:260, h:52,
    text:'Devis + estimation remboursement\n→ Joindre tableau de garanties', color:C.admin, fs:9 },

  // ── CONFIRMATION FINALE ───────────────────────────────────────
  { id:'conf',    x:1150, y:1296, w:500, h:58,
    text:'CONFIRMATION FINALE\nRécapitulatif motif + parcours → Valider mon RDV',
    color:C.entry, fs:11, bold:true },

  // ── AUTOMATISATION POST-OP ────────────────────────────────────
  { id:'postop_h', x:2300, y:1050, w:310, h:52,
    text:'AUTOMATISATION POST-OP\n(interne — non visible patient)', color:C.postop, fs:10, bold:true },
  { id:'po1',      x:2290, y:1148, w:280, h:40,
    text:'Résultats anapath → vérif lab / API', color:C.postop, fs:9 },
  { id:'po2',      x:2290, y:1238, w:300, h:42,
    text:'→ Visio remise résultats J+14 (auto)', color:C.postop, fs:9 },
  { id:'po3',      x:2290, y:1330, w:290, h:42,
    text:'Alertes : retard · non-programmé · dossier incomplet', color:C.postop, fs:9 },
];

// ── Connexions ─────────────────────────────────────────────────
export const INIT_EDGES = [
  { id:'e_bv',    from:'bv',      to:'motif' },
  { id:'em_p1',   from:'motif',   to:'p1_h' },
  { id:'em_p2',   from:'motif',   to:'p2_h' },
  { id:'em_p3',   from:'motif',   to:'p3_h' },
  { id:'em_p4',   from:'motif',   to:'p4_h' },
  { id:'em_p5',   from:'motif',   to:'p5_h' },
  { id:'em_p6',   from:'motif',   to:'p6_h' },
  // P1
  { id:'e_mg1',   from:'p1_h',    to:'mg1' },
  { id:'e_mga',   from:'mg1',     to:'mg_a' },
  { id:'e_mgb',   from:'mg1',     to:'mg_b' },
  { id:'e_mgc',   from:'mg1',     to:'mg_c' },
  { id:'e_mgd',   from:'mg1',     to:'mg_d' },
  { id:'e_mge',   from:'mg1',     to:'mg_e' },
  { id:'e_mgf',   from:'mg_e',    to:'mg_f' },
  // P2
  { id:'e_a1',    from:'p2_h',    to:'a1' },
  { id:'e_a1a',   from:'a1',      to:'a1a' },
  { id:'e_a1b',   from:'a1',      to:'a1b' },
  { id:'e_a1c',   from:'a1',      to:'a1c' },
  { id:'e_a2',    from:'a1',      to:'a2' },
  { id:'e_a3',    from:'a2',      to:'a3' },
  // P3
  { id:'e_b1',    from:'p3_h',    to:'b1' },
  { id:'e_b1a',   from:'b1',      to:'b1a' },
  { id:'e_b1b',   from:'b1',      to:'b1b' },
  { id:'e_b1c',   from:'b1',      to:'b1c' },
  { id:'e_b1d',   from:'b1',      to:'b1d' },
  { id:'e_b1e',   from:'b1',      to:'b1e' },
  { id:'e_b2',    from:'b1',      to:'b2' },
  { id:'e_b3',    from:'b2',      to:'b3' },
  { id:'e_b4',    from:'b3',      to:'b4' },
  // P4
  { id:'e_p4a',   from:'p4_h',    to:'p4a_h' },
  { id:'e_p4b',   from:'p4_h',    to:'p4b_h' },
  { id:'e_p4c',   from:'p4_h',    to:'p4c_h' },
  { id:'e_p4d',   from:'p4_h',    to:'p4d_h' },
  { id:'e_4a1',   from:'p4a_h',   to:'p4a1' },
  { id:'e_4a2',   from:'p4a_h',   to:'p4a2' },
  { id:'e_4a3',   from:'p4a_h',   to:'p4a3' },
  { id:'e_4ao',   from:'p4a_h',   to:'p4a_out' },
  { id:'e_4b1',   from:'p4b_h',   to:'p4b1' },
  { id:'e_4c1',   from:'p4c_h',   to:'p4c1' },
  { id:'e_4c2',   from:'p4c_h',   to:'p4c2' },
  { id:'e_4c3',   from:'p4c_h',   to:'p4c3' },
  { id:'e_4c4',   from:'p4c_h',   to:'p4c4' },
  { id:'e_4d1',   from:'p4d_h',   to:'p4d1' },
  { id:'e_4d2',   from:'p4d_h',   to:'p4d2' },
  { id:'e_4d3',   from:'p4d_h',   to:'p4d3' },
  { id:'e_4d4',   from:'p4d_h',   to:'p4d4' },
  { id:'e_4d5',   from:'p4d_h',   to:'p4d5' },
  // P5
  { id:'e_d1',    from:'p5_h',    to:'d1' },
  { id:'e_d1a',   from:'d1',      to:'d1a' },
  { id:'e_d1b',   from:'d1',      to:'d1b' },
  { id:'e_d1c',   from:'d1',      to:'d1c' },
  { id:'e_d1n',   from:'d1',      to:'d1_note' },
  // P6
  { id:'e_nsp1',  from:'p6_h',    to:'nsp1' },
  { id:'e_nspy',  from:'nsp1',    to:'nsp_y' },
  { id:'e_nspyc', from:'nsp_y',   to:'nsp_chir' },
  { id:'e_nspn',  from:'nsp1',    to:'nsp_n' },
  // Admin
  { id:'e_adma',  from:'adm_h',   to:'adm_a' },
  { id:'e_admb',  from:'adm_h',   to:'adm_b' },
  { id:'e_admc',  from:'adm_h',   to:'adm_c' },
  { id:'e_admd',  from:'adm_h',   to:'adm_d' },
  // Devis
  { id:'e_dv1',   from:'devis_h', to:'dv1' },
  { id:'e_dv2',   from:'devis_h', to:'dv2' },
  // Conf
  { id:'e_cf1',   from:'adm_h',   to:'conf' },
  { id:'e_cf2',   from:'devis_h', to:'conf' },
  // Post-op
  { id:'e_po1',   from:'postop_h',to:'po1' },
  { id:'e_po2',   from:'po1',     to:'po2' },
  { id:'e_po3',   from:'po2',     to:'po3' },
];

function borderPt(n, tx, ty) {
  const dx = tx - n.x, dy = ty - n.y;
  if (!dx && !dy) return { x: n.x, y: n.y };
  const hw = n.w / 2 + 1, hh = n.h / 2 + 1;
  const tX = dx ? hw / Math.abs(dx) : Infinity;
  const tY = dy ? hh / Math.abs(dy) : Infinity;
  const t  = Math.min(tX, tY);
  return { x: n.x + dx * t, y: n.y + dy * t };
}

export default function ParcoursMindMap({
  dark, nodes, setNodes, onBeforeChange, syncFs,
  edges, setEdges, connectMode, conn, onConnNode,
  // contrôle externe optionnel
  viewBox: extViewBox, setViewBox: extSetViewBox,
  sel: extSel, setSel: extSetSel,
  addMode, onAddNode,
  multiSel = new Set(), rectDraw,
  triggerEditId,   // déclenche l'édition depuis l'extérieur
}) {
  const svgRef   = useRef(null);
  const inputRef = useRef(null);

  const INIT_VB = { x: -60, y: -10, w: 2620, h: 1380 };
  const [_viewBox, _setViewBox] = useState(extViewBox || INIT_VB);
  const [_sel,     _setSel]     = useState(extSel    || null);
  const [editId,   setEditId]   = useState(null);
  const [editVal,  setEditVal]  = useState('');

  // Si prop externe fournie, l'utiliser ; sinon état interne
  const viewBox    = extViewBox    !== undefined ? extViewBox    : _viewBox;
  const setViewBox = extSetViewBox !== undefined ? extSetViewBox : _setViewBox;
  const sel        = extSel        !== undefined ? extSel        : _sel;
  const setSel     = extSetSel     !== undefined ? extSetSel     : _setSel;

  const editValRef = useRef('');
  useEffect(() => { editValRef.current = editVal; }, [editVal]);

  const stateRef = useRef({
    viewBox: extViewBox || INIT_VB,
    nodes:   INIT_NODES,
    sel:     null,
    editId:  null,
    gesture: null,
    lastTap: { nodeId: null, time: 0 },
    onBeforeChange: null,
    multiSel:  new Set(),
    addMode:   false,
    onAddNode: null,
  });
  useEffect(() => { stateRef.current.viewBox        = viewBox;       }, [viewBox]);
  useEffect(() => { stateRef.current.nodes          = nodes;         }, [nodes]);
  useEffect(() => { stateRef.current.sel            = sel;           }, [sel]);
  useEffect(() => { stateRef.current.editId         = editId;        }, [editId]);
  useEffect(() => { stateRef.current.onBeforeChange = onBeforeChange;}, [onBeforeChange]);
  useEffect(() => { stateRef.current.syncFs         = syncFs;        }, [syncFs]);
  useEffect(() => { stateRef.current.connectMode    = connectMode;   }, [connectMode]);
  useEffect(() => { stateRef.current.conn           = conn;          }, [conn]);
  useEffect(() => { stateRef.current.onConnNode     = onConnNode;    }, [onConnNode]);
  useEffect(() => { stateRef.current.multiSel       = multiSel;      }, [multiSel]);
  useEffect(() => { stateRef.current.addMode        = addMode;       }, [addMode]);
  useEffect(() => { stateRef.current.onAddNode      = onAddNode;     }, [onAddNode]);

  // Édition déclenchée depuis l'extérieur (bouton ✏ dans WorkflowMindMap)
  useEffect(() => {
    if (!triggerEditId) return;
    const nodeId = triggerEditId.split('|')[0];
    const node = nodes.find(n => n.id === nodeId);
    if (node) { setEditId(nodeId); setEditVal(node.text); }
  }, [triggerEditId]);

  useEffect(() => {
    if (editId) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 15);
  }, [editId]);

  const commitEdit = () => {
    const id = stateRef.current.editId;
    if (!id) return;
    const val = editValRef.current.trim();
    if (val) {
      stateRef.current.onBeforeChange?.();
      setNodes(p => p.map(n => n.id === id ? { ...n, text: val } : n));
    }
    setEditId(null);
  };

  // ── Interactions natives ─────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const toWorld = (cx, cy) => {
      const rect = svg.getBoundingClientRect();
      const vb   = stateRef.current.viewBox;
      return {
        x: vb.x + ((cx - rect.left) / rect.width)  * vb.w,
        y: vb.y + ((cy - rect.top)  / rect.height) * vb.h,
      };
    };

    const hitNode = (target) => {
      let el = target;
      while (el && el !== svg) {
        const role = el.getAttribute?.('data-role');
        if (role === 'resize') return null;
        if (role === 'node') return el.getAttribute('data-nid');
        el = el.parentNode;
      }
      return null;
    };

    const hitResize = (target) => {
      let el = target;
      while (el && el !== svg) {
        if (el.getAttribute?.('data-role') === 'resize') {
          return { nodeId: el.getAttribute('data-nid'), lockW: el.getAttribute('data-lockw') === '1' };
        }
        el = el.parentNode;
      }
      return null;
    };

    const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const startGesture = (pts, target) => {
      const s = stateRef.current;
      if (s.editId) return;

      if (pts.length >= 2) {
        s.gesture = {
          type: 'pinch', d0: dist(pts[0], pts[1]),
          vb0: { ...s.viewBox },
          mx: (pts[0].clientX + pts[1].clientX) / 2,
          my: (pts[0].clientY + pts[1].clientY) / 2,
        };
        return;
      }

      const rh = hitResize(target);
      if (rh) {
        const node = s.nodes.find(n => n.id === rh.nodeId);
        if (node) {
          const wp = toWorld(pts[0].clientX, pts[0].clientY);
          s.gesture = {
            type: 'resize', nodeId: rh.nodeId,
            sx: wp.x, sy: wp.y, ow: node.w, oh: node.h, ofs: node.fs || 10,
            lockW: rh.lockW, snapSaved: false,
          };
        }
        return;
      }

      const nodeId = hitNode(target);
      if (nodeId) {
        if (s.connectMode) {
          s.onConnNode?.(nodeId);
          s.gesture = { type: 'tap' };
          return;
        }
        setSel(nodeId);
        const node = s.nodes.find(n => n.id === nodeId);
        const wp   = toWorld(pts[0].clientX, pts[0].clientY);
        const ms   = s.multiSel || new Set();
        if (ms.has(nodeId) && ms.size > 1) {
          // Drag groupé : tous les nœuds sélectionnés bougent ensemble
          const startPositions = {};
          ms.forEach(id => {
            const n = s.nodes.find(n => n.id === id);
            if (n) startPositions[id] = { ox: n.x - wp.x, oy: n.y - wp.y };
          });
          s.gesture = {
            type: 'group_drag', startPositions,
            hasMoved: false, t0: Date.now(), snapSaved: false,
          };
        } else {
          s.gesture = {
            type: 'drag', nodeId,
            ox: node.x - wp.x, oy: node.y - wp.y,
            hasMoved: false, t0: Date.now(), snapSaved: false,
          };
        }
      } else {
        if (s.addMode) {
          const wp = toWorld(pts[0].clientX, pts[0].clientY);
          s.onAddNode?.(wp.x, wp.y);
          s.gesture = { type: 'tap' };
          return;
        }
        setSel(null);
        s.gesture = {
          type: 'pan', vb0: { ...s.viewBox },
          sx: pts[0].clientX, sy: pts[0].clientY,
        };
      }
    };

    const updateGesture = (pts) => {
      const s = stateRef.current;
      if (!s.gesture) return;

      if (s.gesture.type === 'pinch' && pts.length >= 2) {
        const d1     = dist(pts[0], pts[1]);
        const factor = s.gesture.d0 / (d1 || 1);
        const rect   = svg.getBoundingClientRect();
        const mx = s.gesture.vb0.x + ((s.gesture.mx - rect.left) / rect.width)  * s.gesture.vb0.w;
        const my = s.gesture.vb0.y + ((s.gesture.my - rect.top)  / rect.height) * s.gesture.vb0.h;
        setViewBox({
          x: mx + (s.gesture.vb0.x - mx) * factor,
          y: my + (s.gesture.vb0.y - my) * factor,
          w: s.gesture.vb0.w * factor, h: s.gesture.vb0.h * factor,
        });
      } else if (s.gesture.type === 'pan') {
        const rect = svg.getBoundingClientRect();
        const dx   = (s.gesture.sx - pts[0].clientX) / rect.width  * s.gesture.vb0.w;
        const dy   = (s.gesture.sy - pts[0].clientY) / rect.height * s.gesture.vb0.h;
        setViewBox({ ...s.gesture.vb0, x: s.gesture.vb0.x + dx, y: s.gesture.vb0.y + dy });
      } else if (s.gesture.type === 'drag') {
        if (!s.gesture.snapSaved) {
          s.onBeforeChange?.();
          s.gesture.snapSaved = true;
        }
        const wp = toWorld(pts[0].clientX, pts[0].clientY);
        s.gesture.hasMoved = true;
        setNodes(p => p.map(n => n.id === s.gesture.nodeId
          ? { ...n, x: wp.x + s.gesture.ox, y: wp.y + s.gesture.oy } : n));
      } else if (s.gesture.type === 'group_drag') {
        if (!s.gesture.snapSaved) {
          s.onBeforeChange?.();
          s.gesture.snapSaved = true;
        }
        const wp = toWorld(pts[0].clientX, pts[0].clientY);
        s.gesture.hasMoved = true;
        const sp = s.gesture.startPositions;
        setNodes(p => p.map(n => {
          const pos = sp[n.id];
          return pos ? { ...n, x: wp.x + pos.ox, y: wp.y + pos.oy } : n;
        }));
      } else if (s.gesture.type === 'resize') {
        if (!s.gesture.snapSaved) {
          s.onBeforeChange?.();
          s.gesture.snapSaved = true;
        }
        const wp = toWorld(pts[0].clientX, pts[0].clientY);
        const dw = wp.x - s.gesture.sx, dh = wp.y - s.gesture.sy;
        const g = s.gesture;
        const newW = Math.max(80, g.ow + dw);
        const newH = Math.max(24, g.oh + dh);
        const scaleF = g.lockW ? newH / g.oh : (newW / g.ow + newH / g.oh) / 2;
        setNodes(p => p.map(n => n.id === g.nodeId ? {
          ...n,
          w: g.lockW ? n.w : newW,
          h: newH,
          ...(s.syncFs ? { fs: Math.max(6, Math.min(40, Math.round(g.ofs * scaleF))) } : {}),
        } : n));
      }
    };

    const endGesture = (pts) => {
      const s = stateRef.current;
      if (!s.gesture) return;

      // Tap → double-tap → edit
      if ((s.gesture.type === 'drag' || s.gesture.type === 'group_drag') && !s.gesture.hasMoved && Date.now() - s.gesture.t0 < 300) {
        const nodeId = s.gesture.nodeId || (s.gesture.type === 'group_drag' ? null : null);
        if (!nodeId) { if (pts.length < 2) s.gesture = null; return; }
        if (!s.connectMode) {
          const lt  = s.lastTap;
          const now = Date.now();
          if (lt.nodeId === nodeId && now - lt.time < 450) {
            const node = s.nodes.find(n => n.id === nodeId);
            if (node) { setEditId(nodeId); setEditVal(node.text); }
            s.lastTap = { nodeId: null, time: 0 };
          } else {
            s.lastTap = { nodeId, time: now };
          }
        }
      }

      if (pts.length < 2) s.gesture = null;
    };

    // Desktop double-click
    const onDblClick = (e) => {
      const nodeId = hitNode(e.target);
      if (nodeId) {
        const node = stateRef.current.nodes.find(n => n.id === nodeId);
        if (node) { setEditId(nodeId); setEditVal(node.text); }
      }
    };

    // Wheel zoom
    const onWheel = (e) => {
      e.preventDefault();
      const rect   = svg.getBoundingClientRect();
      const vb     = stateRef.current.viewBox;
      const mx     = vb.x + ((e.clientX - rect.left) / rect.width)  * vb.w;
      const my     = vb.y + ((e.clientY - rect.top)  / rect.height) * vb.h;
      const factor = e.deltaY < 0 ? 0.85 : 1 / 0.85;
      setViewBox({
        x: mx + (vb.x - mx) * factor, y: my + (vb.y - my) * factor,
        w: vb.w * factor, h: vb.h * factor,
      });
    };

    const onDown   = (e) => { if (e.button !== 0) return; startGesture([e], e.target); };
    const onMove   = (e) => { updateGesture([e]); };
    const onUp     = (e) => { endGesture([e]); };
    const onTouchS = (e) => { e.preventDefault(); startGesture(Array.from(e.touches), e.target); };
    const onTouchM = (e) => { e.preventDefault(); updateGesture(Array.from(e.touches)); };
    const onTouchE = (e) => { endGesture(Array.from(e.changedTouches)); };

    svg.addEventListener('mousedown',  onDown);
    svg.addEventListener('dblclick',   onDblClick);
    svg.addEventListener('wheel',      onWheel,  { passive: false });
    svg.addEventListener('touchstart', onTouchS, { passive: false });
    svg.addEventListener('touchmove',  onTouchM, { passive: false });
    svg.addEventListener('touchend',   onTouchE, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);

    return () => {
      svg.removeEventListener('mousedown',  onDown);
      svg.removeEventListener('dblclick',   onDblClick);
      svg.removeEventListener('wheel',      onWheel);
      svg.removeEventListener('touchstart', onTouchS);
      svg.removeEventListener('touchmove',  onTouchM);
      svg.removeEventListener('touchend',   onTouchE);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // ── Thème ────────────────────────────────────────────────────
  const T = dark
    ? { bg: '#0a0f1e', edge: 'rgba(255,255,255,0.22)', sub: '#64748b', bar: 'rgba(15,22,40,0.92)' }
    : { bg: '#f0f4ff', edge: 'rgba(0,0,0,0.20)',       sub: '#94a3b8', bar: 'rgba(240,244,255,0.93)' };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const selNode = nodes.find(n => n.id === sel);
  const scale   = svgRef.current
    ? svgRef.current.getBoundingClientRect().width / viewBox.w : 1;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg,
      touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
      cursor: 'grab',
    }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      >
        <defs>
          <marker id="arr_p" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill={T.edge} />
          </marker>
        </defs>

        {/* ── Connexions ── */}
        {(edges || INIT_EDGES).map(e => {
          const a = nodeMap[e.from], b = nodeMap[e.to];
          if (!a || !b) return null;
          const p1 = borderPt(a, b.x, b.y);
          const p2 = borderPt(b, a.x, a.y);
          return (
            <line key={e.id}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={T.edge} strokeWidth={1.5}
              markerEnd="url(#arr_p)"
            />
          );
        })}

        {/* ── Nœuds ── */}
        {nodes.map(n => {
          const lines      = n.text.split('\n');
          const lh         = (n.fs || 10) + 4;
          const totalH     = lines.length * lh;
          const isSel      = n.id === sel;
          const isConn     = n.id === conn;
          const isMultiSel = multiSel.has(n.id);
          return (
            <g key={n.id}>
              <g data-role="node" data-nid={n.id}>
                <rect
                  x={n.x - n.w / 2} y={n.y - n.h / 2}
                  width={n.w} height={n.h} rx={7} ry={7}
                  fill={n.color} opacity={0.93}
                  stroke={isSel ? '#fff' : isConn ? 'rgba(255,255,255,0.8)' : isMultiSel ? 'rgba(75,92,232,0.95)' : 'none'}
                  strokeWidth={isSel ? 2.5 : isConn ? 2.5 : isMultiSel ? 2.5 : 0}
                  strokeDasharray={isConn ? '6 3' : isMultiSel ? '5 3' : 'none'}
                />
                {lines.map((line, i) => (
                  <text key={i}
                    x={n.x}
                    y={n.y - totalH / 2 + lh * i + lh * 0.72}
                    textAnchor="middle" fill="#fff"
                    fontSize={n.fs || 10}
                    fontWeight={n.bold ? '700' : '600'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >{line}</text>
                ))}
              </g>
              {isSel && (<>
                <g data-role="resize" data-nid={n.id} data-lockw="1">
                  <rect x={n.x - 22} y={n.y + n.h/2 - 5} width={44} height={13} rx={5}
                    fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
                  <line x1={n.x - 10} y1={n.y + n.h/2 + 1.5} x2={n.x + 10} y2={n.y + n.h/2 + 1.5}
                    stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                </g>
                <g data-role="resize" data-nid={n.id} data-lockw="0">
                  <rect x={n.x + n.w/2 - 21} y={n.y + n.h/2 - 21} width={21} height={21} rx={5}
                    fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"/>
                  <text x={n.x + n.w/2 - 10.5} y={n.y + n.h/2 - 5.5} textAnchor="middle"
                    fontSize="14" fill="#333" fontWeight="bold" style={{pointerEvents:'none'}}>⤡</text>
                </g>
              </>)}
            </g>
          );
        })}

        {/* ── Rect-select ── */}
        {rectDraw && (
          <rect
            x={Math.min(rectDraw.x1, rectDraw.x2)}
            y={Math.min(rectDraw.y1, rectDraw.y2)}
            width={Math.abs(rectDraw.x2 - rectDraw.x1)}
            height={Math.abs(rectDraw.y2 - rectDraw.y1)}
            fill="rgba(75,92,232,0.08)"
            stroke="rgba(75,92,232,0.75)"
            strokeWidth={2}
            strokeDasharray="6 3"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* ── Légende ── */}
        {[
          { color:C.mg,    label:'Médecine générale' },
          { color:C.dep,   label:'Dépistage cutané' },
          { color:C.chir,  label:'Chirurgie dermato' },
          { color:C.laser, label:'Laser / Esthétique' },
          { color:C.derm,  label:'Dermato générale (limité)' },
          { color:C.nsp,   label:'Orientation guidée' },
          { color:C.admin, label:'Admin / Devis / Confirmation' },
          { color:C.postop,label:'Post-op (interne)' },
        ].map((l, i) => (
          <g key={l.label}>
            <rect x={-40} y={1430 + i * 26} width={14} height={14} rx={3} fill={l.color} opacity={0.9} />
            <text x={-20} y={1442 + i * 26} fill={T.sub} fontSize={11}
              fontFamily="system-ui, sans-serif">{l.label}</text>
          </g>
        ))}

        <text x={2450} y={1440} fill={T.sub} fontSize={11}
          fontFamily="system-ui, sans-serif" textAnchor="end">
          Glisser · double-clic pour éditer · scroll/pincer pour zoomer
        </text>
      </svg>

      {/* ── Palette couleurs (nœud sélectionné) ── */}
      {selNode && !editId && (() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const sx = rect.left + ((selNode.x - viewBox.x) / viewBox.w) * rect.width;
        const sy = rect.top  + ((selNode.y - viewBox.y) / viewBox.h) * rect.height;
        const sh = selNode.h * scale;
        return createPortal(
          <div style={{
            position: 'fixed', left: sx, top: sy - sh / 2 - 46,
            transform: 'translateX(-50%)', zIndex: 99,
            display: 'flex', gap: 4, alignItems: 'center',
            background: T.bar,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '5px 8px',
            boxShadow: '0 3px 16px rgba(0,0,0,0.35)',
          }}>
            {PAL_P.map(c => (
              <div key={c}
                onMouseDown={e => {
                  e.stopPropagation();
                  stateRef.current.onBeforeChange?.();
                  setNodes(p => p.map(n => n.id === sel ? { ...n, color: c } : n));
                }}
                style={{
                  width: 15, height: 15, borderRadius: 4, background: c,
                  cursor: 'pointer', flexShrink: 0,
                  border: selNode.color === c ? '2px solid #fff' : '2px solid transparent',
                  boxSizing: 'border-box',
                }}
              />
            ))}
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
            <button
              onMouseDown={e => {
                e.stopPropagation();
                stateRef.current.onBeforeChange?.();
                setNodes(p => p.filter(n => n.id !== sel));
                setSel(null);
              }}
              style={{
                background: 'rgba(232,85,85,0.2)', color: '#e85555',
                border: 'none', borderRadius: 4,
                padding: '2px 7px', cursor: 'pointer',
                fontSize: 12, fontWeight: 'bold',
              }}>✕</button>
          </div>,
          document.body
        );
      })()}

      {/* ── Zone d'édition inline ── */}
      {editId && (() => {
        const node = nodes.find(n => n.id === editId);
        if (!node || !svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const sx   = rect.left + ((node.x - viewBox.x) / viewBox.w) * rect.width;
        const sy   = rect.top  + ((node.y - viewBox.y) / viewBox.h) * rect.height;
        const sW   = node.w * scale, sH = node.h * scale;
        return createPortal(
          <textarea
            ref={inputRef}
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
              if (e.key === 'Escape') setEditId(null);
            }}
            style={{
              position: 'fixed',
              left: sx - sW / 2, top: sy - sH / 2,
              width: sW, height: Math.max(sH, 60),
              zIndex: 50, boxSizing: 'border-box',
              background: node.color,
              border: '2px solid rgba(255,255,255,0.85)',
              borderRadius: 7, color: '#fff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: (node.fs || 10) * scale,
              fontWeight: '600',
              textAlign: 'center', outline: 'none',
              padding: '4px 8px', resize: 'none', lineHeight: 1.4,
            }}
          />,
          document.body
        );
      })()}
    </div>
  );
}
