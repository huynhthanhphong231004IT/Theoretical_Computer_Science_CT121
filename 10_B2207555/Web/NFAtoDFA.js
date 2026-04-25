let nfa = null;
let dfa = null;
function parseNFA(text) {
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
            if (parts.length >= 3) {
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
function drawNetwork(netDiv, automata) {
    if (!automata || !netDiv) return;

    const nodes = [], edges = [];

    // --- Nodes ---
    automata.states.forEach(s => {
        const isStart = s === automata.start;
        const isAccept = automata.accept.has(s);
        nodes.push({
            id: s,
            label: s,
            shape: isAccept ? 'doubleCircle' : 'circle',
            color: isStart ? '#27ae60' : isAccept ? '#e74c3c' : '#007bff',
            font: { color: '#fff', size: 16 },
            borderWidth: 3
        });
    });

    // --- Edges ---
    for (const src in automata.transitions) {
        for (const sym in automata.transitions[src]) {
            let dsts = automata.transitions[src][sym];
            if (typeof dsts === 'string') dsts = [dsts];

            dsts.forEach((dst, idx) => {
                // Cung cong riêng cho nhiều đích
                let roundness = dsts.length > 1 ? 0.2 + idx * 0.2 : 0.2;

                edges.push({
                    from: src,
                    to: dst,
                    label: sym,
                    arrows: 'to',
                    smooth: { type: 'curvedCW', roundness: roundness }
                });
            });
        }
    }

    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        layout: { improvedLayout: true },
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            stabilization: { iterations: 300, fit: true },
        },
        edges: {
            smooth: { type: 'curvedCW', roundness: 0.2 },
            arrows: 'to',
            font: { align: 'middle' }
        },
        nodes: {
            borderWidth: 2,
            shadow: { enabled: true },
            font: { color: '#fff', size: 16 }
        },
        interaction: {
            hover: true,
            zoomView: true,
            dragView: true
        }
    };

    new vis.Network(netDiv, data, options);
}


function epsilonClosure(nfa, states) {
    const stack = [...states], closure = new Set(states);
    while (stack.length) {
        const s = stack.pop();
        if (nfa.transitions[s] && nfa.transitions[s]['ε']) {
            nfa.transitions[s]['ε'].forEach(t => {
                if (!closure.has(t)) { closure.add(t); stack.push(t); }
            });
        }
    }
    return closure;
}

function convertNFAtoDFA(nfa, callback) {
    const allStates = [...nfa.states];
    const subsets = [];
    for (let mask = 0; mask < (1 << allStates.length); mask++) {
        const subset = new Set();
        for (let i = 0; i < allStates.length; i++) {
            if (mask & (1 << i)) subset.add(allStates[i]);
        }
        subsets.push(subset);
    }

    const stateNames = {};
    let nameCharCode = 65;
    subsets.forEach(subset => {
        const key = [...subset].sort().join(',');
        stateNames[key] = String.fromCharCode(nameCharCode++);
    });

    const dfaTrans = {};
    subsets.forEach(subset => {
        const key = [...subset].sort().join(',');
        const dfaStateName = stateNames[key];
        dfaTrans[dfaStateName] = {};

        nfa.alphabet.forEach(sym => {
            if (sym === 'ε') return;
            const nextSet = new Set();
            subset.forEach(s => {
                if (nfa.transitions[s] && nfa.transitions[s][sym]) {
                    nfa.transitions[s][sym].forEach(t => {
                        epsilonClosure(nfa, new Set([t])).forEach(x => nextSet.add(x));
                    });
                }
            });
            if (nextSet.size) {
                const nextKey = [...nextSet].sort().join(',');
                dfaTrans[dfaStateName][sym] = stateNames[nextKey];
                if (callback) callback({ current: subset, sym, next: nextSet });
            }
        });
    });

    const startClosure = epsilonClosure(nfa, new Set([nfa.start]));
    const startKey = [...startClosure].sort().join(',');
    const accept = new Set();
    subsets.forEach(subset => {
        if ([...subset].some(s => nfa.accept.has(s))) {
            const key = [...subset].sort().join(',');
            accept.add(stateNames[key]);
        }
    });

    return {
        states: new Set(Object.values(stateNames)),
        alphabet: new Set([...nfa.alphabet].filter(a => a !== 'ε')),
        start: stateNames[startKey],
        accept,
        transitions: dfaTrans
    };
}

