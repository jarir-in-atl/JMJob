var tr=Object.defineProperty;var f=(e,t)=>()=>(e&&(t=e(e=0)),t);var w=(e,t)=>{for(var a in t)tr(e,a,{get:t[a],enumerable:!0})};function ar(e,t){fa?fa(e,t):console.error("[Ghost] Unhandled effect error:",e)}function A(e){let t=e,a=new Set;return{get(){return C&&(a.add(C),C.dependencies.add(a)),t},set(s){t!==s&&(t=s,va(a))}}}function va(e){Xe(()=>{e.forEach(t=>{t.notify?t.notify():be.add(t)})})}function Xe(e){ze++;try{e()}finally{if(ze--,ze===0){let t=Array.from(be);be.clear(),t.forEach(a=>a.run())}}}function $(e){let t={dependencies:new Set,run(){Ve(t),me.push(C),C=t;try{e()}catch(a){ar(a,e)}finally{C=me.pop()}},notify(){be.add(t)}};return t.run(),()=>Ve(t)}function Ye(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,va(s))}};return{get(){if(C&&(s.add(C),C.dependencies.add(s)),a){Ve(r),me.push(C),C=r;try{t=e()}finally{C=me.pop()}a=!1}return t}}}function Ve(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var C,me,be,ze,fa,J=f(()=>{C=null,me=[],be=new Set,ze=0,fa=null});function ae(){Ke.totalUpdates++,Ke.recentUpdates++}var ge,Ke,Ze=f(()=>{ge=new Set,Ke={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function R(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){sr(e,t);return}if(e.__ghostWhen){rr(e,t);return}if(e.__ghostLazy){ir(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;ge.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let i=s.startsWith("on");typeof r=="function"&&!i?e.effects.push($(()=>{a.setAttribute(s,r()),ae(),e.events.update?.forEach(n=>n())})):i?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)R(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push($(()=>{let i=s(),n=document.createTextNode(String(i??""));r?a.replaceChild(n,r):a.appendChild(n),r=n,ae(),e.events.update?.forEach(l=>l())}))}else R(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function se(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),ge.delete(e)}}function sr(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let l=new Map;function d(h){return h.el||null}let g=$(()=>{let h=a(),q=h.map((S,U)=>String(s(S,U))),er=Array.from(l.keys());for(let S of er)if(!q.includes(S)){let U=l.get(S);se(U.ghostNode),l.delete(S)}for(let S=0;S<h.length;S++){let U=q[S];if(!l.has(U)){let te=r(h[S],S),V=document.createElement("ghost-list-slot");for(R(te,V);V.firstChild;)t.insertBefore(V.firstChild,n);l.set(U,{ghostNode:te})}}for(let S=q.length-1;S>=0;S--){let U=q[S],te=l.get(U);if(!te)continue;let V=d(te.ghostNode);if(!V)continue;let ba=q[S+1],ga=(ba?d(l.get(ba)?.ghostNode):null)||n;V.nextSibling!==ga&&t.insertBefore(V,ga)}ae()});e._listCleanup=()=>{g();for(let h of l.values())se(h.ghostNode);l.clear(),i.remove(),n.remove()}}function N(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function rr(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,l=$(()=>{let g=a()?s:r;if(n&&(se(n),n=null),g&&(n=g(),n)){let h=document.createElement("ghost-when-slot");for(R(n,h);h.firstChild;)t.insertBefore(h.firstChild,i)}ae()});e._whenCleanup=()=>{l(),n&&se(n),i.remove()}}function ir(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let i=null;if(s){let n=document.createElement("ghost-lazy-slot");for(R(s,n);n.firstChild;)t.insertBefore(n.firstChild,r);i=s}a().then(n=>{let l=n.default||n;i&&(se(i),i=null);let d=typeof l=="function"?l():l,g=document.createElement("ghost-lazy-slot");for(R(d,g);g.firstChild;)t.insertBefore(g.firstChild,r);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var Qe=f(()=>{J();Ze()});var ha=f(()=>{J()});var fe=f(()=>{});var ya=f(()=>{Ze()});var wa=f(()=>{J()});var _a=f(()=>{Qe();J();fe();fe()});function or(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let i={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){i["@attributes"]={};for(let n of r.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of r.childNodes){let l=n.nodeName,d=s(n);d!==""&&(i[l]===void 0?i[l]=d:(Array.isArray(i[l])||(i[l]=[i[l]]),i[l].push(d)))}return i}return s(a.documentElement)}function lr(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function tt(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),i={url:e,...s};for(let q of tt.interceptors.request)i=q(i)??i;let n=i.url;delete i.url;let l=lr(n,r);if(a==="memory"&&r==="GET"&&et.has(l))return et.get(l);let d=await fetch(n,i),g=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let h;g.includes("application/xml")||g.includes("text/xml")?h=or(await d.text()):g.includes("application/json")?h=await d.json():h=await d.text();for(let q of tt.interceptors.response)h=q(d,h)??h;return a==="memory"&&r==="GET"&&et.set(l,h),h}var et,$a=f(()=>{et=new Map;tt.interceptors={request:[],response:[]}});function at(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=A(a);return $(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var Sa=f(()=>{J()});function cr(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var oo,ka=f(()=>{oo=cr()});var po,dr,Ta=f(()=>{J();po=A("en"),dr=new Map;dr.set("en",{})});var j=f(()=>{J();Qe();ha();fe();ya();wa();_a();$a();Sa();ka();Ta()});function La(e){st=e}function xa(e){rt=e}async function p(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let i=e.startsWith("http")?e:pr.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...s}};st&&(n.headers.Authorization=`Bearer ${st}`),a!==void 0&&(n.body=JSON.stringify(a)),r&&(n.signal=r);let l=await fetch(i,n);if(l.status===401)throw rt&&rt(),new ve("Unauthorized",401,null);let d=null,g=l.headers.get("content-type")||"";try{if(g.includes("application/json"))d=await l.json();else{let h=await l.text();d=h?{message:h}:null}}catch{}if(!l.ok){let h=d&&d.message||`HTTP ${l.status}`;throw new ve(h,l.status,d)}return d}var pr,st,rt,ve,c,y=f(()=>{pr=window.JMJOB_CONFIG||{apiBase:"/api"},st=null,rt=null;ve=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},c={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>p("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>p("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),forgotPassword:e=>p("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>p("/auth/reset-password",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/notifications${t?"?"+t:""}`)},notificationRead:e=>p(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>p("/notifications/read-all",{method:"POST"}),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminUpdateUserRole:(e,t)=>p(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminResetDailyCounters:()=>p("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>p("/payment/gateways"),paymentSubmit:e=>p("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>p("/payment/submissions"),adminPayments:(e="")=>p(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>p(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>p(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>p("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/jobs${t?"?"+t:""}`)},job:e=>p(`/jobs/${e}`),placeBid:(e,t)=>p(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>p(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>p("/worker/bids"),workerActiveJobs:()=>p("/worker/active-jobs"),submitWork:(e,t)=>p(`/jobs/${e}/submit`,{method:"POST",body:t}),workerSubmissions:()=>p("/worker/submissions"),posterStats:()=>p("/poster/stats"),posterCreateJob:e=>p("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>p("/poster/jobs"),posterJobBids:e=>p(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>p(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>p(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>p(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>p(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>p("/admin/categories"),adminCreateCategory:e=>p("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>p(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>p(`/admin/categories/${e}/delete`,{method:"POST"}),adminSettings:()=>p("/admin/settings"),adminUpdateSettings:e=>p("/admin/settings",{method:"POST",body:e}),socialLinks:()=>p("/social-links"),adminUpdateSocialLinks:e=>p("/admin/social-links",{method:"POST",body:e}),adminJobs:(e="")=>p(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminFlagJobDispute:e=>p(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>p(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>p("/admin/reports"),adminRevenue:()=>p("/admin/revenue")}});function o(e,t="info",a=3500){re.set({message:e,type:t,id:Date.now()}),it&&clearTimeout(it),it=setTimeout(()=>re.set(null),a)}async function x(){if(!I.get())return null;try{let e=await c.me();return m.set(e.data),e.data}catch{return null}}async function Ea(e,t){let a=await c.login({email:e,password:t});return I.set(a.data.token),m.set(a.data.user),a.data.user}async function Aa(e){return c.requestRegistrationOtp(e)}async function Ca(e){let t=await c.verifyRegistrationOtp(e);return I.set(t.data.token),m.set(t.data.user),t.data.user}async function he(){try{await c.logout()}catch{}I.set(null),m.set(null),k.set("/login")}function b(e){window.location.hash=e}var ur,mr,I,m,re,it,k,L,v=f(()=>{j();j();y();ur="earnap_token",mr="earnap_user",I=at(ur,null),m=at(mr,null),re=A(null),it=null;k=A(window.location.hash.replace(/^#/,"")||"/"),L=Ye(()=>!!I.get()&&!!m.get());$(()=>{let e=I.get();La(e)});xa(()=>{I.set(null),m.set(null),k.set("/login"),o("Session expired. Please log in.","error")})});var Ma={};w(Ma,{HomePage:()=>ie});function ie(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=m.get(),a=M("div","welcome-popup","");a.innerHTML=`
            <strong>JM Job:</strong>
            <span>Complete tasks, watch ads, refer friends, and withdraw anytime.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `,a.querySelector("button").addEventListener("click",()=>a.remove()),e.appendChild(a),e.appendChild(br(t)),e.appendChild(gr()),e.appendChild(fr(t)),e.appendChild(await vr(t)),e.appendChild(await hr())}}function M(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}function br(e){let t=M("div","card card--user-header"),a=M("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function gr(){let e=M("div","icon-grid");return[{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg",tone:"blue"},{path:"/webtask",label:"Tasks",icon:"bi-telegram",tone:"blue"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=M("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),b(a.path)}),e.appendChild(s)}),e}function fr(e){let t=M("div","card card--daily-mission"),a=e&&e.today_ads||0,s=e&&e.ads_limit||50,r=Math.min(100,a/Math.max(1,s)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${s} | Completed: ${a}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${r}%"></div>
        </div>
    `;let i=M("button","btn btn--primary btn--xl","\u{1F381} Claim Daily Bonus");return i.addEventListener("click",async()=>{try{let n=await fetch("/api/user/claim-daily-bonus",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Bearer "+(window.JMJOB_TOKEN||"")}}).then(l=>l.json());n.success?(o(n.message||"Daily bonus claimed!","success"),await x(),ie()()):o(n.message||"Bonus not available.","info")}catch{o("Could not claim. Try again later.","error")}}),t.appendChild(i),t}async function vr(e){let t=M("div","card card--ad-reward"),a=e?e.ads_remaining:0,s=e&&e.today_ads||0,r=e&&e.ads_limit||50,i=Math.min(100,s/Math.max(1,r)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Ads Reward Center</h3>
            <span class="ad-reward__meta">Wait: <strong>12s</strong> \xB7 Daily Limit: <strong>${r} Ads</strong></span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${i}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${s} / ${r} (${a} remaining)</p>
    `;let n=M("button","btn btn--success btn--xl","\u25B6 Watch Ad & Earn");return a<=0&&(n.disabled=!0,n.textContent="\u2713 All Tasks Completed"),n.addEventListener("click",()=>yr()),t.appendChild(n),t}async function hr(){let e=M("div","card card--webtask");e.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Web Task Center</h3>
            <span class="card__sub">Loading\u2026</span>
        </div>
    `;try{let a=(await c.webTasks()).data||[],s=a.filter(n=>n.can_claim).length,r=a.filter(n=>!n.can_claim).length;e.querySelector(".card__sub").textContent=`Available: ${s} \xB7 Completed: ${r} \xB7 Total: ${a.length}`;let i=M("a","btn btn--ghost","View all tasks \u2192");i.href="#/webtask",i.addEventListener("click",n=>{n.preventDefault(),b("/webtask")}),e.appendChild(i)}catch{e.querySelector(".card__sub").textContent="Failed to load tasks."}return e}function yr(){let e=M("div","modal modal--ad");e.innerHTML=`
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
        `;let s=12,r=t.querySelector("#cd"),i=setInterval(()=>{s--,r.textContent=s,s<=0&&(clearInterval(i),wr(e,"simulated",a))},1e3)},200)}async function wr(e,t,a){try{let s=await c.reward({provider:t,started_at:a});o("+"+parseFloat(s.data.reward).toFixed(4)+" credited!","success"),e.remove(),await x(),ie()()}catch(s){o(s.message||"Reward failed","error"),e.remove()}}var nt=f(()=>{v();y()});var ot={};w(ot,{WebTaskPage:()=>ne});function ne(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await c.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(_r(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function _r(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${qa(e.title)}</h3>
        <p class="card__sub">${qa(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>$r(e,a,t)),t}async function $r(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,l=setInterval(()=>{s+=1;let d=r-s;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",s>=r&&(clearInterval(l),Sr(t,n,a))},1e3)}function Sr(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await c.webTaskClaim({completion_id:t});o("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await x(),ne()()}catch(s){o(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function qa(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ye=f(()=>{y();v()});var ja={};w(ja,{EarnPage:()=>we});function we(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=m.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let s=e.querySelector("#watch-btn");s.disabled||s.addEventListener("click",()=>kr())}}function kr(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=s.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await Tr(e,"simulated",t))},1e3)},300)}async function Tr(e,t,a){try{let s=await c.reward({provider:t,started_at:a});o(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await x(),e.remove(),we()()}catch(s){o(s.message||"Reward failed","error"),e.remove()}}var lt=f(()=>{y();v()});var Na={};w(Na,{ReferPage:()=>ct});function ct(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=m.get(),a=null;try{a=(await c.referrals()).data}catch{o("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let r=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),o("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),o("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(s);let l=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let g=document.createElement("div");g.className="refer-item",g.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Pa(d.name)}</div>
                        <div class="refer-item__username">@${Pa(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,l.appendChild(g)})}}function Pa(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var dt=f(()=>{y();v()});var Ha={};w(Ha,{WithdrawPage:()=>_e});function _e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=m.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let l=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});o("Withdrawal requested!","success"),await x(),_e()()}catch(l){let d=l.payload&&l.payload.errors;if(d){let g=Object.values(d)[0];o(Array.isArray(g)?g[0]:g,"error")}else o(l.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",i.forEach(n=>s.appendChild(Lr(n))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Lr(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${pt(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${pt(e.gateway)} \xB7 ${pt(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function pt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ut=f(()=>{y();v()});var Ra={};w(Ra,{DepositPage:()=>mt});function mt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=m.get();e.innerHTML=`
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
        `;try{_.loading=!0;let[s,r]=await Promise.all([c.paymentGateways(),c.paymentSubmissions()]);_.gateways=s.data.gateways,_.minAmount=s.data.min_amount,_.maxAmount=s.data.max_amount,_.submissions=r.data,Ba(),Fa()}catch(s){o("Failed to load deposit info: "+s.message,"error")}finally{_.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!_.selectedGateway){o("Please select a payment method.","error");return}let r=new FormData(a),i=document.getElementById("deposit-submit-btn");i.disabled=!0,i.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let n=await c.paymentSubmit({gateway:_.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});o(n.message||"Payment submitted.","success"),a.reset();let l=await c.paymentSubmissions();_.submissions=l.data,Fa(),await x();let d=m.get(),g=document.getElementById("deposit-balance");g&&d&&(g.textContent="\u09F3"+parseFloat(d.role==="poster"?d.wallet_balance||0:d.balance||0).toFixed(2))}catch(n){o(n.message||"Failed to submit payment.","error")}finally{i.disabled=!1,i.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function Ba(){let e=document.getElementById("payment-gateways");if(e){if(_.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=_.gateways.map(t=>`
        <button class="payment-gateway ${_.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${K(t.label)}</div>
                <div class="payment-gateway__number">${K(t.wallet_number)}</div>
            </div>
            ${_.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{_.selectedGateway=t.getAttribute("data-gateway"),Ba(),Er()})})}}function Er(){let e=_.gateways.find(i=>i.key===_.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${K(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${K(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{o("Wallet number copied.","info")}).catch(()=>{o("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=_.minAmount,r.max=_.maxAmount,r.placeholder=`${_.minAmount} \u2013 ${_.maxAmount}`)}function Fa(){let e=document.getElementById("payment-history");if(e){if(_.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=_.submissions.map(t=>{let a=xr[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${K((t.gateway||"").toUpperCase())} \u2022 TRX: ${K(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Ar(t.created_at)}</div>
            </div>
        `}).join("")}}function Ar(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function K(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var xr,_,bt=f(()=>{y();v();xr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},_={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var ft={};w(ft,{ProfilePage:()=>$e});function $e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=m.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?gt(t.name):""}</h2>
                <p class="card__sub">@${t?gt(t.username):""}</p>
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
        `;let a=e.querySelector("#ad-history");try{let r=(await c.adHistory()).data||[];if(r.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let i=a.querySelector(".ad-history__list");r.forEach(n=>{let l=document.createElement("div");l.className="ad-history__row",l.innerHTML=`
                        <span class="ad-history__provider">${gt(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(l)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function gt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Se=f(()=>{y();v()});var Ia={};w(Ia,{default:()=>ke});async function ke(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var vt=f(()=>{v()});var Da={};w(Da,{default:()=>Te});async function Te(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var ht=f(()=>{v()});var Oa={};w(Oa,{default:()=>Le});async function Le(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var yt=f(()=>{v()});function Cr(){let e=localStorage.getItem(Ua);return e==="dark"||e==="light"?e:"system"}function Mr(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function wt(e){let t=Mr(e);document.documentElement.setAttribute("data-theme",t)}function Ja(){let e=P.get();P.set(e==="dark"?"light":"dark")}function Wa(e){P.set(e)}function qr(){let e=localStorage.getItem(Ga);return e&&_t.includes(e)?e:"default"}function za(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function Va(e){_t.includes(e)&&oe.set(e)}function Xa(){return _t}var Ua,P,Ga,_t,oe,$t=f(()=>{j();Ua="jmjob_theme";P=A(Cr());wt(P.get());$(()=>{let e=P.get();wt(e),localStorage.setItem(Ua,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{P.get()==="system"&&wt("system")});Ga="jmjob_color_theme",_t=["default","emerald","amber","rose"];oe=A(qr());za(oe.get());$(()=>{let e=oe.get();za(e),localStorage.setItem(Ga,e)})});var Ya={};w(Ya,{default:()=>Ee});async function Ee(){let e=document.querySelector("[data-view]");if(!e)return;let t=m.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=P.get(),s=oe.get(),r=Xa();e.innerHTML=`
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
                        ${r.map(l=>`
                            <button class="theme-swatch ${l===s?"is-active":""}" data-color="${l}" role="radio" aria-checked="${l===s}" title="${xe[l]||l}">
                                <span class="theme-swatch__chip" style="background: ${jr[l]};"></span>
                                <span class="theme-swatch__label">${(xe[l]||l).split(" ")[0]}</span>
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
    `;let i=document.getElementById("theme-mode-group");i&&i.querySelectorAll("button[data-mode]").forEach(l=>{l.addEventListener("click",()=>{let d=l.getAttribute("data-mode");Wa(d),o(`Theme mode set to ${d}.`,"info")})});let n=document.getElementById("color-theme-group");n&&n.querySelectorAll("button[data-color]").forEach(l=>{l.addEventListener("click",()=>{let d=l.getAttribute("data-color");Va(d),o(`Accent color set to ${xe[d]||d}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await he(),o("Logged out.","info")})}var xe,jr,St=f(()=>{v();$t();xe={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},jr={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var Za={};w(Za,{NotificationsPage:()=>kt});function kt(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await c.notificationsReadAll(),o("All notifications marked as read.","success"),await Ka()}catch(t){o(t.message||"Could not update notifications.","error")}}),await Ka())}}async function Ka(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await c.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(Pr).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await c.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){o(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${le(t.message||"unknown error")}</p>`}}function Pr(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${le(t.action_url)}">Open</a>`:"",i=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${le(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${le(t.title||"Notification")}</h3><p>${le(t.message||"")}</p><small>${Nr(e.created_at)}</small></div><div class="notifications-page__actions">${r}${i}</div></article>`}function Nr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function le(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Tt=f(()=>{y();v()});var Qa={};w(Qa,{TgTasksPage:()=>Ce});function Ce(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await c.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Hr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Hr(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
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
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Fr(e,t)},3e3)})}return t}async function Fr(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),o("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await x(),Ce()()}catch(s){o(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Ae(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Lt=f(()=>{y();v()});var as={};w(as,{PosterDashboardPage:()=>Et});function Et(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-dashboard";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),b("/poster/post-job")}),await es()}}async function es(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await c.posterStats();Rr(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${ts(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",es),o(t.message||"Failed to load poster statistics.","error")}}function Rr(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=xt(t.wallet_balance),i=xt(t.frozen_balance),n=xt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${Me("bi-briefcase","Total jobs",a.total||0)}
            ${Me("bi-lightning-charge","Active jobs",s)}
            ${Me("bi-wallet2","Available wallet",r,"\u09F3")}
            ${Me("bi-lock","In escrow",i,"\u09F3")}
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
                    ${Z("open",a.open)}
                    ${Z("in_review",a.in_review)}
                    ${Z("assigned",a.assigned)}
                    ${Z("submitted",a.submitted)}
                    ${Z("revision",a.revision)}
                    ${Z("completed",a.completed)}
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
                    <div><span class="muted">Frozen in escrow</span><strong>\u09F3${i}</strong></div>
                    <div><span class="muted">Total spent</span><strong>\u09F3${n}</strong></div>
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
    `,e.querySelectorAll("[data-poster-link]").forEach(l=>{l.addEventListener("click",d=>{d.preventDefault(),b(l.getAttribute("href").replace(/^#/,""))})})}function Me(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${ts(String(a))}</strong>
        </div>
    `}function Z(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Ir(e)}"></i> ${Br[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Ir(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function xt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function ts(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Br,At=f(()=>{y();v();Br={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var ss={};w(ss,{PostJobPage:()=>Ct});function Ct(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--post-job",!Jr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,e.querySelector("#post-job-cancel").addEventListener("click",()=>b("/poster")),await Dr(e),Or(e)}}}async function Dr(e){let t=e.querySelector("#post-job-category");try{let s=(await c.categories()).data||[];t.innerHTML=s.length?'<option value="">Choose a category\u2026</option>'+s.map(r=>`<option value="${Number(r.id)}">${Wr(r.name)}</option>`).join(""):'<option value="">No active categories</option>'}catch(a){t.innerHTML='<option value="">Unable to load categories</option>',o(a.message||"Could not load categories.","error")}}function Or(e){let t=e.querySelector("#post-job-form");t.addEventListener("submit",async a=>{a.preventDefault();let s=new FormData(t),r=e.querySelector("#post-job-submit");r.disabled=!0,r.textContent="Publishing\u2026";try{await c.posterCreateJob({category_id:Number(s.get("category_id")),title:String(s.get("title")||"").trim(),description:String(s.get("description")||"").trim(),requirements:String(s.get("requirements")||"").trim()||null,budget:Number(s.get("budget")),deadline_at:Ur(s.get("deadline_at")),bidding_window_hours:Number(s.get("bidding_window_hours"))}),o("Job published successfully.","success"),b("/poster/jobs")}catch(i){o(i.message||"Could not publish job.","error")}finally{r.disabled=!1,r.textContent="Publish job"}})}function Ur(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function Jr(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function Wr(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Mt=f(()=>{y();v()});var is={};w(is,{PosterJobsPage:()=>qt});function qt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!Xr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${Gr.map(t=>`<option value="${t}" ${t===je?"selected":""}>${t?rs(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),b("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{je=t.target.value,await qe()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",qe),await qe()}}}async function qe(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await c.posterMyJobs()).data||[]).filter(s=>!je||s.status===je);e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(zr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${Q(t.message||"unknown error")}</p>`}}}function zr(e){let t=document.createElement("article");return t.className=`admin-row poster-job-row poster-job-row--${Q(e.status)}`,t.innerHTML=`
        <div class="poster-job-row__header">
            <div><strong>${Q(e.title)}</strong><span class="badge">${Q(rs(e.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${Q(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${Q(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(e.bid_count||0)}</span><span><strong>Views:</strong> ${Number(e.view_count||0)}</span><span><strong>Created:</strong> ${Yr(e.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${["completed","cancelled"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>b(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>Vr(e.id)),t}async function Vr(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await c.posterCancelJob(e,{reason:t}),o("Job cancelled.","success"),await qe()}catch(a){o(a.message||"Could not cancel job.","error")}}function Xr(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function rs(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Yr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Q(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Gr,je,jt=f(()=>{y();v();Gr=["","open","assigned","submitted","revision","completed","cancelled","disputed"],je=""});var ns={};w(ns,{PosterWalletPage:()=>Nt});function Nt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([c.posterStats(),c.paymentSubmissions()]);Kr(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Pe(a.message||"unknown error")}</p>`}}}function Kr(e,t,a){let s=Pt(t.wallet_balance),r=Pt(t.frozen_balance),i=Pt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${Zr(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>b("/deposit"))}function Zr(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Pe((t.gateway||"").toUpperCase())}</strong><small>${Pe(t.trxid)} \xB7 ${Qr(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Pe(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function Pt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function Qr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Pe(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ht=f(()=>{y();v()});var cs={};w(cs,{AdminPage:()=>Bt});function Bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="admin-page-header">
                <div>
                    <div class="admin-page-header__tag"><i class="bi bi-shield-lock-fill"></i> ADMIN CONTROL CENTER</div>
                    <h1 class="page-title">Executive Dashboard</h1>
                    <p class="muted">System-wide operational metrics, finance auditing, and platform management.</p>
                </div>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats"><i class="bi bi-speedometer2"></i> Overview</button>
                <button class="admin-tab" data-tab="withdrawals"><i class="bi bi-wallet2"></i> Withdrawals</button>
                <button class="admin-tab" data-tab="payments"><i class="bi bi-cash-stack"></i> Deposits</button>
                <button class="admin-tab" data-tab="users"><i class="bi bi-people"></i> Users & Roles</button>
                <button class="admin-tab" data-tab="providers"><i class="bi bi-play-circle"></i> Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content"><div class="spinner"></div></div>
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(r=>{r.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),r.classList.add("admin-tab--active"),os(r.dataset.tab,s)})}),os("stats",s)}}async function os(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([c.adminStats(),c.adminRevenue()]),r=a.data||{},i=s.data||{},n=i.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${W("bi-graph-up-arrow","Platform revenue",Ft(i.platform_revenue,n))}
                    ${W("bi-percent","Commission rate",`${(Number(i.commission_rate||0)*100).toFixed(2)}%`)}
                    ${W("bi-briefcase","Total jobs",G(i.total_jobs))}
                    ${W("bi-check2-circle","Completed jobs",G(i.completed_jobs))}
                    ${W("bi-lightning-charge","Active jobs",G(i.active_jobs))}
                    ${W("bi-people","Total users",G(i.total_users))}
                    ${W("bi-hourglass-split","Pending deposits",G(i.pending_payments))}
                    ${W("bi-lock","Held in escrow",Ft(i.escrow_total,n))}
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
                        <div><span class="muted">Withdrawals</span><strong>${G(r.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${G(r.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${G(r.total_ad_views)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${Ft(r.total_lifetime_paid,n)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${E(i.currency||"BDT")}</strong> currency \xB7 <strong>${E(i.escrow_mode||"full_bid")}</strong> escrow</div>
                </div>
                <div class="card admin-config-card">
                    <div>
                        <strong>System Maintenance</strong>
                        <p class="muted" style="margin:0; font-size:12px;">Reset daily user ad view limits and daily bonus claim timers for all users.</p>
                    </div>
                    <button class="btn btn--danger btn--sm" id="btn-reset-counters"><i class="bi bi-arrow-counterclockwise"></i> Reset Daily Counters</button>
                </div>
            `;let l=t.querySelector("#btn-reset-counters");l&&l.addEventListener("click",async()=>{if(confirm("Reset daily ad view counters for all users?"))try{let d=await c.adminResetDailyCounters();o(d.message||"Daily counters reset.","success")}catch(d){o(d.message||"Reset failed.","error")}})}else if(e==="withdrawals"){let s=(await c.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let r=t.querySelector("#wd-list");s.forEach(i=>r.appendChild(ls(i,r))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);r.innerHTML="",(n.data||[]).forEach(l=>r.appendChild(ls(l,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),i=Number(m.get()?.id||0);s.forEach(n=>{let l=document.createElement("div");l.className="admin-row",l.innerHTML=`
                    <div>
                        <strong>${E(n.name)}</strong>
                        <span class="muted">${E(n.email)}</span>
                        <span class="badge user-role-badge">${E(n.role||(n.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(n.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(n.lifetime_earned||0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(n.id)===i?"disabled":""}>
                                ${["worker","poster","admin"].map(g=>`<option value="${g}" ${(n.role||(n.is_admin?"admin":"worker"))===g?"selected":""}>${g[0].toUpperCase()+g.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let d=l.querySelector(".admin-user-role");d?.addEventListener("change",async()=>{let g=n.role||(n.is_admin?"admin":"worker");try{let h=await c.adminUpdateUserRole(n.id,d.value);n.role=h.data?.role||d.value,n.is_admin=!!h.data?.is_admin,l.querySelector(".user-role-badge").textContent=n.role.toUpperCase(),o("User role updated","success")}catch(h){d.value=g,o(h.message||"Role update failed","error")}}),r.appendChild(l)})}else if(e==="providers"){let s=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(i=>r.appendChild(ei(i,r)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function W(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${E(t)}</span>
            <strong>${E(String(a))}</strong>
        </div>
    `}function G(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Ft(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function ls(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${E(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${E(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${E(e.gateway)} \xB7 ${E(e.wallet_address)}</div>
        <div class="admin-row__status">${E(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),o("Withdrawal approved","success"),a.remove()}catch(n){o(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),o("Withdrawal rejected (refunded)","info"),a.remove()}catch(l){o(l.message,"error")}}),s.appendChild(r),s.appendChild(i),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),o("Marked as paid","success"),a.remove()}catch(i){o(i.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function ei(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${E(e.name)}</strong>
            <span class="muted">${E(e.slug)}</span>
            ${s?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${E(r)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${s?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),o("Provider saved","success")}catch(n){o(n.message,"error")}}),a}function E(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Rt=f(()=>{y();v();v()});var us={};w(us,{AdminPaymentsPage:()=>Dt});function Dt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${D.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${D.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${D.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${D.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{D.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),It()})}),await It()}}async function It(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminPayments(D.status);D.items=t.data||[],ai(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${X(t.message||"Failed to load.")}</p>`}}}function ai(e){if(D.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",D.items.forEach(t=>e.appendChild(si(t)))}function si(e){let t=ti[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${X((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${X(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${X(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${X(e.user.name)} <span class="muted">(${X(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${ps(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${ps(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${X(e.admin_note)}</div>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>ds(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>ds(e.id,"reject",a))),a}async function ds(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let i=await(t==="approve"?c.adminApprovePayment:c.adminRejectPayment)(e,{note:s||null});o(i.message||"Done.","success"),await It()}catch(r){o(r.message||"Action failed.","error")}}function ps(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function X(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ti,D,Ot=f(()=>{y();v();ti={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},D={status:"pending",items:[],loading:!1}});var bs={};w(bs,{AdminJobsPage:()=>Wt});function Wt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-jobs",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${ri.map(t=>`<option value="${t}" ${t===Jt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-job-status").addEventListener("change",async t=>{Jt=t.target.value,await ce()}),e.querySelector("#admin-job-refresh").addEventListener("click",ce),await ce()}}}async function ce(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminJobs(Jt)).data||[];e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(ii(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${H(t.message||"unknown error")}</p>`}}}function ii(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${H(e.status)}`;let a=e.worker?`${H(e.worker.name)} <span class="muted">(${H(e.worker.email||"")})</span>`:'<span class="muted">Unassigned</span>';t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${H(e.title)}</strong>
                <span class="badge">${H(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${H(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="admin-job-row__description muted">${H(e.description||"")}</p>
        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${H(e.poster?.name||"(deleted)")}</span>
            <span><strong>Worker:</strong> ${a}</span>
            <span><strong>Category:</strong> ${H(e.category_name||"Uncategorized")}</span>
            <span><strong>Bids:</strong> ${Number(e.bid_count||0).toLocaleString()} \xB7 <strong>Views:</strong> ${Number(e.view_count||0).toLocaleString()}</span>
        </div>
        <div class="admin-job-row__footer">
            <span class="muted">Updated ${oi(e.updated_at||e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let s=t.querySelector(".admin-row__actions");return["completed","cancelled","disputed"].includes(e.status)||s.appendChild(Ut("Mark disputed","btn--danger",()=>ni(e.id))),e.status==="disputed"&&(s.appendChild(Ut("Release payment","btn--success",()=>ms(e.id,"release"))),s.appendChild(Ut("Cancel and refund","btn--danger",()=>ms(e.id,"cancel")))),t}function Ut(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function ni(e){if(confirm("Flag this job for admin dispute review?"))try{await c.adminFlagJobDispute(e),o("Job flagged for dispute review.","success"),await ce()}catch(t){o(t.message||"Could not flag job.","error")}}async function ms(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await c.adminResolveJob(e,{resolution:t,reason:s}),o(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await ce()}catch(r){o(r.message||"Could not resolve dispute.","error")}}function oi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function H(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ri,Jt,Gt=f(()=>{y();v();ri=["","open","in_review","assigned","submitted","revision","disputed","completed","cancelled","expired"],Jt=""});var gs={};w(gs,{AdminTransactionsPage:()=>Xt});function Xt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${li.map(t=>`<option value="${t}" ${t===Vt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{Vt=t.target.value,await zt()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",zt),await zt()}}}async function zt(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminTransactions({type:Vt})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(ci(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${O(t.message||"unknown error")}</p>`}}}function ci(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${O(e.type)}`,t.innerHTML=`
        <div class="admin-transaction-row__header">
            <div>
                <strong>${O(String(e.type||"").replace("_"," ").toUpperCase())}</strong>
                <span class="badge">#${Number(e.id||0)}</span>
            </div>
            <strong class="admin-row__amount">${O(e.currency||"BDT")} ${Number(e.amount||0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${O(e.user_name||"Platform")} ${e.user_email?`<span class="muted">(${O(e.user_email)})</span>`:""}</span>
            <span><strong>Job:</strong> ${O(e.job_title||(e.job_id?`#${e.job_id}`:"\u2014"))}</span>
            <span><strong>Date:</strong> ${di(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${O(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${O(e.reference)}</code>`:""}
    `,t}function di(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function O(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var li,Vt,Yt=f(()=>{y();v();li=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],Vt=""});var fs={};w(fs,{AdminReportsPage:()=>Kt});function Kt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Reports</h1>
            <p class="muted">Aggregated transaction volume and marketplace job value by status.</p>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,await pi()}}}async function pi(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await c.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${Ne("Transactions",He(s.transaction_count))}
                ${Ne("Transaction volume",Fe(s.transaction_volume))}
                ${Ne("Jobs",He(s.job_count))}
                ${Ne("Job value",Fe(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${ui(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${mi(a.jobs||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${de(t.message||"unknown error")}</p>`}}function Ne(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${de(e)}</span><strong>${de(t)}</strong></div>`}function ui(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${de(String(t.type||"").replace("_"," "))}</strong><small>${He(t.transaction_count)} entries</small></span>
            <strong>${Fe(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function mi(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${de(String(t.status||"").replace("_"," "))}</strong><small>${He(t.job_count)} jobs</small></span>
            <strong>${Fe(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function He(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Fe(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function de(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Zt=f(()=>{y();v()});var vs={};w(vs,{LoginPage:()=>Qt});function Qt(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${bi(t)}</strong></p>`:""}
            <form id="login-form" class="auth-form">
                <label class="auth-form__label">Email
                    <input name="email" type="email" required placeholder="you@example.com">
                </label>
                <label class="auth-form__label">Password
                    <input name="password" type="password" required minlength="6" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
                </label>
                <button type="submit" class="btn btn--primary btn--xl">Log in</button>
            </form>
            <p class="auth-card__alt"><a href="#/forgot-password">Forgot your password?</a></p>
            <p class="auth-card__alt">No account? <a href="#/register">Sign up</a></p>
            <p class="auth-card__demo">
                Demo accounts:<br>
                <code>alice@example.com</code> / <code>password</code><br>
                <code>admin@example.com</code> / <code>password</code>
            </p>
        </div>
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{let n=await Ea(r.get("email"),r.get("password"));o("Welcome back!","success"),n&&n.is_admin?b("/admin"):b("/")}catch(n){o(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function bi(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ea=f(()=>{v()});var ys={};w(ys,{RegisterPage:()=>aa});function aa(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",r=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your email</h1>','<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',ta(a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",r()}),e.querySelector("#register-otp-form").addEventListener("submit",n);return}let l=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+ta(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',l,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+ta(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",i)},i=async l=>{l.preventDefault();let d=l.currentTarget,g=new FormData(d),h=d.querySelector('button[type="submit"]');h.disabled=!0,h.textContent="Sending code\u2026",a={name:String(g.get("name")||"").trim(),email:String(g.get("email")||"").trim().toLowerCase(),password:String(g.get("password")||""),password_confirmation:String(g.get("password_confirmation")||""),referral_code:String(g.get("referral_code")||"")};try{await Aa(a),t="otp",o("Verification code sent. It expires in 15 minutes.","success"),r()}catch(q){o(hs(q)||"Could not send the verification code.","error"),h.disabled=!1,h.textContent="Send verification code"}},n=async l=>{l.preventDefault();let d=l.currentTarget,g=d.querySelector('button[type="submit"]');g.disabled=!0,g.textContent="Verifying\u2026";try{await Ca({email:a.email,otp:String(new FormData(d).get("otp")||"").trim()}),o("Account created \u2014 welcome!","success"),b("/")}catch(h){o(hs(h)||"Invalid or expired verification code.","error"),g.disabled=!1,g.textContent="Verify and create account"}};r()}}function hs(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function ta(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var sa=f(()=>{v()});var ws={};w(ws,{default:()=>Be});async function Be(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Forgot Password</h2>
            <p class="auth-card__sub">Enter your email address and we'll send you a code to reset your password.</p>

            <form class="auth-form" id="forgot-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" placeholder="you@example.com" required autocomplete="email">
                </label>

                <button type="submit" class="btn btn--primary btn--xl" id="submit-btn">
                    Send Reset Code
                </button>
            </form>

            <p class="auth-card__alt">
                Remember your password? <a href="#/login">Log in</a>
            </p>
        </div>
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let r=t.email.value.trim();if(!r){o("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await c.forgotPassword({email:r}),o("If an account exists with this email, you will receive a reset code.","success"),b(`/reset-password?email=${encodeURIComponent(r)}`)}catch(i){o(i.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var ra=f(()=>{y();v()});var _s={};w(_s,{default:()=>Re});async function Re(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${gi(a)}" placeholder="you@example.com" required autocomplete="email">
                </label>

                <label class="auth-form__label">
                    Reset Code
                    <input type="text" name="otp" placeholder="000000" maxlength="6" pattern="[0-9]{6}" required autocomplete="one-time-code">
                </label>

                <label class="auth-form__label">
                    New Password
                    <input type="password" name="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" minlength="6" required autocomplete="new-password">
                </label>

                <label class="auth-form__label">
                    Confirm Password
                    <input type="password" name="password_confirmation" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" minlength="6" required autocomplete="new-password">
                </label>

                <button type="submit" class="btn btn--primary btn--xl" id="submit-btn">
                    Reset Password
                </button>
            </form>

            <p class="auth-card__alt">
                <a href="#/forgot-password">Didn't receive a code?</a> | <a href="#/login">Back to login</a>
            </p>
        </div>
    `;let s=document.getElementById("reset-form"),r=document.getElementById("submit-btn");s.addEventListener("submit",async i=>{i.preventDefault();let n=s.email.value.trim(),l=s.otp.value.trim(),d=s.password.value,g=s.password_confirmation.value;if(!n||!l||!d){o("Please fill in all fields.","error");return}if(l.length!==6){o("Please enter a valid 6-digit code.","error");return}if(d!==g){o("Passwords do not match.","error");return}if(d.length<6){o("Password must be at least 6 characters.","error");return}r.disabled=!0,r.textContent="Resetting...";try{await c.resetPassword({email:n,otp:l,password:d,password_confirmation:g}),o("Password reset successfully! You can now log in.","success"),b("/login")}catch(h){o(h.message||"Failed to reset password.","error"),r.disabled=!1,r.textContent="Reset Password"}})}function gi(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ia=f(()=>{y();v()});var Ws={};w(Ws,{JobDetailPage:()=>wn});function wn(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=m.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await c.job(e),{job:r,bids:i,bid_count:n,my_bid:l}=s.data;_n(r,i,n,l,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${z(s.message||"unknown")}</p>`}}}function _n(e,t,a,s,r){let i=document.getElementById("job-detail-content");if(!i)return;let n=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,l=n?Math.max(0,Math.floor((n-Date.now())/1e3)):null,d=l!=null?kn(l):"\u2014",g=["open","in_review"].includes(e.status),h=!!s;i.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${z(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${z(e.title)}</h1>
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Budget <strong>\u09F3${parseFloat(e.budget).toFixed(2)}</strong></span>
                        <span><i class="bi bi-people"></i> ${a} bid${a===1?"":"s"}</span>
                        <span><i class="bi bi-eye"></i> ${e.view_count} view${e.view_count===1?"":"s"}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${d}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${e.status}">${e.status.replace("_"," ").toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${z(e.description).replace(/\n/g,"<br>")}</p>
                ${e.requirements?`<h3>Requirements</h3><p>${z(e.requirements).replace(/\n/g,"<br>")}</p>`:""}
                <h3>Posted by</h3>
                <p>${e.poster?z(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${$n(e,t,s,r,g)}
    `,Sn(e,s,r)}function $n(e,t,a,s,r){return a?`
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${a.status}">
                    <div>
                        <strong>\u09F3${parseFloat(a.amount).toFixed(2)}</strong> in <strong>${a.delivery_days} day${a.delivery_days===1?"":"s"}</strong>
                        <div class="muted">${z(a.proposal)}</div>
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
                    ${t.map(i=>`
                        <div class="bid-row">
                            <div>
                                <strong>\u09F3${parseFloat(i.amount).toFixed(2)}</strong> \xB7 ${i.delivery_days} days
                                <div class="muted">${z(i.proposal).slice(0,100)}${i.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${i.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function Sn(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await c.withdrawBid(t.id),o("Bid withdrawn.","success"),b(`/jobs/${e.id}`)}catch(i){o(i.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(s),n=document.getElementById("bid-submit-btn");n.disabled=!0,n.textContent="Submitting\u2026";try{await c.placeBid(e.id,{amount:parseFloat(i.get("amount")),delivery_days:parseInt(i.get("delivery_days"),10),proposal:String(i.get("proposal")||"").trim()}),o("Bid placed!","success"),b(`/jobs/${e.id}`)}catch(l){o(l.message||"Failed to place bid.","error")}finally{n.disabled=!1,n.textContent="Submit Bid"}})}function kn(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Gs=f(()=>{y();v()});var Xs={};w(Xs,{PosterJobDetailPage:()=>Tn});function Tn(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!jn()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await zs(e)}}}async function zs(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await c.posterJobBids(e)).data||{};Ln(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${T(a.message||"unknown error")}</p>`}}function Ln(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${T(t.title)}</h1><p class="muted">${T(t.description||"")}</p></div><span class="badge badge--status badge--${T(t.status)}">${T(Pn(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${Vs(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${xn(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${En(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>An(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>Cn(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>Mn(t.id,r.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>qn(t.id))}function xn(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${T(a.status)}"><div class="poster-bid-row__main"><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">${T(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${T(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${T(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function En(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${T(a.status)}"><div><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${Vs(a.created_at)} \xB7 ${T(String(a.status||"").replace("_"," "))}</span><p>${T(a.description||"")}</p>${a.external_link?`<a href="${T(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${T(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function An(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await c.posterAcceptBid(e,t),o("Worker selected and escrow held.","success"),await ua(e)}catch(a){o(a.message||"Could not select worker.","error")}}async function Cn(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await c.posterReleasePayment(e,{submission_id:Number(t)}),o("Payment released.","success"),await ua(e)}catch(a){o(a.message||"Could not release payment.","error")}}async function Mn(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await c.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),o("Revision requested.","success"),await ua(e)}catch(s){o(s.message||"Could not request revision.","error")}}async function qn(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await c.posterCancelJob(e,{reason:"Cancelled by poster"}),o("Job cancelled.","success"),b("/poster/jobs")}catch(t){o(t.message||"Could not cancel job.","error")}}async function ua(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await zs(e))}function jn(){let e=m.get();return!!e&&(e.is_admin||e.role==="poster")}function Pn(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Vs(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function T(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ys=f(()=>{y();v()});j();v();j();v();var Ie=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(nt(),Ma))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),ot))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ye(),ot))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(lt(),ja))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(dt(),Na))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ut(),Ha))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(bt(),Ra))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Se(),ft))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(vt(),Ia))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ht(),Da))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(yt(),Oa))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(St(),Ya))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Tt(),Za))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Se(),ft))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Lt(),Qa))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(At(),as))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Mt(),ss))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(jt(),is))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ht(),ns))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Rt(),cs))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ot(),us))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Gt(),bs))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Yt(),gs))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Zt(),fs))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ea(),vs))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(sa(),ys))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ra(),ws))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ia(),_s))}],Rl=$(()=>{let e=k.get().split("?")[0]||"/";return Ie.find(t=>t.path===e)||Ie[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";k.set(e)});j();v();j();var fi=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],vi=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],hi=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function yi(){let e=m.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...vi];let t=[...fi];return e&&e.role==="poster"&&t.push({separator:!0},...hi),t}var $s="sidebar_collapsed",ee=A(localStorage.getItem($s)==="true");function wi(){let e=!ee.get();ee.set(e),localStorage.setItem($s,String(e))}function Ss(){let e=()=>k.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${ee.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar"},children:[_i(),$i(),Si()]}}function _i(){let e=()=>k.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]}]}}function $i(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>wi(),title:()=>ee.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${ee.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function Si(){return{tag:"nav",props:{class:"sidebar__nav"},children:yi().map(e=>e.header?ki(e.header):e.separator?Ti():Li(e))}}function ki(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function Ti(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function Li({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${k.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>ee.get()?t:"",onclick:r=>{r.preventDefault(),b(e),Ts()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function ks(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Ts()},children:[]}}function Ts(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}v();j();v();var xi=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Ei=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],Ai=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Ci(){let e=m.get();if(e&&e.is_admin)return Ei;let t=[...xi];return e&&e.role==="poster"&&t.push({separator:!0},...Ai),t}function Mi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${k.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),b(e),na()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function qi(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>na()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function ji(){return{tag:"nav",props:{class:"mobile-nav__list"},children:Ci().map(e=>e.separator?Pi():Mi(e))}}function Pi(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Ls(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[qi(),ji()]}}function xs(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>na()},children:[]}}function Es(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function na(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}$t();y();function As(){return N(()=>L.get(),()=>Di(),()=>Ii())}function Cs(){let e=()=>{let t=P.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>Ja(),"data-theme":()=>P.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function Ni(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function Hi(){return setTimeout(Fi,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),Ni()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[Ri("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function Fi(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await c.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],r=Number(a.meta?.unread_count||s.filter(i=>!i.read).length||0);t.textContent=r>99?"99+":String(r),e.innerHTML=s.length?s.map(Bi).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(i=>{i.addEventListener("click",async()=>{let n=i.getAttribute("data-notification-id");if(!(!n||i.getAttribute("data-read")==="1"))try{await c.notificationRead(n),i.setAttribute("data-read","1"),i.classList.remove("topbar-notification--unread");let l=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(l)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function Bi(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${De(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${De(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${De(t.title||"Notification")}</div><div class="topbar-notification__text">${De(t.message||"")}</div>${r?`<a class="topbar-notification__action"${r}>Open</a>`:""}</div></li>`}function De(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Ri(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function Ii(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Cs(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Di(){let e=m.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>Es(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Cs(),Hi(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await he(),o("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}v();j();function Ms(){return N(()=>!!re.get(),()=>{let e=re.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}y();function qs(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{c.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let r=[];a.facebook&&r.push(`<a href="${Oe(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&r.push(`<a href="${Oe(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&r.push(`<a href="${Oe(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&r.push(`<a href="${Oe(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=r.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function Oe(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}v();var Oi=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg"},{path:"/webtask",label:"Tasks",icon:"bi-telegram"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/notifications",label:"Alerts",icon:"bi-bell"},{path:"/refer",label:"Referral",icon:"bi-gift-fill"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box"},{path:"/leaderboard",label:"Leaders",icon:"bi-bar-chart-line-fill"},{path:"/achievements",label:"Awards",icon:"bi-award-fill"},{path:"/support",label:"Support",icon:"bi-headset"},{path:"/settings",label:"Settings",icon:"bi-gear-fill"}],Ui=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}],Ji=[{path:"/poster",label:"Poster",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Wallet",icon:"bi-wallet2"}];function Wi(){let e=m.get();if(e&&e.is_admin)return Ui;let t=[...Oi];return e&&e.role==="poster"&&t.push({separator:!0},...Ji),t}function Gi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${k.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),b(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function zi(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function Vi(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:Wi().map(e=>e.separator?zi():Gi(e))}}function js(e){let t=e==="left";return{tag:"button",props:{class:`hnav__scroll hnav__scroll--${e}`,id:`hnav-scroll-${e}`,type:"button","aria-label":t?"Scroll left":"Scroll right",onclick:a=>{a.preventDefault(),Xi(t?-1:1)}},children:[{tag:"i",props:{class:`bi ${t?"bi-chevron-left":"bi-chevron-right"}`},children:[]}]}}function Xi(e){let t=document.getElementById("hnav-list");if(!t)return;let a=Math.max(120,Math.round(t.clientWidth*.7));t.scrollBy({left:e*a,behavior:"smooth"})}function oa(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&oa()},!0),window.addEventListener("resize",()=>setTimeout(oa,50)),document.addEventListener("hnav:rendered",()=>setTimeout(oa,0)));function Ps(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[js("left"),Vi(),js("right")]}}function Ns(){let e=()=>!!m.get()?.is_admin,t=()=>k.get().startsWith("/admin"),a=()=>L.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[N(()=>L.get(),()=>Ss(),()=>null),N(()=>L.get(),()=>ks(),()=>null),N(()=>L.get(),()=>Ls(),()=>null),N(()=>L.get(),()=>xs(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[As(),N(()=>L.get()&&!e(),()=>Ps(),()=>null),{tag:"main",props:{class:"app-main"},children:[Yi()]},qs()]},Ms()]}}function Yi(){let t=k.get().split("?")[0]||"/",a=Ie.find(r=>r.path===t),s=m.get();return s&&s.is_admin&&!t.startsWith("/admin")?(b("/admin"),la()):a?a.requireAuth&&!L.get()?(b("/login"),la()):a.requireAdmin&&(!m.get()||!m.get().is_admin)?Qi():!a.requireAuth&&L.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(b("/"),la()):Ki(a):Zi()}function Ki(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function Zi(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function Qi(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function la(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}j();v();nt();ea();sa();ra();ia();dt();ye();lt();Lt();ut();Se();Rt();Ot();bt();vt();ht();yt();St();y();v();var u={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function Fs(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
            <h1 class="page-title">Browse Jobs</h1>
            <p class="muted">Find work that matches your skills. Place a bid to get started.</p>

            <div class="card jobs-filters">
                <div class="jobs-filters__row">
                    <label class="jobs-filters__field jobs-filters__field--search">
                        <span>Search</span>
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${F(u.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${Hs()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="\u09F30" value="${F(u.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${F(u.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${u.sort==="latest"?"selected":""}>Newest first</option>
                            <option value="budget_low" ${u.sort==="budget_low"?"selected":""}>Lowest budget</option>
                            <option value="budget_high" ${u.sort==="budget_high"?"selected":""}>Highest budget</option>
                            <option value="closing" ${u.sort==="closing"?"selected":""}>Closing soon</option>
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
        `,u.categories.length===0)try{let t=await c.categories();u.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=Hs())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{en(),u.page=1,Ue()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{u.search="",u.categoryId="",u.minBudget="",u.maxBudget="",u.sort="latest",u.page=1,tn(),Ue()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await Ue()}}}function Hs(){return'<option value="">All categories</option>'+u.categories.map(e=>`<option value="${F(e.id)}" ${String(e.id)===String(u.categoryId)?"selected":""}>${F(e.name)}</option>`).join("")}function en(){u.search=document.getElementById("jobs-search")?.value.trim()||"",u.categoryId=document.getElementById("jobs-category")?.value||"",u.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",u.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",u.sort=document.getElementById("jobs-sort")?.value||"latest"}function tn(){let e={"jobs-search":u.search,"jobs-category":u.categoryId,"jobs-min-budget":u.minBudget,"jobs-max-budget":u.maxBudget,"jobs-sort":u.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function Ue(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++u.requestSerial;u.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:u.page,per_page:u.perPage,sort:u.sort};u.search&&(a.search=u.search),u.categoryId&&(a.category_id=u.categoryId),u.minBudget!==""&&(a.min_budget=u.minBudget),u.maxBudget!==""&&(a.max_budget=u.maxBudget);let s=await c.jobs(a);if(t!==u.requestSerial)return;u.jobs=Array.isArray(s.data)?s.data:[],u.total=Number(s.meta?.total||0),u.lastPage=Math.max(1,Number(s.meta?.last_page||1)),an()}catch(a){if(t!==u.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${F(a.message||"unknown error")}</p>`,Bs(),Rs()}finally{t===u.requestSerial&&(u.loading=!1)}}function an(){let e=document.getElementById("jobs-grid");if(e){if(Bs(),Rs(),u.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=u.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${F(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${sn(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${F(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${F(t.title)}</h3>
            <p class="job-card__desc">${F(rn(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.budget||0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.bid_count||0)} bid${Number(t.bid_count)===1?"":"s"}</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function Bs(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(u.total===0){e.textContent="No open jobs found";return}let t=(u.page-1)*u.perPage+1,a=Math.min(u.page*u.perPage,u.total);e.textContent=`Showing ${t}-${a} of ${u.total} open jobs`}function Rs(){let e=document.getElementById("jobs-pagination");if(e){if(u.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page-1}" ${u.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${u.page} of ${u.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page+1}" ${u.page>=u.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>u.lastPage||a===u.page||(u.page=a,Ue())})})}}function sn(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function rn(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function F(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var ca={bids:[],loading:!1};function Is(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await c.workerBids();ca.bids=t.data||[],nn()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${Ds(t.message||"unknown")}</p>`}}}}function nn(){let e=document.getElementById("bids-list");if(e){if(ca.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=ca.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${Ds(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${on(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function on(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Ds(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var pe={jobs:[],submissions:[],loading:!1};function da(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([c.workerActiveJobs(),c.workerSubmissions()]);pe.jobs=t.data||[],pe.submissions=a.data||[],ln()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${pa(t.message||"unknown")}</p>`}}}}function ln(){let e=document.getElementById("active-jobs-list");if(e){if(pe.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=pe.jobs.map(t=>{let a=pe.submissions.find(r=>r.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${pa(t.title)}</h3>
                        <div class="muted">Budget: \u09F3${parseFloat(t.budget).toFixed(2)}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?cn(t,a):dn(t)}
            </div>
        `}).join(""),pn()}}function cn(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${un(t.created_at)}
            <div class="muted">${pa((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function dn(e){return`
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
    `}function pn(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),r=e.querySelector("[data-submit-btn]");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await c.submitWork(a,{description:String(s.get("description")||"").trim(),external_link:String(s.get("external_link")||"").trim()||null}),o("Work submitted!","success"),da()()}catch(i){o(i.message||"Failed to submit.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Work'}})})}function un(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function pa(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var Je={categories:[],loading:!1};function Os(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,bn(),await We()}}async function We(){let e=document.getElementById("cat-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminCategories();Je.categories=t.data||[],mn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${ue(t.message||"unknown")}</p>`}}}function mn(){let e=document.getElementById("cat-list");if(e){if(Je.categories.length===0){e.innerHTML='<p class="muted">No categories yet. Add one below.</p>';return}e.innerHTML=Je.categories.map(t=>`
        <div class="cat-row" data-id="${t.id}">
            <div class="cat-row__icon"><i class="bi ${ue(t.icon_class||"bi-tag")}"></i></div>
            <div class="cat-row__main">
                <div class="cat-row__name">${ue(t.name)} ${t.is_active?"":'<span class="badge">INACTIVE</span>'}</div>
                <div class="cat-row__slug muted">/${ue(t.slug)}</div>
                <div class="cat-row__desc muted">${ue(t.description||"")}</div>
            </div>
            <div class="cat-row__actions">
                <button class="btn btn--ghost btn--sm" data-toggle="${t.id}">${t.is_active?"Disable":"Enable"}</button>
                <button class="btn btn--danger btn--sm" data-delete="${t.id}">Delete</button>
            </div>
        </div>
    `).join(""),e.querySelectorAll("[data-toggle]").forEach(t=>t.addEventListener("click",()=>gn(t.getAttribute("data-toggle")))),e.querySelectorAll("[data-delete]").forEach(t=>t.addEventListener("click",()=>fn(t.getAttribute("data-delete"))))}}function bn(){let e=document.getElementById("cat-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();let a=new FormData(e),s={name:String(a.get("name")||"").trim(),slug:String(a.get("slug")||"").trim().toLowerCase(),description:String(a.get("description")||"").trim()||null,icon_class:String(a.get("icon_class")||"").trim()||null,display_order:parseInt(a.get("display_order")||"0",10),is_active:a.get("is_active")==="on"},r=document.getElementById("cat-save-btn");r.disabled=!0,r.textContent="Creating\u2026";try{await c.adminCreateCategory(s),o("Category created.","success"),e.reset(),await We()}catch(i){o(i.message||"Failed.","error")}finally{r.disabled=!1,r.textContent="Create Category"}})}async function gn(e){let t=Je.categories.find(a=>String(a.id)===String(e));if(t)try{await c.adminUpdateCategory(e,{is_active:!t.is_active}),o(t.is_active?"Category disabled.":"Category enabled.","success"),await We()}catch(a){o(a.message||"Failed.","error")}}async function fn(e){if(confirm("Delete this category? It will be deactivated if jobs are attached."))try{let t=await c.adminDeleteCategory(e);o(t.message||"Done.","success"),await We()}catch(t){o(t.message||"Failed.","error")}}function ue(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var Y={grouped:{},social:{},loading:!1};function Us(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await Js()}}async function Js(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a]=await Promise.all([c.adminSettings(),c.socialLinks()]);Y.grouped=t.data||{},Y.social=a||{},vn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${B(t.message||"unknown")}</p>`}}}function vn(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(Y.grouped).map(r=>`
        <div class="card settings-group">
            <h3 class="card__title">${B(r.charAt(0).toUpperCase()+r.slice(1))}</h3>
            <div class="settings-group__rows">
                ${Y.grouped[r].map(i=>hn(r,i)).join("")}
            </div>
        </div>
    `).join(""),s=Y.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${B(s.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${B(s.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${B(s.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${B(s.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",yn)}function hn(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${B(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${B(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${B(t.key)}</strong>
                <span class="muted">${B(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function yn(){let e={};for(let s of Object.keys(Y.grouped))for(let r of Y.grouped[s]){let i=`set-${r.key.replace(/[^a-z0-9]/gi,"_")}`,n=document.getElementById(i);if(!n)continue;let l;r.value_type==="boolean"?l=n.checked:r.value_type==="integer"||r.value_type==="percent"?l=parseInt(n.value,10):r.value_type==="decimal"?l=parseFloat(n.value):r.value_type==="json"?l=n.value?JSON.parse(n.value):null:l=n.value,e[r.key]=l}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},a=document.getElementById("settings-save-btn");a.disabled=!0,a.textContent="Saving\u2026";try{await Promise.all([c.adminUpdateSettings(e),c.adminUpdateSocialLinks(t)]),o("Settings and social links saved successfully.","success"),await Js()}catch(s){o(s.message||"Failed to save.","error")}finally{a.disabled=!1,a.textContent="Save All Changes"}}function B(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Gt();Yt();Zt();At();Mt();jt();Ht();Tt();var Ks={"/":ie,"/refer":ct,"/webtask":ne,"/tasks":ne,"/earn":we,"/tg-tasks":Ce,"/withdraw":_e,"/profile":$e,"/wallet":$e,"/admin":Bt,"/admin/payments":Dt,"/admin/categories":Os,"/admin/settings":Us,"/admin/jobs":Wt,"/admin/transactions":Xt,"/admin/reports":Kt,"/deposit":mt,"/leaderboard":ke,"/achievements":Te,"/support":Le,"/settings":Ee,"/jobs/available":Fs,"/worker/bids":Is,"/worker/active-jobs":da,"/poster":Et,"/poster/post-job":Ct,"/poster/jobs":qt,"/poster/wallet":Nt,"/notifications":kt,"/login":Qt,"/register":aa,"/forgot-password":Be,"/reset-password":Re};function Zs(){Ge(),setTimeout(Ge,50),window.addEventListener("hashchange",Ge),$(()=>{L.get(),setTimeout(Ge,0)})}async function Ge(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!Ks[t]){let n=t.match(/^\/jobs\/(\d+)$/);if(n){let d=await Promise.resolve().then(()=>(Gs(),Ws));await ma(()=>d.JobDetailPage(n[1]),t);return}let l=t.match(/^\/poster\/jobs\/(\d+)$/);if(l){if(!L.get()){b("/login");return}let d=await Promise.resolve().then(()=>(Ys(),Xs));await ma(()=>d.PosterJobDetailPage(l[1]),t);return}t="/"}let a=L.get(),s=m.get(),r=["/login","/register","/forgot-password","/reset-password"];if(r.includes(t)&&a){s&&s.is_admin?b("/admin"):b("/");return}if(!r.includes(t)&&!a){b("/login");return}if(t==="/"&&s&&s.is_admin){b("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){Nn();return}let i=Ks[t];await ma(i,t)}async function ma(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function Nn(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}v();var Qs=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();Qs.innerHTML="";R(Ns(),Qs);I.get()&&x();Zs();
