import { useState, useRef } from 'react';

const DAYS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const SLOTS = ['10h', '12h', '14h', '16h', '18h', '20h', '22h', '00h'];

const TAG_COLORS = [
  '#4b5ce8','#20c997','#f5c540','#e85555','#a855f7','#f97316','#38bdf8','#4ade80',
];

export default function WeeklyPlanning({ cells, onChange, dark }) {
  const [editCell, setEditCell]   = useState(null);
  const [inputVal, setInputVal]   = useState('');
  const [colorIdx, setColorIdx]   = useState(0);
  const inputRef = useRef(null);

  const T = dark ? {
    bg:         '#0e0e1a',
    border:     'rgba(255,255,255,0.09)',
    headerBg:   'rgba(18,18,32,0.97)',
    headerTxt:  '#aaa',
    cellBg:     'rgba(255,255,255,0.025)',
    text:       '#ddd',
    inputBg:    '#1a1a2e',
    addBtnBg:   'rgba(255,255,255,0.07)',
    addBtnTxt:  '#666',
  } : {
    bg:         '#f0f0ea',
    border:     'rgba(0,0,0,0.10)',
    headerBg:   'rgba(255,255,255,0.97)',
    headerTxt:  '#555',
    cellBg:     '#ffffff',
    text:       '#222',
    inputBg:    '#fff',
    addBtnBg:   'rgba(0,0,0,0.06)',
    addBtnTxt:  '#999',
  };

  const getTasks = (day, slot) => cells[`${day}_${slot}`] || [];

  const commitAdd = (day, slot) => {
    const val = inputVal.trim();
    if (!val) { setEditCell(null); return; }
    const key   = `${day}_${slot}`;
    const color = TAG_COLORS[colorIdx % TAG_COLORS.length];
    const tasks = [...(cells[key] || []), { text: val, color }];
    onChange({ ...cells, [key]: tasks });
    setInputVal('');
    setColorIdx(c => (c + 1) % TAG_COLORS.length);
    setEditCell(null);
  };

  const removeTask = (day, slot, idx) => {
    const key   = `${day}_${slot}`;
    const tasks = (cells[key] || []).filter((_, i) => i !== idx);
    const next  = { ...cells };
    if (tasks.length === 0) delete next[key];
    else next[key] = tasks;
    onChange(next);
  };

  const startEdit = (day, slot) => {
    setEditCell(`${day}_${slot}`);
    setInputVal('');
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: T.bg, overflowY: 'auto', overflowX: 'auto',
      fontFamily: 'system-ui, sans-serif',
      paddingTop: 58,
    }}>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        minWidth: 620,
        tableLayout: 'fixed',
      }}>
        <colgroup>
          <col style={{ width: 54 }} />
          {DAYS.map(d => <col key={d} />)}
        </colgroup>

        <thead>
          <tr>
            <th style={{
              position: 'sticky', top: 0, left: 0, zIndex: 4,
              background: T.headerBg,
              border: `1px solid ${T.border}`,
              color: T.headerTxt, fontSize: 10,
              padding: '7px 4px',
            }}></th>
            {DAYS.map(d => (
              <th key={d} style={{
                position: 'sticky', top: 0, zIndex: 3,
                background: T.headerBg,
                border: `1px solid ${T.border}`,
                color: T.headerTxt,
                fontSize: 12, fontWeight: 700,
                padding: '7px 4px', textAlign: 'center',
              }}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {SLOTS.map(slot => (
            <tr key={slot}>
              <td style={{
                position: 'sticky', left: 0, zIndex: 2,
                background: T.headerBg,
                border: `1px solid ${T.border}`,
                color: T.headerTxt,
                fontSize: 12, fontWeight: 700,
                padding: '6px 8px', textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{slot}</td>

              {DAYS.map(day => {
                const tasks   = getTasks(day, slot);
                const cellKey = `${day}_${slot}`;
                const editing = editCell === cellKey;

                return (
                  <td key={day} style={{
                    border:     `1px solid ${T.border}`,
                    background: T.cellBg,
                    verticalAlign: 'top',
                    padding: '4px',
                    minHeight: 64,
                  }}>
                    <div style={{ minHeight: 56, display: 'flex', flexDirection: 'column', gap: 3 }}>

                      {tasks.map((task, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 2,
                          background: typeof task === 'object' ? task.color : '#4b5ce8',
                          color: '#fff',
                          borderRadius: 5,
                          padding: '2px 4px 2px 6px',
                          fontSize: 11, lineHeight: 1.35,
                          wordBreak: 'break-word',
                        }}>
                          <span style={{ flex: 1 }}>
                            {typeof task === 'object' ? task.text : task}
                          </span>
                          <button
                            onClick={() => removeTask(day, slot, i)}
                            style={{
                              background: 'none', border: 'none',
                              color: 'rgba(255,255,255,0.75)',
                              cursor: 'pointer', padding: '0 1px',
                              fontSize: 13, lineHeight: 1, flexShrink: 0,
                            }}
                          >×</button>
                        </div>
                      ))}

                      {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {TAG_COLORS.map((c, ci) => (
                              <div key={c} onClick={() => setColorIdx(ci)} style={{
                                width: 13, height: 13, borderRadius: 3,
                                background: c, cursor: 'pointer',
                                border: colorIdx === ci
                                  ? `2px solid ${dark ? '#fff' : '#222'}`
                                  : '2px solid transparent',
                                boxSizing: 'border-box', flexShrink: 0,
                              }} />
                            ))}
                          </div>
                          <input
                            ref={inputRef}
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onBlur={() => commitAdd(day, slot)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')  commitAdd(day, slot);
                              if (e.key === 'Escape') { setEditCell(null); setInputVal(''); }
                            }}
                            placeholder="Tâche…"
                            style={{
                              fontSize: 11, padding: '3px 6px',
                              borderRadius: 5,
                              border: `1px solid ${TAG_COLORS[colorIdx]}`,
                              background: T.inputBg,
                              color: T.text, outline: 'none',
                              width: '100%', boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(day, slot)}
                          style={{
                            background: T.addBtnBg, border: 'none',
                            color: T.addBtnTxt, borderRadius: 5,
                            padding: '2px 6px', fontSize: 10,
                            cursor: 'pointer', alignSelf: 'flex-start',
                            marginTop: 'auto',
                          }}
                        >+ tâche</button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
