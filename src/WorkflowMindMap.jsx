import { useState, useRef, useEffect } from 'react';
import ParcoursMindMap from './ParcoursMindMap.jsx';

const PAL = ['#f5c540','#4ade80','#20c997','#4b5ce8','#e85555','#38bdf8','#a855f7','#f97316'];

export default function WorkflowMindMap({ initNodes, initEdges, initViewBox, savedData, onChange, dark }) {
  const [nodes,    setNodes]    = useState(() => savedData?.nodes?.length  ? savedData.nodes  : initNodes);
  const [edges,    setEdges]    = useState(() => savedData?.edges?.length  ? savedData.edges  : initEdges);
  const [viewBox,  setViewBox]  = useState(() => savedData?.viewBox        ? savedData.viewBox : initViewBox);
  const [mode,     setMode]     = useState('select');
  const [sel,      setSel]      = useState(null);
  const [conn,     setConn]     = useState(null);
  const [multiSel, setMultiSel] = useState(new Set());
  const [rectDraw, setRectDraw] = useState(null);
  const [sliderFs,   setSliderFs]   = useState(0);
  const [histVer,    setHistVer]    = useState(0);
  const [clipboard,    setClipboard]    = useState([]);
  const [triggerEditId, setTriggerEditId] = useState(null);

  const baseNodesRef = useRef(null);
  const nodesRef     = useRef(nodes);
  const edgesRef     = useRef(edges);
  const rectSelRef   = useRef(null);
  const wrapRef      = useRef(null);
  const undoRef      = useRef([]);
  const redoRef      = useRef([]);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => onChange({ nodes, edges, viewBox }), 500);
    return () => clearTimeout(t);
  }, [nodes, edges, viewBox]);

  // Rect-select
  useEffect(() => {
    if (mode !== 'rect') { setRectDraw(null); return; }
    const getWorld = (cx, cy) => {
      const wrap = wrapRef.current;
      if (!wrap) return { x: 0, y: 0 };
      const r = wrap.getBoundingClientRect();
      return {
        x: viewBox.x + ((cx - r.left) / r.width)  * viewBox.w,
        y: viewBox.y + ((cy - r.top)  / r.height) * viewBox.h,
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
      const selected = new Set(
        nodesRef.current.filter(n =>
          n.x - n.w/2 < maxX && n.x + n.w/2 > minX &&
          n.y - n.h/2 < maxY && n.y + n.h/2 > minY
        ).map(n => n.id)
      );
      if (selected.size > 0) {
        baseNodesRef.current = nodesRef.current.map(n => ({ ...n }));
        setSliderFs(0);
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
  }, [mode, viewBox]);

  const saveSnap = () => {
    undoRef.current = [...undoRef.current, {
      nodes: nodesRef.current.map(n => ({ ...n })),
      edges: [...edgesRef.current],
    }].slice(-50);
    redoRef.current = [];
    setHistVer(v => v + 1);
  };

  const undo = () => {
    if (!undoRef.current.length) return;
    const snap = undoRef.current[undoRef.current.length - 1];
    undoRef.current = undoRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, {
      nodes: nodesRef.current.map(n => ({ ...n })),
      edges: [...edgesRef.current],
    }];
    setNodes(snap.nodes); setEdges(snap.edges);
    setHistVer(v => v + 1);
  };

  const redo = () => {
    if (!redoRef.current.length) return;
    const snap = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    undoRef.current = [...undoRef.current, {
      nodes: nodesRef.current.map(n => ({ ...n })),
      edges: [...edgesRef.current],
    }];
    setNodes(snap.nodes); setEdges(snap.edges);
    setHistVer(v => v + 1);
  };

  const copySelected = () => {
    const ids = multiSel.size > 0 ? multiSel : sel ? new Set([sel]) : new Set();
    if (!ids.size) return;
    setClipboard(nodes.filter(n => ids.has(n.id)));
  };

  const pasteClipboard = () => {
    if (!clipboard.length) return;
    saveSnap();
    const newNodes = clipboard.map(n => ({
      ...n,
      id: `wn${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      x: n.x + 50, y: n.y + 50,
    }));
    setNodes(p => [...p, ...newNodes]);
    setMultiSel(new Set(newNodes.map(n => n.id)));
  };

  // Clavier : Ctrl+C, Ctrl+V, Ctrl+A, Delete, Escape
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelected(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteClipboard(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        baseNodesRef.current = nodesRef.current.map(n => ({...n}));
        setSliderFs(0);
        setMultiSel(new Set(nodesRef.current.map(n => n.id)));
        setSel(null);
      }
      if (e.key === 'Escape') { setMultiSel(new Set()); setSel(null); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const toDelete = multiSel.size > 0 ? multiSel : sel ? new Set([sel]) : null;
        if (!toDelete) return;
        saveSnap();
        setNodes(p => p.filter(n => !toDelete.has(n.id)));
        setEdges(p => p.filter(e => !toDelete.has(e.from) && !toDelete.has(e.to)));
        setMultiSel(new Set()); setSel(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [multiSel, sel, nodes, edges, clipboard]);

  const handleAddNode = (wx, wy) => {
    saveSnap();
    const nn = { id: `wn${Date.now()}`, x: wx, y: wy, w: 160, h: 42, text: 'Nouveau', color: '#4b5ce8', fs: 11 };
    setNodes(p => [...p, nn]);
    setSel(nn.id);
    setMode('select');
  };

  const selNode = nodes.find(n => n.id === sel);

  const T = dark ? {
    bar:     'rgba(18,18,32,0.97)',
    bBorder: 'rgba(255,255,255,0.09)',
    btnBg:   'rgba(255,255,255,0.08)',
    btnTxt:  '#bbb',
    sub:     'rgba(255,255,255,0.3)',
  } : {
    bar:     'rgba(255,255,255,0.97)',
    bBorder: 'rgba(0,0,0,0.09)',
    btnBg:   'rgba(0,0,0,0.06)',
    btnTxt:  '#555',
    sub:     'rgba(0,0,0,0.3)',
  };

  return (
    <div ref={wrapRef} style={{
      position: 'absolute', inset: 0, zIndex: 20,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* ── Mini-toolbar (sous la toolbar principale) ── */}
      <div style={{
        position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)',
        zIndex: 31, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
        background: T.bar, backdropFilter: 'blur(16px)',
        border: `1px solid ${T.bBorder}`, borderRadius: 10,
        padding: '4px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        maxWidth: 'calc(100vw - 12px)', justifyContent: 'center',
      }}>
        {[{k:'select',l:'↖'},{k:'rect',l:'⬚'},{k:'add',l:'＋'},{k:'connect',l:'⟷'}].map(b => (
          <button key={b.k} onClick={() => {
            setMode(b.k); setConn(null);
            if (b.k !== 'rect') { setMultiSel(new Set()); setRectDraw(null); }
          }} style={{
            background: mode===b.k ? '#4b5ce8' : T.btnBg,
            color:      mode===b.k ? '#fff'    : T.btnTxt,
            border: 'none', borderRadius: 7, padding: '4px 9px',
            fontSize: 13, cursor: 'pointer', fontWeight: mode===b.k ? '600' : 'normal',
          }}>{b.l}</button>
        ))}

        {selNode && <>
          <div style={{width:1,height:16,background:T.bBorder,margin:'0 2px'}}/>
          <button onClick={() => setTriggerEditId(sel + '|' + Date.now())} style={{
            background:T.btnBg, color:'#20c997', border:'none',
            borderRadius:7, padding:'4px 9px', fontSize:12, cursor:'pointer',
          }} title="Éditer le texte">✏</button>
          <span style={{color:T.sub,fontSize:10,minWidth:24}}>A {selNode.fs||11}</span>
          <input type="range" min={6} max={40} step={1} value={selNode.fs||11}
            onChange={e => setNodes(p => p.map(n => n.id===sel?{...n,fs:Number(e.target.value)}:n))}
            style={{width:60,accentColor:'#20c997',cursor:'pointer'}}
          />
          <div style={{display:'flex',gap:2,alignItems:'center'}}>
            {PAL.map(c => (
              <div key={c} onClick={() => { saveSnap(); setNodes(p => p.map(n => n.id===sel?{...n,color:c}:n)); }}
                style={{
                  width:14,height:14,borderRadius:3,background:c,cursor:'pointer',
                  border:selNode.color===c?`2px solid ${dark?'#fff':'#222'}`:'2px solid transparent',
                  boxSizing:'border-box',flexShrink:0,
                }}/>
            ))}
          </div>
          <button onClick={() => {
            saveSnap();
            setNodes(p => p.filter(n => n.id!==sel));
            setEdges(p => p.filter(e => e.from!==sel && e.to!==sel));
            setSel(null);
          }} style={{
            background:'rgba(232,85,85,0.12)',color:'#e85555',
            border:'none',borderRadius:7,padding:'4px 8px',fontSize:11,cursor:'pointer',
          }}>✕</button>
        </>}

        {multiSel.size > 0 && <>
          <div style={{width:1,height:16,background:T.bBorder,margin:'0 2px'}}/>
          <span style={{color:'rgba(75,92,232,0.9)',fontSize:10,fontWeight:'600'}}>{multiSel.size}⬚</span>
          <span style={{color:T.sub,fontSize:10}}>A {sliderFs>0?'+':''}{sliderFs}</span>
          <input type="range" min={-8} max={14} step={1} value={sliderFs}
            onChange={e => {
              const val = Number(e.target.value);
              setSliderFs(val);
              const base = baseNodesRef.current;
              if (!base) return;
              setNodes(p => p.map(n => {
                if (!multiSel.has(n.id)) return n;
                const b = base.find(b => b.id===n.id);
                return b ? {...n, fs:Math.max(6,Math.min(40,(b.fs||11)+val))} : n;
              }));
            }}
            style={{width:60,accentColor:'#f97316',cursor:'pointer'}}
          />
        </>}

        <div style={{width:1,height:16,background:T.bBorder,margin:'0 2px'}}/>
        <button onClick={copySelected} title="Copier (Ctrl+C)" style={{
          background: clipboard.length ? 'rgba(32,201,151,0.15)' : T.btnBg,
          color: clipboard.length ? '#20c997' : T.btnTxt,
          border:'none',borderRadius:7,padding:'4px 8px',fontSize:12,
          cursor: (multiSel.size > 0 || sel) ? 'pointer' : 'default',
          opacity: (multiSel.size > 0 || sel) ? 1 : 0.35,
        }}>⎘</button>
        <button onClick={pasteClipboard} title="Coller (Ctrl+V)" style={{
          background: T.btnBg, color: T.btnTxt,
          border:'none',borderRadius:7,padding:'4px 8px',fontSize:12,
          cursor: clipboard.length ? 'pointer' : 'default',
          opacity: clipboard.length ? 1 : 0.35,
        }}>⎗</button>

        <div style={{width:1,height:16,background:T.bBorder,margin:'0 2px'}}/>
        <button onClick={undo} style={{
          background:T.btnBg,color:T.btnTxt,border:'none',borderRadius:7,
          padding:'4px 8px',fontSize:13,cursor:undoRef.current.length?'pointer':'default',
          opacity:undoRef.current.length?1:0.3,
        }}>←</button>
        <button onClick={redo} style={{
          background:T.btnBg,color:T.btnTxt,border:'none',borderRadius:7,
          padding:'4px 8px',fontSize:13,cursor:redoRef.current.length?'pointer':'default',
          opacity:redoRef.current.length?1:0.3,
        }}>→</button>
      </div>

      {/* Overlay rect-select */}
      {mode === 'rect' && (
        <div style={{position:'absolute',inset:0,zIndex:25,cursor:'crosshair'}}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            const wrap = wrapRef.current;
            if (!wrap) return;
            const r  = wrap.getBoundingClientRect();
            const wx = viewBox.x + ((e.clientX - r.left) / r.width)  * viewBox.w;
            const wy = viewBox.y + ((e.clientY - r.top)  / r.height) * viewBox.h;
            rectSelRef.current = { sx: wx, sy: wy, ex: wx, ey: wy };
            setRectDraw({ x1: wx, y1: wy, x2: wx, y2: wy });
          }}
        />
      )}

      <ParcoursMindMap
        dark={dark}
        nodes={nodes}    setNodes={setNodes}
        edges={edges}    setEdges={setEdges}
        onBeforeChange={saveSnap} syncFs={true}
        viewBox={viewBox}   setViewBox={setViewBox}
        sel={sel}           setSel={setSel}
        multiSel={multiSel} rectDraw={rectDraw}
        addMode={mode==='add'} onAddNode={handleAddNode}
        triggerEditId={triggerEditId}
        connectMode={mode==='connect'} conn={conn}
        onConnNode={(nodeId) => {
          if (!conn) {
            setConn(nodeId);
          } else if (conn !== nodeId) {
            saveSnap();
            setEdges(p => {
              const dup = p.find(e =>
                (e.from===conn && e.to===nodeId) ||
                (e.from===nodeId && e.to===conn)
              );
              return dup ? p : [...p, { id:`we_${Date.now()}`, from:conn, to:nodeId }];
            });
            setConn(null); setMode('select');
          }
        }}
      />

      {mode==='add' && (
        <div style={{
          position:'absolute',bottom:18,left:'50%',transform:'translateX(-50%)',
          background:'rgba(75,92,232,0.14)',border:'1px solid rgba(75,92,232,0.4)',
          color:'#4b5ce8',padding:'7px 22px',borderRadius:20,
          fontSize:12,zIndex:32,pointerEvents:'none',whiteSpace:'nowrap',
        }}>Touchez pour créer un nœud</div>
      )}
      {conn && (
        <div style={{
          position:'absolute',bottom:18,left:'50%',transform:'translateX(-50%)',
          background:'rgba(32,201,151,0.12)',border:'1px solid rgba(32,201,151,0.4)',
          color:'#20c997',padding:'7px 22px',borderRadius:20,
          fontSize:12,zIndex:32,pointerEvents:'none',whiteSpace:'nowrap',
        }}>→ Cliquez un nœud pour relier</div>
      )}
    </div>
  );
}