function showDFATable(dfa) {
    let html = '<table><tr><th>State</th>';
    dfa.alphabet.forEach(a => html += `<th>${a}</th>`); html += '</tr>';
    dfa.states.forEach(s => {
        html += `<tr><td>${s}</td>`;
        dfa.alphabet.forEach(a => {
            const dst = dfa.transitions[s] && dfa.transitions[s][a] ? dfa.transitions[s][a] : '-';
            html += `<td>${dst}</td>`;
        });
        html += '</tr>';
    });
    html += '</table>';
    document.getElementById('dfaTable').innerHTML = html;
}

function simulateDFA(dfa, str) {
    let cur = dfa.start;
    let steps = [];
    for (const c of str) {
        if (!dfa.transitions[cur] || !dfa.transitions[cur][c]) {
            steps.push(`Không có chuyển từ ${cur} với '${c}'`);
            break;
        }
        steps.push(`${cur} --${c}--> ${dfa.transitions[cur][c]}`);
        cur = dfa.transitions[cur][c];
    }
    steps.push(dfa.accept.has(cur) ? `Kết thúc tại ${cur} → CHẤP NHẬN` : `Kết thúc tại ${cur} → TỪ CHỐI`);
    document.getElementById('dfaResult').innerHTML = '<ol>' + steps.map(s => `<li>${s}</li>`).join('') + '</ol>';
}

// === Events ===
document.getElementById('fileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        document.getElementById('fileContent').value = evt.target.result;
        nfa = parseNFA(evt.target.result);
        drawNetwork(document.getElementById('networkNFA'), nfa);
    };
    reader.readAsText(file);
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!nfa) return alert('Hãy tải NFA trước!');

    document.getElementById("grap").style.display = "block";

    const detailsBox = document.getElementById('dfaDetails');
    detailsBox.innerHTML = ''; // xóa cũ

    const stateNames = {};
    let nameCharCode = 65; // A,B,C...
    let stepCount = 0;
    let allSteps = ''; // lưu tất cả bước

    dfa = convertNFAtoDFA(nfa, (step) => {
        stepCount++;

        const currKey = [...step.current].sort().join(',');
        if (!stateNames[currKey]) stateNames[currKey] = String.fromCharCode(nameCharCode++);

        let nextKey = '';
        if (step.next && step.next.size) nextKey = [...step.next].sort().join(',');
        if (nextKey && !stateNames[nextKey]) stateNames[nextKey] = String.fromCharCode(nameCharCode++);

        let html = `<div style="margin:8px 0;padding:6px;background:#eef6ff;border-left:4px solid #1766a6;">
                        <strong>Bước ${stepCount}:</strong><br>
                        Xét tập trạng thái NFA: \\({${[...step.current].join(',')}}\\) → 
                        DFA: <strong>${stateNames[currKey]}</strong>`;

        if (step.sym && step.next && step.next.size) {
            html += `<br>Với ký hiệu \\(${step.sym}\\): chuyển sang tập trạng thái NFA \\({${[...step.next].join(',')}}\\) → 
                     DFA: <strong>${stateNames[nextKey]}</strong>`;
        }

        if (step.sym) {
            html += `<br>Hàm chuyển: \\(\\delta(${stateNames[currKey]}, ${step.sym}) = ${nextKey ? stateNames[nextKey] : '-'}\\)`;
        }

        html += '</div>';
        allSteps += html;
    });

    detailsBox.innerHTML = allSteps;
    if (window.MathJax) MathJax.typesetPromise([detailsBox]);

    // Vẽ đồ thị DFA
    drawNetwork(document.getElementById('networkDFA'), dfa);

    // Hiển thị bảng delta DFA bằng LaTeX
    let latexDelta = `\\[
        \\begin{array}{c|${'c'.repeat(dfa.alphabet.size)}}
        \\text{State} & ${[...dfa.alphabet].join(' & ')} \\\\
        \\hline
    `;
    dfa.states.forEach(s => {
        latexDelta += `${s} & ${[...dfa.alphabet].map(a => dfa.transitions[s] && dfa.transitions[s][a] ? dfa.transitions[s][a] : '-').join(' & ')} \\\\`;
    });
    latexDelta += `\\end{array}
    \\]`;

    document.getElementById('dfaTable').innerHTML = latexDelta;
    if (window.MathJax) MathJax.typesetPromise([detailsBox, document.getElementById('dfaTable')]);

    // Mô phỏng DFA với chuỗi nhập
    const inputElem = document.getElementById('inputString');
    const inputStr = inputElem ? inputElem.value.trim() : '';
    if (inputStr) simulateDFA(dfa, inputStr);
});
