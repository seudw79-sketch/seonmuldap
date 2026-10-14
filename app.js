(function(){
const R={parents:'부모님',partner:'연인·배우자',friend:'친구',coworker:'직장동료·상사',teacher:'선생님',student:'수험생',baby:'아기·돌',housewarming:'집들이',kid:'어린이·조카'};
const B={b1:'1만원 이하',b3:'1~3만원',b5:'3~5만원',b10:'5~10만원'};const M={toss:'토스쇼핑',kakao:'카카오 선물하기',coupang:'쿠팡',naver:'네이버 쇼핑','11st':'11번가',gmarket:'G마켓',ssg:'SSG',lotteon:'롯데ON'};
const sel={r:null,b:null,o:null};let CAT=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{const g=ch.dataset.group,v=ch.dataset.v;sel[g]=sel[g]===v?null:v;document.querySelectorAll(`.chip[data-group=${g}]`).forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===sel[g]?'true':'false'));if(sel.r)run();}));
document.getElementById('go').addEventListener('click',run);
function score(it){let s=0;if(!it.recipients.includes(sel.r))return -1;s+=10;if(sel.b){if(it.budget===sel.b)s+=6;else if(Math.abs('b1,b3,b5,b10'.split(',').indexOf(it.budget)-'b1,b3,b5,b10'.split(',').indexOf(sel.b))===1)s+=2;else return -1;}
if(sel.o){if(it.occasions.includes(sel.o))s+=5;else s-=3;}if(it.offers&&it.offers.some(o=>o.url&&!o.url.startsWith('{{')))s+=1;return s;}
function offers(it){const of=(it.offers||[]).filter(o=>o.price).sort((a,b)=>a.price-b.price);if(!of.length)return `<span class="slot">{{SL:${esc(it.slug)}}} · {{KK:${esc(it.slug)}}} — 상품 링크 준비 중</span>`;
let h='<div class="offers"><div class="note">판매처별 가격 (낮은 순 · 조회 시점 기준)</div><ul>';of.forEach((o,k)=>{const live=o.url&&!o.url.startsWith('{{');h+=`<li>${live?`<a class="slot live" href="${esc(o.url)}" rel="sponsored nofollow noopener" target="_blank">${esc(M[o.merchant]||o.merchant)} ${o.price.toLocaleString()}원${k===0?' · 최저':''}</a>`:`<span class="slot">${esc(M[o.merchant]||o.merchant)} ${o.price.toLocaleString()}원 (링크 준비 중)</span>`} <span class="note">${esc(o.product_name||'')} · ${esc(o.updated_at||'')}</span></li>`;});h+='</ul>';
if(it.ref_lowest&&it.ref_lowest.price)h+=`<div class="note">시중 최저가 참고: ${it.ref_lowest.price.toLocaleString()}원 (${esc(it.ref_lowest.source||'네이버 쇼핑 검색')}, ${esc(it.ref_lowest.checked_at||'')} 기준 · 배송비 별도일 수 있음)</div>`;return h+'</div>';}
async function run(){const out=document.getElementById('result');if(!sel.r){out.innerHTML='<p class="note">받는 사람을 먼저 골라 주세요.</p>';return;}
if(!CAT){out.innerHTML='<p class="note">불러오는 중…</p>';CAT=(await (await fetch('catalog.json')).json()).items;}
const list=CAT.map(it=>({it,s:score(it)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s||a.it.price_min-b.it.price_min).slice(0,5);
const title=`${R[sel.r]}${sel.o?' · '+document.querySelector(`.chip[data-group=o][data-v=${sel.o}]`).textContent:''}${sel.b?' · '+B[sel.b]:''}`;
if(!list.length){out.innerHTML=`<h2>${esc(title)}</h2><p class="note">이 조합에 맞는 항목이 아직 없어요. 예산이나 상황을 바꿔 보세요.</p>`;return;}
out.innerHTML=`<h2>${esc(title)} — 이렇게 고르면 돼요</h2><p class="note">[광고] 아래 상품 링크로 구매하시면 수수료를 받아요. 가격은 조회 시점 기준이에요.</p>`+list.map(({it})=>`<div class="item"><h3>${esc(it.name)}<span class="badge">${B[it.budget]||''}</span></h3><p class="why">${esc(it.why)}</p><div class="meta">대략 ${it.price_min.toLocaleString()}~${it.price_max.toLocaleString()}원</div><ul>${(it.check||[]).map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p class="avoid">피하면 좋은 경우: ${esc(it.avoid||'')}</p>${offers(it)}</div>`).join('');
if(window.gtag)gtag('event','recommend',{recipient:sel.r,budget:sel.b||'',occasion:sel.o||''});}
})();
