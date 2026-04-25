let dfa = null;
let network = null;
let simulationPath = [];
let currentStep = 0;
let autoTimer = null;

function parseDFA(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const result = { states: new Set(), alphabet: new Set(), start: null, accept: new Set(), transitions: {} };
  let inTrans = false;
  for (const line of lines) {
    if (/^states\s*:/i.test(line)) {
      line.split(":")[1].split(",").forEach(s => result.states.add(s.trim()));
    } else if (/^alphabet\s*:/i.test(line)) {
      line.split(":")[1].split(",").forEach(s => result.alphabet.add(s.trim()));
    } else if (/^start\s*:/i.test(line)) {
      result.start = line.split(":")[1].trim();
    } else if (/^accept\s*:/i.test(line)) {
      line.split(":")[1].split(",").forEach(s => result.accept.add(s.trim()));
    } else if (/^transitions\s*:/i.test(line)) {
      inTrans = true;
    } else if (inTrans) {
      const parts = line.split(",").map(x => x.trim());
      if (parts.length === 3) {
        const [src, sym, dst] = parts;
        if (!result.transitions[src]) result.transitions[src] = {};
        result.transitions[src][sym] = dst;
        result.states.add(src);
        result.states.add(dst);
      }
    }
  }
  return result;
}

function validateDFA(dfa) {
  if (!dfa.start) return { ok: false, msg: "Thiếu trạng thái bắt đầu." };
  if (!dfa.states.has(dfa.start)) return { ok: false, msg: "Start không hợp lệ." };
  for (const s of dfa.accept) if (!dfa.states.has(s)) return { ok: false, msg: `Accept ${s} không hợp lệ.` };
  return { ok: true };
}

function drawDFA(dfa) {
  const nodes = [];
  const edges = [];

  dfa.states.forEach(s => {
    const isStart = s === dfa.start;
    const isAccept = dfa.accept.has(s);
    nodes.push({
      id: s,
      label: s,
      shape: isAccept ? "doubleCircle" : "circle",
      color: isStart ? "#27ae60" : isAccept ? "#e74c3c" : "#007bff",
      font: { color: "#fff", size: 16, face: "arial" }
    });
  });

  for (const src in dfa.transitions) {
    for (const sym in dfa.transitions[src]) {
      const dst = dfa.transitions[src][sym];
      edges.push({ from: src, to: dst, label: sym });
    }
  }

  const container = document.getElementById("network");
  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const options = {
    layout: { improvedLayout: true },
    physics: { enabled: false },
    edges: { smooth: true, arrows: "to", font: { align: "top" } },
    nodes: {
      borderWidth: 2,
      shadow: true,
      color: { border: "#fff" },
      font: { color: "#fff" }
    }
  };

  network = new vis.Network(container, data, options);
}

function wrapInline(tex) { return '\\(' + tex + '\\)'; }
function wrapDisplay(tex) { return '\\[' + tex + '\\]'; }

function stateToTex(s) {
  const m = /^([a-zA-Z]+)(\d+)$/.exec(s);
  if (m) return m[1] + '_{' + m[2] + '}';
  return s.replace(/_/g, '\\_');
}

