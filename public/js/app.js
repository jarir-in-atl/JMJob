var ar=Object.defineProperty;var f=(e,t)=>()=>(e&&(t=e(e=0)),t);var w=(e,t)=>{for(var a in t)ar(e,a,{get:t[a],enumerable:!0})};function sr(e,t){va?va(e,t):console.error("[Ghost] Unhandled effect error:",e)}function A(e){let t=e,a=new Set;return{get(){return C&&(a.add(C),C.dependencies.add(a)),t},set(s){t!==s&&(t=s,ha(a))}}}function ha(e){Ye(()=>{e.forEach(t=>{t.notify?t.notify():be.add(t)})})}function Ye(e){Ve++;try{e()}finally{if(Ve--,Ve===0){let t=Array.from(be);be.clear(),t.forEach(a=>a.run())}}}function $(e){let t={dependencies:new Set,run(){Xe(t),me.push(C),C=t;try{e()}catch(a){sr(a,e)}finally{C=me.pop()}},notify(){be.add(t)}};return t.run(),()=>Xe(t)}function Ke(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,ha(s))}};return{get(){if(C&&(s.add(C),C.dependencies.add(s)),a){Xe(r),me.push(C),C=r;try{t=e()}finally{C=me.pop()}a=!1}return t}}}function Xe(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var C,me,be,Ve,va,J=f(()=>{C=null,me=[],be=new Set,Ve=0,va=null});function se(){Ze.totalUpdates++,Ze.recentUpdates++}var ge,Ze,Qe=f(()=>{ge=new Set,Ze={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function B(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){rr(e,t);return}if(e.__ghostWhen){ir(e,t);return}if(e.__ghostLazy){nr(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;ge.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let i=s.startsWith("on");typeof r=="function"&&!i?e.effects.push($(()=>{a.setAttribute(s,r()),se(),e.events.update?.forEach(n=>n())})):i?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)B(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push($(()=>{let i=s(),n=document.createTextNode(String(i??""));r?a.replaceChild(n,r):a.appendChild(n),r=n,se(),e.events.update?.forEach(o=>o())}))}else B(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function re(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),ge.delete(e)}}function rr(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function d(h){return h.el||null}let g=$(()=>{let h=a(),M=h.map((S,U)=>String(s(S,U))),tr=Array.from(o.keys());for(let S of tr)if(!M.includes(S)){let U=o.get(S);re(U.ghostNode),o.delete(S)}for(let S=0;S<h.length;S++){let U=M[S];if(!o.has(U)){let ae=r(h[S],S),V=document.createElement("ghost-list-slot");for(B(ae,V);V.firstChild;)t.insertBefore(V.firstChild,n);o.set(U,{ghostNode:ae})}}for(let S=M.length-1;S>=0;S--){let U=M[S],ae=o.get(U);if(!ae)continue;let V=d(ae.ghostNode);if(!V)continue;let ga=M[S+1],fa=(ga?d(o.get(ga)?.ghostNode):null)||n;V.nextSibling!==fa&&t.insertBefore(V,fa)}se()});e._listCleanup=()=>{g();for(let h of o.values())re(h.ghostNode);o.clear(),i.remove(),n.remove()}}function N(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function ir(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=$(()=>{let g=a()?s:r;if(n&&(re(n),n=null),g&&(n=g(),n)){let h=document.createElement("ghost-when-slot");for(B(n,h);h.firstChild;)t.insertBefore(h.firstChild,i)}se()});e._whenCleanup=()=>{o(),n&&re(n),i.remove()}}function nr(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let i=null;if(s){let n=document.createElement("ghost-lazy-slot");for(B(s,n);n.firstChild;)t.insertBefore(n.firstChild,r);i=s}a().then(n=>{let o=n.default||n;i&&(re(i),i=null);let d=typeof o=="function"?o():o,g=document.createElement("ghost-lazy-slot");for(B(d,g);g.firstChild;)t.insertBefore(g.firstChild,r);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var et=f(()=>{J();Qe()});var ya=f(()=>{J()});var fe=f(()=>{});var wa=f(()=>{Qe()});var _a=f(()=>{J()});var $a=f(()=>{et();J();fe();fe()});function lr(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let i={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){i["@attributes"]={};for(let n of r.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of r.childNodes){let o=n.nodeName,d=s(n);d!==""&&(i[o]===void 0?i[o]=d:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(d)))}return i}return s(a.documentElement)}function cr(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function at(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),i={url:e,...s};for(let M of at.interceptors.request)i=M(i)??i;let n=i.url;delete i.url;let o=cr(n,r);if(a==="memory"&&r==="GET"&&tt.has(o))return tt.get(o);let d=await fetch(n,i),g=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let h;g.includes("application/xml")||g.includes("text/xml")?h=lr(await d.text()):g.includes("application/json")?h=await d.json():h=await d.text();for(let M of at.interceptors.response)h=M(d,h)??h;return a==="memory"&&r==="GET"&&tt.set(o,h),h}var tt,Sa=f(()=>{tt=new Map;at.interceptors={request:[],response:[]}});function st(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=A(a);return $(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var ka=f(()=>{J()});function dr(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var ro,Ta=f(()=>{ro=dr()});var oo,pr,xa=f(()=>{J();oo=A("en"),pr=new Map;pr.set("en",{})});var q=f(()=>{J();et();ya();fe();wa();_a();$a();Sa();ka();Ta();xa()});function La(e){rt=e}function Ea(e){it=e}async function p(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let i=e.startsWith("http")?e:ur.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...s}};rt&&(n.headers.Authorization=`Bearer ${rt}`),a!==void 0&&(n.body=JSON.stringify(a)),r&&(n.signal=r);let o=await fetch(i,n);if(o.status===401)throw it&&it(),new ve("Unauthorized",401,null);let d=null,g=o.headers.get("content-type")||"";try{if(g.includes("application/json"))d=await o.json();else{let h=await o.text();d=h?{message:h}:null}}catch{}if(!o.ok){let h=d&&d.message||`HTTP ${o.status}`;throw new ve(h,o.status,d)}return d}var ur,rt,it,ve,c,y=f(()=>{ur=window.JMJOB_CONFIG||{apiBase:"/api"},rt=null,it=null;ve=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},c={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>p("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>p("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),forgotPassword:e=>p("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>p("/auth/reset-password",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/notifications${t?"?"+t:""}`)},notificationRead:e=>p(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>p("/notifications/read-all",{method:"POST"}),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminUpdateUserRole:(e,t)=>p(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminResetDailyCounters:()=>p("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>p("/payment/gateways"),paymentSubmit:e=>p("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>p("/payment/submissions"),adminPayments:(e="")=>p(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>p(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>p(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>p("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/jobs${t?"?"+t:""}`)},job:e=>p(`/jobs/${e}`),placeBid:(e,t)=>p(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>p(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>p("/worker/bids"),workerActiveJobs:()=>p("/worker/active-jobs"),submitWork:(e,t)=>p(`/jobs/${e}/submit`,{method:"POST",body:t}),workerSubmissions:()=>p("/worker/submissions"),posterStats:()=>p("/poster/stats"),posterCreateJob:e=>p("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>p("/poster/jobs"),posterJobBids:e=>p(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>p(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>p(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>p(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>p(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>p("/admin/categories"),adminCreateCategory:e=>p("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>p(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>p(`/admin/categories/${e}/delete`,{method:"POST"}),adminSettings:()=>p("/admin/settings"),adminUpdateSettings:e=>p("/admin/settings",{method:"POST",body:e}),socialLinks:()=>p("/social-links"),adminUpdateSocialLinks:e=>p("/admin/social-links",{method:"POST",body:e}),notices:()=>p("/notices"),adminUpdateNotices:e=>p("/admin/notices",{method:"POST",body:e}),adminJobs:(e="")=>p(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminFlagJobDispute:e=>p(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>p(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>p("/admin/reports"),adminRevenue:()=>p("/admin/revenue")}});function l(e,t="info",a=3500){ie.set({message:e,type:t,id:Date.now()}),nt&&clearTimeout(nt),nt=setTimeout(()=>ie.set(null),a)}async function E(){if(!I.get())return null;try{let e=await c.me();return m.set(e.data),e.data}catch{return null}}async function Aa(e,t){let a=await c.login({email:e,password:t});return I.set(a.data.token),m.set(a.data.user),a.data.user}async function Ca(e){return c.requestRegistrationOtp(e)}async function Ma(e){let t=await c.verifyRegistrationOtp(e);return I.set(t.data.token),m.set(t.data.user),t.data.user}async function he(){try{await c.logout()}catch{}I.set(null),m.set(null),k.set("/login")}function b(e){window.location.hash=e}var mr,br,I,m,ie,nt,k,x,v=f(()=>{q();q();y();mr="earnap_token",br="earnap_user",I=st(mr,null),m=st(br,null),ie=A(null),nt=null;k=A(window.location.hash.replace(/^#/,"")||"/"),x=Ke(()=>!!I.get()&&!!m.get());$(()=>{let e=I.get();La(e)});Ea(()=>{I.set(null),m.set(null),k.set("/login"),l("Session expired. Please log in.","error")})});var qa={};w(qa,{HomePage:()=>ye});function ye(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=m.get();gr(e),e.appendChild(fr(t)),e.appendChild(vr()),e.appendChild(hr(t))}}function Y(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}async function gr(e){X&&(clearInterval(X),X=null);let t=Y("div","welcome-popup","");t.innerHTML=`
        <strong>JM Job:</strong>
        <span id="notice-banner-text">Loading updates\u2026</span>
        <button class="welcome-popup__close" aria-label="Close">Got it</button>
    `,t.querySelector("button").addEventListener("click",()=>{X&&(clearInterval(X),X=null),t.remove()}),e.appendChild(t);let a=t.querySelector("#notice-banner-text");try{let s=await c.notices(),r=Array.isArray(s.notices)&&s.notices.length?s.notices:["Complete tasks, watch ads, refer friends, and withdraw anytime."],i=typeof s.interval=="number"&&s.interval>0?s.interval:4,n=0;a.textContent=r[0],r.length>1&&(X=setInterval(()=>{n=(n+1)%r.length,a.style.opacity="0",setTimeout(()=>{a.textContent=r[n],a.style.opacity="1"},200)},i*1e3))}catch{a.textContent="Complete tasks, watch ads, refer friends, and withdraw anytime."}}function fr(e){let t=Y("div","card card--user-header"),a=Y("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function vr(){let e=Y("div","icon-grid");return[{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg",tone:"blue"},{path:"/webtask",label:"Tasks",icon:"bi-telegram",tone:"blue"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=Y("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),b(a.path)}),e.appendChild(s)}),e}function hr(e){let t=Y("div","card card--daily-mission"),a=e&&e.today_ads||0,s=e&&e.ads_limit||50,r=Math.min(100,a/Math.max(1,s)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${s} | Completed: ${a}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${r}%"></div>
        </div>
    `;let i=Y("button","btn btn--primary btn--xl","\u{1F381} Claim Daily Bonus");return i.addEventListener("click",async()=>{try{let n=await fetch("/api/user/claim-daily-bonus",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Bearer "+(window.JMJOB_TOKEN||"")}}).then(o=>o.json());n.success?(l(n.message||"Daily bonus claimed!","success"),await E(),ye()()):l(n.message||"Bonus not available.","info")}catch{l("Could not claim. Try again later.","error")}}),t.appendChild(i),t}var X,ot=f(()=>{v();y();X=null});var lt={};w(lt,{WebTaskPage:()=>ne});function ne(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await c.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(yr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function yr(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${ja(e.title)}</h3>
        <p class="card__sub">${ja(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>wr(e,a,t)),t}async function wr(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{s+=1;let d=r-s;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",s>=r&&(clearInterval(o),_r(t,n,a))},1e3)}function _r(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await E(),ne()()}catch(s){l(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function ja(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var we=f(()=>{y();v()});var Pa={};w(Pa,{EarnPage:()=>_e});function _e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=m.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let s=e.querySelector("#watch-btn");s.disabled||s.addEventListener("click",()=>$r())}}function $r(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=s.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await Sr(e,"simulated",t))},1e3)},300)}async function Sr(e,t,a){try{let s=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await E(),e.remove(),_e()()}catch(s){l(s.message||"Reward failed","error"),e.remove()}}var ct=f(()=>{y();v()});var Ha={};w(Ha,{ReferPage:()=>dt});function dt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=m.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let r=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),l("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),l("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(s);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let g=document.createElement("div");g.className="refer-item",g.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Na(d.name)}</div>
                        <div class="refer-item__username">@${Na(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(g)})}}function Na(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var pt=f(()=>{y();v()});var Fa={};w(Fa,{WithdrawPage:()=>$e});function $e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=m.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await E(),$e()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let g=Object.values(d)[0];l(Array.isArray(g)?g[0]:g,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",i.forEach(n=>s.appendChild(kr(n))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function kr(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${ut(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${ut(e.gateway)} \xB7 ${ut(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function ut(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var mt=f(()=>{y();v()});var Ra={};w(Ra,{DepositPage:()=>bt});function bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=m.get();e.innerHTML=`
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
        `;try{_.loading=!0;let[s,r]=await Promise.all([c.paymentGateways(),c.paymentSubmissions()]);_.gateways=s.data.gateways,_.minAmount=s.data.min_amount,_.maxAmount=s.data.max_amount,_.submissions=r.data,Ia(),Ba()}catch(s){l("Failed to load deposit info: "+s.message,"error")}finally{_.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!_.selectedGateway){l("Please select a payment method.","error");return}let r=new FormData(a),i=document.getElementById("deposit-submit-btn");i.disabled=!0,i.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let n=await c.paymentSubmit({gateway:_.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});l(n.message||"Payment submitted.","success"),a.reset();let o=await c.paymentSubmissions();_.submissions=o.data,Ba(),await E();let d=m.get(),g=document.getElementById("deposit-balance");g&&d&&(g.textContent="\u09F3"+parseFloat(d.role==="poster"?d.wallet_balance||0:d.balance||0).toFixed(2))}catch(n){l(n.message||"Failed to submit payment.","error")}finally{i.disabled=!1,i.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function Ia(){let e=document.getElementById("payment-gateways");if(e){if(_.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=_.gateways.map(t=>`
        <button class="payment-gateway ${_.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${Z(t.label)}</div>
                <div class="payment-gateway__number">${Z(t.wallet_number)}</div>
            </div>
            ${_.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{_.selectedGateway=t.getAttribute("data-gateway"),Ia(),xr()})})}}function xr(){let e=_.gateways.find(i=>i.key===_.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${Z(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${Z(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{l("Wallet number copied.","info")}).catch(()=>{l("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=_.minAmount,r.max=_.maxAmount,r.placeholder=`${_.minAmount} \u2013 ${_.maxAmount}`)}function Ba(){let e=document.getElementById("payment-history");if(e){if(_.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=_.submissions.map(t=>{let a=Tr[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${Z((t.gateway||"").toUpperCase())} \u2022 TRX: ${Z(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Lr(t.created_at)}</div>
            </div>
        `}).join("")}}function Lr(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Tr,_,gt=f(()=>{y();v();Tr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},_={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var vt={};w(vt,{ProfilePage:()=>Se});function Se(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=m.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?ft(t.name):""}</h2>
                <p class="card__sub">@${t?ft(t.username):""}</p>
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
        `;let a=e.querySelector("#ad-history");try{let r=(await c.adHistory()).data||[];if(r.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let i=a.querySelector(".ad-history__list");r.forEach(n=>{let o=document.createElement("div");o.className="ad-history__row",o.innerHTML=`
                        <span class="ad-history__provider">${ft(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function ft(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ke=f(()=>{y();v()});var Da={};w(Da,{default:()=>Te});async function Te(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var ht=f(()=>{v()});var Oa={};w(Oa,{default:()=>xe});async function xe(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var yt=f(()=>{v()});var Ua={};w(Ua,{default:()=>Le});async function Le(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var wt=f(()=>{v()});function Er(){let e=localStorage.getItem(Ja);return e==="dark"||e==="light"?e:"system"}function Ar(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function _t(e){let t=Ar(e);document.documentElement.setAttribute("data-theme",t)}function Wa(){let e=j.get();j.set(e==="dark"?"light":"dark")}function Ga(e){j.set(e)}function Cr(){let e=localStorage.getItem(za);return e&&$t.includes(e)?e:"default"}function Va(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function Xa(e){$t.includes(e)&&oe.set(e)}function Ya(){return $t}var Ja,j,za,$t,oe,St=f(()=>{q();Ja="jmjob_theme";j=A(Er());_t(j.get());$(()=>{let e=j.get();_t(e),localStorage.setItem(Ja,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{j.get()==="system"&&_t("system")});za="jmjob_color_theme",$t=["default","emerald","amber","rose"];oe=A(Cr());Va(oe.get());$(()=>{let e=oe.get();Va(e),localStorage.setItem(za,e)})});var Ka={};w(Ka,{default:()=>Ae});async function Ae(){let e=document.querySelector("[data-view]");if(!e)return;let t=m.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=j.get(),s=oe.get(),r=Ya();e.innerHTML=`
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
                        <div class="settings-value">${Ee[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${r.map(o=>`
                            <button class="theme-swatch ${o===s?"is-active":""}" data-color="${o}" role="radio" aria-checked="${o===s}" title="${Ee[o]||o}">
                                <span class="theme-swatch__chip" style="background: ${Mr[o]};"></span>
                                <span class="theme-swatch__label">${(Ee[o]||o).split(" ")[0]}</span>
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
    `;let i=document.getElementById("theme-mode-group");i&&i.querySelectorAll("button[data-mode]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-mode");Ga(d),l(`Theme mode set to ${d}.`,"info")})});let n=document.getElementById("color-theme-group");n&&n.querySelectorAll("button[data-color]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-color");Xa(d),l(`Accent color set to ${Ee[d]||d}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await he(),l("Logged out.","info")})}var Ee,Mr,kt=f(()=>{v();St();Ee={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},Mr={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var Qa={};w(Qa,{NotificationsPage:()=>Tt});function Tt(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await c.notificationsReadAll(),l("All notifications marked as read.","success"),await Za()}catch(t){l(t.message||"Could not update notifications.","error")}}),await Za())}}async function Za(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await c.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(qr).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await c.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){l(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${le(t.message||"unknown error")}</p>`}}function qr(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${le(t.action_url)}">Open</a>`:"",i=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${le(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${le(t.title||"Notification")}</h3><p>${le(t.message||"")}</p><small>${jr(e.created_at)}</small></div><div class="notifications-page__actions">${r}${i}</div></article>`}function jr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function le(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var xt=f(()=>{y();v()});var es={};w(es,{TgTasksPage:()=>Me});function Me(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await c.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Pr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Pr(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${Ce(e.channel_name)}</strong>
                <span class="muted">${Ce(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${Ce(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${Ce(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Nr(e,t)},3e3)})}return t}async function Nr(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await E(),Me()()}catch(s){l(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Ce(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Lt=f(()=>{y();v()});var ss={};w(ss,{PosterDashboardPage:()=>At});function At(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-dashboard";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),b("/poster/post-job")}),await ts()}}async function ts(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await c.posterStats();Fr(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${as(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",ts),l(t.message||"Failed to load poster statistics.","error")}}function Fr(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=Et(t.wallet_balance),i=Et(t.frozen_balance),n=Et(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${qe("bi-briefcase","Total jobs",a.total||0)}
            ${qe("bi-lightning-charge","Active jobs",s)}
            ${qe("bi-wallet2","Available wallet",r,"\u09F3")}
            ${qe("bi-lock","In escrow",i,"\u09F3")}
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
                    ${Q("open",a.open)}
                    ${Q("in_review",a.in_review)}
                    ${Q("assigned",a.assigned)}
                    ${Q("submitted",a.submitted)}
                    ${Q("revision",a.revision)}
                    ${Q("completed",a.completed)}
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
    `,e.querySelectorAll("[data-poster-link]").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault(),b(o.getAttribute("href").replace(/^#/,""))})})}function qe(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${as(String(a))}</strong>
        </div>
    `}function Q(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Br(e)}"></i> ${Hr[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Br(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function Et(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function as(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Hr,Ct=f(()=>{y();v();Hr={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var rs={};w(rs,{PostJobPage:()=>Mt});function Mt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--post-job",!Or()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,e.querySelector("#post-job-cancel").addEventListener("click",()=>b("/poster")),await Ir(e),Rr(e)}}}async function Ir(e){let t=e.querySelector("#post-job-category");try{let s=(await c.categories()).data||[];t.innerHTML=s.length?'<option value="">Choose a category\u2026</option>'+s.map(r=>`<option value="${Number(r.id)}">${Ur(r.name)}</option>`).join(""):'<option value="">No active categories</option>'}catch(a){t.innerHTML='<option value="">Unable to load categories</option>',l(a.message||"Could not load categories.","error")}}function Rr(e){let t=e.querySelector("#post-job-form");t.addEventListener("submit",async a=>{a.preventDefault();let s=new FormData(t),r=e.querySelector("#post-job-submit");r.disabled=!0,r.textContent="Publishing\u2026";try{await c.posterCreateJob({category_id:Number(s.get("category_id")),title:String(s.get("title")||"").trim(),description:String(s.get("description")||"").trim(),requirements:String(s.get("requirements")||"").trim()||null,budget:Number(s.get("budget")),deadline_at:Dr(s.get("deadline_at")),bidding_window_hours:Number(s.get("bidding_window_hours"))}),l("Job published successfully.","success"),b("/poster/jobs")}catch(i){l(i.message||"Could not publish job.","error")}finally{r.disabled=!1,r.textContent="Publish job"}})}function Dr(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function Or(){return!!m.get()}function Ur(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var qt=f(()=>{y();v()});var ns={};w(ns,{PosterJobsPage:()=>jt});function jt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!zr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${Jr.map(t=>`<option value="${t}" ${t===Pe?"selected":""}>${t?is(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),b("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{Pe=t.target.value,await je()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",je),await je()}}}async function je(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await c.posterMyJobs()).data||[]).filter(s=>!Pe||s.status===Pe);e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(Wr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${ee(t.message||"unknown error")}</p>`}}}function Wr(e){let t=document.createElement("article");return t.className=`admin-row poster-job-row poster-job-row--${ee(e.status)}`,t.innerHTML=`
        <div class="poster-job-row__header">
            <div><strong>${ee(e.title)}</strong><span class="badge">${ee(is(e.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${ee(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${ee(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(e.bid_count||0)}</span><span><strong>Views:</strong> ${Number(e.view_count||0)}</span><span><strong>Created:</strong> ${Vr(e.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${["completed","cancelled"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>b(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>Gr(e.id)),t}async function Gr(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await c.posterCancelJob(e,{reason:t}),l("Job cancelled.","success"),await je()}catch(a){l(a.message||"Could not cancel job.","error")}}function zr(){return!!m.get()}function is(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Vr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ee(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Jr,Pe,Pt=f(()=>{y();v();Jr=["","open","assigned","submitted","revision","completed","cancelled","disputed"],Pe=""});var os={};w(os,{PosterWalletPage:()=>Ht});function Ht(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=m.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([c.posterStats(),c.paymentSubmissions()]);Xr(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Ne(a.message||"unknown error")}</p>`}}}function Xr(e,t,a){let s=Nt(t.wallet_balance),r=Nt(t.frozen_balance),i=Nt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${Yr(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>b("/deposit"))}function Yr(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Ne((t.gateway||"").toUpperCase())}</strong><small>${Ne(t.trxid)} \xB7 ${Kr(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Ne(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function Nt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function Kr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Ne(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ft=f(()=>{y();v()});var ds={};w(ds,{AdminPage:()=>It});function It(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(r=>{r.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),r.classList.add("admin-tab--active"),ls(r.dataset.tab,s)})}),ls("stats",s)}}async function ls(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([c.adminStats(),c.adminRevenue()]),r=a.data||{},i=s.data||{},n=i.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${W("bi-graph-up-arrow","Platform revenue",Bt(i.platform_revenue,n))}
                    ${W("bi-percent","Commission rate",`${(Number(i.commission_rate||0)*100).toFixed(2)}%`)}
                    ${W("bi-briefcase","Total jobs",G(i.total_jobs))}
                    ${W("bi-check2-circle","Completed jobs",G(i.completed_jobs))}
                    ${W("bi-lightning-charge","Active jobs",G(i.active_jobs))}
                    ${W("bi-people","Total users",G(i.total_users))}
                    ${W("bi-hourglass-split","Pending deposits",G(i.pending_payments))}
                    ${W("bi-lock","Held in escrow",Bt(i.escrow_total,n))}
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
                        <div><span class="muted">Lifetime paid</span><strong>${Bt(r.total_lifetime_paid,n)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${L(i.currency||"BDT")}</strong> currency \xB7 <strong>${L(i.escrow_mode||"full_bid")}</strong> escrow</div>
                </div>
                <div class="card admin-config-card">
                    <div>
                        <strong>System Maintenance</strong>
                        <p class="muted" style="margin:0; font-size:12px;">Reset daily user ad view limits and daily bonus claim timers for all users.</p>
                    </div>
                    <button class="btn btn--danger btn--sm" id="btn-reset-counters"><i class="bi bi-arrow-counterclockwise"></i> Reset Daily Counters</button>
                </div>
            `;let o=t.querySelector("#btn-reset-counters");o&&o.addEventListener("click",async()=>{if(confirm("Reset daily ad view counters for all users?"))try{let d=await c.adminResetDailyCounters();l(d.message||"Daily counters reset.","success")}catch(d){l(d.message||"Reset failed.","error")}})}else if(e==="withdrawals"){let s=(await c.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let r=t.querySelector("#wd-list");s.forEach(i=>r.appendChild(cs(i,r))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);r.innerHTML="",(n.data||[]).forEach(o=>r.appendChild(cs(o,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),i=Number(m.get()?.id||0);s.forEach(n=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${L(n.name)}</strong>
                        <span class="muted">${L(n.email)}</span>
                        <span class="badge user-role-badge">${L(n.role||(n.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(n.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(n.lifetime_earned||0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(n.id)===i?"disabled":""}>
                                ${["worker","poster","admin"].map(g=>`<option value="${g}" ${(n.role||(n.is_admin?"admin":"worker"))===g?"selected":""}>${g[0].toUpperCase()+g.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let d=o.querySelector(".admin-user-role");d?.addEventListener("change",async()=>{let g=n.role||(n.is_admin?"admin":"worker");try{let h=await c.adminUpdateUserRole(n.id,d.value);n.role=h.data?.role||d.value,n.is_admin=!!h.data?.is_admin,o.querySelector(".user-role-badge").textContent=n.role.toUpperCase(),l("User role updated","success")}catch(h){d.value=g,l(h.message||"Role update failed","error")}}),r.appendChild(o)})}else if(e==="providers"){let s=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(i=>r.appendChild(Zr(i,r)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function W(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${L(t)}</span>
            <strong>${L(String(a))}</strong>
        </div>
    `}function G(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Bt(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function cs(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${L(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${L(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${L(e.gateway)} \xB7 ${L(e.wallet_address)}</div>
        <div class="admin-row__status">${L(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),s.appendChild(r),s.appendChild(i),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function Zr(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
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
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}function L(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Rt=f(()=>{y();v();v()});var ms={};w(ms,{AdminPaymentsPage:()=>Ot});function Ot(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{R.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),Dt()})}),await Dt()}}async function Dt(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminPayments(R.status);R.items=t.data||[],ei(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${K(t.message||"Failed to load.")}</p>`}}}function ei(e){if(R.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",R.items.forEach(t=>e.appendChild(ti(t)))}function ti(e){let t=Qr[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${K((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${K(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${K(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${K(e.user.name)} <span class="muted">(${K(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${us(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${us(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${K(e.admin_note)}</div>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>ps(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>ps(e.id,"reject",a))),a}async function ps(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let i=await(t==="approve"?c.adminApprovePayment:c.adminRejectPayment)(e,{note:s||null});l(i.message||"Done.","success"),await Dt()}catch(r){l(r.message||"Action failed.","error")}}function us(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function K(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Qr,R,Ut=f(()=>{y();v();Qr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},R={status:"pending",items:[],loading:!1}});var gs={};w(gs,{AdminJobsPage:()=>Gt});function Gt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-jobs",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${ai.map(t=>`<option value="${t}" ${t===Wt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-job-status").addEventListener("change",async t=>{Wt=t.target.value,await ce()}),e.querySelector("#admin-job-refresh").addEventListener("click",ce),await ce()}}}async function ce(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminJobs(Wt)).data||[];e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(si(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${H(t.message||"unknown error")}</p>`}}}function si(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${H(e.status)}`;let a=e.worker?`${H(e.worker.name)} <span class="muted">(${H(e.worker.email||"")})</span>`:'<span class="muted">Unassigned</span>';t.innerHTML=`
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
            <span class="muted">Updated ${ii(e.updated_at||e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let s=t.querySelector(".admin-row__actions");return["completed","cancelled","disputed"].includes(e.status)||s.appendChild(Jt("Mark disputed","btn--danger",()=>ri(e.id))),e.status==="disputed"&&(s.appendChild(Jt("Release payment","btn--success",()=>bs(e.id,"release"))),s.appendChild(Jt("Cancel and refund","btn--danger",()=>bs(e.id,"cancel")))),t}function Jt(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function ri(e){if(confirm("Flag this job for admin dispute review?"))try{await c.adminFlagJobDispute(e),l("Job flagged for dispute review.","success"),await ce()}catch(t){l(t.message||"Could not flag job.","error")}}async function bs(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await c.adminResolveJob(e,{resolution:t,reason:s}),l(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await ce()}catch(r){l(r.message||"Could not resolve dispute.","error")}}function ii(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function H(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ai,Wt,zt=f(()=>{y();v();ai=["","open","in_review","assigned","submitted","revision","disputed","completed","cancelled","expired"],Wt=""});var fs={};w(fs,{AdminTransactionsPage:()=>Yt});function Yt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${ni.map(t=>`<option value="${t}" ${t===Xt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{Xt=t.target.value,await Vt()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",Vt),await Vt()}}}async function Vt(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminTransactions({type:Xt})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(oi(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${D(t.message||"unknown error")}</p>`}}}function oi(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${D(e.type)}`,t.innerHTML=`
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
            <span><strong>Date:</strong> ${li(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${D(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${D(e.reference)}</code>`:""}
    `,t}function li(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function D(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ni,Xt,Kt=f(()=>{y();v();ni=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],Xt=""});var vs={};w(vs,{AdminReportsPage:()=>Zt});function Zt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!m.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Reports</h1>
            <p class="muted">Aggregated transaction volume and marketplace job value by status.</p>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,await ci()}}}async function ci(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await c.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${He("Transactions",Fe(s.transaction_count))}
                ${He("Transaction volume",Be(s.transaction_volume))}
                ${He("Jobs",Fe(s.job_count))}
                ${He("Job value",Be(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${di(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${pi(a.jobs||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${de(t.message||"unknown error")}</p>`}}function He(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${de(e)}</span><strong>${de(t)}</strong></div>`}function di(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${de(String(t.type||"").replace("_"," "))}</strong><small>${Fe(t.transaction_count)} entries</small></span>
            <strong>${Be(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function pi(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${de(String(t.status||"").replace("_"," "))}</strong><small>${Fe(t.job_count)} jobs</small></span>
            <strong>${Be(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function Fe(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Be(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function de(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Qt=f(()=>{y();v()});var hs={};w(hs,{LoginPage:()=>ea});function ea(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${ui(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{let n=await Aa(r.get("email"),r.get("password"));l("Welcome back!","success"),n&&n.is_admin?b("/admin"):b("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function ui(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ta=f(()=>{v()});var ws={};w(ws,{RegisterPage:()=>sa});function sa(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",r=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your email</h1>','<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',aa(a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",r()}),e.querySelector("#register-otp-form").addEventListener("submit",n);return}let o=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+aa(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',o,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+aa(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",i)},i=async o=>{o.preventDefault();let d=o.currentTarget,g=new FormData(d),h=d.querySelector('button[type="submit"]');h.disabled=!0,h.textContent="Sending code\u2026",a={name:String(g.get("name")||"").trim(),email:String(g.get("email")||"").trim().toLowerCase(),password:String(g.get("password")||""),password_confirmation:String(g.get("password_confirmation")||""),referral_code:String(g.get("referral_code")||"")};try{await Ca(a),t="otp",l("Verification code sent. It expires in 15 minutes.","success"),r()}catch(M){l(ys(M)||"Could not send the verification code.","error"),h.disabled=!1,h.textContent="Send verification code"}},n=async o=>{o.preventDefault();let d=o.currentTarget,g=d.querySelector('button[type="submit"]');g.disabled=!0,g.textContent="Verifying\u2026";try{await Ma({email:a.email,otp:String(new FormData(d).get("otp")||"").trim()}),l("Account created \u2014 welcome!","success"),b("/")}catch(h){l(ys(h)||"Invalid or expired verification code.","error"),g.disabled=!1,g.textContent="Verify and create account"}};r()}}function ys(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function aa(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ra=f(()=>{v()});var _s={};w(_s,{default:()=>Ie});async function Ie(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
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
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let r=t.email.value.trim();if(!r){l("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await c.forgotPassword({email:r}),l("If an account exists with this email, you will receive a reset code.","success"),b(`/reset-password?email=${encodeURIComponent(r)}`)}catch(i){l(i.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var ia=f(()=>{y();v()});var $s={};w($s,{default:()=>Re});async function Re(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${mi(a)}" placeholder="you@example.com" required autocomplete="email">
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
    `;let s=document.getElementById("reset-form"),r=document.getElementById("submit-btn");s.addEventListener("submit",async i=>{i.preventDefault();let n=s.email.value.trim(),o=s.otp.value.trim(),d=s.password.value,g=s.password_confirmation.value;if(!n||!o||!d){l("Please fill in all fields.","error");return}if(o.length!==6){l("Please enter a valid 6-digit code.","error");return}if(d!==g){l("Passwords do not match.","error");return}if(d.length<6){l("Password must be at least 6 characters.","error");return}r.disabled=!0,r.textContent="Resetting...";try{await c.resetPassword({email:n,otp:o,password:d,password_confirmation:g}),l("Password reset successfully! You can now log in.","success"),b("/login")}catch(h){l(h.message||"Failed to reset password.","error"),r.disabled=!1,r.textContent="Reset Password"}})}function mi(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var na=f(()=>{y();v()});var Gs={};w(Gs,{JobDetailPage:()=>vn});function vn(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=m.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await c.job(e),{job:r,bids:i,bid_count:n,my_bid:o}=s.data;hn(r,i,n,o,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${z(s.message||"unknown")}</p>`}}}function hn(e,t,a,s,r){let i=document.getElementById("job-detail-content");if(!i)return;let n=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,o=n?Math.max(0,Math.floor((n-Date.now())/1e3)):null,d=o!=null?_n(o):"\u2014",g=["open","in_review"].includes(e.status),h=!!s;i.innerHTML=`
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

        ${yn(e,t,s,r,g)}
    `,wn(e,s,r)}function yn(e,t,a,s,r){return a?`
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
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function wn(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await c.withdrawBid(t.id),l("Bid withdrawn.","success"),b(`/jobs/${e.id}`)}catch(i){l(i.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(s),n=document.getElementById("bid-submit-btn");n.disabled=!0,n.textContent="Submitting\u2026";try{await c.placeBid(e.id,{amount:parseFloat(i.get("amount")),delivery_days:parseInt(i.get("delivery_days"),10),proposal:String(i.get("proposal")||"").trim()}),l("Bid placed!","success"),b(`/jobs/${e.id}`)}catch(o){l(o.message||"Failed to place bid.","error")}finally{n.disabled=!1,n.textContent="Submit Bid"}})}function _n(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var zs=f(()=>{y();v()});var Ys={};w(Ys,{PosterJobDetailPage:()=>$n});function $n(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!Cn()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await Vs(e)}}}async function Vs(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await c.posterJobBids(e)).data||{};Sn(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${T(a.message||"unknown error")}</p>`}}function Sn(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${T(t.title)}</h1><p class="muted">${T(t.description||"")}</p></div><span class="badge badge--status badge--${T(t.status)}">${T(Mn(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${Xs(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${kn(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${Tn(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>xn(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>Ln(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>En(t.id,r.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>An(t.id))}function kn(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${T(a.status)}"><div class="poster-bid-row__main"><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">${T(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${T(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${T(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function Tn(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${T(a.status)}"><div><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${Xs(a.created_at)} \xB7 ${T(String(a.status||"").replace("_"," "))}</span><p>${T(a.description||"")}</p>${a.external_link?`<a href="${T(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${T(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function xn(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await c.posterAcceptBid(e,t),l("Worker selected and escrow held.","success"),await ma(e)}catch(a){l(a.message||"Could not select worker.","error")}}async function Ln(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await c.posterReleasePayment(e,{submission_id:Number(t)}),l("Payment released.","success"),await ma(e)}catch(a){l(a.message||"Could not release payment.","error")}}async function En(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await c.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),l("Revision requested.","success"),await ma(e)}catch(s){l(s.message||"Could not request revision.","error")}}async function An(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await c.posterCancelJob(e,{reason:"Cancelled by poster"}),l("Job cancelled.","success"),b("/poster/jobs")}catch(t){l(t.message||"Could not cancel job.","error")}}async function ma(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await Vs(e))}function Cn(){return!!m.get()}function Mn(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function Xs(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function T(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ks=f(()=>{y();v()});q();v();q();v();var De=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ot(),qa))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(we(),lt))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(we(),lt))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ct(),Pa))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pt(),Ha))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(mt(),Fa))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(gt(),Ra))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ke(),vt))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ht(),Da))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(yt(),Oa))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(wt(),Ua))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(kt(),Ka))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(xt(),Qa))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ke(),vt))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Lt(),es))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ct(),ss))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(qt(),rs))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Pt(),ns))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ft(),os))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Rt(),ds))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ut(),ms))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(zt(),gs))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Kt(),fs))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Qt(),vs))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ta(),hs))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ra(),ws))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ia(),_s))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(na(),$s))}],Hl=$(()=>{let e=k.get().split("?")[0]||"/";return De.find(t=>t.path===e)||De[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";k.set(e)});q();v();q();var bi=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],gi=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],fi=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function vi(){let e=m.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...gi];let t=[...bi];return e&&e.role==="poster"&&t.push({separator:!0},...fi),t}var Ss="sidebar_collapsed",te=A(localStorage.getItem(Ss)==="true");function hi(){let e=!te.get();te.set(e),localStorage.setItem(Ss,String(e))}function ks(){let e=()=>k.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${te.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar"},children:[yi(),wi(),_i()]}}function yi(){let e=()=>k.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]}]}}function wi(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>hi(),title:()=>te.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${te.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function _i(){return{tag:"nav",props:{class:"sidebar__nav"},children:vi().map(e=>e.header?$i(e.header):e.separator?Si():ki(e))}}function $i(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function Si(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function ki({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${k.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>te.get()?t:"",onclick:r=>{r.preventDefault(),b(e),xs()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function Ts(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>xs()},children:[]}}function xs(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}v();q();v();var Ti=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],xi=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],Li=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Ei(){let e=m.get();if(e&&e.is_admin)return xi;let t=[...Ti];return e&&e.role==="poster"&&t.push({separator:!0},...Li),t}function Ai({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${k.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),b(e),oa()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function Ci(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>oa()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function Mi(){return{tag:"nav",props:{class:"mobile-nav__list"},children:Ei().map(e=>e.separator?qi():Ai(e))}}function qi(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Ls(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[Ci(),Mi()]}}function Es(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>oa()},children:[]}}function As(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function oa(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}St();y();function Cs(){return N(()=>x.get(),()=>Ii(),()=>Bi())}function Ms(){let e=()=>{let t=j.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>Wa(),"data-theme":()=>j.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function ji(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function Pi(){return setTimeout(Ni,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),ji()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[Fi("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function Ni(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await c.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],r=Number(a.meta?.unread_count||s.filter(i=>!i.read).length||0);t.textContent=r>99?"99+":String(r),e.innerHTML=s.length?s.map(Hi).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(i=>{i.addEventListener("click",async()=>{let n=i.getAttribute("data-notification-id");if(!(!n||i.getAttribute("data-read")==="1"))try{await c.notificationRead(n),i.setAttribute("data-read","1"),i.classList.remove("topbar-notification--unread");let o=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(o)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function Hi(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${Oe(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${Oe(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${Oe(t.title||"Notification")}</div><div class="topbar-notification__text">${Oe(t.message||"")}</div>${r?`<a class="topbar-notification__action"${r}>Open</a>`:""}</div></li>`}function Oe(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Fi(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function Bi(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Ms(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Ii(){let e=m.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>As(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Ms(),Pi(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await he(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}v();q();function qs(){return N(()=>!!ie.get(),()=>{let e=ie.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}y();function js(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{c.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let r=[];a.facebook&&r.push(`<a href="${Ue(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&r.push(`<a href="${Ue(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&r.push(`<a href="${Ue(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&r.push(`<a href="${Ue(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=r.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function Ue(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}v();var Ri=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/profile",label:"Account",icon:"bi-person-circle"}],Di=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}];function Oi(){let e=m.get();return e&&e.is_admin?Di:Ri}function Ui({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${k.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),b(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function Ji(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function Wi(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:Oi().map(e=>e.separator?Ji():Ui(e))}}function Ps(e){let t=e==="left";return{tag:"button",props:{class:`hnav__scroll hnav__scroll--${e}`,id:`hnav-scroll-${e}`,type:"button","aria-label":t?"Scroll left":"Scroll right",onclick:a=>{a.preventDefault(),Gi(t?-1:1)}},children:[{tag:"i",props:{class:`bi ${t?"bi-chevron-left":"bi-chevron-right"}`},children:[]}]}}function Gi(e){let t=document.getElementById("hnav-list");if(!t)return;let a=Math.max(120,Math.round(t.clientWidth*.7));t.scrollBy({left:e*a,behavior:"smooth"})}function la(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&la()},!0),window.addEventListener("resize",()=>setTimeout(la,50)),document.addEventListener("hnav:rendered",()=>setTimeout(la,0)));function Ns(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[Ps("left"),Wi(),Ps("right")]}}function Hs(){let e=()=>!!m.get()?.is_admin,t=()=>k.get().startsWith("/admin"),a=()=>x.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[N(()=>x.get(),()=>ks(),()=>null),N(()=>x.get(),()=>Ts(),()=>null),N(()=>x.get(),()=>Ls(),()=>null),N(()=>x.get(),()=>Es(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[Cs(),N(()=>x.get()&&!e(),()=>Ns(),()=>null),{tag:"main",props:{class:"app-main"},children:[zi()]},js()]},qs()]}}function zi(){let t=k.get().split("?")[0]||"/",a=De.find(r=>r.path===t),s=m.get();return s&&s.is_admin&&!t.startsWith("/admin")?(b("/admin"),ca()):a?a.requireAuth&&!x.get()?(b("/login"),ca()):a.requireAdmin&&(!m.get()||!m.get().is_admin)?Yi():!a.requireAuth&&x.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(b("/"),ca()):Vi(a):Xi()}function Vi(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function Xi(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function Yi(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>b("/")},children:["Go home"]}]}}function ca(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}q();v();ot();ta();ra();ia();na();pt();we();ct();Lt();mt();ke();Rt();Ut();gt();ht();yt();wt();kt();y();v();var u={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function Bs(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
            <div class="page-heading-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h1 class="page-title" style="margin-bottom: 0.25rem;">Browse Jobs</h1>
                    <p class="muted" style="margin: 0;">Find work that matches your skills. Place a bid to get started.</p>
                </div>
                <a href="#/poster/post-job" class="btn btn--primary"><i class="bi bi-plus-lg"></i> Post a Job</a>
            </div>

            <div class="card jobs-filters">
                <div class="jobs-filters__row">
                    <label class="jobs-filters__field jobs-filters__field--search">
                        <span>Search</span>
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${F(u.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${Fs()}
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
        `,u.categories.length===0)try{let t=await c.categories();u.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=Fs())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{Ki(),u.page=1,Je()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{u.search="",u.categoryId="",u.minBudget="",u.maxBudget="",u.sort="latest",u.page=1,Zi(),Je()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await Je()}}}function Fs(){return'<option value="">All categories</option>'+u.categories.map(e=>`<option value="${F(e.id)}" ${String(e.id)===String(u.categoryId)?"selected":""}>${F(e.name)}</option>`).join("")}function Ki(){u.search=document.getElementById("jobs-search")?.value.trim()||"",u.categoryId=document.getElementById("jobs-category")?.value||"",u.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",u.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",u.sort=document.getElementById("jobs-sort")?.value||"latest"}function Zi(){let e={"jobs-search":u.search,"jobs-category":u.categoryId,"jobs-min-budget":u.minBudget,"jobs-max-budget":u.maxBudget,"jobs-sort":u.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function Je(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++u.requestSerial;u.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:u.page,per_page:u.perPage,sort:u.sort};u.search&&(a.search=u.search),u.categoryId&&(a.category_id=u.categoryId),u.minBudget!==""&&(a.min_budget=u.minBudget),u.maxBudget!==""&&(a.max_budget=u.maxBudget);let s=await c.jobs(a);if(t!==u.requestSerial)return;u.jobs=Array.isArray(s.data)?s.data:[],u.total=Number(s.meta?.total||0),u.lastPage=Math.max(1,Number(s.meta?.last_page||1)),Qi()}catch(a){if(t!==u.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${F(a.message||"unknown error")}</p>`,Is(),Rs()}finally{t===u.requestSerial&&(u.loading=!1)}}function Qi(){let e=document.getElementById("jobs-grid");if(e){if(Is(),Rs(),u.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=u.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${F(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${en(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${F(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${F(t.title)}</h3>
            <p class="job-card__desc">${F(tn(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.budget||0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.bid_count||0)} bid${Number(t.bid_count)===1?"":"s"}</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function Is(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(u.total===0){e.textContent="No open jobs found";return}let t=(u.page-1)*u.perPage+1,a=Math.min(u.page*u.perPage,u.total);e.textContent=`Showing ${t}-${a} of ${u.total} open jobs`}function Rs(){let e=document.getElementById("jobs-pagination");if(e){if(u.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page-1}" ${u.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${u.page} of ${u.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page+1}" ${u.page>=u.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>u.lastPage||a===u.page||(u.page=a,Je())})})}}function en(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function tn(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function F(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var da={bids:[],loading:!1};function Ds(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await c.workerBids();da.bids=t.data||[],an()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${Os(t.message||"unknown")}</p>`}}}}function an(){let e=document.getElementById("bids-list");if(e){if(da.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=da.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${Os(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${sn(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),b(`/jobs/${t.getAttribute("data-id")}`)})})}}function sn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Os(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var pe={jobs:[],submissions:[],loading:!1};function pa(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([c.workerActiveJobs(),c.workerSubmissions()]);pe.jobs=t.data||[],pe.submissions=a.data||[],rn()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${ua(t.message||"unknown")}</p>`}}}}function rn(){let e=document.getElementById("active-jobs-list");if(e){if(pe.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=pe.jobs.map(t=>{let a=pe.submissions.find(r=>r.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${ua(t.title)}</h3>
                        <div class="muted">Budget: \u09F3${parseFloat(t.budget).toFixed(2)}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?nn(t,a):on(t)}
            </div>
        `}).join(""),ln()}}function nn(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${cn(t.created_at)}
            <div class="muted">${ua((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function on(e){return`
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
    `}function ln(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),r=e.querySelector("[data-submit-btn]");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await c.submitWork(a,{description:String(s.get("description")||"").trim(),external_link:String(s.get("external_link")||"").trim()||null}),l("Work submitted!","success"),pa()()}catch(i){l(i.message||"Failed to submit.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Work'}})})}function cn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function ua(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var We={categories:[],loading:!1};function Us(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,pn(),await Ge()}}async function Ge(){let e=document.getElementById("cat-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminCategories();We.categories=t.data||[],dn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${ue(t.message||"unknown")}</p>`}}}function dn(){let e=document.getElementById("cat-list");if(e){if(We.categories.length===0){e.innerHTML='<p class="muted">No categories yet. Add one below.</p>';return}e.innerHTML=We.categories.map(t=>`
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
    `).join(""),e.querySelectorAll("[data-toggle]").forEach(t=>t.addEventListener("click",()=>un(t.getAttribute("data-toggle")))),e.querySelectorAll("[data-delete]").forEach(t=>t.addEventListener("click",()=>mn(t.getAttribute("data-delete"))))}}function pn(){let e=document.getElementById("cat-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();let a=new FormData(e),s={name:String(a.get("name")||"").trim(),slug:String(a.get("slug")||"").trim().toLowerCase(),description:String(a.get("description")||"").trim()||null,icon_class:String(a.get("icon_class")||"").trim()||null,display_order:parseInt(a.get("display_order")||"0",10),is_active:a.get("is_active")==="on"},r=document.getElementById("cat-save-btn");r.disabled=!0,r.textContent="Creating\u2026";try{await c.adminCreateCategory(s),l("Category created.","success"),e.reset(),await Ge()}catch(i){l(i.message||"Failed.","error")}finally{r.disabled=!1,r.textContent="Create Category"}})}async function un(e){let t=We.categories.find(a=>String(a.id)===String(e));if(t)try{await c.adminUpdateCategory(e,{is_active:!t.is_active}),l(t.is_active?"Category disabled.":"Category enabled.","success"),await Ge()}catch(a){l(a.message||"Failed.","error")}}async function mn(e){if(confirm("Delete this category? It will be deactivated if jobs are attached."))try{let t=await c.adminDeleteCategory(e);l(t.message||"Done.","success"),await Ge()}catch(t){l(t.message||"Failed.","error")}}function ue(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}y();v();var O={grouped:{},social:{},noticesData:{interval:4,notices:[]},loading:!1};function Js(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=m.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await Ws()}}async function Ws(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a,s]=await Promise.all([c.adminSettings(),c.socialLinks(),c.notices()]);O.grouped=t.data||{},O.social=a||{},O.noticesData=s||{interval:4,notices:[]},bn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${P(t.message||"unknown")}</p>`}}}function bn(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(O.grouped).map(n=>`
        <div class="card settings-group">
            <h3 class="card__title">${P(n.charAt(0).toUpperCase()+n.slice(1))}</h3>
            <div class="settings-group__rows">
                ${O.grouped[n].map(o=>gn(n,o)).join("")}
            </div>
        </div>
    `).join(""),s=O.noticesData,r=Array.isArray(s.notices)?s.notices.join(`
`):"";a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-megaphone me-2"></i>Homepage Popup Banner Notices</h3>
            <p class="muted mb-3" style="font-size:13px;">Manage notices displayed at the top of the user dashboard. Enter <strong>one notice per line</strong> to show multiple notices in rotaton.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="notice-interval" class="settings-row__label">
                        <strong>Rotation Interval (seconds)</strong>
                        <span class="muted">Time period each notice stays visible before changing (default: 4 seconds if left blank).</span>
                    </label>
                    <div class="settings-row__control">
                        <input type="number" min="1" step="1" id="notice-interval" value="${s.interval||4}" placeholder="4" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="notice-messages" class="settings-row__label">
                        <strong>Notice Messages (One per line)</strong>
                        <span class="muted">Write multiple lines to rotate automatically.</span>
                    </label>
                    <div class="settings-row__control">
                        <textarea id="notice-messages" rows="4" class="settings-row__input" placeholder="Complete tasks, watch ads, refer friends, and withdraw anytime.">${P(r)}</textarea>
                    </div>
                </div>
            </div>
        </div>
    `;let i=O.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${P(i.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${P(i.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${P(i.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${P(i.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",fn)}function gn(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${P(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${P(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${P(t.key)}</strong>
                <span class="muted">${P(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function fn(){let e={};for(let r of Object.keys(O.grouped))for(let i of O.grouped[r]){let n=`set-${i.key.replace(/[^a-z0-9]/gi,"_")}`,o=document.getElementById(n);if(!o)continue;let d;i.value_type==="boolean"?d=o.checked:i.value_type==="integer"||i.value_type==="percent"?d=parseInt(o.value,10):i.value_type==="decimal"?d=parseFloat(o.value):i.value_type==="json"?d=o.value?JSON.parse(o.value):null:d=o.value,e[i.key]=d}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},a={interval:document.getElementById("notice-interval")?.value||4,notices:document.getElementById("notice-messages")?.value||""},s=document.getElementById("settings-save-btn");s.disabled=!0,s.textContent="Saving\u2026";try{await Promise.all([c.adminUpdateSettings(e),c.adminUpdateSocialLinks(t),c.adminUpdateNotices(a)]),l("Settings, notices, and social links saved successfully.","success"),await Ws()}catch(r){l(r.message||"Failed to save.","error")}finally{s.disabled=!1,s.textContent="Save All Changes"}}function P(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}zt();Kt();Qt();Ct();qt();Pt();Ft();xt();var Zs={"/":ye,"/refer":dt,"/webtask":ne,"/tasks":ne,"/earn":_e,"/tg-tasks":Me,"/withdraw":$e,"/profile":Se,"/wallet":Se,"/admin":It,"/admin/payments":Ot,"/admin/categories":Us,"/admin/settings":Js,"/admin/jobs":Gt,"/admin/transactions":Yt,"/admin/reports":Zt,"/deposit":bt,"/leaderboard":Te,"/achievements":xe,"/support":Le,"/settings":Ae,"/jobs/available":Bs,"/worker/bids":Ds,"/worker/active-jobs":pa,"/poster":At,"/poster/post-job":Mt,"/poster/jobs":jt,"/poster/wallet":Ht,"/notifications":Tt,"/login":ea,"/register":sa,"/forgot-password":Ie,"/reset-password":Re};function Qs(){ze(),setTimeout(ze,50),window.addEventListener("hashchange",ze),$(()=>{x.get(),setTimeout(ze,0)})}async function ze(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!Zs[t]){let n=t.match(/^\/jobs\/(\d+)$/);if(n){let d=await Promise.resolve().then(()=>(zs(),Gs));await ba(()=>d.JobDetailPage(n[1]),t);return}let o=t.match(/^\/poster\/jobs\/(\d+)$/);if(o){if(!x.get()){b("/login");return}let d=await Promise.resolve().then(()=>(Ks(),Ys));await ba(()=>d.PosterJobDetailPage(o[1]),t);return}t="/"}let a=x.get(),s=m.get(),r=["/login","/register","/forgot-password","/reset-password"];if(r.includes(t)&&a){s&&s.is_admin?b("/admin"):b("/");return}if(!r.includes(t)&&!a){b("/login");return}if(t==="/"&&s&&s.is_admin){b("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){qn();return}let i=Zs[t];await ba(i,t)}async function ba(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function qn(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}v();var er=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();er.innerHTML="";B(Hs(),er);I.get()&&E();Qs();
