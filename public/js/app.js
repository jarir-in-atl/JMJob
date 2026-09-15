var gr=Object.defineProperty;var v=(e,t)=>()=>(e&&(t=e(e=0)),t);var _=(e,t)=>{for(var a in t)gr(e,a,{get:t[a],enumerable:!0})};function fr(e,t){La?La(e,t):console.error("[Ghost] Unhandled effect error:",e)}function P(e){let t=e,a=new Set;return{get(){return j&&(a.add(j),j.dependencies.add(a)),t},set(s){t!==s&&(t=s,Ea(a))}}}function Ea(e){rt(()=>{e.forEach(t=>{t.notify?t.notify():Se.add(t)})})}function rt(e){at++;try{e()}finally{if(at--,at===0){let t=Array.from(Se);Se.clear(),t.forEach(a=>a.run())}}}function k(e){let t={dependencies:new Set,run(){st(t),$e.push(j),j=t;try{e()}catch(a){fr(a,e)}finally{j=$e.pop()}},notify(){Se.add(t)}};return t.run(),()=>st(t)}function it(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,Ea(s))}};return{get(){if(j&&(s.add(j),j.dependencies.add(s)),a){st(r),$e.push(j),j=r;try{t=e()}finally{j=$e.pop()}a=!1}return t}}}function st(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var j,$e,Se,at,La,X=v(()=>{j=null,$e=[],Se=new Set,at=0,La=null});function ne(){nt.totalUpdates++,nt.recentUpdates++}var xe,nt,ot=v(()=>{xe=new Set,nt={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function U(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){vr(e,t);return}if(e.__ghostWhen){hr(e,t);return}if(e.__ghostLazy){yr(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;xe.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let i=s.startsWith("on");typeof r=="function"&&!i?e.effects.push(k(()=>{a.setAttribute(s,r()),ne(),e.events.update?.forEach(n=>n())})):i?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)U(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push(k(()=>{let i=s(),n=document.createTextNode(String(i??""));r?a.replaceChild(n,r):a.appendChild(n),r=n,ne(),e.events.update?.forEach(o=>o())}))}else U(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function oe(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),xe.delete(e)}}function vr(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function c(m){return m.el||null}let u=k(()=>{let m=a(),y=m.map(($,x)=>String(s($,x))),E=Array.from(o.keys());for(let $ of E)if(!y.includes($)){let x=o.get($);oe(x.ghostNode),o.delete($)}for(let $=0;$<m.length;$++){let x=y[$];if(!o.has(x)){let Q=r(m[$],$),D=document.createElement("ghost-list-slot");for(U(Q,D);D.firstChild;)t.insertBefore(D.firstChild,n);o.set(x,{ghostNode:Q})}}for(let $=y.length-1;$>=0;$--){let x=y[$],Q=o.get(x);if(!Q)continue;let D=c(Q.ghostNode);if(!D)continue;let we=y[$+1],_e=(we?c(o.get(we)?.ghostNode):null)||n;D.nextSibling!==_e&&t.insertBefore(D,_e)}ne()});e._listCleanup=()=>{u();for(let m of o.values())oe(m.ghostNode);o.clear(),i.remove(),n.remove()}}function I(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function hr(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=k(()=>{let u=a()?s:r;if(n&&(oe(n),n=null),u&&(n=u(),n)){let m=document.createElement("ghost-when-slot");for(U(n,m);m.firstChild;)t.insertBefore(m.firstChild,i)}ne()});e._whenCleanup=()=>{o(),n&&oe(n),i.remove()}}function yr(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let i=null;if(s){let n=document.createElement("ghost-lazy-slot");for(U(s,n);n.firstChild;)t.insertBefore(n.firstChild,r);i=s}a().then(n=>{let o=n.default||n;i&&(oe(i),i=null);let c=typeof o=="function"?o():o,u=document.createElement("ghost-lazy-slot");for(U(c,u);u.firstChild;)t.insertBefore(u.firstChild,r);i=c}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var lt=v(()=>{X();ot()});var Ca=v(()=>{X()});var ke=v(()=>{});var qa=v(()=>{ot()});var Aa=v(()=>{X()});var Ma=v(()=>{lt();X();ke();ke()});function _r(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let i={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){i["@attributes"]={};for(let n of r.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of r.childNodes){let o=n.nodeName,c=s(n);c!==""&&(i[o]===void 0?i[o]=c:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(c)))}return i}return s(a.documentElement)}function $r(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function dt(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),i={url:e,...s};for(let y of dt.interceptors.request)i=y(i)??i;let n=i.url;delete i.url;let o=$r(n,r);if(a==="memory"&&r==="GET"&&ct.has(o))return ct.get(o);let c=await fetch(n,i),u=c.headers.get("content-type")||"";if(!c.ok)throw new Error(`Ghost-HTTP Error: ${c.status} ${c.statusText}`);let m;u.includes("application/xml")||u.includes("text/xml")?m=_r(await c.text()):u.includes("application/json")?m=await c.json():m=await c.text();for(let y of dt.interceptors.response)m=y(c,m)??m;return a==="memory"&&r==="GET"&&ct.set(o,m),m}var ct,Na=v(()=>{ct=new Map;dt.interceptors={request:[],response:[]}});function pt(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=P(a);return k(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var Pa=v(()=>{X()});function Sr(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var go,ja=v(()=>{go=Sr()});var ho,xr,Ha=v(()=>{X();ho=P("en"),xr=new Map;xr.set("en",{})});var H=v(()=>{X();lt();Ca();ke();qa();Aa();Ma();Na();Pa();ja();Ha()});function Ia(e){Te=e}function kr(){return Te}function Fa(e){ut=e}async function p(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let i=e.startsWith("http")?e:Ba.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...s}};Te&&(n.headers.Authorization=`Bearer ${Te}`),a!==void 0&&(n.body=JSON.stringify(a)),r&&(n.signal=r);let o=await fetch(i,n);if(o.status===401)throw ut&&ut(),new le("Unauthorized",401,null);let c=null,u=o.headers.get("content-type")||"";try{if(u.includes("application/json"))c=await o.json();else{let m=await o.text();c=m?{message:m}:null}}catch{}if(!o.ok){let m=c&&c.message||`HTTP ${o.status}`;throw new le(m,o.status,c)}return c}var Ba,Te,ut,le,d,w=v(()=>{Ba=window.JMJOB_CONFIG||{apiBase:"/api"},Te=null,ut=null;le=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},d={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>p("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>p("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),forgotPassword:e=>p("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>p("/auth/reset-password",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/notifications${t?"?"+t:""}`)},notificationRead:e=>p(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>p("/notifications/read-all",{method:"POST"}),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminUpdateUserRole:(e,t)=>p(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminResetDailyCounters:()=>p("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>p("/payment/gateways"),paymentSubmit:e=>p("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>p("/payment/submissions"),adminPayments:(e="")=>p(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>p(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>p(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>p("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/jobs${t?"?"+t:""}`)},job:e=>p(`/jobs/${e}`),placeBid:(e,t)=>p(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>p(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>p("/worker/bids"),workerActiveJobs:()=>p("/worker/active-jobs"),submitWork:(e,t)=>p(`/jobs/${e}/submit`,{method:"POST",body:t}),workerSubmissions:()=>p("/worker/submissions"),posterStats:()=>p("/poster/stats"),posterCreateJob:e=>p("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>p("/poster/jobs"),posterJobBids:e=>p(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>p(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>p(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>p(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>p(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>p("/admin/categories"),adminCreateCategory:e=>p("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>p(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>p(`/admin/categories/${e}/delete`,{method:"POST"}),adminSubcategories:()=>p("/admin/subcategories"),adminCreateSubcategory:e=>p("/admin/subcategories",{method:"POST",body:e}),adminUpdateSubcategory:(e,t)=>p(`/admin/subcategories/${e}`,{method:"POST",body:t}),adminDeleteSubcategory:e=>p(`/admin/subcategories/${e}/delete`,{method:"POST"}),adminSettings:()=>p("/admin/settings"),adminUpdateSettings:e=>p("/admin/settings",{method:"POST",body:e}),socialLinks:()=>p("/social-links"),adminUpdateSocialLinks:e=>p("/admin/social-links",{method:"POST",body:e}),notices:()=>p("/notices"),adminUpdateNotices:e=>p("/admin/notices",{method:"POST",body:e}),adminUploadBannerImage:async e=>{let t=Ba.apiBase+"/admin/notices/upload",a={},s=kr();s&&(a.Authorization=`Bearer ${s}`);let r=await fetch(t,{method:"POST",headers:a,body:e}),i=await r.json();if(!r.ok)throw new le(i.message||"Upload failed",r.status,i);return i},adminJobs:(e="")=>p(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminFlagJobDispute:e=>p(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>p(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>p("/admin/reports"),adminRevenue:()=>p("/admin/revenue")}});function l(e,t="info",a=3500){ce.set({message:e,type:t,id:Date.now()}),mt&&clearTimeout(mt),mt=setTimeout(()=>ce.set(null),a)}async function A(){if(!O.get())return null;try{let e=await d.me();return g.set(e.data),e.data}catch{return null}}async function Ra(e,t){let a=await d.login({email:e,password:t});return O.set(a.data.token),g.set(a.data.user),a.data.user}async function Da(e){return d.requestRegistrationOtp(e)}async function Ua(e){let t=await d.verifyRegistrationOtp(e);return O.set(t.data.token),g.set(t.data.user),t.data.user}async function Le(){try{await d.logout()}catch{}O.set(null),g.set(null),T.set("/login")}function f(e){window.location.hash=e}var Tr,Lr,O,g,ce,mt,T,C,h=v(()=>{H();H();w();Tr="earnap_token",Lr="earnap_user",O=pt(Tr,null),g=pt(Lr,null),ce=P(null),mt=null;T=P(window.location.hash.replace(/^#/,"")||"/"),C=it(()=>!!O.get()&&!!g.get());k(()=>{let e=O.get();Ia(e)});Fa(()=>{O.set(null),g.set(null),T.set("/login"),l("Session expired. Please log in.","error")})});var Wa={};_(Wa,{HomePage:()=>Ce});function Ce(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=g.get();Er(e),e.appendChild(Cr(t)),e.appendChild(qr()),e.appendChild(Ar(t))}}function ee(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}async function Er(e){Ee&&(clearInterval(Ee),Ee=null);try{let t=await d.notices(),s=(Array.isArray(t.notices)&&t.notices.length?t.notices:[]).map(y=>{if(typeof y=="string"){let E=y.trim();return E.startsWith("/")||E.startsWith("http")?{image:E,text:""}:{image:"",text:E}}return{image:y.image||"",text:y.text||""}}).filter(y=>y.image&&y.image.trim()||y.text&&y.text.trim());s.length||s.push({text:"Complete tasks, watch ads, refer friends, and withdraw anytime.",image:""});let r=ee("div","welcome-popup welcome-popup--banner","");r.innerHTML=`
            <div id="notice-banner-content" class="welcome-popup__content"></div>
        `,e.firstChild?e.insertBefore(r,e.firstChild):e.appendChild(r);let i=r.querySelector("#notice-banner-content"),n=typeof t.interval=="number"&&t.interval>0?t.interval:4,o=t.direction||"right_to_left",c={right_to_left:{exit:"banner-vanish-left",enter:"banner-enter-right"},left_to_right:{exit:"banner-vanish-right",enter:"banner-enter-left"},top_to_bottom:{exit:"banner-vanish-bottom",enter:"banner-enter-top"},bottom_to_top:{exit:"banner-vanish-top",enter:"banner-enter-bottom"},fade:{exit:"banner-vanish-fade",enter:"banner-enter-fade"}},u=c[o]||c.right_to_left,m=0;Oa(i,s[0]),s.length>1&&(Ee=setInterval(()=>{let y;do y=Math.floor(Math.random()*s.length);while(y===m&&s.length>1);m=y,i.className=`welcome-popup__content ${u.exit}`,setTimeout(()=>{Oa(i,s[m]),i.className=`welcome-popup__content ${u.enter}`,setTimeout(()=>{i.className="welcome-popup__content"},350)},350)},n*1e3))}catch{}}function Oa(e,t){e.innerHTML="";let a=!!(t&&t.text&&t.text.trim());if(!!(t&&t.image&&t.image.trim())){let r=document.createElement("img");r.className="welcome-popup__image",r.src=t.image,r.alt=t.text||"Banner Notice",r.onerror=()=>{r.style.display="none"},e.appendChild(r)}if(a){let r=document.createElement("div");r.className="welcome-popup__text-wrap",r.innerHTML=`<strong>JM Job:</strong> <span>${Mr(t.text)}</span>`,e.appendChild(r)}}function Cr(e){let t=ee("div","card card--user-header"),a=ee("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function qr(){let e=ee("div","icon-grid");return[{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill",tone:"purple"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg",tone:"blue"},{path:"/webtask",label:"Tasks",icon:"bi-telegram",tone:"blue"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=ee("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),f(a.path)}),e.appendChild(s)}),e}function Ar(e){let t=ee("div","card card--daily-mission"),a=e&&e.today_ads||0,s=e&&e.ads_limit||50,r=Math.min(100,a/Math.max(1,s)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${s} | Completed: ${a}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${r}%"></div>
        </div>
    `;let i=ee("button","btn btn--primary btn--xl","\u{1F381} Claim Daily Bonus");return i.addEventListener("click",async()=>{try{let n=await fetch("/api/user/claim-daily-bonus",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Bearer "+(window.JMJOB_TOKEN||"")}}).then(o=>o.json());n.success?(l(n.message||"Daily bonus claimed!","success"),await A(),Ce()()):l(n.message||"Bonus not available.","info")}catch{l("Could not claim. Try again later.","error")}}),t.appendChild(i),t}function Mr(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var Ee,bt=v(()=>{h();w();Ee=null});var gt={};_(gt,{WebTaskPage:()=>de});function de(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await d.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(Nr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Nr(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Ja(e.title)}</h3>
        <p class="card__sub">${Ja(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>Pr(e,a,t)),t}async function Pr(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let n=(await d.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{s+=1;let c=r-s;t.textContent=c>0?`Wait ${c}s\u2026`:"Claim Reward",s>=r&&(clearInterval(o),jr(t,n,a))},1e3)}function jr(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await d.webTaskClaim({completion_id:t});l("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await A(),de()()}catch(s){l(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Ja(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var qe=v(()=>{w();h()});var za={};_(za,{EarnPage:()=>Ae});function Ae(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=g.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let s=e.querySelector("#watch-btn");s.disabled||s.addEventListener("click",()=>Hr())}}function Hr(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=s.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await Br(e,"simulated",t))},1e3)},300)}async function Br(e,t,a){try{let s=await d.reward({provider:t,started_at:a});l(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await A(),e.remove(),Ae()()}catch(s){l(s.message||"Reward failed","error"),e.remove()}}var ft=v(()=>{w();h()});var Va={};_(Va,{ReferPage:()=>vt});function vt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=g.get(),a=null;try{a=(await d.referrals()).data}catch{l("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let r=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),l("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),l("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(s);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(c=>{let u=document.createElement("div");u.className="refer-item",u.innerHTML=`
                    <img class="avatar" src="${c.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Ga(c.name)}</div>
                        <div class="refer-item__username">@${Ga(c.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(c.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(u)})}}function Ga(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ht=v(()=>{w();h()});var Xa={};_(Xa,{WithdrawPage:()=>Me});function Me(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=g.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await d.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await A(),Me()()}catch(o){let c=o.payload&&o.payload.errors;if(c){let u=Object.values(c)[0];l(Array.isArray(u)?u[0]:u,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let i=(await d.withdrawals()).data||[];i.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",i.forEach(n=>s.appendChild(Ir(n))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Ir(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${yt(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${yt(e.gateway)} \xB7 ${yt(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function yt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var wt=v(()=>{w();h()});var Za={};_(Za,{DepositPage:()=>_t});function _t(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=g.get();e.innerHTML=`
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
        `;try{S.loading=!0;let[s,r]=await Promise.all([d.paymentGateways(),d.paymentSubmissions()]);S.gateways=s.data.gateways,S.minAmount=s.data.min_amount,S.maxAmount=s.data.max_amount,S.submissions=r.data,Ka(),Ya()}catch(s){l("Failed to load deposit info: "+s.message,"error")}finally{S.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!S.selectedGateway){l("Please select a payment method.","error");return}let r=new FormData(a),i=document.getElementById("deposit-submit-btn");i.disabled=!0,i.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let n=await d.paymentSubmit({gateway:S.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});l(n.message||"Payment submitted.","success"),a.reset();let o=await d.paymentSubmissions();S.submissions=o.data,Ya(),await A();let c=g.get(),u=document.getElementById("deposit-balance");u&&c&&(u.textContent="\u09F3"+parseFloat(c.role==="poster"?c.wallet_balance||0:c.balance||0).toFixed(2))}catch(n){l(n.message||"Failed to submit payment.","error")}finally{i.disabled=!1,i.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function Ka(){let e=document.getElementById("payment-gateways");if(e){if(S.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=S.gateways.map(t=>`
        <button class="payment-gateway ${S.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${ae(t.label)}</div>
                <div class="payment-gateway__number">${ae(t.wallet_number)}</div>
            </div>
            ${S.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{S.selectedGateway=t.getAttribute("data-gateway"),Ka(),Rr()})})}}function Rr(){let e=S.gateways.find(i=>i.key===S.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${ae(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${ae(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{l("Wallet number copied.","info")}).catch(()=>{l("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=S.minAmount,r.max=S.maxAmount,r.placeholder=`${S.minAmount} \u2013 ${S.maxAmount}`)}function Ya(){let e=document.getElementById("payment-history");if(e){if(S.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=S.submissions.map(t=>{let a=Fr[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${ae((t.gateway||"").toUpperCase())} \u2022 TRX: ${ae(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Dr(t.created_at)}</div>
            </div>
        `}).join("")}}function Dr(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function ae(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Fr,S,$t=v(()=>{w();h();Fr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},S={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var xt={};_(xt,{ProfilePage:()=>Ne});function Ne(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=g.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?St(t.name):""}</h2>
                <p class="card__sub">@${t?St(t.username):""}</p>
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
        `;let a=e.querySelector("#ad-history");try{let r=(await d.adHistory()).data||[];if(r.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let i=a.querySelector(".ad-history__list");r.forEach(n=>{let o=document.createElement("div");o.className="ad-history__row",o.innerHTML=`
                        <span class="ad-history__provider">${St(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function St(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Pe=v(()=>{w();h()});var Qa={};_(Qa,{default:()=>je});async function je(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var kt=v(()=>{h()});var es={};_(es,{default:()=>He});async function He(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var Tt=v(()=>{h()});var ts={};_(ts,{default:()=>Be});async function Be(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var Lt=v(()=>{h()});function Ur(){let e=localStorage.getItem(as);return e==="dark"||e==="light"?e:"system"}function Or(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function Et(e){let t=Or(e);document.documentElement.setAttribute("data-theme",t)}function ss(){let e=B.get();B.set(e==="dark"?"light":"dark")}function rs(e){B.set(e)}function Wr(){let e=localStorage.getItem(is);return e&&Ct.includes(e)?e:"default"}function ns(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function os(e){Ct.includes(e)&&pe.set(e)}function ls(){return Ct}var as,B,is,Ct,pe,qt=v(()=>{H();as="jmjob_theme";B=P(Ur());Et(B.get());k(()=>{let e=B.get();Et(e),localStorage.setItem(as,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{B.get()==="system"&&Et("system")});is="jmjob_color_theme",Ct=["default","emerald","amber","rose"];pe=P(Wr());ns(pe.get());k(()=>{let e=pe.get();ns(e),localStorage.setItem(is,e)})});var cs={};_(cs,{default:()=>Fe});async function Fe(){let e=document.querySelector("[data-view]");if(!e)return;let t=g.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=B.get(),s=pe.get(),r=ls();e.innerHTML=`
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
                        <div class="settings-value">${Ie[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${r.map(o=>`
                            <button class="theme-swatch ${o===s?"is-active":""}" data-color="${o}" role="radio" aria-checked="${o===s}" title="${Ie[o]||o}">
                                <span class="theme-swatch__chip" style="background: ${Jr[o]};"></span>
                                <span class="theme-swatch__label">${(Ie[o]||o).split(" ")[0]}</span>
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
    `;let i=document.getElementById("theme-mode-group");i&&i.querySelectorAll("button[data-mode]").forEach(o=>{o.addEventListener("click",()=>{let c=o.getAttribute("data-mode");rs(c),l(`Theme mode set to ${c}.`,"info")})});let n=document.getElementById("color-theme-group");n&&n.querySelectorAll("button[data-color]").forEach(o=>{o.addEventListener("click",()=>{let c=o.getAttribute("data-color");os(c),l(`Accent color set to ${Ie[c]||c}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await Le(),l("Logged out.","info")})}var Ie,Jr,At=v(()=>{h();qt();Ie={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},Jr={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var ps={};_(ps,{NotificationsPage:()=>Mt});function Mt(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await d.notificationsReadAll(),l("All notifications marked as read.","success"),await ds()}catch(t){l(t.message||"Could not update notifications.","error")}}),await ds())}}async function ds(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await d.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(zr).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await d.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){l(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${ue(t.message||"unknown error")}</p>`}}function zr(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${ue(t.action_url)}">Open</a>`:"",i=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${ue(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${ue(t.title||"Notification")}</h3><p>${ue(t.message||"")}</p><small>${Gr(e.created_at)}</small></div><div class="notifications-page__actions">${r}${i}</div></article>`}function Gr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ue(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Nt=v(()=>{w();h()});var us={};_(us,{TgTasksPage:()=>De});function De(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await d.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Vr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Vr(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${Re(e.channel_name)}</strong>
                <span class="muted">${Re(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${Re(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${Re(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Xr(e,t)},3e3)})}return t}async function Xr(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await d.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await A(),De()()}catch(s){l(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Re(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Pt=v(()=>{w();h()});var gs={};_(gs,{PosterDashboardPage:()=>Ht});function Ht(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--poster-dashboard",!g.get()){e.innerHTML='<div class="card"><h2>Access required</h2><a class="btn btn--primary" href="#/login">Log in</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),f("/poster/post-job")}),await ms()}}async function ms(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await d.posterStats();Kr(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${bs(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",ms),l(t.message||"Failed to load poster statistics.","error")}}function Kr(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=jt(t.wallet_balance),i=jt(t.frozen_balance),n=jt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${Ue("bi-briefcase","Total jobs",a.total||0)}
            ${Ue("bi-lightning-charge","Active jobs",s)}
            ${Ue("bi-wallet2","Available wallet",r,"\u09F3")}
            ${Ue("bi-lock","In escrow",i,"\u09F3")}
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
                    ${se("open",a.open)}
                    ${se("in_review",a.in_review)}
                    ${se("assigned",a.assigned)}
                    ${se("submitted",a.submitted)}
                    ${se("revision",a.revision)}
                    ${se("completed",a.completed)}
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
    `,e.querySelectorAll("[data-poster-link]").forEach(o=>{o.addEventListener("click",c=>{c.preventDefault(),f(o.getAttribute("href").replace(/^#/,""))})})}function Ue(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${bs(String(a))}</strong>
        </div>
    `}function se(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Zr(e)}"></i> ${Yr[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Zr(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function jt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function bs(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Yr,Bt=v(()=>{w();h();Yr={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var hs={};_(hs,{PostJobPage:()=>It});function It(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--post-job",!ai()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t={currentStep:1,categories:[],mainCategoryId:"",subCategoryId:"",title:"",description:"",thumbnailBase64:"",proofRequirements:[{title:"",type:"text"}],workerCount:1,costPerWorker:10,biddingValue:3,biddingUnit:"days",deadlineAt:"",feePercentage:30};try{let a=await d.categories();t.categories=a.data||[]}catch(a){l(a.message||"Could not load categories.","error")}fe(e,t)}}function fe(e,t){e.innerHTML=`
        <a href="#/poster" class="back-link"><i class="bi bi-arrow-left"></i> Poster dashboard</a>
        <h1 class="page-title">Post a Job</h1>
        
        <!-- Step Indicator -->
        <div class="wizard-steps" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: space-between;">
            <div class="wizard-step ${t.currentStep===1?"active":""} ${t.currentStep>1?"completed":""}" style="flex: 1; padding: 0.75rem; background: ${t.currentStep===1?"var(--primary-light, #e0e7ff)":"#f3f4f6"}; border-radius: 8px; text-align: center; font-weight: bold; color: ${t.currentStep===1?"var(--primary, #4f46e5)":"#4b5563"};">
                1. Category Selection
            </div>
            <div class="wizard-step ${t.currentStep===2?"active":""} ${t.currentStep>2?"completed":""}" style="flex: 1; padding: 0.75rem; background: ${t.currentStep===2?"var(--primary-light, #e0e7ff)":"#f3f4f6"}; border-radius: 8px; text-align: center; font-weight: bold; color: ${t.currentStep===2?"var(--primary, #4f46e5)":"#4b5563"};">
                2. Job Details & Proofs
            </div>
            <div class="wizard-step ${t.currentStep===3?"active":""}" style="flex: 1; padding: 0.75rem; background: ${t.currentStep===3?"var(--primary-light, #e0e7ff)":"#f3f4f6"}; border-radius: 8px; text-align: center; font-weight: bold; color: ${t.currentStep===3?"var(--primary, #4f46e5)":"#4b5563"};">
                3. Workers & Pricing
            </div>
        </div>

        <div class="card" id="wizard-card-body">
            <!-- Step content dynamically rendered here -->
        </div>
    `,Qr(e,t)}function Qr(e,t){let a=e.querySelector("#wizard-card-body");a&&(t.currentStep===1?vs(a,e,t):t.currentStep===2?be(a,e,t):t.currentStep===3&&ei(a,e,t))}function vs(e,t,a){let s=a.categories.find(o=>Number(o.id)===Number(a.mainCategoryId)),r=s?s.subcategories||[]:[];e.innerHTML=`
        <form id="step-1-form" class="poster-form">
            <h2>Step 1: Select Category</h2>
            
            <label>Main Category
                <select id="main-category-select" required>
                    <option value="">Choose Main Category\u2026</option>
                    ${a.categories.map(o=>`
                        <option value="${o.id}" ${Number(a.mainCategoryId)===Number(o.id)?"selected":""}>
                            ${ge(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <label>Sub Category
                <select id="sub-category-select" ${s?"":"disabled"}>
                    <option value="">Choose Sub Category (Optional)\u2026</option>
                    ${r.map(o=>`
                        <option value="${o.id}" ${Number(a.subCategoryId)===Number(o.id)?"selected":""}>
                            ${ge(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                <button type="submit" class="btn btn--primary" id="step-1-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;let i=e.querySelector("#main-category-select"),n=e.querySelector("#sub-category-select");i.addEventListener("change",o=>{a.mainCategoryId=o.target.value,a.subCategoryId="",vs(e,t,a)}),n.addEventListener("change",o=>{a.subCategoryId=o.target.value}),e.querySelector("#step-cancel").addEventListener("click",Ft),e.querySelector("#step-1-form").addEventListener("submit",o=>{if(o.preventDefault(),!a.mainCategoryId){l("Please select a main category.","error");return}let c=a.categories.find(m=>Number(m.id)===Number(a.mainCategoryId)),u=c?Number(c.min_cost||1):1;if(a.subCategoryId&&c&&c.subcategories){let m=c.subcategories.find(y=>Number(y.id)===Number(a.subCategoryId));m&&m.min_cost&&(u=Number(m.min_cost))}a.minCost=u,a.costPerWorker<a.minCost&&(a.costPerWorker=a.minCost),a.currentStep=2,fe(t,a)})}function be(e,t,a){e.innerHTML=`
        <form id="step-2-form" class="poster-form">
            <h2>Step 2: Job Details & Proof Requirements</h2>

            <label>Job Title
                <input id="job-title-input" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo" value="${ge(a.title)}">
            </label>

            <label>Task Instructions (Description)
                <textarea id="job-desc-input" rows="5" required placeholder="Explain step by step instructions for workers\u2026">${ge(a.description)}</textarea>
            </label>

            <label>Thumbnail Image Upload (Optional)
                <input id="job-thumbnail-input" type="file" accept="image/*">
                ${a.thumbnailBase64?`<div style="margin-top:0.5rem;"><img src="${a.thumbnailBase64}" style="max-height:80px; border-radius:4px; border:1px solid #ccc;"></div>`:""}
            </label>

            <div style="margin-top: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                    <label style="margin:0; font-weight:bold;">Proof Requirements</label>
                    <button type="button" class="btn btn--sm btn--ghost" id="add-proof-btn"><i class="bi bi-plus-circle"></i> Add Requirement Pair</button>
                </div>
                <p class="muted" style="font-size:0.875rem;">Specify requirement title and whether worker provides Text Proof or Screenshot Proof.</p>

                <div id="proof-pairs-container">
                    ${a.proofRequirements.map((i,n)=>`
                        <div class="proof-pair-row" style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;" data-index="${n}">
                            <select class="proof-type-select" style="flex:1;">
                                <option value="text" ${i.type==="text"?"selected":""}>Text Proof</option>
                                <option value="screenshot" ${i.type==="screenshot"?"selected":""}>Screenshot Proof</option>
                            </select>
                            ${i.type==="screenshot"?`
                                <div style="flex:2; display:flex; align-items:center; gap:0.5rem;">
                                    <input type="file" class="proof-file-input" accept="image/*" style="flex:1;">
                                    ${i.fileBase64?`<img src="${i.fileBase64}" style="max-height:40px; max-width:60px; border-radius:4px; border:1px solid #ccc;">`:""}
                                </div>
                            `:`
                                <input type="text" class="proof-title-input" placeholder="Proof Requirement Title (e.g. Provide Username)" value="${ge(i.title||"")}" style="flex:2;" required>
                            `}
                            ${a.proofRequirements.length>1?`
                                <button type="button" class="btn btn--ghost remove-proof-btn" data-index="${n}" style="color:#ef4444;"><i class="bi bi-trash"></i></button>
                            `:""}
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <div>
                    <button type="button" class="btn btn--ghost" id="step-2-back"><i class="bi bi-arrow-left"></i> Back</button>
                    <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                </div>
                <button type="submit" class="btn btn--primary" id="step-2-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;let s=e.querySelector("#proof-pairs-container");s.addEventListener("change",i=>{if(i.target.classList.contains("proof-type-select"))me(e,a),be(e,t,a);else if(i.target.classList.contains("proof-file-input")){let n=i.target.closest(".proof-pair-row"),o=Number(n.getAttribute("data-index")),c=i.target.files[0];if(c){let u=new FileReader;u.onload=m=>{a.proofRequirements[o].fileBase64=m.target.result,a.proofRequirements[o].title=c.name,be(e,t,a)},u.readAsDataURL(c)}}}),e.querySelector("#add-proof-btn").addEventListener("click",()=>{me(e,a),a.proofRequirements.push({title:"",type:"text"}),be(e,t,a)}),s.addEventListener("click",i=>{let n=i.target.closest(".remove-proof-btn");if(n){let o=Number(n.getAttribute("data-index"));me(e,a),a.proofRequirements.splice(o,1),be(e,t,a)}}),e.querySelector("#job-thumbnail-input").addEventListener("change",i=>{let n=i.target.files[0];if(n){let o=new FileReader;o.onload=c=>{a.thumbnailBase64=c.target.result},o.readAsDataURL(n)}}),e.querySelector("#step-cancel").addEventListener("click",Ft),e.querySelector("#step-2-back").addEventListener("click",()=>{me(e,a),a.currentStep=1,fe(t,a)}),e.querySelector("#step-2-form").addEventListener("submit",i=>{if(i.preventDefault(),me(e,a),!a.title.trim()){l("Job title is required.","error");return}if(!a.description.trim()){l("Task instructions are required.","error");return}a.currentStep=3,fe(t,a)})}function me(e,t){t.title=e.querySelector("#job-title-input")?.value||"",t.description=e.querySelector("#job-desc-input")?.value||"";let a=e.querySelectorAll(".proof-pair-row");t.proofRequirements=Array.from(a).map((s,r)=>{let i=s.querySelector(".proof-type-select")?.value||"text",n=s.querySelector(".proof-title-input"),o=n?n.value:t.proofRequirements[r]?.title||"Screenshot Proof",c=t.proofRequirements[r]?.fileBase64||null;return{title:o,type:i,fileBase64:c}})}function ei(e,t,a){let s=Number(a.workerCount||0)*Number(a.costPerWorker||0),r=s*(a.feePercentage/100),i=s+r;e.innerHTML=`
        <form id="step-3-form" class="poster-form">
            <h2>Step 3: Workers & Pricing</h2>

            <div class="poster-form__grid">
                <label>Workers Needed
                    <input id="worker-count-input" type="number" min="1" step="1" required value="${a.workerCount}">
                </label>

                <label>Cost Per Worker (\u09F3)
                    <input id="cost-per-worker-input" type="number" min="${a.minCost}" step="0.01" required value="${Math.max(a.costPerWorker,a.minCost)}">
                    <small class="muted">Minimum cost per worker for selected category: \u09F3${Number(a.minCost).toFixed(2)}</small>
                </label>
            </div>

            <div class="poster-form__grid" style="margin-top: 1rem;">
                <label>
                    <span class="poster-form__label-head">
                        Bidding Window
                        <i class="bi bi-info-circle" title="Set 0 for unlimited" style="color: var(--muted, #6b7280); cursor: help; font-weight: normal; font-size: 14px;"></i>
                    </span>
                    <div class="poster-form__input-group">
                        <input id="bidding-val-input" type="number" min="0" step="any" value="${a.biddingValue}" required>
                        <select id="bidding-unit-input">
                            <option value="minutes" ${a.biddingUnit==="minutes"?"selected":""}>Minutes</option>
                            <option value="hours" ${a.biddingUnit==="hours"?"selected":""}>Hours</option>
                            <option value="days" ${a.biddingUnit==="days"?"selected":""}>Days</option>
                            <option value="months" ${a.biddingUnit==="months"?"selected":""}>Months</option>
                        </select>
                    </div>
                </label>

                <label>Deadline (Optional)
                    <input id="deadline-input" type="datetime-local" value="${a.deadlineAt}">
                </label>
            </div>

            <!-- Fee Calculation Summary Box -->
            <div class="fee-calculation-box" style="margin-top: 1.5rem; padding: 1rem; background: var(--card-bg, #f9fafb); border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px;">
                <h3 style="margin-top:0; font-size:1.1rem; border-bottom:1px solid #e5e7eb; padding-bottom:0.5rem;">Fee Breakdown</h3>
                <div style="display:flex; justify-space-between; margin-bottom:0.5rem;">
                    <span>Subtotal (${a.workerCount} workers \xD7 \u09F3${Number(a.costPerWorker).toFixed(2)}):</span>
                    <strong id="summary-subtotal">\u09F3${s.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-space-between; margin-bottom:0.5rem;">
                    <span>System Fee (${a.feePercentage}%):</span>
                    <strong id="summary-fee">\u09F3${r.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-space-between; font-size:1.15rem; color:var(--primary, #4f46e5); border-top:1px solid #e5e7eb; padding-top:0.5rem;">
                    <span>Total Cost:</span>
                    <strong id="summary-total">\u09F3${i.toFixed(2)}</strong>
                </div>
            </div>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <div>
                    <button type="button" class="btn btn--ghost" id="step-3-back"><i class="bi bi-arrow-left"></i> Back</button>
                    <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                </div>
                <button type="submit" class="btn btn--primary btn--xl" id="post-job-publish">Publish Job</button>
            </div>
        </form>
    `;let n=e.querySelector("#worker-count-input"),o=e.querySelector("#cost-per-worker-input"),c=()=>{a.workerCount=Math.max(1,parseInt(n.value,10)||1),a.costPerWorker=Math.max(0,parseFloat(o.value)||0);let u=a.workerCount*a.costPerWorker,m=u*(a.feePercentage/100),y=u+m;e.querySelector("#summary-subtotal").textContent=`\u09F3${u.toFixed(2)}`,e.querySelector("#summary-fee").textContent=`\u09F3${m.toFixed(2)}`,e.querySelector("#summary-total").textContent=`\u09F3${y.toFixed(2)}`};n.addEventListener("input",c),o.addEventListener("input",c),e.querySelector("#step-cancel").addEventListener("click",Ft),e.querySelector("#step-3-back").addEventListener("click",()=>{fs(e,a),a.currentStep=2,fe(t,a)}),e.querySelector("#step-3-form").addEventListener("submit",async u=>{u.preventDefault(),fs(e,a);let m=e.querySelector("#post-job-publish");m.disabled=!0,m.textContent="Publishing\u2026";let y=0,E=Number(a.biddingValue||0);E>0&&(a.biddingUnit==="minutes"?y=E/60:a.biddingUnit==="hours"?y=E:a.biddingUnit==="days"?y=E*24:a.biddingUnit==="months"&&(y=E*24*30));try{let $=await d.posterCreateJob({category_id:Number(a.mainCategoryId),subcategory_id:a.subCategoryId?Number(a.subCategoryId):null,title:a.title.trim(),description:a.description.trim(),thumbnail:a.thumbnailBase64||null,proof_requirements:a.proofRequirements,worker_count:Number(a.workerCount),cost_per_worker:Number(a.costPerWorker),budget:Number(a.workerCount)*Number(a.costPerWorker),deadline_at:ti(a.deadlineAt),bidding_window_hours:y});l("Job submitted for admin review.","success");let x=g.get(),Q=x&&(x.username||x.name)||"User",D=$?.data?.id||"",we=`${window.location.origin}/#/poster/jobs/${D}`,ka=`I, the user ${Q}, has submitted this job ${we} for publishing. Let's talk about payment and approval`,_e=`https://wa.me/8801775722083?text=${encodeURIComponent(ka)}`,Ta=t.querySelector("#wizard-card-body");Ta&&(Ta.innerHTML=`
                    <div style="text-align:center; padding: 2rem 1rem;">
                        <div style="font-size:3rem; color:#f59e0b; margin-bottom:1rem;"><i class="bi bi-clock-history"></i></div>
                        <h2 style="margin-bottom:0.5rem;">Job Submitted & Pending Approval</h2>
                        <p class="muted" style="max-width:500px; margin:0 auto 1.5rem;">Your job has been submitted to the admin panel for review. Contact the admin on WhatsApp to talk about payment and job approval.</p>
                        
                        <div style="margin-bottom:1.5rem;">
                            <a href="${_e}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--xl" style="background:#25D366; border-color:#25D366; color:#fff; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none;">
                                <i class="bi bi-whatsapp" style="font-size:1.25rem;"></i> Contact Whatsapp
                            </a>
                        </div>

                        <div>
                            <a href="#/poster/jobs" class="btn btn--ghost">Go to My Jobs</a>
                        </div>
                    </div>
                `)}catch($){l($.message||"Could not publish job.","error"),m.disabled=!1,m.textContent="Publish Job"}})}function fs(e,t){t.workerCount=Number(e.querySelector("#worker-count-input")?.value||1),t.costPerWorker=Number(e.querySelector("#cost-per-worker-input")?.value||0),t.biddingValue=Number(e.querySelector("#bidding-val-input")?.value||0),t.biddingUnit=e.querySelector("#bidding-unit-input")?.value||"days",t.deadlineAt=e.querySelector("#deadline-input")?.value||""}function Ft(){confirm("Are you sure you want to cancel posting this job?")&&f("/poster")}function ti(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function ai(){return!!g.get()}function ge(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Rt=v(()=>{w();h()});var ws={};_(ws,{PosterJobsPage:()=>Dt});function Dt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!ni()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${si.map(t=>`<option value="${t}" ${t===We?"selected":""}>${t?ys(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),f("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{We=t.target.value,await Oe()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",Oe),await Oe()}}}async function Oe(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await d.posterMyJobs()).data||[]).filter(s=>!We||s.status===We);e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(ri(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${re(t.message||"unknown error")}</p>`}}}function ri(e){let t=document.createElement("article");return t.className=`admin-row poster-job-row poster-job-row--${re(e.status)}`,t.innerHTML=`
        <div class="poster-job-row__header">
            <div><strong>${re(e.title)}</strong><span class="badge">${re(ys(e.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${re(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${re(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(e.bid_count||0)}</span><span><strong>Views:</strong> ${Number(e.view_count||0)}</span><span><strong>Created:</strong> ${oi(e.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${["completed","cancelled"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>f(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>ii(e.id)),t}async function ii(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await d.posterCancelJob(e,{reason:t}),l("Job cancelled.","success"),await Oe()}catch(a){l(a.message||"Could not cancel job.","error")}}function ni(){return!!g.get()}function ys(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function oi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function re(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var si,We,Ut=v(()=>{w();h();si=["","open","assigned","submitted","revision","completed","cancelled","disputed"],We=""});var _s={};_(_s,{PosterWalletPage:()=>Wt});function Wt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=g.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([d.posterStats(),d.paymentSubmissions()]);li(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Je(a.message||"unknown error")}</p>`}}}function li(e,t,a){let s=Ot(t.wallet_balance),r=Ot(t.frozen_balance),i=Ot(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${ci(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>f("/deposit"))}function ci(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Je((t.gateway||"").toUpperCase())}</strong><small>${Je(t.trxid)} \xB7 ${di(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Je(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function Ot(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function di(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Je(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Jt=v(()=>{w();h()});var xs={};_(xs,{AdminPage:()=>Gt});function Gt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(r=>{r.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),r.classList.add("admin-tab--active"),$s(r.dataset.tab,s)})}),$s("stats",s)}}async function $s(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([d.adminStats(),d.adminRevenue()]),r=a.data||{},i=s.data||{},n=i.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${Y("bi-graph-up-arrow","Platform revenue",zt(i.platform_revenue,n))}
                    ${Y("bi-percent","Commission rate",`${(Number(i.commission_rate||0)*100).toFixed(2)}%`)}
                    ${Y("bi-briefcase","Total jobs",K(i.total_jobs))}
                    ${Y("bi-check2-circle","Completed jobs",K(i.completed_jobs))}
                    ${Y("bi-lightning-charge","Active jobs",K(i.active_jobs))}
                    ${Y("bi-people","Total users",K(i.total_users))}
                    ${Y("bi-hourglass-split","Pending deposits",K(i.pending_payments))}
                    ${Y("bi-lock","Held in escrow",zt(i.escrow_total,n))}
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
                        <div><span class="muted">Withdrawals</span><strong>${K(r.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${K(r.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${K(r.total_ad_views)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${zt(r.total_lifetime_paid,n)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${q(i.currency||"BDT")}</strong> currency \xB7 <strong>${q(i.escrow_mode||"full_bid")}</strong> escrow</div>
                </div>
                <div class="card admin-config-card">
                    <div>
                        <strong>System Maintenance</strong>
                        <p class="muted" style="margin:0; font-size:12px;">Reset daily user ad view limits and daily bonus claim timers for all users.</p>
                    </div>
                    <button class="btn btn--danger btn--sm" id="btn-reset-counters"><i class="bi bi-arrow-counterclockwise"></i> Reset Daily Counters</button>
                </div>
            `;let o=t.querySelector("#btn-reset-counters");o&&o.addEventListener("click",async()=>{if(confirm("Reset daily ad view counters for all users?"))try{let c=await d.adminResetDailyCounters();l(c.message||"Daily counters reset.","success")}catch(c){l(c.message||"Reset failed.","error")}})}else if(e==="withdrawals"){let s=(await d.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let r=t.querySelector("#wd-list");s.forEach(i=>r.appendChild(Ss(i,r))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await d.adminWithdrawals(i.target.value);r.innerHTML="",(n.data||[]).forEach(o=>r.appendChild(Ss(o,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await d.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),i=Number(g.get()?.id||0);s.forEach(n=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${q(n.name)}</strong>
                        <span class="muted">${q(n.email)}</span>
                        <span class="badge user-role-badge">${q(n.role||(n.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(n.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(n.lifetime_earned||0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(n.id)===i?"disabled":""}>
                                ${["worker","poster","admin"].map(u=>`<option value="${u}" ${(n.role||(n.is_admin?"admin":"worker"))===u?"selected":""}>${u[0].toUpperCase()+u.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let c=o.querySelector(".admin-user-role");c?.addEventListener("change",async()=>{let u=n.role||(n.is_admin?"admin":"worker");try{let m=await d.adminUpdateUserRole(n.id,c.value);n.role=m.data?.role||c.value,n.is_admin=!!m.data?.is_admin,o.querySelector(".user-role-badge").textContent=n.role.toUpperCase(),l("User role updated","success")}catch(m){c.value=u,l(m.message||"Role update failed","error")}}),r.appendChild(o)})}else if(e==="providers"){let s=(await d.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(i=>r.appendChild(pi(i,r)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function Y(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${q(t)}</span>
            <strong>${q(String(a))}</strong>
        </div>
    `}function K(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function zt(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function Ss(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${q(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${q(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${q(e.gateway)} \xB7 ${q(e.wallet_address)}</div>
        <div class="admin-row__status">${q(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await d.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await d.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),s.appendChild(r),s.appendChild(i),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await d.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function pi(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${q(e.name)}</strong>
            <span class="muted">${q(e.slug)}</span>
            ${s?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${q(r)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${s?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await d.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}function q(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Vt=v(()=>{w();h();h()});var Ls={};_(Ls,{AdminPaymentsPage:()=>Yt});function Yt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${W.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${W.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${W.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${W.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{W.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),Xt()})}),await Xt()}}async function Xt(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await d.adminPayments(W.status);W.items=t.data||[],mi(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${te(t.message||"Failed to load.")}</p>`}}}function mi(e){if(W.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",W.items.forEach(t=>e.appendChild(bi(t)))}function bi(e){let t=ui[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${te((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${te(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${te(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${te(e.user.name)} <span class="muted">(${te(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${Ts(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${Ts(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${te(e.admin_note)}</div>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>ks(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>ks(e.id,"reject",a))),a}async function ks(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let i=await(t==="approve"?d.adminApprovePayment:d.adminRejectPayment)(e,{note:s||null});l(i.message||"Done.","success"),await Xt()}catch(r){l(r.message||"Action failed.","error")}}function Ts(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function te(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ui,W,Kt=v(()=>{w();h();ui={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},W={status:"pending",items:[],loading:!1}});var Cs={};_(Cs,{AdminJobsPage:()=>ea});function ea(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-jobs",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${gi.map(t=>`<option value="${t}" ${t===Qt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-job-status").addEventListener("change",async t=>{Qt=t.target.value,await ve()}),e.querySelector("#admin-job-refresh").addEventListener("click",ve),await ve()}}}async function ve(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await d.adminJobs(Qt)).data||[];e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(fi(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${F(t.message||"unknown error")}</p>`}}}function fi(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${F(e.status)}`;let a=e.worker?`${F(e.worker.name)} <span class="muted">(${F(e.worker.email||"")})</span>`:'<span class="muted">Unassigned</span>';t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${F(e.title)}</strong>
                <span class="badge">${F(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${F(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="admin-job-row__description muted">${F(e.description||"")}</p>
        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${F(e.poster?.name||"(deleted)")}</span>
            <span><strong>Worker:</strong> ${a}</span>
            <span><strong>Category:</strong> ${F(e.category_name||"Uncategorized")}</span>
            <span><strong>Bids:</strong> ${Number(e.bid_count||0).toLocaleString()} \xB7 <strong>Views:</strong> ${Number(e.view_count||0).toLocaleString()}</span>
        </div>
        <div class="admin-job-row__footer">
            <span class="muted">Updated ${hi(e.updated_at||e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let s=t.querySelector(".admin-row__actions");return["completed","cancelled","disputed"].includes(e.status)||s.appendChild(Zt("Mark disputed","btn--danger",()=>vi(e.id))),e.status==="disputed"&&(s.appendChild(Zt("Release payment","btn--success",()=>Es(e.id,"release"))),s.appendChild(Zt("Cancel and refund","btn--danger",()=>Es(e.id,"cancel")))),t}function Zt(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function vi(e){if(confirm("Flag this job for admin dispute review?"))try{await d.adminFlagJobDispute(e),l("Job flagged for dispute review.","success"),await ve()}catch(t){l(t.message||"Could not flag job.","error")}}async function Es(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await d.adminResolveJob(e,{resolution:t,reason:s}),l(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await ve()}catch(r){l(r.message||"Could not resolve dispute.","error")}}function hi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function F(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var gi,Qt,ta=v(()=>{w();h();gi=["","open","in_review","assigned","submitted","revision","disputed","completed","cancelled","expired"],Qt=""});var qs={};_(qs,{AdminTransactionsPage:()=>ra});function ra(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${yi.map(t=>`<option value="${t}" ${t===sa?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{sa=t.target.value,await aa()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",aa),await aa()}}}async function aa(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await d.adminTransactions({type:sa})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(wi(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${J(t.message||"unknown error")}</p>`}}}function wi(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${J(e.type)}`,t.innerHTML=`
        <div class="admin-transaction-row__header">
            <div>
                <strong>${J(String(e.type||"").replace("_"," ").toUpperCase())}</strong>
                <span class="badge">#${Number(e.id||0)}</span>
            </div>
            <strong class="admin-row__amount">${J(e.currency||"BDT")} ${Number(e.amount||0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${J(e.user_name||"Platform")} ${e.user_email?`<span class="muted">(${J(e.user_email)})</span>`:""}</span>
            <span><strong>Job:</strong> ${J(e.job_title||(e.job_id?`#${e.job_id}`:"\u2014"))}</span>
            <span><strong>Date:</strong> ${_i(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${J(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${J(e.reference)}</code>`:""}
    `,t}function _i(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function J(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var yi,sa,ia=v(()=>{w();h();yi=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],sa=""});var As={};_(As,{AdminReportsPage:()=>na});function na(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Reports</h1>
            <p class="muted">Aggregated transaction volume and marketplace job value by status.</p>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,await $i()}}}async function $i(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await d.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${ze("Transactions",Ge(s.transaction_count))}
                ${ze("Transaction volume",Ve(s.transaction_volume))}
                ${ze("Jobs",Ge(s.job_count))}
                ${ze("Job value",Ve(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${Si(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${xi(a.jobs||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${he(t.message||"unknown error")}</p>`}}function ze(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${he(e)}</span><strong>${he(t)}</strong></div>`}function Si(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${he(String(t.type||"").replace("_"," "))}</strong><small>${Ge(t.transaction_count)} entries</small></span>
            <strong>${Ve(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function xi(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${he(String(t.status||"").replace("_"," "))}</strong><small>${Ge(t.job_count)} jobs</small></span>
            <strong>${Ve(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function Ge(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Ve(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function he(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var oa=v(()=>{w();h()});var Ms={};_(Ms,{LoginPage:()=>la});function la(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${ki(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{let n=await Ra(r.get("email"),r.get("password"));l("Welcome back!","success"),n&&n.is_admin?f("/admin"):f("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function ki(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ca=v(()=>{h()});var Ps={};_(Ps,{RegisterPage:()=>pa});function pa(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",r=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your email</h1>','<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',da(a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",r()}),e.querySelector("#register-otp-form").addEventListener("submit",n);return}let o=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+da(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',o,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+da(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",i)},i=async o=>{o.preventDefault();let c=o.currentTarget,u=new FormData(c),m=c.querySelector('button[type="submit"]');m.disabled=!0,m.textContent="Sending code\u2026",a={name:String(u.get("name")||"").trim(),email:String(u.get("email")||"").trim().toLowerCase(),password:String(u.get("password")||""),password_confirmation:String(u.get("password_confirmation")||""),referral_code:String(u.get("referral_code")||"")};try{await Da(a),t="otp",l("Verification code sent. It expires in 15 minutes.","success"),r()}catch(y){l(Ns(y)||"Could not send the verification code.","error"),m.disabled=!1,m.textContent="Send verification code"}},n=async o=>{o.preventDefault();let c=o.currentTarget,u=c.querySelector('button[type="submit"]');u.disabled=!0,u.textContent="Verifying\u2026";try{await Ua({email:a.email,otp:String(new FormData(c).get("otp")||"").trim()}),l("Account created \u2014 welcome!","success"),f("/")}catch(m){l(Ns(m)||"Invalid or expired verification code.","error"),u.disabled=!1,u.textContent="Verify and create account"}};r()}}function Ns(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function da(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ua=v(()=>{h()});var js={};_(js,{default:()=>Xe});async function Xe(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
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
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let r=t.email.value.trim();if(!r){l("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await d.forgotPassword({email:r}),l("If an account exists with this email, you will receive a reset code.","success"),f(`/reset-password?email=${encodeURIComponent(r)}`)}catch(i){l(i.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var ma=v(()=>{w();h()});var Hs={};_(Hs,{default:()=>Ye});async function Ye(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${Ti(a)}" placeholder="you@example.com" required autocomplete="email">
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
    `;let s=document.getElementById("reset-form"),r=document.getElementById("submit-btn");s.addEventListener("submit",async i=>{i.preventDefault();let n=s.email.value.trim(),o=s.otp.value.trim(),c=s.password.value,u=s.password_confirmation.value;if(!n||!o||!c){l("Please fill in all fields.","error");return}if(o.length!==6){l("Please enter a valid 6-digit code.","error");return}if(c!==u){l("Passwords do not match.","error");return}if(c.length<6){l("Password must be at least 6 characters.","error");return}r.disabled=!0,r.textContent="Resetting...";try{await d.resetPassword({email:n,otp:o,password:c,password_confirmation:u}),l("Password reset successfully! You can now log in.","success"),f("/login")}catch(m){l(m.message||"Failed to reset password.","error"),r.disabled=!1,r.textContent="Reset Password"}})}function Ti(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ba=v(()=>{w();h()});var nr={};_(nr,{JobDetailPage:()=>En});function En(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=g.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await d.job(e),{job:r,bids:i,bid_count:n,my_bid:o}=s.data;Cn(r,i,n,o,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${Z(s.message||"unknown")}</p>`}}}function Cn(e,t,a,s,r){let i=document.getElementById("job-detail-content");if(!i)return;let n=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,o=n?Math.max(0,Math.floor((n-Date.now())/1e3)):null,c=o!=null?Mn(o):"\u2014",u=["open","in_review"].includes(e.status),m=!!s;i.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${Z(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${Z(e.title)}</h1>
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Budget <strong>\u09F3${parseFloat(e.budget).toFixed(2)}</strong></span>
                        <span><i class="bi bi-people"></i> ${a} bid${a===1?"":"s"}</span>
                        <span><i class="bi bi-eye"></i> ${e.view_count} view${e.view_count===1?"":"s"}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${c}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${e.status}">${e.status.replace("_"," ").toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${Z(e.description).replace(/\n/g,"<br>")}</p>
                ${e.requirements?`<h3>Requirements</h3><p>${Z(e.requirements).replace(/\n/g,"<br>")}</p>`:""}
                <h3>Posted by</h3>
                <p>${e.poster?Z(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${qn(e,t,s,r,u)}
    `,An(e,s,r)}function qn(e,t,a,s,r){return a?`
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${a.status}">
                    <div>
                        <strong>\u09F3${parseFloat(a.amount).toFixed(2)}</strong> in <strong>${a.delivery_days} day${a.delivery_days===1?"":"s"}</strong>
                        <div class="muted">${Z(a.proposal)}</div>
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
                                <div class="muted">${Z(i.proposal).slice(0,100)}${i.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${i.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function An(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await d.withdrawBid(t.id),l("Bid withdrawn.","success"),f(`/jobs/${e.id}`)}catch(i){l(i.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(s),n=document.getElementById("bid-submit-btn");n.disabled=!0,n.textContent="Submitting\u2026";try{await d.placeBid(e.id,{amount:parseFloat(i.get("amount")),delivery_days:parseInt(i.get("delivery_days"),10),proposal:String(i.get("proposal")||"").trim()}),l("Bid placed!","success"),f(`/jobs/${e.id}`)}catch(o){l(o.message||"Failed to place bid.","error")}finally{n.disabled=!1,n.textContent="Submit Bid"}})}function Mn(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function Z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var or=v(()=>{w();h()});var dr={};_(dr,{PosterJobDetailPage:()=>Nn});function Nn(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!Dn()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await lr(e)}}}async function lr(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await d.posterJobBids(e)).data||{};Pn(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${L(a.message||"unknown error")}</p>`}}function Pn(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${L(t.title)}</h1><p class="muted">${L(t.description||"")}</p></div><span class="badge badge--status badge--${L(t.status)}">${L(Un(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${cr(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${jn(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${Hn(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>Bn(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>In(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>Fn(t.id,r.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>Rn(t.id))}function jn(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${L(a.status)}"><div class="poster-bid-row__main"><strong>${L(a.worker?.name||"Worker")}</strong><span class="muted">${L(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${L(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${L(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function Hn(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${L(a.status)}"><div><strong>${L(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${cr(a.created_at)} \xB7 ${L(String(a.status||"").replace("_"," "))}</span><p>${L(a.description||"")}</p>${a.external_link?`<a href="${L(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${L(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function Bn(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await d.posterAcceptBid(e,t),l("Worker selected and escrow held.","success"),await Sa(e)}catch(a){l(a.message||"Could not select worker.","error")}}async function In(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await d.posterReleasePayment(e,{submission_id:Number(t)}),l("Payment released.","success"),await Sa(e)}catch(a){l(a.message||"Could not release payment.","error")}}async function Fn(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await d.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),l("Revision requested.","success"),await Sa(e)}catch(s){l(s.message||"Could not request revision.","error")}}async function Rn(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await d.posterCancelJob(e,{reason:"Cancelled by poster"}),l("Job cancelled.","success"),f("/poster/jobs")}catch(t){l(t.message||"Could not cancel job.","error")}}async function Sa(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await lr(e))}function Dn(){return!!g.get()}function Un(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function cr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function L(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var pr=v(()=>{w();h()});H();h();H();h();var Ke=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(bt(),Wa))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(qe(),gt))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(qe(),gt))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ft(),za))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ht(),Va))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(wt(),Xa))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>($t(),Za))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Pe(),xt))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(kt(),Qa))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Tt(),es))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Lt(),ts))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(At(),cs))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Nt(),ps))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Pe(),xt))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Pt(),us))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Bt(),gs))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Rt(),hs))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ut(),ws))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Jt(),_s))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Vt(),xs))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Kt(),Ls))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(ta(),Cs))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(ia(),qs))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(oa(),As))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ca(),Ms))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ua(),Ps))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ma(),js))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ba(),Hs))}],zl=k(()=>{let e=T.get().split("?")[0]||"/";return Ke.find(t=>t.path===e)||Ke[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";T.set(e)});H();h();H();var Li=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Ei=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],Ci=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function qi(){let e=g.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...Ei];let t=[...Li];return e&&t.push({separator:!0},...Ci),t}var Bs="sidebar_collapsed",ie=P(localStorage.getItem(Bs)==="true");function Ai(){let e=!ie.get();ie.set(e),localStorage.setItem(Bs,String(e))}function Is(){let e=()=>T.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${ie.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar"},children:[Mi(),Ni(),Pi()]}}function Mi(){let e=()=>T.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]}]}}function Ni(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>Ai(),title:()=>ie.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${ie.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function Pi(){return{tag:"nav",props:{class:"sidebar__nav"},children:qi().map(e=>e.header?ji(e.header):e.separator?Hi():Bi(e))}}function ji(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function Hi(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function Bi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${T.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>ie.get()?t:"",onclick:r=>{r.preventDefault(),f(e),Rs()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function Fs(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Rs()},children:[]}}function Rs(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}h();H();h();var Ii=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Fi=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],Ri=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Di(){let e=g.get();if(e&&e.is_admin)return Fi;let t=[...Ii];return e&&t.push({separator:!0},...Ri),t}function Ui({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${T.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),f(e),ga()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function Oi(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>ga()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function Wi(){return{tag:"nav",props:{class:"mobile-nav__list"},children:Di().map(e=>e.separator?Ji():Ui(e))}}function Ji(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Ds(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[Oi(),Wi()]}}function Us(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>ga()},children:[]}}function Os(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function ga(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}qt();w();function Ws(){return I(()=>C.get(),()=>Zi(),()=>Ki())}function Js(){let e=()=>{let t=B.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>ss(),"data-theme":()=>B.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function zi(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function Gi(){return setTimeout(Vi,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),zi()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[Yi("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function Vi(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await d.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],r=Number(a.meta?.unread_count||s.filter(i=>!i.read).length||0);t.textContent=r>99?"99+":String(r),e.innerHTML=s.length?s.map(Xi).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(i=>{i.addEventListener("click",async()=>{let n=i.getAttribute("data-notification-id");if(!(!n||i.getAttribute("data-read")==="1"))try{await d.notificationRead(n),i.setAttribute("data-read","1"),i.classList.remove("topbar-notification--unread");let o=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(o)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function Xi(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${Ze(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${Ze(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${Ze(t.title||"Notification")}</div><div class="topbar-notification__text">${Ze(t.message||"")}</div>${r?`<a class="topbar-notification__action"${r}>Open</a>`:""}</div></li>`}function Ze(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Yi(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function Ki(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Js(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Zi(){let e=g.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>Os(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Js(),Gi(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await Le(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}h();H();function zs(){return I(()=>!!ce.get(),()=>{let e=ce.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}w();function Gs(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{d.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let r=[];a.facebook&&r.push(`<a href="${Qe(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&r.push(`<a href="${Qe(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&r.push(`<a href="${Qe(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&r.push(`<a href="${Qe(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=r.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function Qe(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}h();var Qi=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/profile",label:"Account",icon:"bi-person-circle"}],en=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}];function tn(){let e=g.get();return e&&e.is_admin?en:Qi}function an({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${T.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),f(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function sn(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function rn(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:tn().map(e=>e.separator?sn():an(e))}}function fa(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&fa()},!0),window.addEventListener("resize",()=>setTimeout(fa,50)),document.addEventListener("hnav:rendered",()=>setTimeout(fa,0)));function Vs(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[rn()]}}function Xs(){let e=()=>!!g.get()?.is_admin,t=()=>T.get().startsWith("/admin"),a=()=>C.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[I(()=>C.get(),()=>Is(),()=>null),I(()=>C.get(),()=>Fs(),()=>null),I(()=>C.get(),()=>Ds(),()=>null),I(()=>C.get(),()=>Us(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[Ws(),I(()=>C.get()&&!e(),()=>Vs(),()=>null),{tag:"main",props:{class:"app-main"},children:[nn()]},Gs()]},zs()]}}function nn(){let t=T.get().split("?")[0]||"/",a=Ke.find(r=>r.path===t),s=g.get();return s&&s.is_admin&&!t.startsWith("/admin")?(f("/admin"),va()):a?a.requireAuth&&!C.get()?(f("/login"),va()):a.requireAdmin&&(!g.get()||!g.get().is_admin)?cn():!a.requireAuth&&C.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(f("/"),va()):on(a):ln()}function on(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function ln(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function cn(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function va(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}H();h();bt();ca();ua();ma();ba();ht();qe();ft();Pt();wt();Pe();Vt();Kt();$t();kt();Tt();Lt();At();w();h();var b={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function Ks(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
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
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${R(b.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${Ys()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="\u09F30" value="${R(b.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${R(b.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${b.sort==="latest"?"selected":""}>Newest first</option>
                            <option value="budget_low" ${b.sort==="budget_low"?"selected":""}>Lowest budget</option>
                            <option value="budget_high" ${b.sort==="budget_high"?"selected":""}>Highest budget</option>
                            <option value="closing" ${b.sort==="closing"?"selected":""}>Closing soon</option>
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
        `,b.categories.length===0)try{let t=await d.categories();b.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=Ys())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{dn(),b.page=1,et()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{b.search="",b.categoryId="",b.minBudget="",b.maxBudget="",b.sort="latest",b.page=1,pn(),et()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await et()}}}function Ys(){return'<option value="">All categories</option>'+b.categories.map(e=>`<option value="${R(e.id)}" ${String(e.id)===String(b.categoryId)?"selected":""}>${R(e.name)}</option>`).join("")}function dn(){b.search=document.getElementById("jobs-search")?.value.trim()||"",b.categoryId=document.getElementById("jobs-category")?.value||"",b.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",b.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",b.sort=document.getElementById("jobs-sort")?.value||"latest"}function pn(){let e={"jobs-search":b.search,"jobs-category":b.categoryId,"jobs-min-budget":b.minBudget,"jobs-max-budget":b.maxBudget,"jobs-sort":b.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function et(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++b.requestSerial;b.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:b.page,per_page:b.perPage,sort:b.sort};b.search&&(a.search=b.search),b.categoryId&&(a.category_id=b.categoryId),b.minBudget!==""&&(a.min_budget=b.minBudget),b.maxBudget!==""&&(a.max_budget=b.maxBudget);let s=await d.jobs(a);if(t!==b.requestSerial)return;b.jobs=Array.isArray(s.data)?s.data:[],b.total=Number(s.meta?.total||0),b.lastPage=Math.max(1,Number(s.meta?.last_page||1)),un()}catch(a){if(t!==b.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${R(a.message||"unknown error")}</p>`,Zs(),Qs()}finally{t===b.requestSerial&&(b.loading=!1)}}function un(){let e=document.getElementById("jobs-grid");if(e){if(Zs(),Qs(),b.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=b.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${R(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${mn(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${R(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${R(t.title)}</h3>
            <p class="job-card__desc">${R(bn(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.budget||0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.bid_count||0)} bid${Number(t.bid_count)===1?"":"s"}</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function Zs(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(b.total===0){e.textContent="No open jobs found";return}let t=(b.page-1)*b.perPage+1,a=Math.min(b.page*b.perPage,b.total);e.textContent=`Showing ${t}-${a} of ${b.total} open jobs`}function Qs(){let e=document.getElementById("jobs-pagination");if(e){if(b.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${b.page-1}" ${b.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${b.page} of ${b.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${b.page+1}" ${b.page>=b.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>b.lastPage||a===b.page||(b.page=a,et())})})}}function mn(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function bn(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function R(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var ha={bids:[],loading:!1};function er(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await d.workerBids();ha.bids=t.data||[],gn()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${tr(t.message||"unknown")}</p>`}}}}function gn(){let e=document.getElementById("bids-list");if(e){if(ha.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=ha.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${tr(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${fn(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function fn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function tr(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var ye={jobs:[],submissions:[],loading:!1};function ya(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([d.workerActiveJobs(),d.workerSubmissions()]);ye.jobs=t.data||[],ye.submissions=a.data||[],vn()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${wa(t.message||"unknown")}</p>`}}}}function vn(){let e=document.getElementById("active-jobs-list");if(e){if(ye.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=ye.jobs.map(t=>{let a=ye.submissions.find(r=>r.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${wa(t.title)}</h3>
                        <div class="muted">Budget: \u09F3${parseFloat(t.budget).toFixed(2)}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?hn(t,a):yn(t)}
            </div>
        `}).join(""),wn()}}function hn(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${_n(t.created_at)}
            <div class="muted">${wa((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function yn(e){return`
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
    `}function wn(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),r=e.querySelector("[data-submit-btn]");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await d.submitWork(a,{description:String(s.get("description")||"").trim(),external_link:String(s.get("external_link")||"").trim()||null}),l("Work submitted!","success"),ya()()}catch(i){l(i.message||"Failed to submit.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Work'}})})}function _n(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function wa(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var M={activeTab:"categories",categories:[],subcategories:[],loading:!1};function ar(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Categories & Subcategories</h1>
            <p class="muted">Manage main categories, subcategories, and minimum cost limits.</p>
            
            <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button class="btn ${state.activeTab==="categories"?"btn--primary":"btn--ghost"}" id="tab-cats-btn">Main Categories</button>
                <button class="btn ${state.activeTab==="subcategories"?"btn--primary":"btn--ghost"}" id="tab-subcats-btn">Subcategories</button>
            </div>

            <div id="tab-content">
                <div class="card" id="cat-list"><div class="spinner"></div></div>
            </div>
        `,e.querySelector("#tab-cats-btn").addEventListener("click",()=>{M.activeTab="categories",_a(e)}),e.querySelector("#tab-subcats-btn").addEventListener("click",()=>{M.activeTab="subcategories",_a(e)}),await G(e)}}async function G(e){try{let[t,a]=await Promise.all([d.adminCategories(),d.adminSubcategories()]);M.categories=t.data||[],M.subcategories=a.data||[],_a(e)}catch(t){l(t.message||"Failed to load category data.","error")}}function _a(e){let t=e.querySelector("#tab-cats-btn"),a=e.querySelector("#tab-subcats-btn"),s=e.querySelector("#tab-content");s&&(M.activeTab==="categories"?(t&&(t.className="btn btn--primary"),a&&(a.className="btn btn--ghost"),$n(s,e)):(t&&(t.className="btn btn--ghost"),a&&(a.className="btn btn--primary"),Sn(s,e)))}function $n(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Main Categories List</h3>
            ${M.categories.length===0?'<p class="muted">No categories yet.</p>':`
                <div class="table-responsive">
                    <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e5e7eb; padding: 0.5rem;">
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Min Cost (\u09F3)</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${M.categories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${z(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;" class="muted">/${z(s.slug)}</td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${z(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${z(s.updated_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <button class="btn btn--ghost btn--sm edit-cat-btn" data-id="${s.id}"><i class="bi bi-pencil"></i> Edit</button>
                                        <button class="btn btn--ghost btn--sm toggle-cat-btn" data-id="${s.id}">${s.is_active?"Disable":"Enable"}</button>
                                        <button class="btn btn--danger btn--sm del-cat-btn" data-id="${s.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>

        <div class="card">
            <h3>Add New Main Category</h3>
            <form id="add-cat-form" class="poster-form">
                <div class="poster-form__grid">
                    <label>Category Name
                        <input name="name" type="text" required maxlength="80" placeholder="e.g. Website">
                    </label>
                    <label>Slug
                        <input name="slug" type="text" required maxlength="80" placeholder="e.g. website">
                    </label>
                </div>
                <div class="poster-form__grid">
                    <label>Min Cost Per Task (\u09F3)
                        <input name="min_cost" type="number" step="0.01" min="0" value="1.00" required>
                    </label>
                    <label>Display Order
                        <input name="display_order" type="number" value="0">
                    </label>
                </div>
                <label>Description
                    <input name="description" type="text" placeholder="Short description">
                </label>
                <label class="cat-form__label--checkbox">
                    <input name="is_active" type="checkbox" checked> Active
                </label>
                <button type="submit" class="btn btn--primary" id="save-cat-btn">Create Main Category</button>
            </form>
        </div>
    `,e.querySelectorAll(".edit-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=M.categories.find(c=>String(c.id)===String(r));if(!i)return;let n=prompt(`Update Min Cost (\u09F3) for Main Category "${i.name}":`,String(i.min_cost||1));if(n===null)return;let o=parseFloat(n);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await d.adminUpdateCategory(r,{min_cost:o}),l(`Min cost updated for ${i.name}.`,"success"),await G(t)}catch(c){l(c.message,"error")}})}),e.querySelectorAll(".toggle-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=M.categories.find(n=>String(n.id)===String(r));if(i)try{await d.adminUpdateCategory(r,{is_active:!i.is_active}),l("Category updated.","success"),await G(t)}catch(n){l(n.message,"error")}})}),e.querySelectorAll(".del-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id");if(confirm("Delete category?"))try{let i=await d.adminDeleteCategory(r);l(i.message||"Deleted.","success"),await G(t)}catch(i){l(i.message,"error")}})});let a=e.querySelector("#add-cat-form");a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i={name:String(r.get("name")||"").trim(),slug:String(r.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(r.get("min_cost")||"1.00"),display_order:parseInt(r.get("display_order")||"0",10),description:String(r.get("description")||"").trim()||null,is_active:r.get("is_active")==="on"};try{await d.adminCreateCategory(i),l("Main Category created.","success"),await G(t)}catch(n){l(n.message,"error")}})}function Sn(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Subcategories List</h3>
            ${M.subcategories.length===0?'<p class="muted">No subcategories yet.</p>':`
                <div class="table-responsive">
                    <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <th>Subcategory Name</th>
                                <th>Main Category</th>
                                <th>Min Cost (\u09F3)</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${M.subcategories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${z(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;"><span class="badge" style="background:#e0e7ff; color:#3730a3;">${z(s.category_name||"-")}</span></td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${z(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${z(s.updated_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <button class="btn btn--ghost btn--sm edit-subcat-btn" data-id="${s.id}"><i class="bi bi-pencil"></i> Edit</button>
                                        <button class="btn btn--ghost btn--sm toggle-subcat-btn" data-id="${s.id}">${s.is_active?"Disable":"Enable"}</button>
                                        <button class="btn btn--danger btn--sm del-subcat-btn" data-id="${s.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>

        <div class="card">
            <h3>Add New Subcategory</h3>
            <form id="add-subcat-form" class="poster-form">
                <label>Parent Main Category
                    <select name="category_id" required>
                        <option value="">Select Main Category\u2026</option>
                        ${M.categories.map(s=>`
                            <option value="${s.id}">${z(s.name)}</option>
                        `).join("")}
                    </select>
                </label>

                <div class="poster-form__grid">
                    <label>Subcategory Name
                        <input name="name" type="text" required maxlength="100" placeholder="e.g. Website Search & 1-3 Article Visit">
                    </label>
                    <label>Slug
                        <input name="slug" type="text" required maxlength="120" placeholder="e.g. website-search-article-visit">
                    </label>
                </div>

                <div class="poster-form__grid">
                    <label>Min Cost Per Task (\u09F3)
                        <input name="min_cost" type="number" step="0.01" min="0" value="1.00" required>
                    </label>
                    <label>Display Order
                        <input name="display_order" type="number" value="0">
                    </label>
                </div>

                <label class="cat-form__label--checkbox">
                    <input name="is_active" type="checkbox" checked> Active
                </label>
                <button type="submit" class="btn btn--primary" id="save-subcat-btn">Create Subcategory</button>
            </form>
        </div>
    `,e.querySelectorAll(".edit-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=M.subcategories.find(c=>String(c.id)===String(r));if(!i)return;let n=prompt(`Update Min Cost (\u09F3) for Subcategory "${i.name}":`,String(i.min_cost||1));if(n===null)return;let o=parseFloat(n);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await d.adminUpdateSubcategory(r,{min_cost:o}),l(`Min cost updated for ${i.name}.`,"success"),await G(t)}catch(c){l(c.message,"error")}})}),e.querySelectorAll(".toggle-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=M.subcategories.find(n=>String(n.id)===String(r));if(i)try{await d.adminUpdateSubcategory(r,{is_active:!i.is_active}),l("Subcategory updated.","success"),await G(t)}catch(n){l(n.message,"error")}})}),e.querySelectorAll(".del-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id");if(confirm("Delete subcategory?"))try{let i=await d.adminDeleteSubcategory(r);l(i.message||"Deleted.","success"),await G(t)}catch(i){l(i.message,"error")}})});let a=e.querySelector("#add-subcat-form");a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i={category_id:parseInt(r.get("category_id")||"0",10),name:String(r.get("name")||"").trim(),slug:String(r.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(r.get("min_cost")||"1.00"),display_order:parseInt(r.get("display_order")||"0",10),is_active:r.get("is_active")==="on"};try{await d.adminCreateSubcategory(i),l("Subcategory created.","success"),await G(t)}catch(n){l(n.message,"error")}})}function z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var V={grouped:{},social:{},noticesData:{interval:4,notices:[]},loading:!1};function sr(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await rr()}}async function rr(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a,s]=await Promise.all([d.adminSettings(),d.socialLinks(),d.notices()]);V.grouped=t.data||{},V.social=a||{},V.noticesData=s||{interval:4,notices:[]},xn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${N(t.message||"unknown")}</p>`}}}function xn(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(V.grouped).map(n=>`
        <div class="card settings-group">
            <h3 class="card__title">${N(n.charAt(0).toUpperCase()+n.slice(1))}</h3>
            <div class="settings-group__rows">
                ${V.grouped[n].map(o=>Tn(n,o)).join("")}
            </div>
        </div>
    `).join(""),s=V.noticesData,r=[];Array.isArray(s.notices)&&s.notices.length&&(r=s.notices.map(n=>typeof n=="string"?n.startsWith("/")||n.startsWith("http")?{image:n,text:""}:{image:"",text:n}:{image:n.image||"",text:n.text||""})),r.length||(r=[{image:"",text:""}]),a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-image me-2"></i>Banner Setting (Image Only)</h3>
            <p class="muted mb-3" style="font-size:13px;">Upload banner images to display on the homepage dashboard. Click <strong>+ Add Banner Image</strong> to upload images directly. Banners rotate randomly after every specified interval.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="notice-interval" class="settings-row__label">
                        <strong>Rotation Interval (seconds)</strong>
                        <span class="muted">Time period before switching to a random banner image (default: 4 seconds).</span>
                    </label>
                    <div class="settings-row__control">
                        <input type="number" min="1" step="1" id="notice-interval" value="${s.interval||4}" placeholder="4" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="notice-direction" class="settings-row__label">
                        <strong>Animation Direction</strong>
                        <span class="muted">Select transition animation style when switching banner images.</span>
                    </label>
                    <div class="settings-row__control">
                        <select id="notice-direction" class="settings-row__input">
                            <option value="right_to_left" ${(s.direction||"right_to_left")==="right_to_left"?"selected":""}>Right to Left (Gradual Vanish)</option>
                            <option value="left_to_right" ${s.direction==="left_to_right"?"selected":""}>Left to Right (Gradual Vanish)</option>
                            <option value="top_to_bottom" ${s.direction==="top_to_bottom"?"selected":""}>Top to Bottom (Gradual Vanish)</option>
                            <option value="bottom_to_top" ${s.direction==="bottom_to_top"?"selected":""}>Bottom to Top (Gradual Vanish)</option>
                            <option value="fade" ${s.direction==="fade"?"selected":""}>Fade In / Out</option>
                        </select>
                    </div>
                </div>
                <div class="settings-row settings-row--stack">
                    <div class="settings-row__label" style="margin-bottom:8px;">
                        <strong>Banner Images</strong>
                        <span class="muted">Upload image files directly (JPG, PNG, WEBP, GIF).</span>
                    </div>
                    <div id="notice-messages-container" class="banner-messages-list">
                        ${r.map((n,o)=>ir(o+1,n)).join("")}
                    </div>
                    <div style="margin-top: 12px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Banner Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;let i=V.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${N(i.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${N(i.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${N(i.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${N(i.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",Ln),document.getElementById("add-notice-btn").addEventListener("click",kn),$a()}function ir(e,t={image:"",text:""}){let a=typeof t=="string"?t.startsWith("/")||t.startsWith("http")?t:"":t?.image||"",s=typeof t=="string"?!t.startsWith("/")&&!t.startsWith("http")?t:"":t?.text||"",r="";return a?r=`<div class="banner-preview"><img src="${N(a)}" alt="Banner preview"></div>`:s?r=`<div class="banner-preview banner-preview--text"><strong>Text Notice:</strong> <span>${N(s)}</span></div>`:r='<div class="banner-preview banner-preview--empty"><i class="bi bi-image muted"></i> No image uploaded</div>',`
        <div class="banner-message-row card">
            <div class="banner-message-row__header">
                <span class="banner-message-num">Banner ${e}</span>
                <button type="button" class="btn btn--danger btn--sm remove-notice-btn" title="Remove banner">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            <div class="banner-message-row__fields">
                <div class="banner-field banner-field--full">
                    ${r}
                    <input type="hidden" class="notice-msg-image" value="${N(a)}">
                    <div class="banner-upload-ctrl" style="margin-top:8px;">
                        <label class="btn btn--secondary btn--sm banner-upload-btn">
                            <i class="bi bi-cloud-upload"></i> ${a?"Change Image":"Upload Image"}
                            <input type="file" class="banner-file-input" accept="image/*" style="display:none;">
                        </label>
                        <span class="banner-upload-status muted" style="font-size:12px; margin-left:8px;"></span>
                    </div>
                </div>
            </div>
        </div>
    `}function kn(){let e=document.getElementById("notice-messages-container");if(!e)return;let t=e.querySelectorAll(".banner-message-row").length+1,a=document.createElement("div");a.innerHTML=ir(t,{image:""});let s=a.firstElementChild;e.appendChild(s),$a()}function $a(){let e=document.getElementById("notice-messages-container");if(!e)return;e.querySelectorAll(".banner-message-row").forEach((a,s)=>{let r=a.querySelector(".banner-message-num");r&&(r.textContent=`Banner ${s+1}`);let i=a.querySelector(".banner-file-input"),n=a.querySelector(".notice-msg-image"),o=a.querySelector(".banner-preview"),c=a.querySelector(".banner-upload-status"),u=a.querySelector(".banner-upload-btn");i&&!i.dataset.wired&&(i.dataset.wired="true",i.addEventListener("change",async y=>{let E=y.target.files[0];if(E){c&&(c.textContent="Uploading\u2026");try{let $=new FormData;$.append("image",E);let x=await d.adminUploadBannerImage($);x&&x.url&&(n.value=x.url,o.className="banner-preview",o.innerHTML=`<img src="${N(x.url)}" alt="Banner preview">`,c&&(c.textContent="Uploaded!"))}catch($){c&&(c.textContent=$.message||"Upload failed."),l($.message||"Failed to upload image.","error")}}}));let m=a.querySelector(".remove-notice-btn");m&&(m.onclick=()=>{a.remove(),$a()})})}function Tn(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${N(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${N(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${N(t.key)}</strong>
                <span class="muted">${N(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function Ln(){let e={};for(let n of Object.keys(V.grouped))for(let o of V.grouped[n]){let c=`set-${o.key.replace(/[^a-z0-9]/gi,"_")}`,u=document.getElementById(c);if(!u)continue;let m;o.value_type==="boolean"?m=u.checked:o.value_type==="integer"||o.value_type==="percent"?m=parseInt(u.value,10):o.value_type==="decimal"?m=parseFloat(u.value):o.value_type==="json"?m=u.value?JSON.parse(u.value):null:m=u.value,e[o.key]=m}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},s=Array.from(document.querySelectorAll(".banner-message-row")).map(n=>({image:n.querySelector(".notice-msg-image")?.value.trim()||""})).filter(n=>n.image!==""),r={interval:document.getElementById("notice-interval")?.value||4,direction:document.getElementById("notice-direction")?.value||"right_to_left",notices:s},i=document.getElementById("settings-save-btn");i.disabled=!0,i.textContent="Saving\u2026";try{await Promise.all([d.adminUpdateSettings(e),d.adminUpdateSocialLinks(t),d.adminUpdateNotices(r)]),l("Settings, notices, and social links saved successfully.","success"),await rr()}catch(n){l(n.message||"Failed to save.","error")}finally{i.disabled=!1,i.textContent="Save All Changes"}}function N(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}ta();ia();oa();Bt();Rt();Ut();Jt();Nt();var ur={"/":Ce,"/refer":vt,"/webtask":de,"/tasks":de,"/earn":Ae,"/tg-tasks":De,"/withdraw":Me,"/profile":Ne,"/wallet":Ne,"/admin":Gt,"/admin/payments":Yt,"/admin/categories":ar,"/admin/settings":sr,"/admin/jobs":ea,"/admin/transactions":ra,"/admin/reports":na,"/deposit":_t,"/leaderboard":je,"/achievements":He,"/support":Be,"/settings":Fe,"/jobs/available":Ks,"/worker/bids":er,"/worker/active-jobs":ya,"/poster":Ht,"/poster/post-job":It,"/poster/jobs":Dt,"/poster/wallet":Wt,"/notifications":Mt,"/login":la,"/register":pa,"/forgot-password":Xe,"/reset-password":Ye};function mr(){tt(),setTimeout(tt,50),window.addEventListener("hashchange",tt),k(()=>{C.get(),setTimeout(tt,0)})}async function tt(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!ur[t]){let n=t.match(/^\/jobs\/(\d+)$/);if(n){let c=await Promise.resolve().then(()=>(or(),nr));await xa(()=>c.JobDetailPage(n[1]),t);return}let o=t.match(/^\/poster\/jobs\/(\d+)$/);if(o){if(!C.get()){f("/login");return}let c=await Promise.resolve().then(()=>(pr(),dr));await xa(()=>c.PosterJobDetailPage(o[1]),t);return}t="/"}let a=C.get(),s=g.get(),r=["/login","/register","/forgot-password","/reset-password"];if(r.includes(t)&&a){s&&s.is_admin?f("/admin"):f("/");return}if(!r.includes(t)&&!a){f("/login");return}if(t==="/"&&s&&s.is_admin){f("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){On();return}let i=ur[t];await xa(i,t)}async function xa(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function On(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}h();var br=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();br.innerHTML="";U(Xs(),br);O.get()&&A();mr();