function buildDeltaTableHTML(dfa) {
  const alph = Array.from(dfa.alphabet);
  const states = Array.from(dfa.states);
  let html = `<table class="delta-table" style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr>
    <th style="border:1px solid #e6f0fb;padding:8px;text-align:left;">\\(\\delta\\)</th>`;
  for (const a of alph) {
    html += `<th style="border:1px solid #e6f0fb;padding:8px;text-align:center;">${a}</th>`;
  }
  html += `</tr></thead><tbody>`;
  for (const s of states) {
    html += `<tr>`;
    html += `<td style="border:1px solid #eef6f8;padding:8px;font-weight:700;">\\(${stateToTex(s)}\\)</td>`;
    for (const a of alph) {
      const dst = (dfa.transitions[s] && dfa.transitions[s][a]) !== undefined ? dfa.transitions[s][a] : '—';
      const isStart = s === dfa.start;
      const isAccept = dfa.accept.has(s);
      const bg = isStart ? 'background:#e8f8ef;' : isAccept ? 'background:#fff0f0;' : '';
      const cell = dst === '—' ? '—' : '\\(' + stateToTex(dst) + '\\)';
      html += `<td style="border:1px solid #eef6f8;padding:8px;text-align:center;${bg}">${cell}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function makeNestedShort(startState, prefix, dfa) {
  const syms = prefix.split('');
  if (syms.length === 1) {
    const a = syms[0];
    if (!dfa.transitions[startState] || dfa.transitions[startState][a] === undefined) {
      return wrapInline('\\delta(' + stateToTex(startState) + ', ' + prefix + ') = \\text{(no transition)}');
    }
    const final = dfa.transitions[startState][a];
    const expr = '\\delta(' + stateToTex(startState) + ', ' + prefix + ') = ' + stateToTex(final);
    return wrapInline(expr);
  }

  const prefixExceptLast = syms.slice(0, -1).join('');
  const last = syms[syms.length - 1];
  let cur = startState;
  for (let i = 0; i < syms.length - 1; i++) {
    const a = syms[i];
    if (!dfa.transitions[cur] || dfa.transitions[cur][a] === undefined) {
      const left = '\\delta(' + stateToTex(startState) + ', ' + prefix + ')';
      const nested = '\\delta(\\delta(' + stateToTex(startState) + ', ' + prefixExceptLast + '), ' + last + ')';
      return wrapInline(left + ' = ' + nested + ' = \\text{(no transition at step ' + (i+1) + ')}');
    }
    cur = dfa.transitions[cur][a];
  }
  const stateBeforeLast = cur;
  if (!dfa.transitions[stateBeforeLast] || dfa.transitions[stateBeforeLast][last] === undefined) {
    const left = '\\delta(' + stateToTex(startState) + ', ' + prefix + ')';
    const nested = '\\delta(\\delta(' + stateToTex(startState) + ', ' + prefixExceptLast + '), ' + last + ')';
    return wrapInline(left + ' = ' + nested + ' = \\text{(no transition from ' + stateBeforeLast + ' with ' + last + ')}');
  }
  const finalState = dfa.transitions[stateBeforeLast][last];
  const left = '\\delta(' + stateToTex(startState) + ', ' + prefix + ')';
  const nested = '\\delta(\\delta(' + stateToTex(startState) + ', ' + prefixExceptLast + '), ' + last + ')';
  const lastDelta = '\\delta(' + stateToTex(stateBeforeLast) + ', ' + last + ')';
  const result = left + ' = ' + nested + ' = ' + lastDelta + ' = ' + stateToTex(finalState);
  return wrapInline(result);
}

function simulateDFA(dfa, str) {
  const start = dfa.start;
  const details = [];
  const path = [start];
  const deltaTable = buildDeltaTableHTML(dfa);

  if (!str || str.length === 0) {
    details.push(wrapInline('\\delta(' + stateToTex(start) + 
    ', \\epsilon) = ' + stateToTex(start)));
    const accepted0 = dfa.accept.has(start);
    const conclusion = accepted0
      ? wrapDisplay('\\delta(' + stateToTex(start) + ', \\epsilon) = '
       + stateToTex(start) + ' \\in F \\Rightarrow \\text{Chuỗi rỗng được chấp nhận.}')
      : wrapDisplay('\\delta(' + stateToTex(start) + ', \\epsilon) = ' + stateToTex(start) + 
      ' \\notin F \\Rightarrow \\text{Chuỗi rỗng bị từ chối.}');
    return { ok: true, accepted: accepted0, path, details, deltaTable, conclusion };
  }

  let cur = start;
  for (let i = 0; i < str.length; i++) {
    const prefix = str.slice(0, i + 1);
    const nested = makeNestedShort(start, prefix, dfa);
    details.push(nested);

    const sym = str[i];
    const trans = (dfa.transitions[cur] && dfa.transitions[cur][sym]) 
                  !== undefined ? dfa.transitions[cur][sym] : null;
    if (trans === null) {
      details.push(wrapInline('\\text{(Dừng: không có chuyển từ ' 
        + stateToTex(cur) + ' với ký hiệu }' + sym + ')'));
      return { ok: false, msg: `Không có chuyển từ ${cur} với ký hiệu '${sym}'`,
       path, details, deltaTable };
    }
    cur = trans;
    path.push(cur);
  }

  const accepted = dfa.accept.has(cur);
  const conclusion = accepted
    ? wrapDisplay('\\delta(' + stateToTex(start) + ', ' + str + ') = ' 
          + stateToTex(cur) + ' \\in F \\Rightarrow \\text{Chuỗi được chấp nhận.}')
    : wrapDisplay('\\delta(' + stateToTex(start) + ', ' + str + ') = ' 
          + stateToTex(cur) + ' \\notin F \\Rightarrow \\text{Chuỗi bị từ chối.}');
  return { ok: true, accepted, path, details, deltaTable, conclusion };
}
function highlightState(state) {
  if (!network) return;
  const all = network.body.data.nodes.get();
  for (const node of all) {
    const isStart = node.id === dfa.start;
    const isAccept = dfa.accept.has(node.id);
    const baseColor = isStart ? "#27ae60" : isAccept ? "#e74c3c" : "#007bff";
    network.body.data.nodes.update({
      id: node.id,
      color: node.id === state ? "#27a2f0" : baseColor
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const fileContent = document.getElementById("fileContent");
  const checkBtn = document.getElementById("checkBtn");
  const autoBtn = document.getElementById("autoBtn");
  const stepBtn = document.getElementById("stepBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resultDiv = document.getElementById("result");
  const detailsDiv = document.getElementById("details");

  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      fileContent.value = evt.target.result;
      dfa = parseDFA(evt.target.result);
      const valid = validateDFA(dfa);
      if (!valid.ok) {
        resultDiv.innerHTML = `<div class="status bad">${valid.msg}</div>`;
        detailsDiv.innerHTML = "";
        return;
      }
      drawDFA(dfa);
      resultDiv.innerHTML = `<div class="status ok">DFA hợp lệ! Đã vẽ đồ thị.</div>`;
      detailsDiv.innerHTML = "";
    };
    reader.readAsText(file);
  });
  async function showResult(res) {
    const boxClass = res.accepted ? "status ok" : "status bad";
    const short = res.accepted ? 'Chuỗi được chấp nhận!' : 'Chuỗi bị từ chối!';
    resultDiv.innerHTML = `<div class="${boxClass}">${short}</div><div style="margin-top:6px">${res.conclusion || ''}</div>`;

    let html = '';
    if (res.deltaTable) {
      html += `<div style="margin-bottom:8px"><strong>Bảng chuyển (\\(\\delta\\)):</strong> ${res.deltaTable}</div>`;
    }

    html += `<div><strong>Chi tiết từng bước:</strong></div>`;
    if (res.details && res.details.length) {
      html += `<ol>${res.details.map((d, i) => `<li>Bước ${i+1}: ${d}</li>`).join('')}</ol>`;
    } else {
      html += `<div style="margin-top:6px;color:#666">Không có bước chi tiết.</div>`;
    }

    detailsDiv.innerHTML = html;
    detailsDiv.scrollTop = detailsDiv.scrollHeight; 

    try {
      if (window.MathJax && MathJax.typesetPromise) {
        await MathJax.typesetPromise([resultDiv, detailsDiv]);
      }
    } catch (err) { console.warn('MathJax render failed', err); }
  }
  checkBtn.addEventListener("click", async () => {
    if (!dfa) return alert("Hãy tải DFA trước!");
    const str = document.getElementById("inputString").value.trim();
    const res = simulateDFA(dfa, str);
    if (!res.ok) {
      resultDiv.innerHTML = `<div class="status bad">${res.msg}</div>`;
      detailsDiv.innerHTML = "";
      return;
    }
    simulationPath = res.path;
    highlightState(simulationPath[simulationPath.length - 1]);
    await showResult(res);
  });

  autoBtn.addEventListener("click", async () => {
    if (!dfa) return alert("Hãy tải DFA trước!");
    const str = document.getElementById("inputString").value.trim();
    const res = simulateDFA(dfa, str);
    if (!res.ok) {
      resultDiv.innerHTML = `<div class="status bad">${res.msg}</div>`;
      detailsDiv.innerHTML = "";
      return;
    }
    simulationPath = res.path;
    currentStep = 0;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (currentStep < simulationPath.length) {
        highlightState(simulationPath[currentStep++]);
      } else {
        clearInterval(autoTimer);
      }
    }, 700);
    highlightState(simulationPath[simulationPath.length - 1]);
    await showResult(res);
  });

  stepBtn.addEventListener("click", () => {
    if (!simulationPath.length) return alert("Chưa có đường mô phỏng!");
    if (currentStep < simulationPath.length) {
      highlightState(simulationPath[currentStep]);
      currentStep++;
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(autoTimer);
    if (dfa) drawDFA(dfa);
    simulationPath = [];
    currentStep = 0;
    resultDiv.innerHTML = "";
    detailsDiv.innerHTML = "";
  });
});
