var Mt=Object.defineProperty;var p=(e,t)=>()=>(e&&(t=e(e=0)),t);var w=(e,t)=>{for(var a in t)Mt(e,a,{get:t[a],enumerable:!0})};function Ht(e,t){Ne?Ne(e,t):console.error("[Ghost] Unhandled effect error:",e)}function M(e){let t=e,a=new Set;return{get(){return x&&(a.add(x),x.dependencies.add(a)),t},set(r){t!==r&&(t=r,Pe(a))}}}function Pe(e){ne(()=>{e.forEach(t=>{t.notify?t.notify():I.add(t)})})}function ne(e){re++;try{e()}finally{if(re--,re===0){let t=Array.from(I);I.clear(),t.forEach(a=>a.run())}}}function y(e){let t={dependencies:new Set,run(){se(t),O.push(x),x=t;try{e()}catch(a){Ht(a,e)}finally{x=O.pop()}},notify(){I.add(t)}};return t.run(),()=>se(t)}function ie(e){let t,a=!0,r=new Set,s={dependencies:new Set,notify(){a||(a=!0,Pe(r))}};return{get(){if(x&&(r.add(x),x.dependencies.add(r)),a){se(s),O.push(x),x=s;try{t=e()}finally{x=O.pop()}a=!1}return t}}}function se(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var x,O,I,re,Ne,H=p(()=>{x=null,O=[],I=new Set,re=0,Ne=null});function U(){oe.totalUpdates++,oe.recentUpdates++}var j,oe,de=p(()=>{j=new Set,oe={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function L(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){Ft(e,t);return}if(e.__ghostWhen){Nt(e,t);return}if(e.__ghostLazy){Pt(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;j.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([r,s])=>{if(r==="ghostStyle"&&s?.mount){s.mount(a);return}let i=r.startsWith("on");typeof s=="function"&&!i?e.effects.push(y(()=>{a.setAttribute(r,s()),U(),e.events.update?.forEach(n=>n())})):i?a[r.toLowerCase()]=s:a.setAttribute(r,s)}),e.children.forEach(r=>{if(r!=null)if(r.__ghostList||r.__ghostWhen||r.__ghostLazy)L(r,a);else if(typeof r=="string"||typeof r=="number")a.appendChild(document.createTextNode(String(r)));else if(typeof r=="function"){let s=null;e.effects.push(y(()=>{let i=r(),n=document.createTextNode(String(i??""));s?a.replaceChild(n,s):a.appendChild(n),s=n,U(),e.events.update?.forEach(o=>o())}))}else L(r,a)}),t.appendChild(a),e.events.mount?.forEach(r=>r())}function R(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),j.delete(e)}}function Ft(e,t){let{getItems:a,keyFn:r,renderFn:s}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function d(m){return m.el||null}let v=y(()=>{let m=a(),k=m.map((b,q)=>String(r(b,q))),qt=Array.from(o.keys());for(let b of qt)if(!k.includes(b)){let q=o.get(b);R(q.ghostNode),o.delete(b)}for(let b=0;b<m.length;b++){let q=k[b];if(!o.has(q)){let P=s(m[b],b),N=document.createElement("ghost-list-slot");for(L(P,N);N.firstChild;)t.insertBefore(N.firstChild,n);o.set(q,{ghostNode:P})}}for(let b=k.length-1;b>=0;b--){let q=k[b],P=o.get(q);if(!P)continue;let N=d(P.ghostNode);if(!N)continue;let He=k[b+1],Fe=(He?d(o.get(He)?.ghostNode):null)||n;N.nextSibling!==Fe&&t.insertBefore(N,Fe)}U()});e._listCleanup=()=>{v();for(let m of o.values())R(m.ghostNode);o.clear(),i.remove(),n.remove()}}function D(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function Nt(e,t){let{conditionGetter:a,trueFn:r,falseFn:s}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=y(()=>{let v=a()?r:s;if(n&&(R(n),n=null),v&&(n=v(),n)){let m=document.createElement("ghost-when-slot");for(L(n,m);m.firstChild;)t.insertBefore(m.firstChild,i)}U()});e._whenCleanup=()=>{o(),n&&R(n),i.remove()}}function Pt(e,t){let{importFn:a,fallback:r}=e,s=document.createComment("[ghost-lazy]");t.appendChild(s);let i=null;if(r){let n=document.createElement("ghost-lazy-slot");for(L(r,n);n.firstChild;)t.insertBefore(n.firstChild,s);i=r}a().then(n=>{let o=n.default||n;i&&(R(i),i=null);let d=typeof o=="function"?o():o,v=document.createElement("ghost-lazy-slot");for(L(d,v);v.firstChild;)t.insertBefore(v.firstChild,s);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var le=p(()=>{H();de()});var Ue=p(()=>{H()});var B=p(()=>{});var Re=p(()=>{de()});var We=p(()=>{H()});var Oe=p(()=>{le();H();B();B()});function Rt(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function r(s){let i={};if(s.nodeType===3)return s.nodeValue.trim();if(s.attributes?.length){i["@attributes"]={};for(let n of s.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of s.childNodes){let o=n.nodeName,d=r(n);d!==""&&(i[o]===void 0?i[o]=d:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(d)))}return i}return r(a.documentElement)}function Wt(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function pe(e,t={}){let{cache:a=!1,...r}=t,s=(r.method||"GET").toUpperCase(),i={url:e,...r};for(let k of pe.interceptors.request)i=k(i)??i;let n=i.url;delete i.url;let o=Wt(n,s);if(a==="memory"&&s==="GET"&&ce.has(o))return ce.get(o);let d=await fetch(n,i),v=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let m;v.includes("application/xml")||v.includes("text/xml")?m=Rt(await d.text()):v.includes("application/json")?m=await d.json():m=await d.text();for(let k of pe.interceptors.response)m=k(d,m)??m;return a==="memory"&&s==="GET"&&ce.set(o,m),m}var ce,Ie=p(()=>{ce=new Map;pe.interceptors={request:[],response:[]}});function ue(e,t){let a;try{let s=localStorage.getItem(e);a=s?JSON.parse(s):t}catch{a=t}let r=M(a);return y(()=>{try{localStorage.setItem(e,JSON.stringify(r.get()))}catch(s){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,s)}}),r}var je=p(()=>{H()});function Ot(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(r=>r(a))},clear(t){t?e.delete(t):e.clear()}}}var ja,De=p(()=>{ja=Ot()});var Ga,It,Be=p(()=>{H();Ga=M("en"),It=new Map;It.set("en",{})});var C=p(()=>{H();le();Ue();B();Re();We();Oe();Ie();je();De();Be()});function Ge(e){me=e}function ze(e){he=e}async function u(e,{method:t="GET",body:a,headers:r={},signal:s}={}){let i=e.startsWith("http")?e:jt.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...r}};me&&(n.headers.Authorization=`Bearer ${me}`),a!==void 0&&(n.body=JSON.stringify(a)),s&&(n.signal=s);let o=await fetch(i,n);if(o.status===401)throw he&&he(),new G("Unauthorized",401,null);let d=null,v=o.headers.get("content-type")||"";try{if(v.includes("application/json"))d=await o.json();else{let m=await o.text();d=m?{message:m}:null}}catch{}if(!o.ok){let m=d&&d.message||`HTTP ${o.status}`;throw new G(m,o.status,d)}return d}var jt,me,he,G,c,T=p(()=>{jt=window.EARNAPP_CONFIG||{apiBase:"/api"},me=null,he=null;G=class extends Error{constructor(t,a,r){super(t),this.status=a,this.payload=r}},c={health:()=>u("/health"),register:e=>u("/auth/register",{method:"POST",body:e}),login:e=>u("/auth/login",{method:"POST",body:e}),logout:()=>u("/auth/logout",{method:"POST"}),me:()=>u("/auth/me"),meUser:()=>u("/user"),reward:e=>u("/user/reward",{method:"POST",body:e}),withdraw:e=>u("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>u("/user/withdrawals"),referrals:()=>u("/user/referrals"),adHistory:()=>u("/user/ads"),adsConfig:()=>u("/ads/config"),adsNext:()=>u("/ads/next"),webTasks:()=>u("/tasks/web"),webTaskStart:e=>u("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>u("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>u("/tasks/telegram"),tgTaskVerify:e=>u("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>u("/admin/stats"),adminWithdrawals:(e="pending")=>u(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>u(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>u(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>u(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>u("/admin/users"),adminProviders:()=>u("/admin/ad-providers"),adminUpdateProvider:(e,t)=>u(`/admin/ad-providers/${e}`,{method:"POST",body:t})}});function l(e,t="info",a=3500){W.set({message:e,type:t,id:Date.now()}),fe&&clearTimeout(fe),fe=setTimeout(()=>W.set(null),a)}async function S(){if(!E.get())return null;try{let e=await c.me();return h.set(e.data),e.data}catch{return null}}async function Je(e,t){let a=await c.login({email:e,password:t});return E.set(a.data.token),h.set(a.data.user),a.data.user}async function Ve(e){let t=await c.register(e);return E.set(t.data.token),h.set(t.data.user),t.data.user}async function z(){try{await c.logout()}catch{}E.set(null),h.set(null),A.set("/login")}function g(e){window.location.hash=e}var Dt,Bt,E,h,W,fe,A,F,f=p(()=>{C();C();T();Dt="earnap_token",Bt="earnap_user",E=ue(Dt,null),h=ue(Bt,null),W=M(null),fe=null;A=M(window.location.hash.replace(/^#/,"")||"/"),F=ie(()=>!!E.get()&&!!h.get());y(()=>{let e=E.get();Ge(e)});ze(()=>{E.set(null),h.set(null),A.set("/login"),l("Session expired. Please log in.","error")})});var Ke={};w(Ke,{HomePage:()=>J});function J(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=h.get(),a=_("div","welcome-popup","");a.innerHTML=`
            <strong>Welcome to EarnApp.</strong>
            <span>If you don't receive payment within 5 minutes, please contact support.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,a.querySelector("button").addEventListener("click",()=>a.remove()),e.appendChild(a),e.appendChild(Gt(t)),e.appendChild(zt(t)),e.appendChild(await Jt(t)),e.appendChild(await Vt())}}function _(e,t,a){let r=document.createElement(e);return t&&(r.className=t),a!==void 0&&(r.textContent=a),r}function Gt(e){let t=_("div","card card--user-header"),a=_("div","user-header__left"),r=_("img","avatar avatar--lg");r.src=e?e.avatar_url:"https://placehold.co/60x60/e8e8e8/a9a9a9?text=U",r.alt="avatar",a.appendChild(r);let s=_("div","user-header__info");s.innerHTML=`
        <div class="user-header__name">${e?Ye(e.name):"Loading\u2026"}</div>
        <div class="user-header__username">@${e?Ye(e.username):"user"}</div>
    `,a.appendChild(s),t.appendChild(a);let i=_("div","user-header__right");return i.innerHTML=`
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
    `,t.appendChild(i),t}function zt(e){let t=_("div","card card--daily-mission");t.innerHTML=`
        <h3 class="card__title">Daily Mission</h3>
        <p class="card__sub">Target: 50 | Completed: ${e?e.today_ads:0} | High Reward</p>
    `;let a=_("button","btn btn--secondary","Claim Daily Bonus");return a.disabled=!0,a.addEventListener("click",()=>l("Daily bonus already claimed today.","info")),t.appendChild(a),t}async function Jt(e){let t=_("div","card card--ad-reward"),a=e?e.ads_remaining:0;t.innerHTML=`
        <h3 class="card__title">Ads Reward Center</h3>
        <p class="card__sub">Wait Time: 12 Sec | Daily Limit: 50 Ads</p>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${e?e.today_ads/e.ads_limit*100:0}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${e?e.today_ads:0} / ${e?e.ads_limit:50}</p>
    `;let r=_("button","btn btn--primary btn--xl","Watch Ad & Earn");return a<=0&&(r.disabled=!0,r.textContent="All Tasks Completed"),r.addEventListener("click",()=>Yt()),t.appendChild(r),t}async function Vt(){let e=_("div","card card--webtask");e.innerHTML=`
        <h3 class="card__title">Web Task Center</h3>
        <p class="card__sub">Loading\u2026</p>
    `;try{let a=(await c.webTasks()).data||[],r=a.filter(n=>n.can_claim).length,s=a.filter(n=>!n.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${r} | Completed: ${s} | Total: ${a.length}`;let i=_("a","btn btn--ghost","View all tasks \u2192");i.href="#/webtask",i.addEventListener("click",n=>{n.preventDefault(),g("/webtask")}),e.appendChild(i)}catch{e.querySelector(".card__sub").textContent="Failed to load."}return e}function Yt(){let e=_("div","modal modal--ad");e.innerHTML=`
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
        `;let s=12,i=t.querySelector("#cd"),n=setInterval(()=>{s--,i.textContent=s,s<=0&&(clearInterval(n),Kt(e,"simulated",r))},1e3)},200)}async function Kt(e,t,a){try{let r=await c.reward({provider:t,started_at:a});l("+"+parseFloat(r.data.reward).toFixed(4)+" credited!","success"),e.remove(),await S(),J()()}catch(r){l(r.message||"Reward failed","error"),e.remove()}}function Ye(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var ve=p(()=>{f();T()});var ge={};w(ge,{WebTaskPage:()=>V});function V(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let r=(await c.webTasks()).data||[];if(r.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",r.forEach(s=>t.appendChild(Xt(s)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Xt(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Xe(e.title)}</h3>
        <p class="card__sub">${Xe(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>Zt(e,a,t)),t}async function Zt(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let r=0,s=e.duration_seconds;t.textContent=`Wait ${s}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{r+=1;let d=s-r;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",r>=s&&(clearInterval(o),Qt(t,n,a))},1e3)}function Qt(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let r=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(r.data.reward).toFixed(2)+" credited!","success"),await S(),V()()}catch(r){l(r.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Xe(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Y=p(()=>{T();f()});var Ze={};w(Ze,{EarnPage:()=>K});function K(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=h.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let r=e.querySelector("#watch-btn");r.disabled||r.addEventListener("click",()=>ea())}}function ea(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=r.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,s.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await ta(e,"simulated",t))},1e3)},300)}async function ta(e,t,a){try{let r=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(r.data.reward).toFixed(4)} credited!`,"success"),await S(),e.remove(),K()()}catch(r){l(r.message||"Reward failed","error"),e.remove()}}var be=p(()=>{T();f()});var et={};w(et,{ReferPage:()=>we});function we(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=h.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let r=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
                        <div class="refer-item__name">${Qe(d.name)}</div>
                        <div class="refer-item__username">@${Qe(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(v)})}}function Qe(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ye=p(()=>{T();f()});var tt={};w(tt,{WithdrawPage:()=>X});function X(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=h.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async s=>{s.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await S(),X()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let v=Object.values(d)[0];l(Array.isArray(v)?v[0]:v,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let r=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?r.innerHTML='<p class="muted">No withdrawals yet.</p>':(r.innerHTML="",i.forEach(n=>r.appendChild(aa(n))))}catch{r.innerHTML='<p class="muted">Failed to load history.</p>'}}}function aa(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),r=e.admin_note?`<div class="withdraw-row__note">"${_e(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${_e(e.gateway)} \xB7 ${_e(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${r}
    `,t}function _e(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var xe=p(()=>{T();f()});var $e={};w($e,{ProfilePage:()=>Te});function Te(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=h.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?Se(t.name):""}</h2>
                <p class="card__sub">@${t?Se(t.username):""}</p>
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
                        <span class="ad-history__provider">${Se(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Se(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Z=p(()=>{T();f()});var rt={};w(rt,{default:()=>at});async function at(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var st=p(()=>{f()});var it={};w(it,{default:()=>nt});async function nt(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var ot=p(()=>{f()});var lt={};w(lt,{default:()=>dt});async function dt(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var ct=p(()=>{f()});var ut={};w(ut,{default:()=>pt});async function pt(){let e=document.querySelector("[data-view]");if(!e)return;let t=h.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings",e.innerHTML=`
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
    `,document.getElementById("logout-btn")?.addEventListener("click",async()=>{await z(),l("Logged out.","info")})}var mt=p(()=>{f()});var ht={};w(ht,{TgTasksPage:()=>ee});function ee(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let r=(await c.tgTasks()).data||[];if(t.innerHTML="",r.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}r.forEach(s=>t.appendChild(ra(s)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function ra(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${Q(e.channel_name)}</strong>
                <span class="muted">${Q(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${Q(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${Q(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async r=>{r.preventDefault();let s=a.href;window.open(s,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&sa(e,t)},3e3)})}return t}async function sa(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await S(),ee()()}catch(r){l(r.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Q(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ke=p(()=>{T();f()});var gt={};w(gt,{AdminPage:()=>Le});function Le(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=h.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading\u2026</div>
        `;let a=e.querySelectorAll(".admin-tab"),r=e.querySelector("#admin-content");a.forEach(s=>{s.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),s.classList.add("admin-tab--active"),ft(s.dataset.tab,r)})}),ft("stats",r)}}async function ft(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let r=(await c.adminStats()).data;t.innerHTML=`
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
            `;let s=t.querySelector("#wd-list");r.forEach(i=>s.appendChild(vt(i,s))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);s.innerHTML="",(n.data||[]).forEach(o=>s.appendChild(vt(o,s)))})}else if(e==="users"){let r=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let s=t.querySelector(".admin-list");r.forEach(i=>{let n=document.createElement("div");n.className="admin-row",n.innerHTML=`
                    <div>
                        <strong>${$(i.name)}</strong>
                        <span class="muted">${$(i.email)}</span>
                        ${i.is_admin?'<span class="badge">ADMIN</span>':""}
                    </div>
                    <div>$${parseFloat(i.balance).toFixed(2)} / $${parseFloat(i.lifetime_earned).toFixed(2)}</div>
                `,s.appendChild(n)})}else if(e==="providers"){let r=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let s=t.querySelector(".admin-list");r.forEach(i=>s.appendChild(na(i,s)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function vt(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${$(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${$(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${$(e.gateway)} \xB7 ${$(e.wallet_address)}</div>
        <div class="admin-row__status">${$(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let r=document.createElement("div");r.className="admin-row__actions";let s=document.createElement("button");s.className="btn btn--success btn--sm",s.textContent="Approve",s.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),r.appendChild(s),r.appendChild(i),a.appendChild(r)}else if(e.status==="approved"){let r=document.createElement("div");r.className="admin-row__actions";let s=document.createElement("button");s.className="btn btn--primary btn--sm",s.textContent="Mark as Paid",s.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),r.appendChild(s),a.appendChild(r)}return a}function na(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let r=!!e.enabled,s=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${$(e.name)}</strong>
            <span class="muted">${$(e.slug)}</span>
            ${r?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${$(s)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${r?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}function $(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ce=p(()=>{T();f();f()});var bt={};w(bt,{LoginPage:()=>Ee});function Ee(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} EarnApp</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${ia(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async r=>{r.preventDefault();let s=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{await Je(s.get("email"),s.get("password")),l("Welcome back!","success"),g("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function ia(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ae=p(()=>{f()});var wt={};w(wt,{RegisterPage:()=>qe});function qe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
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
        `;let a=e.querySelector("#register-form");a.addEventListener("submit",async r=>{r.preventDefault();let s=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Creating\u2026";try{let n={name:s.get("name"),email:s.get("email"),password:s.get("password")};t&&(n.referral_code=t),await Ve(n),l("Account created \u2014 welcome!","success"),g("/")}catch(n){let o=n.payload&&n.payload.errors;if(o){let d=Object.values(o)[0];l(Array.isArray(d)?d[0]:d,"error")}else l(n.message||"Registration failed","error");i.disabled=!1,i.textContent="Create account"}})}}var Me=p(()=>{f();f()});C();f();C();f();var te=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ve(),Ke))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Y(),ge))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Y(),ge))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(be(),Ze))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),et))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(xe(),tt))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Z(),$e))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(st(),rt))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ot(),it))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ct(),lt))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(mt(),ut))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Z(),$e))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ke(),ht))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ce(),gt))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ae(),bt))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Me(),wt))}],Kr=y(()=>{let e=A.get();return te.find(t=>t.path===e)||te[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";A.set(e)});C();f();var oa=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}];function yt(){return{tag:"aside",props:{class:"sidebar",id:"sidebar"},children:[da(),la()]}}function da(){return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"span",props:{},children:["JM"]},{tag:"span",props:{},children:["JOB"]}]}}function la(){return{tag:"nav",props:{class:"sidebar__nav"},children:oa.map(e=>ca(e))}}function ca({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${A.get()===e?" sidebar__item--active":""}`,href:`#${e}`,onclick:s=>{s.preventDefault(),g(e),St()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function _t(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>St()},children:[]}}function xt(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.add("sidebar--open"),t&&t.classList.add("sidebar-overlay--active")}function St(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}f();C();function Tt(){return D(()=>F.get(),()=>ua(),()=>pa())}function pa(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function ua(){let e=h.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>xt(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]}]},{tag:"div",props:{class:"topbar__right"},children:[{tag:"button",props:{class:"topbar__notifications","aria-label":"Notifications"},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge"},children:["3"]}]},{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[e?e.name:"Loading\u2026"]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await z(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}f();C();function $t(){return D(()=>!!W.get(),()=>{let e=W.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}function Lt(){return{tag:"div",props:{class:"app-shell"},children:[yt(),_t(),{tag:"div",props:{class:"main-wrapper"},children:[Tt(),{tag:"main",props:{class:"app-main"},children:[ma()]}]},$t()]}}function ma(){let e=A.get(),t=te.find(a=>a.path===e);return t?t.requireAuth&&!F.get()?(g("/login"),kt()):t.requireAdmin&&(!h.get()||!h.get().is_admin)?va():!t.requireAuth&&F.get()&&["/login","/register"].includes(e)?(g("/"),kt()):ha(t):fa()}function ha(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function fa(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>g("/")},children:["Go home"]}]}}function va(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>g("/")},children:["Go home"]}]}}function kt(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}C();f();ve();Ae();Me();ye();Y();be();ke();xe();Z();Ce();var Ct={"/":J,"/refer":we,"/webtask":V,"/earn":K,"/tg-tasks":ee,"/withdraw":X,"/profile":Te,"/admin":Le,"/login":Ee,"/register":qe};function Et(){ae(),setTimeout(ae,50),window.addEventListener("hashchange",ae),y(()=>{F.get(),setTimeout(ae,0)})}async function ae(){let e=window.location.hash.replace(/^#/,"")||"/";Ct[e]||(e="/");let t=F.get(),a=["/login","/register"];if(a.includes(e)&&t){g("/");return}if(!a.includes(e)&&!t){g("/login");return}let r=document.getElementById("app"),s=r.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let n=r.querySelector(".bottomnav");n?r.insertBefore(s,n):r.appendChild(s)}s.innerHTML=`<div data-view="${e}" class="view-skeleton"><div class="spinner"></div></div>`;let i=Ct[e];try{let n=i();typeof n=="function"?await n():n&&typeof n.then=="function"&&await n}catch(n){console.error("View render threw synchronously for",e,n),s.innerHTML=`<div class="card"><h2>Error</h2><p>${n.message}</p></div>`}}f();var At=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();At.innerHTML="";L(Lt(),At);E.get()&&S();Et();
