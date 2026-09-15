var ur=Object.defineProperty;var v=(e,t)=>()=>(e&&(t=e(e=0)),t);var _=(e,t)=>{for(var a in t)ur(e,a,{get:t[a],enumerable:!0})};function mr(e,t){ka?ka(e,t):console.error("[Ghost] Unhandled effect error:",e)}function P(e){let t=e,a=new Set;return{get(){return j&&(a.add(j),j.dependencies.add(a)),t},set(s){t!==s&&(t=s,xa(a))}}}function xa(e){tt(()=>{e.forEach(t=>{t.notify?t.notify():ve.add(t)})})}function tt(e){Qe++;try{e()}finally{if(Qe--,Qe===0){let t=Array.from(ve);ve.clear(),t.forEach(a=>a.run())}}}function k(e){let t={dependencies:new Set,run(){et(t),fe.push(j),j=t;try{e()}catch(a){mr(a,e)}finally{j=fe.pop()}},notify(){ve.add(t)}};return t.run(),()=>et(t)}function at(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,xa(s))}};return{get(){if(j&&(s.add(j),j.dependencies.add(s)),a){et(r),fe.push(j),j=r;try{t=e()}finally{j=fe.pop()}a=!1}return t}}}function et(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var j,fe,ve,Qe,ka,W=v(()=>{j=null,fe=[],ve=new Set,Qe=0,ka=null});function se(){st.totalUpdates++,st.recentUpdates++}var he,st,rt=v(()=>{he=new Set,st={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function R(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){br(e,t);return}if(e.__ghostWhen){gr(e,t);return}if(e.__ghostLazy){fr(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;he.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let i=s.startsWith("on");typeof r=="function"&&!i?e.effects.push(k(()=>{a.setAttribute(s,r()),se(),e.events.update?.forEach(n=>n())})):i?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)R(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push(k(()=>{let i=s(),n=document.createTextNode(String(i??""));r?a.replaceChild(n,r):a.appendChild(n),r=n,se(),e.events.update?.forEach(o=>o())}))}else R(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function re(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),he.delete(e)}}function br(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function d(g){return g.el||null}let m=k(()=>{let g=a(),y=g.map(($,M)=>String(s($,M))),L=Array.from(o.keys());for(let $ of L)if(!y.includes($)){let M=o.get($);re(M.ghostNode),o.delete($)}for(let $=0;$<g.length;$++){let M=y[$];if(!o.has(M)){let ae=r(g[$],$),X=document.createElement("ghost-list-slot");for(R(ae,X);X.firstChild;)t.insertBefore(X.firstChild,n);o.set(M,{ghostNode:ae})}}for(let $=y.length-1;$>=0;$--){let M=y[$],ae=o.get(M);if(!ae)continue;let X=d(ae.ghostNode);if(!X)continue;let $a=y[$+1],Sa=($a?d(o.get($a)?.ghostNode):null)||n;X.nextSibling!==Sa&&t.insertBefore(X,Sa)}se()});e._listCleanup=()=>{m();for(let g of o.values())re(g.ghostNode);o.clear(),i.remove(),n.remove()}}function B(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function gr(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=k(()=>{let m=a()?s:r;if(n&&(re(n),n=null),m&&(n=m(),n)){let g=document.createElement("ghost-when-slot");for(R(n,g);g.firstChild;)t.insertBefore(g.firstChild,i)}se()});e._whenCleanup=()=>{o(),n&&re(n),i.remove()}}function fr(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let i=null;if(s){let n=document.createElement("ghost-lazy-slot");for(R(s,n);n.firstChild;)t.insertBefore(n.firstChild,r);i=s}a().then(n=>{let o=n.default||n;i&&(re(i),i=null);let d=typeof o=="function"?o():o,m=document.createElement("ghost-lazy-slot");for(R(d,m);m.firstChild;)t.insertBefore(m.firstChild,r);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var it=v(()=>{W();rt()});var Ta=v(()=>{W()});var ye=v(()=>{});var La=v(()=>{rt()});var Ea=v(()=>{W()});var Ca=v(()=>{it();W();ye();ye()});function hr(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let i={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){i["@attributes"]={};for(let n of r.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of r.childNodes){let o=n.nodeName,d=s(n);d!==""&&(i[o]===void 0?i[o]=d:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(d)))}return i}return s(a.documentElement)}function yr(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function ot(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),i={url:e,...s};for(let y of ot.interceptors.request)i=y(i)??i;let n=i.url;delete i.url;let o=yr(n,r);if(a==="memory"&&r==="GET"&&nt.has(o))return nt.get(o);let d=await fetch(n,i),m=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let g;m.includes("application/xml")||m.includes("text/xml")?g=hr(await d.text()):m.includes("application/json")?g=await d.json():g=await d.text();for(let y of ot.interceptors.response)g=y(d,g)??g;return a==="memory"&&r==="GET"&&nt.set(o,g),g}var nt,qa=v(()=>{nt=new Map;ot.interceptors={request:[],response:[]}});function lt(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=P(a);return k(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var Aa=v(()=>{W()});function wr(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var go,Ma=v(()=>{go=wr()});var ho,_r,Pa=v(()=>{W();ho=P("en"),_r=new Map;_r.set("en",{})});var N=v(()=>{W();it();Ta();ye();La();Ea();Ca();qa();Aa();Ma();Pa()});function Na(e){we=e}function $r(){return we}function Ha(e){ct=e}async function p(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let i=e.startsWith("http")?e:ja.apiBase+e,n={method:t,headers:{"Content-Type":"application/json",Accept:"application/json",...s}};we&&(n.headers.Authorization=`Bearer ${we}`),a!==void 0&&(n.body=JSON.stringify(a)),r&&(n.signal=r);let o=await fetch(i,n);if(o.status===401)throw ct&&ct(),new ie("Unauthorized",401,null);let d=null,m=o.headers.get("content-type")||"";try{if(m.includes("application/json"))d=await o.json();else{let g=await o.text();d=g?{message:g}:null}}catch{}if(!o.ok){let g=d&&d.message||`HTTP ${o.status}`;throw new ie(g,o.status,d)}return d}var ja,we,ct,ie,c,w=v(()=>{ja=window.JMJOB_CONFIG||{apiBase:"/api"},we=null,ct=null;ie=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},c={health:()=>p("/health"),register:e=>p("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>p("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>p("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>p("/auth/login",{method:"POST",body:e}),forgotPassword:e=>p("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>p("/auth/reset-password",{method:"POST",body:e}),logout:()=>p("/auth/logout",{method:"POST"}),me:()=>p("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/notifications${t?"?"+t:""}`)},notificationRead:e=>p(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>p("/notifications/read-all",{method:"POST"}),meUser:()=>p("/user"),reward:e=>p("/user/reward",{method:"POST",body:e}),withdraw:e=>p("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>p("/user/withdrawals"),referrals:()=>p("/user/referrals"),adHistory:()=>p("/user/ads"),adsConfig:()=>p("/ads/config"),adsNext:()=>p("/ads/next"),webTasks:()=>p("/tasks/web"),webTaskStart:e=>p("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>p("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>p("/tasks/telegram"),tgTaskVerify:e=>p("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>p("/admin/stats"),adminWithdrawals:(e="pending")=>p(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>p(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>p(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>p(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>p("/admin/users"),adminUpdateUserRole:(e,t)=>p(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminProviders:()=>p("/admin/ad-providers"),adminUpdateProvider:(e,t)=>p(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminResetDailyCounters:()=>p("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>p("/payment/gateways"),paymentSubmit:e=>p("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>p("/payment/submissions"),adminPayments:(e="")=>p(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>p(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>p(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>p("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/jobs${t?"?"+t:""}`)},job:e=>p(`/jobs/${e}`),placeBid:(e,t)=>p(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>p(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>p("/worker/bids"),workerActiveJobs:()=>p("/worker/active-jobs"),submitWork:(e,t)=>p(`/jobs/${e}/submit`,{method:"POST",body:t}),workerSubmissions:()=>p("/worker/submissions"),posterStats:()=>p("/poster/stats"),posterCreateJob:e=>p("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>p("/poster/jobs"),posterJobBids:e=>p(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>p(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>p(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>p(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>p(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>p("/admin/categories"),adminCreateCategory:e=>p("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>p(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>p(`/admin/categories/${e}/delete`,{method:"POST"}),adminSettings:()=>p("/admin/settings"),adminUpdateSettings:e=>p("/admin/settings",{method:"POST",body:e}),socialLinks:()=>p("/social-links"),adminUpdateSocialLinks:e=>p("/admin/social-links",{method:"POST",body:e}),notices:()=>p("/notices"),adminUpdateNotices:e=>p("/admin/notices",{method:"POST",body:e}),adminUploadBannerImage:async e=>{let t=ja.apiBase+"/admin/notices/upload",a={},s=$r();s&&(a.Authorization=`Bearer ${s}`);let r=await fetch(t,{method:"POST",headers:a,body:e}),i=await r.json();if(!r.ok)throw new ie(i.message||"Upload failed",r.status,i);return i},adminJobs:(e="")=>p(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminFlagJobDispute:e=>p(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>p(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return p(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>p("/admin/reports"),adminRevenue:()=>p("/admin/revenue")}});function l(e,t="info",a=3500){ne.set({message:e,type:t,id:Date.now()}),dt&&clearTimeout(dt),dt=setTimeout(()=>ne.set(null),a)}async function q(){if(!D.get())return null;try{let e=await c.me();return b.set(e.data),e.data}catch{return null}}async function Ba(e,t){let a=await c.login({email:e,password:t});return D.set(a.data.token),b.set(a.data.user),a.data.user}async function Ia(e){return c.requestRegistrationOtp(e)}async function Fa(e){let t=await c.verifyRegistrationOtp(e);return D.set(t.data.token),b.set(t.data.user),t.data.user}async function _e(){try{await c.logout()}catch{}D.set(null),b.set(null),x.set("/login")}function f(e){window.location.hash=e}var Sr,kr,D,b,ne,dt,x,E,h=v(()=>{N();N();w();Sr="earnap_token",kr="earnap_user",D=lt(Sr,null),b=lt(kr,null),ne=P(null),dt=null;x=P(window.location.hash.replace(/^#/,"")||"/"),E=at(()=>!!D.get()&&!!b.get());k(()=>{let e=D.get();Na(e)});Ha(()=>{D.set(null),b.set(null),x.set("/login"),l("Session expired. Please log in.","error")})});var Da={};_(Da,{HomePage:()=>Se});function Se(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=b.get();xr(e),e.appendChild(Tr(t)),e.appendChild(Lr()),e.appendChild(Er(t))}}function Y(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}async function xr(e){$e&&(clearInterval($e),$e=null);try{let t=await c.notices(),s=(Array.isArray(t.notices)&&t.notices.length?t.notices:[]).map(y=>{if(typeof y=="string"){let L=y.trim();return L.startsWith("/")||L.startsWith("http")?{image:L,text:""}:{image:"",text:L}}return{image:y.image||"",text:y.text||""}}).filter(y=>y.image&&y.image.trim()||y.text&&y.text.trim());s.length||s.push({text:"Complete tasks, watch ads, refer friends, and withdraw anytime.",image:""});let r=Y("div","welcome-popup welcome-popup--banner","");r.innerHTML=`
            <div id="notice-banner-content" class="welcome-popup__content"></div>
        `,e.firstChild?e.insertBefore(r,e.firstChild):e.appendChild(r);let i=r.querySelector("#notice-banner-content"),n=typeof t.interval=="number"&&t.interval>0?t.interval:4,o=t.direction||"right_to_left",d={right_to_left:{exit:"banner-vanish-left",enter:"banner-enter-right"},left_to_right:{exit:"banner-vanish-right",enter:"banner-enter-left"},top_to_bottom:{exit:"banner-vanish-bottom",enter:"banner-enter-top"},bottom_to_top:{exit:"banner-vanish-top",enter:"banner-enter-bottom"},fade:{exit:"banner-vanish-fade",enter:"banner-enter-fade"}},m=d[o]||d.right_to_left,g=0;Ra(i,s[0]),s.length>1&&($e=setInterval(()=>{let y;do y=Math.floor(Math.random()*s.length);while(y===g&&s.length>1);g=y,i.className=`welcome-popup__content ${m.exit}`,setTimeout(()=>{Ra(i,s[g]),i.className=`welcome-popup__content ${m.enter}`,setTimeout(()=>{i.className="welcome-popup__content"},350)},350)},n*1e3))}catch{}}function Ra(e,t){e.innerHTML="";let a=!!(t&&t.text&&t.text.trim());if(!!(t&&t.image&&t.image.trim())){let r=document.createElement("img");r.className="welcome-popup__image",r.src=t.image,r.alt=t.text||"Banner Notice",r.onerror=()=>{r.style.display="none"},e.appendChild(r)}if(a){let r=document.createElement("div");r.className="welcome-popup__text-wrap",r.innerHTML=`<strong>JM Job:</strong> <span>${Cr(t.text)}</span>`,e.appendChild(r)}}function Tr(e){let t=Y("div","card card--user-header"),a=Y("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function Lr(){let e=Y("div","icon-grid");return[{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill",tone:"purple"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/tasks",label:"Web Task",icon:"bi-link-45deg",tone:"blue"},{path:"/webtask",label:"Tasks",icon:"bi-telegram",tone:"blue"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=Y("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),f(a.path)}),e.appendChild(s)}),e}function Er(e){let t=Y("div","card card--daily-mission"),a=e&&e.today_ads||0,s=e&&e.ads_limit||50,r=Math.min(100,a/Math.max(1,s)*100);t.innerHTML=`
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${s} | Completed: ${a}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${r}%"></div>
        </div>
    `;let i=Y("button","btn btn--primary btn--xl","\u{1F381} Claim Daily Bonus");return i.addEventListener("click",async()=>{try{let n=await fetch("/api/user/claim-daily-bonus",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:"Bearer "+(window.JMJOB_TOKEN||"")}}).then(o=>o.json());n.success?(l(n.message||"Daily bonus claimed!","success"),await q(),Se()()):l(n.message||"Bonus not available.","info")}catch{l("Could not claim. Try again later.","error")}}),t.appendChild(i),t}function Cr(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var $e,pt=v(()=>{h();w();$e=null});var ut={};_(ut,{WebTaskPage:()=>oe});function oe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await c.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(qr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function qr(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Ua(e.title)}</h3>
        <p class="card__sub">${Ua(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>Ar(e,a,t)),t}async function Ar(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{s+=1;let d=r-s;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",s>=r&&(clearInterval(o),Mr(t,n,a))},1e3)}function Mr(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await q(),oe()()}catch(s){l(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Ua(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ke=v(()=>{w();h()});var Oa={};_(Oa,{EarnPage:()=>xe});function xe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--earn";let t=b.get(),a=t?t.ads_remaining:0;e.innerHTML=`
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
        `;let s=e.querySelector("#watch-btn");s.disabled||s.addEventListener("click",()=>Pr())}}function Pr(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=s.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await jr(e,"simulated",t))},1e3)},300)}async function jr(e,t,a){try{let s=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await q(),e.remove(),xe()()}catch(s){l(s.message||"Reward failed","error"),e.remove()}}var mt=v(()=>{w();h()});var Wa={};_(Wa,{ReferPage:()=>bt});function bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=b.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let r=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),l("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),l("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(s);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let m=document.createElement("div");m.className="refer-item",m.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Ja(d.name)}</div>
                        <div class="refer-item__username">@${Ja(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(m)})}}function Ja(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var gt=v(()=>{w();h()});var Ga={};_(Ga,{WithdrawPage:()=>Te});function Te(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=b.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await q(),Te()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let m=Object.values(d)[0];l(Array.isArray(m)?m[0]:m,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",i.forEach(n=>s.appendChild(Nr(n))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Nr(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${ft(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${ft(e.gateway)} \xB7 ${ft(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function ft(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var vt=v(()=>{w();h()});var Xa={};_(Xa,{DepositPage:()=>ht});function ht(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=b.get();e.innerHTML=`
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
        `;try{S.loading=!0;let[s,r]=await Promise.all([c.paymentGateways(),c.paymentSubmissions()]);S.gateways=s.data.gateways,S.minAmount=s.data.min_amount,S.maxAmount=s.data.max_amount,S.submissions=r.data,Va(),za()}catch(s){l("Failed to load deposit info: "+s.message,"error")}finally{S.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!S.selectedGateway){l("Please select a payment method.","error");return}let r=new FormData(a),i=document.getElementById("deposit-submit-btn");i.disabled=!0,i.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let n=await c.paymentSubmit({gateway:S.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});l(n.message||"Payment submitted.","success"),a.reset();let o=await c.paymentSubmissions();S.submissions=o.data,za(),await q();let d=b.get(),m=document.getElementById("deposit-balance");m&&d&&(m.textContent="\u09F3"+parseFloat(d.role==="poster"?d.wallet_balance||0:d.balance||0).toFixed(2))}catch(n){l(n.message||"Failed to submit payment.","error")}finally{i.disabled=!1,i.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function Va(){let e=document.getElementById("payment-gateways");if(e){if(S.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=S.gateways.map(t=>`
        <button class="payment-gateway ${S.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${Z(t.label)}</div>
                <div class="payment-gateway__number">${Z(t.wallet_number)}</div>
            </div>
            ${S.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{S.selectedGateway=t.getAttribute("data-gateway"),Va(),Br()})})}}function Br(){let e=S.gateways.find(i=>i.key===S.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
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
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{l("Wallet number copied.","info")}).catch(()=>{l("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=S.minAmount,r.max=S.maxAmount,r.placeholder=`${S.minAmount} \u2013 ${S.maxAmount}`)}function za(){let e=document.getElementById("payment-history");if(e){if(S.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=S.submissions.map(t=>{let a=Hr[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${Z((t.gateway||"").toUpperCase())} \u2022 TRX: ${Z(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Ir(t.created_at)}</div>
            </div>
        `}).join("")}}function Ir(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Hr,S,yt=v(()=>{w();h();Hr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},S={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var _t={};_(_t,{ProfilePage:()=>Le});function Le(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=b.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?wt(t.name):""}</h2>
                <p class="card__sub">@${t?wt(t.username):""}</p>
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
                        <span class="ad-history__provider">${wt(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function wt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ee=v(()=>{w();h()});var Ya={};_(Ya,{default:()=>Ce});async function Ce(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var $t=v(()=>{h()});var Ka={};_(Ka,{default:()=>qe});async function qe(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var St=v(()=>{h()});var Za={};_(Za,{default:()=>Ae});async function Ae(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var kt=v(()=>{h()});function Fr(){let e=localStorage.getItem(Qa);return e==="dark"||e==="light"?e:"system"}function Rr(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function xt(e){let t=Rr(e);document.documentElement.setAttribute("data-theme",t)}function es(){let e=H.get();H.set(e==="dark"?"light":"dark")}function ts(e){H.set(e)}function Dr(){let e=localStorage.getItem(as);return e&&Tt.includes(e)?e:"default"}function ss(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function rs(e){Tt.includes(e)&&le.set(e)}function is(){return Tt}var Qa,H,as,Tt,le,Lt=v(()=>{N();Qa="jmjob_theme";H=P(Fr());xt(H.get());k(()=>{let e=H.get();xt(e),localStorage.setItem(Qa,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{H.get()==="system"&&xt("system")});as="jmjob_color_theme",Tt=["default","emerald","amber","rose"];le=P(Dr());ss(le.get());k(()=>{let e=le.get();ss(e),localStorage.setItem(as,e)})});var ns={};_(ns,{default:()=>Pe});async function Pe(){let e=document.querySelector("[data-view]");if(!e)return;let t=b.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=H.get(),s=le.get(),r=is();e.innerHTML=`
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
                        <div class="settings-value">${Me[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${r.map(o=>`
                            <button class="theme-swatch ${o===s?"is-active":""}" data-color="${o}" role="radio" aria-checked="${o===s}" title="${Me[o]||o}">
                                <span class="theme-swatch__chip" style="background: ${Ur[o]};"></span>
                                <span class="theme-swatch__label">${(Me[o]||o).split(" ")[0]}</span>
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
    `;let i=document.getElementById("theme-mode-group");i&&i.querySelectorAll("button[data-mode]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-mode");ts(d),l(`Theme mode set to ${d}.`,"info")})});let n=document.getElementById("color-theme-group");n&&n.querySelectorAll("button[data-color]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-color");rs(d),l(`Accent color set to ${Me[d]||d}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await _e(),l("Logged out.","info")})}var Me,Ur,Et=v(()=>{h();Lt();Me={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},Ur={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var ls={};_(ls,{NotificationsPage:()=>Ct});function Ct(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await c.notificationsReadAll(),l("All notifications marked as read.","success"),await os()}catch(t){l(t.message||"Could not update notifications.","error")}}),await os())}}async function os(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await c.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(Or).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await c.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){l(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${ce(t.message||"unknown error")}</p>`}}function Or(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${ce(t.action_url)}">Open</a>`:"",i=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${ce(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${ce(t.title||"Notification")}</h3><p>${ce(t.message||"")}</p><small>${Jr(e.created_at)}</small></div><div class="notifications-page__actions">${r}${i}</div></article>`}function Jr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ce(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var qt=v(()=>{w();h()});var cs={};_(cs,{TgTasksPage:()=>Ne});function Ne(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await c.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Wr(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Wr(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${je(e.channel_name)}</strong>
                <span class="muted">${je(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${je(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${je(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Gr(e,t)},3e3)})}return t}async function Gr(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await q(),Ne()()}catch(s){l(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function je(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var At=v(()=>{w();h()});var us={};_(us,{PosterDashboardPage:()=>Pt});function Pt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-dashboard";let t=b.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),f("/poster/post-job")}),await ds()}}async function ds(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await c.posterStats();Vr(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${ps(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",ds),l(t.message||"Failed to load poster statistics.","error")}}function Vr(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=Mt(t.wallet_balance),i=Mt(t.frozen_balance),n=Mt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${He("bi-briefcase","Total jobs",a.total||0)}
            ${He("bi-lightning-charge","Active jobs",s)}
            ${He("bi-wallet2","Available wallet",r,"\u09F3")}
            ${He("bi-lock","In escrow",i,"\u09F3")}
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
    `,e.querySelectorAll("[data-poster-link]").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault(),f(o.getAttribute("href").replace(/^#/,""))})})}function He(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${ps(String(a))}</strong>
        </div>
    `}function Q(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Xr(e)}"></i> ${zr[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Xr(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function Mt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function ps(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var zr,jt=v(()=>{w();h();zr={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var gs={};_(gs,{PostJobPage:()=>Ht});function Ht(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--post-job",!Qr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t={currentStep:1,categories:[],mainCategoryId:"",subCategoryId:"",title:"",description:"",thumbnailBase64:"",proofRequirements:[{title:"",type:"text"}],workerCount:1,costPerWorker:10,biddingValue:3,biddingUnit:"days",deadlineAt:"",feePercentage:30};try{let a=await c.categories();t.categories=a.data||[]}catch(a){l(a.message||"Could not load categories.","error")}pe(e,t)}}function pe(e,t){e.innerHTML=`
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
    `,Yr(e,t)}function Yr(e,t){let a=e.querySelector("#wizard-card-body");a&&(t.currentStep===1?bs(a,e,t):t.currentStep===2?Nt(a,e,t):t.currentStep===3&&Kr(a,e,t))}function bs(e,t,a){let s=a.categories.find(o=>Number(o.id)===Number(a.mainCategoryId)),r=s?s.subcategories||[]:[];e.innerHTML=`
        <form id="step-1-form" class="poster-form">
            <h2>Step 1: Select Category</h2>
            
            <label>Main Category
                <select id="main-category-select" required>
                    <option value="">Choose Main Category\u2026</option>
                    ${a.categories.map(o=>`
                        <option value="${o.id}" ${Number(a.mainCategoryId)===Number(o.id)?"selected":""}>
                            ${de(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <label>Sub Category
                <select id="sub-category-select" ${s?"":"disabled"}>
                    <option value="">Choose Sub Category (Optional)\u2026</option>
                    ${r.map(o=>`
                        <option value="${o.id}" ${Number(a.subCategoryId)===Number(o.id)?"selected":""}>
                            ${de(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                <button type="submit" class="btn btn--primary" id="step-1-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;let i=e.querySelector("#main-category-select"),n=e.querySelector("#sub-category-select");i.addEventListener("change",o=>{a.mainCategoryId=o.target.value,a.subCategoryId="",bs(e,t,a)}),n.addEventListener("change",o=>{a.subCategoryId=o.target.value}),e.querySelector("#step-cancel").addEventListener("click",Bt),e.querySelector("#step-1-form").addEventListener("submit",o=>{if(o.preventDefault(),!a.mainCategoryId){l("Please select a main category.","error");return}a.currentStep=2,pe(t,a)})}function Nt(e,t,a){e.innerHTML=`
        <form id="step-2-form" class="poster-form">
            <h2>Step 2: Job Details & Proof Requirements</h2>

            <label>Job Title
                <input id="job-title-input" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo" value="${de(a.title)}">
            </label>

            <label>Task Instructions (Description)
                <textarea id="job-desc-input" rows="5" required placeholder="Explain step by step instructions for workers\u2026">${de(a.description)}</textarea>
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
                            <input type="text" class="proof-title-input" placeholder="Proof Requirement Title (e.g. Provide Username)" value="${de(i.title)}" style="flex:2;" required>
                            <select class="proof-type-select" style="flex:1;">
                                <option value="text" ${i.type==="text"?"selected":""}>Text Proof</option>
                                <option value="screenshot" ${i.type==="screenshot"?"selected":""}>Screenshot Proof</option>
                            </select>
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
    `;let s=e.querySelector("#proof-pairs-container");e.querySelector("#add-proof-btn").addEventListener("click",()=>{Be(e,a),a.proofRequirements.push({title:"",type:"text"}),Nt(e,t,a)}),s.addEventListener("click",i=>{let n=i.target.closest(".remove-proof-btn");if(n){let o=Number(n.getAttribute("data-index"));Be(e,a),a.proofRequirements.splice(o,1),Nt(e,t,a)}}),e.querySelector("#job-thumbnail-input").addEventListener("change",i=>{let n=i.target.files[0];if(n){let o=new FileReader;o.onload=d=>{a.thumbnailBase64=d.target.result},o.readAsDataURL(n)}}),e.querySelector("#step-cancel").addEventListener("click",Bt),e.querySelector("#step-2-back").addEventListener("click",()=>{Be(e,a),a.currentStep=1,pe(t,a)}),e.querySelector("#step-2-form").addEventListener("submit",i=>{if(i.preventDefault(),Be(e,a),!a.title.trim()){l("Job title is required.","error");return}if(!a.description.trim()){l("Task instructions are required.","error");return}a.currentStep=3,pe(t,a)})}function Be(e,t){t.title=e.querySelector("#job-title-input")?.value||"",t.description=e.querySelector("#job-desc-input")?.value||"";let a=e.querySelectorAll(".proof-pair-row");t.proofRequirements=Array.from(a).map(s=>({title:s.querySelector(".proof-title-input")?.value||"",type:s.querySelector(".proof-type-select")?.value||"text"}))}function Kr(e,t,a){let s=Number(a.workerCount||0)*Number(a.costPerWorker||0),r=s*(a.feePercentage/100),i=s+r;e.innerHTML=`
        <form id="step-3-form" class="poster-form">
            <h2>Step 3: Workers & Pricing</h2>

            <div class="poster-form__grid">
                <label>Workers Needed
                    <input id="worker-count-input" type="number" min="1" step="1" required value="${a.workerCount}">
                </label>

                <label>Cost Per Worker (\u09F3)
                    <input id="cost-per-worker-input" type="number" min="0.01" step="0.01" required value="${a.costPerWorker}">
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
    `;let n=e.querySelector("#worker-count-input"),o=e.querySelector("#cost-per-worker-input"),d=()=>{a.workerCount=Math.max(1,parseInt(n.value,10)||1),a.costPerWorker=Math.max(0,parseFloat(o.value)||0);let m=a.workerCount*a.costPerWorker,g=m*(a.feePercentage/100),y=m+g;e.querySelector("#summary-subtotal").textContent=`\u09F3${m.toFixed(2)}`,e.querySelector("#summary-fee").textContent=`\u09F3${g.toFixed(2)}`,e.querySelector("#summary-total").textContent=`\u09F3${y.toFixed(2)}`};n.addEventListener("input",d),o.addEventListener("input",d),e.querySelector("#step-cancel").addEventListener("click",Bt),e.querySelector("#step-3-back").addEventListener("click",()=>{ms(e,a),a.currentStep=2,pe(t,a)}),e.querySelector("#step-3-form").addEventListener("submit",async m=>{m.preventDefault(),ms(e,a);let g=e.querySelector("#post-job-publish");g.disabled=!0,g.textContent="Publishing\u2026";let y=0,L=Number(a.biddingValue||0);L>0&&(a.biddingUnit==="minutes"?y=L/60:a.biddingUnit==="hours"?y=L:a.biddingUnit==="days"?y=L*24:a.biddingUnit==="months"&&(y=L*24*30));try{await c.posterCreateJob({category_id:Number(a.mainCategoryId),subcategory_id:a.subCategoryId?Number(a.subCategoryId):null,title:a.title.trim(),description:a.description.trim(),thumbnail:a.thumbnailBase64||null,proof_requirements:a.proofRequirements,worker_count:Number(a.workerCount),cost_per_worker:Number(a.costPerWorker),budget:Number(a.workerCount)*Number(a.costPerWorker),deadline_at:Zr(a.deadlineAt),bidding_window_hours:y}),l("Job published successfully.","success"),f("/poster/jobs")}catch($){l($.message||"Could not publish job.","error"),g.disabled=!1,g.textContent="Publish Job"}})}function ms(e,t){t.workerCount=Number(e.querySelector("#worker-count-input")?.value||1),t.costPerWorker=Number(e.querySelector("#cost-per-worker-input")?.value||0),t.biddingValue=Number(e.querySelector("#bidding-val-input")?.value||0),t.biddingUnit=e.querySelector("#bidding-unit-input")?.value||"days",t.deadlineAt=e.querySelector("#deadline-input")?.value||""}function Bt(){confirm("Are you sure you want to cancel posting this job?")&&f("/poster")}function Zr(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function Qr(){return!!b.get()}function de(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var It=v(()=>{w();h()});var vs={};_(vs,{PosterJobsPage:()=>Ft});function Ft(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!si()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${ei.map(t=>`<option value="${t}" ${t===Fe?"selected":""}>${t?fs(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),f("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{Fe=t.target.value,await Ie()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",Ie),await Ie()}}}async function Ie(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await c.posterMyJobs()).data||[]).filter(s=>!Fe||s.status===Fe);e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(ti(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${ee(t.message||"unknown error")}</p>`}}}function ti(e){let t=document.createElement("article");return t.className=`admin-row poster-job-row poster-job-row--${ee(e.status)}`,t.innerHTML=`
        <div class="poster-job-row__header">
            <div><strong>${ee(e.title)}</strong><span class="badge">${ee(fs(e.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${ee(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${ee(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(e.bid_count||0)}</span><span><strong>Views:</strong> ${Number(e.view_count||0)}</span><span><strong>Created:</strong> ${ri(e.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${["completed","cancelled"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>f(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>ai(e.id)),t}async function ai(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await c.posterCancelJob(e,{reason:t}),l("Job cancelled.","success"),await Ie()}catch(a){l(a.message||"Could not cancel job.","error")}}function si(){return!!b.get()}function fs(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function ri(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ee(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ei,Fe,Rt=v(()=>{w();h();ei=["","open","assigned","submitted","revision","completed","cancelled","disputed"],Fe=""});var hs={};_(hs,{PosterWalletPage:()=>Ut});function Ut(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=b.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([c.posterStats(),c.paymentSubmissions()]);ii(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Re(a.message||"unknown error")}</p>`}}}function ii(e,t,a){let s=Dt(t.wallet_balance),r=Dt(t.frozen_balance),i=Dt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${ni(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>f("/deposit"))}function ni(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Re((t.gateway||"").toUpperCase())}</strong><small>${Re(t.trxid)} \xB7 ${oi(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Re(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function Dt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function oi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Re(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ot=v(()=>{w();h()});var _s={};_(_s,{AdminPage:()=>Wt});function Wt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=b.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(r=>{r.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),r.classList.add("admin-tab--active"),ys(r.dataset.tab,s)})}),ys("stats",s)}}async function ys(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([c.adminStats(),c.adminRevenue()]),r=a.data||{},i=s.data||{},n=i.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${G("bi-graph-up-arrow","Platform revenue",Jt(i.platform_revenue,n))}
                    ${G("bi-percent","Commission rate",`${(Number(i.commission_rate||0)*100).toFixed(2)}%`)}
                    ${G("bi-briefcase","Total jobs",z(i.total_jobs))}
                    ${G("bi-check2-circle","Completed jobs",z(i.completed_jobs))}
                    ${G("bi-lightning-charge","Active jobs",z(i.active_jobs))}
                    ${G("bi-people","Total users",z(i.total_users))}
                    ${G("bi-hourglass-split","Pending deposits",z(i.pending_payments))}
                    ${G("bi-lock","Held in escrow",Jt(i.escrow_total,n))}
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
                        <div><span class="muted">Withdrawals</span><strong>${z(r.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${z(r.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${z(r.total_ad_views)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${Jt(r.total_lifetime_paid,n)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${C(i.currency||"BDT")}</strong> currency \xB7 <strong>${C(i.escrow_mode||"full_bid")}</strong> escrow</div>
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
            `;let r=t.querySelector("#wd-list");s.forEach(i=>r.appendChild(ws(i,r))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);r.innerHTML="",(n.data||[]).forEach(o=>r.appendChild(ws(o,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),i=Number(b.get()?.id||0);s.forEach(n=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${C(n.name)}</strong>
                        <span class="muted">${C(n.email)}</span>
                        <span class="badge user-role-badge">${C(n.role||(n.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(n.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(n.lifetime_earned||0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(n.id)===i?"disabled":""}>
                                ${["worker","poster","admin"].map(m=>`<option value="${m}" ${(n.role||(n.is_admin?"admin":"worker"))===m?"selected":""}>${m[0].toUpperCase()+m.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let d=o.querySelector(".admin-user-role");d?.addEventListener("change",async()=>{let m=n.role||(n.is_admin?"admin":"worker");try{let g=await c.adminUpdateUserRole(n.id,d.value);n.role=g.data?.role||d.value,n.is_admin=!!g.data?.is_admin,o.querySelector(".user-role-badge").textContent=n.role.toUpperCase(),l("User role updated","success")}catch(g){d.value=m,l(g.message||"Role update failed","error")}}),r.appendChild(o)})}else if(e==="providers"){let s=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(i=>r.appendChild(li(i,r)))}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function G(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${C(t)}</span>
            <strong>${C(String(a))}</strong>
        </div>
    `}function z(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Jt(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function ws(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${C(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${C(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${C(e.gateway)} \xB7 ${C(e.wallet_address)}</div>
        <div class="admin-row__status">${C(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),s.appendChild(r),s.appendChild(i),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function li(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${C(e.name)}</strong>
            <span class="muted">${C(e.slug)}</span>
            ${s?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${C(r)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${s?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}function C(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Gt=v(()=>{w();h();h()});var ks={};_(ks,{AdminPaymentsPage:()=>Vt});function Vt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=b.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${U.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${U.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${U.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${U.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{U.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),zt()})}),await zt()}}async function zt(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminPayments(U.status);U.items=t.data||[],di(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${K(t.message||"Failed to load.")}</p>`}}}function di(e){if(U.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",U.items.forEach(t=>e.appendChild(pi(t)))}function pi(e){let t=ci[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
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
                <span class="muted">Submitted: ${Ss(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${Ss(e.verified_at)}</span>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>$s(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>$s(e.id,"reject",a))),a}async function $s(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let i=await(t==="approve"?c.adminApprovePayment:c.adminRejectPayment)(e,{note:s||null});l(i.message||"Done.","success"),await zt()}catch(r){l(r.message||"Action failed.","error")}}function Ss(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function K(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ci,U,Xt=v(()=>{w();h();ci={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},U={status:"pending",items:[],loading:!1}});var Ts={};_(Ts,{AdminJobsPage:()=>Zt});function Zt(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-jobs",!b.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${ui.map(t=>`<option value="${t}" ${t===Kt?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-job-status").addEventListener("change",async t=>{Kt=t.target.value,await ue()}),e.querySelector("#admin-job-refresh").addEventListener("click",ue),await ue()}}}async function ue(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminJobs(Kt)).data||[];e.innerHTML=a.length?"":'<p class="muted">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(mi(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load jobs: ${I(t.message||"unknown error")}</p>`}}}function mi(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${I(e.status)}`;let a=e.worker?`${I(e.worker.name)} <span class="muted">(${I(e.worker.email||"")})</span>`:'<span class="muted">Unassigned</span>';t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${I(e.title)}</strong>
                <span class="badge">${I(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${I(e.currency||"BDT")} ${Number(e.budget||0).toFixed(2)}</strong>
        </div>
        <p class="admin-job-row__description muted">${I(e.description||"")}</p>
        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${I(e.poster?.name||"(deleted)")}</span>
            <span><strong>Worker:</strong> ${a}</span>
            <span><strong>Category:</strong> ${I(e.category_name||"Uncategorized")}</span>
            <span><strong>Bids:</strong> ${Number(e.bid_count||0).toLocaleString()} \xB7 <strong>Views:</strong> ${Number(e.view_count||0).toLocaleString()}</span>
        </div>
        <div class="admin-job-row__footer">
            <span class="muted">Updated ${gi(e.updated_at||e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let s=t.querySelector(".admin-row__actions");return["completed","cancelled","disputed"].includes(e.status)||s.appendChild(Yt("Mark disputed","btn--danger",()=>bi(e.id))),e.status==="disputed"&&(s.appendChild(Yt("Release payment","btn--success",()=>xs(e.id,"release"))),s.appendChild(Yt("Cancel and refund","btn--danger",()=>xs(e.id,"cancel")))),t}function Yt(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function bi(e){if(confirm("Flag this job for admin dispute review?"))try{await c.adminFlagJobDispute(e),l("Job flagged for dispute review.","success"),await ue()}catch(t){l(t.message||"Could not flag job.","error")}}async function xs(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await c.adminResolveJob(e,{resolution:t,reason:s}),l(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await ue()}catch(r){l(r.message||"Could not resolve dispute.","error")}}function gi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function I(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ui,Kt,Qt=v(()=>{w();h();ui=["","open","in_review","assigned","submitted","revision","disputed","completed","cancelled","expired"],Kt=""});var Ls={};_(Ls,{AdminTransactionsPage:()=>aa});function aa(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!b.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${fi.map(t=>`<option value="${t}" ${t===ta?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{ta=t.target.value,await ea()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",ea),await ea()}}}async function ea(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminTransactions({type:ta})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(vi(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${O(t.message||"unknown error")}</p>`}}}function vi(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${O(e.type)}`,t.innerHTML=`
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
            <span><strong>Date:</strong> ${hi(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${O(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${O(e.reference)}</code>`:""}
    `,t}function hi(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function O(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var fi,ta,sa=v(()=>{w();h();fi=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],ta=""});var Es={};_(Es,{AdminReportsPage:()=>ra});function ra(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!b.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Reports</h1>
            <p class="muted">Aggregated transaction volume and marketplace job value by status.</p>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,await yi()}}}async function yi(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await c.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${De("Transactions",Ue(s.transaction_count))}
                ${De("Transaction volume",Oe(s.transaction_volume))}
                ${De("Jobs",Ue(s.job_count))}
                ${De("Job value",Oe(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${wi(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${_i(a.jobs||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${me(t.message||"unknown error")}</p>`}}function De(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${me(e)}</span><strong>${me(t)}</strong></div>`}function wi(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${me(String(t.type||"").replace("_"," "))}</strong><small>${Ue(t.transaction_count)} entries</small></span>
            <strong>${Oe(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function _i(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${me(String(t.status||"").replace("_"," "))}</strong><small>${Ue(t.job_count)} jobs</small></span>
            <strong>${Oe(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function Ue(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Oe(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function me(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ia=v(()=>{w();h()});var Cs={};_(Cs,{LoginPage:()=>na});function na(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${$i(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{let n=await Ba(r.get("email"),r.get("password"));l("Welcome back!","success"),n&&n.is_admin?f("/admin"):f("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function $i(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var oa=v(()=>{h()});var As={};_(As,{RegisterPage:()=>ca});function ca(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",r=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your email</h1>','<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',la(a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",r()}),e.querySelector("#register-otp-form").addEventListener("submit",n);return}let o=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+la(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',o,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+la(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",i)},i=async o=>{o.preventDefault();let d=o.currentTarget,m=new FormData(d),g=d.querySelector('button[type="submit"]');g.disabled=!0,g.textContent="Sending code\u2026",a={name:String(m.get("name")||"").trim(),email:String(m.get("email")||"").trim().toLowerCase(),password:String(m.get("password")||""),password_confirmation:String(m.get("password_confirmation")||""),referral_code:String(m.get("referral_code")||"")};try{await Ia(a),t="otp",l("Verification code sent. It expires in 15 minutes.","success"),r()}catch(y){l(qs(y)||"Could not send the verification code.","error"),g.disabled=!1,g.textContent="Send verification code"}},n=async o=>{o.preventDefault();let d=o.currentTarget,m=d.querySelector('button[type="submit"]');m.disabled=!0,m.textContent="Verifying\u2026";try{await Fa({email:a.email,otp:String(new FormData(d).get("otp")||"").trim()}),l("Account created \u2014 welcome!","success"),f("/")}catch(g){l(qs(g)||"Invalid or expired verification code.","error"),m.disabled=!1,m.textContent="Verify and create account"}};r()}}function qs(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function la(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var da=v(()=>{h()});var Ms={};_(Ms,{default:()=>Je});async function Je(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
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
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let r=t.email.value.trim();if(!r){l("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await c.forgotPassword({email:r}),l("If an account exists with this email, you will receive a reset code.","success"),f(`/reset-password?email=${encodeURIComponent(r)}`)}catch(i){l(i.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var pa=v(()=>{w();h()});var Ps={};_(Ps,{default:()=>We});async function We(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${Si(a)}" placeholder="you@example.com" required autocomplete="email">
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
    `;let s=document.getElementById("reset-form"),r=document.getElementById("submit-btn");s.addEventListener("submit",async i=>{i.preventDefault();let n=s.email.value.trim(),o=s.otp.value.trim(),d=s.password.value,m=s.password_confirmation.value;if(!n||!o||!d){l("Please fill in all fields.","error");return}if(o.length!==6){l("Please enter a valid 6-digit code.","error");return}if(d!==m){l("Passwords do not match.","error");return}if(d.length<6){l("Password must be at least 6 characters.","error");return}r.disabled=!0,r.textContent="Resetting...";try{await c.resetPassword({email:n,otp:o,password:d,password_confirmation:m}),l("Password reset successfully! You can now log in.","success"),f("/login")}catch(g){l(g.message||"Failed to reset password.","error"),r.disabled=!1,r.textContent="Reset Password"}})}function Si(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ua=v(()=>{w();h()});var sr={};_(sr,{JobDetailPage:()=>Ln});function Ln(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=b.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await c.job(e),{job:r,bids:i,bid_count:n,my_bid:o}=s.data;En(r,i,n,o,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${V(s.message||"unknown")}</p>`}}}function En(e,t,a,s,r){let i=document.getElementById("job-detail-content");if(!i)return;let n=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,o=n?Math.max(0,Math.floor((n-Date.now())/1e3)):null,d=o!=null?An(o):"\u2014",m=["open","in_review"].includes(e.status),g=!!s;i.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${V(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${V(e.title)}</h1>
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
                <p>${V(e.description).replace(/\n/g,"<br>")}</p>
                ${e.requirements?`<h3>Requirements</h3><p>${V(e.requirements).replace(/\n/g,"<br>")}</p>`:""}
                <h3>Posted by</h3>
                <p>${e.poster?V(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${Cn(e,t,s,r,m)}
    `,qn(e,s,r)}function Cn(e,t,a,s,r){return a?`
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${a.status}">
                    <div>
                        <strong>\u09F3${parseFloat(a.amount).toFixed(2)}</strong> in <strong>${a.delivery_days} day${a.delivery_days===1?"":"s"}</strong>
                        <div class="muted">${V(a.proposal)}</div>
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
                                <div class="muted">${V(i.proposal).slice(0,100)}${i.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${i.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function qn(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await c.withdrawBid(t.id),l("Bid withdrawn.","success"),f(`/jobs/${e.id}`)}catch(i){l(i.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(s),n=document.getElementById("bid-submit-btn");n.disabled=!0,n.textContent="Submitting\u2026";try{await c.placeBid(e.id,{amount:parseFloat(i.get("amount")),delivery_days:parseInt(i.get("delivery_days"),10),proposal:String(i.get("proposal")||"").trim()}),l("Bid placed!","success"),f(`/jobs/${e.id}`)}catch(o){l(o.message||"Failed to place bid.","error")}finally{n.disabled=!1,n.textContent="Submit Bid"}})}function An(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function V(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var rr=v(()=>{w();h()});var or={};_(or,{PosterJobDetailPage:()=>Mn});function Mn(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!Rn()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await ir(e)}}}async function ir(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await c.posterJobBids(e)).data||{};Pn(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${T(a.message||"unknown error")}</p>`}}function Pn(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${T(t.title)}</h1><p class="muted">${T(t.description||"")}</p></div><span class="badge badge--status badge--${T(t.status)}">${T(Dn(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${nr(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${jn(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${Nn(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>Hn(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>Bn(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>In(t.id,r.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>Fn(t.id))}function jn(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${T(a.status)}"><div class="poster-bid-row__main"><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">${T(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${T(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${T(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function Nn(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${T(a.status)}"><div><strong>${T(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${nr(a.created_at)} \xB7 ${T(String(a.status||"").replace("_"," "))}</span><p>${T(a.description||"")}</p>${a.external_link?`<a href="${T(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${T(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function Hn(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await c.posterAcceptBid(e,t),l("Worker selected and escrow held.","success"),await wa(e)}catch(a){l(a.message||"Could not select worker.","error")}}async function Bn(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await c.posterReleasePayment(e,{submission_id:Number(t)}),l("Payment released.","success"),await wa(e)}catch(a){l(a.message||"Could not release payment.","error")}}async function In(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await c.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),l("Revision requested.","success"),await wa(e)}catch(s){l(s.message||"Could not request revision.","error")}}async function Fn(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await c.posterCancelJob(e,{reason:"Cancelled by poster"}),l("Job cancelled.","success"),f("/poster/jobs")}catch(t){l(t.message||"Could not cancel job.","error")}}async function wa(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await ir(e))}function Rn(){return!!b.get()}function Dn(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function nr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function T(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var lr=v(()=>{w();h()});N();h();N();h();var Ge=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pt(),Da))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ke(),ut))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ke(),ut))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(mt(),Oa))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(gt(),Wa))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(vt(),Ga))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(yt(),Xa))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ee(),_t))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>($t(),Ya))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(St(),Ka))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(kt(),Za))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Et(),ns))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(qt(),ls))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ee(),_t))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(At(),cs))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(jt(),us))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(It(),gs))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Rt(),vs))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ot(),hs))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Gt(),_s))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Xt(),ks))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Qt(),Ts))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(sa(),Ls))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(ia(),Es))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(oa(),Cs))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(da(),As))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(pa(),Ms))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ua(),Ps))}],Gl=k(()=>{let e=x.get().split("?")[0]||"/";return Ge.find(t=>t.path===e)||Ge[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";x.set(e)});N();h();N();var ki=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],xi=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],Ti=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Li(){let e=b.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...xi];let t=[...ki];return e&&e.role==="poster"&&t.push({separator:!0},...Ti),t}var js="sidebar_collapsed",te=P(localStorage.getItem(js)==="true");function Ei(){let e=!te.get();te.set(e),localStorage.setItem(js,String(e))}function Ns(){let e=()=>x.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${te.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar"},children:[Ci(),qi(),Ai()]}}function Ci(){let e=()=>x.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]}]}}function qi(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>Ei(),title:()=>te.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${te.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function Ai(){return{tag:"nav",props:{class:"sidebar__nav"},children:Li().map(e=>e.header?Mi(e.header):e.separator?Pi():ji(e))}}function Mi(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function Pi(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function ji({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${x.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>te.get()?t:"",onclick:r=>{r.preventDefault(),f(e),Bs()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function Hs(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Bs()},children:[]}}function Bs(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}h();N();h();var Ni=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/tasks",label:"Tasks",icon:"bi-list-check"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/jobs/available",label:"Browse Jobs",icon:"bi-briefcase"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/worker/bids",label:"My Bids",icon:"bi-clipboard-check"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/achievements",label:"Achievements",icon:"bi-trophy"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Hi=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],Bi=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Ii(){let e=b.get();if(e&&e.is_admin)return Hi;let t=[...Ni];return e&&e.role==="poster"&&t.push({separator:!0},...Bi),t}function Fi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${x.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),f(e),ma()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function Ri(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>ma()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function Di(){return{tag:"nav",props:{class:"mobile-nav__list"},children:Ii().map(e=>e.separator?Ui():Fi(e))}}function Ui(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Is(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[Ri(),Di()]}}function Fs(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>ma()},children:[]}}function Rs(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function ma(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}Lt();w();function Ds(){return B(()=>E.get(),()=>Xi(),()=>Vi())}function Us(){let e=()=>{let t=H.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>es(),"data-theme":()=>H.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function Oi(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function Ji(){return setTimeout(Wi,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),Oi()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[zi("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function Wi(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await c.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],r=Number(a.meta?.unread_count||s.filter(i=>!i.read).length||0);t.textContent=r>99?"99+":String(r),e.innerHTML=s.length?s.map(Gi).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(i=>{i.addEventListener("click",async()=>{let n=i.getAttribute("data-notification-id");if(!(!n||i.getAttribute("data-read")==="1"))try{await c.notificationRead(n),i.setAttribute("data-read","1"),i.classList.remove("topbar-notification--unread");let o=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(o)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function Gi(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${ze(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${ze(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${ze(t.title||"Notification")}</div><div class="topbar-notification__text">${ze(t.message||"")}</div>${r?`<a class="topbar-notification__action"${r}>Open</a>`:""}</div></li>`}function ze(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function zi(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function Vi(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Us(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function Xi(){let e=b.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>Rs(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Us(),Ji(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await _e(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}h();N();function Os(){return B(()=>!!ne.get(),()=>{let e=ne.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}w();function Js(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{c.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let r=[];a.facebook&&r.push(`<a href="${Ve(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&r.push(`<a href="${Ve(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&r.push(`<a href="${Ve(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&r.push(`<a href="${Ve(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=r.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function Ve(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}h();var Yi=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/profile",label:"Account",icon:"bi-person-circle"}],Ki=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}];function Zi(){let e=b.get();return e&&e.is_admin?Ki:Yi}function Qi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${x.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),f(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function en(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function tn(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:Zi().map(e=>e.separator?en():Qi(e))}}function ba(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&ba()},!0),window.addEventListener("resize",()=>setTimeout(ba,50)),document.addEventListener("hnav:rendered",()=>setTimeout(ba,0)));function Ws(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[tn()]}}function Gs(){let e=()=>!!b.get()?.is_admin,t=()=>x.get().startsWith("/admin"),a=()=>E.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[B(()=>E.get(),()=>Ns(),()=>null),B(()=>E.get(),()=>Hs(),()=>null),B(()=>E.get(),()=>Is(),()=>null),B(()=>E.get(),()=>Fs(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[Ds(),B(()=>E.get()&&!e(),()=>Ws(),()=>null),{tag:"main",props:{class:"app-main"},children:[an()]},Js()]},Os()]}}function an(){let t=x.get().split("?")[0]||"/",a=Ge.find(r=>r.path===t),s=b.get();return s&&s.is_admin&&!t.startsWith("/admin")?(f("/admin"),ga()):a?a.requireAuth&&!E.get()?(f("/login"),ga()):a.requireAdmin&&(!b.get()||!b.get().is_admin)?nn():!a.requireAuth&&E.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(f("/"),ga()):sn(a):rn()}function sn(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function rn(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function nn(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function ga(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}N();h();pt();oa();da();pa();ua();gt();ke();mt();At();vt();Ee();Gt();Xt();yt();$t();St();kt();Et();w();h();var u={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function Vs(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
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
                            ${zs()}
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
        `,u.categories.length===0)try{let t=await c.categories();u.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=zs())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{on(),u.page=1,Xe()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{u.search="",u.categoryId="",u.minBudget="",u.maxBudget="",u.sort="latest",u.page=1,ln(),Xe()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await Xe()}}}function zs(){return'<option value="">All categories</option>'+u.categories.map(e=>`<option value="${F(e.id)}" ${String(e.id)===String(u.categoryId)?"selected":""}>${F(e.name)}</option>`).join("")}function on(){u.search=document.getElementById("jobs-search")?.value.trim()||"",u.categoryId=document.getElementById("jobs-category")?.value||"",u.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",u.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",u.sort=document.getElementById("jobs-sort")?.value||"latest"}function ln(){let e={"jobs-search":u.search,"jobs-category":u.categoryId,"jobs-min-budget":u.minBudget,"jobs-max-budget":u.maxBudget,"jobs-sort":u.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function Xe(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++u.requestSerial;u.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:u.page,per_page:u.perPage,sort:u.sort};u.search&&(a.search=u.search),u.categoryId&&(a.category_id=u.categoryId),u.minBudget!==""&&(a.min_budget=u.minBudget),u.maxBudget!==""&&(a.max_budget=u.maxBudget);let s=await c.jobs(a);if(t!==u.requestSerial)return;u.jobs=Array.isArray(s.data)?s.data:[],u.total=Number(s.meta?.total||0),u.lastPage=Math.max(1,Number(s.meta?.last_page||1)),cn()}catch(a){if(t!==u.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${F(a.message||"unknown error")}</p>`,Xs(),Ys()}finally{t===u.requestSerial&&(u.loading=!1)}}function cn(){let e=document.getElementById("jobs-grid");if(e){if(Xs(),Ys(),u.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=u.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${F(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${dn(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${F(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${F(t.title)}</h3>
            <p class="job-card__desc">${F(pn(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.budget||0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.bid_count||0)} bid${Number(t.bid_count)===1?"":"s"}</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function Xs(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(u.total===0){e.textContent="No open jobs found";return}let t=(u.page-1)*u.perPage+1,a=Math.min(u.page*u.perPage,u.total);e.textContent=`Showing ${t}-${a} of ${u.total} open jobs`}function Ys(){let e=document.getElementById("jobs-pagination");if(e){if(u.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page-1}" ${u.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${u.page} of ${u.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${u.page+1}" ${u.page>=u.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>u.lastPage||a===u.page||(u.page=a,Xe())})})}}function dn(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function pn(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function F(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var fa={bids:[],loading:!1};function Ks(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await c.workerBids();fa.bids=t.data||[],un()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${Zs(t.message||"unknown")}</p>`}}}}function un(){let e=document.getElementById("bids-list");if(e){if(fa.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=fa.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${Zs(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${mn(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function mn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Zs(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var be={jobs:[],submissions:[],loading:!1};function va(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([c.workerActiveJobs(),c.workerSubmissions()]);be.jobs=t.data||[],be.submissions=a.data||[],bn()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${ha(t.message||"unknown")}</p>`}}}}function bn(){let e=document.getElementById("active-jobs-list");if(e){if(be.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=be.jobs.map(t=>{let a=be.submissions.find(r=>r.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${ha(t.title)}</h3>
                        <div class="muted">Budget: \u09F3${parseFloat(t.budget).toFixed(2)}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?gn(t,a):fn(t)}
            </div>
        `}).join(""),vn()}}function gn(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${hn(t.created_at)}
            <div class="muted">${ha((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function fn(e){return`
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
    `}function vn(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),r=e.querySelector("[data-submit-btn]");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await c.submitWork(a,{description:String(s.get("description")||"").trim(),external_link:String(s.get("external_link")||"").trim()||null}),l("Work submitted!","success"),va()()}catch(i){l(i.message||"Failed to submit.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Work'}})})}function hn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function ha(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var Ye={categories:[],loading:!1};function Qs(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=b.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `,wn(),await Ke()}}async function Ke(){let e=document.getElementById("cat-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminCategories();Ye.categories=t.data||[],yn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${ge(t.message||"unknown")}</p>`}}}function yn(){let e=document.getElementById("cat-list");if(e){if(Ye.categories.length===0){e.innerHTML='<p class="muted">No categories yet. Add one below.</p>';return}e.innerHTML=Ye.categories.map(t=>`
        <div class="cat-row" data-id="${t.id}">
            <div class="cat-row__icon"><i class="bi ${ge(t.icon_class||"bi-tag")}"></i></div>
            <div class="cat-row__main">
                <div class="cat-row__name">${ge(t.name)} ${t.is_active?"":'<span class="badge">INACTIVE</span>'}</div>
                <div class="cat-row__slug muted">/${ge(t.slug)}</div>
                <div class="cat-row__desc muted">${ge(t.description||"")}</div>
            </div>
            <div class="cat-row__actions">
                <button class="btn btn--ghost btn--sm" data-toggle="${t.id}">${t.is_active?"Disable":"Enable"}</button>
                <button class="btn btn--danger btn--sm" data-delete="${t.id}">Delete</button>
            </div>
        </div>
    `).join(""),e.querySelectorAll("[data-toggle]").forEach(t=>t.addEventListener("click",()=>_n(t.getAttribute("data-toggle")))),e.querySelectorAll("[data-delete]").forEach(t=>t.addEventListener("click",()=>$n(t.getAttribute("data-delete"))))}}function wn(){let e=document.getElementById("cat-form");e&&e.addEventListener("submit",async t=>{t.preventDefault();let a=new FormData(e),s={name:String(a.get("name")||"").trim(),slug:String(a.get("slug")||"").trim().toLowerCase(),description:String(a.get("description")||"").trim()||null,icon_class:String(a.get("icon_class")||"").trim()||null,display_order:parseInt(a.get("display_order")||"0",10),is_active:a.get("is_active")==="on"},r=document.getElementById("cat-save-btn");r.disabled=!0,r.textContent="Creating\u2026";try{await c.adminCreateCategory(s),l("Category created.","success"),e.reset(),await Ke()}catch(i){l(i.message||"Failed.","error")}finally{r.disabled=!1,r.textContent="Create Category"}})}async function _n(e){let t=Ye.categories.find(a=>String(a.id)===String(e));if(t)try{await c.adminUpdateCategory(e,{is_active:!t.is_active}),l(t.is_active?"Category disabled.":"Category enabled.","success"),await Ke()}catch(a){l(a.message||"Failed.","error")}}async function $n(e){if(confirm("Delete this category? It will be deactivated if jobs are attached."))try{let t=await c.adminDeleteCategory(e);l(t.message||"Done.","success"),await Ke()}catch(t){l(t.message||"Failed.","error")}}function ge(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}w();h();var J={grouped:{},social:{},noticesData:{interval:4,notices:[]},loading:!1};function er(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=b.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await tr()}}async function tr(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a,s]=await Promise.all([c.adminSettings(),c.socialLinks(),c.notices()]);J.grouped=t.data||{},J.social=a||{},J.noticesData=s||{interval:4,notices:[]},Sn()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${A(t.message||"unknown")}</p>`}}}function Sn(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(J.grouped).map(n=>`
        <div class="card settings-group">
            <h3 class="card__title">${A(n.charAt(0).toUpperCase()+n.slice(1))}</h3>
            <div class="settings-group__rows">
                ${J.grouped[n].map(o=>xn(n,o)).join("")}
            </div>
        </div>
    `).join(""),s=J.noticesData,r=[];Array.isArray(s.notices)&&s.notices.length&&(r=s.notices.map(n=>typeof n=="string"?n.startsWith("/")||n.startsWith("http")?{image:n,text:""}:{image:"",text:n}:{image:n.image||"",text:n.text||""})),r.length||(r=[{image:"",text:""}]),a+=`
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
                        ${r.map((n,o)=>ar(o+1,n)).join("")}
                    </div>
                    <div style="margin-top: 12px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Banner Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;let i=J.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${A(i.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${A(i.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${A(i.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${A(i.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",Tn),document.getElementById("add-notice-btn").addEventListener("click",kn),ya()}function ar(e,t={image:"",text:""}){let a=typeof t=="string"?t.startsWith("/")||t.startsWith("http")?t:"":t?.image||"",s=typeof t=="string"?!t.startsWith("/")&&!t.startsWith("http")?t:"":t?.text||"",r="";return a?r=`<div class="banner-preview"><img src="${A(a)}" alt="Banner preview"></div>`:s?r=`<div class="banner-preview banner-preview--text"><strong>Text Notice:</strong> <span>${A(s)}</span></div>`:r='<div class="banner-preview banner-preview--empty"><i class="bi bi-image muted"></i> No image uploaded</div>',`
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
                    <input type="hidden" class="notice-msg-image" value="${A(a)}">
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
    `}function kn(){let e=document.getElementById("notice-messages-container");if(!e)return;let t=e.querySelectorAll(".banner-message-row").length+1,a=document.createElement("div");a.innerHTML=ar(t,{image:""});let s=a.firstElementChild;e.appendChild(s),ya()}function ya(){let e=document.getElementById("notice-messages-container");if(!e)return;e.querySelectorAll(".banner-message-row").forEach((a,s)=>{let r=a.querySelector(".banner-message-num");r&&(r.textContent=`Banner ${s+1}`);let i=a.querySelector(".banner-file-input"),n=a.querySelector(".notice-msg-image"),o=a.querySelector(".banner-preview"),d=a.querySelector(".banner-upload-status"),m=a.querySelector(".banner-upload-btn");i&&!i.dataset.wired&&(i.dataset.wired="true",i.addEventListener("change",async y=>{let L=y.target.files[0];if(L){d&&(d.textContent="Uploading\u2026");try{let $=new FormData;$.append("image",L);let M=await c.adminUploadBannerImage($);M&&M.url&&(n.value=M.url,o.className="banner-preview",o.innerHTML=`<img src="${A(M.url)}" alt="Banner preview">`,d&&(d.textContent="Uploaded!"))}catch($){d&&(d.textContent=$.message||"Upload failed."),l($.message||"Failed to upload image.","error")}}}));let g=a.querySelector(".remove-notice-btn");g&&(g.onclick=()=>{a.remove(),ya()})})}function xn(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${A(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${A(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${A(t.key)}</strong>
                <span class="muted">${A(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function Tn(){let e={};for(let n of Object.keys(J.grouped))for(let o of J.grouped[n]){let d=`set-${o.key.replace(/[^a-z0-9]/gi,"_")}`,m=document.getElementById(d);if(!m)continue;let g;o.value_type==="boolean"?g=m.checked:o.value_type==="integer"||o.value_type==="percent"?g=parseInt(m.value,10):o.value_type==="decimal"?g=parseFloat(m.value):o.value_type==="json"?g=m.value?JSON.parse(m.value):null:g=m.value,e[o.key]=g}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},s=Array.from(document.querySelectorAll(".banner-message-row")).map(n=>({image:n.querySelector(".notice-msg-image")?.value.trim()||""})).filter(n=>n.image!==""),r={interval:document.getElementById("notice-interval")?.value||4,direction:document.getElementById("notice-direction")?.value||"right_to_left",notices:s},i=document.getElementById("settings-save-btn");i.disabled=!0,i.textContent="Saving\u2026";try{await Promise.all([c.adminUpdateSettings(e),c.adminUpdateSocialLinks(t),c.adminUpdateNotices(r)]),l("Settings, notices, and social links saved successfully.","success"),await tr()}catch(n){l(n.message||"Failed to save.","error")}finally{i.disabled=!1,i.textContent="Save All Changes"}}function A(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Qt();sa();ia();jt();It();Rt();Ot();qt();var cr={"/":Se,"/refer":bt,"/webtask":oe,"/tasks":oe,"/earn":xe,"/tg-tasks":Ne,"/withdraw":Te,"/profile":Le,"/wallet":Le,"/admin":Wt,"/admin/payments":Vt,"/admin/categories":Qs,"/admin/settings":er,"/admin/jobs":Zt,"/admin/transactions":aa,"/admin/reports":ra,"/deposit":ht,"/leaderboard":Ce,"/achievements":qe,"/support":Ae,"/settings":Pe,"/jobs/available":Vs,"/worker/bids":Ks,"/worker/active-jobs":va,"/poster":Pt,"/poster/post-job":Ht,"/poster/jobs":Ft,"/poster/wallet":Ut,"/notifications":Ct,"/login":na,"/register":ca,"/forgot-password":Je,"/reset-password":We};function dr(){Ze(),setTimeout(Ze,50),window.addEventListener("hashchange",Ze),k(()=>{E.get(),setTimeout(Ze,0)})}async function Ze(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!cr[t]){let n=t.match(/^\/jobs\/(\d+)$/);if(n){let d=await Promise.resolve().then(()=>(rr(),sr));await _a(()=>d.JobDetailPage(n[1]),t);return}let o=t.match(/^\/poster\/jobs\/(\d+)$/);if(o){if(!E.get()){f("/login");return}let d=await Promise.resolve().then(()=>(lr(),or));await _a(()=>d.PosterJobDetailPage(o[1]),t);return}t="/"}let a=E.get(),s=b.get(),r=["/login","/register","/forgot-password","/reset-password"];if(r.includes(t)&&a){s&&s.is_admin?f("/admin"):f("/");return}if(!r.includes(t)&&!a){f("/login");return}if(t==="/"&&s&&s.is_admin){f("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){Un();return}let i=cr[t];await _a(i,t)}async function _a(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function Un(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}h();var pr=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();pr.innerHTML="";R(Gs(),pr);D.get()&&q();dr();
