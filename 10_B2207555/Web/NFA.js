
let nfa = null;
let network = null;
let simulationPath = [];
let currentStep = 0;
let autoTimer = null;

function parseNFA(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const result = { states: new Set(), alphabet: new Set(), start: null, accept: new Set(), transitions: {} };
  let inTrans = false;

  for (const line of lines) {
    if (/^states\s*:/i.test(line))
      line.split(":")[1].split(",").forEach(s => result.states.add(s.trim()));
    else if (/^alphabet\s*:/i.test(line))
      line.split(":")[1].split(",").forEach(s => result.alphabet.add(s.trim()));
    else if (/^start\s*:/i.test(line))
      result.start = line.split(":")[1].trim();
    else if (/^accept\s*:/i.test(line))
      line.split(":")[1].split(",").forEach(s => result.accept.add(s.trim()));
    else if (/^transitions\s*:/i.test(line))
      inTrans = true;
    else if (inTrans) {
      const parts = line.split(",").map(x => x.trim());
      if (parts.length === 3) {
        const [src, sym, dst] = parts;
        if (!result.transitions[src]) result.transitions[src] = {};
        if (!result.transitions[src][sym]) result.transitions[src][sym] = new Set();
        result.transitions[src][sym].add(dst);
        result.states.add(src);
        result.states.add(dst);
      }
    }
  }
  return result;
}

function validateNFA(nfa) {
  if (!nfa.start) return { ok: false, msg: "Thiếu trạng thái bắt đầu." };
  if (!nfa.states.has(nfa.start)) return { ok: false, msg: "Start không hợp lệ." };
  for (const s of nfa.accept)
    if (!nfa.states.has(s)) return { ok: false, msg: `Accept ${s} không hợp lệ.` };
  return { ok: true };
}

function drawNFA(nfa) {
  const nodes = [];
  const edges = [];

  nfa.states.forEach(s => {
    const isStart = s === nfa.start;
    const isAccept = nfa.accept.has(s);
    nodes.push({
      id: s,
      label: s,
      shape: isAccept ? "doubleCircle" : "circle",
      color: isStart ? "#27ae60" : isAccept ? "#e74c3c" : "#007bff",
      font: { color: "#fff", size: 16, face: "arial" }
    });
  });

  for (const src in nfa.transitions) {
    for (const sym in nfa.transitions[src]) {
      for (const dst of nfa.transitions[src][sym]) {
        edges.push({ from: src, to: dst, label: sym });
      }
    }
  }

  const container = document.getElementById("network");
  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const options = {
    layout: { improvedLayout: true },
    physics: { enabled: false },
    edges: { smooth: true, arrows: "to", font: { align: "top" } },
    nodes: { borderWidth: 2, shadow: true, color: { border: "#fff" }, font: { color: "#fff" } }
  };
  network = new vis.Network(container, data, options);
}

