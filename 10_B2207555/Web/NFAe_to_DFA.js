let nfae = null, nfa = null, dfa = null;

function parseNFA(text){
    const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
    const result={states:new Set(),alphabet:new Set(),start:null,accept:new Set(),transitions:{}};
    let inTrans=false;
    for(const line of lines){
        if(/^states\s*:/i.test(line)) line.split(':')[1].split(',').forEach(s=>result.states.add(s.trim()));
        else if(/^alphabet\s*:/i.test(line)) line.split(':')[1].split(',').forEach(s=>result.alphabet.add(s.trim()));
        else if(/^start\s*:/i.test(line)) result.start=line.split(':')[1].trim();
        else if(/^accept\s*:/i.test(line)) line.split(':')[1].split(',').forEach(s=>result.accept.add(s.trim()));
        else if(/^transitions\s*:/i.test(line)) inTrans=true;
        else if(inTrans){
            const parts=line.split(',').map(x=>x.trim());
            if(parts.length>=3){
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

function drawNetwork(netDiv, automata){
    if(!automata || !netDiv) return;
    const nodes=[], edges=[];
    automata.states.forEach(s=>{
        const isStart = s===automata.start;
        const isAccept = automata.accept.has(s);
        nodes.push({id:s,label:s,shape:isAccept?'doubleCircle':'circle',color:isStart?'#27ae60':isAccept?'#e74c3c':'#007bff',font:{color:'#fff'}});
    });
    for(const src in automata.transitions){
        for(const sym in automata.transitions[src]){
            let dsts=automata.transitions[src][sym];
            if(typeof dsts==='string') dsts=[dsts];
            dsts.forEach(dst=>edges.push({from:src,to:dst,label:sym,arrows:'to'}));
        }
    }
    const data={nodes:new vis.DataSet(nodes),edges:new vis.DataSet(edges)};
    const options={layout:{improvedLayout:true},physics:{enabled:false}};
    new vis.Network(netDiv,data,options);
}

function epsilonClosure(nfae, states){
    const stack=[...states], closure=new Set(states);
    while(stack.length){
        const s=stack.pop();
        if(nfae.transitions[s] && nfae.transitions[s]['ε']){
            nfae.transitions[s]['ε'].forEach(t=>{
                if(!closure.has(t)){ closure.add(t); stack.push(t); }
            });
        }
    }
    return closure;
}

function convertNFAeToNFA(nfae){
    const newTrans={};
    nfae.states.forEach(s=>{
        newTrans[s]={};
        nfae.alphabet.forEach(a=>{
            if(a==='ε') return;
            let dstSet=new Set();
            const eps_s=epsilonClosure(nfae,new Set([s]));
            eps_s.forEach(q=>{
                if(nfae.transitions[q] && nfae.transitions[q][a]){
                    nfae.transitions[q][a].forEach(r=>{
                        epsilonClosure(nfae,new Set([r])).forEach(rr=>dstSet.add(rr));
                    });
                }
            });
            if(dstSet.size) newTrans[s][a]=dstSet;
        });
    });
    const newAccept=new Set();
    nfae.states.forEach(s=>{
        const eps_s=epsilonClosure(nfae,new Set([s]));
        if([...eps_s].some(x=>nfae.accept.has(x))) newAccept.add(s);
    });
    return {states:nfae.states,alphabet:new Set([...nfae.alphabet].filter(a=>'ε'!==a)),
        start:nfae.start,accept:newAccept,transitions:newTrans};
}

function convertNFAtoDFA(nfa,callback){
    const dfaStates=[], dfaTrans={};
    const startClosure=epsilonClosure(nfa,new Set([nfa.start]));
    const unmarked=[startClosure];
    const stateNames={[[...startClosure].sort().join(',')]:'A'};
    let nameCharCode=66;
    while(unmarked.length){
        const curr=unmarked.shift();
        const currName=stateNames[[...curr].sort().join(',')];
        dfaStates.push(curr);
        dfaTrans[currName]={};
        nfa.alphabet.forEach(sym=>{
            if(sym==='ε') return;
            let nextSet=new Set();
            curr.forEach(s=>{
                if(nfa.transitions[s] && nfa.transitions[s][sym]){
                    nfa.transitions[s][sym].forEach(t=>{
                        epsilonClosure(nfa,new Set([t])).forEach(x=>nextSet.add(x));
                    });
                }
            });
            if(nextSet.size){
                const key=[...nextSet].sort().join(',');
                if(!stateNames[key]) stateNames[key]=String.fromCharCode(nameCharCode++);
                const nextName=stateNames[key];
                dfaTrans[currName][sym]=new Set([nextName]);
                if(!dfaStates.find(s=>[...s].sort().join(',')===key)) unmarked.push(nextSet);
                if(callback) callback({current:curr,sym:sym,next:nextSet});
            }
        });
    }
    const dfaObj={states:new Set(Object.values(stateNames)),alphabet:new Set([...nfa.alphabet].filter(a=>'ε'!==a)),start:'A',accept:new Set(),transitions:{}};
    for(const s in dfaTrans){
        dfaObj.transitions[s]={};
        for(const sym in dfaTrans[s]){
            dfaObj.transitions[s][sym]=[...dfaTrans[s][sym]][0];
        }
    }
    Object.keys(stateNames).forEach(key=>{
        const arr=key.split(',');
        if(arr.some(x=>nfa.accept.has(x))) dfaObj.accept.add(stateNames[key]);
    });
    return dfaObj;
}

// === Hiển thị bảng DFA ===
function showDFATable(dfa){
    let html='<table><tr><th>State</th>';
    dfa.alphabet.forEach(a=>html+=`<th>${a}</th>`); html+='</tr>';
    dfa.states.forEach(s=>{
        html+=`<tr><td>${s}</td>`;
        dfa.alphabet.forEach(a=>{
            const dst=dfa.transitions[s] && dfa.transitions[s][a]?dfa.transitions[s][a]:'-';
            html+=`<td>${dst}</td>`;
        });
        html+='</tr>';
    });
    document.getElementById('dfaTable').innerHTML=html;
}

// === Simulation DFA ===
function simulateDFA(dfa,str){
    let cur=dfa.start; let steps=[];
    for(const c of str){
        if(!dfa.transitions[cur]||!dfa.transitions[cur][c]){
            steps.push(`Không có chuyển từ ${cur} với '${c}'`);
            break;
        }
        steps.push(`${cur} --${c}--> ${dfa.transitions[cur][c]}`);
        cur=dfa.transitions[cur][c];
    }
    steps.push(dfa.accept.has(cur)?`Kết thúc tại ${cur} → CHẤP NHẬN`:`Kết thúc tại ${cur} → TỪ CHỐI`);
    document.getElementById('dfaResult').innerHTML='<ol>'+steps.map(s=>`<li>${s}</li>`).join('')+'</ol>';
}

// === Events ===
document.getElementById('fileInput').addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=evt=>{
        document.getElementById('fileContent').value=evt.target.result;
        nfae=parseNFA(evt.target.result);
        drawNetwork(document.getElementById('networkNFAe'),nfae);
        let details='';
        nfae.states.forEach(s=>{
            if(nfae.transitions[s]){
                for(const a in nfae.transitions[s]){
                    details+=`${s} --${a}--> {${[...nfae.transitions[s][a]].join(',')}}<br>`;
                }
            }
        });
        document.getElementById('nfaeDetails').innerHTML=details;
        document.getElementById('nfaeCard').style.display='block';
        document.getElementById('nfaCard').style.display='none';
        document.getElementById('dfaCard').style.display='none';
    };
    reader.readAsText(file);
});

document.getElementById('startBtn').addEventListener('click',()=>{
    if(!nfae) return alert('Hãy tải NFAe trước!');
    const option=document.getElementById('convertOption').value;
    nfa=convertNFAeToNFA(nfae);
    if(option==='NFA'){
        drawNetwork(document.getElementById('networkNFA'),nfa);
        let details='';
        nfa.states.forEach(s=>{
            if(nfa.transitions[s]){
                for(const a in nfa.transitions[s]){
                    details+=`${s} --${a}--> {${[...nfa.transitions[s][a]].join(',')}}<br>`;
                }
            }
        });
        document.getElementById('nfaDetails').innerHTML=details;
        document.getElementById('nfaCard').style.display='block';
        document.getElementById('dfaCard').style.display='none';
    } else {
        dfa=convertNFAtoDFA(nfa,(step)=>{
            const detailsBox=document.getElementById('dfaDetails');
            let html=`Xét tập trạng thái {${[...step.current].join(',')}}`;
            if(step.sym && step.next && step.next.size){
                html+=` với ký hiệu '${step.sym}' → {${[...step.next].join(',')}}<br>`;
            }
            detailsBox.innerHTML+=html;
        });
        drawNetwork(document.getElementById('networkDFA'),dfa);
        showDFATable(dfa);
        const inputStr=document.getElementById('inputString').value.trim();
        if(inputStr) simulateDFA(dfa,inputStr);
        document.getElementById('nfaCard').style.display='none';
        document.getElementById('dfaCard').style.display='block';
    }
});
