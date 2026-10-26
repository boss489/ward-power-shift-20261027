/* 정전 병동 배전 — wholly fictional integer game rules. */
(function(root, factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.WardGame=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const EQUIPMENT=[['신호등','복도 길찾기'],['기록판','교대 기록'],['온도고리','실내 균형'],['빛기둥','구역 조명'],['전달관','물품 이동'],['정화탑','공기 연출']];
const WARDS=[['새벽동',[0,1]],['안개동',[2,3]],['별빛동',[4,5]],['노을동',[1,2]]];
const CARDS=[
 {title:'신호등 점검',ward:0,delta:1,note:'새벽동 필요 +1'},
 {title:'기록판 교체',ward:0,delta:-1,note:'새벽동 필요 -1'},
 {title:'빛기둥 시험',ward:1,delta:1,note:'안개동 필요 +1'},
 {title:'온도고리 안정',ward:1,delta:-1,note:'안개동 필요 -1'},
 {title:'전달관 급행',ward:2,delta:1,note:'별빛동 필요 +1'},
 {title:'정화탑 휴식',ward:2,delta:-1,note:'별빛동 필요 -1'},
 {title:'교대 기록 집중',ward:3,delta:1,note:'노을동 필요 +1'},
 {title:'온도고리 절전',ward:3,delta:-1,note:'노을동 필요 -1'},
 {title:'복도 합동 점검',ward:0,delta:1,note:'새벽동 필요 +1'},
 {title:'안개등 절약',ward:1,delta:-1,note:'안개동 필요 -1'},
 {title:'물품 정리',ward:2,delta:-1,note:'별빛동 필요 -1'},
 {title:'저녁 기록',ward:3,delta:1,note:'노을동 필요 +1'}
];
const BASE=[[1,2,1,2],[2,1,2,1],[1,2,2,1],[2,1,1,2]];
const GENERATION=[4,4,3,4,3,4,4,3,4,3,4,4];
function random(seed){let x=seed>>>0;return ()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296;}}
function createGame(seed=1){seed=Number.isSafeInteger(seed)?seed:1;const deck=CARDS.map((_,i)=>i),r=random(seed);for(let i=deck.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}return {version:1,seed,deck,turn:1,battery:10,alloc:[0,0,0,0],draftStack:[],streak:[0,0,0,0],warnings:0,score:100,history:[],phase:'playing'};}
function forecast(g,turn=g.turn){if(turn<1||turn>12)return null;const card=CARDS[g.deck[turn-1]], demand=BASE[(turn-1)%4].slice();demand[card.ward]=Math.max(0,Math.min(3,demand[card.ward]+card.delta));return {card,demand,generation:GENERATION[turn-1]};}
function setAllocation(g,index,value){if(g.phase!=='playing'||!Number.isInteger(index)||index<0||index>3||!Number.isInteger(value)||value<0||value>3)return null;if(g.alloc[index]===value)return g;const alloc=g.alloc.slice();alloc[index]=value;return {...g,alloc,draftStack:[...g.draftStack,g.alloc.slice()]};}
function undo(g){if(g.phase!=='playing'||!g.draftStack.length)return g;return {...g,alloc:g.draftStack[g.draftStack.length-1].slice(),draftStack:g.draftStack.slice(0,-1)};}
function commit(g){if(g.phase!=='playing')return null;const f=forecast(g),used=g.alloc.reduce((a,b)=>a+b,0);if(used>f.generation+g.battery)return null;const spent=Math.max(0,used-f.generation),charged=Math.min(2,Math.max(0,f.generation-used),12-g.battery);const streak=g.streak.map((n,i)=>g.alloc[i]<f.demand[i]?n+1:0);const warning=f.demand.reduce((s,d,i)=>s+Math.max(0,d-g.alloc[i]),0);const penalty=warning*3+streak.reduce((s,n)=>s+(n>=3?2:0),0);const score=Math.max(0,g.score-penalty);const history=[...g.history,{turn:g.turn,card:g.deck[g.turn-1],generation:f.generation,demand:f.demand,alloc:g.alloc.slice(),spent,charged,battery:g.battery-spent+charged,warning,penalty,score}];return {...g,turn:g.turn+1,battery:g.battery-spent+charged,alloc:[0,0,0,0],draftStack:[],streak,warnings:g.warnings+warning,score,history,phase:g.turn===12?'result':'playing'};}
function restore(text){try{const g=JSON.parse(text);if(!g||g.version!==1||!Number.isSafeInteger(g.seed)||!Number.isInteger(g.turn)||g.turn<1||g.turn>13||!Number.isInteger(g.battery)||g.battery<0||g.battery>12||!Array.isArray(g.deck)||g.deck.length!==12||g.deck.some((x,i)=>!Number.isInteger(x)||x<0||x>11||g.deck.indexOf(x)!==i)||!Array.isArray(g.alloc)||g.alloc.length!==4||g.alloc.some(x=>!Number.isInteger(x)||x<0||x>3)||!Array.isArray(g.streak)||g.streak.length!==4||g.streak.some(x=>!Number.isInteger(x)||x<0)||!Array.isArray(g.draftStack)||g.draftStack.some(a=>!Array.isArray(a)||a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>3))||!Array.isArray(g.history)||g.history.length!==g.turn-1||!Number.isInteger(g.score)||g.score<0||g.score>100||!Number.isInteger(g.warnings)||g.warnings<0||g.phase!==(g.turn===13?'result':'playing'))return null;return g;}catch{return null;}}
return {EQUIPMENT,WARDS,CARDS,createGame,forecast,setAllocation,undo,commit,restore};
});
