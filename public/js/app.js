var Ws=Object.defineProperty;var v=(e,t)=>()=>(e&&(t=e(e=0)),t);var w=(e,t)=>{for(var a in t)Ws(e,a,{get:t[a],enumerable:!0})};function Gs(e,t){ca?ca(e,t):console.error("[Ghost] Unhandled effect error:",e)}function E(e){let t=e,a=new Set;return{get(){return C&&(a.add(C),C.dependencies.add(a)),t},set(s){t!==s&&(t=s,da(a))}}}function da(e){Ge(()=>{e.forEach(t=>{t.notify?t.notify():be.add(t)})})}function Ge(e){Je++;try{e()}finally{if(Je--,Je===0){let t=Array.from(be);be.clear(),t.forEach(a=>a.run())}}}function $(e){let t={dependencies:new Set,run(){We(t),me.push(C),C=t;try{e()}catch(a){Gs(a,e)}finally{C=me.pop()}},notify(){be.add(t)}};return t.run(),()=>We(t)}function ze(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,da(s))}};return{get(){if(C&&(s.add(C),C.dependencies.add(s)),a){We(r),me.push(C),C=r;try{t=e()}finally{C=me.pop()}a=!1}return t}}}function We(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var C,me,be,Je,ca,O=v(()=>{C=null,me=[],be=new Set,Je=0,ca=null});function te(){Ve.totalUpdates++,Ve.recentUpdates++}var ge,Ve,Xe=v(()=>{ge=new Set,Ve={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function B(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){zs(e,t);return}if(e.__ghostWhen){Vs(e,t);return}if(e.__ghostLazy){Xs(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;ge.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let n=s.startsWith("on");typeof r=="function"&&!n?e.effects.push($(()=>{a.setAttribute(s,r()),te(),e.events.update?.forEach(i=>i())})):n?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)B(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push($(()=>{let n=s(),i=document.createTextNode(String(n??""));r?a.replaceChild(i,r):a.appendChild(i),r=i,te(),e.events.update?.forEach(c=>c())}))}else B(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function ae(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),ge.delete(e)}}function zs(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,n=document.createComment("[ghost-list]"),i=document.createComment("[/ghost-list]");t.appendChild(n),t.appendChild(i);let c=new Map;function u(h){return h.el||null}let f=$(()=>{let h=a(),F=h.map((S,U)=>String(s(S,U))),Js=Array.from(c.keys());for(let S of Js)if(!F.includes(S)){let U=c.get(S);ae(U.ghostNode),c.delete(S)}for(let S=0;S<h.length;S++){let U=F[S];if(!c.has(U)){let ee=r(h[S],S),z=document.createElement("ghost-list-slot");for(B(ee,z);z.firstChild;)t.insertBefore(z.firstChild,i);c.set(U,{ghostNode:ee})}}for(let S=F.length-1;S>=0;S--){let U=F[S],ee=c.get(U);if(!ee)continue;let z=u(ee.ghostNode);if(!z)continue;let oa=F[S+1],la=(oa?u(c.get(oa)?.ghostNode):null)||i;z.nextSibling!==la&&t.insertBefore(z,la)}te()});e._listCleanup=()=>{f();for(let h of c.values())ae(h.ghostNode);c.clear(),n.remove(),i.remove()}}function N(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function Vs(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,n=document.createComment("[ghost-when]");t.appendChild(n);let i=null,c=$(()=>{let f=a()?s:r;if(i&&(ae(i),i=null),f&&(i=f(),i)){let h=document.createElement("ghost-when-slot");for(B(i,h);h.firstChild;)t.insertBefore(h.firstChild,n)}te()});e._whenCleanup=()=>{c(),i&&ae(i),n.remove()}}function Xs(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let n=null;if(s){let i=document.createElement("ghost-lazy-slot");for(B(s,i);i.firstChild;)t.insertBefore(i.firstChild,r);n=s}a().then(i=>{let c=i.default||i;n&&(ae(n),n=null);let u=typeof c=="function"?c():c,f=document.createElement("ghost-lazy-slot");for(B(u,f);f.firstChild;)t.insertBefore(f.firstChild,r);n=u}).catch(i=>{console.error("[Ghost] lazyNode failed to load:",i)})}var Ye=v(()=>{O();Xe()});var pa=v(()=>{O()});var ve=v(()=>{});var ua=v(()=>{Xe()});var ma=v(()=>{O()});var ba=v(()=>{Ye();O();ve();ve()});function Ks(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let n={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){n["@attributes"]={};for(let i of r.attributes)n["@attributes"][i.nodeName]=i.nodeValue}for(let i of r.childNodes){let c=i.nodeName,u=s(i);u!==""&&(n[c]===void 0?n[c]=u:(Array.isArray(n[c])||(n[c]=[n[c]]),n[c].push(u)))}return n}return s(a.documentElement)}function Zs(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function Ze(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),n={url:e,...s};for(let F of Ze.interceptors.request)n=F(n)??n;let i=n.url;delete n.url;let c=Zs(i,r);if(a==="memory"&&r==="GET"&&Ke.has(c))return Ke.get(c);let u=await fetch(i,n),f=u.headers.get("content-type")||"";if(!u.ok)throw new Error(`Ghost-HTTP Error: ${u.status} ${u.statusText}`);let h;f.includes("application/xml")||f.includes("text/xml")?h=Ks(await u.text()):f.includes("application/json")?h=await u.json():h=await u.text();for(let F of Ze.interceptors.response)h=F(u,h)??h;return a==="memory"&&r==="GET"&&Ke.set(c,h),h}var Ke,ga=v(()=>{Ke=new Map;Ze.interceptors={request:[],response:[]}});function Qe(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=E(a);return $(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var va=v(()=>{O()});function Qs(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var Xi,fa=v(()=>{Xi=Qs()});var Zi,er,ha=v(()=>{O();Zi=E("en"),er=new Map;er.set("en",{})});var M=v(()=>{O();Ye();pa();ve();ua();ma();ba();ga();va();fa();ha()});function ya(e){et=e}function wa(e){tt=e}async function p(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let n=e.startsWith("http")?e:tr.apiBase+e,i={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...s}};et&&(i.headers.Authorization=`Bearer ${et}`),a!==void 0&&(i.body=JSON.stringify(a)),r&&(i.signal=r);let c=await fetch(n,i);if(c.status===401)throw tt&&tt(),new fe("Unauthorized",401,null);let u=null,f=c.headers.get("content-type")||"";try{if(f.includes("application/json"))u=await c.json();else{let h=await c.text();u=h?{message:h}:null}}catch{}if(!c.ok){let h=u&&u.message||`HTTP ${c.status}`;throw new fe(h,c.status,u)}return u}var tr,et,tt,fe,l,y=v(()=>{tr=window.EARNAPP_CONFIG||{apiBase:"/api"},et=null,tt=null;fe=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},l={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/notifications${t?"?"+t:""}`)},notificationRead:e=>p(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>p("/notifications/read-all",{method:"POST"}),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminUpdateUserRole:(e,t)=>p(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t}),paymentGateways:()=>p("/payment/gateways"),paymentSubmit:e=>p("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>p("/payment/submissions"),adminPayments:(e="")=>p(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>p(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>p(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>p("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/jobs${t?"?"+t:""}`)},job:e=>p(`/jobs/${e}`),placeBid:(e,t)=>p(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>p(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>p("/worker/bids"),workerActiveJobs:()=>p("/worker/active-jobs"),submitWork:(e,t)=>p(`/jobs/${e}/submit`,{method:"POST",body:t}),workerSubmissions:()=>p("/worker/submissions"),posterStats:()=>p("/poster/stats"),posterCreateJob:e=>p("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>p("/poster/jobs"),posterJobBids:e=>p(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>p(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>p(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>p(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>p(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>p("/admin/categories"),adminCreateCategory:e=>p("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>p(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>p(`/admin/categories/${e}/delete`,{method:"POST"}),adminSettings:()=>p("/admin/settings"),adminUpdateSettings:e=>p("/admin/settings",{method:"POST",body:e}),adminJobs:(e="")=>p(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminFlagJobDispute:e=>p(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>p(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>p("/admin/reports"),adminRevenue:()=>p("/admin/revenue")}});function o(e,t="info",a=3500){se.set({message:e,type:t,id:Date.now()}),at&&clearTimeout(at),at=setTimeout(()=>se.set(null),a)}async function k(){if(!I.get())return null;try{let e=await l.me();return m.set(e.data),e.data}catch{return null}}async function _a(e,t){let a=await l.login({email:e,password:t});return I.set(a.data.token),m.set(a.data.user),a.data.user}async function $a(e){let t=await l.register(e);return I.set(t.data.token),m.set(t.data.user),t.data.user}async function he(){try{await l.logout()}catch{}I.set(null),m.set(null),A.set("/login")}function b(e){window.location.hash=e}var ar,sr,I,m,se,at,A,x,g=v(()=>{M();M();y();ar="earnap_token",sr="earnap_user",I=Qe(ar,null),m=Qe(sr,null),se=E(null),at=null;A=E(window.location.hash.replace(/^#/,"")||"/"),x=ze(()=>!!I.get()&&!!m.get());$(()=>{let e=I.get();ya(e)});wa(()=>{I.set(null),m.set(null),A.set("/login"),o("Session expired. Please log in.","error")})});var Sa={};w(Sa,{HomePage:()=>re});function re(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=m.get(),a=j("div","welcome-popup","");a.innerHTML=`
            <strong>JM Job:</strong>
            <span>Complete tasks, watch ads, refer friends, and withdraw anytime.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,a.querySelector("button").addEventListener("click",()=>a.remove()),e.appendChild(a),e.appendChild(rr(t)),e.appendChild(nr()),e.appendChild(ir(t)),e.appendChild(await or(t)),e.appendChild(await lr())}}function j(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}function rr(e){let t=j("div","card card--user-header"),a=j("div","user-header__stats");return a.innerHTML=`
        <div class="user-header__stat">
            <span class="metric__label">Balance</span>
            <strong class="metric__value--primary">$${e?parseFloat(e.balance).toFixed(2):"0.00"}</strong>
        </div>
        <div class="user-header__stat">
            <span class="metric__label">Total Earned</span>
            <strong>$${e?parseFloat(e.lifetime_earned).toFixed(2):"0.00"}</strong>
        </div>
        <div class="user-header__stat">
            <span class="metric__label">My Network</span>
            <strong>${e&&e.referral_count||0}</strong>
        </div>
    `,t.appendChild(a),t}function nr(){let e=j("div","icon-grid");return[{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg",tone:"blue"},{path:"/webtask",label:"Tasks",icon:"bi-telegram",tone:"blue"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=j("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),b(a.path)}),e.appendChild(s)}),e}function ir(e){let t=j("div","card card--daily-mission"),a=e&&e.today_ads||0,s=e&&e.ads_limit||50,r=Math.min(100,a/Math.max(1,s)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${s} | Completed: ${a}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${r}%"></div>
        </div>
    `;let n=j("button","btn btn--primary btn--xl","\u{1F381} Claim Daily Bonus");return n.addEventListener("click",async()=>{try{let i=await fetch("/api/user/claim-daily-bonus",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Bearer "+(window.EARNAPP_TOKEN||"")}}).then(c=>c.json());i.success?(o(i.message||"Daily bonus claimed!","success"),await k(),re()()):o(i.message||"Bonus not available.","info")}catch{o("Could not claim. Try again later.","error")}}),t.appendChild(n),t}async function or(e){let t=j("div","card card--ad-reward"),a=e?e.ads_remaining:0,s=e&&e.today_ads||0,r=e&&e.ads_limit||50,n=Math.min(100,s/Math.max(1,r)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Ads Reward Center</h3>
            <span class="ad-reward__meta">Wait: <strong>12s</strong> \xB7 Daily Limit: <strong>${r} Ads</strong></span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${n}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${s} / ${r} (${a} remaining)</p>
    `;let i=j("button","btn btn--success btn--xl","\u25B6 Watch Ad & Earn");return a<=0&&(i.disabled=!0,i.textContent="\u2713 All Tasks Completed"),i.addEventListener("click",()=>cr()),t.appendChild(i),t}async function lr(){let e=j("div","card card--webtask");e.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Web Task Center</h3>
            <span class="card__sub">Loading\u2026</span>
        </div>
    `;try{let a=(await l.webTasks()).data||[],s=a.filter(i=>i.can_claim).length,r=a.filter(i=>!i.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${s} \xB7 Completed: ${r} \xB7 Total: ${a.length}`;let n=j("a","btn btn--ghost","View all tasks \u2192");n.href="#/webtask",n.addEventListener("click",i=>{i.preventDefault(),b("/webtask")}),e.appendChild(n)}catch{e.querySelector(".card__sub").textContent="Failed to load tasks."}return e}function cr(){let e=j("div","modal modal--ad");e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=e.querySelector("#ad-slot"),a=new Date().toISOString();setTimeout(()=>{t.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Simulated Sponsor Ad</h4>
                <p>Thank you for watching \u2014 your reward will be credited in <span id="cd">12</span>s.</p>
            </div>
        `;let s=12,r=t.querySelector("#cd"),n=setInterval(()=>{s--,r.textContent=s,s<=0&&(clearInterval(n),dr(e,"simulated",a))},1e3)},200)}async function dr(e,t,a){try{let s=await l.reward({provider:t,started_at:a});o("+"+parseFloat(s.data.reward).toFixed(4)+" credited!","success"),e.remove(),await k(),re()()}catch(s){o(s.message||"Reward failed","error"),e.remove()}}var st=v(()=>{g();y()});var rt={};w(rt,{WebTaskPage:()=>ne});function ne(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await l.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(pr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function pr(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Ta(e.title)}</h3>
        <p class="card__sub">${Ta(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>ur(e,a,t)),t}async function ur(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let i=(await l.webTaskStart({task_id:e.id})).data.completion_id,c=setInterval(()=>{s+=1;let u=r-s;t.textContent=u>0?`Wait ${u}s\u2026`:"Claim Reward",s>=r&&(clearInterval(c),mr(t,i,a))},1e3)}function mr(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await l.webTaskClaim({completion_id:t});o("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await k(),ne()()}catch(s){o(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Ta(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ye=v(()=>{y();g()});var ka={};w(ka,{EarnPage:()=>we});function we(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=m.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let s=e.querySelector("#watch-btn");s.disabled||s.addEventListener("click",()=>br())}}function br(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=new Date().toISOString(),a=12,s=e.querySelector("#ad-slot"),r=e.querySelector("#ad-countdown");setTimeout(()=>{s.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Sponsored Content</h4>
                <p>This is a placeholder for a real ad. <br>Your reward will be credited in <strong><span id="cd-num">12</span>s</strong>.</p>
            </div>
        `;let n=s.querySelector("#cd-num"),i=setInterval(async()=>{a--,n.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(i),await gr(e,"simulated",t))},1e3)},300)}async function gr(e,t,a){try{let s=await l.reward({provider:t,started_at:a});o(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await k(),e.remove(),we()()}catch(s){o(s.message||"Reward failed","error"),e.remove()}}var nt=v(()=>{y();g()});var xa={};w(xa,{ReferPage:()=>it});function it(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=m.get(),a=null;try{a=(await l.referrals()).data}catch{o("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
            <div class="card card--refer">
                <h2 class="card__title">Invite & Earn</h2>
                <p class="card__sub">Total Network: <strong>${t?t.referral_count:0}</strong> | Bonus Rate: <strong>50%</strong> | Earned so far: <strong>$${a?parseFloat(a.total_commission).toFixed(4):"0.0000"}</strong></p>
                <div class="refer-link">
                    <input id="refer-link-input" class="refer-link__input" value="${s}" readonly>
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
        `;let r=e.querySelector("#copy-btn"),n=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n.value),o("Link copied to clipboard!","success")}catch{n.select(),document.execCommand("copy"),o("Link copied!","success")}});let i=e.querySelector("#share-tg");i.href="https://t.me/share/url?url="+encodeURIComponent(s);let c=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(u=>{let f=document.createElement("div");f.className="refer-item",f.innerHTML=`
                    <img class="avatar" src="${u.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${La(u.name)}</div>
                        <div class="refer-item__username">@${La(u.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(u.lifetime_earned).toFixed(2)}</div>
                `,c.appendChild(f)})}}function La(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ot=v(()=>{y();g()});var Ea={};w(Ea,{WithdrawPage:()=>_e});function _e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=m.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let n=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Submitting\u2026";try{let c=await l.withdraw({amount:parseFloat(n.get("amount")),wallet_address:String(n.get("wallet_address")),gateway:String(n.get("gateway"))});o("Withdrawal requested!","success"),await k(),_e()()}catch(c){let u=c.payload&&c.payload.errors;if(u){let f=Object.values(u)[0];o(Array.isArray(f)?f[0]:f,"error")}else o(c.message||"Withdrawal failed","error");i.disabled=!1,i.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let n=(await l.withdrawals()).data||[];n.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",n.forEach(i=>s.appendChild(vr(i))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function vr(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${lt(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${lt(e.gateway)} \xB7 ${lt(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function lt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ct=v(()=>{y();g()});var ja={};w(ja,{DepositPage:()=>dt});function dt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=m.get();e.innerHTML=`
            <h1 class="page-title">Deposit Funds</h1>

            <div class="card card--deposit-balance">
                <div class="deposit-balance__row">
                    <div>
                        <div class="muted">${t?.role==="poster"?"Available Poster Wallet":"Your Balance"}</div>
                        <div class="deposit-balance__amount" id="deposit-balance">\u09F3${t?parseFloat(t.role==="poster"?t.wallet_balance||0:t.balance||0).toFixed(2):"0.00"}</div>
                    </div>
                    <div class="deposit-balance__hint">
                        <i class="bi bi-info-circle"></i>
                        Funds are added after admin verification.
                    </div>
                </div>
            </div>

            <div class="card" id="deposit-gateway-section">
                <h3 class="card__title">1. Select Payment Method</h3>
                <div class="payment-gateways" id="payment-gateways">
                    <div class="spinner"></div>
                </div>
            </div>

            <div class="card" id="deposit-instructions-card" style="display:none">
                <h3 class="card__title">2. Send Money</h3>
                <div class="payment-instructions" id="payment-instructions"></div>
            </div>

            <div class="card" id="deposit-form-card" style="display:none">
                <h3 class="card__title">3. Submit TRXID</h3>
                <form id="deposit-form" class="deposit-form">
                    <label class="deposit-form__label">
                        Amount (Taka)
                        <input name="amount" type="number" step="0.01" min="1" required id="deposit-amount">
                    </label>
                    <label class="deposit-form__label">
                        Sender Number
                        <input name="sender_number" type="text" required minlength="8" maxlength="20" placeholder="01XXXXXXXXX" id="deposit-sender">
                    </label>
                    <label class="deposit-form__label">
                        Transaction ID (TRXID)
                        <input name="trxid" type="text" required minlength="4" maxlength="40" placeholder="e.g. 8A9B7C6D5E" id="deposit-trxid" style="text-transform: uppercase;">
                    </label>
                    <button type="submit" class="btn btn--primary btn--xl" id="deposit-submit-btn">
                        <i class="bi bi-send"></i> Submit Payment
                    </button>
                </form>
                <p class="deposit-form__warn">
                    \u26A0 Please double-check the TRXID. Duplicate or invalid TRXIDs will be rejected.
                </p>
            </div>

            <h3 class="section-title">Submission History</h3>
            <div class="payment-history" id="payment-history">
                <div class="spinner"></div>
            </div>
        `;try{_.loading=!0;let[s,r]=await Promise.all([l.paymentGateways(),l.paymentSubmissions()]);_.gateways=s.data.gateways,_.minAmount=s.data.min_amount,_.maxAmount=s.data.max_amount,_.submissions=r.data,Ca(),Aa()}catch(s){o("Failed to load deposit info: "+s.message,"error")}finally{_.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!_.selectedGateway){o("Please select a payment method.","error");return}let r=new FormData(a),n=document.getElementById("deposit-submit-btn");n.disabled=!0,n.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let i=await l.paymentSubmit({gateway:_.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});o(i.message||"Payment submitted.","success"),a.reset();let c=await l.paymentSubmissions();_.submissions=c.data,Aa(),await k();let u=m.get(),f=document.getElementById("deposit-balance");f&&u&&(f.textContent="\u09F3"+parseFloat(u.role==="poster"?u.wallet_balance||0:u.balance||0).toFixed(2))}catch(i){o(i.message||"Failed to submit payment.","error")}finally{n.disabled=!1,n.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function Ca(){let e=document.getElementById("payment-gateways");if(e){if(_.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=_.gateways.map(t=>`
        <button class="payment-gateway ${_.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${Y(t.label)}</div>
                <div class="payment-gateway__number">${Y(t.wallet_number)}</div>
            </div>
            ${_.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{_.selectedGateway=t.getAttribute("data-gateway"),Ca(),hr()})})}}function hr(){let e=_.gateways.find(n=>n.key===_.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${Y(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${Y(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{o("Wallet number copied.","info")}).catch(()=>{o("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=_.minAmount,r.max=_.maxAmount,r.placeholder=`${_.minAmount} \u2013 ${_.maxAmount}`)}function Aa(){let e=document.getElementById("payment-history");if(e){if(_.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=_.submissions.map(t=>{let a=fr[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${Y((t.gateway||"").toUpperCase())} \u2022 TRX: ${Y(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${yr(t.created_at)}</div>
            </div>
        `}).join("")}}function yr(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Y(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var fr,_,pt=v(()=>{y();g();fr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},_={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var mt={};w(mt,{ProfilePage:()=>$e});function $e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=m.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?ut(t.name):""}</h2>
                <p class="card__sub">@${t?ut(t.username):""}</p>
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
        `;let a=e.querySelector("#ad-history");try{let r=(await l.adHistory()).data||[];if(r.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let n=a.querySelector(".ad-history__list");r.forEach(i=>{let c=document.createElement("div");c.className="ad-history__row",c.innerHTML=`
                        <span class="ad-history__provider">${ut(i.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(i.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${i.completed_at||i.started_at}</span>
                    `,n.appendChild(c)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function ut(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Se=v(()=>{y();g()});var Ma={};w(Ma,{default:()=>Te});async function Te(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var bt=v(()=>{g()});var qa={};w(qa,{default:()=>ke});async function ke(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var gt=v(()=>{g()});var Na={};w(Na,{default:()=>Le});async function Le(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var vt=v(()=>{g()});function wr(){let e=localStorage.getItem(Pa);return e==="dark"||e==="light"?e:"system"}function _r(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function ft(e){let t=_r(e);document.documentElement.setAttribute("data-theme",t)}function Ha(){let e=q.get();q.set(e==="dark"?"light":"dark")}function Fa(e){q.set(e)}function $r(){let e=localStorage.getItem(Ba);return e&&ht.includes(e)?e:"default"}function Ia(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function Ra(e){ht.includes(e)&&ie.set(e)}function Da(){return ht}var Pa,q,Ba,ht,ie,yt=v(()=>{M();Pa="jmjob_theme";q=E(wr());ft(q.get());$(()=>{let e=q.get();ft(e),localStorage.setItem(Pa,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{q.get()==="system"&&ft("system")});Ba="jmjob_color_theme",ht=["default","emerald","amber","rose"];ie=E($r());Ia(ie.get());$(()=>{let e=ie.get();Ia(e),localStorage.setItem(Ba,e)})});var Ua={};w(Ua,{default:()=>Ee});async function Ee(){let e=document.querySelector("[data-view]");if(!e)return;let t=m.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=q.get(),s=ie.get(),r=Da();e.innerHTML=`
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
                <h3 class="card__title">Appearance</h3>
                <p class="card__sub">Customize how JMJob looks for you. Only your device is affected.</p>
            </div>

            <div class="settings-section">
                <div class="settings-item settings-item--stack">
                    <div class="settings-info">
                        <div class="settings-label">Theme Mode</div>
                        <div class="settings-value">Light, dark, or follow system</div>
                    </div>
                    <div class="theme-segmented" id="theme-mode-group" role="radiogroup" aria-label="Theme mode">
                        <button class="theme-segmented__btn ${a==="light"?"is-active":""}" data-mode="light" role="radio" aria-checked="${a==="light"}">
                            <i class="bi bi-sun"></i> Light
                        </button>
                        <button class="theme-segmented__btn ${a==="dark"?"is-active":""}" data-mode="dark" role="radio" aria-checked="${a==="dark"}">
                            <i class="bi bi-moon-stars"></i> Dark
                        </button>
                        <button class="theme-segmented__btn ${a==="system"?"is-active":""}" data-mode="system" role="radio" aria-checked="${a==="system"}">
                            <i class="bi bi-circle-half"></i> System
                        </button>
                    </div>
                </div>

                <div class="settings-item settings-item--stack">
                    <div class="settings-info">
                        <div class="settings-label">Accent Color</div>
                        <div class="settings-value">${xe[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${r.map(c=>`
                            <button class="theme-swatch ${c===s?"is-active":""}" data-color="${c}" role="radio" aria-checked="${c===s}" title="${xe[c]||c}">
                                <span class="theme-swatch__chip" style="background: ${Sr[c]};"></span>
                                <span class="theme-swatch__label">${(xe[c]||c).split(" ")[0]}</span>
                            </button>
                        `).join("")}
                    </div>
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
    `;let n=document.getElementById("theme-mode-group");n&&n.querySelectorAll("button[data-mode]").forEach(c=>{c.addEventListener("click",()=>{let u=c.getAttribute("data-mode");Fa(u),o(`Theme mode set to ${u}.`,"info")})});let i=document.getElementById("color-theme-group");i&&i.querySelectorAll("button[data-color]").forEach(c=>{c.addEventListener("click",()=>{let u=c.getAttribute("data-color");Ra(u),o(`Accent color set to ${xe[u]||u}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await he(),o("Logged out.","info")})}var xe,Sr,wt=v(()=>{g();yt();xe={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},Sr={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var Ja={};w(Ja,{NotificationsPage:()=>_t});function _t(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await l.notificationsReadAll(),o("All notifications marked as read.","success"),await Oa()}catch(t){o(t.message||"Could not update notifications.","error")}}),await Oa())}}async function Oa(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await l.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(Tr).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await l.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){o(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${oe(t.message||"unknown error")}</p>`}}function Tr(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${oe(t.action_url)}">Open</a>`:"",n=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${oe(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${oe(t.title||"Notification")}</h3><p>${oe(t.message||"")}</p><small>${kr(e.created_at)}</small></div><div class="notifications-page__actions">${r}${n}</div></article>`}function kr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function oe(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var $t=v(()=>{y();g()});var Wa={};w(Wa,{TgTasksPage:()=>Ce});function Ce(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await l.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Lr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Lr(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${Ae(e.channel_name)}</strong>
                <span class="muted">${Ae(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${Ae(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${Ae(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&xr(e,t)},3e3)})}return t}async function xr(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await l.tgTaskVerify({task_id:e.id}),o("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await k(),Ce()()}catch(s){o(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Ae(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var St=v(()=>{y();g()});var Va={};w(Va,{PosterDashboardPage:()=>kt});function kt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-dashboard";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML=`
                <div class="card" style="max-width: 560px; margin: 40px auto; text-align: center;">
                    <h2>Poster access required</h2>
                    <p class="muted">This workspace is available to job posters and administrators.</p>
                    <a class="btn btn--primary" href="#/">Go home</a>
                </div>
            `;return}e.innerHTML=`
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Poster Dashboard</h1>
                    <p class="muted">Post jobs, compare bids, and manage work in progress.</p>
                </div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-new-job">
                    <i class="bi bi-plus-lg"></i> Post a job
                </a>
            </div>
            <div id="poster-dashboard-content"><div class="spinner"></div></div>
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),b("/poster/post-job")}),await Ga()}}async function Ga(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await l.posterStats();Ar(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${za(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",Ga),o(t.message||"Failed to load poster statistics.","error")}}function Ar(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=Tt(t.wallet_balance),n=Tt(t.frozen_balance),i=Tt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${je("bi-briefcase","Total jobs",a.total||0)}
            ${je("bi-lightning-charge","Active jobs",s)}
            ${je("bi-wallet2","Available wallet",r,"\u09F3")}
            ${je("bi-lock","In escrow",n,"\u09F3")}
        </div>

        <div class="poster-dashboard-grid">
            <div class="card">
                <div class="card__header">
                    <div>
                        <h2 class="card__title">Job pipeline</h2>
                        <p class="muted">See where your posted jobs are in the workflow.</p>
                    </div>
                    <a class="btn btn--ghost btn--sm" href="#/poster/jobs" data-poster-link="jobs">Manage jobs</a>
                </div>
                <div class="poster-status-list">
                    ${K("open",a.open)}
                    ${K("in_review",a.in_review)}
                    ${K("assigned",a.assigned)}
                    ${K("submitted",a.submitted)}
                    ${K("revision",a.revision)}
                    ${K("completed",a.completed)}
                </div>
            </div>

            <div class="card poster-wallet-card">
                <div class="card__header">
                    <div>
                        <h2 class="card__title">Poster wallet</h2>
                        <p class="muted">Funds available for new jobs and active escrow.</p>
                    </div>
                    <i class="bi bi-cash-stack poster-card-icon"></i>
                </div>
                <div class="poster-wallet-total">\u09F3${r}</div>
                <div class="poster-wallet-lines">
                    <div><span class="muted">Frozen in escrow</span><strong>\u09F3${n}</strong></div>
                    <div><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div>
                </div>
                <a class="btn btn--secondary btn--xl" href="#/poster/wallet" data-poster-link="wallet">View wallet</a>
            </div>
        </div>

        <div class="card poster-dashboard-actions">
            <div>
                <h2 class="card__title">Ready to get started?</h2>
                <p class="muted">Create a clear brief and let workers send you proposals.</p>
            </div>
            <a class="btn btn--primary" href="#/poster/post-job" data-poster-link="post">Post your first job</a>
        </div>
    `,e.querySelectorAll("[data-poster-link]").forEach(c=>{c.addEventListener("click",u=>{u.preventDefault(),b(c.getAttribute("href").replace(/^#/,""))})})}function je(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${za(String(a))}</strong>
        </div>
    `}function K(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Cr(e)}"></i> ${Er[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Cr(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function Tt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function za(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Er,Lt=v(()=>{y();g();Er={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var Xa={};w(Xa,{PostJobPage:()=>xt});function xt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--post-job",!Nr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <a href="#/poster" class="back-link"><i class="bi bi-arrow-left"></i> Poster dashboard</a>
            <h1 class="page-title">Post a Job</h1>
            <p class="muted">Write a clear brief so workers can send useful proposals.</p>
            <div class="card">
                <form id="post-job-form" class="poster-form">
                    <label>Job title
                        <input name="title" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo">
                    </label>
                    <label>Category
                        <select name="category_id" id="post-job-category" required><option value="">Loading categories\u2026</option></select>
                    </label>
                    <label>Description
                        <textarea name="description" rows="6" required placeholder="Explain the outcome, scope, and what success looks like."></textarea>
                    </label>
                    <label>Requirements (optional)
                        <textarea name="requirements" rows="4" placeholder="Mention preferred tools, formats, experience, or constraints."></textarea>
                    </label>
                    <div class="poster-form__grid">
                        <label>Budget (\u09F3)
                            <input name="budget" type="number" min="1" step="0.01" required placeholder="100.00">
                        </label>
                        <label>Bidding window
                            <select name="bidding_window_hours">
                                <option value="24">24 hours</option>
                                <option value="72" selected>3 days</option>
                                <option value="168">7 days</option>
                                <option value="336">14 days</option>
                            </select>
                        </label>
                    </div>
                    <label>Deadline (optional)
                        <input name="deadline_at" type="datetime-local">
                    </label>
                    <div class="poster-form__actions">
                        <button type="button" class="btn btn--ghost" id="post-job-cancel">Cancel</button>
                        <button type="submit" class="btn btn--primary btn--xl" id="post-job-submit">Publish job</button>
                    </div>
                </form>
            </div>
        `,e.querySelector("#post-job-cancel").addEventListener("click",()=>b("/poster")),await jr(e),Mr(e)}}}async function jr(e){let t=e.querySelector("#post-job-category");try{let s=(await l.categories()).data||[];t.innerHTML=s.length?'<option value="">Choose a category\u2026</option>'+s.map(r=>`<option value="${Number(r.id)}">${Pr(r.name)}</option>`).join(""):'<option value="">No active categories</option>'}catch(a){t.innerHTML='<option value="">Unable to load categories</option>',o(a.message||"Could not load categories.","error")}}function Mr(e){let t=e.querySelector("#post-job-form");t.addEventListener("submit",async a=>{a.preventDefault();let s=new FormData(t),r=e.querySelector("#post-job-submit");r.disabled=!0,r.textContent="Publishing\u2026";try{await l.posterCreateJob({category_id:Number(s.get("category_id")),title:String(s.get("title")||"").trim(),description:String(s.get("description")||"").trim(),requirements:String(s.get("requirements")||"").trim()||null,budget:Number(s.get("budget")),deadline_at:qr(s.get("deadline_at")),bidding_window_hours:Number(s.get("bidding_window_hours"))}),o("Job published successfully.","success"),b("/poster/jobs")}catch(n){o(n.message||"Could not publish job.","error")}finally{r.disabled=!1,r.textContent="Publish job"}})}function qr(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function Nr(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function Pr(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Et=v(()=>{y();g()});var Ka={};w(Ka,{PosterJobsPage:()=>At});function At(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!Ir()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${Hr.map(t=>`<option value="${t}" ${t===qe?"selected":""}>${t?Ya(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),b("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{qe=t.target.value,await Me()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",Me),await Me()}}}async function Me(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await l.posterMyJobs()).data||[]).filter(s=>!qe||s.status===qe);e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(Fr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${Z(t.message||"unknown error")}</p>`}}}function Fr(e){let t=document.createElement("article");return t.className=`admin-row poster-job-row poster-job-row--${Z(e.status)}`,t.innerHTML=`
        <div class="poster-job-row__header">
            <div><strong>${Z(e.title)}</strong><span class="badge">${Z(Ya(e.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${Z(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${Z(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(e.bid_count||0)}</span><span><strong>Views:</strong> ${Number(e.view_count||0)}</span><span><strong>Created:</strong> ${Rr(e.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${["completed","cancelled"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>b(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>Br(e.id)),t}async function Br(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await l.posterCancelJob(e,{reason:t}),o("Job cancelled.","success"),await Me()}catch(a){o(a.message||"Could not cancel job.","error")}}function Ir(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function Ya(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Rr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Z(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Hr,qe,Ct=v(()=>{y();g();Hr=["","open","assigned","submitted","revision","completed","cancelled","disputed"],qe=""});var Za={};w(Za,{PosterWalletPage:()=>Mt});function Mt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([l.posterStats(),l.paymentSubmissions()]);Dr(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Ne(a.message||"unknown error")}</p>`}}}function Dr(e,t,a){let s=jt(t.wallet_balance),r=jt(t.frozen_balance),n=jt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${n}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${Ur(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>b("/deposit"))}function Ur(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Ne((t.gateway||"").toUpperCase())}</strong><small>${Ne(t.trxid)} \xB7 ${Or(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Ne(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function jt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function Or(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Ne(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var qt=v(()=>{y();g()});var ts={};w(ts,{AdminPage:()=>Pt});function Pt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="payments">Payments</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading\u2026</div>
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(r=>{r.addEventListener("click",()=>{a.forEach(n=>n.classList.remove("admin-tab--active")),r.classList.add("admin-tab--active"),Qa(r.dataset.tab,s)})}),Qa("stats",s)}}async function Qa(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([l.adminStats(),l.adminRevenue()]),r=a.data||{},n=s.data||{},i=n.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${J("bi-graph-up-arrow","Platform revenue",Nt(n.platform_revenue,i))}
                    ${J("bi-percent","Commission rate",`${(Number(n.commission_rate||0)*100).toFixed(2)}%`)}
                    ${J("bi-briefcase","Total jobs",W(n.total_jobs))}
                    ${J("bi-check2-circle","Completed jobs",W(n.completed_jobs))}
                    ${J("bi-lightning-charge","Active jobs",W(n.active_jobs))}
                    ${J("bi-people","Total users",W(n.total_users))}
                    ${J("bi-hourglass-split","Pending deposits",W(n.pending_payments))}
                    ${J("bi-lock","Held in escrow",Nt(n.escrow_total,i))}
                </div>
                <div class="card admin-operations-card">
                    <div class="card__header">
                        <div>
                            <h3 class="card__title">Operations overview</h3>
                            <p class="muted">Legacy earning activity alongside marketplace finance.</p>
                        </div>
                        <a class="btn btn--ghost btn--sm" href="#/admin/transactions">View ledger</a>
                    </div>
                    <div class="admin-operations-grid">
                        <div><span class="muted">Withdrawals</span><strong>${W(r.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${W(r.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${W(r.total_ad_views)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${Nt(r.total_lifetime_paid,i)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${L(n.currency||"BDT")}</strong> currency \xB7 <strong>${L(n.escrow_mode||"full_bid")}</strong> escrow</div>
                </div>
            `}else if(e==="withdrawals"){let s=(await l.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let r=t.querySelector("#wd-list");s.forEach(n=>r.appendChild(es(n,r))),t.querySelector("#wd-filter").addEventListener("change",async n=>{let i=await l.adminWithdrawals(n.target.value);r.innerHTML="",(i.data||[]).forEach(c=>r.appendChild(es(c,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await l.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),n=Number(m.get()?.id||0);s.forEach(i=>{let c=document.createElement("div");c.className="admin-row",c.innerHTML=`
                    <div>
                        <strong>${L(i.name)}</strong>
                        <span class="muted">${L(i.email)}</span>
                        <span class="badge user-role-badge">${L(i.role||(i.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(i.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(i.lifetime_earned||0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(i.id)===n?"disabled":""}>
                                ${["worker","poster","admin"].map(f=>`<option value="${f}" ${(i.role||(i.is_admin?"admin":"worker"))===f?"selected":""}>${f[0].toUpperCase()+f.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let u=c.querySelector(".admin-user-role");u?.addEventListener("change",async()=>{let f=i.role||(i.is_admin?"admin":"worker");try{let h=await l.adminUpdateUserRole(i.id,u.value);i.role=h.data?.role||u.value,i.is_admin=!!h.data?.is_admin,c.querySelector(".user-role-badge").textContent=i.role.toUpperCase(),o("User role updated","success")}catch(h){u.value=f,o(h.message||"Role update failed","error")}}),r.appendChild(c)})}else if(e==="providers"){let s=(await l.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(n=>r.appendChild(Jr(n,r)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function J(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${L(t)}</span>
            <strong>${L(String(a))}</strong>
        </div>
    `}function W(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Nt(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function es(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${L(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${L(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${L(e.gateway)} \xB7 ${L(e.wallet_address)}</div>
        <div class="admin-row__status">${L(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await l.adminApprove(e.id,{admin_note:"Approved by admin"}),o("Withdrawal approved","success"),a.remove()}catch(i){o(i.message,"error")}});let n=document.createElement("button");n.className="btn btn--danger btn--sm",n.textContent="Reject",n.addEventListener("click",async()=>{let i=prompt("Reason for rejection (optional):","Invalid wallet address");try{await l.adminReject(e.id,{admin_note:i||""}),o("Withdrawal rejected (refunded)","info"),a.remove()}catch(c){o(c.message,"error")}}),s.appendChild(r),s.appendChild(n),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await l.adminPay(e.id,{admin_note:"Paid by admin"}),o("Marked as paid","success"),a.remove()}catch(n){o(n.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function Jr(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${L(e.name)}</strong>
            <span class="muted">${L(e.slug)}</span>
            ${s?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${L(r)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${s?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let n={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await l.adminUpdateProvider(e.id,n),o("Provider saved","success")}catch(i){o(i.message,"error")}}),a}function L(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ht=v(()=>{y();g();g()});var rs={};w(rs,{AdminPaymentsPage:()=>Bt});function Bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${R.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${R.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${R.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${R.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{R.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),Ft()})}),await Ft()}}async function Ft(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await l.adminPayments(R.status);R.items=t.data||[],Gr(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${V(t.message||"Failed to load.")}</p>`}}}function Gr(e){if(R.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",R.items.forEach(t=>e.appendChild(zr(t)))}function zr(e){let t=Wr[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${V((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${V(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${V(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${V(e.user.name)} <span class="muted">(${V(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${ss(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${ss(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${V(e.admin_note)}</div>`:""}
        </div>
        ${e.status==="pending"?`
        <div class="admin-row__actions">
            <button class="btn btn--success btn--sm" data-action="approve">
                <i class="bi bi-check-circle"></i> Approve
            </button>
            <button class="btn btn--danger btn--sm" data-action="reject">
                <i class="bi bi-x-circle"></i> Reject
            </button>
        </div>`:""}
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>as(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>as(e.id,"reject",a))),a}async function as(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let n=await(t==="approve"?l.adminApprovePayment:l.adminRejectPayment)(e,{note:s||null});o(n.message||"Done.","success"),await Ft()}catch(r){o(r.message||"Action failed.","error")}}function ss(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function V(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Wr,R,It=v(()=>{y();g();Wr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},R={status:"pending",items:[],loading:!1}});var is={};w(is,{AdminJobsPage:()=>Ut});function Ut(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-jobs",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${Vr.map(t=>`<option value="${t}" ${t===Dt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-job-status").addEventListener("change",async t=>{Dt=t.target.value,await le()}),e.querySelector("#admin-job-refresh").addEventListener("click",le),await le()}}}async function le(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await l.adminJobs(Dt)).data||[];e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(Xr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${P(t.message||"unknown error")}</p>`}}}function Xr(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${P(e.status)}`;let a=e.worker?`${P(e.worker.name)} <span class="muted">(${P(e.worker.email||"")})</span>`:'<span class="muted">Unassigned</span>';t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${P(e.title)}</strong>
                <span class="badge">${P(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${P(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="admin-job-row__description muted">${P(e.description||"")}</p>
        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${P(e.poster?.name||"(deleted)")}</span>
            <span><strong>Worker:</strong> ${a}</span>
            <span><strong>Category:</strong> ${P(e.category_name||"Uncategorized")}</span>
            <span><strong>Bids:</strong> ${Number(e.bid_count||0).toLocaleString()} \xB7 <strong>Views:</strong> ${Number(e.view_count||0).toLocaleString()}</span>
        </div>
        <div class="admin-job-row__footer">
            <span class="muted">Updated ${Kr(e.updated_at||e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let s=t.querySelector(".admin-row__actions");return["completed","cancelled","disputed"].includes(e.status)||s.appendChild(Rt("Mark disputed","btn--danger",()=>Yr(e.id))),e.status==="disputed"&&(s.appendChild(Rt("Release payment","btn--success",()=>ns(e.id,"release"))),s.appendChild(Rt("Cancel and refund","btn--danger",()=>ns(e.id,"cancel")))),t}function Rt(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function Yr(e){if(confirm("Flag this job for admin dispute review?"))try{await l.adminFlagJobDispute(e),o("Job flagged for dispute review.","success"),await le()}catch(t){o(t.message||"Could not flag job.","error")}}async function ns(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await l.adminResolveJob(e,{resolution:t,reason:s}),o(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await le()}catch(r){o(r.message||"Could not resolve dispute.","error")}}function Kr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function P(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Vr,Dt,Ot=v(()=>{y();g();Vr=["","open","in_review","assigned","submitted","revision","disputed","completed","cancelled","expired"],Dt=""});var os={};w(os,{AdminTransactionsPage:()=>Gt});function Gt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${Zr.map(t=>`<option value="${t}" ${t===Wt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{Wt=t.target.value,await Jt()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",Jt),await Jt()}}}async function Jt(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await l.adminTransactions({type:Wt})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(Qr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${D(t.message||"unknown error")}</p>`}}}function Qr(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${D(e.type)}`,t.innerHTML=`
        <div class="admin-transaction-row__header">
            <div>
                <strong>${D(String(e.type||"").replace("_"," ").toUpperCase())}</strong>
                <span class="badge">#${Number(e.id||0)}</span>
            </div>
            <strong class="admin-row__amount">${D(e.currency||"BDT")} ${Number(e.amount||0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${D(e.user_name||"Platform")} ${e.user_email?`<span class="muted">(${D(e.user_email)})</span>`:""}</span>
            <span><strong>Job:</strong> ${D(e.job_title||(e.job_id?`#${e.job_id}`:"\u2014"))}</span>
            <span><strong>Date:</strong> ${en(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${D(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${D(e.reference)}</code>`:""}
    `,t}function en(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function D(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Zr,Wt,zt=v(()=>{y();g();Zr=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],Wt=""});var ls={};w(ls,{AdminReportsPage:()=>Vt});function Vt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Reports</h1>
            <p class="muted">Aggregated transaction volume and marketplace job value by status.</p>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,await tn()}}}async function tn(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await l.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${Pe("Transactions",He(s.transaction_count))}
                ${Pe("Transaction volume",Fe(s.transaction_volume))}
                ${Pe("Jobs",He(s.job_count))}
                ${Pe("Job value",Fe(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${an(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${sn(a.jobs||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${ce(t.message||"unknown error")}</p>`}}function Pe(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${ce(e)}</span><strong>${ce(t)}</strong></div>`}function an(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ce(String(t.type||"").replace("_"," "))}</strong><small>${He(t.transaction_count)} entries</small></span>
            <strong>${Fe(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function sn(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ce(String(t.status||"").replace("_"," "))}</strong><small>${He(t.job_count)} jobs</small></span>
            <strong>${Fe(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function He(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Fe(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function ce(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Xt=v(()=>{y();g()});var cs={};w(cs,{LoginPage:()=>Yt});function Yt(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} EarnApp</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${rn(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Logging in\u2026";try{await _a(r.get("email"),r.get("password")),o("Welcome back!","success"),b("/")}catch(i){o(i.message||"Login failed","error"),n.disabled=!1,n.textContent="Log in"}})}function rn(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Kt=v(()=>{g()});var ds={};w(ds,{RegisterPage:()=>Zt});function Zt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.EARNAPP_CONFIG&&window.EARNAPP_CONFIG.referralCode||"";e.innerHTML=`
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
        `;let a=e.querySelector("#register-form");a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Creating\u2026";try{let i={name:r.get("name"),email:r.get("email"),password:r.get("password")};t&&(i.referral_code=t),await $a(i),o("Account created \u2014 welcome!","success"),b("/")}catch(i){let c=i.payload&&i.payload.errors;if(c){let u=Object.values(c)[0];o(Array.isArray(u)?u[0]:u,"error")}else o(i.message||"Registration failed","error");n.disabled=!1,n.textContent="Create account"}})}}var Qt=v(()=>{g();g()});var Ps={};w(Ps,{JobDetailPage:()=>li});function li(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=m.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await l.job(e),{job:r,bids:n,bid_count:i,my_bid:c}=s.data;ci(r,n,i,c,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${G(s.message||"unknown")}</p>`}}}function ci(e,t,a,s,r){let n=document.getElementById("job-detail-content");if(!n)return;let i=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,c=i?Math.max(0,Math.floor((i-Date.now())/1e3)):null,u=c!=null?ui(c):"\u2014",f=["open","in_review"].includes(e.status),h=!!s;n.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${G(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${G(e.title)}</h1>
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Budget <strong>\u09F3${parseFloat(e.budget).toFixed(2)}</strong></span>
                        <span><i class="bi bi-people"></i> ${a} bid${a===1?"":"s"}</span>
                        <span><i class="bi bi-eye"></i> ${e.view_count} view${e.view_count===1?"":"s"}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${u}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${e.status}">${e.status.replace("_"," ").toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${G(e.description).replace(/\n/g,"<br>")}</p>
                ${e.requirements?`<h3>Requirements</h3><p>${G(e.requirements).replace(/\n/g,"<br>")}</p>`:""}
                <h3>Posted by</h3>
                <p>${e.poster?G(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${di(e,t,s,r,f)}
    `,pi(e,s,r)}function di(e,t,a,s,r){return a?`
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${a.status}">
                    <div>
                        <strong>\u09F3${parseFloat(a.amount).toFixed(2)}</strong> in <strong>${a.delivery_days} day${a.delivery_days===1?"":"s"}</strong>
                        <div class="muted">${G(a.proposal)}</div>
                    </div>
                    <span class="badge badge--status badge--${a.status}">${a.status.toUpperCase()}</span>
                </div>
                ${a.status==="pending"?'<button class="btn btn--ghost btn--sm" id="withdraw-bid-btn">Withdraw bid</button>':""}
            </div>
        `:r?s?`
        <div class="card">
            <h3 class="card__title">Place a Bid</h3>
            <form id="bid-form" class="bid-form">
                <label class="bid-form__label">
                    Your bid amount (\u09F3)
                    <input name="amount" type="number" min="1" step="0.01" required>
                </label>
                <label class="bid-form__label">
                    Delivery time (days)
                    <input name="delivery_days" type="number" min="1" max="365" value="7" required>
                </label>
                <label class="bid-form__label">
                    Proposal (why you're a good fit)
                    <textarea name="proposal" rows="4" required placeholder="Describe your experience, approach, timeline\u2026"></textarea>
                </label>
                <button type="submit" class="btn btn--primary btn--xl" id="bid-submit-btn">Submit Bid</button>
            </form>
        </div>
        <div class="card">
            <h3 class="card__title">Other Bids (${t.length})</h3>
            ${t.length===0?'<p class="muted">No bids yet. Be the first!</p>':`
                <div class="bid-list">
                    ${t.map(n=>`
                        <div class="bid-row">
                            <div>
                                <strong>\u09F3${parseFloat(n.amount).toFixed(2)}</strong> \xB7 ${n.delivery_days} days
                                <div class="muted">${G(n.proposal).slice(0,100)}${n.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${n.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function pi(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await l.withdrawBid(t.id),o("Bid withdrawn.","success"),b(`/jobs/${e.id}`)}catch(n){o(n.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let n=new FormData(s),i=document.getElementById("bid-submit-btn");i.disabled=!0,i.textContent="Submitting\u2026";try{await l.placeBid(e.id,{amount:parseFloat(n.get("amount")),delivery_days:parseInt(n.get("delivery_days"),10),proposal:String(n.get("proposal")||"").trim()}),o("Bid placed!","success"),b(`/jobs/${e.id}`)}catch(c){o(c.message||"Failed to place bid.","error")}finally{i.disabled=!1,i.textContent="Submit Bid"}})}function ui(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function G(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Hs=v(()=>{y();g()});var Is={};w(Is,{PosterJobDetailPage:()=>mi});function mi(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!_i()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await Fs(e)}}}async function Fs(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await l.posterJobBids(e)).data||{};bi(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${T(a.message||"unknown error")}</p>`}}function bi(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${T(t.title)}</h1><p class="muted">${T(t.description||"")}</p></div><span class="badge badge--status badge--${T(t.status)}">${T($i(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${Bs(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${gi(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${vi(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>fi(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>hi(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>yi(t.id,r.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>wi(t.id))}function gi(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${T(a.status)}"><div class="poster-bid-row__main"><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">${T(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${T(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${T(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function vi(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${T(a.status)}"><div><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${Bs(a.created_at)} \xB7 ${T(String(a.status||"").replace("_"," "))}</span><p>${T(a.description||"")}</p>${a.external_link?`<a href="${T(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${T(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function fi(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await l.posterAcceptBid(e,t),o("Worker selected and escrow held.","success"),await na(e)}catch(a){o(a.message||"Could not select worker.","error")}}async function hi(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await l.posterReleasePayment(e,{submission_id:Number(t)}),o("Payment released.","success"),await na(e)}catch(a){o(a.message||"Could not release payment.","error")}}async function yi(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await l.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),o("Revision requested.","success"),await na(e)}catch(s){o(s.message||"Could not request revision.","error")}}async function wi(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await l.posterCancelJob(e,{reason:"Cancelled by poster"}),o("Job cancelled.","success"),b("/poster/jobs")}catch(t){o(t.message||"Could not cancel job.","error")}}async function na(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await Fs(e))}function _i(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function $i(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Bs(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function T(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Rs=v(()=>{y();g()});M();g();M();g();var Be=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(st(),Sa))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),rt))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),rt))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(nt(),ka))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ot(),xa))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ct(),Ea))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pt(),ja))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Se(),mt))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(bt(),Ma))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(gt(),qa))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(vt(),Na))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(wt(),Ua))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>($t(),Ja))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Se(),mt))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(St(),Wa))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Lt(),Va))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Et(),Xa))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ct(),Ka))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(qt(),Za))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ht(),ts))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(It(),rs))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ot(),is))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(zt(),os))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Xt(),ls))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Kt(),cs))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Qt(),ds))}],xl=$(()=>{let e=A.get();return Be.find(t=>t.path===e)||Be[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";A.set(e)});M();g();M();var nn=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],on=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],ln=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function cn(){let e=m.get(),t=[...nn];return e&&(e.role==="poster"||e.is_admin)&&t.push({separator:!0},...ln),e&&e.is_admin?[...t,{separator:!0},...on]:t}var ps="sidebar_collapsed",X=E(localStorage.getItem(ps)==="true");function dn(){let e=!X.get();X.set(e),localStorage.setItem(ps,String(e))}function us(){return{tag:"aside",props:{class:()=>`sidebar ${X.get()?"sidebar--collapsed":""}`,id:"sidebar"},children:[pn(),un(),mn()]}}function pn(){return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"span",props:{},children:["JM"]},{tag:"span",props:{class:()=>(X.get(),"")},children:["JOB"]}]}}function un(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>dn(),title:()=>X.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${X.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function mn(){return{tag:"nav",props:{class:"sidebar__nav"},children:cn().map(e=>e.separator?bn():gn(e))}}function bn(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function gn({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${A.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>X.get()?t:"",onclick:r=>{r.preventDefault(),b(e),bs()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function ms(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>bs()},children:[]}}function bs(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}g();M();g();var vn=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],fn=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],hn=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function yn(){let e=m.get(),t=[...vn];return e&&(e.role==="poster"||e.is_admin)&&t.push({separator:!0},...hn),e&&e.is_admin?[...t,{separator:!0},...fn]:t}function wn({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${A.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),b(e),ea()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function _n(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>ea()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function $n(){return{tag:"nav",props:{class:"mobile-nav__list"},children:yn().map(e=>e.separator?Sn():wn(e))}}function Sn(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function gs(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[_n(),$n()]}}function vs(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>ea()},children:[]}}function fs(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function ea(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}yt();y();function hs(){return N(()=>x.get(),()=>Cn(),()=>An())}function ys(){let e=()=>q.get()==="dark";return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:e()?"Switch to light mode":"Switch to dark mode",onclick:()=>Ha(),"data-theme":()=>q.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function Tn(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function kn(){return setTimeout(Ln,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),Tn()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[En("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function Ln(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await l.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],r=Number(a.meta?.unread_count||s.filter(n=>!n.read).length||0);t.textContent=r>99?"99+":String(r),e.innerHTML=s.length?s.map(xn).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(n=>{n.addEventListener("click",async()=>{let i=n.getAttribute("data-notification-id");if(!(!i||n.getAttribute("data-read")==="1"))try{await l.notificationRead(i),n.setAttribute("data-read","1"),n.classList.remove("topbar-notification--unread");let c=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(c)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function xn(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${Ie(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${Ie(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${Ie(t.title||"Notification")}</div><div class="topbar-notification__text">${Ie(t.message||"")}</div>${r?`<a class="topbar-notification__action"${r}>Open</a>`:""}</div></li>`}function Ie(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function En(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function An(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[ys(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Cn(){let e=m.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>fs(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[ys(),kn(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await he(),o("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}g();M();function ws(){return N(()=>!!se.get(),()=>{let e=se.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}function _s(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer"},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}g();var jn=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg"},{path:"/webtask",label:"Tasks",icon:"bi-telegram"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/notifications",label:"Alerts",icon:"bi-bell"},{path:"/refer",label:"Referral",icon:"bi-gift-fill"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box"},{path:"/leaderboard",label:"Leaders",icon:"bi-bar-chart-line-fill"},{path:"/achievements",label:"Awards",icon:"bi-award-fill"},{path:"/support",label:"Support",icon:"bi-headset"},{path:"/settings",label:"Settings",icon:"bi-gear-fill"}],Mn=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}],qn=[{path:"/poster",label:"Poster",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Wallet",icon:"bi-wallet2"}];function Nn(){let e=m.get(),t=[...jn];return e&&(e.role==="poster"||e.is_admin)&&t.push({separator:!0},...qn),e&&e.is_admin?[...t,{separator:!0},...Mn]:t}function Pn({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${A.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),b(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function Hn(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function Fn(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:Nn().map(e=>e.separator?Hn():Pn(e))}}function $s(e){let t=e==="left";return{tag:"button",props:{class:`hnav__scroll hnav__scroll--${e}`,id:`hnav-scroll-${e}`,type:"button","aria-label":t?"Scroll left":"Scroll right",onclick:a=>{a.preventDefault(),Bn(t?-1:1)}},children:[{tag:"i",props:{class:`bi ${t?"bi-chevron-left":"bi-chevron-right"}`},children:[]}]}}function Bn(e){let t=document.getElementById("hnav-list");if(!t)return;let a=Math.max(120,Math.round(t.clientWidth*.7));t.scrollBy({left:e*a,behavior:"smooth"})}function ta(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&ta()},!0),window.addEventListener("resize",()=>setTimeout(ta,50)),document.addEventListener("hnav:rendered",()=>setTimeout(ta,0)));function Ss(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[$s("left"),Fn(),$s("right")]}}function ks(){return{tag:"div",props:{class:"app-shell"},children:[N(()=>x.get(),()=>us(),()=>null),N(()=>x.get(),()=>ms(),()=>null),N(()=>x.get(),()=>gs(),()=>null),N(()=>x.get(),()=>vs(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[hs(),N(()=>x.get(),()=>Ss(),()=>null),{tag:"main",props:{class:"app-main"},children:[In()]},_s()]},ws()]}}function In(){let e=A.get(),t=Be.find(a=>a.path===e);return t?t.requireAuth&&!x.get()?(b("/login"),Ts()):t.requireAdmin&&(!m.get()||!m.get().is_admin)?Un():!t.requireAuth&&x.get()&&["/login","/register"].includes(e)?(b("/"),Ts()):Rn(t):Dn()}function Rn(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function Dn(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function Un(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function Ts(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}M();g();st();Kt();Qt();ot();ye();nt();St();ct();Se();Ht();It();pt();bt();gt();vt();wt();y();g();var d={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function xs(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
            <h1 class="page-title">Browse Jobs</h1>
            <p class="muted">Find work that matches your skills. Place a bid to get started.</p>

            <div class="card jobs-filters">
                <div class="jobs-filters__row">
                    <label class="jobs-filters__field jobs-filters__field--search">
                        <span>Search</span>
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${H(d.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${Ls()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="\u09F30" value="${H(d.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${H(d.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${d.sort==="latest"?"selected":""}>Newest first</option>
                            <option value="budget_low" ${d.sort==="budget_low"?"selected":""}>Lowest budget</option>
                            <option value="budget_high" ${d.sort==="budget_high"?"selected":""}>Highest budget</option>
                            <option value="closing" ${d.sort==="closing"?"selected":""}>Closing soon</option>
                        </select>
                    </label>
                    <div class="jobs-filters__actions">
                        <button class="btn btn--primary" id="jobs-apply">Apply filters</button>
                        <button class="btn btn--secondary" id="jobs-reset" type="button">Reset</button>
                    </div>
                </div>
            </div>

            <div class="jobs-results-meta muted" id="jobs-results-meta"></div>
            <div class="jobs-grid" id="jobs-grid">
                <div class="spinner"></div>
            </div>
            <nav class="jobs-pagination" id="jobs-pagination" aria-label="Job pages"></nav>
        `,d.categories.length===0)try{let t=await l.categories();d.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=Ls())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{On(),d.page=1,Re()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{d.search="",d.categoryId="",d.minBudget="",d.maxBudget="",d.sort="latest",d.page=1,Jn(),Re()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await Re()}}}function Ls(){return'<option value="">All categories</option>'+d.categories.map(e=>`<option value="${H(e.id)}" ${String(e.id)===String(d.categoryId)?"selected":""}>${H(e.name)}</option>`).join("")}function On(){d.search=document.getElementById("jobs-search")?.value.trim()||"",d.categoryId=document.getElementById("jobs-category")?.value||"",d.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",d.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",d.sort=document.getElementById("jobs-sort")?.value||"latest"}function Jn(){let e={"jobs-search":d.search,"jobs-category":d.categoryId,"jobs-min-budget":d.minBudget,"jobs-max-budget":d.maxBudget,"jobs-sort":d.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function Re(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++d.requestSerial;d.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:d.page,per_page:d.perPage,sort:d.sort};d.search&&(a.search=d.search),d.categoryId&&(a.category_id=d.categoryId),d.minBudget!==""&&(a.min_budget=d.minBudget),d.maxBudget!==""&&(a.max_budget=d.maxBudget);let s=await l.jobs(a);if(t!==d.requestSerial)return;d.jobs=Array.isArray(s.data)?s.data:[],d.total=Number(s.meta?.total||0),d.lastPage=Math.max(1,Number(s.meta?.last_page||1)),Wn()}catch(a){if(t!==d.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${H(a.message||"unknown error")}</p>`,Es(),As()}finally{t===d.requestSerial&&(d.loading=!1)}}function Wn(){let e=document.getElementById("jobs-grid");if(e){if(Es(),As(),d.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=d.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${H(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${Gn(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${H(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${H(t.title)}</h3>
            <p class="job-card__desc">${H(zn(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.budget||0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.bid_count||0)} bid${Number(t.bid_count)===1?"":"s"}</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function Es(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(d.total===0){e.textContent="No open jobs found";return}let t=(d.page-1)*d.perPage+1,a=Math.min(d.page*d.perPage,d.total);e.textContent=`Showing ${t}-${a} of ${d.total} open jobs`}function As(){let e=document.getElementById("jobs-pagination");if(e){if(d.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${d.page-1}" ${d.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${d.page} of ${d.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${d.page+1}" ${d.page>=d.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>d.lastPage||a===d.page||(d.page=a,Re())})})}}function Gn(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function zn(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function H(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();g();var aa={bids:[],loading:!1};function Cs(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await l.workerBids();aa.bids=t.data||[],Vn()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${js(t.message||"unknown")}</p>`}}}}function Vn(){let e=document.getElementById("bids-list");if(e){if(aa.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=aa.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${js(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${Xn(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function Xn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function js(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();g();var de={jobs:[],submissions:[],loading:!1};function sa(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([l.workerActiveJobs(),l.workerSubmissions()]);de.jobs=t.data||[],de.submissions=a.data||[],Yn()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${ra(t.message||"unknown")}</p>`}}}}function Yn(){let e=document.getElementById("active-jobs-list");if(e){if(de.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=de.jobs.map(t=>{let a=de.submissions.find(r=>r.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${ra(t.title)}</h3>
                        <div class="muted">Budget: \u09F3${parseFloat(t.budget).toFixed(2)}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?Kn(t,a):Zn(t)}
            </div>
        `}).join(""),Qn()}}function Kn(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${ei(t.created_at)}
            <div class="muted">${ra((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function Zn(e){return`
        <form class="submit-form" data-job-id="${e.id}">
            <label class="submit-form__label">
                What did you deliver? (description)
                <textarea name="description" rows="3" required placeholder="Summarize what you delivered\u2026"></textarea>
            </label>
            <label class="submit-form__label">
                External link (optional \u2014 Google Drive, GitHub, Figma, etc.)
                <input name="external_link" type="url" placeholder="https://\u2026">
            </label>
            <button type="submit" class="btn btn--success btn--xl" data-submit-btn>
                <i class="bi bi-send"></i> Submit Work
            </button>
        </form>
    `}function Qn(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),r=e.querySelector("[data-submit-btn]");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await l.submitWork(a,{description:String(s.get("description")||"").trim(),external_link:String(s.get("external_link")||"").trim()||null}),o("Work submitted!","success"),sa()()}catch(n){o(n.message||"Failed to submit.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Work'}})})}function ei(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function ra(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();g();var De={categories:[],loading:!1};function Ms(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Categories</h1>
            <p class="muted">Manage job categories. Inactive categories stay attached to old jobs but disappear from the post-job dropdown.</p>
            <div class="card" id="cat-list"><div class="spinner"></div></div>
            <div class="card" id="cat-form-card" style="margin-top: 16px;">
                <h3 class="card__title">Add new category</h3>
                <form id="cat-form" class="cat-form">
                    <label class="cat-form__label">
                        Name
                        <input name="name" type="text" required maxlength="80" placeholder="e.g. SEO Writing">
                    </label>
                    <label class="cat-form__label">
                        Slug (URL-safe, lowercase, hyphenated)
                        <input name="slug" type="text" required maxlength="80" placeholder="seo-writing">
                    </label>
                    <label class="cat-form__label">
                        Description
                        <input name="description" type="text" maxlength="255" placeholder="Short description">
                    </label>
                    <label class="cat-form__label">
                        Icon class (Bootstrap Icons)
                        <input name="icon_class" type="text" maxlength="80" placeholder="bi-pencil">
                    </label>
                    <label class="cat-form__label">
                        Display order
                        <input name="display_order" type="number" value="0">
                    </label>
                    <label class="cat-form__label cat-form__label--checkbox">
                        <input name="is_active" type="checkbox" checked> Active
                    </label>
                    <button type="submit" class="btn btn--primary" id="cat-save-btn">Create Category</button>
                </form>
            </div>
        `,ai(),await Ue()}}async function Ue(){let e=document.getElementById("cat-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await l.adminCategories();De.categories=t.data||[],ti()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${pe(t.message||"unknown")}</p>`}}}function ti(){let e=document.getElementById("cat-list");if(e){if(De.categories.length===0){e.innerHTML='<p class="muted">No categories yet. Add one below.</p>';return}e.innerHTML=De.categories.map(t=>`
        <div class="cat-row" data-id="${t.id}">
            <div class="cat-row__icon"><i class="bi ${pe(t.icon_class||"bi-tag")}"></i></div>
            <div class="cat-row__main">
                <div class="cat-row__name">${pe(t.name)} ${t.is_active?"":'<span class="badge">INACTIVE</span>'}</div>
                <div class="cat-row__slug muted">/${pe(t.slug)}</div>
                <div class="cat-row__desc muted">${pe(t.description||"")}</div>
            </div>
            <div class="cat-row__actions">
                <button class="btn btn--ghost btn--sm" data-toggle="${t.id}">${t.is_active?"Disable":"Enable"}</button>
                <button class="btn btn--danger btn--sm" data-delete="${t.id}">Delete</button>
            </div>
        </div>
    `).join(""),e.querySelectorAll("[data-toggle]").forEach(t=>t.addEventListener("click",()=>si(t.getAttribute("data-toggle")))),e.querySelectorAll("[data-delete]").forEach(t=>t.addEventListener("click",()=>ri(t.getAttribute("data-delete"))))}}function ai(){let e=document.getElementById("cat-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();let a=new FormData(e),s={name:String(a.get("name")||"").trim(),slug:String(a.get("slug")||"").trim().toLowerCase(),description:String(a.get("description")||"").trim()||null,icon_class:String(a.get("icon_class")||"").trim()||null,display_order:parseInt(a.get("display_order")||"0",10),is_active:a.get("is_active")==="on"},r=document.getElementById("cat-save-btn");r.disabled=!0,r.textContent="Creating\u2026";try{await l.adminCreateCategory(s),o("Category created.","success"),e.reset(),await Ue()}catch(n){o(n.message||"Failed.","error")}finally{r.disabled=!1,r.textContent="Create Category"}})}async function si(e){let t=De.categories.find(a=>String(a.id)===String(e));if(t)try{await l.adminUpdateCategory(e,{is_active:!t.is_active}),o(t.is_active?"Category disabled.":"Category enabled.","success"),await Ue()}catch(a){o(a.message||"Failed.","error")}}async function ri(e){if(confirm("Delete this category? It will be deactivated if jobs are attached."))try{let t=await l.adminDeleteCategory(e);o(t.message||"Done.","success"),await Ue()}catch(t){o(t.message||"Failed.","error")}}function pe(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();g();var ue={grouped:{},loading:!1};function qs(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults. Changes apply immediately across the app.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await Ns()}}async function Ns(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await l.adminSettings();ue.grouped=t.data||{},ni()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${Q(t.message||"unknown")}</p>`}}}function ni(){let e=document.getElementById("settings-container");if(!e)return;let t=Object.keys(ue.grouped);if(t.length===0){e.innerHTML='<p class="muted">No settings found.</p>';return}e.innerHTML=t.map(a=>`
        <div class="card settings-group">
            <h3 class="card__title">${Q(a.charAt(0).toUpperCase()+a.slice(1))}</h3>
            <div class="settings-group__rows">
                ${ue.grouped[a].map(s=>ii(a,s)).join("")}
            </div>
        </div>
    `).join("")+`
        <div style="margin-top:16px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,document.getElementById("settings-save-btn").addEventListener("click",oi)}function ii(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${Q(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${Q(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${Q(t.key)}</strong>
                <span class="muted">${Q(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function oi(){let e={};for(let a of Object.keys(ue.grouped))for(let s of ue.grouped[a]){let r=`set-${s.key.replace(/[^a-z0-9]/gi,"_")}`,n=document.getElementById(r);if(!n)continue;let i;s.value_type==="boolean"?i=n.checked:s.value_type==="integer"||s.value_type==="percent"?i=parseInt(n.value,10):s.value_type==="decimal"?i=parseFloat(n.value):s.value_type==="json"?i=n.value?JSON.parse(n.value):null:i=n.value,e[s.key]=i}let t=document.getElementById("settings-save-btn");t.disabled=!0,t.textContent="Saving\u2026";try{await l.adminUpdateSettings(e),o("Settings saved.","success"),await Ns()}catch(a){o(a.message||"Failed to save.","error")}finally{t.disabled=!1,t.textContent="Save All Changes"}}function Q(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Ot();zt();Xt();Lt();Et();Ct();qt();$t();var Ds={"/":re,"/refer":it,"/webtask":ne,"/tasks":ne,"/earn":we,"/tg-tasks":Ce,"/withdraw":_e,"/profile":$e,"/wallet":$e,"/admin":Pt,"/admin/payments":Bt,"/admin/categories":Ms,"/admin/settings":qs,"/admin/jobs":Ut,"/admin/transactions":Gt,"/admin/reports":Vt,"/deposit":dt,"/leaderboard":Te,"/achievements":ke,"/support":Le,"/settings":Ee,"/jobs/available":xs,"/worker/bids":Cs,"/worker/active-jobs":sa,"/poster":kt,"/poster/post-job":xt,"/poster/jobs":At,"/poster/wallet":Mt,"/notifications":_t,"/login":Yt,"/register":Zt};function Us(){Oe(),setTimeout(Oe,50),window.addEventListener("hashchange",Oe),$(()=>{x.get(),setTimeout(Oe,0)})}async function Oe(){let e=window.location.hash.replace(/^#/,"")||"/";if(!Ds[e]){let n=e.match(/^\/jobs\/(\d+)$/);if(n){let c=await Promise.resolve().then(()=>(Hs(),Ps));await ia(()=>c.JobDetailPage(n[1]),e);return}let i=e.match(/^\/poster\/jobs\/(\d+)$/);if(i){if(!x.get()){b("/login");return}let c=await Promise.resolve().then(()=>(Rs(),Is));await ia(()=>c.PosterJobDetailPage(i[1]),e);return}e="/"}let t=x.get(),a=m.get(),s=["/login","/register"];if(s.includes(e)&&t){b("/");return}if(!s.includes(e)&&!t){b("/login");return}if(e.startsWith("/admin")&&(!a||!a.is_admin)){Si();return}let r=Ds[e];await ia(r,e)}async function ia(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function Si(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}g();var Os=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();Os.innerHTML="";B(ks(),Os);I.get()&&k();Us();
