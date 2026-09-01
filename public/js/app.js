var Ot=Object.defineProperty;var p=(e,t)=>()=>(e&&(t=e(e=0)),t);var _=(e,t)=>{for(var a in t)Ot(e,a,{get:t[a],enumerable:!0})};function Wt(e,t){Oe?Oe(e,t):console.error("[Ghost] Unhandled effect error:",e)}function S(e){let t=e,a=new Set;return{get(){return x&&(a.add(x),x.dependencies.add(a)),t},set(r){t!==r&&(t=r,We(a))}}}function We(e){oe(()=>{e.forEach(t=>{t.notify?t.notify():B.add(t)})})}function oe(e){ne++;try{e()}finally{if(ne--,ne===0){let t=Array.from(B);B.clear(),t.forEach(a=>a.run())}}}function w(e){let t={dependencies:new Set,run(){ie(t),D.push(x),x=t;try{e()}catch(a){Wt(a,e)}finally{x=D.pop()}},notify(){B.add(t)}};return t.run(),()=>ie(t)}function de(e){let t,a=!0,r=new Set,s={dependencies:new Set,notify(){a||(a=!0,We(r))}};return{get(){if(x&&(r.add(x),x.dependencies.add(r)),a){ie(s),D.push(x),x=s;try{t=e()}finally{x=D.pop()}a=!1}return t}}}function ie(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var x,D,B,ne,Oe,F=p(()=>{x=null,D=[],B=new Set,ne=0,Oe=null});function W(){le.totalUpdates++,le.recentUpdates++}var G,le,ce=p(()=>{G=new Set,le={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function A(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){It(e,t);return}if(e.__ghostWhen){jt(e,t);return}if(e.__ghostLazy){Dt(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;G.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([r,s])=>{if(r==="ghostStyle"&&s?.mount){s.mount(a);return}let i=r.startsWith("on");typeof s=="function"&&!i?e.effects.push(w(()=>{a.setAttribute(r,s()),W(),e.events.update?.forEach(n=>n())})):i?a[r.toLowerCase()]=s:a.setAttribute(r,s)}),e.children.forEach(r=>{if(r!=null)if(r.__ghostList||r.__ghostWhen||r.__ghostLazy)A(r,a);else if(typeof r=="string"||typeof r=="number")a.appendChild(document.createTextNode(String(r)));else if(typeof r=="function"){let s=null;e.effects.push(w(()=>{let i=r(),n=document.createTextNode(String(i??""));s?a.replaceChild(n,s):a.appendChild(n),s=n,W(),e.events.update?.forEach(o=>o())}))}else A(r,a)}),t.appendChild(a),e.events.mount?.forEach(r=>r())}function I(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),G.delete(e)}}function It(e,t){let{getItems:a,keyFn:r,renderFn:s}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function d(m){return m.el||null}let v=w(()=>{let m=a(),C=m.map((b,H)=>String(r(b,H))),Rt=Array.from(o.keys());for(let b of Rt)if(!C.includes(b)){let H=o.get(b);I(H.ghostNode),o.delete(b)}for(let b=0;b<m.length;b++){let H=C[b];if(!o.has(H)){let O=s(m[b],b),P=document.createElement("ghost-list-slot");for(A(O,P);P.firstChild;)t.insertBefore(P.firstChild,n);o.set(H,{ghostNode:O})}}for(let b=C.length-1;b>=0;b--){let H=C[b],O=o.get(H);if(!O)continue;let P=d(O.ghostNode);if(!P)continue;let Ue=C[b+1],Re=(Ue?d(o.get(Ue)?.ghostNode):null)||n;P.nextSibling!==Re&&t.insertBefore(P,Re)}W()});e._listCleanup=()=>{v();for(let m of o.values())I(m.ghostNode);o.clear(),i.remove(),n.remove()}}function N(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function jt(e,t){let{conditionGetter:a,trueFn:r,falseFn:s}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=w(()=>{let v=a()?r:s;if(n&&(I(n),n=null),v&&(n=v(),n)){let m=document.createElement("ghost-when-slot");for(A(n,m);m.firstChild;)t.insertBefore(m.firstChild,i)}W()});e._whenCleanup=()=>{o(),n&&I(n),i.remove()}}function Dt(e,t){let{importFn:a,fallback:r}=e,s=document.createComment("[ghost-lazy]");t.appendChild(s);let i=null;if(r){let n=document.createElement("ghost-lazy-slot");for(A(r,n);n.firstChild;)t.insertBefore(n.firstChild,s);i=r}a().then(n=>{let o=n.default||n;i&&(I(i),i=null);let d=typeof o=="function"?o():o,v=document.createElement("ghost-lazy-slot");for(A(d,v);v.firstChild;)t.insertBefore(v.firstChild,s);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var pe=p(()=>{F();ce()});var Ie=p(()=>{F()});var z=p(()=>{});var je=p(()=>{ce()});var De=p(()=>{F()});var Be=p(()=>{pe();F();z();z()});function Gt(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function r(s){let i={};if(s.nodeType===3)return s.nodeValue.trim();if(s.attributes?.length){i["@attributes"]={};for(let n of s.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of s.childNodes){let o=n.nodeName,d=r(n);d!==""&&(i[o]===void 0?i[o]=d:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(d)))}return i}return r(a.documentElement)}function zt(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function me(e,t={}){let{cache:a=!1,...r}=t,s=(r.method||"GET").toUpperCase(),i={url:e,...r};for(let C of me.interceptors.request)i=C(i)??i;let n=i.url;delete i.url;let o=zt(n,s);if(a==="memory"&&s==="GET"&&ue.has(o))return ue.get(o);let d=await fetch(n,i),v=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let m;v.includes("application/xml")||v.includes("text/xml")?m=Gt(await d.text()):v.includes("application/json")?m=await d.json():m=await d.text();for(let C of me.interceptors.response)m=C(d,m)??m;return a==="memory"&&s==="GET"&&ue.set(o,m),m}var ue,Ge=p(()=>{ue=new Map;me.interceptors={request:[],response:[]}});function he(e,t){let a;try{let s=localStorage.getItem(e);a=s?JSON.parse(s):t}catch{a=t}let r=S(a);return w(()=>{try{localStorage.setItem(e,JSON.stringify(r.get()))}catch(s){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,s)}}),r}var ze=p(()=>{F()});function Jt(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(r=>r(a))},clear(t){t?e.delete(t):e.clear()}}}var Qa,Je=p(()=>{Qa=Jt()});var ar,Vt,Ve=p(()=>{F();ar=S("en"),Vt=new Map;Vt.set("en",{})});var k=p(()=>{F();pe();Ie();z();je();De();Be();Ge();ze();Je();Ve()});function Ye(e){fe=e}function Ke(e){ve=e}async function u(e,{method:t="GET",body:a,headers:r={},signal:s}={}){let i=e.startsWith("http")?e:Yt.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...r}};fe&&(n.headers.Authorization=`Bearer ${fe}`),a!==void 0&&(n.body=JSON.stringify(a)),s&&(n.signal=s);let o=await fetch(i,n);if(o.status===401)throw ve&&ve(),new J("Unauthorized",401,null);let d=null,v=o.headers.get("content-type")||"";try{if(v.includes("application/json"))d=await o.json();else{let m=await o.text();d=m?{message:m}:null}}catch{}if(!o.ok){let m=d&&d.message||`HTTP ${o.status}`;throw new J(m,o.status,d)}return d}var Yt,fe,ve,J,c,$=p(()=>{Yt=window.EARNAPP_CONFIG||{apiBase:"/api"},fe=null,ve=null;J=class extends Error{constructor(t,a,r){super(t),this.status=a,this.payload=r}},c={health:()=>u("/health"),register:e=>u("/auth/register",{method:"POST",body:e}),login:e=>u("/auth/login",{method:"POST",body:e}),logout:()=>u("/auth/logout",{method:"POST"}),me:()=>u("/auth/me"),meUser:()=>u("/user"),reward:e=>u("/user/reward",{method:"POST",body:e}),withdraw:e=>u("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>u("/user/withdrawals"),referrals:()=>u("/user/referrals"),adHistory:()=>u("/user/ads"),adsConfig:()=>u("/ads/config"),adsNext:()=>u("/ads/next"),webTasks:()=>u("/tasks/web"),webTaskStart:e=>u("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>u("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>u("/tasks/telegram"),tgTaskVerify:e=>u("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>u("/admin/stats"),adminWithdrawals:(e="pending")=>u(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>u(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>u(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>u(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>u("/admin/users"),adminProviders:()=>u("/admin/ad-providers"),adminUpdateProvider:(e,t)=>u(`/admin/ad-providers/${e}`,{method:"POST",body:t})}});function l(e,t="info",a=3500){j.set({message:e,type:t,id:Date.now()}),ge&&clearTimeout(ge),ge=setTimeout(()=>j.set(null),a)}async function T(){if(!q.get())return null;try{let e=await c.me();return h.set(e.data),e.data}catch{return null}}async function Xe(e,t){let a=await c.login({email:e,password:t});return q.set(a.data.token),h.set(a.data.user),a.data.user}async function Ze(e){let t=await c.register(e);return q.set(t.data.token),h.set(t.data.user),t.data.user}async function V(){try{await c.logout()}catch{}q.set(null),h.set(null),M.set("/login")}function g(e){window.location.hash=e}var Kt,Xt,q,h,j,ge,M,L,f=p(()=>{k();k();$();Kt="earnap_token",Xt="earnap_user",q=he(Kt,null),h=he(Xt,null),j=S(null),ge=null;M=S(window.location.hash.replace(/^#/,"")||"/"),L=de(()=>!!q.get()&&!!h.get());w(()=>{let e=q.get();Ye(e)});Ke(()=>{q.set(null),h.set(null),M.set("/login"),l("Session expired. Please log in.","error")})});var et={};_(et,{HomePage:()=>Y});function Y(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=h.get(),a=y("div","welcome-popup","");a.innerHTML=`
            <strong>Welcome to EarnApp.</strong>
            <span>If you don't receive payment within 5 minutes, please contact support.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,a.querySelector("button").addEventListener("click",()=>a.remove()),e.appendChild(a),e.appendChild(Zt(t)),e.appendChild(Qt(t)),e.appendChild(await ea(t)),e.appendChild(await ta())}}function y(e,t,a){let r=document.createElement(e);return t&&(r.className=t),a!==void 0&&(r.textContent=a),r}function Zt(e){let t=y("div","card card--user-header"),a=y("div","user-header__left"),r=y("img","avatar avatar--lg");r.src=e?e.avatar_url:"https://placehold.co/60x60/e8e8e8/a9a9a9?text=U",r.alt="avatar",a.appendChild(r);let s=y("div","user-header__info");s.innerHTML=`
        <div class="user-header__name">${e?Qe(e.name):"Loading\u2026"}</div>
        <div class="user-header__username">@${e?Qe(e.username):"user"}</div>
    `,a.appendChild(s),t.appendChild(a);let i=y("div","user-header__right");return i.innerHTML=`
        <div class="user-header__metric">
            <span class="metric__label">Balance</span>
            <span class="metric__value metric__value--primary">$${e?parseFloat(e.balance).toFixed(2):"0.00"}</span>
        </div>
        <div class="user-header__metric">
            <span class="metric__label">Total Earned</span>
            <span class="metric__value">$${e?parseFloat(e.lifetime_earned).toFixed(2):"0.00"}</span>
        </div>
        <div class="user-header__metric">
            <span class="metric__label">Network</span>
            <span class="metric__value">${e?e.referral_count:0}</span>
        </div>
    `,t.appendChild(i),t}function Qt(e){let t=y("div","card card--daily-mission");t.innerHTML=`
        <h3 class="card__title">Daily Mission</h3>
        <p class="card__sub">Target: 50 | Completed: ${e?e.today_ads:0} | High Reward</p>
    `;let a=y("button","btn btn--secondary","Claim Daily Bonus");return a.disabled=!0,a.addEventListener("click",()=>l("Daily bonus already claimed today.","info")),t.appendChild(a),t}async function ea(e){let t=y("div","card card--ad-reward"),a=e?e.ads_remaining:0;t.innerHTML=`
        <h3 class="card__title">Ads Reward Center</h3>
        <p class="card__sub">Wait Time: 12 Sec | Daily Limit: 50 Ads</p>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${e?e.today_ads/e.ads_limit*100:0}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${e?e.today_ads:0} / ${e?e.ads_limit:50}</p>
    `;let r=y("button","btn btn--primary btn--xl","Watch Ad & Earn");return a<=0&&(r.disabled=!0,r.textContent="All Tasks Completed"),r.addEventListener("click",()=>aa()),t.appendChild(r),t}async function ta(){let e=y("div","card card--webtask");e.innerHTML=`
        <h3 class="card__title">Web Task Center</h3>
        <p class="card__sub">Loading\u2026</p>
    `;try{let a=(await c.webTasks()).data||[],r=a.filter(n=>n.can_claim).length,s=a.filter(n=>!n.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${r} | Completed: ${s} | Total: ${a.length}`;let i=y("a","btn btn--ghost","View all tasks \u2192");i.href="#/webtask",i.addEventListener("click",n=>{n.preventDefault(),g("/webtask")}),e.appendChild(i)}catch{e.querySelector(".card__sub").textContent="Failed to load."}return e}function aa(){let e=y("div","modal modal--ad");e.innerHTML=`
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">\xD7</button>
            <h3>Watch the ad</h3>
            <div class="ad-slot" id="ad-slot">
                <div class="ad-slot__placeholder">
                    <i class="bi bi-play-circle-fill"></i>
                    <p>Ad will play here\u2026</p>
                </div>
            </div>
            <p class="ad-slot__countdown" id="ad-countdown">Starting\u2026</p>
        </div>
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=e.querySelector("#ad-slot"),a=e.querySelector("#ad-countdown"),r=new Date().toISOString();setTimeout(()=>{t.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Simulated Sponsor Ad</h4>
                <p>Thank you for watching \u2014 your reward will be credited in <span id="cd">12</span>s.</p>
            </div>
        `;let s=12,i=t.querySelector("#cd"),n=setInterval(()=>{s--,i.textContent=s,s<=0&&(clearInterval(n),ra(e,"simulated",r))},1e3)},200)}async function ra(e,t,a){try{let r=await c.reward({provider:t,started_at:a});l("+"+parseFloat(r.data.reward).toFixed(4)+" credited!","success"),e.remove(),await T(),Y()()}catch(r){l(r.message||"Reward failed","error"),e.remove()}}function Qe(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var be=p(()=>{f();$()});var we={};_(we,{WebTaskPage:()=>K});function K(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let r=(await c.webTasks()).data||[];if(r.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",r.forEach(s=>t.appendChild(sa(s)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function sa(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${tt(e.title)}</h3>
        <p class="card__sub">${tt(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>na(e,a,t)),t}async function na(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let r=0,s=e.duration_seconds;t.textContent=`Wait ${s}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{r+=1;let d=s-r;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",r>=s&&(clearInterval(o),ia(t,n,a))},1e3)}function ia(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let r=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(r.data.reward).toFixed(2)+" credited!","success"),await T(),K()()}catch(r){l(r.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function tt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var X=p(()=>{$();f()});var at={};_(at,{EarnPage:()=>Z});function Z(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=h.get(),a=t?t.ads_remaining:0;e.innerHTML=`
            <div class="card card--earn">
                <h2 class="card__title">Ads Reward Center</h2>
                <p class="card__sub">Daily Limit: 50 ads | Reward: ~$0.005 per ad</p>
                <div class="ad-progress">
                    <div class="ad-progress__bar" style="width: ${t?t.today_ads/t.ads_limit*100:0}%"></div>
                </div>
                <p class="ad-progress__label">${t?t.today_ads:0} / ${t?t.ads_limit:50} ads today</p>
                <div class="ad-meta">
                    <span><i class="bi bi-clock"></i> 12 sec per ad</span>
                    <span><i class="bi bi-cash"></i> +$0.005 each</span>
                </div>
                <button id="watch-btn" class="btn btn--primary btn--xl" ${a<=0?"disabled":""}>
                    ${a<=0?"All Tasks Completed":"Watch Ad & Earn"}
                </button>
            </div>
        `;let r=e.querySelector("#watch-btn");r.disabled||r.addEventListener("click",()=>oa())}}function oa(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">\xD7</button>
            <h3>Watch the ad</h3>
            <div class="ad-slot" id="ad-slot">
                <div class="ad-slot__placeholder">
                    <i class="bi bi-play-circle-fill"></i>
                    <p>Preparing ad\u2026</p>
                </div>
            </div>
            <p class="ad-slot__countdown" id="ad-countdown">Starting\u2026</p>
        </div>
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=new Date().toISOString(),a=12,r=e.querySelector("#ad-slot"),s=e.querySelector("#ad-countdown");setTimeout(()=>{r.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Sponsored Content</h4>
                <p>This is a placeholder for a real ad. <br>Your reward will be credited in <strong><span id="cd-num">12</span>s</strong>.</p>
            </div>
        `;let i=r.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,s.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await da(e,"simulated",t))},1e3)},300)}async function da(e,t,a){try{let r=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(r.data.reward).toFixed(4)} credited!`,"success"),await T(),e.remove(),Z()()}catch(r){l(r.message||"Reward failed","error"),e.remove()}}var _e=p(()=>{$();f()});var st={};_(st,{ReferPage:()=>ye});function ye(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=h.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let r=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
            <div class="card card--refer">
                <h2 class="card__title">Invite & Earn</h2>
                <p class="card__sub">Total Network: <strong>${t?t.referral_count:0}</strong> | Bonus Rate: <strong>50%</strong> | Earned so far: <strong>$${a?parseFloat(a.total_commission).toFixed(4):"0.0000"}</strong></p>
                <div class="refer-link">
                    <input id="refer-link-input" class="refer-link__input" value="${r}" readonly>
                    <button id="copy-btn" class="btn btn--primary">Copy</button>
                </div>
                <a id="share-tg" class="btn btn--ghost" target="_blank" rel="noopener">Share on Telegram</a>
                <ol class="refer-steps">
                    <li>Copy and share your unique referral link</li>
                    <li>When they register and start watching ads or completing tasks</li>
                    <li>You will receive 50% commission instantly</li>
                </ol>
            </div>

            <h3 class="section-title">Your Referrals</h3>
            <div class="refer-list" id="refer-list">
                ${a&&a.referrals.length===0?'<p class="muted">No referrals yet. Share your link to start earning 50% of their rewards!</p>':""}
            </div>
        `;let s=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");s.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),l("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),l("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(r);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let v=document.createElement("div");v.className="refer-item",v.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${rt(d.name)}</div>
                        <div class="refer-item__username">@${rt(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(v)})}}function rt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var xe=p(()=>{$();f()});var nt={};_(nt,{WithdrawPage:()=>Q});function Q(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=h.get();e.innerHTML=`
            <h2 class="page-title">Withdraw</h2>
            <div class="card card--withdraw">
                <div class="withdraw-info">
                    <div class="withdraw-info__item">
                        <span class="muted">Withdrawable Balance</span>
                        <strong>$${t?parseFloat(t.balance).toFixed(2):"0.00"}</strong>
                    </div>
                    <div class="withdraw-info__item">
                        <span class="muted">Referrals</span>
                        <strong>${t?t.referral_count:0}</strong>
                    </div>
                </div>
                ${t&&!t.can_withdraw?'<p class="withdraw-warn">\u26A0 You need at least 1 referral to unlock withdrawal.</p>':""}
                <form id="withdraw-form" class="withdraw-form">
                    <label class="withdraw-form__label">Withdrawal Amount (Taka)
                        <input name="amount" type="number" min="1" step="0.01" required value="1.00">
                    </label>
                    <label class="withdraw-form__label">Account / Wallet Address
                        <input name="wallet_address" type="text" required minlength="8" maxlength="20" placeholder="01XXXXXXXXX">
                    </label>
                    <label class="withdraw-form__label">Payment Method
                        <select name="gateway" required>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                        </select>
                    </label>
                    <button type="submit" class="btn btn--primary btn--xl" ${t&&!t.can_withdraw?"disabled":""}>
                        Confirm Withdrawal
                    </button>
                </form>
            </div>

            <h3 class="section-title">Withdrawal History</h3>
            <div class="withdraw-history" id="withdraw-history">Loading\u2026</div>
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async s=>{s.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await T(),Q()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let v=Object.values(d)[0];l(Array.isArray(v)?v[0]:v,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let r=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?r.innerHTML='<p class="muted">No withdrawals yet.</p>':(r.innerHTML="",i.forEach(n=>r.appendChild(la(n))))}catch{r.innerHTML='<p class="muted">Failed to load history.</p>'}}}function la(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),r=e.admin_note?`<div class="withdraw-row__note">"${Se(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${Se(e.gateway)} \xB7 ${Se(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${r}
    `,t}function Se(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Te=p(()=>{$();f()});var Le={};_(Le,{ProfilePage:()=>$e});function $e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=h.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?ke(t.name):""}</h2>
                <p class="card__sub">@${t?ke(t.username):""}</p>
                <div class="profile-stats">
                    <div><span class="muted">Main Balance</span><strong>$${t?parseFloat(t.balance).toFixed(2):"0.00"}</strong></div>
                    <div><span class="muted">Lifetime Earn</span><strong>$${t?parseFloat(t.lifetime_earned).toFixed(2):"0.00"}</strong></div>
                    <div><span class="muted">Earn Today</span><strong>$${t?parseFloat(t.today_earned).toFixed(2):"0.00"}</strong></div>
                    <div><span class="muted">Ads Viewed</span><strong>${t?t.today_ads:0}</strong></div>
                </div>
                <div class="profile-links">
                    <a class="btn btn--ghost" href="#/refer">Referral Network (${t?t.referral_count:0})</a>
                    <a class="btn btn--ghost" href="#/withdraw">Withdraw Funds</a>
                    <a class="btn btn--ghost" href="#/admin">Admin</a>
                    <a class="btn btn--ghost" href="https://t.me/EasyEarningBot_admin" target="_blank" rel="noopener">Customer Support</a>
                </div>
            </div>

            <h3 class="section-title">Recent Ad History</h3>
            <div class="ad-history" id="ad-history">Loading\u2026</div>
        `;let a=e.querySelector("#ad-history");try{let s=(await c.adHistory()).data||[];if(s.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let i=a.querySelector(".ad-history__list");s.forEach(n=>{let o=document.createElement("div");o.className="ad-history__row",o.innerHTML=`
                        <span class="ad-history__provider">${ke(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function ke(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ee=p(()=>{$();f()});var ot={};_(ot,{default:()=>it});async function it(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
        <h1 class="page-title">Leaderboard</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Top Earners</h3>
                <span class="badge badge--green">This Month</span>
            </div>
            <p class="card__sub">See who's earning the most on JMJob</p>

            <div class="leaderboard-list">
                <div class="leaderboard-item leaderboard-item--gold">
                    <span class="leaderboard-rank">#1</span>
                    <div class="leaderboard-avatar">A</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">Alice Demo</div>
                        <div class="leaderboard-earned">$12.85 earned</div>
                    </div>
                    <span class="leaderboard-badge">\u{1F947}</span>
                </div>
                <div class="leaderboard-item leaderboard-item--silver">
                    <span class="leaderboard-rank">#2</span>
                    <div class="leaderboard-avatar">B</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">Bob Worker</div>
                        <div class="leaderboard-earned">$10.50 earned</div>
                    </div>
                    <span class="leaderboard-badge">\u{1F948}</span>
                </div>
                <div class="leaderboard-item leaderboard-item--bronze">
                    <span class="leaderboard-rank">#3</span>
                    <div class="leaderboard-avatar">C</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">Charlie Earner</div>
                        <div class="leaderboard-earned">$8.75 earned</div>
                    </div>
                    <span class="leaderboard-badge">\u{1F949}</span>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">#4</span>
                    <div class="leaderboard-avatar">D</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">David Tasker</div>
                        <div class="leaderboard-earned">$6.20 earned</div>
                    </div>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">#5</span>
                    <div class="leaderboard-avatar">E</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">Eve Newbie</div>
                        <div class="leaderboard-earned">$3.15 earned</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Your Rank</h3>
            </div>
            <div class="your-rank">
                <span class="your-rank-position">#--</span>
                <p class="card__sub">Complete more tasks to appear on the leaderboard!</p>
            </div>
        </div>
    `)}var dt=p(()=>{f()});var ct={};_(ct,{default:()=>lt});async function lt(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
        <h1 class="page-title">Achievements</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Your Badges</h3>
            </div>
            <p class="card__sub">Earn badges by completing milestones</p>

            <div class="achievements-grid">
                <div class="achievement-card achievement-card--unlocked">
                    <div class="achievement-icon">\u{1F3AF}</div>
                    <div class="achievement-name">First Steps</div>
                    <div class="achievement-desc">Complete your first task</div>
                </div>
                <div class="achievement-card achievement-card--unlocked">
                    <div class="achievement-icon">\u{1F4FA}</div>
                    <div class="achievement-name">Ad Watcher</div>
                    <div class="achievement-desc">Watch 10 ads</div>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">\u{1F525}</div>
                    <div class="achievement-name">On Fire</div>
                    <div class="achievement-desc">7-day streak</div>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">\u{1F4B0}</div>
                    <div class="achievement-name">Big Earner</div>
                    <div class="achievement-desc">Earn $10 total</div>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">\u{1F465}</div>
                    <div class="achievement-name">Networker</div>
                    <div class="achievement-desc">Refer 5 friends</div>
                </div>
                <div class="achievement-card">
                    <div class="achievement-icon">\u{1F3C6}</div>
                    <div class="achievement-name">Champion</div>
                    <div class="achievement-desc">Reach #1 on leaderboard</div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Progress</h3>
            </div>
            <div class="achievement-progress">
                <div class="progress-item">
                    <span class="progress-label">Tasks Completed</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 20%"></div>
                    </div>
                    <span class="progress-value">2 / 10</span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">Ads Watched</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 30%"></div>
                    </div>
                    <span class="progress-value">15 / 50</span>
                </div>
                <div class="progress-item">
                    <span class="progress-label">Referrals</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 10%"></div>
                    </div>
                    <span class="progress-value">1 / 10</span>
                </div>
            </div>
        </div>
    `)}var pt=p(()=>{f()});var mt={};_(mt,{default:()=>ut});async function ut(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
        <h1 class="page-title">Support</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Help Center</h3>
            </div>
            <p class="card__sub">Find answers to common questions</p>

            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do I earn money?</span>
                        <i class="bi bi-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>You can earn money by watching ads, completing web tasks, and referring friends. Each activity has its own reward rate.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do withdrawals work?</span>
                        <i class="bi bi-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>You can withdraw your earnings via bKash or Nagad. Minimum withdrawal is $1.00 and you need at least 1 referral.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do referrals work?</span>
                        <i class="bi bi-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Share your referral link with friends. When they earn, you get 50% commission on their earnings!</p>
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">
                        <span>Why was my withdrawal rejected?</span>
                        <i class="bi bi-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Withdrawals may be rejected due to insufficient balance, invalid wallet address, or not meeting the minimum referral requirement.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Contact Us</h3>
            </div>
            <p class="card__sub">Still need help? Reach out to our support team</p>

            <div class="contact-options">
                <a href="mailto:support@jmjob.xyz" class="contact-option">
                    <i class="bi bi-envelope"></i>
                    <span>support@jmjob.xyz</span>
                </a>
                <a href="#" class="contact-option">
                    <i class="bi bi-telegram"></i>
                    <span>Telegram Support</span>
                </a>
            </div>
        </div>
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var ht=p(()=>{f()});var vt={};_(vt,{default:()=>ft});async function ft(){let e=document.querySelector("[data-view]");if(!e)return;let t=h.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings",e.innerHTML=`
        <h1 class="page-title">Settings</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Account</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Name</div>
                        <div class="settings-value">${t?t.name:"Loading\u2026"}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Email</div>
                        <div class="settings-value">${t?t.email:"Loading\u2026"}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Username</div>
                        <div class="settings-value">@${t?t.username:"user"}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Security</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Password</div>
                        <div class="settings-value">Last changed: Never</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Change</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Two-Factor Authentication</div>
                        <div class="settings-value">Not enabled</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Enable</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Notifications</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Email Notifications</div>
                        <div class="settings-value">Receive updates about your account</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Withdrawal Alerts</div>
                        <div class="settings-value">Get notified about withdrawal status</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Danger Zone</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item settings-item--danger">
                    <div class="settings-info">
                        <div class="settings-label">Delete Account</div>
                        <div class="settings-value">Permanently delete your account and data</div>
                    </div>
                    <button class="btn btn--danger btn--sm">Delete</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Log Out</div>
                        <div class="settings-value">Sign out of your account</div>
                    </div>
                    <button class="btn btn--secondary btn--sm" id="logout-btn">Log Out</button>
                </div>
            </div>
        </div>
    `,document.getElementById("logout-btn")?.addEventListener("click",async()=>{await V(),l("Logged out.","info")})}var gt=p(()=>{f()});var bt={};_(bt,{TgTasksPage:()=>ae});function ae(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let r=(await c.tgTasks()).data||[];if(t.innerHTML="",r.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}r.forEach(s=>t.appendChild(ca(s)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function ca(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${te(e.channel_name)}</strong>
                <span class="muted">${te(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${te(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${te(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async r=>{r.preventDefault();let s=a.href;window.open(s,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&pa(e,t)},3e3)})}return t}async function pa(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await T(),ae()()}catch(r){l(r.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function te(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ee=p(()=>{$();f()});var yt={};_(yt,{AdminPage:()=>Ce});function Ce(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=h.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading\u2026</div>
        `;let a=e.querySelectorAll(".admin-tab"),r=e.querySelector("#admin-content");a.forEach(s=>{s.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),s.classList.add("admin-tab--active"),wt(s.dataset.tab,r)})}),wt("stats",r)}}async function wt(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let r=(await c.adminStats()).data;t.innerHTML=`
                <div class="stat-grid">
                    <div class="stat-tile"><span class="muted">Total Users</span><strong>${r.total_users}</strong></div>
                    <div class="stat-tile"><span class="muted">Total Withdrawals</span><strong>${r.total_withdrawals}</strong></div>
                    <div class="stat-tile"><span class="muted">Pending</span><strong>${r.pending_withdrawals}</strong></div>
                    <div class="stat-tile"><span class="muted">Total Ad Views</span><strong>${r.total_ad_views}</strong></div>
                    <div class="stat-tile"><span class="muted">Lifetime Paid</span><strong>$${parseFloat(r.total_lifetime_paid).toFixed(2)}</strong></div>
                </div>
            `}else if(e==="withdrawals"){let r=(await c.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${r.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let s=t.querySelector("#wd-list");r.forEach(i=>s.appendChild(_t(i,s))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);s.innerHTML="",(n.data||[]).forEach(o=>s.appendChild(_t(o,s)))})}else if(e==="users"){let r=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let s=t.querySelector(".admin-list");r.forEach(i=>{let n=document.createElement("div");n.className="admin-row",n.innerHTML=`
                    <div>
                        <strong>${E(i.name)}</strong>
                        <span class="muted">${E(i.email)}</span>
                        ${i.is_admin?'<span class="badge">ADMIN</span>':""}
                    </div>
                    <div>$${parseFloat(i.balance).toFixed(2)} / $${parseFloat(i.lifetime_earned).toFixed(2)}</div>
                `,s.appendChild(n)})}else if(e==="providers"){let r=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let s=t.querySelector(".admin-list");r.forEach(i=>s.appendChild(ua(i,s)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function _t(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${E(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${E(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${E(e.gateway)} \xB7 ${E(e.wallet_address)}</div>
        <div class="admin-row__status">${E(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let r=document.createElement("div");r.className="admin-row__actions";let s=document.createElement("button");s.className="btn btn--success btn--sm",s.textContent="Approve",s.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),r.appendChild(s),r.appendChild(i),a.appendChild(r)}else if(e.status==="approved"){let r=document.createElement("div");r.className="admin-row__actions";let s=document.createElement("button");s.className="btn btn--primary btn--sm",s.textContent="Mark as Paid",s.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),r.appendChild(s),a.appendChild(r)}return a}function ua(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let r=!!e.enabled,s=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${E(e.name)}</strong>
            <span class="muted">${E(e.slug)}</span>
            ${r?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${E(s)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${r?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}function E(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ae=p(()=>{$();f();f()});var xt={};_(xt,{LoginPage:()=>qe});function qe(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} EarnApp</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${ma(t)}</strong></p>`:""}
            <form id="login-form" class="auth-form">
                <label class="auth-form__label">Email
                    <input name="email" type="email" required placeholder="you@example.com">
                </label>
                <label class="auth-form__label">Password
                    <input name="password" type="password" required minlength="6" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
                </label>
                <button type="submit" class="btn btn--primary btn--xl">Log in</button>
            </form>
            <p class="auth-card__alt">No account? <a href="#/register">Sign up</a></p>
            <p class="auth-card__demo">
                Demo accounts:<br>
                <code>alice@example.com</code> / <code>password</code><br>
                <code>admin@example.com</code> / <code>password</code>
            </p>
        </div>
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async r=>{r.preventDefault();let s=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{await Xe(s.get("email"),s.get("password")),l("Welcome back!","success"),g("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function ma(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Me=p(()=>{f()});var St={};_(St,{RegisterPage:()=>He});function He(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
            <div class="auth-card">
                <h1 class="auth-card__title">Create your EarnApp account</h1>
                <p class="auth-card__sub">Start earning in minutes</p>
                ${t?`<p class="auth-card__referral">\u{1F381} You were referred by <strong>${t}</strong></p>`:""}
                <form id="register-form" class="auth-form">
                    <label class="auth-form__label">Full name
                        <input name="name" type="text" required minlength="2" placeholder="Jane Doe">
                    </label>
                    <label class="auth-form__label">Email
                        <input name="email" type="email" required placeholder="you@example.com">
                    </label>
                    <label class="auth-form__label">Password
                        <input name="password" type="password" required minlength="6" placeholder="At least 6 characters">
                    </label>
                    ${t?`<input type="hidden" name="referral_code" value="${t}">`:""}
                    <button type="submit" class="btn btn--primary btn--xl">Create account</button>
                </form>
                <p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>
            </div>
        `;let a=e.querySelector("#register-form");a.addEventListener("submit",async r=>{r.preventDefault();let s=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Creating\u2026";try{let n={name:s.get("name"),email:s.get("email"),password:s.get("password")};t&&(n.referral_code=t),await Ze(n),l("Account created \u2014 welcome!","success"),g("/")}catch(n){let o=n.payload&&n.payload.errors;if(o){let d=Object.values(o)[0];l(Array.isArray(d)?d[0]:d,"error")}else l(n.message||"Registration failed","error");i.disabled=!1,i.textContent="Create account"}})}}var Fe=p(()=>{f();f()});k();f();k();f();var re=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(be(),et))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(X(),we))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(X(),we))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(_e(),at))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(xe(),st))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Te(),nt))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ee(),Le))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(dt(),ot))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pt(),ct))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ht(),mt))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(gt(),vt))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ee(),Le))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ee(),bt))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ae(),yt))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Me(),xt))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Fe(),St))}],os=w(()=>{let e=M.get();return re.find(t=>t.path===e)||re[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";M.set(e)});k();f();k();var ha=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Tt="sidebar_collapsed",U=S(localStorage.getItem(Tt)==="true");function fa(){let e=!U.get();U.set(e),localStorage.setItem(Tt,String(e))}function kt(){return{tag:"aside",props:{class:()=>`sidebar ${U.get()?"sidebar--collapsed":""}`,id:"sidebar"},children:[va(),ga(),ba()]}}function va(){return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"span",props:{},children:["JM"]},{tag:"span",props:{class:()=>(U.get(),"")},children:["JOB"]}]}}function ga(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>fa(),title:()=>U.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${U.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function ba(){return{tag:"nav",props:{class:"sidebar__nav"},children:ha.map(e=>wa(e))}}function wa({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${M.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>U.get()?t:"",onclick:s=>{s.preventDefault(),g(e),Et()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function $t(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Et()},children:[]}}function Lt(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.add("sidebar--open"),t&&t.classList.add("sidebar-overlay--active")}function Et(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}f();k();k();var Ct="jmjob_theme";function _a(){let e=localStorage.getItem(Ct);return e==="dark"||e==="light"?e:"system"}function ya(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}var R=S(_a());function Ne(e){let t=ya(e);document.documentElement.setAttribute("data-theme",t)}Ne(R.get());w(()=>{let e=R.get();Ne(e),localStorage.setItem(Ct,e)});window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{R.get()==="system"&&Ne("system")});function Pe(){let e=R.get();R.set(e==="dark"?"light":"dark")}function At(){return N(()=>L.get(),()=>Sa(),()=>xa())}function qt(){return N(()=>R.get()==="dark",()=>({tag:"button",props:{class:"topbar__icon-btn",title:"Switch to light mode",onclick:()=>Pe()},children:[{tag:"i",props:{class:"bi bi-sun"},children:[]}]}),()=>({tag:"button",props:{class:"topbar__icon-btn",title:"Switch to dark mode",onclick:()=>Pe()},children:[{tag:"i",props:{class:"bi bi-moon"},children:[]}]}))}function xa(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[qt(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Sa(){let e=h.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>Lt(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]}]},{tag:"div",props:{class:"topbar__right"},children:[qt(),{tag:"button",props:{class:"topbar__notifications","aria-label":"Notifications"},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge"},children:["3"]}]},{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[e?e.name:"Loading\u2026"]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await V(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}f();k();function Mt(){return N(()=>!!j.get(),()=>{let e=j.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}function Ft(){return{tag:"div",props:{class:"app-shell"},children:[N(()=>L.get(),()=>kt(),()=>null),N(()=>L.get(),()=>$t(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[At(),{tag:"main",props:{class:"app-main"},children:[Ta()]}]},Mt()]}}function Ta(){let e=M.get(),t=re.find(a=>a.path===e);return t?t.requireAuth&&!L.get()?(g("/login"),Ht()):t.requireAdmin&&(!h.get()||!h.get().is_admin)?La():!t.requireAuth&&L.get()&&["/login","/register"].includes(e)?(g("/"),Ht()):ka(t):$a()}function ka(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function $a(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>g("/")},children:["Go home"]}]}}function La(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>g("/")},children:["Go home"]}]}}function Ht(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}k();f();be();Me();Fe();xe();X();_e();Ee();Te();ee();Ae();var Nt={"/":Y,"/refer":ye,"/webtask":K,"/earn":Z,"/tg-tasks":ae,"/withdraw":Q,"/profile":$e,"/admin":Ce,"/login":qe,"/register":He};function Pt(){se(),setTimeout(se,50),window.addEventListener("hashchange",se),w(()=>{L.get(),setTimeout(se,0)})}async function se(){let e=window.location.hash.replace(/^#/,"")||"/";Nt[e]||(e="/");let t=L.get(),a=["/login","/register"];if(a.includes(e)&&t){g("/");return}if(!a.includes(e)&&!t){g("/login");return}let r=document.getElementById("app"),s=r.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let n=r.querySelector(".bottomnav");n?r.insertBefore(s,n):r.appendChild(s)}s.innerHTML=`<div data-view="${e}" class="view-skeleton"><div class="spinner"></div></div>`;let i=Nt[e];try{let n=i();typeof n=="function"?await n():n&&typeof n.then=="function"&&await n}catch(n){console.error("View render threw synchronously for",e,n),s.innerHTML=`<div class="card"><h2>Error</h2><p>${n.message}</p></div>`}}f();var Ut=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();Ut.innerHTML="";A(Ft(),Ut);q.get()&&T();Pt();
