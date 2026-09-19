var Ln=Object.defineProperty;var y=(e,t)=>()=>(e&&(t=e(e=0)),t);var S=(e,t)=>{for(var a in t)Ln(e,a,{get:t[a],enumerable:!0})};function Cn(e,t){ja?ja(e,t):console.error("[Ghost] Unhandled effect error:",e)}function R(e){let t=e,a=new Set;return{get(){return F&&(a.add(F),F.dependencies.add(a)),t},set(s){t!==s&&(t=s,Ha(a))}}}function Ha(e){bt(()=>{e.forEach(t=>{t.notify?t.notify():Me.add(t)})})}function bt(e){ut++;try{e()}finally{if(ut--,ut===0){let t=Array.from(Me);Me.clear(),t.forEach(a=>a.run())}}}function E(e){let t={dependencies:new Set,run(){mt(t),Pe.push(F),F=t;try{e()}catch(a){Cn(a,e)}finally{F=Pe.pop()}},notify(){Me.add(t)}};return t.run(),()=>mt(t)}function gt(e){let t,a=!0,s=new Set,n={dependencies:new Set,notify(){a||(a=!0,Ha(s))}};return{get(){if(F&&(s.add(F),F.dependencies.add(s)),a){mt(n),Pe.push(F),F=n;try{t=e()}finally{F=Pe.pop()}a=!1}return t}}}function mt(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var F,Pe,Me,ut,ja,ne=y(()=>{F=null,Pe=[],Me=new Set,ut=0,ja=null});function ve(){vt.totalUpdates++,vt.recentUpdates++}var je,vt,ft=y(()=>{je=new Set,vt={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function X(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){En(e,t);return}if(e.__ghostWhen){An(e,t);return}if(e.__ghostLazy){qn(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;je.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,n])=>{if(s==="ghostStyle"&&n?.mount){n.mount(a);return}let r=s.startsWith("on");typeof n=="function"&&!r?e.effects.push(E(()=>{a.setAttribute(s,n()),ve(),e.events.update?.forEach(i=>i())})):r?a[s.toLowerCase()]=n:a.setAttribute(s,n)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)X(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let n=null;e.effects.push(E(()=>{let r=s(),i=document.createTextNode(String(r??""));n?a.replaceChild(i,n):a.appendChild(i),n=i,ve(),e.events.update?.forEach(o=>o())}))}else X(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function fe(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),je.delete(e)}}function En(e,t){let{getItems:a,keyFn:s,renderFn:n}=e,r=document.createComment("[ghost-list]"),i=document.createComment("[/ghost-list]");t.appendChild(r),t.appendChild(i);let o=new Map;function d(u){return u.el||null}let p=E(()=>{let u=a(),b=u.map((w,C)=>String(s(w,C))),$=Array.from(o.keys());for(let w of $)if(!b.includes(w)){let C=o.get(w);fe(C.ghostNode),o.delete(w)}for(let w=0;w<u.length;w++){let C=b[w];if(!o.has(C)){let ie=n(u[w],w),G=document.createElement("ghost-list-slot");for(X(ie,G);G.firstChild;)t.insertBefore(G.firstChild,i);o.set(C,{ghostNode:ie})}}for(let w=b.length-1;w>=0;w--){let C=b[w],ie=o.get(C);if(!ie)continue;let G=d(ie.ghostNode);if(!G)continue;let qe=b[w+1],Ne=(qe?d(o.get(qe)?.ghostNode):null)||i;G.nextSibling!==Ne&&t.insertBefore(G,Ne)}ve()});e._listCleanup=()=>{p();for(let u of o.values())fe(u.ghostNode);o.clear(),r.remove(),i.remove()}}function O(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function An(e,t){let{conditionGetter:a,trueFn:s,falseFn:n}=e,r=document.createComment("[ghost-when]");t.appendChild(r);let i=null,o=E(()=>{let p=a()?s:n;if(i&&(fe(i),i=null),p&&(i=p(),i)){let u=document.createElement("ghost-when-slot");for(X(i,u);u.firstChild;)t.insertBefore(u.firstChild,r)}ve()});e._whenCleanup=()=>{o(),i&&fe(i),r.remove()}}function qn(e,t){let{importFn:a,fallback:s}=e,n=document.createComment("[ghost-lazy]");t.appendChild(n);let r=null;if(s){let i=document.createElement("ghost-lazy-slot");for(X(s,i);i.firstChild;)t.insertBefore(i.firstChild,n);r=s}a().then(i=>{let o=i.default||i;r&&(fe(r),r=null);let d=typeof o=="function"?o():o,p=document.createElement("ghost-lazy-slot");for(X(d,p);p.firstChild;)t.insertBefore(p.firstChild,n);r=d}).catch(i=>{console.error("[Ghost] lazyNode failed to load:",i)})}var ht=y(()=>{ne();ft()});var Ra=y(()=>{ne()});var He=y(()=>{});var Fa=y(()=>{ft()});var Ba=y(()=>{ne()});var Da=y(()=>{ht();ne();He();He()});function Pn(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(n){let r={};if(n.nodeType===3)return n.nodeValue.trim();if(n.attributes?.length){r["@attributes"]={};for(let i of n.attributes)r["@attributes"][i.nodeName]=i.nodeValue}for(let i of n.childNodes){let o=i.nodeName,d=s(i);d!==""&&(r[o]===void 0?r[o]=d:(Array.isArray(r[o])||(r[o]=[r[o]]),r[o].push(d)))}return r}return s(a.documentElement)}function Mn(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function wt(e,t={}){let{cache:a=!1,...s}=t,n=(s.method||"GET").toUpperCase(),r={url:e,...s};for(let b of wt.interceptors.request)r=b(r)??r;let i=r.url;delete r.url;let o=Mn(i,n);if(a==="memory"&&n==="GET"&&yt.has(o))return yt.get(o);let d=await fetch(i,r),p=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let u;p.includes("application/xml")||p.includes("text/xml")?u=Pn(await d.text()):p.includes("application/json")?u=await d.json():u=await d.text();for(let b of wt.interceptors.response)u=b(d,u)??u;return a==="memory"&&n==="GET"&&yt.set(o,u),u}var yt,Ia=y(()=>{yt=new Map;wt.interceptors={request:[],response:[]}});function _t(e,t){let a;try{let n=localStorage.getItem(e);a=n?JSON.parse(n):t}catch{a=t}let s=R(a);return E(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(n){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,n)}}),s}var Ua=y(()=>{ne()});function jn(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var Bo,Oa=y(()=>{Bo=jn()});var Uo,Hn,Ja=y(()=>{ne();Uo=R("en"),Hn=new Map;Hn.set("en",{})});var D=y(()=>{ne();ht();Ra();He();Fa();Ba();Da();Ia();Ua();Oa();Ja()});function Wa(e){le=e}function kt(){return le}function Va(e){$t=e}async function m(e,{method:t="GET",body:a,headers:s={},signal:n}={}){let r=e.startsWith("http")?e:St.apiBase+e,i=typeof FormData<"u"&&a instanceof FormData,o={method:t,headers:{Accept:"application/json",...i?{}:{"Content-Type":"application/json"},...s}};le&&(o.headers.Authorization=`Bearer ${le}`),a!==void 0&&(o.body=i?a:JSON.stringify(a)),n&&(o.signal=n);let d=await fetch(r,o);if(d.status===401)throw $t&&$t(),new ce("Unauthorized",401,null);let p=null,u=d.headers.get("content-type")||"";try{if(u.includes("application/json"))p=await d.json();else{let b=await d.text();p=b?{message:b}:null}}catch{}if(!d.ok){let b=p&&p.message||`HTTP ${d.status}`;throw new ce(b,d.status,p)}return p}async function Rn(e){let t=e.startsWith("http")?e:St.apiBase+e,a={Accept:"text/csv"};le&&(a.Authorization=`Bearer ${le}`);let s=await fetch(t,{headers:a});if(!s.ok){let n=`HTTP ${s.status}`;try{n=(await s.json())?.message||n}catch{}throw new ce(n,s.status,null)}return s.blob()}var St,le,$t,ce,c,_=y(()=>{St=window.JMJOB_CONFIG||{apiBase:"/api"},le=null,$t=null;ce=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},c={health:()=>m("/health"),register:e=>m("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>m("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>m("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>m("/auth/login",{method:"POST",body:e}),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>m("/auth/reset-password",{method:"POST",body:e}),logout:()=>m("/auth/logout",{method:"POST"}),me:()=>m("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/notifications${t?"?"+t:""}`)},notificationRead:e=>m(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>m("/notifications/read-all",{method:"POST"}),meUser:()=>m("/user"),reward:e=>m("/user/reward",{method:"POST",body:e}),withdraw:e=>m("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>m("/user/withdrawals"),referrals:()=>m("/user/referrals"),adHistory:()=>m("/user/ads"),adsConfig:()=>m("/ads/config"),adsNext:()=>m("/ads/next"),videoAds:()=>m("/ads/videos"),videoAdStart:e=>m("/ads/videos/start",{method:"POST",body:e}),videoAdClaim:e=>m("/ads/videos/claim",{method:"POST",body:e}),webTasks:()=>m("/tasks/web"),webTaskStart:e=>m("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>m("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>m("/tasks/telegram"),tgTaskVerify:e=>m("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>m("/admin/stats"),adminWithdrawals:(e="pending")=>m(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>m(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>m(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>m(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>m("/admin/users"),adminUpdateUserRole:(e,t)=>m(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminBanUser:(e,t={})=>m(`/admin/users/${e}/ban`,{method:"POST",body:t}),adminUnbanUser:(e,t={})=>m(`/admin/users/${e}/unban`,{method:"POST",body:t}),adminBanHistory:e=>m(`/admin/users/${e}/ban-history`),adminProviders:()=>m("/admin/ad-providers"),adminUpdateProvider:(e,t)=>m(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminVideoAds:()=>m("/admin/video-ads"),adminCreateVideoAd:e=>m("/admin/video-ads",{method:"POST",body:e}),adminUpdateVideoAd:(e,t)=>m(`/admin/video-ads/${e}`,{method:"POST",body:t}),adminDeleteVideoAd:e=>m(`/admin/video-ads/${e}`,{method:"DELETE"}),adminResetDailyCounters:()=>m("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>m("/payment/gateways"),paymentSubmit:e=>m("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>m("/payment/submissions"),adminPayments:(e="")=>m(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>m(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>m(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>m("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/jobs${t?"?"+t:""}`)},job:e=>m(`/jobs/${e}`),placeBid:(e,t)=>m(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>m(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>m("/worker/bids"),workerActiveJobs:()=>m("/worker/active-jobs"),submitWork:(e,t)=>m(`/jobs/${e}/submit`,{method:"POST",body:t}),workerCancelAssignment:(e,t={})=>m(`/worker/assignments/${e}/cancel`,{method:"POST",body:t}),workerSubmissions:()=>m("/worker/submissions"),posterStats:()=>m("/poster/stats"),posterCreateJob:e=>m("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>m("/poster/jobs"),posterJobBids:e=>m(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>m(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>m(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>m(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>m(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>m("/admin/categories"),adminCreateCategory:e=>m("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>m(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>m(`/admin/categories/${e}/delete`,{method:"POST"}),adminSubcategories:()=>m("/admin/subcategories"),adminCreateSubcategory:e=>m("/admin/subcategories",{method:"POST",body:e}),adminUpdateSubcategory:(e,t)=>m(`/admin/subcategories/${e}`,{method:"POST",body:t}),adminDeleteSubcategory:e=>m(`/admin/subcategories/${e}/delete`,{method:"POST"}),adminSettings:()=>m("/admin/settings"),adminUpdateSettings:e=>m("/admin/settings",{method:"POST",body:e}),socialLinks:()=>m("/social-links"),adminUpdateSocialLinks:e=>m("/admin/social-links",{method:"POST",body:e}),notices:()=>m("/notices"),adminUpdateNotices:e=>m("/admin/notices",{method:"POST",body:e}),adminUploadBannerImage:async e=>{let t=St.apiBase+"/admin/notices/upload",a={},s=kt();s&&(a.Authorization=`Bearer ${s}`);let n=await fetch(t,{method:"POST",headers:a,body:e}),r=await n.json();if(!n.ok)throw new ce(r.message||"Upload failed",n.status,r);return r},adminJobs:(e="")=>m(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminCreateJob:e=>m("/admin/jobs",{method:"POST",body:e}),adminJobDetail:e=>m(`/admin/jobs/${e}/detail`),adminUpdateJob:(e,t)=>m(`/admin/jobs/${e}/edit`,{method:"POST",body:t}),adminDeleteJob:e=>m(`/admin/jobs/${e}`,{method:"DELETE"}),adminJobSubmissions:e=>m(`/admin/jobs/${e}/submissions`),adminFraudSubmissions:()=>m("/admin/fraud/submissions"),adminReviewFraud:(e,t={})=>m(`/admin/fraud/submissions/${e}/review`,{method:"POST",body:t}),adminReviewSubmission:(e,t={})=>m(`/admin/submissions/${e}/review`,{method:"POST",body:t}),adminCancelAssignment:(e,t={})=>m(`/admin/assignments/${e}/cancel`,{method:"POST",body:t}),adminReassignAssignment:(e,t={})=>m(`/admin/assignments/${e}/reassign`,{method:"POST",body:t}),adminApproveJob:(e,t={})=>m(`/admin/jobs/${e}/approve`,{method:"POST",body:t}),adminDeclineJob:(e,t={})=>m(`/admin/jobs/${e}/decline`,{method:"POST",body:t}),adminFlagJobDispute:e=>m(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>m(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>m("/admin/reports"),adminReportsExport:()=>Rn("/admin/reports?format=csv"),adminRevenue:()=>m("/admin/revenue")}});function l(e,t="info",a=3500){he.set({message:e,type:t,id:Date.now()}),xt&&clearTimeout(xt),xt=setTimeout(()=>he.set(null),a)}async function M(){if(!Y.get())return null;try{let e=await c.me();return g.set(e.data),e.data}catch{return null}}async function za(e,t){let a=await c.login({email:e,password:t});return Y.set(a.data.token),g.set(a.data.user),a.data.user}async function Ga(e){return c.requestRegistrationOtp(e)}async function Xa(e){let t=await c.verifyRegistrationOtp(e);return Y.set(t.data.token),g.set(t.data.user),t.data.user}async function Re(){try{await c.logout()}catch{}Y.set(null),g.set(null),q.set("/login")}function f(e){window.location.hash=e}var Fn,Bn,Y,g,he,xt,q,P,h=y(()=>{D();D();_();Fn="earnap_token",Bn="earnap_user",Y=_t(Fn,null),g=_t(Bn,null),he=R(null),xt=null;q=R(window.location.hash.replace(/^#/,"")||"/"),P=gt(()=>!!Y.get()&&!!g.get());E(()=>{let e=Y.get();Wa(e)});Va(()=>{Y.set(null),g.set(null),q.set("/login"),l("Session expired. Please log in.","error")})});var Ka={};S(Ka,{HomePage:()=>Tt});function Tt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=g.get();Dn(e),e.appendChild(In(t)),e.appendChild(Un())}}function ye(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}async function Dn(e){Fe&&(clearInterval(Fe),Fe=null);try{let t=await c.notices(),s=(Array.isArray(t.notices)&&t.notices.length?t.notices:[]).map(b=>{if(typeof b=="string"){let $=b.trim();return $.startsWith("/")||$.startsWith("http")?{image:$,text:""}:{image:"",text:$}}return{image:b.image||"",text:b.text||""}}).filter(b=>b.image&&b.image.trim()||b.text&&b.text.trim());s.length||s.push({text:"Complete tasks, watch ads, refer friends, and withdraw anytime.",image:""});let n=ye("div","welcome-popup welcome-popup--banner","");n.innerHTML=`
            <div id="notice-banner-content" class="welcome-popup__content"></div>
        `,e.firstChild?e.insertBefore(n,e.firstChild):e.appendChild(n);let r=n.querySelector("#notice-banner-content"),i=typeof t.interval=="number"&&t.interval>0?t.interval:4,o=t.direction||"right_to_left",d={right_to_left:{exit:"banner-vanish-left",enter:"banner-enter-right"},left_to_right:{exit:"banner-vanish-right",enter:"banner-enter-left"},top_to_bottom:{exit:"banner-vanish-bottom",enter:"banner-enter-top"},bottom_to_top:{exit:"banner-vanish-top",enter:"banner-enter-bottom"},fade:{exit:"banner-vanish-fade",enter:"banner-enter-fade"}},p=d[o]||d.right_to_left,u=0;Ya(r,s[0]),s.length>1&&(Fe=setInterval(()=>{let b;do b=Math.floor(Math.random()*s.length);while(b===u&&s.length>1);u=b,r.className=`welcome-popup__content ${p.exit}`,setTimeout(()=>{Ya(r,s[u]),r.className=`welcome-popup__content ${p.enter}`,setTimeout(()=>{r.className="welcome-popup__content"},350)},350)},i*1e3))}catch{}}function Ya(e,t){e.innerHTML="";let a=!!(t&&t.text&&t.text.trim());if(!!(t&&t.image&&t.image.trim())){let n=document.createElement("img");n.className="welcome-popup__image",n.src=t.image,n.alt=t.text||"Banner Notice",n.onerror=()=>{n.style.display="none"},e.appendChild(n)}if(a){let n=document.createElement("div");n.className="welcome-popup__text-wrap",n.innerHTML=`<strong>JM Job:</strong> <span>${On(t.text)}</span>`,e.appendChild(n)}}function In(e){let t=ye("div","card card--user-header"),a=ye("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function Un(){let e=ye("div","icon-grid");return[{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill",tone:"purple"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill",tone:"blue"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].forEach(a=>{let s=ye("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",n=>{n.preventDefault(),f(a.path)}),e.appendChild(s)}),e}function On(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var Fe,Lt=y(()=>{h();_();Fe=null});var Ct={};S(Ct,{WebTaskPage:()=>we});function we(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await c.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(n=>t.appendChild(Jn(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Jn(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${Za(e.title)}</h3>
        <p class="card__sub">${Za(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>Wn(e,a,t)),t}async function Wn(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,n=e.duration_seconds;t.textContent=`Wait ${n}s\u2026`;let i=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{s+=1;let d=n-s;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",s>=n&&(clearInterval(o),Vn(t,i,a))},1e3)}function Vn(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await M(),we()()}catch(s){l(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function Za(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Be=y(()=>{_();h()});var Qa={};S(Qa,{EarnPage:()=>_e});function _e(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML='<div class="card"><p class="muted">Loading available ads\u2026</p></div>',e.className="view view--earn";let t=g.get(),a=t?t.ads_remaining:0;try{let s=await c.videoAds(),n=s.data||[],r=s.meta?.enabled!==!1;e.innerHTML=`
                <div class="card card--earn">
                    <h2 class="card__title">Ads Reward Center</h2>
                    <p class="card__sub">Server-timed sponsor videos and daily rewards</p>
                    <div class="ad-progress">
                        <div class="ad-progress__bar" style="width: ${t?Math.min(100,(t.today_ads||0)/(t.ads_limit||50)*100):0}%"></div>
                    </div>
                    <p class="ad-progress__label">${t?t.today_ads:0} / ${t?t.ads_limit:50} ads today</p>
                    ${r?"":'<p class="muted">Watch-and-earn is currently paused.</p>'}
                    <div class="video-ad-list"></div>
                    ${r&&n.length===0?'<p class="muted">No sponsor videos are available right now.</p>':""}
                    <button id="watch-btn" class="btn btn--ghost btn--sm" ${a<=0||!r?"disabled":""}>Use standard ad reward</button>
                </div>
            `;let i=e.querySelector(".video-ad-list");n.forEach(d=>{let p=document.createElement("div");p.className="admin-row",p.innerHTML=`<div><strong>${Et(d.title)}</strong><span class="muted">${d.duration_seconds}s \xB7 +${Number(d.reward_amount||0).toFixed(4)} \xB7 ${d.watched_today}/${d.daily_limit||"\u221E"} today</span></div>`;let u=document.createElement("button");u.className="btn btn--primary btn--sm",u.textContent=d.can_start&&a>0?"Watch & earn":"Unavailable",u.disabled=!d.can_start||a<=0,u.addEventListener("click",()=>zn(d)),p.appendChild(u),i.appendChild(p)});let o=e.querySelector("#watch-btn");o&&!o.disabled&&o.addEventListener("click",()=>Gn())}catch(s){e.innerHTML=`<div class="card card--earn"><h2 class="card__title">Ads Reward Center</h2><p class="muted">${Et(s.message||"Could not load ads.")}</p></div>`}}}async function zn(e){let t;try{t=await c.videoAdStart({video_ad_id:e.id})}catch(u){l(u.message||"Could not start this ad.","error");return}let a=t.data,s=document.createElement("div");s.className="modal modal--ad",s.innerHTML=`
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">\xD7</button>
            <h3>${Et(e.title)}</h3>
            <video id="video-ad-player" controls playsinline style="width:100%;max-height:320px;background:#000"></video>
            <p class="ad-slot__countdown" id="video-ad-countdown">Watch ${a.duration_seconds}s to unlock the reward.</p>
        </div>
    `,document.body.appendChild(s);let n=()=>s.remove();s.querySelector(".modal__close").addEventListener("click",n),s.querySelector(".modal__backdrop").addEventListener("click",n);let r=s.querySelector("#video-ad-player"),i=s.querySelector("#video-ad-countdown"),o=!1;try{let u=await fetch(a.stream_url,{headers:{Authorization:`Bearer ${kt()}`}});if(!u.ok)throw new Error("Video could not be loaded.");r.src=URL.createObjectURL(await u.blob()),await r.play().catch(()=>{})}catch(u){i.textContent=u.message||"Video could not be loaded.";return}let d=Number(a.started_at_unix||Math.floor(Date.now()/1e3))*1e3,p=setInterval(async()=>{let u=Math.max(0,a.duration_seconds-Math.floor((Date.now()-d)/1e3));if(i.textContent=u>0?`Reward unlocks in ${u}s\u2026`:"Claiming reward\u2026",u<=0&&!o){o=!0,clearInterval(p);try{let b=await c.videoAdClaim({view_id:a.view_id});l(`+$${Number(b.data?.reward||0).toFixed(4)} credited!`,"success"),await M(),URL.revokeObjectURL(r.src),n(),_e()()}catch(b){o=!1,i.textContent=b.message||"Reward claim failed."}}},1e3)}function Gn(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
    `,document.body.appendChild(e),e.querySelector(".modal__close").addEventListener("click",()=>e.remove()),e.querySelector(".modal__backdrop").addEventListener("click",()=>e.remove());let t=new Date().toISOString(),a=12,s=e.querySelector("#ad-slot"),n=e.querySelector("#ad-countdown");setTimeout(()=>{s.innerHTML=`
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Sponsored Content</h4>
                <p>This is a placeholder for a real ad. <br>Your reward will be credited in <strong><span id="cd-num">12</span>s</strong>.</p>
            </div>
        `;let r=s.querySelector("#cd-num"),i=setInterval(async()=>{a--,r.textContent=a,n.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(i),await Xn(e,"simulated",t))},1e3)},300)}async function Xn(e,t,a){try{let s=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await M(),e.remove(),_e()()}catch(s){l(s.message||"Reward failed","error"),e.remove()}}function Et(e){return String(e??"").replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}var At=y(()=>{_();h()});var ts={};S(ts,{ReferPage:()=>qt});function qt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=g.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let n=e.querySelector("#copy-btn"),r=e.querySelector("#refer-link-input");n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(r.value),l("Link copied to clipboard!","success")}catch{r.select(),document.execCommand("copy"),l("Link copied!","success")}});let i=e.querySelector("#share-tg");i.href="https://t.me/share/url?url="+encodeURIComponent(s);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let p=document.createElement("div");p.className="refer-item",p.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${es(d.name)}</div>
                        <div class="refer-item__username">@${es(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(p)})}}function es(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Nt=y(()=>{_();h()});var as={};S(as,{WithdrawPage:()=>De});function De(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=g.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async n=>{n.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(r.get("amount")),wallet_address:String(r.get("wallet_address")),gateway:String(r.get("gateway"))});l("Withdrawal requested!","success"),await M(),De()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let p=Object.values(d)[0];l(Array.isArray(p)?p[0]:p,"error")}else l(o.message||"Withdrawal failed","error");i.disabled=!1,i.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let r=(await c.withdrawals()).data||[];r.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",r.forEach(i=>s.appendChild(Yn(i))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Yn(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${Pt(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${Pt(e.gateway)} \xB7 ${Pt(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function Pt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Mt=y(()=>{_();h()});var rs={};S(rs,{DepositPage:()=>jt});function jt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=g.get();e.innerHTML=`
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
        `;try{L.loading=!0;let[s,n]=await Promise.all([c.paymentGateways(),c.paymentSubmissions()]);L.gateways=s.data.gateways,L.minAmount=s.data.min_amount,L.maxAmount=s.data.max_amount,L.submissions=n.data,ns(),ss()}catch(s){l("Failed to load deposit info: "+s.message,"error")}finally{L.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!L.selectedGateway){l("Please select a payment method.","error");return}let n=new FormData(a),r=document.getElementById("deposit-submit-btn");r.disabled=!0,r.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let i=await c.paymentSubmit({gateway:L.selectedGateway,sender_number:String(n.get("sender_number")||"").trim(),amount:parseFloat(n.get("amount")),trxid:String(n.get("trxid")||"").trim().toUpperCase()});l(i.message||"Payment submitted.","success"),a.reset();let o=await c.paymentSubmissions();L.submissions=o.data,ss(),await M();let d=g.get(),p=document.getElementById("deposit-balance");p&&d&&(p.textContent="\u09F3"+parseFloat(d.role==="poster"?d.wallet_balance||0:d.balance||0).toFixed(2))}catch(i){l(i.message||"Failed to submit payment.","error")}finally{r.disabled=!1,r.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function ns(){let e=document.getElementById("payment-gateways");if(e){if(L.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=L.gateways.map(t=>`
        <button class="payment-gateway ${L.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${pe(t.label)}</div>
                <div class="payment-gateway__number">${pe(t.wallet_number)}</div>
            </div>
            ${L.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{L.selectedGateway=t.getAttribute("data-gateway"),ns(),Zn()})})}}function Zn(){let e=L.gateways.find(r=>r.key===L.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${pe(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${pe(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{l("Wallet number copied.","info")}).catch(()=>{l("Could not copy. Please copy manually.","error")})}));let n=document.getElementById("deposit-amount");n&&(n.min=L.minAmount,n.max=L.maxAmount,n.placeholder=`${L.minAmount} \u2013 ${L.maxAmount}`)}function ss(){let e=document.getElementById("payment-history");if(e){if(L.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=L.submissions.map(t=>{let a=Kn[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${pe((t.gateway||"").toUpperCase())} \u2022 TRX: ${pe(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Qn(t.created_at)}</div>
            </div>
        `}).join("")}}function Qn(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function pe(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Kn,L,Ht=y(()=>{_();h();Kn={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},L={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var Ft={};S(Ft,{ProfilePage:()=>Ie});function Ie(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=g.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?Rt(t.name):""}</h2>
                <p class="card__sub">@${t?Rt(t.username):""}</p>
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
        `;let a=e.querySelector("#ad-history");try{let n=(await c.adHistory()).data||[];if(n.length===0)a.innerHTML='<p class="muted">No ad views yet.</p>';else{a.innerHTML='<div class="ad-history__list"></div>';let r=a.querySelector(".ad-history__list");n.forEach(i=>{let o=document.createElement("div");o.className="ad-history__row",o.innerHTML=`
                        <span class="ad-history__provider">${Rt(i.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(i.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${i.completed_at||i.started_at}</span>
                    `,r.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Rt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ue=y(()=>{_();h()});var is={};S(is,{default:()=>Oe});async function Oe(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var Bt=y(()=>{h()});var os={};S(os,{default:()=>Je});async function Je(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var Dt=y(()=>{h()});var ds={};S(ds,{default:()=>We});async function We(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var It=y(()=>{h()});function er(){let e=localStorage.getItem(ls);return e==="dark"||e==="light"?e:"system"}function tr(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function Ut(e){let t=tr(e);document.documentElement.setAttribute("data-theme",t)}function cs(){let e=I.get();I.set(e==="dark"?"light":"dark")}function ps(e){I.set(e)}function ar(){let e=localStorage.getItem(us);return e&&Ot.includes(e)?e:"default"}function ms(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function bs(e){Ot.includes(e)&&$e.set(e)}function gs(){return Ot}var ls,I,us,Ot,$e,Jt=y(()=>{D();ls="jmjob_theme";I=R(er());Ut(I.get());E(()=>{let e=I.get();Ut(e),localStorage.setItem(ls,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{I.get()==="system"&&Ut("system")});us="jmjob_color_theme",Ot=["default","emerald","amber","rose"];$e=R(ar());ms($e.get());E(()=>{let e=$e.get();ms(e),localStorage.setItem(us,e)})});var vs={};S(vs,{default:()=>ze});async function ze(){let e=document.querySelector("[data-view]");if(!e)return;let t=g.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=I.get(),s=$e.get(),n=gs();e.innerHTML=`
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
                        <div class="settings-value">${Ve[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${n.map(o=>`
                            <button class="theme-swatch ${o===s?"is-active":""}" data-color="${o}" role="radio" aria-checked="${o===s}" title="${Ve[o]||o}">
                                <span class="theme-swatch__chip" style="background: ${sr[o]};"></span>
                                <span class="theme-swatch__label">${(Ve[o]||o).split(" ")[0]}</span>
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
    `;let r=document.getElementById("theme-mode-group");r&&r.querySelectorAll("button[data-mode]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-mode");ps(d),l(`Theme mode set to ${d}.`,"info")})});let i=document.getElementById("color-theme-group");i&&i.querySelectorAll("button[data-color]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-color");bs(d),l(`Accent color set to ${Ve[d]||d}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await Re(),l("Logged out.","info")})}var Ve,sr,Wt=y(()=>{h();Jt();Ve={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},sr={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var hs={};S(hs,{NotificationsPage:()=>Vt});function Vt(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await c.notificationsReadAll(),l("All notifications marked as read.","success"),await fs()}catch(t){l(t.message||"Could not update notifications.","error")}}),await fs())}}async function fs(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await c.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(nr).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await c.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(n){l(n.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${Se(t.message||"unknown error")}</p>`}}function nr(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",n=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${Se(t.action_url)}">Open</a>`:"",r=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${Se(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${Se(t.title||"Notification")}</h3><p>${Se(t.message||"")}</p><small>${rr(e.created_at)}</small></div><div class="notifications-page__actions">${n}${r}</div></article>`}function rr(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Se(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var zt=y(()=>{_();h()});var ys={};S(ys,{TgTasksPage:()=>Xe});function Xe(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await c.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(n=>t.appendChild(ir(n)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function ir(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${Ge(e.channel_name)}</strong>
                <span class="muted">${Ge(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${Ge(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${Ge(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let n=a.href;window.open(n,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&or(e,t)},3e3)})}return t}async function or(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await M(),Xe()()}catch(s){l(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function Ge(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Gt=y(()=>{_();h()});var $s={};S($s,{PosterDashboardPage:()=>Yt});function Yt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--poster-dashboard",!g.get()){e.innerHTML='<div class="card"><h2>Access required</h2><a class="btn btn--primary" href="#/login">Log in</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),f("/poster/post-job")}),await ws()}}async function ws(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await c.posterStats();lr(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${_s(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",ws),l(t.message||"Failed to load poster statistics.","error")}}function lr(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),n=Xt(t.wallet_balance),r=Xt(t.frozen_balance),i=Xt(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${Ye("bi-briefcase","Total jobs",a.total||0)}
            ${Ye("bi-lightning-charge","Active jobs",s)}
            ${Ye("bi-wallet2","Available wallet",n,"\u09F3")}
            ${Ye("bi-lock","In escrow",r,"\u09F3")}
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
                    ${ue("open",a.open)}
                    ${ue("in_review",a.in_review)}
                    ${ue("assigned",a.assigned)}
                    ${ue("submitted",a.submitted)}
                    ${ue("revision",a.revision)}
                    ${ue("completed",a.completed)}
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
                <div class="poster-wallet-total">\u09F3${n}</div>
                <div class="poster-wallet-lines">
                    <div><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div>
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
    `,e.querySelectorAll("[data-poster-link]").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault(),f(o.getAttribute("href").replace(/^#/,""))})})}function Ye(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${_s(String(a))}</strong>
        </div>
    `}function ue(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${cr(e)}"></i> ${dr[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function cr(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function Xt(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function _s(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var dr,Kt=y(()=>{_();h();dr={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var xs={};S(xs,{PostJobPage:()=>Zt});function Zt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--post-job",!br()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t={currentStep:1,categories:[],mainCategoryId:"",subCategoryId:"",title:"",subtitle:"",description:"",thumbnailBase64:"",proofRequirements:[{title:"",type:"text"}],workerCount:1,costPerWorker:10,biddingValue:3,biddingUnit:"days",deadlineAt:"",feePercentage:30};try{let a=await c.categories();t.categories=a.data||[]}catch(a){l(a.message||"Could not load categories.","error")}Te(e,t)}}function Te(e,t){e.innerHTML=`
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
    `,pr(e,t)}function pr(e,t){let a=e.querySelector("#wizard-card-body");a&&(t.currentStep===1?ks(a,e,t):t.currentStep===2?xe(a,e,t):t.currentStep===3&&ur(a,e,t))}function ks(e,t,a){let s=a.categories.find(o=>Number(o.id)===Number(a.mainCategoryId)),n=s?s.subcategories||[]:[];e.innerHTML=`
        <form id="step-1-form" class="poster-form">
            <h2>Step 1: Select Category</h2>
            
            <label>Main Category
                <select id="main-category-select" required>
                    <option value="">Choose Main Category\u2026</option>
                    ${a.categories.map(o=>`
                        <option value="${o.id}" ${Number(a.mainCategoryId)===Number(o.id)?"selected":""}>
                            ${me(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <label>Sub Category
                <select id="sub-category-select" ${s?"":"disabled"}>
                    <option value="">Choose Sub Category (Optional)\u2026</option>
                    ${n.map(o=>`
                        <option value="${o.id}" ${Number(a.subCategoryId)===Number(o.id)?"selected":""}>
                            ${me(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                <button type="submit" class="btn btn--primary" id="step-1-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;let r=e.querySelector("#main-category-select"),i=e.querySelector("#sub-category-select");r.addEventListener("change",o=>{a.mainCategoryId=o.target.value,a.subCategoryId="",ks(e,t,a)}),i.addEventListener("change",o=>{a.subCategoryId=o.target.value}),e.querySelector("#step-cancel").addEventListener("click",Qt),e.querySelector("#step-1-form").addEventListener("submit",o=>{if(o.preventDefault(),!a.mainCategoryId){l("Please select a main category.","error");return}let d=a.categories.find(u=>Number(u.id)===Number(a.mainCategoryId)),p=d?Number(d.min_cost||1):1;if(a.subCategoryId&&d&&d.subcategories){let u=d.subcategories.find(b=>Number(b.id)===Number(a.subCategoryId));u&&u.min_cost&&(p=Number(u.min_cost))}a.minCost=p,a.costPerWorker<a.minCost&&(a.costPerWorker=a.minCost),a.currentStep=2,Te(t,a)})}function xe(e,t,a){e.innerHTML=`
        <form id="step-2-form" class="poster-form">
            <h2>Step 2: Job Details & Proof Requirements</h2>

            <label>Job Title
                <input id="job-title-input" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo" value="${me(a.title)}">
            </label>

            <label>Job Subtitle (Optional)
                <input id="job-subtitle-input" type="text" maxlength="255" placeholder="Short summary shown on job cards" value="${me(a.subtitle)}">
            </label>

            <label>Task Instructions (Description)
                <textarea id="job-desc-input" rows="5" required placeholder="Explain step by step instructions for workers\u2026">${me(a.description)}</textarea>
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
                    ${a.proofRequirements.map((r,i)=>`
                        <div class="proof-pair-row" style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;" data-index="${i}">
                            <select class="proof-type-select" style="flex:1;">
                                <option value="text" ${r.type==="text"?"selected":""}>Text Proof</option>
                                <option value="screenshot" ${r.type==="screenshot"?"selected":""}>Screenshot Proof</option>
                            </select>
                            ${r.type==="screenshot"?`
                                <div style="flex:2; display:flex; align-items:center; gap:0.5rem;">
                                    <input type="file" class="proof-file-input" accept="image/*" style="flex:1;">
                                    ${r.fileBase64?`<img src="${r.fileBase64}" style="max-height:40px; max-width:60px; border-radius:4px; border:1px solid #ccc;">`:""}
                                </div>
                            `:`
                                <input type="text" class="proof-title-input" placeholder="Proof Requirement Title (e.g. Provide Username)" value="${me(r.title||"")}" style="flex:2;" required>
                            `}
                            ${a.proofRequirements.length>1?`
                                <button type="button" class="btn btn--ghost remove-proof-btn" data-index="${i}" style="color:#ef4444;"><i class="bi bi-trash"></i></button>
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
    `;let s=e.querySelector("#proof-pairs-container");s.addEventListener("change",r=>{if(r.target.classList.contains("proof-type-select"))ke(e,a),xe(e,t,a);else if(r.target.classList.contains("proof-file-input")){let i=r.target.closest(".proof-pair-row"),o=Number(i.getAttribute("data-index")),d=r.target.files[0];if(d){let p=new FileReader;p.onload=u=>{a.proofRequirements[o].fileBase64=u.target.result,a.proofRequirements[o].title=d.name,xe(e,t,a)},p.readAsDataURL(d)}}}),e.querySelector("#add-proof-btn").addEventListener("click",()=>{ke(e,a),a.proofRequirements.push({title:"",type:"text"}),xe(e,t,a)}),s.addEventListener("click",r=>{let i=r.target.closest(".remove-proof-btn");if(i){let o=Number(i.getAttribute("data-index"));ke(e,a),a.proofRequirements.splice(o,1),xe(e,t,a)}}),e.querySelector("#job-thumbnail-input").addEventListener("change",r=>{let i=r.target.files[0];if(i){let o=new FileReader;o.onload=d=>{a.thumbnailBase64=d.target.result},o.readAsDataURL(i)}}),e.querySelector("#step-cancel").addEventListener("click",Qt),e.querySelector("#step-2-back").addEventListener("click",()=>{ke(e,a),a.currentStep=1,Te(t,a)}),e.querySelector("#step-2-form").addEventListener("submit",r=>{if(r.preventDefault(),ke(e,a),!a.title.trim()){l("Job title is required.","error");return}if(!a.description.trim()){l("Task instructions are required.","error");return}a.currentStep=3,Te(t,a)})}function ke(e,t){t.title=e.querySelector("#job-title-input")?.value||"",t.subtitle=e.querySelector("#job-subtitle-input")?.value||"",t.description=e.querySelector("#job-desc-input")?.value||"";let a=e.querySelectorAll(".proof-pair-row");t.proofRequirements=Array.from(a).map((s,n)=>{let r=s.querySelector(".proof-type-select")?.value||"text",i=s.querySelector(".proof-title-input"),o=i?i.value:t.proofRequirements[n]?.title||"Screenshot Proof",d=t.proofRequirements[n]?.fileBase64||null;return{title:o,type:r,fileBase64:d}})}function ur(e,t,a){let s=Number(a.workerCount||0)*Number(a.costPerWorker||0),n=s*(a.feePercentage/100),r=s+n;e.innerHTML=`
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
                    <strong id="summary-fee">\u09F3${n.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-space-between; font-size:1.15rem; color:var(--primary, #4f46e5); border-top:1px solid #e5e7eb; padding-top:0.5rem;">
                    <span>Total Cost:</span>
                    <strong id="summary-total">\u09F3${r.toFixed(2)}</strong>
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
    `;let i=e.querySelector("#worker-count-input"),o=e.querySelector("#cost-per-worker-input"),d=()=>{a.workerCount=Math.max(1,parseInt(i.value,10)||1),a.costPerWorker=Math.max(0,parseFloat(o.value)||0);let p=a.workerCount*a.costPerWorker,u=p*(a.feePercentage/100),b=p+u;e.querySelector("#summary-subtotal").textContent=`\u09F3${p.toFixed(2)}`,e.querySelector("#summary-fee").textContent=`\u09F3${u.toFixed(2)}`,e.querySelector("#summary-total").textContent=`\u09F3${b.toFixed(2)}`};i.addEventListener("input",d),o.addEventListener("input",d),e.querySelector("#step-cancel").addEventListener("click",Qt),e.querySelector("#step-3-back").addEventListener("click",()=>{Ss(e,a),a.currentStep=2,Te(t,a)}),e.querySelector("#step-3-form").addEventListener("submit",async p=>{p.preventDefault(),Ss(e,a);let u=e.querySelector("#post-job-publish");u.disabled=!0,u.textContent="Publishing\u2026";let b=0,$=Number(a.biddingValue||0);$>0&&(a.biddingUnit==="minutes"?b=$/60:a.biddingUnit==="hours"?b=$:a.biddingUnit==="days"?b=$*24:a.biddingUnit==="months"&&(b=$*24*30));try{let w=await c.posterCreateJob({category_id:Number(a.mainCategoryId),subcategory_id:a.subCategoryId?Number(a.subCategoryId):null,title:a.title.trim(),subtitle:a.subtitle.trim(),description:a.description.trim(),thumbnail:a.thumbnailBase64||null,proof_requirements:a.proofRequirements,worker_count:Number(a.workerCount),cost_per_worker:Number(a.costPerWorker),budget:Number(a.workerCount)*Number(a.costPerWorker),deadline_at:mr(a.deadlineAt),bidding_window_hours:b});l("Job submitted for admin review.","success");let C=g.get(),ie=C&&(C.username||C.name)||"User",G=w?.data?.id||"",qe=`${window.location.origin}/#/poster/jobs/${G}`,Pa=`I, the user ${ie}, has submitted this job ${qe} for publishing. Let's talk about payment and approval`,Ne=`https://wa.me/8801775722083?text=${encodeURIComponent(Pa)}`,Ma=t.querySelector("#wizard-card-body");Ma&&(Ma.innerHTML=`
                    <div style="text-align:center; padding: 2rem 1rem;">
                        <div style="font-size:3rem; color:#f59e0b; margin-bottom:1rem;"><i class="bi bi-clock-history"></i></div>
                        <h2 style="margin-bottom:0.5rem;">Job Submitted & Pending Approval</h2>
                        <p class="muted" style="max-width:500px; margin:0 auto 1.5rem;">Your job has been submitted to the admin panel for review. Contact the admin on WhatsApp to talk about payment and job approval.</p>
                        
                        <div style="margin-bottom:1.5rem;">
                            <a href="${Ne}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--xl" style="background:#25D366; border-color:#25D366; color:#fff; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none;">
                                <i class="bi bi-whatsapp" style="font-size:1.25rem;"></i> Contact Whatsapp
                            </a>
                        </div>

                        <div>
                            <a href="#/poster/jobs" class="btn btn--ghost">Go to My Jobs</a>
                        </div>
                    </div>
                `)}catch(w){l(w.message||"Could not publish job.","error"),u.disabled=!1,u.textContent="Publish Job"}})}function Ss(e,t){t.workerCount=Number(e.querySelector("#worker-count-input")?.value||1),t.costPerWorker=Number(e.querySelector("#cost-per-worker-input")?.value||0),t.biddingValue=Number(e.querySelector("#bidding-val-input")?.value||0),t.biddingUnit=e.querySelector("#bidding-unit-input")?.value||"days",t.deadlineAt=e.querySelector("#deadline-input")?.value||""}function Qt(){confirm("Are you sure you want to cancel posting this job?")&&f("/poster")}function mr(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function br(){let e=g.get();return!!e&&(e.is_admin||e.role==="poster")}function me(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ea=y(()=>{_();h()});var Ls={};S(Ls,{PosterJobsPage:()=>ta});function ta(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!hr()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your job listings, track worker progress, and review submissions.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar" style="margin-bottom: 16px;">
                <label>Filter Status
                    <select class="admin-select" id="poster-job-filter">
                        ${gr.map(t=>`<option value="${t}" ${t===Ze?"selected":""}>${t?Ts(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),f("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{Ze=t.target.value,await Ke()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",Ke),await Ke()}}}async function Ke(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await c.posterMyJobs()).data||[]).filter(s=>!Ze||s.status===Ze);e.innerHTML=a.length?"":'<p class="muted card" style="padding: 20px; text-align: center;">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(vr(s)))}catch(t){e.innerHTML=`<p class="muted card" style="padding: 20px;">Failed to load jobs: ${K(t.message||"unknown error")}</p>`}}}function vr(e){let t=document.createElement("article");t.className=`admin-row poster-job-row poster-job-row--${K(e.status)}`;let a=e.status==="pending_approval",s=e.status==="declined",n="";return!a&&!s&&(n=`
            <div class="poster-job-row__metrics" style="display: flex; gap: 16px; margin: 10px 0; background: rgba(0,0,0,0.03); padding: 10px 14px; border-radius: 6px; font-size: 13px;">
                <div><i class="bi bi-clock-history"></i> <strong>Days Remaining:</strong> <span style="color:#d97706;">${K(e.days_remaining||"N/A")}</span></div>
                <div><i class="bi bi-people"></i> <strong>Active Workers:</strong> ${Number(e.active_workers_count||0)} / ${Number(e.worker_count||1)} working</div>
                <div><i class="bi bi-check2-square"></i> <strong>Tasks Remaining:</strong> ${Number(e.remaining_tasks_count||0)} slots left</div>
            </div>
        `),t.innerHTML=`
        <div class="poster-job-row__header">
            <div>
                <strong>${K(e.title)}</strong>
                <span class="badge badge--${a?"warning":s?"danger":"success"}">${K(Ts(e.status).toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${K(e.currency||"BDT")} ${Number(e.total_payable_amount||e.budget||0).toFixed(2)}</strong>
        </div>

        <p class="muted poster-job-row__description">${K(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>

        ${n}

        <div class="admin-job-row__meta">
            <span><strong>Workers Needed:</strong> ${Number(e.worker_count||1)}</span>
            <span><strong>Cost/Worker:</strong> ${K(e.currency||"BDT")} ${Number(e.cost_per_worker||0).toFixed(2)}</span>
            <span><strong>Applications/Bids:</strong> ${Number(e.bid_count||0)}</span>
            <span><strong>Views:</strong> ${Number(e.view_count||0)}</span>
            <span><strong>Created:</strong> ${yr(e.created_at)}</span>
            ${e.decline_reason?`<span style="color:#dc2626;"><strong>Decline Reason:</strong> ${K(e.decline_reason)}</span>`:""}
        </div>

        <div class="poster-job-row__actions" style="margin-top: 12px;">
            <button class="btn btn--primary btn--sm" data-view-job>Manage Job</button>
            ${["completed","cancelled","declined"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel Job</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>f(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>fr(e.id)),t}async function fr(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await c.posterCancelJob(e,{reason:t}),l("Job cancelled.","success"),await Ke()}catch(a){l(a.message||"Could not cancel job.","error")}}function hr(){return!!g.get()}function Ts(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function yr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function K(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var gr,Ze,aa=y(()=>{_();h();gr=["","pending_approval","open","assigned","submitted","revision","completed","declined","cancelled","disputed"],Ze=""});var Cs={};S(Cs,{PosterWalletPage:()=>na});function na(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--poster-wallet";let t=g.get();if(!t||!t.is_admin&&t.role!=="poster"){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([c.posterStats(),c.paymentSubmissions()]);wr(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${Qe(a.message||"unknown error")}</p>`}}}function wr(e,t,a){let s=sa(t.wallet_balance),n=sa(t.frozen_balance),r=sa(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${n}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${r}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${_r(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit").addEventListener("click",()=>f("/deposit"))}function _r(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${Qe((t.gateway||"").toUpperCase())}</strong><small>${Qe(t.trxid)} \xB7 ${$r(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${Qe(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function sa(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function $r(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Qe(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ra=y(()=>{_();h()});var qs={};S(qs,{AdminPage:()=>ia});function ia(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
                <button class="admin-tab" data-tab="video-ads"><i class="bi bi-film"></i> Video Ads</button>
                <button class="admin-tab" data-tab="fraud"><i class="bi bi-shield-exclamation"></i> Fraud Review</button>
            </div>
            <div class="admin-tab-content" id="admin-content"><div class="spinner"></div></div>
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(n=>{n.addEventListener("click",()=>{a.forEach(r=>r.classList.remove("admin-tab--active")),n.classList.add("admin-tab--active"),Es(n.dataset.tab,s)})}),Es("stats",s)}}async function Es(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([c.adminStats(),c.adminRevenue()]),n=a.data||{},r=s.data||{},i=n.marketplace||{},o=r.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${J("bi-graph-up-arrow","Platform revenue",W(r.platform_revenue,o))}
                    ${J("bi-percent","Commission rate",`${(Number(r.commission_rate||0)*100).toFixed(2)}%`)}
                    ${J("bi-briefcase","Total jobs",A(r.total_jobs))}
                    ${J("bi-check2-circle","Completed jobs",A(r.completed_jobs))}
                    ${J("bi-lightning-charge","Active jobs",A(r.active_jobs))}
                    ${J("bi-people","Total users",A(r.total_users))}
                    ${J("bi-hourglass-split","Pending deposits",A(r.pending_payments))}
                    ${J("bi-lock","Held in escrow",W(r.escrow_total,o))}
                    ${J("bi-hourglass-split","Pending submissions",A(i.pending_submissions))}
                    ${J("bi-shield-exclamation","Flagged submissions",A(i.flagged_submissions))}
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
                        <div><span class="muted">Withdrawals</span><strong>${A(n.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${A(n.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${A(n.total_ad_views)}</strong></div>
                        <div><span class="muted">Video ad views</span><strong>${A(n.video_ad_views)}</strong></div>
                        <div><span class="muted">Video rewards paid</span><strong>${W(n.video_rewards_paid,o)}</strong></div>
                        <div><span class="muted">Banned users</span><strong>${A(n.banned_users)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${W(n.total_lifetime_paid,o)}</strong></div>
                        <div><span class="muted">Pending jobs</span><strong>${A(i.pending_jobs)}</strong></div>
                        <div><span class="muted">Rejected jobs</span><strong>${A(i.rejected_jobs)}</strong></div>
                        <div><span class="muted">Total workers</span><strong>${A(i.total_workers)}</strong></div>
                        <div><span class="muted">Approved submissions</span><strong>${A(i.approved_submissions)}</strong></div>
                        <div><span class="muted">Rejected submissions</span><strong>${A(i.rejected_submissions)}</strong></div>
                        <div><span class="muted">Job budget</span><strong>${W(i.total_job_budget,o)}</strong></div>
                        <div><span class="muted">Completed payments</span><strong>${W(i.completed_payment,o)}</strong></div>
                        <div><span class="muted">Pending payments</span><strong>${W(i.pending_payment,o)}</strong></div>
                        <div><span class="muted">Commissions</span><strong>${W(i.commissions,o)}</strong></div>
                        <div><span class="muted">Worker earnings</span><strong>${W(i.worker_earnings,o)}</strong></div>
                        <div><span class="muted">Ad rewards</span><strong>${W(i.ad_earnings,o)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${T(r.currency||"BDT")}</strong> currency \xB7 <strong>${T(r.escrow_mode||"full_bid")}</strong> escrow</div>
                </div>
                <div class="card admin-config-card">
                    <div>
                        <strong>System Maintenance</strong>
                        <p class="muted" style="margin:0; font-size:12px;">Reset daily user ad view limits and daily bonus claim timers for all users.</p>
                    </div>
                    <button class="btn btn--danger btn--sm" id="btn-reset-counters"><i class="bi bi-arrow-counterclockwise"></i> Reset Daily Counters</button>
                </div>
            `;let d=t.querySelector("#btn-reset-counters");d&&d.addEventListener("click",async()=>{if(confirm("Reset daily ad view counters for all users?"))try{let p=await c.adminResetDailyCounters();l(p.message||"Daily counters reset.","success")}catch(p){l(p.message||"Reset failed.","error")}})}else if(e==="withdrawals"){let s=(await c.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let n=t.querySelector("#wd-list");s.forEach(r=>n.appendChild(As(r,n))),t.querySelector("#wd-filter").addEventListener("change",async r=>{let i=await c.adminWithdrawals(r.target.value);n.innerHTML="",(i.data||[]).forEach(o=>n.appendChild(As(o,n)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list"),r=Number(g.get()?.id||0);s.forEach(i=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${T(i.name)}</strong>
                        <span class="muted">${T(i.email)}</span>
                        <span class="badge user-role-badge">${T(i.role||(i.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(i.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(i.lifetime_earned||0).toFixed(2)}</span>
                        <span class="badge user-status-badge ${i.is_banned?"badge--danger":"badge--success"}">${i.is_banned?"BANNED":"ACTIVE"}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(i.id)===r?"disabled":""}>
                                ${["worker","poster","admin"].map(p=>`<option value="${p}" ${(i.role||(i.is_admin?"admin":"worker"))===p?"selected":""}>${p[0].toUpperCase()+p.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let d=o.querySelector(".admin-user-role");if(d?.addEventListener("change",async()=>{let p=i.role||(i.is_admin?"admin":"worker");try{let u=await c.adminUpdateUserRole(i.id,d.value);i.role=u.data?.role||d.value,i.is_admin=!!u.data?.is_admin,o.querySelector(".user-role-badge").textContent=i.role.toUpperCase(),l("User role updated","success")}catch(u){d.value=p,l(u.message||"Role update failed","error")}}),Number(i.id)!==r){let p=document.createElement("button");p.className=`btn ${i.is_banned?"btn--success":"btn--danger"} btn--sm`,p.textContent=i.is_banned?"Unban user":"Ban user",p.addEventListener("click",async()=>{let u=prompt(i.is_banned?"Reason for unbanning:":"Reason for banning this user:",i.ban_reason||"");if(!(u===null||!i.is_banned&&!u.trim()))try{let b=i.is_banned?await c.adminUnbanUser(i.id,{reason:u}):await c.adminBanUser(i.id,{reason:u});i.is_banned=!!b.data?.is_banned,i.ban_reason=i.is_banned?u:null,p.className=`btn ${i.is_banned?"btn--success":"btn--danger"} btn--sm`,p.textContent=i.is_banned?"Unban user":"Ban user";let $=o.querySelector(".user-status-badge");$&&($.className=`badge user-status-badge ${i.is_banned?"badge--danger":"badge--success"}`,$.textContent=i.is_banned?"BANNED":"ACTIVE"),l(b.message||"User status updated.","success")}catch(b){l(b.message||"Could not update user status.","error")}}),o.querySelector(".admin-user-controls").appendChild(p)}n.appendChild(o)})}else if(e==="providers"){let s=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let n=t.querySelector(".admin-list");s.forEach(r=>n.appendChild(Sr(r,n)))}else if(e==="video-ads")await oa(t);else if(e==="fraud"){let s=(await c.adminFraudSubmissions()).data||[];t.innerHTML='<div class="card"><p class="muted">Risk signals are advisory. Confirm fraud only after reviewing the proof. A confirmed decision can optionally ban the worker and revoke active sessions.</p></div><div class="admin-list" id="fraud-list"></div>';let n=t.querySelector("#fraud-list");s.length||(n.innerHTML='<p class="muted">No flagged submissions.</p>'),s.forEach(r=>{let i=document.createElement("div");i.className="admin-row",i.innerHTML=`
                    <div>
                        <strong>${T(r.worker_name||"Unknown worker")}</strong>
                        <span class="muted">${T(r.worker_email||"")} \xB7 Job: ${T(r.job_title||"")}</span>
                        <p>${T(r.description||"")}</p>
                        <span class="badge badge--danger">Risk ${Number(r.risk_score||0).toFixed(0)}</span>
                        <span class="muted">${T((r.risk_flags||[]).join(", ")||"Manual review")}</span>
                        ${r.attachment_url?`<a href="${T(r.attachment_url)}" target="_blank" rel="noopener">Open proof</a>`:""}
                    </div>
                    <div class="admin-row__actions"><button class="btn btn--success btn--sm" data-fraud-decision="cleared">Clear</button><button class="btn btn--danger btn--sm" data-fraud-decision="confirmed_fraud">Confirm fraud</button></div>
                `,i.querySelectorAll("[data-fraud-decision]").forEach(o=>o.addEventListener("click",async()=>{let d=o.dataset.fraudDecision,p=d==="confirmed_fraud"?prompt("Reason for confirming fraud:"):prompt("Optional review note:")||"";if(p===null||d==="confirmed_fraud"&&!p.trim())return;let u=d==="confirmed_fraud"&&confirm("Also ban this worker and revoke active sessions?");try{let b=await c.adminReviewFraud(r.id,{decision:d,note:p,ban_user:u});l(b.data?.user_banned?"Fraud review saved and worker banned.":"Fraud review saved.","success"),i.remove(),n.children.length||(n.innerHTML='<p class="muted">No flagged submissions.</p>')}catch(b){l(b.message||"Fraud review failed.","error")}})),n.appendChild(i)})}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function J(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${T(t)}</span>
            <strong>${T(String(a))}</strong>
        </div>
    `}function A(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function W(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function As(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${T(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${T(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${T(e.gateway)} \xB7 ${T(e.wallet_address)}</div>
        <div class="admin-row__status">${T(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--success btn--sm",n.textContent="Approve",n.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(i){l(i.message,"error")}});let r=document.createElement("button");r.className="btn btn--danger btn--sm",r.textContent="Reject",r.addEventListener("click",async()=>{let i=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:i||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),s.appendChild(n),s.appendChild(r),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let n=document.createElement("button");n.className="btn btn--primary btn--sm",n.textContent="Mark as Paid",n.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(r){l(r.message,"error")}}),s.appendChild(n),a.appendChild(s)}return a}function Sr(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,n=e.block_id||"";return a.innerHTML=`
        <div class="admin-row__main">
            <strong>${T(e.name)}</strong>
            <span class="muted">${T(e.slug)}</span>
            ${s?'<span class="badge badge--green">ENABLED</span>':'<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${T(n)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${e.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${e.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${e.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${s?"checked":""}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let r={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,r),l("Provider saved","success")}catch(i){l(i.message,"error")}}),a}async function oa(e){let a=(await c.adminVideoAds()).data||[];e.innerHTML=`
        <form class="card admin-video-ad-form" id="video-ad-form">
            <h3 class="card__title">Add sponsored video</h3>
            <div class="admin-row__form">
                <label>Title <input name="title" required maxlength="160"></label>
                <label>Video <input name="video" type="file" accept="video/*" required></label>
                <label>Duration (seconds) <input name="duration_seconds" type="number" min="1" value="10" required></label>
                <label>Reward <input name="reward_amount" type="number" min="0" step="0.0001" value="0.005" required></label>
                <label>Daily limit (0 = unlimited) <input name="daily_limit" type="number" min="0" value="0"></label>
                <label>Total limit (0 = unlimited) <input name="total_limit" type="number" min="0" value="0"></label>
                <button class="btn btn--primary btn--sm" type="submit">Upload video ad</button>
            </div>
        </form>
        <div class="admin-list" id="video-ad-list"></div>
    `;let s=e.querySelector("#video-ad-list");a.length||(s.innerHTML='<p class="muted">No video ads configured.</p>'),a.forEach(n=>s.appendChild(kr(n,s))),e.querySelector("#video-ad-form").addEventListener("submit",async n=>{n.preventDefault();let r=n.currentTarget;try{await c.adminCreateVideoAd(new FormData(r)),l("Video ad uploaded.","success"),await oa(e)}catch(i){l(i.message||"Video upload failed.","error")}})}function kr(e,t){let a=document.createElement("div");return a.className="admin-row admin-row--provider",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${T(e.title)}</strong>
            <span class="muted">${e.duration_seconds}s \xB7 reward ${Number(e.reward_amount||0).toFixed(4)} \xB7 ${Number(e.completed_views||0)}/${Number(e.total_views||0)} completed</span>
            <span class="badge ${e.status==="active"?"badge--green":""}">${T(String(e.status||"").toUpperCase())}</span>
        </div>
        <div class="admin-row__actions">
            <button class="btn btn--ghost btn--sm video-ad-toggle">${e.status==="active"?"Pause":"Activate"}</button>
            <button class="btn btn--danger btn--sm video-ad-delete">Delete</button>
        </div>
    `,a.querySelector(".video-ad-toggle").addEventListener("click",async()=>{let s=new FormData;s.append("status",e.status==="active"?"paused":"active");try{await c.adminUpdateVideoAd(e.id,s),l("Video ad status updated.","success"),await oa(t.parentElement)}catch(n){l(n.message||"Could not update video ad.","error")}}),a.querySelector(".video-ad-delete").addEventListener("click",async()=>{if(confirm(`Delete \u201C${e.title}\u201D?`))try{await c.adminDeleteVideoAd(e.id),l("Video ad deleted.","success"),a.remove()}catch(s){l(s.message||"Could not delete video ad.","error")}}),a}function T(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var da=y(()=>{_();h();h()});var Ms={};S(Ms,{AdminPaymentsPage:()=>ca});function ca(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${Z.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${Z.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${Z.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${Z.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{Z.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),la()})}),await la()}}async function la(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminPayments(Z.status);Z.items=t.data||[],Tr(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${oe(t.message||"Failed to load.")}</p>`}}}function Tr(e){if(Z.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",Z.items.forEach(t=>e.appendChild(Lr(t)))}function Lr(e){let t=xr[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${oe((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${oe(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${oe(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${oe(e.user.name)} <span class="muted">(${oe(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${Ps(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${Ps(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${oe(e.admin_note)}</div>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>Ns(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>Ns(e.id,"reject",a))),a}async function Ns(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let r=await(t==="approve"?c.adminApprovePayment:c.adminRejectPayment)(e,{note:s||null});l(r.message||"Done.","success"),await la()}catch(n){l(n.message||"Action failed.","error")}}function Ps(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function oe(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var xr,Z,pa=y(()=>{_();h();xr={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},Z={status:"pending",items:[],loading:!1}});var et={};S(et,{AdminJobsPage:()=>ua});function ua(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--admin-jobs",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t=window.location.hash.replace(/^#/,"").split("?")[0];t==="/admin/pending-jobs"?B="pending_approval":t==="/admin/active-jobs"&&(B="open"),e.innerHTML=`
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Job Management Center</h1>
                    <p class="muted">Review pending user job postings, activate approved jobs, track live active jobs, and inspect worker proofs & screenshots.</p>
                </div>
                <button class="btn btn--primary" id="admin-create-job"><i class="bi bi-plus-circle"></i> Admin Job Post</button>
            </div>

            <div class="admin-tabs" style="margin-bottom: 20px;">
                <button class="admin-tab ${B==="pending_approval"?"admin-tab--active":""}" data-status="pending_approval">
                    <i class="bi bi-file-earmark-plus"></i> Job Post (Pending Approval)
                </button>
                <button class="admin-tab ${B==="open"?"admin-tab--active":""}" data-status="open">
                    <i class="bi bi-lightning-charge"></i> Active Job
                </button>
                <button class="admin-tab ${B==="all"?"admin-tab--active":""}" data-status="all">
                    <i class="bi bi-list-task"></i> All Jobs Moderation
                </button>
            </div>

            <div class="admin-toolbar" style="margin-bottom: 16px;">
                <label>Filter Status
                    <select class="admin-select" id="admin-job-status">
                        ${Cr.map(s=>`<option value="${s.value}" ${s.value===B?"selected":""}>${s.label}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>

            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
            <div id="admin-proof-modal-container"></div>
        `;let a=e.querySelectorAll(".admin-tab");a.forEach(s=>{s.addEventListener("click",async()=>{a.forEach(r=>r.classList.remove("admin-tab--active")),s.classList.add("admin-tab--active"),B=s.dataset.status;let n=e.querySelector("#admin-job-status");n&&(n.value=B),await re()})}),e.querySelector("#admin-job-status").addEventListener("change",async s=>{B=s.target.value,a.forEach(n=>n.classList.toggle("admin-tab--active",n.dataset.status===B)),await re()}),e.querySelector("#admin-job-refresh").addEventListener("click",re),e.querySelector("#admin-create-job").addEventListener("click",()=>f("/admin/admin-job-post")),await re()}}async function re(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=B==="all"?"":B,s=(await c.adminJobs(t)).data||[];e.innerHTML=s.length?"":'<p class="muted card" style="padding:20px; text-align:center;">No jobs found for this section.</p>',s.forEach(n=>e.appendChild(Er(n)))}catch(t){e.innerHTML=`<p class="muted card" style="padding:20px;">Failed to load jobs: ${k(t.message||"unknown error")}</p>`}}}function Er(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${k(e.status)}`;let a=e.status==="pending_approval",s=e.status==="declined",n="";!a&&!s&&(n=`
            <div class="admin-job-row__metrics" style="display: flex; gap: 16px; margin: 10px 0; background: rgba(0,0,0,0.03); padding: 10px 14px; border-radius: 6px; font-size: 13px;">
                <div><i class="bi bi-clock-history"></i> <strong>Days Remaining:</strong> <span style="color:#d97706;">${k(e.days_remaining||"N/A")}</span></div>
                <div><i class="bi bi-people"></i> <strong>Workers:</strong> ${Number(e.completed_workers||0)} completed / ${Number(e.pending_workers||0)} pending / ${Number(e.rejected_workers||0)} rejected</div>
                <div><i class="bi bi-hourglass-split"></i> <strong>Unassigned:</strong> ${Number(e.remaining_workers??e.remaining_tasks_count??0)} slots</div>
                <div><i class="bi bi-cash-stack"></i> <strong>Paid:</strong> ${k(e.currency||"BDT")} ${Number(e.completed_amount||0).toFixed(2)} / <strong>Remaining:</strong> ${Number(e.remaining_amount||0).toFixed(2)}</div>
            </div>
        `),t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${k(e.title)}</strong>
                <span class="badge badge--${a?"warning":s?"danger":"success"}">${k(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${k(e.currency||"BDT")} ${Number(e.total_payable_amount||e.budget||0).toFixed(2)}</strong>
        </div>

        <p class="admin-job-row__description muted">${k(e.description||"")}</p>
        ${e.subtitle?`<p class="muted"><strong>Subtitle:</strong> ${k(e.subtitle)}</p>`:""}

        ${n}

        <div class="admin-job-row__meta">
            <span><strong>Customer:</strong> ${k(e.customer_name||e.poster?.name||"(deleted)")} (${k(e.customer_email||e.poster?.email||"")})</span>
            ${e.customer_phone?`<span><strong>Phone:</strong> ${k(e.customer_phone)}</span>`:""}
            <span><strong>Category:</strong> ${k(e.category_name||"Uncategorized")}</span>
            <span><strong>Workers Needed:</strong> ${Number(e.worker_count||1)}</span>
            <span><strong>Cost/Worker:</strong> ${k(e.currency||"BDT")} ${Number(e.cost_per_worker||0).toFixed(2)}</span>
            ${e.decline_reason?`<span style="color:#dc2626;"><strong>Decline Reason:</strong> ${k(e.decline_reason)}</span>`:""}
        </div>

        <div class="admin-job-row__footer">
            <span class="muted">Submitted: ${Fs(e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let r=t.querySelector(".admin-row__actions");return!a&&!s&&(r.appendChild(de("View Job Details","btn--ghost",()=>f(`/admin/jobs/${e.id}`))),r.appendChild(de("View Proofs & Screenshots","btn--ghost",()=>Rs(e.id,e.title)))),a?(r.appendChild(de("Activate Job","btn--success",()=>Ar(e.id))),r.appendChild(de("Decline","btn--danger",()=>qr(e.id)))):e.status==="disputed"?(r.appendChild(de("Release Payment","btn--success",()=>Hs(e.id,"release"))),r.appendChild(de("Cancel & Refund","btn--danger",()=>Hs(e.id,"cancel")))):["completed","cancelled","declined"].includes(e.status)||r.appendChild(de("Mark Disputed","btn--danger",()=>Nr(e.id))),t}function de(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function Rs(e,t){let a=document.getElementById("admin-proof-modal-container");if(!a)return;a.innerHTML=`
        <div class="modal-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999;">
            <div class="modal-card" style="background:#fff; width:90%; max-width:800px; max-height:85vh; border-radius:12px; padding:24px; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 style="margin:0; font-size:18px;"><i class="bi bi-file-earmark-check"></i> Proof Submissions for "${k(t)}"</h2>
                    <button class="btn btn--ghost btn--sm" id="close-proof-modal"><i class="bi bi-x-lg"></i> Close</button>
                </div>
                <div id="proof-modal-content"><div class="spinner"></div></div>
            </div>
        </div>
    `,a.querySelector("#close-proof-modal").addEventListener("click",()=>{a.innerHTML=""});let n=a.querySelector("#proof-modal-content");try{let o=((await c.adminJobSubmissions(e)).data||{}).submissions||[];if(!o.length){n.innerHTML='<p class="muted" style="text-align:center; padding:30px;">No worker submissions or proof screenshots submitted yet for this job.</p>';return}n.innerHTML=o.map(d=>{let p=d.work_proof_data||{},u=d.attachment_url||(d.attachment_path?d.attachment_path.startsWith("http")?d.attachment_path:`/storage/${d.attachment_path}`:null),b=u&&/\.(jpg|jpeg|png|gif|webp)$/i.test(u);return`
                <div class="card" style="margin-bottom:16px; padding:16px; border:1px solid #e2e8f0; border-radius:8px; background:#f9fafb;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div>
                            <strong><i class="bi bi-person"></i> ${k(d.worker_name)}</strong>
                            <span class="muted">(${k(d.worker_email||d.worker_username||"")})</span>
                        </div>
                        <span class="badge badge--${d.status==="approved"?"success":"warning"}">${k(d.status.toUpperCase())}</span>
                    </div>

                    ${d.description?`<p style="margin:8px 0; font-size:14px; background:#fff; padding:10px; border-radius:6px; border:1px solid #edf2f7;"><strong>Proof Description:</strong><br>${k(d.description)}</p>`:""}

                    ${d.external_link?`<div style="margin:8px 0;"><a href="${k(d.external_link)}" target="_blank" class="btn btn--ghost btn--sm"><i class="bi bi-box-arrow-up-right"></i> Open External Proof Link</a></div>`:""}

                    ${u?`
                        <div style="margin:10px 0;">
                            <strong>Proof Screenshot / Attachment:</strong><br>
                            ${b?`<a href="${k(u)}" target="_blank"><img src="${k(u)}" alt="Proof screenshot" style="max-width:100%; max-height:300px; border-radius:6px; border:1px solid #cbd5e1; margin-top:6px; object-fit:contain;"></a>`:`<a href="${k(u)}" target="_blank" class="btn btn--ghost btn--sm"><i class="bi bi-download"></i> Download Attachment</a>`}
                        </div>
                    `:""}

                    ${d.trx_id?`<div style="font-size:12px; color:#475569; margin-top:6px;"><strong>TrxID:</strong> ${k(d.trx_id)} | <strong>bKash:</strong> ${k(d.bkash_number||"N/A")}</div>`:""}

                    <div style="font-size:12px; color:#64748b; margin-top:8px;">Submitted on: ${Fs(d.created_at)}</div>
                </div>
            `}).join(""),n.querySelectorAll(".card").forEach((d,p)=>{let u=o[p];if(!u||u.status!=="pending_review")return;let b=document.createElement("div");b.style.cssText="display:flex; gap:8px; margin-top:12px;";let $=document.createElement("button");$.className="btn btn--success btn--sm",$.textContent="Approve for payment review",$.addEventListener("click",()=>js(u,e,t,$,w));let w=document.createElement("button");w.className="btn btn--danger btn--sm",w.textContent="Reject",w.addEventListener("click",()=>js(u,e,t,w,$)),b.append($,w),d.appendChild(b)})}catch(r){n.innerHTML=`<p class="muted">Failed to load submissions: ${k(r.message||"unknown error")}</p>`}}async function js(e,t,a,s,n){let r=s.textContent.startsWith("Approve")?"approve":"reject",i=r==="reject"?prompt("Rejection reason:"):prompt("Optional admin note:")||"";if(i!==null){if(r==="reject"&&!i.trim()){l("A rejection reason is required.","error");return}s.disabled=!0,n.disabled=!0;try{await c.adminReviewSubmission(e.id,{decision:r,note:i}),l(r==="approve"?"Submission approved for payment review.":"Submission rejected.","success"),await Rs(t,a)}catch(o){s.disabled=!1,n.disabled=!1,l(o.message||"Could not review submission.","error")}}}async function Ar(e){if(confirm("Approve and activate this job post?"))try{await c.adminApproveJob(e),l("Job approved and activated!","success"),await re()}catch(t){l(t.message||"Could not approve job.","error")}}async function qr(e){let t=prompt("Reason for declining this job post:");if(t!==null)try{await c.adminDeclineJob(e,{reason:t}),l("Job declined.","info"),await re()}catch(a){l(a.message||"Could not decline job.","error")}}async function Nr(e){if(confirm("Flag this job for admin dispute review?"))try{await c.adminFlagJobDispute(e),l("Job flagged for dispute review.","success"),await re()}catch(t){l(t.message||"Could not flag job.","error")}}async function Hs(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await c.adminResolveJob(e,{resolution:t,reason:s}),l(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await re()}catch(n){l(n.message||"Could not resolve dispute.","error")}}function Fs(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function k(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Cr,B,Le=y(()=>{_();h();Cr=[{value:"pending_approval",label:"Job Post (Pending Approval)"},{value:"open",label:"Active Job"},{value:"all",label:"All Jobs"},{value:"in_review",label:"In Review"},{value:"assigned",label:"Assigned"},{value:"submitted",label:"Submitted"},{value:"revision",label:"Revision"},{value:"disputed",label:"Disputed"},{value:"completed",label:"Completed"},{value:"declined",label:"Declined"},{value:"cancelled",label:"Cancelled"},{value:"expired",label:"Expired"}],B="pending_approval"});var Bs={};S(Bs,{AdminTransactionsPage:()=>ga});function ga(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${Pr.map(t=>`<option value="${t}" ${t===ba?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{ba=t.target.value,await ma()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",ma),await ma()}}}async function ma(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminTransactions({type:ba})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(Mr(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${Q(t.message||"unknown error")}</p>`}}}function Mr(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${Q(e.type)}`,t.innerHTML=`
        <div class="admin-transaction-row__header">
            <div>
                <strong>${Q(String(e.type||"").replace("_"," ").toUpperCase())}</strong>
                <span class="badge">#${Number(e.id||0)}</span>
            </div>
            <strong class="admin-row__amount">${Q(e.currency||"BDT")} ${Number(e.amount||0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${Q(e.user_name||"Platform")} ${e.user_email?`<span class="muted">(${Q(e.user_email)})</span>`:""}</span>
            <span><strong>Job:</strong> ${Q(e.job_title||(e.job_id?`#${e.job_id}`:"\u2014"))}</span>
            <span><strong>Date:</strong> ${jr(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${Q(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${Q(e.reference)}</code>`:""}
    `,t}function jr(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Q(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Pr,ba,va=y(()=>{_();h();Pr=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],ba=""});var Ds={};S(Ds,{AdminReportsPage:()=>fa});function fa(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row"><div><h1 class="page-title">Reports</h1><p class="muted">Aggregated transaction volume, assignment payments, submission risk, and marketplace job value.</p></div><button class="btn btn--ghost btn--sm" id="export-admin-report"><i class="bi bi-download"></i> Export CSV</button></div>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,e.querySelector("#export-admin-report")?.addEventListener("click",Hr),await Rr()}}}async function Hr(){try{let e=await c.adminReportsExport(),t=URL.createObjectURL(e),a=document.createElement("a");a.href=t,a.download="jmjob-report.csv",document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(t)}catch(e){alert(e.message||"Could not export the report.")}}async function Rr(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await c.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${tt("Transactions",be(s.transaction_count))}
                ${tt("Transaction volume",Ce(s.transaction_volume))}
                ${tt("Jobs",be(s.job_count))}
                ${tt("Job value",Ce(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${Fr(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${Br(a.jobs||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Assignments by payment state</h3>
                    <div class="admin-report-list">${Dr(a.assignments||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Submissions by risk</h3>
                    <div class="admin-report-list">${Ir(a.submissions||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${ee(t.message||"unknown error")}</p>`}}function tt(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${ee(e)}</span><strong>${ee(t)}</strong></div>`}function Fr(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ee(String(t.type||"").replace("_"," "))}</strong><small>${be(t.transaction_count)} entries</small></span>
            <strong>${Ce(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function Br(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ee(String(t.status||"").replace("_"," "))}</strong><small>${be(t.job_count)} jobs</small></span>
            <strong>${Ce(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function Dr(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ee(String(t.status||"").replace("_"," "))}</strong><small>${ee(String(t.payment_status||"").replace("_"," "))} \xB7 ${be(t.assignment_count)} assignments</small></span>
            <strong>${Ce(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No assignments yet.</p>'}function Ir(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${ee(String(t.status||"").replace("_"," "))}</strong><small>${ee(String(t.risk_status||"").replace("_"," "))}</small></span>
            <strong>${be(t.submission_count)}</strong>
        </div>
    `).join(""):'<p class="muted">No submissions yet.</p>'}function be(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function Ce(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function ee(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ha=y(()=>{_();h()});var Is={};S(Is,{LoginPage:()=>ya});function ya(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${Ur(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let n=new FormData(a),r=a.querySelector("button");r.disabled=!0,r.textContent="Logging in\u2026";try{let i=await za(n.get("email"),n.get("password"));l("Welcome back!","success"),i&&i.is_admin?f("/admin"):f("/")}catch(i){l(i.message||"Login failed","error"),r.disabled=!1,r.textContent="Log in"}})}function Ur(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var wa=y(()=>{h()});var Os={};S(Os,{RegisterPage:()=>$a});function $a(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",n=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your email</h1>','<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',_a(a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",n()}),e.querySelector("#register-otp-form").addEventListener("submit",i);return}let o=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+_a(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',o,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+_a(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",r)},r=async o=>{o.preventDefault();let d=o.currentTarget,p=new FormData(d),u=d.querySelector('button[type="submit"]');u.disabled=!0,u.textContent="Sending code\u2026",a={name:String(p.get("name")||"").trim(),email:String(p.get("email")||"").trim().toLowerCase(),password:String(p.get("password")||""),password_confirmation:String(p.get("password_confirmation")||""),referral_code:String(p.get("referral_code")||"")};try{await Ga(a),t="otp",l("Verification code sent. It expires in 15 minutes.","success"),n()}catch(b){l(Us(b)||"Could not send the verification code.","error"),u.disabled=!1,u.textContent="Send verification code"}},i=async o=>{o.preventDefault();let d=o.currentTarget,p=d.querySelector('button[type="submit"]');p.disabled=!0,p.textContent="Verifying\u2026";try{await Xa({email:a.email,otp:String(new FormData(d).get("otp")||"").trim()}),l("Account created \u2014 welcome!","success"),f("/")}catch(u){l(Us(u)||"Invalid or expired verification code.","error"),p.disabled=!1,p.textContent="Verify and create account"}};n()}}function Us(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function _a(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Sa=y(()=>{h()});var Js={};S(Js,{default:()=>at});async function at(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
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
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let n=t.email.value.trim();if(!n){l("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await c.forgotPassword({email:n}),l("If an account exists with this email, you will receive a reset code.","success"),f(`/reset-password?email=${encodeURIComponent(n)}`)}catch(r){l(r.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var ka=y(()=>{_();h()});var Ws={};S(Ws,{default:()=>st});async function st(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${Or(a)}" placeholder="you@example.com" required autocomplete="email">
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
    `;let s=document.getElementById("reset-form"),n=document.getElementById("submit-btn");s.addEventListener("submit",async r=>{r.preventDefault();let i=s.email.value.trim(),o=s.otp.value.trim(),d=s.password.value,p=s.password_confirmation.value;if(!i||!o||!d){l("Please fill in all fields.","error");return}if(o.length!==6){l("Please enter a valid 6-digit code.","error");return}if(d!==p){l("Passwords do not match.","error");return}if(d.length<6){l("Password must be at least 6 characters.","error");return}n.disabled=!0,n.textContent="Resetting...";try{await c.resetPassword({email:i,otp:o,password:d,password_confirmation:p}),l("Password reset successfully! You can now log in.","success"),f("/login")}catch(u){l(u.message||"Failed to reset password.","error"),n.disabled=!1,n.textContent="Reset Password"}})}function Or(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var xa=y(()=>{_();h()});var hn={};S(hn,{JobDetailPage:()=>Zi});function Zi(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=g.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await c.job(e),{job:n,bids:r,bid_count:i,my_bid:o}=s.data;Qi(n,r,i,o,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${z(s.message||"unknown")}</p>`}}}function Qi(e,t,a,s,n){let r=document.getElementById("job-detail-content");if(!r)return;let i=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,o=i?Math.max(0,Math.floor((i-Date.now())/1e3)):null,d=o!=null?ao(o):"\u2014",p=["open","in_review"].includes(e.status),u=!!s;r.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${z(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${z(e.title)}</h1>
                    ${e.subtitle?`<p class="muted">${z(e.subtitle)}</p>`:""}
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Pay <strong>\u09F3${parseFloat(e.cost_per_worker||e.budget||0).toFixed(2)}</strong> / worker</span>
                        <span><i class="bi bi-people"></i> ${Number(e.worker_count||1)} available</span>
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
                ${Array.isArray(e.proof_requirements)&&e.proof_requirements.length?`<h3>Proof required</h3><ul>${e.proof_requirements.map(b=>`<li>${z(b.title||(b.type==="screenshot"?"Screenshot":"Written report"))}</li>`).join("")}</ul>`:""}
                <h3>Posted by</h3>
                <p>${e.poster?z(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${eo(e,t,s,n,p)}
    `,to(e,s,n)}function eo(e,t,a,s,n){return a?`
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
        `:n?s?`
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
                    ${t.map(r=>`
                        <div class="bid-row">
                            <div>
                                <strong>\u09F3${parseFloat(r.amount).toFixed(2)}</strong> \xB7 ${r.delivery_days} days
                                <div class="muted">${z(r.proposal).slice(0,100)}${r.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${r.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function to(e,t,a){if(t){let n=document.getElementById("withdraw-bid-btn");n&&n.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await c.withdrawBid(t.id),l("Bid withdrawn.","success"),f(`/jobs/${e.id}`)}catch(r){l(r.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async n=>{n.preventDefault();let r=new FormData(s),i=document.getElementById("bid-submit-btn");i.disabled=!0,i.textContent="Submitting\u2026";try{await c.placeBid(e.id,{amount:parseFloat(r.get("amount")),delivery_days:parseInt(r.get("delivery_days"),10),proposal:String(r.get("proposal")||"").trim()}),l("Bid placed!","success"),f(`/jobs/${e.id}`)}catch(o){l(o.message||"Failed to place bid.","error")}finally{i.disabled=!1,i.textContent="Submit Bid"}})}function ao(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function z(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var yn=y(()=>{_();h()});var $n={};S($n,{PosterJobDetailPage:()=>so});function so(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!uo()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await wn(e)}}}async function wn(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await c.posterJobBids(e)).data||{};no(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${N(a.message||"unknown error")}</p>`}}function no(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${N(t.title)}</h1><p class="muted">${N(t.description||"")}</p></div><span class="badge badge--status badge--${N(t.status)}">${N(mo(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${_n(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${ro(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${io(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(n=>n.addEventListener("click",()=>oo(t.id,n.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(n=>n.addEventListener("click",()=>lo(t.id,n.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(n=>n.addEventListener("click",()=>co(t.id,n.dataset.revisionSubmission))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>po(t.id))}function ro(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${N(a.status)}"><div class="poster-bid-row__main"><strong>${N(a.worker?.name||"Worker")}</strong><span class="muted">${N(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${N(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${N(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function io(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${N(a.status)}"><div><strong>${N(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${_n(a.created_at)} \xB7 ${N(String(a.status||"").replace("_"," "))}</span><p>${N(a.description||"")}</p>${a.external_link?`<a href="${N(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${N(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&e.status==="submitted"?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}async function oo(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await c.posterAcceptBid(e,t),l("Worker selected and escrow held.","success"),await Na(e)}catch(a){l(a.message||"Could not select worker.","error")}}async function lo(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await c.posterReleasePayment(e,{submission_id:Number(t)}),l("Payment released.","success"),await Na(e)}catch(a){l(a.message||"Could not release payment.","error")}}async function co(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await c.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),l("Revision requested.","success"),await Na(e)}catch(s){l(s.message||"Could not request revision.","error")}}async function po(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await c.posterCancelJob(e,{reason:"Cancelled by poster"}),l("Job cancelled.","success"),f("/poster/jobs")}catch(t){l(t.message||"Could not cancel job.","error")}}async function Na(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await wn(e))}function uo(){return!!g.get()}function mo(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function _n(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function N(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Sn=y(()=>{_();h()});D();h();D();h();var nt=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Lt(),Ka))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Be(),Ct))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Be(),Ct))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(At(),Qa))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Nt(),ts))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Mt(),as))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ht(),rs))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ue(),Ft))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Bt(),is))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Dt(),os))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(It(),ds))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Wt(),vs))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(zt(),hs))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Ue(),Ft))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Gt(),ys))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Kt(),$s))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ea(),xs))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(aa(),Ls))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ra(),Cs))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(da(),qs))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(pa(),Ms))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Le(),et))},{path:"/admin/pending-jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Le(),et))},{path:"/admin/active-jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Le(),et))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(va(),Bs))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(ha(),Ds))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(wa(),Is))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Sa(),Os))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(ka(),Js))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(xa(),Ws))}],vl=E(()=>{let e=q.get().split("?")[0]||"/";return nt.find(t=>t.path===e)||nt[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";q.set(e)});D();h();D();var Jr=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Wr=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/pending-jobs",label:"Job Post",icon:"bi-file-earmark-plus"},{path:"/admin/admin-job-post",label:"Admin Job Post",icon:"bi-plus-square"},{path:"/admin/active-jobs",label:"Active Job",icon:"bi-lightning-charge"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],Vr=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function zr(){let e=g.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...Wr];let t=[...Jr];return e&&(e.is_admin||e.role==="poster")&&t.push({separator:!0},...Vr),t}var Vs="sidebar_collapsed",ge=R(localStorage.getItem(Vs)==="true");function Gr(){let e=!ge.get();ge.set(e),localStorage.setItem(Vs,String(e))}function zs(){let e=()=>q.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${ge.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar"},children:[Xr(),Yr(),Kr()]}}function Xr(){let e=()=>q.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]}]}}function Yr(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>Gr(),title:()=>ge.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${ge.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function Kr(){return{tag:"nav",props:{class:"sidebar__nav"},children:zr().map(e=>e.header?Zr(e.header):e.separator?Qr():ei(e))}}function Zr(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function Qr(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function ei({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${q.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>ge.get()?t:"",onclick:n=>{n.preventDefault(),f(e),Xs()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function Gs(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Xs()},children:[]}}function Xs(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active")}h();D();h();var ti=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],ai=[{path:"/admin",label:"Admin Panel",icon:"bi-shield-lock"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Oversight",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Transactions",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Settings",icon:"bi-sliders"}],si=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function ni(){let e=g.get();if(e&&e.is_admin)return ai;let t=[...ti];return e&&t.push({separator:!0},...si),t}function ri({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${q.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:n=>{n.preventDefault(),f(e),Ta()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function ii(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>Ta()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function oi(){return{tag:"nav",props:{class:"mobile-nav__list"},children:ni().map(e=>e.separator?di():ri(e))}}function di(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Ys(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[ii(),oi()]}}function Ks(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>Ta()},children:[]}}function Zs(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function Ta(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}Jt();_();function Qs(){return O(()=>P.get(),()=>gi(),()=>bi())}function en(){let e=()=>{let t=I.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>cs(),"data-theme":()=>I.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function li(){let e=document.getElementById("topbar-notifications-panel");if(!e)return;let t=e.classList.contains("topbar-notifications--open");document.querySelectorAll(".topbar-notifications--open").forEach(a=>a.classList.remove("topbar-notifications--open")),t||e.classList.add("topbar-notifications--open")}function ci(){return setTimeout(pi,0),{tag:"div",props:{class:"topbar__notifications-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__notifications","aria-label":"Notifications",onclick:e=>{e.stopPropagation(),li()}},children:[{tag:"i",props:{class:"bi bi-bell"},children:[]},{tag:"span",props:{class:"topbar__notification-badge",id:"topbar-notification-badge","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-notifications",id:"topbar-notifications-panel"},children:[{tag:"div",props:{class:"topbar-notifications__header"},children:[{tag:"strong",props:{},children:["Notifications"]},{tag:"button",props:{class:"topbar-notifications__close","aria-label":"Close",onclick:()=>{let e=document.getElementById("topbar-notifications-panel");e&&e.classList.remove("topbar-notifications--open")}},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]},{tag:"ul",props:{class:"topbar-notifications__list",id:"topbar-notifications-list"},children:[mi("Loading notifications\u2026","Your latest updates will appear here.","bi-hourglass-split","info")]},{tag:"div",props:{class:"topbar-notifications__footer"},children:[{tag:"a",props:{href:"#/notifications",class:"topbar-notifications__link"},children:["View all notifications"]}]}]}]}}async function pi(){let e=document.getElementById("topbar-notifications-list"),t=document.getElementById("topbar-notification-badge");if(!(!e||!t))try{let a=await c.notifications({limit:5}),s=Array.isArray(a.data)?a.data:[],n=Number(a.meta?.unread_count||s.filter(r=>!r.read).length||0);t.textContent=n>99?"99+":String(n),e.innerHTML=s.length?s.map(ui).join(""):'<li class="topbar-notifications__empty">No notifications yet.</li>',e.querySelectorAll("[data-notification-id]").forEach(r=>{r.addEventListener("click",async()=>{let i=r.getAttribute("data-notification-id");if(!(!i||r.getAttribute("data-read")==="1"))try{await c.notificationRead(i),r.setAttribute("data-read","1"),r.classList.remove("topbar-notification--unread");let o=Math.max(0,Number(t.textContent.replace("+",""))-1);t.textContent=String(o)}catch{}})})}catch{e.innerHTML='<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>',t.textContent="0"}}function ui(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",n=typeof t.action_url=="string"&&t.action_url.startsWith("/")?` href="#${rt(t.action_url)}"`:"";return`<li class="topbar-notification topbar-notification--${a} ${e.read?"":"topbar-notification--unread"}" data-notification-id="${rt(e.id)}" data-read="${e.read?"1":"0"}"><i class="bi ${s} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${rt(t.title||"Notification")}</div><div class="topbar-notification__text">${rt(t.message||"")}</div>${n?`<a class="topbar-notification__action"${n}>Open</a>`:""}</div></li>`}function rt(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function mi(e,t,a,s){return{tag:"li",props:{class:`topbar-notification topbar-notification--${s}`},children:[{tag:"i",props:{class:`bi ${a} topbar-notification__icon`},children:[]},{tag:"div",props:{class:"topbar-notification__body"},children:[{tag:"div",props:{class:"topbar-notification__title"},children:[e]},{tag:"div",props:{class:"topbar-notification__text"},children:[t]}]}]}}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-notifications-panel");t&&t.classList.contains("topbar-notifications--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__notifications")&&t.classList.remove("topbar-notifications--open")});function bi(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[en(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function gi(){let e=g.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>Zs(),"aria-label":"Open menu"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[en(),ci(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await Re(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}h();D();function tn(){return O(()=>!!he.get(),()=>{let e=he.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}_();function an(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{c.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let n=[];a.facebook&&n.push(`<a href="${it(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&n.push(`<a href="${it(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&n.push(`<a href="${it(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&n.push(`<a href="${it(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=n.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function it(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}h();var vi=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/profile",label:"Account",icon:"bi-person-circle"}],fi=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"}];function hi(){let e=g.get();return e&&e.is_admin?fi:vi}function yi({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${q.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:n=>{n.preventDefault(),f(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function wi(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function _i(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:hi().map(e=>e.separator?wi():yi(e))}}function La(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&La()},!0),window.addEventListener("resize",()=>setTimeout(La,50)),document.addEventListener("hnav:rendered",()=>setTimeout(La,0)));function sn(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[_i()]}}function nn(){let e=()=>!!g.get()?.is_admin,t=()=>q.get().startsWith("/admin"),a=()=>P.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[O(()=>P.get(),()=>zs(),()=>null),O(()=>P.get(),()=>Gs(),()=>null),O(()=>P.get(),()=>Ys(),()=>null),O(()=>P.get(),()=>Ks(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[Qs(),O(()=>P.get()&&!e(),()=>sn(),()=>null),{tag:"main",props:{class:"app-main"},children:[$i()]},an()]},tn()]}}function $i(){let t=q.get().split("?")[0]||"/",a=nt.find(n=>n.path===t),s=g.get();return s&&s.is_admin&&!t.startsWith("/admin")?(f("/admin"),Ca()):a?a.requireAuth&&!P.get()?(f("/login"),Ca()):a.requireAdmin&&(!g.get()||!g.get().is_admin)?xi():!a.requireAuth&&P.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(f("/"),Ca()):Si(a):ki()}function Si(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function ki(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function xi(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>f("/")},children:["Go home"]}]}}function Ca(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}D();h();Lt();wa();Sa();ka();xa();Nt();Be();At();Gt();Mt();Ue();da();pa();Ht();Bt();Dt();It();Wt();_();h();var v={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function on(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
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
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${U(v.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${rn()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="\u09F30" value="${U(v.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${U(v.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${v.sort==="latest"?"selected":""}>Newest first</option>
                            <option value="budget_low" ${v.sort==="budget_low"?"selected":""}>Lowest budget</option>
                            <option value="budget_high" ${v.sort==="budget_high"?"selected":""}>Highest budget</option>
                            <option value="closing" ${v.sort==="closing"?"selected":""}>Closing soon</option>
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
        `,v.categories.length===0)try{let t=await c.categories();v.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=rn())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{Ti(),v.page=1,ot()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{v.search="",v.categoryId="",v.minBudget="",v.maxBudget="",v.sort="latest",v.page=1,Li(),ot()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await ot()}}}function rn(){return'<option value="">All categories</option>'+v.categories.map(e=>`<option value="${U(e.id)}" ${String(e.id)===String(v.categoryId)?"selected":""}>${U(e.name)}</option>`).join("")}function Ti(){v.search=document.getElementById("jobs-search")?.value.trim()||"",v.categoryId=document.getElementById("jobs-category")?.value||"",v.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",v.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",v.sort=document.getElementById("jobs-sort")?.value||"latest"}function Li(){let e={"jobs-search":v.search,"jobs-category":v.categoryId,"jobs-min-budget":v.minBudget,"jobs-max-budget":v.maxBudget,"jobs-sort":v.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function ot(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++v.requestSerial;v.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:v.page,per_page:v.perPage,sort:v.sort};v.search&&(a.search=v.search),v.categoryId&&(a.category_id=v.categoryId),v.minBudget!==""&&(a.min_budget=v.minBudget),v.maxBudget!==""&&(a.max_budget=v.maxBudget);let s=await c.jobs(a);if(t!==v.requestSerial)return;v.jobs=Array.isArray(s.data)?s.data:[],v.total=Number(s.meta?.total||0),v.lastPage=Math.max(1,Number(s.meta?.last_page||1)),Ci()}catch(a){if(t!==v.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${U(a.message||"unknown error")}</p>`,dn(),ln()}finally{t===v.requestSerial&&(v.loading=!1)}}function Ci(){let e=document.getElementById("jobs-grid");if(e){if(dn(),ln(),v.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=v.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${U(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${Ei(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${U(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${U(t.title)}</h3>
            ${t.subtitle?`<p class="job-card__subtitle muted">${U(t.subtitle)}</p>`:""}
            <p class="job-card__desc">${U(Ai(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.cost_per_worker||t.budget||0).toFixed(2)} / worker</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.worker_count||1)} available</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function dn(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(v.total===0){e.textContent="No open jobs found";return}let t=(v.page-1)*v.perPage+1,a=Math.min(v.page*v.perPage,v.total);e.textContent=`Showing ${t}-${a} of ${v.total} open jobs`}function ln(){let e=document.getElementById("jobs-pagination");if(e){if(v.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${v.page-1}" ${v.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${v.page} of ${v.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${v.page+1}" ${v.page>=v.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>v.lastPage||a===v.page||(v.page=a,ot())})})}}function Ei(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function Ai(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function U(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}_();h();var Ea={bids:[],loading:!1};function cn(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await c.workerBids();Ea.bids=t.data||[],qi()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${pn(t.message||"unknown")}</p>`}}}}function qi(){let e=document.getElementById("bids-list");if(e){if(Ea.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=Ea.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${pn(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${Ni(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),f(`/jobs/${t.getAttribute("data-id")}`)})})}}function Ni(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function pn(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}_();h();var Ee={jobs:[],submissions:[],loading:!1};function dt(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([c.workerActiveJobs(),c.workerSubmissions()]);Ee.jobs=t.data||[],Ee.submissions=a.data||[],Pi()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${Ae(t.message||"unknown")}</p>`}}}}function Pi(){let e=document.getElementById("active-jobs-list");if(e){if(Ee.jobs.length===0){e.innerHTML=`<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;return}e.innerHTML=Ee.jobs.map(t=>{let a=Ee.submissions.find(n=>n.job_id===t.id),s=t.status;return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${Ae(t.title)}</h3>
                        ${t.subtitle?`<div class="muted">${Ae(t.subtitle)}</div>`:""}
                        <div class="muted">Pay: \u09F3${parseFloat(t.cost_per_worker||t.budget||0).toFixed(2)} \xB7 Deadline: ${Ae(t.deadline_at||"None")}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                ${a?Mi(t,a):ji(t)}
                ${!a&&t.assignment_id?`<div class="active-job-card__actions"><button type="button" class="btn btn--ghost btn--sm" data-cancel-assignment="${t.assignment_id}">Request cancellation</button><small class="muted">Available before submitting work.</small></div>`:""}
            </div>
        `}).join(""),Hi()}}function Mi(e,t){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${Ri(t.created_at)}
            <div class="muted">${Ae((t.description||"").slice(0,200))}${(t.description||"").length>200?"\u2026":""}</div>
            ${t.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${t.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Please re-submit below.</p>':""}
            ${t.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function ji(e){let t=Array.isArray(e.proof_requirements)&&e.proof_requirements.some(a=>a&&a.type==="screenshot");return`
        <form class="submit-form" data-job-id="${e.id}">
            <label class="submit-form__label">
                What did you deliver? (description)
                <textarea name="description" rows="3" required placeholder="Summarize what you delivered\u2026"></textarea>
            </label>
            <label class="submit-form__label">
                External link (optional \u2014 Google Drive, GitHub, Figma, etc.)
                <input name="external_link" type="url" placeholder="https://\u2026">
            </label>
            <label class="submit-form__label">
                Screenshot proof ${t?"(required)":"(optional)"}
                <input name="screenshot" type="file" accept="image/jpeg,image/png,image/gif,image/webp" ${t?"required":""}>
                <small class="muted">JPG, PNG, GIF, or WEBP; maximum 10 MB.</small>
            </label>
            <button type="submit" class="btn btn--success btn--xl" data-submit-btn>
                <i class="bi bi-send"></i> Submit Work
            </button>
        </form>
    `}function Hi(){document.querySelectorAll("form.submit-form").forEach(e=>{e.addEventListener("submit",async t=>{t.preventDefault();let a=parseInt(e.getAttribute("data-job-id"),10),s=new FormData(e),n=e.querySelector("[data-submit-btn]");n.disabled=!0,n.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{let r=new FormData;r.append("description",String(s.get("description")||"").trim()),r.append("external_link",String(s.get("external_link")||"").trim());let i=s.get("screenshot");i instanceof File&&i.size>0&&r.append("screenshot",i),await c.submitWork(a,r),l("Work submitted!","success"),dt()()}catch(r){l(r.message||"Failed to submit.","error")}finally{n.disabled=!1,n.innerHTML='<i class="bi bi-send"></i> Submit Work'}})}),document.querySelectorAll("[data-cancel-assignment]").forEach(e=>{e.addEventListener("click",async()=>{let t=prompt("Why do you need to cancel this assignment?");if(!(!t||!t.trim())){e.disabled=!0;try{await c.workerCancelAssignment(e.dataset.cancelAssignment,{reason:t.trim()}),l("Assignment cancelled and returned for reassignment.","success"),dt()()}catch(a){l(a.message||"Could not cancel assignment.","error"),e.disabled=!1}}})})}function Ri(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Ae(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}_();h();var j={activeTab:"categories",categories:[],subcategories:[],loading:!1};function un(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Categories & Subcategories</h1>
            <p class="muted">Manage main categories, subcategories, and minimum cost limits.</p>
            
            <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button class="btn ${state.activeTab==="categories"?"btn--primary":"btn--ghost"}" id="tab-cats-btn">Main Categories</button>
                <button class="btn ${state.activeTab==="subcategories"?"btn--primary":"btn--ghost"}" id="tab-subcats-btn">Subcategories</button>
            </div>

            <div id="tab-content">
                <div class="card" id="cat-list"><div class="spinner"></div></div>
            </div>
        `,e.querySelector("#tab-cats-btn").addEventListener("click",()=>{j.activeTab="categories",Aa(e)}),e.querySelector("#tab-subcats-btn").addEventListener("click",()=>{j.activeTab="subcategories",Aa(e)}),await ae(e)}}async function ae(e){try{let[t,a]=await Promise.all([c.adminCategories(),c.adminSubcategories()]);j.categories=t.data||[],j.subcategories=a.data||[],Aa(e)}catch(t){l(t.message||"Failed to load category data.","error")}}function Aa(e){let t=e.querySelector("#tab-cats-btn"),a=e.querySelector("#tab-subcats-btn"),s=e.querySelector("#tab-content");s&&(j.activeTab==="categories"?(t&&(t.className="btn btn--primary"),a&&(a.className="btn btn--ghost"),Fi(s,e)):(t&&(t.className="btn btn--ghost"),a&&(a.className="btn btn--primary"),Bi(s,e)))}function Fi(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Main Categories List</h3>
            ${j.categories.length===0?'<p class="muted">No categories yet.</p>':`
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
                            ${j.categories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${te(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;" class="muted">/${te(s.slug)}</td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${te(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${te(s.updated_at||"-")}</td>
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
    `,e.querySelectorAll(".edit-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id"),r=j.categories.find(d=>String(d.id)===String(n));if(!r)return;let i=prompt(`Update Min Cost (\u09F3) for Main Category "${r.name}":`,String(r.min_cost||1));if(i===null)return;let o=parseFloat(i);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await c.adminUpdateCategory(n,{min_cost:o}),l(`Min cost updated for ${r.name}.`,"success"),await ae(t)}catch(d){l(d.message,"error")}})}),e.querySelectorAll(".toggle-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id"),r=j.categories.find(i=>String(i.id)===String(n));if(r)try{await c.adminUpdateCategory(n,{is_active:!r.is_active}),l("Category updated.","success"),await ae(t)}catch(i){l(i.message,"error")}})}),e.querySelectorAll(".del-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id");if(confirm("Delete category?"))try{let r=await c.adminDeleteCategory(n);l(r.message||"Deleted.","success"),await ae(t)}catch(r){l(r.message,"error")}})});let a=e.querySelector("#add-cat-form");a.addEventListener("submit",async s=>{s.preventDefault();let n=new FormData(a),r={name:String(n.get("name")||"").trim(),slug:String(n.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(n.get("min_cost")||"1.00"),display_order:parseInt(n.get("display_order")||"0",10),description:String(n.get("description")||"").trim()||null,is_active:n.get("is_active")==="on"};try{await c.adminCreateCategory(r),l("Main Category created.","success"),await ae(t)}catch(i){l(i.message,"error")}})}function Bi(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Subcategories List</h3>
            ${j.subcategories.length===0?'<p class="muted">No subcategories yet.</p>':`
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
                            ${j.subcategories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${te(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;"><span class="badge" style="background:#e0e7ff; color:#3730a3;">${te(s.category_name||"-")}</span></td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${te(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${te(s.updated_at||"-")}</td>
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
                        ${j.categories.map(s=>`
                            <option value="${s.id}">${te(s.name)}</option>
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
    `,e.querySelectorAll(".edit-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id"),r=j.subcategories.find(d=>String(d.id)===String(n));if(!r)return;let i=prompt(`Update Min Cost (\u09F3) for Subcategory "${r.name}":`,String(r.min_cost||1));if(i===null)return;let o=parseFloat(i);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await c.adminUpdateSubcategory(n,{min_cost:o}),l(`Min cost updated for ${r.name}.`,"success"),await ae(t)}catch(d){l(d.message,"error")}})}),e.querySelectorAll(".toggle-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id"),r=j.subcategories.find(i=>String(i.id)===String(n));if(r)try{await c.adminUpdateSubcategory(n,{is_active:!r.is_active}),l("Subcategory updated.","success"),await ae(t)}catch(i){l(i.message,"error")}})}),e.querySelectorAll(".del-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.getAttribute("data-id");if(confirm("Delete subcategory?"))try{let r=await c.adminDeleteSubcategory(n);l(r.message||"Deleted.","success"),await ae(t)}catch(r){l(r.message,"error")}})});let a=e.querySelector("#add-subcat-form");a.addEventListener("submit",async s=>{s.preventDefault();let n=new FormData(a),r={category_id:parseInt(n.get("category_id")||"0",10),name:String(n.get("name")||"").trim(),slug:String(n.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(n.get("min_cost")||"1.00"),display_order:parseInt(n.get("display_order")||"0",10),is_active:n.get("is_active")==="on"};try{await c.adminCreateSubcategory(r),l("Subcategory created.","success"),await ae(t)}catch(i){l(i.message,"error")}})}function te(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}_();h();var se={grouped:{},social:{},noticesData:{interval:4,notices:[]},loading:!1};function mn(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=g.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await bn()}}async function bn(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a,s]=await Promise.all([c.adminSettings(),c.socialLinks(),c.notices()]);se.grouped=t.data||{},se.social=a||{},se.noticesData=s||{interval:4,notices:[]},Di()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${H(t.message||"unknown")}</p>`}}}function Di(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(se.grouped).map(i=>`
        <div class="card settings-group">
            <h3 class="card__title">${H(i.charAt(0).toUpperCase()+i.slice(1))}</h3>
            <div class="settings-group__rows">
                ${se.grouped[i].map(o=>Ui(i,o)).join("")}
            </div>
        </div>
    `).join(""),s=se.noticesData,n=[];Array.isArray(s.notices)&&s.notices.length&&(n=s.notices.map(i=>typeof i=="string"?i.startsWith("/")||i.startsWith("http")?{image:i,text:""}:{image:"",text:i}:{image:i.image||"",text:i.text||""})),n.length||(n=[{image:"",text:""}]),a+=`
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
                        ${n.map((i,o)=>gn(o+1,i)).join("")}
                    </div>
                    <div style="margin-top: 12px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Banner Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;let r=se.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${H(r.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${H(r.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${H(r.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${H(r.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",Oi),document.getElementById("add-notice-btn").addEventListener("click",Ii),qa()}function gn(e,t={image:"",text:""}){let a=typeof t=="string"?t.startsWith("/")||t.startsWith("http")?t:"":t?.image||"",s=typeof t=="string"?!t.startsWith("/")&&!t.startsWith("http")?t:"":t?.text||"",n="";return a?n=`<div class="banner-preview"><img src="${H(a)}" alt="Banner preview"></div>`:s?n=`<div class="banner-preview banner-preview--text"><strong>Text Notice:</strong> <span>${H(s)}</span></div>`:n='<div class="banner-preview banner-preview--empty"><i class="bi bi-image muted"></i> No image uploaded</div>',`
        <div class="banner-message-row card">
            <div class="banner-message-row__header">
                <span class="banner-message-num">Banner ${e}</span>
                <button type="button" class="btn btn--danger btn--sm remove-notice-btn" title="Remove banner">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            <div class="banner-message-row__fields">
                <div class="banner-field banner-field--full">
                    ${n}
                    <input type="hidden" class="notice-msg-image" value="${H(a)}">
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
    `}function Ii(){let e=document.getElementById("notice-messages-container");if(!e)return;let t=e.querySelectorAll(".banner-message-row").length+1,a=document.createElement("div");a.innerHTML=gn(t,{image:""});let s=a.firstElementChild;e.appendChild(s),qa()}function qa(){let e=document.getElementById("notice-messages-container");if(!e)return;e.querySelectorAll(".banner-message-row").forEach((a,s)=>{let n=a.querySelector(".banner-message-num");n&&(n.textContent=`Banner ${s+1}`);let r=a.querySelector(".banner-file-input"),i=a.querySelector(".notice-msg-image"),o=a.querySelector(".banner-preview"),d=a.querySelector(".banner-upload-status"),p=a.querySelector(".banner-upload-btn");r&&!r.dataset.wired&&(r.dataset.wired="true",r.addEventListener("change",async b=>{let $=b.target.files[0];if($){d&&(d.textContent="Uploading\u2026");try{let w=new FormData;w.append("image",$);let C=await c.adminUploadBannerImage(w);C&&C.url&&(i.value=C.url,o.className="banner-preview",o.innerHTML=`<img src="${H(C.url)}" alt="Banner preview">`,d&&(d.textContent="Uploaded!"))}catch(w){d&&(d.textContent=w.message||"Upload failed."),l(w.message||"Failed to upload image.","error")}}}));let u=a.querySelector(".remove-notice-btn");u&&(u.onclick=()=>{a.remove(),qa()})})}function Ui(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s;switch(t.value_type){case"boolean":s=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":s=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":s=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":s=`<textarea id="${a}" rows="3" class="settings-row__input">${H(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:s=`<input type="text" id="${a}" value="${H(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${H(t.key)}</strong>
                <span class="muted">${H(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${s}</div>
        </div>
    `}async function Oi(){let e={};for(let i of Object.keys(se.grouped))for(let o of se.grouped[i]){let d=`set-${o.key.replace(/[^a-z0-9]/gi,"_")}`,p=document.getElementById(d);if(!p)continue;let u;o.value_type==="boolean"?u=p.checked:o.value_type==="integer"||o.value_type==="percent"?u=parseInt(p.value,10):o.value_type==="decimal"?u=parseFloat(p.value):o.value_type==="json"?u=p.value?JSON.parse(p.value):null:u=p.value,e[o.key]=u}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},s=Array.from(document.querySelectorAll(".banner-message-row")).map(i=>({image:i.querySelector(".notice-msg-image")?.value.trim()||""})).filter(i=>i.image!==""),n={interval:document.getElementById("notice-interval")?.value||4,direction:document.getElementById("notice-direction")?.value||"right_to_left",notices:s},r=document.getElementById("settings-save-btn");r.disabled=!0,r.textContent="Saving\u2026";try{await Promise.all([c.adminUpdateSettings(e),c.adminUpdateSocialLinks(t),c.adminUpdateNotices(n)]),l("Settings, notices, and social links saved successfully.","success"),await bn()}catch(i){l(i.message||"Failed to save.","error")}finally{r.disabled=!1,r.textContent="Save All Changes"}}function H(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Le();_();h();function vn(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.className="view view--admin-job-post",!g.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p></div>';return}let t=new URLSearchParams(window.location.hash.split("?")[1]||""),a=Number(t.get("edit")||0);e.innerHTML='<div class="card"><p class="muted">Loading job form\u2026</p></div>';try{let s=await c.categories(),n=a?(await c.adminJobDetail(a)).data:null;Ji(e,s.data||[],n?.job||null,a)}catch(s){e.innerHTML=`<div class="card"><p class="muted">Could not load job form: ${V(s.message||"unknown error")}</p></div>`}}}function Ji(e,t,a,s){let n=a?.proof_requirements||[],r=n.some(o=>o.type==="screenshot"),i=n.some(o=>o.type==="text");e.innerHTML=`
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title">${s?"Edit Job":"Admin Job Post"}</h1><p class="muted">Create or maintain a job using the same worker assignment and payment workflow as customer posts.</p></div></div>
        <form class="card admin-job-form" id="admin-job-form">
            <div class="poster-form__grid">
                <label>Category
                    <select name="category_id" required><option value="">Choose category\u2026</option>${t.map(o=>`<option value="${o.id}" ${Number(o.id)===Number(a?.category_id)?"selected":""}>${V(o.name)}</option>`).join("")}</select>
                </label>
                <label>Subtitle
                    <input name="subtitle" maxlength="255" value="${V(a?.subtitle||"")}" placeholder="Short job-card summary">
                </label>
            </div>
            <label>Job title <input name="title" maxlength="160" required value="${V(a?.title||"")}"></label>
            <label>Customer name <input name="customer_name" maxlength="160" value="${V(a?.customer_name||"")}"></label>
            <div class="poster-form__grid">
                <label>Customer phone <input name="customer_phone" maxlength="32" value="${V(a?.customer_phone||"")}"></label>
                <label>Customer email <input name="customer_email" type="email" maxlength="190" value="${V(a?.customer_email||"")}"></label>
            </div>
            <label>Job details / instructions <textarea name="description" rows="7" required>${V(a?.description||"")}</textarea></label>
            <label>Customer requirements <textarea name="requirements" rows="4">${V(a?.requirements||"")}</textarea></label>
            <div class="poster-form__grid">
                <label>Workers required <input name="worker_count" type="number" min="1" value="${Number(a?.worker_count||1)}" required></label>
                <label>Payment per worker <input name="cost_per_worker" type="number" min="0.01" step="0.0001" value="${Number(a?.cost_per_worker||0)}" required></label>
            </div>
            <label>Deadline <input name="deadline_at" type="datetime-local" value="${Wi(a?.deadline_at)}"></label>
            <div class="admin-job-proof-options">
                <label><input name="requires_screenshot" type="checkbox" ${r?"checked":""}> Screenshot proof required</label>
                <label><input name="requires_written" type="checkbox" ${i?"checked":""}> Written report required</label>
            </div>
            <label>Admin notes <textarea name="admin_notes" rows="3">${V(a?.admin_notes||"")}</textarea></label>
            <label><input name="publish" type="checkbox" ${!a||a.status==="open"?"checked":""}> Publish / activate immediately</label>
            <div class="poster-form__actions"><button class="btn btn--ghost" type="button" id="admin-job-cancel">Cancel</button><button class="btn btn--primary" type="submit">${s?"Save changes":"Create job"}</button></div>
        </form>
    `,e.querySelector("#admin-job-cancel").addEventListener("click",()=>f("/admin/jobs")),e.querySelector("#admin-job-form").addEventListener("submit",async o=>{o.preventDefault();let d=o.currentTarget,p=new FormData(d),u=[];p.get("requires_screenshot")&&u.push({title:"Screenshot proof",type:"screenshot"}),p.get("requires_written")&&u.push({title:"Written report",type:"text"});let b={category_id:Number(p.get("category_id")),title:String(p.get("title")||"").trim(),subtitle:String(p.get("subtitle")||"").trim(),customer_name:String(p.get("customer_name")||"").trim(),customer_phone:String(p.get("customer_phone")||"").trim(),customer_email:String(p.get("customer_email")||"").trim(),description:String(p.get("description")||"").trim(),requirements:String(p.get("requirements")||"").trim(),worker_count:Number(p.get("worker_count")),cost_per_worker:Number(p.get("cost_per_worker")),deadline_at:Vi(String(p.get("deadline_at")||"")),proof_requirements:u,admin_notes:String(p.get("admin_notes")||"").trim(),publish:!!p.get("publish")},$=d.querySelector('[type="submit"]');$.disabled=!0;try{let w=s?await c.adminUpdateJob(s,b):await c.adminCreateJob(b);l(w.message||"Job saved.","success"),f(s?`/admin/jobs/${s}`:"/admin/jobs")}catch(w){l(w.message||"Could not save job.","error"),$.disabled=!1}})}function Wi(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");if(Number.isNaN(t.getTime()))return"";let a=s=>String(s).padStart(2,"0");return`${t.getFullYear()}-${a(t.getMonth()+1)}-${a(t.getDate())}T${a(t.getHours())}:${a(t.getMinutes())}`}function Vi(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function V(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}_();h();function fn(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.className="view view--admin-job-detail",!g.get()?.is_admin){t.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p></div>';return}t.innerHTML='<div class="card"><p class="muted">Loading job detail\u2026</p></div>',await lt(t,e)}}}async function lt(e,t){try{let a=await c.adminJobDetail(t);zi(e,a.data||{},t)}catch(a){e.innerHTML=`<div class="card"><p class="muted">Could not load job: ${x(a.message||"unknown error")}</p></div>`}}function zi(e,t,a){let s=t.job||{},n=t.progress||{},r=t.assignments||[],i=t.bids||[],o=t.submissions||[];e.innerHTML=`
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title">${x(s.title)}</h1><p class="muted">${x(s.subtitle||"")}</p></div><div class="admin-row__actions"><button class="btn btn--ghost btn--sm" id="edit-job">Edit job</button>${Ki(s,r)?'<button class="btn btn--danger btn--sm" id="delete-job">Delete job</button>':""}</div></div>
        <div class="card"><div class="admin-job-row__meta"><span><strong>Customer:</strong> ${x(s.customer_name||"\u2014")}</span><span><strong>Phone:</strong> ${x(s.customer_phone||"\u2014")}</span><span><strong>Email:</strong> ${x(s.customer_email||"\u2014")}</span><span><strong>Status:</strong> ${x(String(s.status||"").replace("_"," ").toUpperCase())}</span></div><p>${x(s.description||"").replace(/\n/g,"<br>")}</p>${s.requirements?`<p><strong>Requirements:</strong><br>${x(s.requirements).replace(/\n/g,"<br>")}</p>`:""}</div>
        <div class="stat-grid"><div class="stat-tile"><span class="muted">Total workers</span><strong>${Number(n.total_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Completed</span><strong>${Number(n.completed_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Pending</span><strong>${Number(n.pending_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Rejected</span><strong>${Number(n.rejected_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Remaining</span><strong>${Number(n.remaining_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Remaining amount</span><strong>${Number(n.remaining_amount||0).toFixed(2)}</strong></div></div>
        <div class="card"><h2 class="card__title">Worker assignments</h2><div class="admin-list">${r.length?r.map(d=>Gi(d,i)).join(""):'<p class="muted">No assignments yet.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Pending worker bids</h2><div class="admin-list">${i.filter(d=>d.status==="pending").length?i.filter(d=>d.status==="pending").map(Xi).join(""):'<p class="muted">No pending bids.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Submissions</h2><div class="admin-list" id="admin-detail-submissions">${o.length?o.map(Yi).join(""):'<p class="muted">No submissions yet.</p>'}</div></div>
    `,e.querySelector("#edit-job")?.addEventListener("click",()=>f(`/admin/admin-job-post?edit=${a}`)),e.querySelector("#delete-job")?.addEventListener("click",async()=>{if(confirm("Delete this job and its unassigned bids?"))try{await c.adminDeleteJob(a),l("Job deleted.","success"),f("/admin/jobs")}catch(d){l(d.message||"Could not delete job.","error")}}),e.querySelectorAll("[data-review-id]").forEach(d=>d.addEventListener("click",async()=>{let p=d.dataset.reviewDecision,u=p==="reject"?prompt("Rejection reason:"):prompt("Optional admin note:")||"";if(!(u===null||p==="reject"&&!u.trim()))try{await c.adminReviewSubmission(d.dataset.reviewId,{decision:p,note:u}),l("Submission reviewed.","success"),await lt(e,a)}catch(b){l(b.message||"Could not review submission.","error")}})),e.querySelectorAll("[data-cancel-assignment]").forEach(d=>d.addEventListener("click",async()=>{let p=prompt("Reason for cancelling this assignment:");if(!(!p||!p.trim()))try{await c.adminCancelAssignment(d.dataset.cancelAssignment,{reason:p.trim()}),l("Assignment cancelled and refunded.","success"),await lt(e,a)}catch(u){l(u.message||"Could not cancel assignment.","error")}})),e.querySelectorAll("[data-reassign-assignment]").forEach(d=>d.addEventListener("click",async()=>{let p=e.querySelector(`[data-reassign-select="${d.dataset.reassignAssignment}"]`),u=Number(p?.value||0);if(!u){l("Select a pending replacement bid first.","error");return}let b=prompt("Reason for reassignment:")||"Reassigned by administrator";try{await c.adminReassignAssignment(d.dataset.reassignAssignment,{bid_id:u,reason:b.trim()}),l("Worker reassigned.","success"),await lt(e,a)}catch($){l($.message||"Could not reassign worker.","error")}}))}function Gi(e,t){let a=e.payment_status==="held"&&!["cancelled","completed"].includes(e.status),s=t.filter(r=>r.status==="pending"&&r.worker_id!==e.worker_id),n=a?`<div class="admin-row__actions"><button class="btn btn--danger btn--sm" data-cancel-assignment="${e.id}">Cancel/refund</button>${s.length?`<select data-reassign-select="${e.id}" aria-label="Replacement worker"><option value="">Replace with\u2026</option>${s.map(r=>`<option value="${r.id}">${x(r.worker?.name||`Worker #${r.worker_id}`)} \xB7 \u09F3${Number(r.amount||0).toFixed(2)}</option>`).join("")}</select><button class="btn btn--ghost btn--sm" data-reassign-assignment="${e.id}">Reassign</button>`:""}</div>`:"";return`<div class="admin-row"><div><strong>${x(e.worker?.name||"Unknown worker")}</strong><span class="muted">${x(e.worker?.email||"")} \xB7 ${x(e.worker?.phone||"")}</span></div><div><span class="badge">${x(String(e.status||"").toUpperCase())}</span><span class="muted"> ${x(String(e.payment_status||"").toUpperCase())} \xB7 ${Number(e.payment_amount||0).toFixed(2)}</span>${n}</div></div>`}function Xi(e){return`<div class="admin-row"><div><strong>${x(e.worker?.name||`Worker #${e.worker_id}`)}</strong><span class="muted">${x(e.worker?.email||"")} \xB7 ${x(e.worker?.phone||"")}</span><p>${x(e.proposal||"")}</p></div><div><span class="badge">PENDING</span><span class="muted"> \u09F3${Number(e.amount||0).toFixed(2)}</span></div></div>`}function Yi(e){let t=e.status==="pending_review"?`<div class="admin-row__actions"><button class="btn btn--success btn--sm" data-review-id="${e.id}" data-review-decision="approve">Approve</button><button class="btn btn--danger btn--sm" data-review-id="${e.id}" data-review-decision="reject">Reject</button></div>`:"";return`<div class="admin-row"><div><strong>${x(e.worker?.name||"Unknown worker")}</strong><span class="muted">${x(e.worker?.email||"")} \xB7 ${x(String(e.status||"").replace("_"," "))}</span><p>${x(e.description||"")}</p>${e.attachment_url?`<a href="${x(e.attachment_url)}" target="_blank" rel="noopener">Open screenshot</a>`:""}</div>${t}</div>`}function Ki(e,t){return!["completed","disputed"].includes(e.status)&&!t.some(a=>!["cancelled"].includes(a.status))}function x(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}va();ha();Kt();ea();aa();ra();zt();var kn={"/":Tt,"/refer":qt,"/webtask":we,"/tasks":we,"/earn":_e,"/tg-tasks":Xe,"/withdraw":De,"/profile":Ie,"/wallet":Ie,"/admin":ia,"/admin/payments":ca,"/admin/categories":un,"/admin/settings":mn,"/admin/jobs":ua,"/admin/admin-job-post":vn,"/admin/transactions":ga,"/admin/reports":fa,"/deposit":jt,"/leaderboard":Oe,"/achievements":Je,"/support":We,"/settings":ze,"/jobs/available":on,"/worker/bids":cn,"/worker/active-jobs":dt,"/poster":Yt,"/poster/post-job":Zt,"/poster/jobs":ta,"/poster/wallet":na,"/notifications":Vt,"/login":ya,"/register":$a,"/forgot-password":at,"/reset-password":st};function xn(){ct(),setTimeout(ct,50),window.addEventListener("hashchange",ct),E(()=>{P.get(),setTimeout(ct,0)})}async function ct(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!kn[t]){let i=t.match(/^\/admin\/jobs\/(\d+)$/);if(i){await pt(()=>fn(i[1]),t);return}let o=t.match(/^\/jobs\/(\d+)$/);if(o){let p=await Promise.resolve().then(()=>(yn(),hn));await pt(()=>p.JobDetailPage(o[1]),t);return}let d=t.match(/^\/poster\/jobs\/(\d+)$/);if(d){if(!P.get()){f("/login");return}let p=await Promise.resolve().then(()=>(Sn(),$n));await pt(()=>p.PosterJobDetailPage(d[1]),t);return}t="/"}let a=P.get(),s=g.get(),n=["/login","/register","/forgot-password","/reset-password"];if(n.includes(t)&&a){s&&s.is_admin?f("/admin"):f("/");return}if(!n.includes(t)&&!a){f("/login");return}if(t==="/"&&s&&s.is_admin){f("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){bo();return}let r=kn[t];await pt(r,t)}async function pt(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let n=a.querySelector(".bottomnav");n?a.insertBefore(s,n):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let n=typeof e=="function"?e():e;typeof n=="function"?await n():n&&typeof n.then=="function"&&await n}catch(n){console.error("View render threw synchronously for",t,n),s.innerHTML=`<div class="card"><h2>Error</h2><p>${n.message}</p></div>`}}function bo(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}h();var Tn=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();Tn.innerHTML="";X(nn(),Tn);Y.get()&&M();xn();
