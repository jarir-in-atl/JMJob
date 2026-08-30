var ut=Object.defineProperty;var u=(e,t)=>()=>(e&&(t=e(e=0)),t);var S=(e,t)=>{for(var r in t)ut(e,r,{get:t[r],enumerable:!0})};function mt(e,t){Ae?Ae(e,t):console.error("[Ghost] Unhandled effect error:",e)}function M(e){let t=e,r=new Set;return{get(){return y&&(r.add(y),y.dependencies.add(r)),t},set(a){t!==a&&(t=a,qe(r))}}}function qe(e){Y(()=>{e.forEach(t=>{t.notify?t.notify():D.add(t)})})}function Y(e){K++;try{e()}finally{if(K--,K===0){let t=Array.from(D);D.clear(),t.forEach(r=>r.run())}}}function _(e){let t={dependencies:new Set,run(){X(t),I.push(y),y=t;try{e()}catch(r){mt(r,e)}finally{y=I.pop()}},notify(){D.add(t)}};return t.run(),()=>X(t)}function Q(e){let t,r=!0,a=new Set,n={dependencies:new Set,notify(){r||(r=!0,qe(a))}};return{get(){if(y&&(a.add(y),y.dependencies.add(a)),r){X(n),I.push(y),y=n;try{t=e()}finally{y=I.pop()}r=!1}return t}}}function X(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var y,I,D,K,Ae,H=u(()=>{y=null,I=[],D=new Set,K=0,Ae=null});function W(){P.totalUpdates++,P.recentUpdates++}var O,P,Z=u(()=>{O=new Set,P={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function L(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){ft(e,t);return}if(e.__ghostWhen){ht(e,t);return}if(e.__ghostLazy){gt(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;O.add(e);let r=document.createElement(e.tag);e.el=r,Object.entries(e.props).forEach(([a,n])=>{if(a==="ghostStyle"&&n?.mount){n.mount(r);return}let s=a.startsWith("on");typeof n=="function"&&!s?e.effects.push(_(()=>{r.setAttribute(a,n()),W(),e.events.update?.forEach(o=>o())})):s?r[a.toLowerCase()]=n:r.setAttribute(a,n)}),e.children.forEach(a=>{if(a!=null)if(a.__ghostList||a.__ghostWhen||a.__ghostLazy)L(a,r);else if(typeof a=="string"||typeof a=="number")r.appendChild(document.createTextNode(String(a)));else if(typeof a=="function"){let n=null;e.effects.push(_(()=>{let s=a(),o=document.createTextNode(String(s??""));n?r.replaceChild(o,n):r.appendChild(o),n=o,W(),e.events.update?.forEach(i=>i())}))}else L(a,r)}),t.appendChild(r),e.events.mount?.forEach(a=>a())}function j(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),O.delete(e)}}function ft(e,t){let{getItems:r,keyFn:a,renderFn:n}=e,s=document.createComment("[ghost-list]"),o=document.createComment("[/ghost-list]");t.appendChild(s),t.appendChild(o);let i=new Map;function l(g){return g.el||null}let f=_(()=>{let g=r(),C=g.map((v,F)=>String(a(v,F))),pt=Array.from(i.keys());for(let v of pt)if(!C.includes(v)){let F=i.get(v);j(F.ghostNode),i.delete(v)}for(let v=0;v<g.length;v++){let F=C[v];if(!i.has(F)){let R=n(g[v],v),N=document.createElement("ghost-list-slot");for(L(R,N);N.firstChild;)t.insertBefore(N.firstChild,o);i.set(F,{ghostNode:R})}}for(let v=C.length-1;v>=0;v--){let F=C[v],R=i.get(F);if(!R)continue;let N=l(R.ghostNode);if(!N)continue;let Le=C[v+1],Ee=(Le?l(i.get(Le)?.ghostNode):null)||o;N.nextSibling!==Ee&&t.insertBefore(N,Ee)}W()});e._listCleanup=()=>{f();for(let g of i.values())j(g.ghostNode);i.clear(),s.remove(),o.remove()}}function ht(e,t){let{conditionGetter:r,trueFn:a,falseFn:n}=e,s=document.createComment("[ghost-when]");t.appendChild(s);let o=null,i=_(()=>{let f=r()?a:n;if(o&&(j(o),o=null),f&&(o=f(),o)){let g=document.createElement("ghost-when-slot");for(L(o,g);g.firstChild;)t.insertBefore(g.firstChild,s)}W()});e._whenCleanup=()=>{i(),o&&j(o),s.remove()}}function gt(e,t){let{importFn:r,fallback:a}=e,n=document.createComment("[ghost-lazy]");t.appendChild(n);let s=null;if(a){let o=document.createElement("ghost-lazy-slot");for(L(a,o);o.firstChild;)t.insertBefore(o.firstChild,n);s=a}r().then(o=>{let i=o.default||o;s&&(j(s),s=null);let l=typeof i=="function"?i():i,f=document.createElement("ghost-lazy-slot");for(L(l,f);f.firstChild;)t.insertBefore(f.firstChild,n);s=l}).catch(o=>{console.error("[Ghost] lazyNode failed to load:",o)})}var ee=u(()=>{H();Z()});var Fe=u(()=>{H()});var B=u(()=>{});function Me(){if(typeof window>"u")return;let e=document.createElement("div");e.id="ghost-devtools-hud",e.style=`
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(10, 20, 10, 0.9);
        color: #00ff00;
        padding: 10px 15px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 11px;
        z-index: 9999;
        pointer-events: none;
        border: 1px solid #004400;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        min-width: 180px;
    `,document.body.appendChild(e),setInterval(()=>{P.recentUpdates=0},1e3);function t(){let r=((Date.now()-P.startTime)/1e3).toFixed(1);e.innerHTML=`
            <div style="font-weight: bold; border-bottom: 1px solid #004400; margin-bottom: 5px; padding-bottom: 3px; color: #fff;">GHOST.JS INSPECTOR</div>
            <div style="display: flex; justify-content: space-between;"><span>Nodes:</span> <span>${O.size}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Total Upd:</span> <span>${P.totalUpdates}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Uptime:</span> <span>${r}s</span></div>
            <div style="margin-top: 5px; color: #888;">Mode: DETERMINISTIC</div>
        `,requestAnimationFrame(t)}t()}var He=u(()=>{Z()});var Ne=u(()=>{H()});var Pe=u(()=>{ee();H();B();B()});function wt(e){if(typeof window>"u"||!window.DOMParser)return{};let r=new DOMParser().parseFromString(e,"text/xml");function a(n){let s={};if(n.nodeType===3)return n.nodeValue.trim();if(n.attributes?.length){s["@attributes"]={};for(let o of n.attributes)s["@attributes"][o.nodeName]=o.nodeValue}for(let o of n.childNodes){let i=o.nodeName,l=a(o);l!==""&&(s[i]===void 0?s[i]=l:(Array.isArray(s[i])||(s[i]=[s[i]]),s[i].push(l)))}return s}return a(r.documentElement)}function bt(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function U(e,t={}){let{cache:r=!1,...a}=t,n=(a.method||"GET").toUpperCase(),s={url:e,...a};for(let C of U.interceptors.request)s=C(s)??s;let o=s.url;delete s.url;let i=bt(o,n);if(r==="memory"&&n==="GET"&&te.has(i))return te.get(i);let l=await fetch(o,s),f=l.headers.get("content-type")||"";if(!l.ok)throw new Error(`Ghost-HTTP Error: ${l.status} ${l.statusText}`);let g;f.includes("application/xml")||f.includes("text/xml")?g=wt(await l.text()):f.includes("application/json")?g=await l.json():g=await l.text();for(let C of U.interceptors.response)g=C(l,g)??g;return r==="memory"&&n==="GET"&&te.set(i,g),g}var te,Ue=u(()=>{te=new Map;U.interceptors={request:[],response:[]}});function re(e,t){let r;try{let n=localStorage.getItem(e);r=n?JSON.parse(n):t}catch{r=t}let a=M(r);return _(()=>{try{localStorage.setItem(e,JSON.stringify(a.get()))}catch(n){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,n)}}),a}var Re=u(()=>{H()});function yt(){let e=new Map;return{on(t,r){return e.has(t)||e.set(t,new Set),e.get(t).add(r),()=>e.get(t).delete(r)},emit(t,r){e.has(t)&&e.get(t).forEach(a=>a(r))},clear(t){t?e.delete(t):e.clear()}}}var xr,Oe=u(()=>{xr=yt()});var $r,_t,We=u(()=>{H();$r=M("en"),_t=new Map;_t.set("en",{})});var E=u(()=>{H();ee();Fe();B();He();Ne();Pe();Ue();Re();Oe();We()});function je(e){ae=e,e||delete U.defaults?.headers?.Authorization}function Ie(e){ne=e}async function p(e,{method:t="GET",body:r,headers:a={},signal:n}={}){let s=e.startsWith("http")?e:xt.apiBase+e,o={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...a}};ae&&(o.headers.Authorization=`Bearer ${ae}`),r!==void 0&&(o.body=JSON.stringify(r)),n&&(o.signal=n);let i=await U(s,o);if(i.status===401)throw ne&&ne(),new G("Unauthorized",401,null);let l=null;try{l=await i.json()}catch{}if(!i.ok){let f=l&&l.message||`HTTP ${i.status}`;throw new G(f,i.status,l)}return l}var xt,ae,ne,G,d,$=u(()=>{E();xt=window.EARNAPP_CONFIG||{apiBase:"/api"},ae=null,ne=null;G=class extends Error{constructor(t,r,a){super(t),this.status=r,this.payload=a}},d={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t})}});function c(e,t="info",r=3500){z.set({message:e,type:t,id:Date.now()}),se&&clearTimeout(se),se=setTimeout(()=>z.set(null),r)}async function x(){if(!A.get())return null;try{let e=await d.me();return m.set(e.data),e.data}catch{return null}}async function De(e,t){let r=await d.login({email:e,password:t});return A.set(r.data.token),m.set(r.data.user),r.data.user}async function Be(e){let t=await d.register(e);return A.set(t.data.token),m.set(t.data.user),t.data.user}async function Ge(){try{await d.logout()}catch{}A.set(null),m.set(null),T.set("/login")}function w(e){window.location.hash=e}var Tt,St,A,m,z,se,T,q,h=u(()=>{E();E();$();Tt="earnap_token",St="earnap_user",A=re(Tt,null),m=re(St,null),z=M(null),se=null;T=M(window.location.hash.replace(/^#/,"")||"/"),q=Q(()=>!!A.get()&&!!m.get());_(()=>{let e=A.get();je(e)});Ie(()=>{A.set(null),m.set(null),T.set("/login"),c("Session expired. Please log in.","error")})});var oe={};S(oe,{HomePage:()=>Je});function Je(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=m.get(),r=b("div","welcome-popup","");r.innerHTML=`
            <strong>Welcome to EarnApp.</strong>
            <span>If you don't receive payment within 5 minutes, please contact support.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,r.querySelector("button").addEventListener("click",()=>r.remove()),e.appendChild(r),e.appendChild($t(t)),e.appendChild(kt(t)),e.appendChild(await Ct(t)),e.appendChild(await Lt())}}function b(e,t,r){let a=document.createElement(e);return t&&(a.className=t),r!==void 0&&(a.textContent=r),a}function $t(e){let t=b("div","card card--user-header"),r=b("div","user-header__left"),a=b("img","avatar avatar--lg");a.src=e?e.avatar_url:"https://placehold.co/60x60/e8e8e8/a9a9a9?text=U",a.alt="avatar",r.appendChild(a);let n=b("div","user-header__info");n.innerHTML=`
        <div class="user-header__name">${e?ze(e.name):"Loading\u2026"}</div>
        <div class="user-header__username">@${e?ze(e.username):"user"}</div>
    `,r.appendChild(n),t.appendChild(r);let s=b("div","user-header__right");return s.innerHTML=`
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
    `,t.appendChild(s),t}function kt(e){let t=b("div","card card--daily-mission");t.innerHTML=`
        <h3 class="card__title">Daily Mission</h3>
        <p class="card__sub">Target: 50 | Completed: ${e?e.today_ads:0} | High Reward</p>
    `;let r=b("button","btn btn--secondary","Claim Daily Bonus");return r.disabled=!0,r.addEventListener("click",()=>c("Daily bonus already claimed today.","info")),t.appendChild(r),t}async function Ct(e){let t=b("div","card card--ad-reward"),r=e?e.ads_remaining:0;t.innerHTML=`
        <h3 class="card__title">Ads Reward Center</h3>
        <p class="card__sub">Wait Time: 12 Sec | Daily Limit: 50 Ads</p>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${e?e.today_ads/e.ads_limit*100:0}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${e?e.today_ads:0} / ${e?e.ads_limit:50}</p>
    `;let a=b("button","btn btn--primary btn--xl","Watch Ad & Earn");return r<=0&&(a.disabled=!0,a.textContent="All Tasks Completed"),a.addEventListener("click",()=>Et()),t.appendChild(a),t}async function Lt(){let e=b("div","card card--webtask");e.innerHTML=`
        <h3 class="card__title">Web Task Center</h3>
        <p class="card__sub">Loading\u2026</p>
    `;try{let r=(await d.webTasks()).data||[],a=r.filter(o=>o.can_claim).length,n=r.filter(o=>!o.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${a} | Completed: ${n} | Total: ${r.length}`;let s=b("a","btn btn--ghost","View all tasks \u2192");s.href="#/webtask",s.addEventListener("click",o=>{o.preventDefault(),w("/webtask")}),e.appendChild(s)}catch{e.querySelector(".card__sub").textContent="Failed to load."}return e}function Et(){let e=b("div","modal modal--ad");e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=e.querySelector("#ad-slot"),r=e.querySelector("#ad-countdown"),a=new Date().toISOString();setTimeout(()=>{t.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Simulated Sponsor Ad</h4>
                <p>Thank you for watching \u2014 your reward will be credited in <span id="cd">12</span>s.</p>
            </div>
        `;let n=12,s=t.querySelector("#cd"),o=setInterval(()=>{n--,s.textContent=n,n<=0&&(clearInterval(o),At(e,"simulated",a))},1e3)},200)}async function At(e,t,r){try{let a=await d.reward({provider:t,started_at:r});c("+"+parseFloat(a.data.reward).toFixed(4)+" credited!","success"),e.remove(),await x(),Je()()}catch(a){c(a.message||"Reward failed","error"),e.remove()}}function ze(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var ie=u(()=>{h();$()});var le={};S(le,{ReferPage:()=>qt});function qt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=m.get(),r=null;try{r=(await d.referrals()).data}catch{c("Failed to load referrals","error")}let a=r?r.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
            <div class="card card--refer">
                <h2 class="card__title">Invite & Earn</h2>
                <p class="card__sub">Total Network: <strong>${t?t.referral_count:0}</strong> | Bonus Rate: <strong>50%</strong> | Earned so far: <strong>$${r?parseFloat(r.total_commission).toFixed(4):"0.0000"}</strong></p>
                <div class="refer-link">
                    <input id="refer-link-input" class="refer-link__input" value="${a}" readonly>
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
                ${r&&r.referrals.length===0?'<p class="muted">No referrals yet. Share your link to start earning 50% of their rewards!</p>':""}
            </div>
        `;let n=e.querySelector("#copy-btn"),s=e.querySelector("#refer-link-input");n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s.value),c("Link copied to clipboard!","success")}catch{s.select(),document.execCommand("copy"),c("Link copied!","success")}});let o=e.querySelector("#share-tg");o.href="https://t.me/share/url?url="+encodeURIComponent(a);let i=e.querySelector("#refer-list");r&&r.referrals&&r.referrals.forEach(l=>{let f=document.createElement("div");f.className="refer-item",f.innerHTML=`
                    <img class="avatar" src="${l.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Ve(l.name)}</div>
                        <div class="refer-item__username">@${Ve(l.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(l.lifetime_earned).toFixed(2)}</div>
                `,i.appendChild(f)})}}function Ve(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ce=u(()=>{$();h()});var de={};S(de,{WebTaskPage:()=>Xe});function Xe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let a=(await d.webTasks()).data||[];if(a.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",a.forEach(n=>t.appendChild(Ft(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Ft(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Ke(e.title)}</h3>
        <p class="card__sub">${Ke(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let r=t.querySelector("button");return r&&!r.disabled&&r.addEventListener("click",()=>Mt(e,r,t)),t}async function Mt(e,t,r){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let a=0,n=e.duration_seconds;t.textContent=`Wait ${n}s\u2026`;let o=(await d.webTaskStart({task_id:e.id})).data.completion_id,i=setInterval(()=>{a+=1;let l=n-a;t.textContent=l>0?`Wait ${l}s\u2026`:"Claim Reward",a>=n&&(clearInterval(i),Ht(t,o,r))},1e3)}function Ht(e,t,r){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let a=await d.webTaskClaim({completion_id:t});c("+"+parseFloat(a.data.reward).toFixed(2)+" credited!","success"),await x(),Xe()()}catch(a){c(a.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Ke(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var pe=u(()=>{$();h()});var ue={};S(ue,{EarnPage:()=>Ye});function Ye(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=m.get(),r=t?t.ads_remaining:0;e.innerHTML=`
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
                <button id="watch-btn" class="btn btn--primary btn--xl" ${r<=0?"disabled":""}>
                    ${r<=0?"All Tasks Completed":"Watch Ad & Earn"}
                </button>
            </div>
        `;let a=e.querySelector("#watch-btn");a.disabled||a.addEventListener("click",()=>Nt())}}function Nt(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=new Date().toISOString(),r=12,a=e.querySelector("#ad-slot"),n=e.querySelector("#ad-countdown");setTimeout(()=>{a.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Sponsored Content</h4>
                <p>This is a placeholder for a real ad. <br>Your reward will be credited in <strong><span id="cd-num">12</span>s</strong>.</p>
            </div>
        `;let s=a.querySelector("#cd-num"),o=setInterval(async()=>{r--,s.textContent=r,n.textContent=`Reward in ${r}s\u2026`,r<=0&&(clearInterval(o),await Pt(e,"simulated",t))},1e3)},300)}async function Pt(e,t,r){try{let a=await d.reward({provider:t,started_at:r});c(`+$${parseFloat(a.data.reward).toFixed(4)} credited!`,"success"),await x(),e.remove(),Ye()()}catch(a){c(a.message||"Reward failed","error"),e.remove()}}var me=u(()=>{$();h()});var fe={};S(fe,{TgTasksPage:()=>Qe});function Qe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let a=(await d.tgTasks()).data||[];if(t.innerHTML="",a.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}a.forEach(n=>t.appendChild(Ut(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Ut(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${J(e.channel_name)}</strong>
                <span class="muted">${J(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${J(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${J(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let r=t.querySelector("a.btn");r.addEventListener("click",async a=>{a.preventDefault();let n=r.href;window.open(n,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Rt(e,t)},3e3)})}return t}async function Rt(e,t){let r=t.querySelector(".task-actions");r.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await d.tgTaskVerify({task_id:e.id}),c("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await x(),Qe()()}catch(a){c(a.message||"Verification failed","error"),r.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function J(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var he=u(()=>{$();h()});var ve={};S(ve,{WithdrawPage:()=>Ze});function Ze(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=m.get();e.innerHTML=`
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
        `;let r=e.querySelector("#withdraw-form");r.addEventListener("submit",async n=>{n.preventDefault();let s=new FormData(r),o=r.querySelector("button");o.disabled=!0,o.textContent="Submitting\u2026";try{let i=await d.withdraw({amount:parseFloat(s.get("amount")),wallet_address:String(s.get("wallet_address")),gateway:String(s.get("gateway"))});c("Withdrawal requested!","success"),await x(),Ze()()}catch(i){let l=i.payload&&i.payload.errors;if(l){let f=Object.values(l)[0];c(Array.isArray(f)?f[0]:f,"error")}else c(i.message||"Withdrawal failed","error");o.disabled=!1,o.textContent="Confirm Withdrawal"}});let a=e.querySelector("#withdraw-history");try{let s=(await d.withdrawals()).data||[];s.length===0?a.innerHTML='<p class="muted">No withdrawals yet.</p>':(a.innerHTML="",s.forEach(o=>a.appendChild(Ot(o))))}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Ot(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let r=(e.status||"pending").toUpperCase(),a=e.admin_note?`<div class="withdraw-row__note">"${ge(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${ge(e.gateway)} \xB7 ${ge(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${r}</div>
        ${a}
    `,t}function ge(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var we=u(()=>{$();h()});var ye={};S(ye,{ProfilePage:()=>Wt});function Wt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=m.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?be(t.name):""}</h2>
                <p class="card__sub">@${t?be(t.username):""}</p>
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
        `;let r=e.querySelector("#ad-history");try{let n=(await d.adHistory()).data||[];if(n.length===0)r.innerHTML='<p class="muted">No ad views yet.</p>';else{r.innerHTML='<div class="ad-history__list"></div>';let s=r.querySelector(".ad-history__list");n.forEach(o=>{let i=document.createElement("div");i.className="ad-history__row",i.innerHTML=`
                        <span class="ad-history__provider">${be(o.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(o.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${o.completed_at||o.started_at}</span>
                    `,s.appendChild(i)})}}catch{r.innerHTML='<p class="muted">Failed to load history.</p>'}}}function be(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var _e=u(()=>{$();h()});var xe={};S(xe,{AdminPage:()=>jt});function jt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading\u2026</div>
        `;let r=e.querySelectorAll(".admin-tab"),a=e.querySelector("#admin-content");r.forEach(n=>{n.addEventListener("click",()=>{r.forEach(s=>s.classList.remove("admin-tab--active")),n.classList.add("admin-tab--active"),et(n.dataset.tab,a)})}),et("stats",a)}}async function et(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let a=(await d.adminStats()).data;t.innerHTML=`
                <div class="stat-grid">
                    <div class="stat-tile"><span class="muted">Total Users</span><strong>${a.total_users}</strong></div>
                    <div class="stat-tile"><span class="muted">Total Withdrawals</span><strong>${a.total_withdrawals}</strong></div>
                    <div class="stat-tile"><span class="muted">Pending</span><strong>${a.pending_withdrawals}</strong></div>
                    <div class="stat-tile"><span class="muted">Total Ad Views</span><strong>${a.total_ad_views}</strong></div>
                    <div class="stat-tile"><span class="muted">Lifetime Paid</span><strong>$${parseFloat(a.total_lifetime_paid).toFixed(2)}</strong></div>
                </div>
            `}else if(e==="withdrawals"){let a=(await d.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${a.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let n=t.querySelector("#wd-list");a.forEach(s=>n.appendChild(tt(s,n))),t.querySelector("#wd-filter").addEventListener("change",async s=>{let o=await d.adminWithdrawals(s.target.value);n.innerHTML="",(o.data||[]).forEach(i=>n.appendChild(tt(i,n)))})}else if(e==="users"){let a=(await d.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list");a.forEach(s=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${k(s.name)}</strong>
                        <span class="muted">${k(s.email)}</span>
                        ${s.is_admin?'<span class="badge">ADMIN</span>':""}
                    </div>
                    <div>$${parseFloat(s.balance).toFixed(2)} / $${parseFloat(s.lifetime_earned).toFixed(2)}</div>
                `,n.appendChild(o)})}else if(e==="providers"){let a=(await d.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list");a.forEach(s=>n.appendChild(It(s,n)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function tt(e,t){let r=document.createElement("div");if(r.className="admin-row admin-row--withdrawal",r.innerHTML=`
        <div class="admin-row__main">
            <strong>${k(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${k(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${k(e.gateway)} \xB7 ${k(e.wallet_address)}</div>
        <div class="admin-row__status">${k(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let a=document.createElement("div");a.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--success btn--sm",n.textContent="Approve",n.addEventListener("click",async()=>{try{await d.adminApprove(e.id,{admin_note:"Approved by admin"}),c("Withdrawal approved","success"),r.remove()}catch(o){c(o.message,"error")}});let s=document.createElement("button");s.className="btn btn--danger btn--sm",s.textContent="Reject",s.addEventListener("click",async()=>{let o=prompt("Reason for rejection (optional):","Invalid wallet address");try{await d.adminReject(e.id,{admin_note:o||""}),c("Withdrawal rejected (refunded)","info"),r.remove()}catch(i){c(i.message,"error")}}),a.appendChild(n),a.appendChild(s),r.appendChild(a)}else if(e.status==="approved"){let a=document.createElement("div");a.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--primary btn--sm",n.textContent="Mark as Paid",n.addEventListener("click",async()=>{try{await d.adminPay(e.id,{admin_note:"Paid by admin"}),c("Marked as paid","success"),r.remove()}catch(s){c(s.message,"error")}}),a.appendChild(n),r.appendChild(a)}return r}function It(e,t){let r=document.createElement("div");r.className="admin-row admin-row--provider";let a=!!e.enabled,n=e.block_id||"";return r.innerHTML=`
        <div class="admin-row__main">
            <strong>${k(e.name)}</strong>
            <span class="muted">${k(e.slug)}</span>
            ${a?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${k(n)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${a?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,r.querySelector(".provider-save").addEventListener("click",async()=>{let s={block_id:r.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(r.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(r.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(r.querySelector(".provider-duration").value,10)||12,enabled:r.querySelector(".provider-enabled").checked};try{await d.adminUpdateProvider(e.id,s),c("Provider saved","success")}catch(o){c(o.message,"error")}}),r}function k(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Te=u(()=>{$();h();h()});var Se={};S(Se,{LoginPage:()=>Dt});function Dt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=T.get().startsWith("/login")?new URLSearchParams(window.location.hash.split("?")[1]||""):new URLSearchParams,r=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||t.get("ref")||"";e.innerHTML=`
            <div class="auth-card">
                <h1 class="auth-card__title">\u{1F4B0} EarnApp</h1>
                <p class="auth-card__sub">Log in to your account</p>
                ${r?`<p class="auth-card__referral">Referred by <strong>${r}</strong></p>`:""}
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
        `;let a=e.querySelector("#login-form");a.addEventListener("submit",async n=>{n.preventDefault();let s=new FormData(a),o=a.querySelector("button");o.disabled=!0,o.textContent="Logging in\u2026";try{await De(s.get("email"),s.get("password")),c("Welcome back!","success"),w("/")}catch(i){c(i.message||"Login failed","error"),o.disabled=!1,o.textContent="Log in"}})}}var $e=u(()=>{h();h()});var ke={};S(ke,{RegisterPage:()=>Bt});function Bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
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
        `;let r=e.querySelector("#register-form");r.addEventListener("submit",async a=>{a.preventDefault();let n=new FormData(r),s=r.querySelector("button");s.disabled=!0,s.textContent="Creating\u2026";try{let o={name:n.get("name"),email:n.get("email"),password:n.get("password")};t&&(o.referral_code=t),await Be(o),c("Account created \u2014 welcome!","success"),w("/")}catch(o){let i=o.payload&&o.payload.errors;if(i){let l=Object.values(i)[0];c(Array.isArray(l)?l[0]:l,"error")}else c(o.message||"Registration failed","error");s.disabled=!1,s.textContent="Create account"}})}}var Ce=u(()=>{h();h()});E();E();h();E();h();var V=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ie(),oe))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ce(),le))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pe(),de))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(me(),ue))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(he(),fe))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(we(),ve))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(_e(),ye))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Te(),xe))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>($e(),Se))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ce(),ke))}],Sa=_(()=>{let e=T.get();return V.find(t=>t.path===e)||V[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";T.set(e)});E();h();var Gt=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/webtask",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Earn",icon:"bi-play-circle"},{path:"/refer",label:"Refer",icon:"bi-people"},{path:"/withdraw",label:"Wallet",icon:"bi-wallet2"},{path:"/profile",label:"Profile",icon:"bi-person"}];function rt(){return()=>q.get()?{tag:"nav",props:{class:"bottomnav"},children:Gt.map(e=>zt(e))}:{tag:"div",props:{class:"bottomnav-spacer"},children:[]}}function zt(e){return()=>({tag:"a",props:{class:"bottomnav__item"+(T.get()===e.path?" bottomnav__item--active":""),href:"#"+e.path},children:[{tag:"i",props:{class:"bi "+e.icon+" bottomnav__icon"},children:[]},{tag:"span",props:{class:"bottomnav__label"},children:[e.label]}]})}h();function at(){return()=>{let e=m.get();if(!q.get())return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["\u{1F4B0} EarnApp"]},{tag:"div",props:{class:"topbar__actions"},children:[{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]};let r=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?parseFloat(e.lifetime_earned||0).toFixed(2):"0.00";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["\u{1F4B0} EarnApp"]},{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"strong",props:{},children:[()=>e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-balance"},children:[()=>"$"+r]}]},{tag:"img",props:{class:"topbar__avatar",src:()=>e?e.avatar_url:"https://placehold.co/40x40/e8e8e8/a9a9a9?text=U",alt:"avatar"},children:[]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await Ge(),c("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}}h();function nt(){return()=>{let e=z.get();return e?{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}:{tag:"div",props:{class:"toast-container"},children:[]}}}function ot(){return()=>({tag:"div",props:{class:"app-shell"},children:[{tag:at(),props:{}},{tag:"main",props:{class:"app-main"},children:[()=>Jt()]},{tag:rt(),props:{}},{tag:nt(),props:{}}]})}function Jt(){let e=T.get(),t=V.find(r=>r.path===e);return t?t.requireAuth&&!q.get()?(w("/login"),st()):t.requireAdmin&&(!m.get()||!m.get().is_admin)?Xt():!t.requireAuth&&q.get()&&["/login","/register"].includes(e)?(w("/"),st()):Vt(t):Kt()}function Vt(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function Kt(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>w("/")},children:["Go home"]}]}}function Xt(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>w("/")},children:["Go home"]}]}}function st(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}h();E();var it={"/":()=>Promise.resolve().then(()=>(ie(),oe)),"/refer":()=>Promise.resolve().then(()=>(ce(),le)),"/webtask":()=>Promise.resolve().then(()=>(pe(),de)),"/earn":()=>Promise.resolve().then(()=>(me(),ue)),"/tg-tasks":()=>Promise.resolve().then(()=>(he(),fe)),"/withdraw":()=>Promise.resolve().then(()=>(we(),ve)),"/profile":()=>Promise.resolve().then(()=>(_e(),ye)),"/admin":()=>Promise.resolve().then(()=>(Te(),xe)),"/login":()=>Promise.resolve().then(()=>($e(),Se)),"/register":()=>Promise.resolve().then(()=>(Ce(),ke))};function ct(){lt(),window.addEventListener("hashchange",lt)}async function lt(){let e=window.location.hash.replace(/^#/,"")||"/";it[e]||(e="/");let t=q.get(),r=["/login","/register"];if(r.includes(e)&&t){w("/");return}if(!r.includes(e)&&!t){w("/login");return}let a=document.getElementById("app"),n=a.querySelector(".app-main");if(!n){n=document.createElement("div"),n.className="app-main";let s=a.querySelector(".bottomnav");s?a.insertBefore(n,s):a.appendChild(n)}n.innerHTML=`<div data-view="${e}" class="view-skeleton"><div class="spinner"></div></div>`;try{let s=await it[e](),o=s.default||s[Object.keys(s)[0]];if(typeof o=="function"){let i=o();i&&typeof i.then=="function"&&await i}}catch(s){console.error("Route render failed",s),n.innerHTML=`<div class="card"><h2>Error</h2><p>${s.message}</p></div>`}}h();Me();var dt=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();dt.innerHTML="";L(ot(),dt);A.get()&&x();ct();
