let nfa = null;
let network = null;

function parseNFA(text) {
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
  const result = { states: new Set(), alphabet: new Set(), start: null, accept: new Set(), transitions: {} };
  let inTrans = false;
  for (const line of lines) {
    if (/^states\s*:/i.test(line)) line.split(":")[1].split(",").forEach(s=>result.states.add(s.trim()));
    else if (/^alphabet\s*:/i.test(line)) line.split(":")[1].split(",").forEach(s=>result.alphabet.add(s.trim()));
    else if (/^start\s*:/i.test(line)) result.start = line.split(":")[1].trim();
    else if (/^accept\s*:/i.test(line)) line.split(":")[1].split(",").forEach(s=>result.accept.add(s.trim()));
    else if (/^transitions\s*:/i.test(line)) inTrans=true;
    else if (inTrans) {
      const parts=line.split(",").map(x=>x.trim());
      if(parts.length===3){
        const [src,sym,dst]=parts;
        if(!result.transitions[src]) result.transitions[src]={};
        if(!result.transitions[src][sym]) result.transitions[src][sym]=new Set();
        result.transitions[src][sym].add(dst);
        result.states.add(src); result.states.add(dst);
      }
    }
  }
  return result;
}

function validateNFA(nfa){
  if(!nfa.start) return {ok:false,msg:"Thiếu trạng thái bắt đầu."};
  if(!nfa.states.has(nfa.start)) return {ok:false,msg:"Start không hợp lệ."};
  for(const s of nfa.accept) if(!nfa.states.has(s)) return {ok:false,msg:`Accept ${s} không hợp lệ.`};
  return {ok:true};
}

function drawNFA(nfa){
  const nodes=[],edges=[];
  nfa.states.forEach(s=>{
    const isStart = s===nfa.start;
    const isAccept = nfa.accept.has(s);
    nodes.push({
      id:s,label:s,
      shape:isAccept?"doubleCircle":"circle",
      color:isStart?"#27ae60":isAccept?"#e74c3c":"#007bff",
      font:{color:"#fff",size:16,face:"arial"}
    });
  });
  for(const src in nfa.transitions)
    for(const sym in nfa.transitions[src])
      for(const dst of nfa.transitions[src][sym])
        edges.push({from:src,to:dst,label:sym});
  const container=document.getElementById("network");
  const data={nodes:new vis.DataSet(nodes),edges:new vis.DataSet(edges)};
  const options={
    layout:{improvedLayout:true},physics:{enabled:false},
    edges:{smooth:true,arrows:"to",font:{align:"top"}},
    nodes:{borderWidth:2,shadow:true,color:{border:"#fff"},font:{color:"#fff"}}
  };
  network=new vis.Network(container,data,options);
}

function epsilonClosure(nfa, states) {
  let stack = [...states], closure = new Set(states);
  while(stack.length>0){
    const state = stack.pop();
    const epsTrans = nfa.transitions[state] && nfa.transitions[state]['eps'];
    if(epsTrans){
      for(const s of epsTrans){
        if(!closure.has(s)){ closure.add(s); stack.push(s); }
      }
    }
  }
  return closure;
}

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
      ? wrapDisplay('\\delta(' + nfa.start + ', \\epsilon) = ' 
        + statesToTex(currentStates) +
         ' \\cap F \\neq \\emptyset \\Rightarrow \\text{Chuỗi rỗng được chấp nhận.}')
      : wrapDisplay('\\delta(' + nfa.start + ', \\epsilon) = ' 
        + statesToTex(currentStates) +
         ' \\cap F = \\emptyset \\Rightarrow \\text{Chuỗi rỗng bị từ chối.}');
    details.push(wrapInline('\\delta(' + nfa.start +
       ', \\epsilon) = ' + statesToTex(currentStates)));
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
      details.push(wrapInline('\\text{Dừng: không có chuyển từ } ' 
        + texPrev + ' \\text{ với ký hiệu } ' + sym));
      return { ok: false, msg: `Không có chuyển từ ${[...currentStates].join(', ')} 
      với '${sym}'`, path, details, deltaTable };
    }

    currentStates = nextStates;
    path.push(new Set(currentStates));
  }

  const accepted = [...currentStates].some(s => nfa.accept.has(s));
  const conclusion = accepted
    ? wrapDisplay('\\delta(' + nfa.start + ', ' + str + ') = ' 
      + statesToTex(currentStates) + 
      ' \\cap F \\neq \\emptyset \\Rightarrow \\text{Chuỗi được chấp nhận.}')
    : wrapDisplay('\\delta(' + nfa.start + ', ' + str + ') = '
       + statesToTex(currentStates) + 
       ' \\cap F = \\emptyset \\Rightarrow \\text{Chuỗi bị từ chối.}');

  return { ok: true, accepted, path, details, deltaTable, conclusion };
}


function highlightStates(statesSet){
  if(!network) return;
  const all = network.body.data.nodes.get();
  for(const node of all){
    const isStart = node.id===nfa.start;
    const isAccept = nfa.accept.has(node.id);
    const baseColor = isStart?"#27ae60":isAccept?"#e74c3c":"#007bff";
    network.body.data.nodes.update({id:node.id,color:statesSet.has(node.id)?"#27a2f0":baseColor});
  }
}

window.addEventListener("DOMContentLoaded",()=>{
  const fileInput=document.getElementById("fileInput");
  const fileContent=document.getElementById("fileContent");
  const checkBtn=document.getElementById("checkBtn");
  const inputString=document.getElementById("inputString");
  const resultDiv=document.getElementById("result");
  const detailsDiv=document.getElementById("details");

  fileInput.addEventListener("change", e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = evt=>{
      fileContent.value = evt.target.result;
      nfa=parseNFA(evt.target.result);
      const valid = validateNFA(nfa);
      if(!valid.ok){ resultDiv.innerHTML=`<div class="status bad">${valid.msg}</div>`; detailsDiv.innerHTML=""; return;}
      drawNFA(nfa);
      resultDiv.innerHTML=`<div class="status ok">NFA hợp lệ! Đã vẽ đồ thị.</div>`;
      detailsDiv.innerHTML="";
    };
    reader.readAsText(file);
  });

  checkBtn.addEventListener("click",()=>{
    if(!nfa) return alert("Hãy tải NFA trước!");
    const str = inputString.value.trim();
    const res = simulateNFA(nfa,str);
    if(!res.ok){ resultDiv.innerHTML=`<div class="status bad">${res.msg}</div>`; detailsDiv.innerHTML=""; return;}
    highlightStates(res.path[res.path.length-1]);
    resultDiv.innerHTML=`<div class="status ${res.accepted?"ok":"bad"}">${res.conclusion}</div>`;
    detailsDiv.innerHTML = `<ol>${res.details.map(d=>`<li>${d}</li>`).join('')}</ol>`;
  });
});