function buildDeltaTableHTML(nfa) {
  const alph = [...nfa.alphabet];
  const states = [...nfa.states];
  let html = `<table class="delta-table" style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr>
    <th style="border:1px solid #e6f0fb;padding:8px;">\\(\\delta\\)</th>`;
  for (const a of alph)
    html += `<th style="border:1px solid #e6f0fb;padding:8px;text-align:center;">${a}</th>`;
  html += `</tr></thead><tbody>`;

  for (const s of states) {
    html += `<tr>`;
    html += `<td style="border:1px solid #eef6f8;padding:8px;font-weight:700;">\\(${s}\\)</td>`;
    for (const a of alph) {
      const dst = nfa.transitions[s]?.[a];
      const cell = dst ? '\\({' + [...dst].join(', ') + '}\\)' : '—';
      const isStart = s === nfa.start;
      const isAccept = nfa.accept.has(s);
      const bg = isStart ? 'background:#e8f8ef;' : isAccept ? 'background:#fff0f0;' : '';
      html += `<td style="border:1px solid #eef6f8;padding:8px;text-align:center;${bg}">${cell}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// --- LaTeX wrappers ---
function wrapInline(tex) { return '\\(' + tex + '\\)'; }
function wrapDisplay(tex) { return '\\[' + tex + '\\]'; }

function simulateNFA(nfa, str) {
  const deltaTable = buildDeltaTableHTML(nfa);
  let currentStates = new Set([nfa.start]);
  const details = [];
  const path = [new Set(currentStates)];

  function statesToTex(states) {
    if (states.size === 0) return '\\emptyset';
    return '\\{' + [...states].map(s => s.replace(/_/g, '\\_')).join(', ') + '\\}';
  }
  if (!str || str.length === 0) {
    const accepted0 = [...currentStates].some(s => nfa.accept.has(s));
    const conclusion = accepted0
      ? wrapDisplay('\\delta(' + nfa.start + ', \\epsilon) = ' + 
        statesToTex(currentStates) + 
        ' \\cap F \\neq \\emptyset \\Rightarrow \\text{Chuỗi rỗng được chấp nhận.}')
      : wrapDisplay('\\delta(' + nfa.start + ', \\epsilon) = ' + 
        statesToTex(currentStates) + 
        ' \\cap F = \\emptyset \\Rightarrow \\text{Chuỗi rỗng bị từ chối.}');
    details.push(wrapInline('\\delta(' + nfa.start + ', \\epsilon) = ' + 
      statesToTex(currentStates)));
    return { ok: true, accepted: accepted0, path, details, deltaTable, conclusion };
  }

  for (let i = 0; i < str.length; i++) {
    const prefix = str.slice(0, i + 1);
    const sym = str[i];
    const nextStates = new Set();

    for (const s of currentStates) {
      const dests = nfa.transitions[s]?.[sym];
      if (dests) for (const d of dests) nextStates.add(d);
    }

    const texPrev = statesToTex(currentStates);
    const texNext = statesToTex(nextStates);

    const nestedExpr = '\\delta(' + texPrev + ', ' + sym + ') = ' + texNext;
    details.push(wrapInline(nestedExpr));

    if (nextStates.size === 0) {
      details.push(wrapInline('\\text{Dừng: không có chuyển từ } ' + 
        texPrev + ' \\text{ với ký hiệu } ' + sym));
      return { ok: false, msg: `Không có chuyển từ ${[...currentStates].join(', ')} với '${sym}'`, 
      path, details, deltaTable };
    }

    currentStates = nextStates;
    path.push(new Set(currentStates));
  }

  const accepted = [...currentStates].some(s => nfa.accept.has(s));
  const conclusion = accepted
    ? wrapDisplay('\\delta(' + nfa.start + ', ' + str + ') = ' + 
      statesToTex(currentStates) + 
      ' \\cap F \\neq \\emptyset \\Rightarrow \\text{Chuỗi được chấp nhận.}')
    : wrapDisplay('\\delta(' + nfa.start + ', ' + str + ') = ' + 
      statesToTex(currentStates) + 
      ' \\cap F = \\emptyset \\Rightarrow \\text{Chuỗi bị từ chối.}');

  return { ok: true, accepted, path, details, deltaTable, conclusion };
}


// --- Highlight ---
function highlightStates(states) {
  if (!network) return;
  const all = network.body.data.nodes.get();
  for (const node of all) {
    const baseColor = node.id === nfa.start ? "#27ae60" : nfa.accept.has(node.id) ? "#e74c3c" : "#007bff";
    network.body.data.nodes.update({
      id: node.id,
      color: states.has(node.id) ? "#27a2f0" : baseColor
    });
  }
}

// --- Main events ---
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
      nfa = parseNFA(evt.target.result);
      const valid = validateNFA(nfa);
      if (!valid.ok) {
        resultDiv.innerHTML = `<div class="status bad">${valid.msg}</div>`;
        detailsDiv.innerHTML = "";
        return;
      }
      drawNFA(nfa);
      resultDiv.innerHTML = `<div class="status ok">NFA hợp lệ! Đã vẽ đồ thị.</div>`;
      detailsDiv.innerHTML = "";
    };
    reader.readAsText(file);
  });

  async function showResult(res) {
    const boxClass = res.accepted ? "status ok" : "status bad";
    const short = res.accepted ? "Chuỗi được chấp nhận!" : "Chuỗi bị từ chối!";
    resultDiv.innerHTML = `<div class="${boxClass}">${short}</div><div style="margin-top:6px">${res.conclusion || ''}</div>`;

    let html = '';
    if (res.deltaTable) html += `<div style="margin-bottom:8px"><strong>Bảng chuyển (\\(\\delta\\)):</strong> ${res.deltaTable}</div>`;
    html += `<div><strong>Chi tiết từng bước:</strong></div>`;
    if (res.details && res.details.length)
      html += `<ol>${res.details.map((d, i) => `<li>Bước ${i + 1}: ${d}</li>`).join('')}</ol>`;
    detailsDiv.innerHTML = html;

    try {
      if (window.MathJax && MathJax.typesetPromise)
        await MathJax.typesetPromise([resultDiv, detailsDiv]);
    } catch (err) { console.warn('MathJax render failed', err); }
  }

  checkBtn.addEventListener("click", async () => {
    if (!nfa) return alert("Hãy tải NFA trước!");
    const str = document.getElementById("inputString").value.trim();
    const res = simulateNFA(nfa, str);
    if (!res.ok) {
      resultDiv.innerHTML = `<div class="status bad">${res.msg}</div>`;
      detailsDiv.innerHTML = "";
      return;
    }
    simulationPath = res.path;
    highlightStates(simulationPath[simulationPath.length - 1]);
    await showResult(res);
  });

  autoBtn.addEventListener("click", async () => {
    if (!nfa) return alert("Hãy tải NFA trước!");
    const str = document.getElementById("inputString").value.trim();
    const res = simulateNFA(nfa, str);
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
        highlightStates(simulationPath[currentStep++]);
      } else clearInterval(autoTimer);
    }, 700);
    highlightStates(simulationPath[simulationPath.length - 1]);
    await showResult(res);
  });

  stepBtn.addEventListener("click", () => {
    if (!simulationPath.length) return alert("Chưa có đường mô phỏng!");
    if (currentStep < simulationPath.length) {
      highlightStates(simulationPath[currentStep]);
      currentStep++;
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(autoTimer);
    if (nfa) drawNFA(nfa);
    simulationPath = [];
    currentStep = 0;
    resultDiv.innerHTML = "";
    detailsDiv.innerHTML = "";
  });
});
