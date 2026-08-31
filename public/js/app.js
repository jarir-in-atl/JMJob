var wt=Object.defineProperty;var m=(e,t)=>()=>(e&&(t=e(e=0)),t);var T=(e,t)=>{for(var r in t)wt(e,r,{get:t[r],enumerable:!0})};function vt(e,t){Fe?Fe(e,t):console.error("[Ghost] Unhandled effect error:",e)}function H(e){let t=e,r=new Set;return{get(){return _&&(r.add(_),_.dependencies.add(r)),t},set(a){t!==a&&(t=a,He(r))}}}function He(e){re(()=>{e.forEach(t=>{t.notify?t.notify():I.add(t)})})}function re(e){ee++;try{e()}finally{if(ee--,ee===0){let t=Array.from(I);I.clear(),t.forEach(r=>r.run())}}}function b(e){let t={dependencies:new Set,run(){te(t),j.push(_),_=t;try{e()}catch(r){vt(r,e)}finally{_=j.pop()}},notify(){I.add(t)}};return t.run(),()=>te(t)}function ae(e){let t,r=!0,a=new Set,n={dependencies:new Set,notify(){r||(r=!0,He(a))}};return{get(){if(_&&(a.add(_),_.dependencies.add(a)),r){te(n),j.push(_),_=n;try{t=e()}finally{_=j.pop()}r=!1}return t}}}function te(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var _,j,I,ee,Fe,M=m(()=>{_=null,j=[],I=new Set,ee=0,Fe=null});function R(){ne.totalUpdates++,ne.recentUpdates++}var D,ne,se=m(()=>{D=new Set,ne={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function E(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){bt(e,t);return}if(e.__ghostWhen){yt(e,t);return}if(e.__ghostLazy){_t(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;D.add(e);let r=document.createElement(e.tag);e.el=r,Object.entries(e.props).forEach(([a,n])=>{if(a==="ghostStyle"&&n?.mount){n.mount(r);return}let o=a.startsWith("on");typeof n=="function"&&!o?e.effects.push(b(()=>{r.setAttribute(a,n()),R(),e.events.update?.forEach(s=>s())})):o?r[a.toLowerCase()]=n:r.setAttribute(a,n)}),e.children.forEach(a=>{if(a!=null)if(a.__ghostList||a.__ghostWhen||a.__ghostLazy)E(a,r);else if(typeof a=="string"||typeof a=="number")r.appendChild(document.createTextNode(String(a)));else if(typeof a=="function"){let n=null;e.effects.push(b(()=>{let o=a(),s=document.createTextNode(String(o??""));n?r.replaceChild(s,n):r.appendChild(s),n=s,R(),e.events.update?.forEach(i=>i())}))}else E(a,r)}),t.appendChild(r),e.events.mount?.forEach(a=>a())}function O(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),D.delete(e)}}function bt(e,t){let{getItems:r,keyFn:a,renderFn:n}=e,o=document.createComment("[ghost-list]"),s=document.createComment("[/ghost-list]");t.appendChild(o),t.appendChild(s);let i=new Map;function l(u){return u.el||null}let h=b(()=>{let u=r(),L=u.map((w,F)=>String(a(w,F))),gt=Array.from(i.keys());for(let w of gt)if(!L.includes(w)){let F=i.get(w);O(F.ghostNode),i.delete(w)}for(let w=0;w<u.length;w++){let F=L[w];if(!i.has(F)){let U=n(u[w],w),N=document.createElement("ghost-list-slot");for(E(U,N);N.firstChild;)t.insertBefore(N.firstChild,s);i.set(F,{ghostNode:U})}}for(let w=L.length-1;w>=0;w--){let F=L[w],U=i.get(F);if(!U)continue;let N=l(U.ghostNode);if(!N)continue;let Ae=L[w+1],qe=(Ae?l(i.get(Ae)?.ghostNode):null)||s;N.nextSibling!==qe&&t.insertBefore(N,qe)}R()});e._listCleanup=()=>{h();for(let u of i.values())O(u.ghostNode);i.clear(),o.remove(),s.remove()}}function P(e,t,r=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:r}}function yt(e,t){let{conditionGetter:r,trueFn:a,falseFn:n}=e,o=document.createComment("[ghost-when]");t.appendChild(o);let s=null,i=b(()=>{let h=r()?a:n;if(s&&(O(s),s=null),h&&(s=h(),s)){let u=document.createElement("ghost-when-slot");for(E(s,u);u.firstChild;)t.insertBefore(u.firstChild,o)}R()});e._whenCleanup=()=>{i(),s&&O(s),o.remove()}}function _t(e,t){let{importFn:r,fallback:a}=e,n=document.createComment("[ghost-lazy]");t.appendChild(n);let o=null;if(a){let s=document.createElement("ghost-lazy-slot");for(E(a,s);s.firstChild;)t.insertBefore(s.firstChild,n);o=a}r().then(s=>{let i=s.default||s;o&&(O(o),o=null);let l=typeof i=="function"?i():i,h=document.createElement("ghost-lazy-slot");for(E(l,h);h.firstChild;)t.insertBefore(h.firstChild,n);o=l}).catch(s=>{console.error("[Ghost] lazyNode failed to load:",s)})}var oe=m(()=>{M();se()});var Me=m(()=>{M()});var B=m(()=>{});var Ne=m(()=>{se()});var Pe=m(()=>{M()});var Ue=m(()=>{oe();M();B();B()});function Tt(e){if(typeof window>"u"||!window.DOMParser)return{};let r=new DOMParser().parseFromString(e,"text/xml");function a(n){let o={};if(n.nodeType===3)return n.nodeValue.trim();if(n.attributes?.length){o["@attributes"]={};for(let s of n.attributes)o["@attributes"][s.nodeName]=s.nodeValue}for(let s of n.childNodes){let i=s.nodeName,l=a(s);l!==""&&(o[i]===void 0?o[i]=l:(Array.isArray(o[i])||(o[i]=[o[i]]),o[i].push(l)))}return o}return a(r.documentElement)}function St(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function le(e,t={}){let{cache:r=!1,...a}=t,n=(a.method||"GET").toUpperCase(),o={url:e,...a};for(let L of le.interceptors.request)o=L(o)??o;let s=o.url;delete o.url;let i=St(s,n);if(r==="memory"&&n==="GET"&&ie.has(i))return ie.get(i);let l=await fetch(s,o),h=l.headers.get("content-type")||"";if(!l.ok)throw new Error(`Ghost-HTTP Error: ${l.status} ${l.statusText}`);let u;h.includes("application/xml")||h.includes("text/xml")?u=Tt(await l.text()):h.includes("application/json")?u=await l.json():u=await l.text();for(let L of le.interceptors.response)u=L(l,u)??u;return r==="memory"&&n==="GET"&&ie.set(i,u),u}var ie,Re=m(()=>{ie=new Map;le.interceptors={request:[],response:[]}});function ce(e,t){let r;try{let n=localStorage.getItem(e);r=n?JSON.parse(n):t}catch{r=t}let a=H(r);return b(()=>{try{localStorage.setItem(e,JSON.stringify(a.get()))}catch(n){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,n)}}),a}var Oe=m(()=>{M()});function $t(){let e=new Map;return{on(t,r){return e.has(t)||e.set(t,new Set),e.get(t).add(r),()=>e.get(t).delete(r)},emit(t,r){e.has(t)&&e.get(t).forEach(a=>a(r))},clear(t){t?e.delete(t):e.clear()}}}var $r,We=m(()=>{$r=$t()});var Lr,kt,je=m(()=>{M();Lr=H("en"),kt=new Map;kt.set("en",{})});var S=m(()=>{M();oe();Me();B();Ne();Pe();Ue();Re();Oe();We();je()});function Ie(e){de=e}function De(e){pe=e}async function p(e,{method:t="GET",body:r,headers:a={},signal:n}={}){let o=e.startsWith("http")?e:Ct.apiBase+e,s={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...a}};de&&(s.headers.Authorization=`Bearer ${de}`),r!==void 0&&(s.body=JSON.stringify(r)),n&&(s.signal=n);let i=await fetch(o,s);if(i.status===401)throw pe&&pe(),new G("Unauthorized",401,null);let l=null,h=i.headers.get("content-type")||"";try{if(h.includes("application/json"))l=await i.json();else{let u=await i.text();l=u?{message:u}:null}}catch{}if(!i.ok){let u=l&&l.message||`HTTP ${i.status}`;throw new G(u,i.status,l)}return l}var Ct,de,pe,G,d,$=m(()=>{Ct=window.EARNAPP_CONFIG||{apiBase:"/api"},de=null,pe=null;G=class extends Error{constructor(t,r,a){super(t),this.status=r,this.payload=a}},d={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t})}});function c(e,t="info",r=3500){W.set({message:e,type:t,id:Date.now()}),ue&&clearTimeout(ue),ue=setTimeout(()=>W.set(null),r)}async function x(){if(!A.get())return null;try{let e=await d.me();return f.set(e.data),e.data}catch{return null}}async function Be(e,t){let r=await d.login({email:e,password:t});return A.set(r.data.token),f.set(r.data.user),r.data.user}async function Ge(e){let t=await d.register(e);return A.set(t.data.token),f.set(t.data.user),t.data.user}async function ze(){try{await d.logout()}catch{}A.set(null),f.set(null),q.set("/login")}function v(e){window.location.hash=e}var Lt,Et,A,f,W,ue,q,k,g=m(()=>{S();S();$();Lt="earnap_token",Et="earnap_user",A=ce(Lt,null),f=ce(Et,null),W=H(null),ue=null;q=H(window.location.hash.replace(/^#/,"")||"/"),k=ae(()=>!!A.get()&&!!f.get());b(()=>{let e=A.get();Ie(e)});De(()=>{A.set(null),f.set(null),q.set("/login"),c("Session expired. Please log in.","error")})});var Je={};T(Je,{HomePage:()=>z});function z(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=f.get(),r=y("div","welcome-popup","");r.innerHTML=`
            <strong>Welcome to EarnApp.</strong>
            <span>If you don't receive payment within 5 minutes, please contact support.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,r.querySelector("button").addEventListener("click",()=>r.remove()),e.appendChild(r),e.appendChild(At(t)),e.appendChild(qt(t)),e.appendChild(await Ft(t)),e.appendChild(await Ht())}}function y(e,t,r){let a=document.createElement(e);return t&&(a.className=t),r!==void 0&&(a.textContent=r),a}function At(e){let t=y("div","card card--user-header"),r=y("div","user-header__left"),a=y("img","avatar avatar--lg");a.src=e?e.avatar_url:"https://placehold.co/60x60/e8e8e8/a9a9a9?text=U",a.alt="avatar",r.appendChild(a);let n=y("div","user-header__info");n.innerHTML=`
        <div class="user-header__name">${e?Ve(e.name):"Loading\u2026"}</div>
        <div class="user-header__username">@${e?Ve(e.username):"user"}</div>
    `,r.appendChild(n),t.appendChild(r);let o=y("div","user-header__right");return o.innerHTML=`
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
    `,t.appendChild(o),t}function qt(e){let t=y("div","card card--daily-mission");t.innerHTML=`
        <h3 class="card__title">Daily Mission</h3>
        <p class="card__sub">Target: 50 | Completed: ${e?e.today_ads:0} | High Reward</p>
    `;let r=y("button","btn btn--secondary","Claim Daily Bonus");return r.disabled=!0,r.addEventListener("click",()=>c("Daily bonus already claimed today.","info")),t.appendChild(r),t}async function Ft(e){let t=y("div","card card--ad-reward"),r=e?e.ads_remaining:0;t.innerHTML=`
        <h3 class="card__title">Ads Reward Center</h3>
        <p class="card__sub">Wait Time: 12 Sec | Daily Limit: 50 Ads</p>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${e?e.today_ads/e.ads_limit*100:0}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${e?e.today_ads:0} / ${e?e.ads_limit:50}</p>
    `;let a=y("button","btn btn--primary btn--xl","Watch Ad & Earn");return r<=0&&(a.disabled=!0,a.textContent="All Tasks Completed"),a.addEventListener("click",()=>Mt()),t.appendChild(a),t}async function Ht(){let e=y("div","card card--webtask");e.innerHTML=`
        <h3 class="card__title">Web Task Center</h3>
        <p class="card__sub">Loading\u2026</p>
    `;try{let r=(await d.webTasks()).data||[],a=r.filter(s=>s.can_claim).length,n=r.filter(s=>!s.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${a} | Completed: ${n} | Total: ${r.length}`;let o=y("a","btn btn--ghost","View all tasks \u2192");o.href="#/webtask",o.addEventListener("click",s=>{s.preventDefault(),v("/webtask")}),e.appendChild(o)}catch{e.querySelector(".card__sub").textContent="Failed to load."}return e}function Mt(){let e=y("div","modal modal--ad");e.innerHTML=`
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
        `;let n=12,o=t.querySelector("#cd"),s=setInterval(()=>{n--,o.textContent=n,n<=0&&(clearInterval(s),Nt(e,"simulated",a))},1e3)},200)}async function Nt(e,t,r){try{let a=await d.reward({provider:t,started_at:r});c("+"+parseFloat(a.data.reward).toFixed(4)+" credited!","success"),e.remove(),await x(),z()()}catch(a){c(a.message||"Reward failed","error"),e.remove()}}function Ve(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var me=m(()=>{g();$()});var Xe={};T(Xe,{ReferPage:()=>fe});function fe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=f.get(),r=null;try{r=(await d.referrals()).data}catch{c("Failed to load referrals","error")}let a=r?r.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let n=e.querySelector("#copy-btn"),o=e.querySelector("#refer-link-input");n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.value),c("Link copied to clipboard!","success")}catch{o.select(),document.execCommand("copy"),c("Link copied!","success")}});let s=e.querySelector("#share-tg");s.href="https://t.me/share/url?url="+encodeURIComponent(a);let i=e.querySelector("#refer-list");r&&r.referrals&&r.referrals.forEach(l=>{let h=document.createElement("div");h.className="refer-item",h.innerHTML=`
                    <img class="avatar" src="${l.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Ke(l.name)}</div>
                        <div class="refer-item__username">@${Ke(l.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(l.lifetime_earned).toFixed(2)}</div>
                `,i.appendChild(h)})}}function Ke(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var he=m(()=>{$();g()});var Qe={};T(Qe,{WebTaskPage:()=>V});function V(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let a=(await d.webTasks()).data||[];if(a.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",a.forEach(n=>t.appendChild(Pt(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Pt(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Ye(e.title)}</h3>
        <p class="card__sub">${Ye(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let r=t.querySelector("button");return r&&!r.disabled&&r.addEventListener("click",()=>Ut(e,r,t)),t}async function Ut(e,t,r){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let a=0,n=e.duration_seconds;t.textContent=`Wait ${n}s\u2026`;let s=(await d.webTaskStart({task_id:e.id})).data.completion_id,i=setInterval(()=>{a+=1;let l=n-a;t.textContent=l>0?`Wait ${l}s\u2026`:"Claim Reward",a>=n&&(clearInterval(i),Rt(t,s,r))},1e3)}function Rt(e,t,r){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let a=await d.webTaskClaim({completion_id:t});c("+"+parseFloat(a.data.reward).toFixed(2)+" credited!","success"),await x(),V()()}catch(a){c(a.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Ye(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ge=m(()=>{$();g()});var Ze={};T(Ze,{EarnPage:()=>J});function J(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=f.get(),r=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let a=e.querySelector("#watch-btn");a.disabled||a.addEventListener("click",()=>Ot())}}function Ot(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let o=a.querySelector("#cd-num"),s=setInterval(async()=>{r--,o.textContent=r,n.textContent=`Reward in ${r}s\u2026`,r<=0&&(clearInterval(s),await Wt(e,"simulated",t))},1e3)},300)}async function Wt(e,t,r){try{let a=await d.reward({provider:t,started_at:r});c(`+$${parseFloat(a.data.reward).toFixed(4)} credited!`,"success"),await x(),e.remove(),J()()}catch(a){c(a.message||"Reward failed","error"),e.remove()}}var we=m(()=>{$();g()});var et={};T(et,{TgTasksPage:()=>X});function X(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let a=(await d.tgTasks()).data||[];if(t.innerHTML="",a.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}a.forEach(n=>t.appendChild(jt(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function jt(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${K(e.channel_name)}</strong>
                <span class="muted">${K(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${K(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${K(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let r=t.querySelector("a.btn");r.addEventListener("click",async a=>{a.preventDefault();let n=r.href;window.open(n,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&It(e,t)},3e3)})}return t}async function It(e,t){let r=t.querySelector(".task-actions");r.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await d.tgTaskVerify({task_id:e.id}),c("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await x(),X()()}catch(a){c(a.message||"Verification failed","error"),r.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function K(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ve=m(()=>{$();g()});var tt={};T(tt,{WithdrawPage:()=>Y});function Y(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=f.get();e.innerHTML=`
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
        `;let r=e.querySelector("#withdraw-form");r.addEventListener("submit",async n=>{n.preventDefault();let o=new FormData(r),s=r.querySelector("button");s.disabled=!0,s.textContent="Submitting\u2026";try{let i=await d.withdraw({amount:parseFloat(o.get("amount")),wallet_address:String(o.get("wallet_address")),gateway:String(o.get("gateway"))});c("Withdrawal requested!","success"),await x(),Y()()}catch(i){let l=i.payload&&i.payload.errors;if(l){let h=Object.values(l)[0];c(Array.isArray(h)?h[0]:h,"error")}else c(i.message||"Withdrawal failed","error");s.disabled=!1,s.textContent="Confirm Withdrawal"}});let a=e.querySelector("#withdraw-history");try{let o=(await d.withdrawals()).data||[];o.length===0?a.innerHTML='<p class="muted">No withdrawals yet.</p>':(a.innerHTML="",o.forEach(s=>a.appendChild(Dt(s))))}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Dt(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let r=(e.status||"pending").toUpperCase(),a=e.admin_note?`<div class="withdraw-row__note">"${be(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${be(e.gateway)} \xB7 ${be(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${r}</div>
        ${a}
    `,t}function be(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ye=m(()=>{$();g()});var rt={};T(rt,{ProfilePage:()=>xe});function xe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=f.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?_e(t.name):""}</h2>
                <p class="card__sub">@${t?_e(t.username):""}</p>
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
        `;let r=e.querySelector("#ad-history");try{let n=(await d.adHistory()).data||[];if(n.length===0)r.innerHTML='<p class="muted">No ad views yet.</p>';else{r.innerHTML='<div class="ad-history__list"></div>';let o=r.querySelector(".ad-history__list");n.forEach(s=>{let i=document.createElement("div");i.className="ad-history__row",i.innerHTML=`
                        <span class="ad-history__provider">${_e(s.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(s.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${s.completed_at||s.started_at}</span>
                    `,o.appendChild(i)})}}catch{r.innerHTML='<p class="muted">Failed to load history.</p>'}}}function _e(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Te=m(()=>{$();g()});var st={};T(st,{AdminPage:()=>Se});function Se(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=f.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading\u2026</div>
        `;let r=e.querySelectorAll(".admin-tab"),a=e.querySelector("#admin-content");r.forEach(n=>{n.addEventListener("click",()=>{r.forEach(o=>o.classList.remove("admin-tab--active")),n.classList.add("admin-tab--active"),at(n.dataset.tab,a)})}),at("stats",a)}}async function at(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let a=(await d.adminStats()).data;t.innerHTML=`
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
            `;let n=t.querySelector("#wd-list");a.forEach(o=>n.appendChild(nt(o,n))),t.querySelector("#wd-filter").addEventListener("change",async o=>{let s=await d.adminWithdrawals(o.target.value);n.innerHTML="",(s.data||[]).forEach(i=>n.appendChild(nt(i,n)))})}else if(e==="users"){let a=(await d.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list");a.forEach(o=>{let s=document.createElement("div");s.className="admin-row",s.innerHTML=`
                    <div>
                        <strong>${C(o.name)}</strong>
                        <span class="muted">${C(o.email)}</span>
                        ${o.is_admin?'<span class="badge">ADMIN</span>':""}
                    </div>
                    <div>$${parseFloat(o.balance).toFixed(2)} / $${parseFloat(o.lifetime_earned).toFixed(2)}</div>
                `,n.appendChild(s)})}else if(e==="providers"){let a=(await d.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list");a.forEach(o=>n.appendChild(Bt(o,n)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function nt(e,t){let r=document.createElement("div");if(r.className="admin-row admin-row--withdrawal",r.innerHTML=`
        <div class="admin-row__main">
            <strong>${C(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${C(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${C(e.gateway)} \xB7 ${C(e.wallet_address)}</div>
        <div class="admin-row__status">${C(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let a=document.createElement("div");a.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--success btn--sm",n.textContent="Approve",n.addEventListener("click",async()=>{try{await d.adminApprove(e.id,{admin_note:"Approved by admin"}),c("Withdrawal approved","success"),r.remove()}catch(s){c(s.message,"error")}});let o=document.createElement("button");o.className="btn btn--danger btn--sm",o.textContent="Reject",o.addEventListener("click",async()=>{let s=prompt("Reason for rejection (optional):","Invalid wallet address");try{await d.adminReject(e.id,{admin_note:s||""}),c("Withdrawal rejected (refunded)","info"),r.remove()}catch(i){c(i.message,"error")}}),a.appendChild(n),a.appendChild(o),r.appendChild(a)}else if(e.status==="approved"){let a=document.createElement("div");a.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--primary btn--sm",n.textContent="Mark as Paid",n.addEventListener("click",async()=>{try{await d.adminPay(e.id,{admin_note:"Paid by admin"}),c("Marked as paid","success"),r.remove()}catch(o){c(o.message,"error")}}),a.appendChild(n),r.appendChild(a)}return r}function Bt(e,t){let r=document.createElement("div");r.className="admin-row admin-row--provider";let a=!!e.enabled,n=e.block_id||"";return r.innerHTML=`
        <div class="admin-row__main">
            <strong>${C(e.name)}</strong>
            <span class="muted">${C(e.slug)}</span>
            ${a?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${C(n)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${a?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,r.querySelector(".provider-save").addEventListener("click",async()=>{let o={block_id:r.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(r.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(r.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(r.querySelector(".provider-duration").value,10)||12,enabled:r.querySelector(".provider-enabled").checked};try{await d.adminUpdateProvider(e.id,o),c("Provider saved","success")}catch(s){c(s.message,"error")}}),r}function C(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var $e=m(()=>{$();g();g()});var ot={};T(ot,{LoginPage:()=>ke});function ke(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} EarnApp</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${Gt(t)}</strong></p>`:""}
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
    `;let r=e.querySelector("#login-form");r&&r.addEventListener("submit",async a=>{a.preventDefault();let n=new FormData(r),o=r.querySelector("button");o.disabled=!0,o.textContent="Logging in\u2026";try{await Be(n.get("email"),n.get("password")),c("Welcome back!","success"),v("/")}catch(s){c(s.message||"Login failed","error"),o.disabled=!1,o.textContent="Log in"}})}function Gt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ce=m(()=>{g()});var it={};T(it,{RegisterPage:()=>Le});function Le(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
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
        `;let r=e.querySelector("#register-form");r.addEventListener("submit",async a=>{a.preventDefault();let n=new FormData(r),o=r.querySelector("button");o.disabled=!0,o.textContent="Creating\u2026";try{let s={name:n.get("name"),email:n.get("email"),password:n.get("password")};t&&(s.referral_code=t),await Ge(s),c("Account created \u2014 welcome!","success"),v("/")}catch(s){let i=s.payload&&s.payload.errors;if(i){let l=Object.values(i)[0];c(Array.isArray(l)?l[0]:l,"error")}else c(s.message||"Registration failed","error");o.disabled=!1,o.textContent="Create account"}})}}var Ee=m(()=>{g();g()});S();g();S();g();var Q=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(me(),Je))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(he(),Xe))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ge(),Qe))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(we(),Ze))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ve(),et))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),tt))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Te(),rt))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>($e(),st))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ce(),ot))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ee(),it))}],ka=b(()=>{let e=q.get();return Q.find(t=>t.path===e)||Q[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";q.set(e)});S();g();S();var zt=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/webtask",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Earn",icon:"bi-play-circle"},{path:"/refer",label:"Refer",icon:"bi-people"},{path:"/withdraw",label:"Wallet",icon:"bi-wallet2"},{path:"/profile",label:"Profile",icon:"bi-person"}];function Vt(e){return{tag:"a",props:{class:"bottomnav__item"+(q.get()===e.path?" bottomnav__item--active":""),href:"#"+e.path},children:[{tag:"i",props:{class:"bi "+e.icon+" bottomnav__icon"},children:[]},{tag:"span",props:{class:"bottomnav__label"},children:[e.label]}]}}function lt(){return P(()=>k.get(),()=>({tag:"nav",props:{class:"bottomnav"},children:zt.map(Vt)}),()=>({tag:"div",props:{class:"bottomnav-spacer"},children:[]}))}g();S();function ct(){return P(()=>k.get(),()=>Kt(),()=>Jt())}function Jt(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["\u{1F4B0} EarnApp"]},{tag:"div",props:{class:"topbar__actions"},children:[{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Kt(){let e=f.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["\u{1F4B0} EarnApp"]},{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"strong",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-balance"},children:[`$${t}`]}]},{tag:"img",props:{class:"topbar__avatar",src:e?e.avatar_url:"https://placehold.co/40x40/e8e8e8/a9a9a9?text=U",alt:"avatar"},children:[]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await ze(),c("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}g();S();function dt(){return P(()=>!!W.get(),()=>{let e=W.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}function ut(){return{tag:"div",props:{class:"app-shell"},children:[ct(),{tag:"main",props:{class:"app-main"},children:[Xt()]},lt(),dt()]}}function Xt(){let e=q.get(),t=Q.find(r=>r.path===e);return t?t.requireAuth&&!k.get()?(v("/login"),pt()):t.requireAdmin&&(!f.get()||!f.get().is_admin)?Zt():!t.requireAuth&&k.get()&&["/login","/register"].includes(e)?(v("/"),pt()):Yt(t):Qt()}function Yt(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function Qt(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>v("/")},children:["Go home"]}]}}function Zt(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>v("/")},children:["Go home"]}]}}function pt(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}S();g();me();Ce();Ee();he();ge();we();ve();ye();Te();$e();var mt={"/":z,"/refer":fe,"/webtask":V,"/earn":J,"/tg-tasks":X,"/withdraw":Y,"/profile":xe,"/admin":Se,"/login":ke,"/register":Le};function ft(){Z(),setTimeout(Z,50),window.addEventListener("hashchange",Z),b(()=>{k.get(),setTimeout(Z,0)})}async function Z(){let e=window.location.hash.replace(/^#/,"")||"/";mt[e]||(e="/");let t=k.get(),r=["/login","/register"];if(r.includes(e)&&t){v("/");return}if(!r.includes(e)&&!t){v("/login");return}let a=document.getElementById("app"),n=a.querySelector(".app-main");if(!n){n=document.createElement("div"),n.className="app-main";let s=a.querySelector(".bottomnav");s?a.insertBefore(n,s):a.appendChild(n)}n.innerHTML=`<div data-view="${e}" class="view-skeleton"><div class="spinner"></div></div>`;let o=mt[e];try{let s=o();typeof s=="function"?await s():s&&typeof s.then=="function"&&await s}catch(s){console.error("View render threw synchronously for",e,s),n.innerHTML=`<div class="card"><h2>Error</h2><p>${s.message}</p></div>`}}g();var ht=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();ht.innerHTML="";E(ut(),ht);A.get()&&x();ft();
