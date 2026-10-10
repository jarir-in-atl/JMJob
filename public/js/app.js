var fi=Object.defineProperty;var _=(e,t)=>()=>(e&&(t=e(e=0)),t);var A=(e,t)=>{for(var a in t)fi(e,a,{get:t[a],enumerable:!0})};function hi(e,t){ls?ls(e,t):console.error("[Ghost] Unhandled effect error:",e)}function V(e){let t=e,a=new Set;return{get(){return G&&(a.add(G),G.dependencies.add(a)),t},set(s){t!==s&&(t=s,cs(a))}}}function cs(e){qt(()=>{e.forEach(t=>{t.notify?t.notify():Qe.add(t)})})}function qt(e){Et++;try{e()}finally{if(Et--,Et===0){let t=Array.from(Qe);Qe.clear(),t.forEach(a=>a.run())}}}function F(e){let t={dependencies:new Set,run(){Pt(t),Ze.push(G),G=t;try{e()}catch(a){hi(a,e)}finally{G=Ze.pop()}},notify(){Qe.add(t)}};return t.run(),()=>Pt(t)}function jt(e){let t,a=!0,s=new Set,r={dependencies:new Set,notify(){a||(a=!0,cs(s))}};return{get(){if(G&&(s.add(G),G.dependencies.add(s)),a){Pt(r),Ze.push(G),G=r;try{t=e()}finally{G=Ze.pop()}a=!1}return t}}}function Pt(e){for(let t of e.dependencies)t.delete(e);e.dependencies.clear()}var G,Ze,Qe,Et,ls,ge=_(()=>{G=null,Ze=[],Qe=new Set,Et=0,ls=null});function Re(){Nt.totalUpdates++,Nt.recentUpdates++}var et,Nt,Mt=_(()=>{et=new Set,Nt={totalUpdates:0,startTime:Date.now(),recentUpdates:0}});function ie(e,t){if(!e||typeof e!="object")return;if(e.__ghostList){yi(e,t);return}if(e.__ghostWhen){wi(e,t);return}if(e.__ghostLazy){_i(e,t);return}if(e.props=e.props||{},e.effects=e.effects||[],e.children=e.children||[],e.events=e.events||{mount:[],update:[],destroy:[],error:[]},!e.tag)return;et.add(e);let a=document.createElement(e.tag);e.el=a,Object.entries(e.props).forEach(([s,r])=>{if(s==="ghostStyle"&&r?.mount){r.mount(a);return}let i=s.startsWith("on");typeof r=="function"&&!i?e.effects.push(F(()=>{a.setAttribute(s,r()),Re(),e.events.update?.forEach(n=>n())})):i?a[s.toLowerCase()]=r:a.setAttribute(s,r)}),e.children.forEach(s=>{if(s!=null)if(s.__ghostList||s.__ghostWhen||s.__ghostLazy)ie(s,a);else if(typeof s=="string"||typeof s=="number")a.appendChild(document.createTextNode(String(s)));else if(typeof s=="function"){let r=null;e.effects.push(F(()=>{let i=s(),n=document.createTextNode(String(i??""));r?a.replaceChild(n,r):a.appendChild(n),r=n,Re(),e.events.update?.forEach(o=>o())}))}else ie(s,a)}),t.appendChild(a),e.events.mount?.forEach(s=>s())}function De(e){if(e){if(e._listCleanup){e._listCleanup();return}if(e._whenCleanup){e._whenCleanup();return}e.effects?.forEach(t=>t()),e.events?.destroy?.forEach(t=>t()),e.el?.parentNode&&e.el.parentNode.removeChild(e.el),et.delete(e)}}function yi(e,t){let{getItems:a,keyFn:s,renderFn:r}=e,i=document.createComment("[ghost-list]"),n=document.createComment("[/ghost-list]");t.appendChild(i),t.appendChild(n);let o=new Map;function d(u){return u.el||null}let p=F(()=>{let u=a(),b=u.map((g,k)=>String(s(g,k))),y=Array.from(o.keys());for(let g of y)if(!b.includes(g)){let k=o.get(g);De(k.ghostNode),o.delete(g)}for(let g=0;g<u.length;g++){let k=b[g];if(!o.has(k)){let $=r(u[g],g),P=document.createElement("ghost-list-slot");for(ie($,P);P.firstChild;)t.insertBefore(P.firstChild,n);o.set(k,{ghostNode:$})}}for(let g=b.length-1;g>=0;g--){let k=b[g],$=o.get(k);if(!$)continue;let P=d($.ghostNode);if(!P)continue;let M=b[g+1],x=(M?d(o.get(M)?.ghostNode):null)||n;P.nextSibling!==x&&t.insertBefore(P,x)}Re()});e._listCleanup=()=>{p();for(let u of o.values())De(u.ghostNode);o.clear(),i.remove(),n.remove()}}function se(e,t,a=null){return{__ghostWhen:!0,conditionGetter:e,trueFn:t,falseFn:a}}function wi(e,t){let{conditionGetter:a,trueFn:s,falseFn:r}=e,i=document.createComment("[ghost-when]");t.appendChild(i);let n=null,o=F(()=>{let p=a()?s:r;if(n&&(De(n),n=null),p&&(n=p(),n)){let u=document.createElement("ghost-when-slot");for(ie(n,u);u.firstChild;)t.insertBefore(u.firstChild,i)}Re()});e._whenCleanup=()=>{o(),n&&De(n),i.remove()}}function _i(e,t){let{importFn:a,fallback:s}=e,r=document.createComment("[ghost-lazy]");t.appendChild(r);let i=null;if(s){let n=document.createElement("ghost-lazy-slot");for(ie(s,n);n.firstChild;)t.insertBefore(n.firstChild,r);i=s}a().then(n=>{let o=n.default||n;i&&(De(i),i=null);let d=typeof o=="function"?o():o,p=document.createElement("ghost-lazy-slot");for(ie(d,p);p.firstChild;)t.insertBefore(p.firstChild,r);i=d}).catch(n=>{console.error("[Ghost] lazyNode failed to load:",n)})}var Rt=_(()=>{ge();Mt()});var ps=_(()=>{ge()});var tt=_(()=>{});var us=_(()=>{Mt()});var ms=_(()=>{ge()});var bs=_(()=>{Rt();ge();tt();tt()});function Si(e){if(typeof window>"u"||!window.DOMParser)return{};let a=new DOMParser().parseFromString(e,"text/xml");function s(r){let i={};if(r.nodeType===3)return r.nodeValue.trim();if(r.attributes?.length){i["@attributes"]={};for(let n of r.attributes)i["@attributes"][n.nodeName]=n.nodeValue}for(let n of r.childNodes){let o=n.nodeName,d=s(n);d!==""&&(i[o]===void 0?i[o]=d:(Array.isArray(i[o])||(i[o]=[i[o]]),i[o].push(d)))}return i}return s(a.documentElement)}function ki(e,t="GET"){return`${t.toUpperCase()}:${e}`}async function Ft(e,t={}){let{cache:a=!1,...s}=t,r=(s.method||"GET").toUpperCase(),i={url:e,...s};for(let b of Ft.interceptors.request)i=b(i)??i;let n=i.url;delete i.url;let o=ki(n,r);if(a==="memory"&&r==="GET"&&Dt.has(o))return Dt.get(o);let d=await fetch(n,i),p=d.headers.get("content-type")||"";if(!d.ok)throw new Error(`Ghost-HTTP Error: ${d.status} ${d.statusText}`);let u;p.includes("application/xml")||p.includes("text/xml")?u=Si(await d.text()):p.includes("application/json")?u=await d.json():u=await d.text();for(let b of Ft.interceptors.response)u=b(d,u)??u;return a==="memory"&&r==="GET"&&Dt.set(o,u),u}var Dt,gs=_(()=>{Dt=new Map;Ft.interceptors={request:[],response:[]}});function It(e,t){let a;try{let r=localStorage.getItem(e);a=r?JSON.parse(r):t}catch{a=t}let s=V(a);return F(()=>{try{localStorage.setItem(e,JSON.stringify(s.get()))}catch(r){console.warn(`Ghost-Bridge: Failed to persist key "${e}"`,r)}}),s}var vs=_(()=>{ge()});function xi(){let e=new Map;return{on(t,a){return e.has(t)||e.set(t,new Set),e.get(t).add(a),()=>e.get(t).delete(a)},emit(t,a){e.has(t)&&e.get(t).forEach(s=>s(a))},clear(t){t?e.delete(t):e.clear()}}}var Ud,fs=_(()=>{Ud=xi()});var Wd,Ti,hs=_(()=>{ge();Wd=V("en"),Ti=new Map;Ti.set("en",{})});var K=_(()=>{ge();Rt();ps();tt();us();ms();bs();gs();vs();fs();hs()});function ws(e){ke=e}function Ut(){return ke}function _s(e){Bt=e}async function m(e,{method:t="GET",body:a,headers:s={},signal:r}={}){let i=e.startsWith("http")?e:Ht.apiBase+e,n=typeof FormData<"u"&&a instanceof FormData,o={method:t,headers:{Accept:"application/json",...n?{}:{"Content-Type":"application/json"},...s}};ke&&(o.headers.Authorization=`Bearer ${ke}`),a!==void 0&&(o.body=n?a:JSON.stringify(a)),r&&(o.signal=r);let d=await fetch(i,o);if(d.status===401)throw Bt&&Bt(),new xe("Unauthorized",401,null);let p=null,u=d.headers.get("content-type")||"";try{if(u.includes("application/json"))p=await d.json();else{let b=await d.text();p=b?{message:b}:null}}catch{}if(!d.ok){let b=p&&p.message||`HTTP ${d.status}`;throw new xe(b,d.status,p)}return p}async function ys(e){let t=e.startsWith("http")?e:Ht.apiBase+e,a={Accept:"text/csv"};ke&&(a.Authorization=`Bearer ${ke}`);let s=await fetch(t,{headers:a});if(!s.ok){let r=`HTTP ${s.status}`;try{r=(await s.json())?.message||r}catch{}throw new xe(r,s.status,null)}return s.blob()}var Ht,ke,Bt,xe,c,T=_(()=>{Ht=window.JMJOB_CONFIG||{apiBase:"/api"},ke=null,Bt=null;xe=class extends Error{constructor(t,a,s){super(t),this.status=a,this.payload=s}},c={health:()=>m("/health"),register:e=>m("/auth/register",{method:"POST",body:e}),requestRegistrationOtp:e=>m("/auth/register/request-otp",{method:"POST",body:e}),verifyRegistrationOtp:e=>m("/auth/register/verify-otp",{method:"POST",body:e}),login:e=>m("/auth/login",{method:"POST",body:e}),forgotPassword:e=>m("/auth/forgot-password",{method:"POST",body:e}),resetPassword:e=>m("/auth/reset-password",{method:"POST",body:e}),logout:()=>m("/auth/logout",{method:"POST"}),me:()=>m("/auth/me"),notifications:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/notifications${t?"?"+t:""}`)},notificationRead:e=>m(`/notifications/${encodeURIComponent(e)}/read`,{method:"POST"}),notificationsReadAll:()=>m("/notifications/read-all",{method:"POST"}),meUser:()=>m("/user"),reward:e=>m("/user/reward",{method:"POST",body:e}),withdraw:e=>m("/user/withdraw",{method:"POST",body:e}),withdrawals:()=>m("/user/withdrawals"),referrals:()=>m("/user/referrals"),adHistory:()=>m("/user/ads"),adsConfig:()=>m("/ads/config"),adsNext:()=>m("/ads/next"),videoAds:()=>m("/ads/videos"),videoAdStart:e=>m("/ads/videos/start",{method:"POST",body:e}),videoAdClaim:e=>m("/ads/videos/claim",{method:"POST",body:e}),webTasks:()=>m("/tasks/web"),webTaskStart:e=>m("/tasks/web/start",{method:"POST",body:e}),webTaskClaim:e=>m("/tasks/web/claim",{method:"POST",body:e}),tgTasks:()=>m("/tasks/telegram"),tgTaskVerify:e=>m("/tasks/telegram/verify",{method:"POST",body:e}),adminStats:()=>m("/admin/stats"),adminWithdrawals:(e="pending")=>m(`/admin/withdrawals?status=${e}`),adminApprove:(e,t={})=>m(`/admin/withdrawals/${e}/approve`,{method:"POST",body:t}),adminReject:(e,t={})=>m(`/admin/withdrawals/${e}/reject`,{method:"POST",body:t}),adminPay:(e,t={})=>m(`/admin/withdrawals/${e}/pay`,{method:"POST",body:t}),adminUsers:()=>m("/admin/users"),adminUpdateUserRole:(e,t)=>m(`/admin/users/${e}/role`,{method:"POST",body:{role:t}}),adminBanUser:(e,t={})=>m(`/admin/users/${e}/ban`,{method:"POST",body:t}),adminUnbanUser:(e,t={})=>m(`/admin/users/${e}/unban`,{method:"POST",body:t}),adminBanHistory:e=>m(`/admin/users/${e}/ban-history`),adminProviders:()=>m("/admin/ad-providers"),adminUpdateProvider:(e,t)=>m(`/admin/ad-providers/${e}`,{method:"POST",body:t}),adminVideoAds:()=>m("/admin/video-ads"),adminCreateVideoAd:e=>m("/admin/video-ads",{method:"POST",body:e}),adminUpdateVideoAd:(e,t)=>m(`/admin/video-ads/${e}`,{method:"POST",body:t}),adminDeleteVideoAd:e=>m(`/admin/video-ads/${e}`,{method:"DELETE"}),adminResetDailyCounters:()=>m("/admin/reset-daily-counters",{method:"POST"}),paymentGateways:()=>m("/payment/gateways"),paymentSubmit:e=>m("/payment/submit",{method:"POST",body:e}),paymentSubmissions:()=>m("/payment/submissions"),adminPayments:(e="")=>m(`/admin/payments?status=${e}`),adminApprovePayment:(e,t={})=>m(`/admin/payments/${e}/approve`,{method:"POST",body:t}),adminRejectPayment:(e,t={})=>m(`/admin/payments/${e}/reject`,{method:"POST",body:t}),categories:()=>m("/categories"),jobs:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/jobs${t?"?"+t:""}`)},job:e=>m(`/jobs/${e}`),createWorkflowJob:e=>m("/jobs/workflow",{method:"POST",body:e}),applyForJob:(e,t={})=>m(`/jobs/${e}/apply`,{method:"POST",body:t}),extendDeadline:(e,t={})=>m(`/jobs/${e}/extend-deadline`,{method:"POST",body:t}),placeBid:(e,t)=>m(`/jobs/${e}/bid`,{method:"POST",body:t}),withdrawBid:e=>m(`/bids/${e}`,{method:"DELETE"}),workerBids:()=>m("/worker/bids"),workerActiveJobs:()=>m("/worker/active-jobs"),submitWork:(e,t)=>m(`/jobs/${e}/submit`,{method:"POST",body:t}),proofAttachment:e=>ys(`/jobs/submissions/${encodeURIComponent(e)}/attachment`),workerCancelAssignment:(e,t={})=>m(`/worker/assignments/${e}/cancel`,{method:"POST",body:t}),workerSubmissions:()=>m("/worker/submissions"),posterStats:()=>m("/poster/stats"),posterCreateJob:e=>m("/poster/jobs",{method:"POST",body:e}),posterMyJobs:()=>m("/poster/jobs"),posterJobBids:e=>m(`/poster/jobs/${e}/bids`),posterAcceptBid:(e,t,a={})=>m(`/poster/jobs/${e}/accept-bid`,{method:"POST",body:{...a,bid_id:t}}),posterRequestRevision:(e,t={})=>m(`/poster/jobs/${e}/request-revision`,{method:"POST",body:t}),posterReleasePayment:(e,t={})=>m(`/poster/jobs/${e}/release`,{method:"POST",body:t}),posterCancelJob:(e,t={})=>m(`/poster/jobs/${e}/cancel`,{method:"POST",body:t}),adminCategories:()=>m("/admin/categories"),adminCreateCategory:e=>m("/admin/categories",{method:"POST",body:e}),adminUpdateCategory:(e,t)=>m(`/admin/categories/${e}`,{method:"POST",body:t}),adminDeleteCategory:e=>m(`/admin/categories/${e}/delete`,{method:"POST"}),adminSubcategories:()=>m("/admin/subcategories"),adminCreateSubcategory:e=>m("/admin/subcategories",{method:"POST",body:e}),adminUpdateSubcategory:(e,t)=>m(`/admin/subcategories/${e}`,{method:"POST",body:t}),adminDeleteSubcategory:e=>m(`/admin/subcategories/${e}/delete`,{method:"POST"}),adminSettings:()=>m("/admin/settings"),adminUpdateSettings:e=>m("/admin/settings",{method:"POST",body:e}),socialLinks:()=>m("/social-links"),adminUpdateSocialLinks:e=>m("/admin/social-links",{method:"POST",body:e}),notices:()=>m("/notices"),adminUpdateNotices:e=>m("/admin/notices",{method:"POST",body:e}),adminUploadBannerImage:async e=>{let t=Ht.apiBase+"/admin/notices/upload",a={},s=Ut();s&&(a.Authorization=`Bearer ${s}`);let r=await fetch(t,{method:"POST",headers:a,body:e}),i=await r.json();if(!r.ok)throw new xe(i.message||"Upload failed",r.status,i);return i},adminJobs:(e="")=>m(`/admin/jobs${e?`?status=${encodeURIComponent(e)}`:""}`),adminCreateJob:e=>m("/admin/jobs",{method:"POST",body:e}),adminJobDetail:e=>m(`/admin/jobs/${e}/detail`),adminUpdateJob:(e,t)=>m(`/admin/jobs/${e}/edit`,{method:"POST",body:t}),adminDeleteJob:e=>m(`/admin/jobs/${e}`,{method:"DELETE"}),adminJobSubmissions:e=>m(`/admin/jobs/${e}/submissions`),adminFraudSubmissions:()=>m("/admin/fraud/submissions"),adminReviewFraud:(e,t={})=>m(`/admin/fraud/submissions/${e}/review`,{method:"POST",body:t}),adminReviewSubmission:(e,t={})=>m(`/admin/submissions/${e}/review`,{method:"POST",body:t}),adminCancelAssignment:(e,t={})=>m(`/admin/assignments/${e}/cancel`,{method:"POST",body:t}),adminReassignAssignment:(e,t={})=>m(`/admin/assignments/${e}/reassign`,{method:"POST",body:t}),adminApproveJob:(e,t={})=>m(`/admin/jobs/${e}/approve`,{method:"POST",body:t}),adminDeclineJob:(e,t={})=>m(`/admin/jobs/${e}/decline`,{method:"POST",body:t}),adminApproveApplication:(e,t={})=>m(`/admin/applications/${e}/approve`,{method:"POST",body:t}),adminFlagJobDispute:e=>m(`/admin/jobs/${e}/dispute`,{method:"POST"}),adminResolveJob:(e,t)=>m(`/admin/jobs/${e}/resolve`,{method:"POST",body:t}),adminTransactions:(e={})=>{let t=new URLSearchParams(e).toString();return m(`/admin/transactions${t?"?"+t:""}`)},adminReports:()=>m("/admin/reports"),adminReportsExport:()=>ys("/admin/reports?format=csv"),adminRevenue:()=>m("/admin/revenue")}});function l(e,t="info",a=3500){Fe.set({message:e,type:t,id:Date.now()}),Jt&&clearTimeout(Jt),Jt=setTimeout(()=>Fe.set(null),a)}async function O(){if(!re.get())return null;try{let e=await c.me();return v.set(e.data),e.data}catch{return null}}async function $s(e,t){let a=await c.login({email:e,password:t});return re.set(a.data.token),v.set(a.data.user),a.data.user}async function Ss(e){let t=await c.register(e);return t.data&&t.data.token&&t.data.user&&(re.set(t.data.token),v.set(t.data.user)),t}async function ks(e){let t=await c.verifyRegistrationOtp(e);return re.set(t.data.token),v.set(t.data.user),t.data.user}async function at(){try{await c.logout()}catch{}re.set(null),v.set(null),D.set("/login")}function h(e){window.location.hash=e}var Ai,Ci,re,v,Fe,Jt,D,I,w=_(()=>{K();K();T();Ai="earnap_token",Ci="earnap_user",re=It(Ai,null),v=It(Ci,null),Fe=V(null),Jt=null;D=V(window.location.hash.replace(/^#/,"")||"/"),I=jt(()=>!!re.get()&&!!v.get());F(()=>{let e=re.get();ws(e)});_s(()=>{re.set(null),v.set(null),D.set("/login"),l("Session expired. Please log in.","error")})});var Te=_(()=>{});var Ts={};A(Ts,{HomePage:()=>Ot});function Ot(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--home";let t=v.get();Li(e),e.appendChild(Ei(t)),e.appendChild(Pi())}}function Ie(e,t,a){let s=document.createElement(e);return t&&(s.className=t),a!==void 0&&(s.textContent=a),s}async function Li(e){st&&(clearInterval(st),st=null);try{let t=await c.notices(),s=(Array.isArray(t.notices)&&t.notices.length?t.notices:[]).map(b=>{if(typeof b=="string"){let y=b.trim();return y.startsWith("/")||y.startsWith("http")?{image:y,text:""}:{image:"",text:y}}return{image:b.image||"",text:b.text||""}}).filter(b=>b.image&&b.image.trim()||b.text&&b.text.trim());s.length||s.push({text:"Complete tasks, watch ads, refer friends, and withdraw anytime.",image:""});let r=Ie("div","welcome-popup welcome-popup--banner","");r.innerHTML=`
            <div id="notice-banner-content" class="welcome-popup__content"></div>
        `,e.firstChild?e.insertBefore(r,e.firstChild):e.appendChild(r);let i=r.querySelector("#notice-banner-content"),n=typeof t.interval=="number"&&t.interval>0?t.interval:4,o=t.direction||"right_to_left",d={right_to_left:{exit:"banner-vanish-left",enter:"banner-enter-right"},left_to_right:{exit:"banner-vanish-right",enter:"banner-enter-left"},top_to_bottom:{exit:"banner-vanish-bottom",enter:"banner-enter-top"},bottom_to_top:{exit:"banner-vanish-top",enter:"banner-enter-bottom"},fade:{exit:"banner-vanish-fade",enter:"banner-enter-fade"}},p=d[o]||d.right_to_left,u=0;xs(i,s[0]),s.length>1&&(st=setInterval(()=>{let b;do b=Math.floor(Math.random()*s.length);while(b===u&&s.length>1);u=b,i.className=`welcome-popup__content ${p.exit}`,setTimeout(()=>{xs(i,s[u]),i.className=`welcome-popup__content ${p.enter}`,setTimeout(()=>{i.className="welcome-popup__content"},350)},350)},n*1e3))}catch{}}function xs(e,t){e.innerHTML="";let a=!!(t&&t.text&&t.text.trim());if(!!(t&&t.image&&t.image.trim())){let r=document.createElement("img");r.className="welcome-popup__image",r.src=t.image,r.alt=t.text||"Banner Notice",r.onerror=()=>{r.style.display="none"},e.appendChild(r)}if(a){let r=document.createElement("div");r.className="welcome-popup__text-wrap",r.innerHTML=`<strong>JM Job:</strong> <span>${qi(t.text)}</span>`,e.appendChild(r)}}function Ei(e){let t=Ie("div","card card--user-header"),a=Ie("div","user-header__stats");return a.innerHTML=`
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
    `,t.appendChild(a),t}function Pi(){let e=Ie("div","icon-grid");return[{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill",tone:"purple"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill",tone:"blue"},{path:"/earn",label:"Earn Ad",icon:"bi-play-circle-fill",tone:"green"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2",tone:"amber"},{path:"/refer",label:"Referral",icon:"bi-gift-fill",tone:"pink"},{path:"/profile",label:"Profile",icon:"bi-person-bounding-box",tone:"gray"},{path:"/support",label:"Support",icon:"bi-headset",tone:"red"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin",tone:"green"}].filter(a=>a.path!=="/deposit").forEach(a=>{let s=Ie("a",`icon-grid__item icon-grid__item--${a.tone}`);s.href=`#${a.path}`,s.innerHTML=`
            <span class="icon-grid__chip">
                <i class="bi ${a.icon}"></i>
            </span>
            <span class="icon-grid__label">${a.label}</span>
        `,s.addEventListener("click",r=>{r.preventDefault(),h(a.path)}),e.appendChild(s)}),e}function qi(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}var st,Wt=_(()=>{w();T();Te();st=null});var Vt={};A(Vt,{WebTaskPage:()=>Be});function Be(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--webtask",e.innerHTML='<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading\u2026</div>';let t=e.querySelector("#task-list");try{let s=(await c.webTasks()).data||[];if(s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}t.innerHTML="",s.forEach(r=>t.appendChild(ji(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function ji(e){let t=document.createElement("div");t.className="card card--task",t.innerHTML=`
        <h3 class="card__title">${As(e.title)}</h3>
        <p class="card__sub">${As(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${e.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${e.completed_today>0?"100%":"0%"}"></div></div>
        <div class="task-actions">
            ${e.completed_today>0?'<button class="btn btn--ghost" disabled>\u2713 Completed today</button>':`<button class="btn btn--primary" data-task-id="${e.id}">Start Task</button>`}
        </div>
    `;let a=t.querySelector("button");return a&&!a.disabled&&a.addEventListener("click",()=>Ni(e,a,t)),t}async function Ni(e,t,a){t.disabled=!0,t.textContent="Opening\u2026",window.open(e.target_url,"_blank","noopener,noreferrer");let s=0,r=e.duration_seconds;t.textContent=`Wait ${r}s\u2026`;let n=(await c.webTaskStart({task_id:e.id})).data.completion_id,o=setInterval(()=>{s+=1;let d=r-s;t.textContent=d>0?`Wait ${d}s\u2026`:"Claim Reward",s>=r&&(clearInterval(o),Mi(t,n,a))},1e3)}function Mi(e,t,a){e.textContent="Claim Reward",e.classList.remove("btn--primary"),e.classList.add("btn--success"),e.disabled=!1,e.onclick=async()=>{e.disabled=!0,e.textContent="Claiming\u2026";try{let s=await c.webTaskClaim({completion_id:t});l("+"+parseFloat(s.data.reward).toFixed(2)+" credited!","success"),await O(),Be()()}catch(s){l(s.message||"Claim failed","error"),e.disabled=!1,e.textContent="Claim Reward"}}}function As(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var rt=_(()=>{T();w()});var Cs={};A(Cs,{EarnPage:()=>He});function He(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML='<div class="card"><p class="muted">Loading available ads\u2026</p></div>',e.className="view view--earn";let t=v.get(),a=t?t.ads_remaining:0;try{let[s,r]=await Promise.all([c.videoAds(),c.adHistory().catch(()=>({meta:{}}))]),i=s.data||[],n=r.meta||{},o=s.meta?.enabled!==!1;e.innerHTML=`
                <div class="card card--earn">
                    <h2 class="card__title">Ads Reward Center</h2>
                    <p class="card__sub">Server-timed sponsor videos and daily rewards</p>
                    <div class="ad-progress">
                        <div class="ad-progress__bar" style="width: ${t?Math.min(100,(t.today_ads||0)/(t.ads_limit||50)*100):0}%"></div>
                   </div>
                   <p class="ad-progress__label">${t?t.today_ads:0} / ${t?t.ads_limit:50} ads today</p>
                    <div class="ad-earn-summary">
                        <div><span class="muted">Available ads</span><strong>${i.length}</strong></div>
                        <div><span class="muted">Remaining limit</span><strong>${s.meta?.ads_remaining_today??a}</strong></div>
                        <div><span class="muted">Today\u2019s ad earnings</span><strong>\u09F3${Number(n.today_earnings||0).toFixed(4)}</strong></div>
                        <div><span class="muted">Total ad earnings</span><strong>\u09F3${Number(n.total_earnings||0).toFixed(4)}</strong></div>
                    </div>
                   ${o?"":'<p class="muted">Watch-and-earn is currently paused.</p>'}
                    <div class="video-ad-list"></div>
                    ${o&&i.length===0?'<p class="muted">No sponsor videos are available right now.</p>':""}
                    <button id="watch-btn" class="btn btn--ghost btn--sm" ${a<=0||!o?"disabled":""}>Use standard ad reward</button>
                </div>
            `;let d=e.querySelector(".video-ad-list");i.forEach(u=>{let b=document.createElement("div");b.className="admin-row",b.innerHTML=`<div><strong>${zt(u.title)}</strong><span class="muted">${u.duration_seconds}s \xB7 +${Number(u.reward_amount||0).toFixed(4)} \xB7 ${u.watched_today}/${u.daily_limit||"\u221E"} today</span></div>`;let y=document.createElement("button");y.className="btn btn--primary btn--sm",y.textContent=u.can_start&&a>0?"Watch & earn":"Unavailable",y.disabled=!u.can_start||a<=0,y.addEventListener("click",()=>Ri(u)),b.appendChild(y),d.appendChild(b)});let p=e.querySelector("#watch-btn");p&&!p.disabled&&p.addEventListener("click",()=>Di())}catch(s){e.innerHTML=`<div class="card card--earn"><h2 class="card__title">Ads Reward Center</h2><p class="muted">${zt(s.message||"Could not load ads.")}</p></div>`}}}async function Ri(e){let t;try{t=await c.videoAdStart({video_ad_id:e.id})}catch(u){l(u.message||"Could not start this ad.","error");return}let a=t.data,s=document.createElement("div");s.className="modal modal--ad",s.innerHTML=`
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">\xD7</button>
            <h3>${zt(e.title)}</h3>
            <video id="video-ad-player" controls playsinline style="width:100%;max-height:320px;background:#000"></video>
            <p class="ad-slot__countdown" id="video-ad-countdown">Watch ${a.duration_seconds}s to unlock the reward.</p>
        </div>
    `,document.body.appendChild(s);let r=()=>s.remove();s.querySelector(".modal__close").addEventListener("click",r),s.querySelector(".modal__backdrop").addEventListener("click",r);let i=s.querySelector("#video-ad-player"),n=s.querySelector("#video-ad-countdown"),o=!1;try{if(String(a.stream_url||"").startsWith("https://"))i.src=a.stream_url,await i.play().catch(()=>{});else{let u=await fetch(a.stream_url,{headers:{Authorization:"Bearer "+Ut()}});if(!u.ok)throw new Error("Video could not be loaded.");i.src=URL.createObjectURL(await u.blob()),await i.play().catch(()=>{})}}catch(u){n.textContent=u.message||"Video could not be loaded.";return}let d=Number(a.started_at_unix||Math.floor(Date.now()/1e3))*1e3,p=setInterval(async()=>{let u=Math.max(0,a.duration_seconds-Math.floor((Date.now()-d)/1e3));if(n.textContent=u>0?`Reward unlocks in ${u}s\u2026`:"Claiming reward\u2026",u<=0&&!o){o=!0,clearInterval(p);try{let b=await c.videoAdClaim({view_id:a.view_id});l(`+$${Number(b.data?.reward||0).toFixed(4)} credited!`,"success"),await O(),URL.revokeObjectURL(i.src),r(),He()()}catch(b){o=!1,n.textContent=b.message||"Reward claim failed."}}},1e3)}function Di(){let e=document.createElement("div");e.className="modal modal--ad",e.innerHTML=`
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
        `;let i=s.querySelector("#cd-num"),n=setInterval(async()=>{a--,i.textContent=a,r.textContent=`Reward in ${a}s\u2026`,a<=0&&(clearInterval(n),await Fi(e,"simulated",t))},1e3)},300)}async function Fi(e,t,a){try{let s=await c.reward({provider:t,started_at:a});l(`+$${parseFloat(s.data.reward).toFixed(4)} credited!`,"success"),await O(),e.remove(),He()()}catch(s){l(s.message||"Reward failed","error"),e.remove()}}function zt(e){return String(e??"").replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}var Gt=_(()=>{T();w()});var Es={};A(Es,{ReferPage:()=>Xt});function Xt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--refer";let t=v.get(),a=null;try{a=(await c.referrals()).data}catch{l("Failed to load referrals","error")}let s=a?a.referral_link:t?`${window.location.origin}/?ref=${t.referral_code}`:"";e.innerHTML=`
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
        `;let r=e.querySelector("#copy-btn"),i=e.querySelector("#refer-link-input");r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.value),l("Link copied to clipboard!","success")}catch{i.select(),document.execCommand("copy"),l("Link copied!","success")}});let n=e.querySelector("#share-tg");n.href="https://t.me/share/url?url="+encodeURIComponent(s);let o=e.querySelector("#refer-list");a&&a.referrals&&a.referrals.forEach(d=>{let p=document.createElement("div");p.className="refer-item",p.innerHTML=`
                    <img class="avatar" src="${d.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${Ls(d.name)}</div>
                        <div class="refer-item__username">@${Ls(d.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(d.lifetime_earned).toFixed(2)}</div>
                `,o.appendChild(p)})}}function Ls(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Yt=_(()=>{T();w()});var Ps={};A(Ps,{WithdrawPage:()=>it});function it(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--withdraw";let t=v.get();e.innerHTML=`
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
        `;let a=e.querySelector("#withdraw-form");a.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(a),n=a.querySelector("button");n.disabled=!0,n.textContent="Submitting\u2026";try{let o=await c.withdraw({amount:parseFloat(i.get("amount")),wallet_address:String(i.get("wallet_address")),gateway:String(i.get("gateway"))});l("Withdrawal requested!","success"),await O(),it()()}catch(o){let d=o.payload&&o.payload.errors;if(d){let p=Object.values(d)[0];l(Array.isArray(p)?p[0]:p,"error")}else l(o.message||"Withdrawal failed","error");n.disabled=!1,n.textContent="Confirm Withdrawal"}});let s=e.querySelector("#withdraw-history");try{let i=(await c.withdrawals()).data||[];i.length===0?s.innerHTML='<p class="muted">No withdrawals yet.</p>':(s.innerHTML="",i.forEach(n=>s.appendChild(Ii(n))))}catch{s.innerHTML='<p class="muted">Failed to load history.</p>'}}}function Ii(e){let t=document.createElement("div");t.className="withdraw-row withdraw-row--"+e.status;let a=(e.status||"pending").toUpperCase(),s=e.admin_note?`<div class="withdraw-row__note">"${Kt(e.admin_note)}"</div>`:"";return t.innerHTML=`
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${Kt(e.gateway)} \xB7 ${Kt(e.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${a}</div>
        ${s}
    `,t}function Kt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Zt=_(()=>{T();w()});var Ns={};A(Ns,{DepositPage:()=>Qt});function Qt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--deposit";let t=v.get();e.innerHTML=`
            <h1 class="page-title">Deposit Funds</h1>

            <div class="card card--deposit-balance">
                <div class="deposit-balance__row">
                    <div>
                        <div class="muted">Deposit Wallet (Poster Wallet)</div>
                        <div class="deposit-balance__amount" id="deposit-balance">\u09F3${t?parseFloat(t.wallet_balance||0).toFixed(2):"0.00"}</div>
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
        `;try{j.loading=!0;let[s,r]=await Promise.all([c.paymentGateways(),c.paymentSubmissions()]);j.gateways=s.data.gateways,j.minAmount=s.data.min_amount,j.maxAmount=s.data.max_amount,j.submissions=r.data,js(),qs()}catch(s){l("Failed to load deposit info: "+s.message,"error")}finally{j.loading=!1}let a=document.getElementById("deposit-form");a&&a.addEventListener("submit",async s=>{if(s.preventDefault(),!j.selectedGateway){l("Please select a payment method.","error");return}let r=new FormData(a),i=document.getElementById("deposit-submit-btn");i.disabled=!0,i.innerHTML='<i class="bi bi-hourglass-split"></i> Submitting\u2026';try{let n=await c.paymentSubmit({gateway:j.selectedGateway,sender_number:String(r.get("sender_number")||"").trim(),amount:parseFloat(r.get("amount")),trxid:String(r.get("trxid")||"").trim().toUpperCase()});l(n.message||"Payment submitted.","success"),a.reset();let o=await c.paymentSubmissions();j.submissions=o.data,qs(),await O();let d=v.get(),p=document.getElementById("deposit-balance");p&&d&&(p.textContent="\u09F3"+parseFloat(d.wallet_balance||0).toFixed(2))}catch(n){l(n.message||"Failed to submit payment.","error")}finally{i.disabled=!1,i.innerHTML='<i class="bi bi-send"></i> Submit Payment'}})}}function js(){let e=document.getElementById("payment-gateways");if(e){if(j.gateways.length===0){e.innerHTML='<p class="muted">No payment methods available right now.</p>';return}e.innerHTML=j.gateways.map(t=>`
        <button class="payment-gateway ${j.selectedGateway===t.key?"is-selected":""}" data-gateway="${t.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${Ae(t.label)}</div>
                <div class="payment-gateway__number">${Ae(t.wallet_number)}</div>
            </div>
            ${j.selectedGateway===t.key?'<i class="bi bi-check-circle-fill payment-gateway__check"></i>':""}
        </button>
    `).join(""),e.querySelectorAll("button[data-gateway]").forEach(t=>{t.addEventListener("click",()=>{j.selectedGateway=t.getAttribute("data-gateway"),js(),Hi()})})}}function Hi(){let e=j.gateways.find(i=>i.key===j.selectedGateway),t=document.getElementById("deposit-instructions-card"),a=document.getElementById("deposit-form-card");if(!e){t&&(t.style.display="none"),a&&(a.style.display="none");return}t&&(t.style.display=""),a&&(a.style.display="");let s=document.getElementById("payment-instructions");s&&(s.innerHTML=`
            <p>${Ae(e.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${Ae(e.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `,document.getElementById("copy-wallet-btn")?.addEventListener("click",()=>{navigator.clipboard.writeText(e.wallet_number).then(()=>{l("Wallet number copied.","info")}).catch(()=>{l("Could not copy. Please copy manually.","error")})}));let r=document.getElementById("deposit-amount");r&&(r.min=j.minAmount,r.max=j.maxAmount,r.placeholder=`${j.minAmount} \u2013 ${j.maxAmount}`)}function qs(){let e=document.getElementById("payment-history");if(e){if(j.submissions.length===0){e.innerHTML='<p class="muted">No submissions yet.</p>';return}e.innerHTML=j.submissions.map(t=>{let a=Bi[t.status]||{label:t.status,class:""};return`
            <div class="payment-row ${a.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">\u09F3 ${parseFloat(t.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${Ae((t.gateway||"").toUpperCase())} \u2022 TRX: ${Ae(t.trxid)}</div>
                </div>
                <div class="payment-row__status">${a.label}</div>
                <div class="payment-row__date">${Ui(t.created_at)}</div>
            </div>
        `}).join("")}}function Ui(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Ae(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Bi,j,ea=_(()=>{T();w();Bi={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},j={gateways:[],minAmount:1,maxAmount:5e4,selectedGateway:null,submissions:[],loading:!1}});var aa={};A(aa,{ProfilePage:()=>nt});function nt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--profile";let t=v.get();e.innerHTML=`
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${t?t.avatar_url:""}" alt="">
                <h2 class="card__title">${t?ta(t.name):""}</h2>
                <p class="card__sub">@${t?ta(t.username):""}</p>
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
                        <span class="ad-history__provider">${ta(n.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(n.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${n.completed_at||n.started_at}</span>
                    `,i.appendChild(o)})}}catch{a.innerHTML='<p class="muted">Failed to load history.</p>'}}}function ta(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ot=_(()=>{T();w()});var Ms={};A(Ms,{default:()=>dt});async function dt(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--leaderboard",e.innerHTML=`
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
    `)}var sa=_(()=>{w()});var Rs={};A(Rs,{default:()=>lt});async function lt(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--achievements",e.innerHTML=`
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
    `)}var ra=_(()=>{w()});var Ds={};A(Ds,{default:()=>ct});async function ct(){let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--support",e.innerHTML=`
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
    `,e.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.parentElement.classList.toggle("faq-item--open")})}))}var ia=_(()=>{w()});function Ji(){let e=localStorage.getItem(Fs);return e==="dark"||e==="light"?e:"system"}function Oi(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function na(e){let t=Oi(e);document.documentElement.setAttribute("data-theme",t)}function Is(){let e=Z.get();Z.set(e==="dark"?"light":"dark")}function Bs(e){Z.set(e)}function Wi(){let e=localStorage.getItem(Hs);return e&&oa.includes(e)?e:"default"}function Us(e){e==="default"?document.documentElement.removeAttribute("data-color-theme"):document.documentElement.setAttribute("data-color-theme",e)}function Js(e){oa.includes(e)&&Ue.set(e)}function Os(){return oa}var Fs,Z,Hs,oa,Ue,da=_(()=>{K();Fs="jmjob_theme";Z=V(Ji());na(Z.get());F(()=>{let e=Z.get();na(e),localStorage.setItem(Fs,e)});window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{Z.get()==="system"&&na("system")});Hs="jmjob_color_theme",oa=["default","emerald","amber","rose"];Ue=V(Wi());Us(Ue.get());F(()=>{let e=Ue.get();Us(e),localStorage.setItem(Hs,e)})});var Ws={};A(Ws,{default:()=>ut});async function ut(){let e=document.querySelector("[data-view]");if(!e)return;let t=v.get();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--settings";let a=Z.get(),s=Ue.get(),r=Os();e.innerHTML=`
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
                        <div class="settings-value">${pt[s]||"Default (Purple)"}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${r.map(o=>`
                            <button class="theme-swatch ${o===s?"is-active":""}" data-color="${o}" role="radio" aria-checked="${o===s}" title="${pt[o]||o}">
                                <span class="theme-swatch__chip" style="background: ${Vi[o]};"></span>
                                <span class="theme-swatch__label">${(pt[o]||o).split(" ")[0]}</span>
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
    `;let i=document.getElementById("theme-mode-group");i&&i.querySelectorAll("button[data-mode]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-mode");Bs(d),l(`Theme mode set to ${d}.`,"info")})});let n=document.getElementById("color-theme-group");n&&n.querySelectorAll("button[data-color]").forEach(o=>{o.addEventListener("click",()=>{let d=o.getAttribute("data-color");Js(d),l(`Accent color set to ${pt[d]||d}.`,"info")})}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{await at(),l("Logged out.","info")})}var pt,Vi,la=_(()=>{w();da();pt={default:"Default (Purple)",emerald:"Emerald (Green)",amber:"Amber (Orange)",rose:"Rose (Pink)"},Vi={default:"linear-gradient(135deg, #7c3aed, #a855f7)",emerald:"linear-gradient(135deg, #059669, #10b981)",amber:"linear-gradient(135deg, #d97706, #f59e0b)",rose:"linear-gradient(135deg, #e11d48, #f43f5e)"}});var zs={};A(zs,{NotificationsPage:()=>ca});function ca(){return async()=>{let e=document.querySelector("[data-view]");e&&(e.innerHTML="",e.className="view view--notifications",e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `,document.getElementById("notifications-read-all")?.addEventListener("click",async()=>{try{await c.notificationsReadAll(),l("All notifications marked as read.","success"),await Vs()}catch(t){l(t.message||"Could not update notifications.","error")}}),await Vs())}}async function Vs(){let e=document.getElementById("notifications-page-list");if(e)try{let t=await c.notifications({limit:100}),a=Array.isArray(t.data)?t.data:[];e.innerHTML=a.length?a.map(zi).join(""):'<p class="muted notifications-page__empty">No notifications yet.</p>',e.querySelectorAll("[data-notification-id]").forEach(s=>{s.querySelector("[data-mark-read]")?.addEventListener("click",async()=>{try{await c.notificationRead(s.getAttribute("data-notification-id")),s.classList.remove("notifications-page__item--unread"),s.querySelector("[data-mark-read]").remove()}catch(r){l(r.message||"Could not mark notification as read.","error")}})})}catch(t){e.innerHTML=`<p class="muted">Failed to load notifications: ${Je(t.message||"unknown error")}</p>`}}function zi(e){let t=e.data||{},a=["success","warning","primary","info","danger"].includes(t.tone)?t.tone:"info",s=/^bi-[a-z0-9-]+$/.test(String(t.icon||""))?t.icon:"bi-bell",r=typeof t.action_url=="string"&&t.action_url.startsWith("/")?`<a class="btn btn--ghost btn--sm" href="#${Je(t.action_url)}">Open</a>`:"",i=e.read?"":'<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';return`<article class="notifications-page__item ${e.read?"":"notifications-page__item--unread"}" data-notification-id="${Je(e.id)}"><i class="bi ${s} notifications-page__icon notifications-page__icon--${a}"></i><div class="notifications-page__body"><h3>${Je(t.title||"Notification")}</h3><p>${Je(t.message||"")}</p><small>${Gi(e.created_at)}</small></div><div class="notifications-page__actions">${r}${i}</div></article>`}function Gi(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Je(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var pa=_(()=>{T();w()});var Gs={};A(Gs,{TgTasksPage:()=>bt});function bt(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--tgtasks",e.innerHTML=`
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading\u2026</div>
        `;let t=e.querySelector("#tg-list");try{let s=(await c.tgTasks()).data||[];if(t.innerHTML="",s.length===0){t.innerHTML='<p class="muted">No tasks available right now.</p>';return}s.forEach(r=>t.appendChild(Xi(r)))}catch{t.innerHTML='<p class="muted">Failed to load tasks.</p>'}}}function Xi(e){let t=document.createElement("div");if(t.className="card card--task",t.innerHTML=`
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${mt(e.channel_name)}</strong>
                <span class="muted">${mt(e.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${mt(e.description||"")}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(e.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${e.completed?'<button class="btn btn--ghost" disabled>\u2713 Completed</button>':`<a class="btn btn--primary" href="https://t.me/${mt(e.channel_username.replace("@",""))}" target="_blank" rel="noopener" data-task-id="${e.id}">Join channel</a>`}
        </div>
    `,!e.completed){let a=t.querySelector("a.btn");a.addEventListener("click",async s=>{s.preventDefault();let r=a.href;window.open(r,"_blank","noopener,noreferrer"),setTimeout(()=>{confirm(`Did you join ${e.channel_name}? Click OK to claim the reward.`)&&Yi(e,t)},3e3)})}return t}async function Yi(e,t){let a=t.querySelector(".task-actions");a.innerHTML='<button class="btn btn--ghost" disabled>Claiming\u2026</button>';try{await c.tgTaskVerify({task_id:e.id}),l("+ $"+parseFloat(e.reward).toFixed(3)+" credited!","success"),await O(),bt()()}catch(s){l(s.message||"Verification failed","error"),a.innerHTML=`<button class="btn btn--primary" data-task-id="${e.id}">Retry</button>`}}function mt(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var ua=_(()=>{T();w()});var Ks={};A(Ks,{PosterDashboardPage:()=>ba});function ba(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--poster-dashboard",!v.get()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
        `;let a=e.querySelector("#poster-new-job");a&&a.addEventListener("click",s=>{s.preventDefault(),h("/poster/post-job")}),await Xs()}}async function Xs(){let e=document.getElementById("poster-dashboard-content");if(e)try{let t=await c.posterStats();Zi(e,t.data||{})}catch(t){e.innerHTML=`
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${Ys(t.message||"Unknown error")}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `,e.querySelector("#poster-retry")?.addEventListener("click",Xs),l(t.message||"Failed to load poster statistics.","error")}}function Zi(e,t){let a=t.counts||{},s=(a.assigned||0)+(a.submitted||0)+(a.revision||0),r=ma(t.wallet_balance),i=ma(t.frozen_balance),n=ma(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-stat-grid">
            ${gt("bi-briefcase","Total jobs",a.total||0)}
            ${gt("bi-lightning-charge","Active jobs",s)}
            ${gt("bi-wallet2","Available wallet",r,"\u09F3")}
            ${gt("bi-lock","In escrow",i,"\u09F3")}
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
                    ${Ce("open",a.open)}
                    ${Ce("in_review",a.in_review)}
                    ${Ce("assigned",a.assigned)}
                    ${Ce("submitted",a.submitted)}
                    ${Ce("revision",a.revision)}
                    ${Ce("completed",a.completed)}
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
    `,e.querySelectorAll("[data-poster-link]").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault(),h(o.getAttribute("href").replace(/^#/,""))})})}function gt(e,t,a,s=""){return`
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${e} poster-stat-icon"></i>
            <span class="muted">${t}</span>
            <strong>${s}${Ys(String(a))}</strong>
        </div>
    `}function Ce(e,t){let a=Number(t||0);return`
        <div class="poster-status-row">
            <span><i class="bi ${Qi(e)}"></i> ${Ki[e]||e}</span>
            <strong>${a}</strong>
        </div>
    `}function Qi(e){return{open:"bi-megaphone",in_review:"bi-search",assigned:"bi-person-check",submitted:"bi-inbox",revision:"bi-arrow-repeat",completed:"bi-check-circle"}[e]||"bi-circle"}function ma(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function Ys(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ki,ga=_(()=>{T();w();Ki={open:"Open",in_review:"In review",assigned:"Assigned",submitted:"Awaiting review",revision:"Revision requested",completed:"Completed",cancelled:"Cancelled",expired:"Expired",disputed:"Disputed"}});var er={};A(er,{PostJobPage:()=>va});function va(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--post-job",!sn()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t={currentStep:1,categories:[],mainCategoryId:"",subCategoryId:"",title:"",subtitle:"",description:"",thumbnailBase64:"",proofRequirements:[{title:"",type:"text"}],workerCount:1,costPerWorker:10,biddingValue:3,biddingUnit:"days",deadlineAt:"",feePercentage:30};try{let a=await c.categories();t.categories=a.data||[]}catch(a){l(a.message||"Could not load categories.","error")}Oe(e,t)}}function Oe(e,t){e.innerHTML=`
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
    `,en(e,t)}function en(e,t){let a=e.querySelector("#wizard-card-body");a&&(t.currentStep===1?Qs(a,e,t):t.currentStep===2?ve(a,e,t):t.currentStep===3&&tn(a,e,t))}function Qs(e,t,a){let s=a.categories.find(o=>Number(o.id)===Number(a.mainCategoryId)),r=s?s.subcategories||[]:[];e.innerHTML=`
        <form id="step-1-form" class="poster-form">
            <h2>Step 1: Select Category</h2>
            
            <label>Main Category
                <select id="main-category-select" required>
                    <option value="">Choose Main Category\u2026</option>
                    ${a.categories.map(o=>`
                        <option value="${o.id}" ${Number(a.mainCategoryId)===Number(o.id)?"selected":""}>
                            ${Le(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <label>Sub Category
                <select id="sub-category-select" ${s?"":"disabled"}>
                    <option value="">Choose Sub Category (Optional)\u2026</option>
                    ${r.map(o=>`
                        <option value="${o.id}" ${Number(a.subCategoryId)===Number(o.id)?"selected":""}>
                            ${Le(o.name)}
                        </option>
                    `).join("")}
                </select>
            </label>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                <button type="submit" class="btn btn--primary" id="step-1-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;let i=e.querySelector("#main-category-select"),n=e.querySelector("#sub-category-select");i.addEventListener("change",o=>{a.mainCategoryId=o.target.value,a.subCategoryId="",Qs(e,t,a)}),n.addEventListener("change",o=>{a.subCategoryId=o.target.value}),e.querySelector("#step-cancel").addEventListener("click",fa),e.querySelector("#step-1-form").addEventListener("submit",o=>{if(o.preventDefault(),!a.mainCategoryId){l("Please select a main category.","error");return}let d=a.categories.find(u=>Number(u.id)===Number(a.mainCategoryId)),p=d?Number(d.min_cost||1):1;if(a.subCategoryId&&d&&d.subcategories){let u=d.subcategories.find(b=>Number(b.id)===Number(a.subCategoryId));u&&u.min_cost&&(p=Number(u.min_cost))}a.minCost=p,a.costPerWorker<a.minCost&&(a.costPerWorker=a.minCost),a.currentStep=2,Oe(t,a)})}function ve(e,t,a){let s=a.proofRequirements.some(o=>o.type==="screenshot"),r=a.proofRequirements.some(o=>o.type==="text");e.innerHTML=`
        <form id="step-2-form" class="poster-form">
            <h2>Step 2: Job Details & Proof Requirements</h2>

            <label>Job Title
                <input id="job-title-input" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo" value="${Le(a.title)}">
            </label>

            <label>Job Subtitle (Optional)
                <input id="job-subtitle-input" type="text" maxlength="255" placeholder="Short summary shown on job cards" value="${Le(a.subtitle)}">
            </label>

            <label>Task Instructions (Description)
                <textarea id="job-desc-input" rows="5" required placeholder="Explain step by step instructions for workers\u2026">${Le(a.description)}</textarea>
            </label>

            <label>Thumbnail Image Upload (Optional)
                <input id="job-thumbnail-input" type="file" accept="image/*">
                ${a.thumbnailBase64?`<div style="margin-top:0.5rem;"><img src="${a.thumbnailBase64}" style="max-height:80px; border-radius:4px; border:1px solid #ccc;"></div>`:""}
            </label>

            <div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--bg-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; flex-wrap:wrap; gap:8px;">
                    <div>
                        <div style="font-weight:600; font-size:14px;"><i class="bi bi-shield-check"></i> Proof Requirements</div>
                        <span class="muted" style="font-size:12px;">Choose whether proof will take images only, texts only, or both pairs of images and texts.</span>
                    </div>
                    <button type="button" class="btn btn--sm btn--ghost" id="add-proof-btn"><i class="bi bi-plus-circle"></i> Add Requirement Pair</button>
                </div>

                <!-- Quick Mode Presets -->
                <div class="proof-mode-presets" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <button type="button" class="btn btn--sm ${s&&!r?"btn--primary":"btn--outline"}" id="poster-mode-images"><i class="bi bi-image"></i> Images only</button>
                    <button type="button" class="btn btn--sm ${r&&!s?"btn--primary":"btn--outline"}" id="poster-mode-texts"><i class="bi bi-file-text"></i> Texts only</button>
                    <button type="button" class="btn btn--sm ${s&&r?"btn--primary":"btn--outline"}" id="poster-mode-both"><i class="bi bi-collection"></i> Both (Images & Texts)</button>
                </div>

                <div id="proof-pairs-container">
                    ${a.proofRequirements.map((o,d)=>`
                        <div class="proof-pair-row" style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap;" data-index="${d}">
                            <select class="proof-type-select" style="min-width: 150px;">
                                <option value="screenshot" ${o.type==="screenshot"?"selected":""}>\u{1F4F7} Screenshot Proof</option>
                                <option value="text" ${o.type==="text"?"selected":""}>\u{1F4DD} Text Proof</option>
                            </select>
                            <input type="text" class="proof-title-input" placeholder="${o.type==="screenshot"?"Screenshot requirement (e.g. Upload payment screenshot)":"Text requirement (e.g. Provide account username)"}" value="${Le(o.title||"")}" style="flex:2; min-width: 180px;" required>
                            ${o.type==="screenshot"?`
                                <div style="display:flex; align-items:center; gap:0.5rem;">
                                    <label class="btn btn--ghost btn--sm" style="margin:0; cursor:pointer; font-size:12px; white-space:nowrap;" title="Upload sample reference image for worker (optional)">
                                        <i class="bi bi-upload"></i> Sample image
                                        <input type="file" class="proof-file-input" accept="image/*" style="display:none;">
                                    </label>
                                    ${o.fileBase64||o.image_url?`<img src="${o.fileBase64||o.image_url}" style="max-height:36px; max-width:50px; border-radius:4px; border:1px solid #ccc; object-fit:contain;">`:""}
                                </div>
                            `:""}
                            ${a.proofRequirements.length>1?`
                                <button type="button" class="btn btn--ghost remove-proof-btn" data-index="${d}" style="color:#ef4444;" title="Remove requirement"><i class="bi bi-trash"></i></button>
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
    `,e.querySelector("#poster-mode-images")?.addEventListener("click",()=>{oe(e,a),a.proofRequirements=[{title:"Screenshot Proof",type:"screenshot"}],ve(e,t,a)}),e.querySelector("#poster-mode-texts")?.addEventListener("click",()=>{oe(e,a),a.proofRequirements=[{title:"Written Text Proof",type:"text"}],ve(e,t,a)}),e.querySelector("#poster-mode-both")?.addEventListener("click",()=>{oe(e,a),a.proofRequirements=[{title:"Written Proof (e.g. Account username / ID)",type:"text"},{title:"Screenshot Proof (e.g. Completed task screenshot)",type:"screenshot"}],ve(e,t,a)});let i=e.querySelector("#proof-pairs-container");i.addEventListener("change",o=>{if(o.target.classList.contains("proof-type-select")){let d=o.target.closest(".proof-pair-row"),p=Number(d.getAttribute("data-index"));oe(e,a),a.proofRequirements[p].type=o.target.value,ve(e,t,a)}else if(o.target.classList.contains("proof-file-input")){let d=o.target.closest(".proof-pair-row"),p=Number(d.getAttribute("data-index")),u=o.target.files[0];if(u){let b=new FileReader;b.onload=y=>{oe(e,a),a.proofRequirements[p].fileBase64=y.target.result,a.proofRequirements[p].title||(a.proofRequirements[p].title="Screenshot Proof"),ve(e,t,a)},b.readAsDataURL(u)}}}),e.querySelector("#add-proof-btn").addEventListener("click",()=>{oe(e,a);let d=a.proofRequirements[a.proofRequirements.length-1]?.type==="screenshot"?"text":"screenshot";a.proofRequirements.push({title:"",type:d}),ve(e,t,a)}),i.addEventListener("click",o=>{let d=o.target.closest(".remove-proof-btn");if(d){let p=Number(d.getAttribute("data-index"));oe(e,a),a.proofRequirements.splice(p,1),a.proofRequirements.length===0&&a.proofRequirements.push({title:"Screenshot Proof",type:"screenshot"}),ve(e,t,a)}}),e.querySelector("#job-thumbnail-input").addEventListener("change",o=>{let d=o.target.files[0];if(d){let p=new FileReader;p.onload=u=>{a.thumbnailBase64=u.target.result},p.readAsDataURL(d)}}),e.querySelector("#step-cancel").addEventListener("click",fa),e.querySelector("#step-2-back").addEventListener("click",()=>{oe(e,a),a.currentStep=1,Oe(t,a)}),e.querySelector("#step-2-form").addEventListener("submit",o=>{if(o.preventDefault(),oe(e,a),!a.title.trim()){l("Job title is required.","error");return}if(!a.description.trim()){l("Task instructions are required.","error");return}a.currentStep=3,Oe(t,a)})}function oe(e,t){t.title=e.querySelector("#job-title-input")?.value||"",t.subtitle=e.querySelector("#job-subtitle-input")?.value||"",t.description=e.querySelector("#job-desc-input")?.value||"";let a=e.querySelectorAll(".proof-pair-row");a.length>0&&(t.proofRequirements=Array.from(a).map((s,r)=>{let i=s.querySelector(".proof-type-select")?.value||"screenshot",n=s.querySelector(".proof-title-input"),o=n?n.value.trim():t.proofRequirements[r]?.title||(i==="screenshot"?"Screenshot Proof":"Text Proof"),d=t.proofRequirements[r]?.fileBase64||null,p=t.proofRequirements[r]?.image_url||null;return{title:o,type:i,fileBase64:d,image_url:p}}))}function tn(e,t,a){let s=Number(a.workerCount||0)*Number(a.costPerWorker||0),r=s*(a.feePercentage/100),i=s+r;e.innerHTML=`
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
    `;let n=e.querySelector("#worker-count-input"),o=e.querySelector("#cost-per-worker-input"),d=()=>{a.workerCount=Math.max(1,parseInt(n.value,10)||1),a.costPerWorker=Math.max(0,parseFloat(o.value)||0);let p=a.workerCount*a.costPerWorker,u=p*(a.feePercentage/100),b=p+u;e.querySelector("#summary-subtotal").textContent=`\u09F3${p.toFixed(2)}`,e.querySelector("#summary-fee").textContent=`\u09F3${u.toFixed(2)}`,e.querySelector("#summary-total").textContent=`\u09F3${b.toFixed(2)}`};n.addEventListener("input",d),o.addEventListener("input",d),e.querySelector("#step-cancel").addEventListener("click",fa),e.querySelector("#step-3-back").addEventListener("click",()=>{Zs(e,a),a.currentStep=2,Oe(t,a)}),e.querySelector("#step-3-form").addEventListener("submit",async p=>{p.preventDefault(),Zs(e,a);let u=e.querySelector("#post-job-publish");u.disabled=!0,u.textContent="Publishing\u2026";let b=0,y=Number(a.biddingValue||0);y>0&&(a.biddingUnit==="minutes"?b=y/60:a.biddingUnit==="hours"?b=y:a.biddingUnit==="days"?b=y*24:a.biddingUnit==="months"&&(b=y*24*30));try{let g=await c.posterCreateJob({category_id:Number(a.mainCategoryId),subcategory_id:a.subCategoryId?Number(a.subCategoryId):null,title:a.title.trim(),subtitle:a.subtitle.trim(),description:a.description.trim(),thumbnail:a.thumbnailBase64||null,proof_requirements:a.proofRequirements,worker_count:Number(a.workerCount),cost_per_worker:Number(a.costPerWorker),budget:Number(a.workerCount)*Number(a.costPerWorker),deadline_at:an(a.deadlineAt),bidding_window_hours:b});l("Job submitted for admin review.","success");let k=v.get(),$=k&&(k.username||k.name)||"User",P=g?.data?.id||"",M=`${window.location.origin}/#/poster/jobs/${P}`,$e=`I, the user ${$}, has submitted this job ${M} for publishing. Let's talk about payment and approval`,x=`https://wa.me/8801775722083?text=${encodeURIComponent($e)}`,C=t.querySelector("#wizard-card-body");C&&(C.innerHTML=`
                    <div style="text-align:center; padding: 2rem 1rem;">
                        <div style="font-size:3rem; color:#f59e0b; margin-bottom:1rem;"><i class="bi bi-clock-history"></i></div>
                        <h2 style="margin-bottom:0.5rem;">Job Submitted & Pending Approval</h2>
                        <p class="muted" style="max-width:500px; margin:0 auto 1.5rem;">Your job has been submitted to the admin panel for review. Contact the admin on WhatsApp to talk about payment and job approval.</p>
                        
                        <div style="margin-bottom:1.5rem;">
                            <a href="${x}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--xl" style="background:#25D366; border-color:#25D366; color:#fff; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none;">
                                <i class="bi bi-whatsapp" style="font-size:1.25rem;"></i> Contact Whatsapp
                            </a>
                        </div>

                        <div>
                            <a href="#/poster/jobs" class="btn btn--ghost">Go to My Jobs</a>
                        </div>
                    </div>
                `)}catch(g){l(g.message||"Could not publish job.","error"),u.disabled=!1,u.textContent="Publish Job"}})}function Zs(e,t){t.workerCount=Number(e.querySelector("#worker-count-input")?.value||1),t.costPerWorker=Number(e.querySelector("#cost-per-worker-input")?.value||0),t.biddingValue=Number(e.querySelector("#bidding-val-input")?.value||0),t.biddingUnit=e.querySelector("#bidding-unit-input")?.value||"days",t.deadlineAt=e.querySelector("#deadline-input")?.value||""}function fa(){confirm("Are you sure you want to cancel posting this job?")&&h("/poster")}function an(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function sn(){return!!v.get()}function Le(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var ha=_(()=>{T();w()});var ar={};A(ar,{PosterJobsPage:()=>ya});function ya(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--poster-jobs",!dn()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your job listings, track worker progress, and review submissions.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar" style="margin-bottom: 16px;">
                <label>Filter Status
                    <select class="admin-select" id="poster-job-filter">
                        ${rn.map(t=>`<option value="${t}" ${t===ft?"selected":""}>${t?tr(t):"All jobs"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `,e.querySelector("#poster-jobs-new").addEventListener("click",t=>{t.preventDefault(),h("/poster/post-job")}),e.querySelector("#poster-job-filter").addEventListener("change",async t=>{ft=t.target.value,await vt()}),e.querySelector("#poster-jobs-refresh").addEventListener("click",vt),await vt()}}}async function vt(){let e=document.getElementById("poster-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=((await c.posterMyJobs()).data||[]).filter(s=>!ft||s.status===ft);e.innerHTML=a.length?"":'<p class="muted card" style="padding: 20px; text-align: center;">No jobs found for this filter.</p>',a.forEach(s=>e.appendChild(nn(s)))}catch(t){e.innerHTML=`<p class="muted card" style="padding: 20px;">Failed to load jobs: ${de(t.message||"unknown error")}</p>`}}}function nn(e){let t=document.createElement("article");t.className=`admin-row poster-job-row poster-job-row--${de(e.status)}`;let a=e.status==="pending_approval",s=e.status==="declined",r="";return!a&&!s&&(r=`
            <div class="poster-job-row__metrics">
                <div><i class="bi bi-clock-history"></i> <strong>Days Remaining:</strong> <span class="metric-highlight">${de(e.days_remaining||"N/A")}</span></div>
                <div><i class="bi bi-people"></i> <strong>Workers:</strong> ${Number(e.in_progress_workers||0)} working / ${Number(e.pending_review_workers||0)} review / ${Number(e.revision_workers||0)} revision / ${Number(e.rejected_workers||0)} rejected / ${Number(e.completed_workers_count||0)} completed</div>
                <div><i class="bi bi-check2-square"></i> <strong>Tasks Remaining:</strong> ${Number(e.remaining_tasks_count||0)} slots left</div>
            </div>
        `),t.innerHTML=`
        <div class="poster-job-row__header">
            <div>
                <strong>${de(e.title)}</strong>
                <span class="badge badge--${a?"warning":s?"danger":"success"}">${de(tr(e.status).toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${de(e.currency||"BDT")} ${Number(e.total_payable_amount||e.budget||0).toFixed(2)}</strong>
        </div>

        <p class="muted poster-job-row__description">${de(e.description||"").slice(0,220)}${String(e.description||"").length>220?"\u2026":""}</p>

        ${r}

        <div class="admin-job-row__meta">
            <span><strong>Workers Needed:</strong> ${Number(e.worker_count||1)}</span>
            <span><strong>Cost/Worker:</strong> ${de(e.currency||"BDT")} ${Number(e.cost_per_worker||0).toFixed(2)}</span>
            <span><strong>Applications/Bids:</strong> ${Number(e.bid_count||0)}</span>
            <span><strong>Views:</strong> ${Number(e.view_count||0)}</span>
            <span><strong>Created:</strong> ${ln(e.created_at)}</span>
            ${e.decline_reason?`<span style="color:#dc2626;"><strong>Decline Reason:</strong> ${de(e.decline_reason)}</span>`:""}
        </div>

        <div class="poster-job-row__actions" style="margin-top: 12px;">
            <button class="btn btn--primary btn--sm" data-view-job>Manage Job</button>
            ${["completed","cancelled","declined"].includes(e.status)?"":'<button class="btn btn--danger btn--sm" data-cancel-job>Cancel Job</button>'}
        </div>
    `,t.querySelector("[data-view-job]").addEventListener("click",()=>h(`/poster/jobs/${e.id}`)),t.querySelector("[data-cancel-job]")?.addEventListener("click",()=>on(e.id)),t}async function on(e){if(!confirm("Cancel this job? Any escrow for this job will be refunded."))return;let t=prompt("Reason (optional):","Cancelled by poster")||"Cancelled by poster";try{await c.posterCancelJob(e,{reason:t}),l("Job cancelled.","success"),await vt()}catch(a){l(a.message||"Could not cancel job.","error")}}function dn(){return!!v.get()}function tr(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function ln(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function de(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var rn,ft,wa=_(()=>{T();w();rn=["","pending_approval","open","assigned","submitted","revision","completed","declined","cancelled","disputed"],ft=""});var sr={};A(sr,{PosterWalletPage:()=>$a});function $a(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--poster-wallet",!v.get()){e.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML='<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>';try{let[a,s]=await Promise.all([c.posterStats(),c.paymentSubmissions()]);cn(e.querySelector("#poster-wallet-content"),a.data||{},s.data||[])}catch(a){e.querySelector("#poster-wallet-content").innerHTML=`<p class="muted">Failed to load wallet: ${ht(a.message||"unknown error")}</p>`}}}function cn(e,t,a){let s=_a(t.wallet_balance),r=_a(t.frozen_balance),i=_a(t.total_spent);e.innerHTML=`
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>\u09F3${s}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>\u09F3${r}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>\u09F3${i}</strong></div></div>
        ${""}
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${pn(a)}</div></div>
    `,e.querySelector("#poster-wallet-deposit")?.addEventListener("click",()=>h("/deposit"))}function pn(e){return e.length?e.map(t=>`<div class="poster-deposit-row"><span><strong>${ht((t.gateway||"").toUpperCase())}</strong><small>${ht(t.trxid)} \xB7 ${un(t.created_at)}</small></span><span><strong>\u09F3${Number(t.amount||0).toFixed(2)}</strong><small>${ht(t.status||"")}</small></span></div>`).join(""):'<p class="muted">No deposits submitted yet.</p>'}function _a(e){let t=Number(e||0);return Number.isFinite(t)?t.toFixed(2):"0.00"}function un(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ht(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Sa=_(()=>{T();w();Te()});var nr={};A(nr,{AdminPage:()=>ka});function ka(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin";let t=v.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
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
                ${""}
                <button class="admin-tab" data-tab="users"><i class="bi bi-people"></i> Users & Roles</button>
                <button class="admin-tab" data-tab="providers"><i class="bi bi-play-circle"></i> Ad Providers</button>
                <button class="admin-tab" data-tab="video-ads"><i class="bi bi-film"></i> Video Ads</button>
                <button class="admin-tab" data-tab="fraud"><i class="bi bi-shield-exclamation"></i> Fraud Review</button>
            </div>
            <div class="admin-tab-content" id="admin-content"><div class="spinner"></div></div>
        `;let a=e.querySelectorAll(".admin-tab"),s=e.querySelector("#admin-content");a.forEach(o=>{o.addEventListener("click",()=>{a.forEach(d=>d.classList.remove("admin-tab--active")),o.classList.add("admin-tab--active"),rr(o.dataset.tab,s)})});let i=new URLSearchParams(window.location.hash.split("?")[1]||"").get("tab"),n=["stats","withdrawals","payments","users","providers","video-ads","fraud"].includes(i)?i:"stats";a.forEach(o=>o.classList.toggle("admin-tab--active",o.dataset.tab===n)),rr(n,s)}}async function rr(e,t){t.innerHTML="Loading\u2026";try{if(e==="stats"){let[a,s]=await Promise.all([c.adminStats(),c.adminRevenue()]),r=a.data||{},i=s.data||{},n=r.marketplace||{},o=i.currency_symbol||"\u09F3";t.innerHTML=`
                <div class="stat-grid admin-revenue-grid">
                    ${Q("bi-graph-up-arrow","Platform revenue",ee(i.platform_revenue,o))}
                    ${Q("bi-percent","Commission rate",`${(Number(i.commission_rate||0)*100).toFixed(2)}%`)}
                    ${Q("bi-briefcase","Total jobs",N(i.total_jobs))}
                    ${Q("bi-check2-circle","Completed jobs",N(i.completed_jobs))}
                    ${Q("bi-lightning-charge","Active jobs",N(i.active_jobs))}
                    ${Q("bi-people","Total users",N(i.total_users))}
                    ${Q("bi-person-check","Active users",N(r.active_users))}
                    ${Q("bi-hourglass-split","Pending deposits",N(i.pending_payments))}
                    ${Q("bi-lock","Held in escrow",ee(i.escrow_total,o))}
                    ${Q("bi-hourglass-split","Pending submissions",N(n.pending_submissions))}
                    ${Q("bi-shield-exclamation","Flagged submissions",N(n.flagged_submissions))}
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
                        <div><span class="muted">Withdrawals</span><strong>${N(r.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${N(r.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${N(r.total_ad_views)}</strong></div>
                        <div><span class="muted">Completed ad views</span><strong>${N(r.completed_ad_views)}</strong></div>
                        <div><span class="muted">Video ad views</span><strong>${N(r.video_ad_views)}</strong></div>
                        <div><span class="muted">Completed video ads</span><strong>${N(r.video_completed_views)}</strong></div>
                        <div><span class="muted">Video rewards paid</span><strong>${ee(r.video_rewards_paid,o)}</strong></div>
                        <div><span class="muted">Eligible rewards</span><strong>${N(r.eligible_rewards)}</strong></div>
                        <div><span class="muted">User ad rewards</span><strong>${ee(r.user_ad_rewards,o)}</strong></div>
                        <div><span class="muted">Banned users</span><strong>${N(r.banned_users)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${ee(r.total_lifetime_paid,o)}</strong></div>
                        <div><span class="muted">Pending jobs</span><strong>${N(n.pending_jobs)}</strong></div>
                        <div><span class="muted">Rejected jobs</span><strong>${N(n.rejected_jobs)}</strong></div>
                        <div><span class="muted">Total workers</span><strong>${N(n.total_workers)}</strong></div>
                        <div><span class="muted">Approved submissions</span><strong>${N(n.approved_submissions)}</strong></div>
                        <div><span class="muted">Rejected submissions</span><strong>${N(n.rejected_submissions)}</strong></div>
                        <div><span class="muted">Job budget</span><strong>${ee(n.total_job_budget,o)}</strong></div>
                        <div><span class="muted">Completed payments</span><strong>${ee(n.completed_payment,o)}</strong></div>
                        <div><span class="muted">Pending payments</span><strong>${ee(n.pending_payment,o)}</strong></div>
                        <div><span class="muted">Commissions</span><strong>${ee(n.commissions,o)}</strong></div>
                        <div><span class="muted">Worker earnings</span><strong>${ee(n.worker_earnings,o)}</strong></div>
                        <div><span class="muted">Ad rewards</span><strong>${ee(n.ad_earnings,o)}</strong></div>
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
            `;let d=t.querySelector("#btn-reset-counters");d&&d.addEventListener("click",async()=>{if(confirm("Reset daily ad view counters for all users?"))try{let p=await c.adminResetDailyCounters();l(p.message||"Daily counters reset.","success")}catch(p){l(p.message||"Reset failed.","error")}})}else if(e==="withdrawals"){let s=(await c.adminWithdrawals("pending")).data||[];t.innerHTML=`
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${s.length===0?'<p class="muted">No pending withdrawals.</p>':""}</div>
            `;let r=t.querySelector("#wd-list");s.forEach(i=>r.appendChild(ir(i,r))),t.querySelector("#wd-filter").addEventListener("change",async i=>{let n=await c.adminWithdrawals(i.target.value);r.innerHTML="",(n.data||[]).forEach(o=>r.appendChild(ir(o,r)))})}else if(e==="payments"){window.location.hash="#/admin/payments";return}else if(e==="users"){let s=(await c.adminUsers()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list"),i=Number(v.get()?.id||0);s.forEach(n=>{let o=document.createElement("div");o.className="admin-row",o.innerHTML=`
                    <div>
                        <strong>${q(n.name)}</strong>
                        <span class="muted">${q(n.email)}</span>
                        <span class="badge user-role-badge">${q(n.role||(n.is_admin?"admin":"worker")).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: \u09F3${Number(n.balance||0).toFixed(2)} \xB7 Earned: \u09F3${Number(n.lifetime_earned||0).toFixed(2)}</span>
                        <span class="badge user-status-badge ${n.is_banned?"badge--danger":"badge--success"}">${n.is_banned?"BANNED":"ACTIVE"}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(n.id)===i?"disabled":""}>
                                ${["worker","poster","admin"].map(p=>`<option value="${p}" ${(n.role||(n.is_admin?"admin":"worker"))===p?"selected":""}>${p[0].toUpperCase()+p.slice(1)}</option>`).join("")}
                            </select>
                        </label>
                    </div>
                `;let d=o.querySelector(".admin-user-role");if(d?.addEventListener("change",async()=>{let p=n.role||(n.is_admin?"admin":"worker");try{let u=await c.adminUpdateUserRole(n.id,d.value);n.role=u.data?.role||d.value,n.is_admin=!!u.data?.is_admin,o.querySelector(".user-role-badge").textContent=n.role.toUpperCase(),l("User role updated","success")}catch(u){d.value=p,l(u.message||"Role update failed","error")}}),Number(n.id)!==i){let p=document.createElement("button");p.className=`btn ${n.is_banned?"btn--success":"btn--danger"} btn--sm`,p.textContent=n.is_banned?"Unban user":"Ban user",p.addEventListener("click",async()=>{let u=prompt(n.is_banned?"Reason for unbanning:":"Reason for banning this user:",n.ban_reason||"");if(!(u===null||!n.is_banned&&!u.trim()))try{let b=n.is_banned?await c.adminUnbanUser(n.id,{reason:u}):await c.adminBanUser(n.id,{reason:u});n.is_banned=!!b.data?.is_banned,n.ban_reason=n.is_banned?u:null,p.className=`btn ${n.is_banned?"btn--success":"btn--danger"} btn--sm`,p.textContent=n.is_banned?"Unban user":"Ban user";let y=o.querySelector(".user-status-badge");y&&(y.className=`badge user-status-badge ${n.is_banned?"badge--danger":"badge--success"}`,y.textContent=n.is_banned?"BANNED":"ACTIVE"),l(b.message||"User status updated.","success")}catch(b){l(b.message||"Could not update user status.","error")}}),o.querySelector(".admin-user-controls").appendChild(p)}r.appendChild(o)})}else if(e==="providers"){let s=(await c.adminProviders()).data||[];t.innerHTML='<div class="admin-list"></div>';let r=t.querySelector(".admin-list");s.forEach(i=>r.appendChild(mn(i,r)))}else if(e==="video-ads")await xa(t);else if(e==="fraud"){let s=(await c.adminFraudSubmissions()).data||[];t.innerHTML='<div class="card"><p class="muted">Risk signals are advisory. Confirm fraud only after reviewing the proof. A confirmed decision can optionally ban the worker and revoke active sessions.</p></div><div class="admin-list" id="fraud-list"></div>';let r=t.querySelector("#fraud-list");s.length||(r.innerHTML='<p class="muted">No flagged submissions.</p>'),s.forEach(i=>{let n=document.createElement("div");n.className="admin-row",n.innerHTML=`
                    <div>
                        <strong>${q(i.worker_name||"Unknown worker")}</strong>
                        <span class="muted">${q(i.worker_email||"")} \xB7 Job: ${q(i.job_title||"")}</span>
                        <p>${q(i.description||"")}</p>
                        <span class="badge badge--danger">Risk ${Number(i.risk_score||0).toFixed(0)}</span>
                        <span class="muted">${q((i.risk_flags||[]).join(", ")||"Manual review")}</span>
                        ${i.attachment_url?`<a href="${q(i.attachment_url)}" target="_blank" rel="noopener">Open proof</a>`:""}
                    </div>
                    <div class="admin-row__actions"><button class="btn btn--success btn--sm" data-fraud-decision="cleared">Clear</button><button class="btn btn--danger btn--sm" data-fraud-decision="confirmed_fraud">Confirm fraud</button></div>
                `,n.querySelectorAll("[data-fraud-decision]").forEach(o=>o.addEventListener("click",async()=>{let d=o.dataset.fraudDecision,p=d==="confirmed_fraud"?prompt("Reason for confirming fraud:"):prompt("Optional review note:")||"";if(p===null||d==="confirmed_fraud"&&!p.trim())return;let u=d==="confirmed_fraud"&&confirm("Also ban this worker and revoke active sessions?");try{let b=await c.adminReviewFraud(i.id,{decision:d,note:p,ban_user:u});l(b.data?.user_banned?"Fraud review saved and worker banned.":"Fraud review saved.","success"),n.remove(),r.children.length||(r.innerHTML='<p class="muted">No flagged submissions.</p>')}catch(b){l(b.message||"Fraud review failed.","error")}})),r.appendChild(n)})}}catch{t.innerHTML='<p class="muted">Failed to load.</p>'}}function Q(e,t,a){return`
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${e} admin-stat-tile__icon"></i>
            <span class="muted">${q(t)}</span>
            <strong>${q(String(a))}</strong>
        </div>
    `}function N(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function ee(e,t){let a=Number(e||0);return`${t}${Number.isFinite(a)?a.toFixed(2):"0.00"}`}function ir(e,t){let a=document.createElement("div");if(a.className="admin-row admin-row--withdrawal",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${q(e.user_name||"User #"+e.user_id)}</strong>
            <span class="muted">${q(e.user_email||"")}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(e.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${q(e.gateway)} \xB7 ${q(e.wallet_address)}</div>
        <div class="admin-row__status">${q(e.status.toUpperCase())}</div>
    `,e.status==="pending"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--success btn--sm",r.textContent="Approve",r.addEventListener("click",async()=>{try{await c.adminApprove(e.id,{admin_note:"Approved by admin"}),l("Withdrawal approved","success"),a.remove()}catch(n){l(n.message,"error")}});let i=document.createElement("button");i.className="btn btn--danger btn--sm",i.textContent="Reject",i.addEventListener("click",async()=>{let n=prompt("Reason for rejection (optional):","Invalid wallet address");try{await c.adminReject(e.id,{admin_note:n||""}),l("Withdrawal rejected (refunded)","info"),a.remove()}catch(o){l(o.message,"error")}}),s.appendChild(r),s.appendChild(i),a.appendChild(s)}else if(e.status==="approved"){let s=document.createElement("div");s.className="admin-row__actions";let r=document.createElement("button");r.className="btn btn--primary btn--sm",r.textContent="Mark as Paid",r.addEventListener("click",async()=>{try{await c.adminPay(e.id,{admin_note:"Paid by admin"}),l("Marked as paid","success"),a.remove()}catch(i){l(i.message,"error")}}),s.appendChild(r),a.appendChild(s)}return a}function mn(e,t){let a=document.createElement("div");a.className="admin-row admin-row--provider";let s=!!e.enabled,r=e.block_id||"";return a.innerHTML=`
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
    `,a.querySelector(".provider-save").addEventListener("click",async()=>{let i={block_id:a.querySelector(".provider-block-id").value.trim()||null,weight:parseInt(a.querySelector(".provider-weight").value,10)||0,reward_per_view:parseFloat(a.querySelector(".provider-reward").value)||0,min_duration_seconds:parseInt(a.querySelector(".provider-duration").value,10)||12,enabled:a.querySelector(".provider-enabled").checked};try{await c.adminUpdateProvider(e.id,i),l("Provider saved","success")}catch(n){l(n.message,"error")}}),a}async function xa(e){let a=(await c.adminVideoAds()).data||[];e.innerHTML=`
        <form class="card admin-video-ad-form" id="video-ad-form">
            <h3 class="card__title">Add sponsored video</h3>
            <div class="admin-row__form">
                <label>Title <input name="title" required maxlength="160"></label>
                <label>Video file (optional if URL is provided) <input name="video" type="file" accept="video/*"></label><label>HTTPS video URL (optional if file is provided) <input name="video_url" type="url" placeholder="https://cdn.example.com/ad.mp4"></label>
                <label>Duration (seconds) <input name="duration_seconds" type="number" min="1" value="10" required></label>
                <label>Reward <input name="reward_amount" type="number" min="0" step="0.0001" value="0.005" required></label>
                <label>Daily limit (0 = unlimited) <input name="daily_limit" type="number" min="0" value="0"></label>
                <label>Total limit (0 = unlimited) <input name="total_limit" type="number" min="0" value="0"></label>
                <button class="btn btn--primary btn--sm" type="submit">Upload video ad</button>
            </div>
        </form>
        <div class="admin-list" id="video-ad-list"></div>
    `;let s=e.querySelector("#video-ad-list");a.length||(s.innerHTML='<p class="muted">No video ads configured.</p>'),a.forEach(r=>s.appendChild(bn(r,s))),e.querySelector("#video-ad-form").addEventListener("submit",async r=>{r.preventDefault();let i=r.currentTarget;try{await c.adminCreateVideoAd(new FormData(i)),l("Video ad uploaded.","success"),await xa(e)}catch(n){l(n.message||"Video upload failed.","error")}})}function bn(e,t){let a=document.createElement("div");return a.className="admin-row admin-row--provider",a.innerHTML=`
        <div class="admin-row__main">
            <strong>${q(e.title)}</strong>
            <span class="muted">${e.duration_seconds}s \xB7 reward ${Number(e.reward_amount||0).toFixed(4)} \xB7 ${Number(e.completed_views||0)}/${Number(e.total_views||0)} completed</span>
            <span class="badge ${e.status==="active"?"badge--green":""}">${q(String(e.status||"").toUpperCase())}</span>
        </div>
        <div class="admin-row__actions">
            <button class="btn btn--ghost btn--sm video-ad-toggle">${e.status==="active"?"Pause":"Activate"}</button>
            <button class="btn btn--danger btn--sm video-ad-delete">Delete</button>
        </div>
    `,a.querySelector(".video-ad-toggle").addEventListener("click",async()=>{let s=new FormData;s.append("status",e.status==="active"?"paused":"active");try{await c.adminUpdateVideoAd(e.id,s),l("Video ad status updated.","success"),await xa(t.parentElement)}catch(r){l(r.message||"Could not update video ad.","error")}}),a.querySelector(".video-ad-delete").addEventListener("click",async()=>{if(confirm(`Delete \u201C${e.title}\u201D?`))try{await c.adminDeleteVideoAd(e.id),l("Video ad deleted.","success"),a.remove()}catch(s){l(s.message||"Could not delete video ad.","error")}}),a}function q(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ta=_(()=>{T();w();w();Te()});var lr={};A(lr,{AdminPaymentsPage:()=>Ca});function Ca(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-payments";let t=v.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${le.status==="pending"?"admin-tab--active":""}" data-status="pending">Pending</button>
                <button class="admin-tab ${le.status==="approved"?"admin-tab--active":""}" data-status="approved">Approved</button>
                <button class="admin-tab ${le.status==="rejected"?"admin-tab--active":""}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${le.status===""?"admin-tab--active":""}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `,e.querySelectorAll(".admin-tab").forEach(a=>{a.addEventListener("click",()=>{le.status=a.getAttribute("data-status"),e.querySelectorAll(".admin-tab").forEach(s=>s.classList.remove("admin-tab--active")),a.classList.add("admin-tab--active"),Aa()})}),await Aa()}}async function Aa(){let e=document.getElementById("admin-payments-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=await c.adminPayments(le.status);le.items=t.data||[],vn(e)}catch(t){e.innerHTML=`<p class="muted">Error: ${ye(t.message||"Failed to load.")}</p>`}}}function vn(e){if(le.items.length===0){e.innerHTML='<p class="muted">No payment submissions found.</p>';return}e.innerHTML="",le.items.forEach(t=>e.appendChild(fn(t)))}function fn(e){let t=gn[e.status]||{label:e.status,class:""},a=document.createElement("div");return a.className=`admin-row admin-row--payment ${t.class}`,a.innerHTML=`
        <div class="admin-row__main">
            <div class="admin-row__amount">\u09F3 ${parseFloat(e.amount).toFixed(2)} <span class="badge badge--gateway">${ye((e.gateway||"").toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${ye(e.trxid)}</code>
                &nbsp;\u2022&nbsp;
                <strong>From:</strong> ${ye(e.sender_number)}
                ${e.user?`&nbsp;\u2022&nbsp;<strong>User:</strong> ${ye(e.user.name)} <span class="muted">(${ye(e.user.email)})</span>`:""}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${t.label}</span>
                &nbsp;\u2022&nbsp;
                <span class="muted">Submitted: ${dr(e.created_at)}</span>
                ${e.verified_at?`&nbsp;\u2022&nbsp;<span class="muted">Verified: ${dr(e.verified_at)}</span>`:""}
            </div>
            ${e.admin_note?`<div class="admin-row__note"><em>Note:</em> ${ye(e.admin_note)}</div>`:""}
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
    `,e.status==="pending"&&(a.querySelector('[data-action="approve"]')?.addEventListener("click",()=>or(e.id,"approve",a)),a.querySelector('[data-action="reject"]')?.addEventListener("click",()=>or(e.id,"reject",a))),a}async function or(e,t,a){let s=prompt(t==="approve"?"Optional note for approval:":"Reason for rejection:");if(s!==null)try{let i=await(t==="approve"?c.adminApprovePayment:c.adminRejectPayment)(e,{note:s||null});l(i.message||"Done.","success"),await Aa()}catch(r){l(r.message||"Action failed.","error")}}function dr(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function ye(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var gn,le,La=_(()=>{T();w();gn={pending:{label:"Pending",class:"payment-row--pending"},approved:{label:"Approved",class:"payment-row--approved"},rejected:{label:"Rejected",class:"payment-row--rejected"}},le={status:"pending",items:[],loading:!1}});var yt={};A(yt,{AdminJobsPage:()=>We});function We(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.innerHTML="",e.className="view view--admin-jobs",!v.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}let t=window.location.hash.replace(/^#/,"").split("?")[0];t==="/admin/pending-jobs"?X="pending_approval":t==="/admin/active-jobs"&&(X="open"),e.innerHTML=`
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Job Management Center</h1>
                    <p class="muted">Review pending user job postings, activate approved jobs, track live active jobs, and inspect worker proofs & screenshots.</p>
                </div>
                <button class="btn btn--primary" id="admin-create-job"><i class="bi bi-plus-circle"></i> Admin Job Post</button>
            </div>

            <div class="admin-tabs" style="margin-bottom: 20px;">
                <button class="admin-tab ${X==="pending_approval"?"admin-tab--active":""}" data-status="pending_approval">
                    <i class="bi bi-file-earmark-plus"></i> Job Post (Pending Approval)
                </button>
                <button class="admin-tab ${X==="open"?"admin-tab--active":""}" data-status="open">
                    <i class="bi bi-lightning-charge"></i> Active Job
                </button>
                <button class="admin-tab ${X==="all"?"admin-tab--active":""}" data-status="all">
                    <i class="bi bi-list-task"></i> All Jobs Moderation
                </button>
            </div>

            <div class="admin-toolbar" style="margin-bottom: 16px;">
                <label>Filter Status
                    <select class="admin-select" id="admin-job-status">
                        ${hn.map(s=>`<option value="${s.value}" ${s.value===X?"selected":""}>${s.label}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>

            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
            <div id="admin-proof-modal-container"></div>
        `;let a=e.querySelectorAll(".admin-tab");a.forEach(s=>{s.addEventListener("click",async()=>{a.forEach(i=>i.classList.remove("admin-tab--active")),s.classList.add("admin-tab--active"),X=s.dataset.status;let r=e.querySelector("#admin-job-status");r&&(r.value=X),await fe()})}),e.querySelector("#admin-job-status").addEventListener("change",async s=>{X=s.target.value,a.forEach(r=>r.classList.toggle("admin-tab--active",r.dataset.status===X)),await fe()}),e.querySelector("#admin-job-refresh").addEventListener("click",fe),e.querySelector("#admin-create-job").addEventListener("click",()=>h("/admin/admin-job-post")),await fe()}}async function fe(){let e=document.getElementById("admin-jobs-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let t=X==="all"?"":X,s=(await c.adminJobs(t)).data||[];e.innerHTML=s.length?"":'<p class="muted card" style="padding:20px; text-align:center;">No jobs found for this section.</p>',s.forEach(r=>e.appendChild(yn(r)))}catch(t){e.innerHTML=`<p class="muted card" style="padding:20px;">Failed to load jobs: ${E(t.message||"unknown error")}</p>`}}}function yn(e){let t=document.createElement("article");t.className=`admin-row admin-job-row admin-job-row--${E(e.status)}`;let a=e.status==="pending_approval",s=e.status==="declined",r="";!a&&!s&&(r=`
            <div class="admin-job-row__metrics">
                <div><i class="bi bi-clock-history"></i> <strong>Days Remaining:</strong> <span class="metric-highlight">${E(e.days_remaining||"N/A")}</span></div>
                <div><i class="bi bi-people"></i> <strong>Workers:</strong> ${Number(e.in_progress_workers||0)} working / ${Number(e.pending_review_workers||0)} review / ${Number(e.revision_workers||0)} revision / ${Number(e.rejected_workers||0)} rejected / ${Number(e.completed_workers||0)} completed</div>
                <div><i class="bi bi-hourglass-split"></i> <strong>Unassigned:</strong> ${Number(e.remaining_workers??e.remaining_tasks_count??0)} slots</div>
                <div><i class="bi bi-cash-stack"></i> <strong>Paid:</strong> ${E(e.currency||"BDT")} ${Number(e.completed_amount||0).toFixed(2)} / <strong>Remaining:</strong> ${Number(e.remaining_amount||0).toFixed(2)}</div>
            </div>
        `),t.innerHTML=`
        <div class="admin-job-row__header">
            <div>
                <strong>${E(e.title)}</strong>
                <span class="badge badge--${a?"warning":s?"danger":"success"}">${E(String(e.status||"").replace("_"," ").toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${E(e.currency||"BDT")} ${Number(e.total_payable_amount||e.budget||0).toFixed(2)}</strong>
        </div>

        <p class="admin-job-row__description muted">${E(e.description||"")}</p>
        ${e.subtitle?`<p class="muted"><strong>Subtitle:</strong> <span data-i18n-ignore>${E(e.subtitle)}</span></p>`:""}

        ${r}

        <div class="admin-job-row__meta">
            <span><strong>Customer:</strong> ${E(e.customer_name||e.poster?.name||"(deleted)")} (${E(e.customer_email||e.poster?.email||"")})</span>
            ${e.customer_phone?`<span><strong>Phone:</strong> ${E(e.customer_phone)}</span>`:""}
            <span><strong>Category:</strong> ${E(e.category_name||"Uncategorized")}</span>
            <span><strong>Workers Needed:</strong> ${Number(e.worker_count||1)}</span>
            <span><strong>Cost/Worker:</strong> ${E(e.currency||"BDT")} ${Number(e.cost_per_worker||0).toFixed(2)}</span>
            ${e.decline_reason?`<span style="color:#dc2626;"><strong>Decline Reason:</strong> ${E(e.decline_reason)}</span>`:""}
        </div>

        <div class="admin-job-row__footer">
            <span class="muted">Submitted: ${br(e.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;let i=t.querySelector(".admin-row__actions");if(!a&&!s&&(i.appendChild(we("View Job Details","btn--ghost",()=>h(`/admin/jobs/${e.id}`))),i.appendChild(we("View Proofs & Screenshots","btn--ghost",()=>mr(e.id,e.title)))),a){let n=we("Activate Job","btn--success",()=>_n(e.id,n));Ee.has(e.id)&&Ea(n),i.appendChild(n),i.appendChild(we("Decline","btn--danger",()=>$n(e.id)))}else e.status==="disputed"?(i.appendChild(we("Release Payment","btn--success",()=>ur(e.id,"release"))),i.appendChild(we("Cancel & Refund","btn--danger",()=>ur(e.id,"cancel")))):["completed","cancelled","declined"].includes(e.status)||i.appendChild(we("Mark Disputed","btn--danger",()=>Sn(e.id)));return t}function we(e,t,a){let s=document.createElement("button");return s.className=`btn ${t} btn--sm`,s.textContent=e,s.addEventListener("click",a),s}async function mr(e,t){let a=document.getElementById("admin-proof-modal-container");if(!a)return;a.innerHTML=`
        <div class="modal-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; padding:12px; box-sizing:border-box;">
            <div class="modal-card" style="background:var(--card, #fff); width:100%; max-width:800px; max-height:85vh; border-radius:12px; padding:18px; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.2); box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:8px;">
                    <h2 style="margin:0; font-size:16px; min-width:0; overflow-wrap:anywhere;"><i class="bi bi-file-earmark-check"></i> Proof Submissions for "${E(t)}"</h2>
                    <button class="btn btn--ghost btn--sm" id="close-proof-modal" style="flex-shrink:0;"><i class="bi bi-x-lg"></i> Close</button>
                </div>
                <div id="proof-modal-content"><div class="spinner"></div></div>
            </div>
        </div>
    `,a.querySelector("#close-proof-modal").addEventListener("click",()=>{a.innerHTML=""});let r=a.querySelector("#proof-modal-content");try{let o=((await c.adminJobSubmissions(e)).data||{}).submissions||[];if(!o.length){r.innerHTML='<p class="muted" style="text-align:center; padding:30px;">No worker submissions or proof screenshots submitted yet for this job.</p>';return}r.innerHTML=o.map(d=>{let p=d.work_proof_data||{},u=d.attachment_url||(d.attachment_path?d.attachment_path.startsWith("http")?d.attachment_path:`/storage/${d.attachment_path}`:null),b=String(d.attachment_path||""),y=!!(u&&(/\.(jpg|jpeg|png|gif|webp)$/i.test(u)||/\.(jpg|jpeg|png|gif|webp)$/i.test(b))),g=y?"View screenshot":"Open proof attachment";return`
                <div class="card" style="margin-bottom:16px; padding:16px; border:1px solid #e2e8f0; border-radius:8px; background:#f9fafb;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div>
                            <strong><i class="bi bi-person"></i> ${E(d.worker_name)}</strong>
                            <span class="muted">User ID #${E(d.worker_id)} \xB7 ${E(d.worker_phone||"Phone unavailable")} \xB7 ${E(d.worker_email||d.worker_username||"")}</span>
                        </div>
                        <span class="badge badge--${d.status==="approved"?"success":"warning"}">${E(d.status.toUpperCase())}</span>
                    </div>

                    ${d.description?`<p style="margin:8px 0; font-size:14px; background:#fff; padding:10px; border-radius:6px; border:1px solid #edf2f7;"><strong>Proof Description:</strong><br>${E(d.description)}</p>`:""}

                    ${d.external_link?`<div style="margin:8px 0;"><a href="${E(d.external_link)}" target="_blank" class="btn btn--ghost btn--sm"><i class="bi bi-box-arrow-up-right"></i> Open External Proof Link</a></div>`:""}

                    ${u?`
                        <div style="margin:10px 0;">
                            <strong>Proof Screenshot / Attachment:</strong><br>
                            <button type="button" class="btn btn--ghost btn--sm" data-proof-attachment="${Number(d.id)}"><i class="bi ${y?"bi-image":"bi-file-earmark-text"}"></i> ${g}</button>
                        </div>
                    `:""}

                    ${d.trx_id?`<div style="font-size:12px; color:#475569; margin-top:6px;"><strong>TrxID:</strong> ${E(d.trx_id)} | <strong>bKash:</strong> ${E(d.bkash_number||"N/A")}</div>`:""}

                    <div style="font-size:12px; color:#64748b; margin-top:8px;">Submitted on: ${br(d.submitted_at||d.created_at)} \xB7 Attempt ${Number(d.attempt_number||1)}</div>
                </div>
            `}).join(""),r.querySelectorAll("[data-proof-attachment]").forEach(d=>d.addEventListener("click",()=>wn(d.dataset.proofAttachment))),r.querySelectorAll(".card").forEach((d,p)=>{let u=o[p];if(!u||u.status!=="pending_review")return;let b=document.createElement("div");b.style.cssText="display:flex; gap:8px; margin-top:12px;";let y=document.createElement("button");y.className="btn btn--success btn--sm",y.textContent="Approve for payment review",y.addEventListener("click",()=>cr(u,e,t,y,g));let g=document.createElement("button");g.className="btn btn--danger btn--sm",g.textContent="Reject",g.addEventListener("click",()=>cr(u,e,t,g,y)),b.append(y,g),d.appendChild(b)})}catch(i){r.innerHTML=`<p class="muted">Failed to load submissions: ${E(i.message||"unknown error")}</p>`}}async function wn(e){let t=window.open("about:blank","_blank","noopener,noreferrer");try{let a=await c.proofAttachment(e),s=URL.createObjectURL(a);t?t.location.href=s:window.location.href=s,setTimeout(()=>URL.revokeObjectURL(s),6e4)}catch(a){t&&t.close(),l(a.message||"Could not open the proof attachment.","error")}}async function cr(e,t,a,s,r){let i=s.textContent.startsWith("Approve")?"approve":"reject",n=i==="reject"?prompt("Rejection reason:"):prompt("Optional admin note:")||"";if(n!==null){if(i==="reject"&&!n.trim()){l("A rejection reason is required.","error");return}s.disabled=!0,r.disabled=!0;try{await c.adminReviewSubmission(e.id,{decision:i,note:n}),l(i==="approve"?"Submission approved for payment review.":"Submission rejected.","success"),await mr(t,a)}catch(o){s.disabled=!1,r.disabled=!1,l(o.message||"Could not review submission.","error")}}}function Ea(e){e&&(e.disabled=!0,e.setAttribute("aria-busy","true"),e.innerHTML='<i class="bi bi-hourglass-split"></i> Activating...')}function pr(e){!e||!e.isConnected||(e.disabled=!1,e.removeAttribute("aria-busy"),e.innerHTML="Activate Job")}async function _n(e,t){if(Ee.has(e)){Ea(t);return}if(confirm("Approve and activate this job post?")){Ee.add(e),Ea(t);try{await c.adminApproveJob(e),l("Job approved and activated!","success"),Ee.delete(e),await fe()}catch(a){Ee.delete(e),pr(t),l(a.message||"Could not approve job.","error")}finally{Ee.delete(e),pr(t)}}}async function $n(e){let t=prompt("Reason for declining this job post:");if(t!==null)try{await c.adminDeclineJob(e,{reason:t}),l("Job declined.","info"),await fe()}catch(a){l(a.message||"Could not decline job.","error")}}async function Sn(e){if(confirm("Flag this job for admin dispute review?"))try{await c.adminFlagJobDispute(e),l("Job flagged for dispute review.","success"),await fe()}catch(t){l(t.message||"Could not flag job.","error")}}async function ur(e,t){if(!confirm(t==="release"?"Release the held payment to the worker and close this dispute?":"Cancel this job and refund its escrow to the poster?"))return;let s=t==="cancel"?prompt("Reason for cancellation:","Resolved by admin")||"Resolved by admin":"";try{await c.adminResolveJob(e,{resolution:t,reason:s}),l(t==="release"?"Payment released.":"Job cancelled and escrow refunded.","success"),await fe()}catch(r){l(r.message||"Could not resolve dispute.","error")}}function br(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function E(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var hn,X,Ee,Ve=_(()=>{T();w();hn=[{value:"pending_approval",label:"Job Post (Pending Approval)"},{value:"open",label:"Active Job"},{value:"all",label:"All Jobs"},{value:"in_review",label:"In Review"},{value:"assigned",label:"Assigned"},{value:"submitted",label:"Submitted"},{value:"revision",label:"Revision"},{value:"disputed",label:"Disputed"},{value:"completed",label:"Completed"},{value:"declined",label:"Declined"},{value:"cancelled",label:"Cancelled"},{value:"expired",label:"Expired"}],X="pending_approval",Ee=new Set});var gr={};A(gr,{AdminTransactionsPage:()=>ja});function ja(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-transactions",!v.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${kn.map(t=>`<option value="${t}" ${t===qa?"selected":""}>${t?t.replace("_"," ").replace(/\b\w/g,a=>a.toUpperCase()):"All transactions"}</option>`).join("")}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `,e.querySelector("#admin-transaction-type").addEventListener("change",async t=>{qa=t.target.value,await Pa()}),e.querySelector("#admin-transaction-refresh").addEventListener("click",Pa),await Pa()}}}async function Pa(){let e=document.getElementById("admin-transactions-list");if(e){e.innerHTML='<div class="spinner"></div>';try{let a=(await c.adminTransactions({type:qa})).data||[];e.innerHTML=a.length?"":'<p class="muted">No transactions found for this filter.</p>',a.forEach(s=>e.appendChild(xn(s)))}catch(t){e.innerHTML=`<p class="muted">Failed to load ledger: ${ce(t.message||"unknown error")}</p>`}}}function xn(e){let t=document.createElement("article");return t.className=`admin-row admin-transaction-row admin-transaction-row--${ce(e.type)}`,t.innerHTML=`
        <div class="admin-transaction-row__header">
            <div>
                <strong>${ce(String(e.type||"").replace("_"," ").toUpperCase())}</strong>
                <span class="badge">#${Number(e.id||0)}</span>
            </div>
            <strong class="admin-row__amount">${ce(e.currency||"BDT")} ${Number(e.amount||0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${ce(e.user_name||"Platform")} ${e.user_email?`<span class="muted">(${ce(e.user_email)})</span>`:""}</span>
            <span><strong>Job:</strong> ${ce(e.job_title||(e.job_id?`#${e.job_id}`:"\u2014"))}</span>
            <span><strong>Date:</strong> ${Tn(e.created_at)}</span>
        </div>
        ${e.note?`<p class="muted admin-transaction-row__note">${ce(e.note)}</p>`:""}
        ${e.reference?`<code class="admin-transaction-row__reference">${ce(e.reference)}</code>`:""}
    `,t}function Tn(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function ce(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var kn,qa,Na=_(()=>{T();w();kn=["","deposit","withdrawal","escrow_hold","escrow_release","commission","refund","adjustment"],qa=""});var vr={};A(vr,{AdminReportsPage:()=>Ma});function Ma(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-reports",!v.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row"><div><h1 class="page-title">Reports</h1><p class="muted">Aggregated transaction volume, assignment payments, submission risk, and marketplace job value.</p></div><button class="btn btn--ghost btn--sm" id="export-admin-report"><i class="bi bi-download"></i> Export CSV</button></div>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `,e.querySelector("#export-admin-report")?.addEventListener("click",An),await Cn()}}}async function An(){try{let e=await c.adminReportsExport(),t=URL.createObjectURL(e),a=document.createElement("a");a.href=t,a.download="jmjob-report.csv",document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(t)}catch(e){alert(e.message||"Could not export the report.")}}async function Cn(){let e=document.getElementById("admin-reports-content");if(e)try{let a=(await c.adminReports()).data||{},s=a.totals||{};e.innerHTML=`
            <div class="stat-grid admin-report-summary">
                ${wt("Transactions",Pe(s.transaction_count))}
                ${wt("Transaction volume",ze(s.transaction_volume))}
                ${wt("Jobs",Pe(s.job_count))}
                ${wt("Job value",ze(s.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${Ln(a.transactions||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${En(a.jobs||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Assignments by payment state</h3>
                    <div class="admin-report-list">${Pn(a.assignments||[])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Submissions by risk</h3>
                    <div class="admin-report-list">${qn(a.submissions||[])}</div>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="muted">Failed to load reports: ${pe(t.message||"unknown error")}</p>`}}function wt(e,t){return`<div class="stat-tile admin-stat-tile"><span class="muted">${pe(e)}</span><strong>${pe(t)}</strong></div>`}function Ln(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${pe(String(t.type||"").replace("_"," "))}</strong><small>${Pe(t.transaction_count)} entries</small></span>
            <strong>${ze(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No transactions yet.</p>'}function En(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${pe(String(t.status||"").replace("_"," "))}</strong><small>${Pe(t.job_count)} jobs</small></span>
            <strong>${ze(t.budget)}</strong>
        </div>
    `).join(""):'<p class="muted">No jobs yet.</p>'}function Pn(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${pe(String(t.status||"").replace("_"," "))}</strong><small>${pe(String(t.payment_status||"").replace("_"," "))} \xB7 ${Pe(t.assignment_count)} assignments</small></span>
            <strong>${ze(t.amount)}</strong>
        </div>
    `).join(""):'<p class="muted">No assignments yet.</p>'}function qn(e){return e.length?e.map(t=>`
        <div class="admin-report-row">
            <span><strong>${pe(String(t.status||"").replace("_"," "))}</strong><small>${pe(String(t.risk_status||"").replace("_"," "))}</small></span>
            <strong>${Pe(t.submission_count)}</strong>
        </div>
    `).join(""):'<p class="muted">No submissions yet.</p>'}function Pe(e){let t=Number(e||0);return Number.isFinite(t)?t.toLocaleString():"0"}function ze(e){let t=Number(e||0);return`\u09F3${Number.isFinite(t)?t.toFixed(2):"0.00"}`}function pe(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ra=_(()=>{T();w()});var fr={};A(fr,{LoginPage:()=>Da});function Da(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--auth";let t=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"";e.innerHTML=`
        <div class="auth-card">
            <h1 class="auth-card__title">\u{1F4B0} JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${t?`<p class="auth-card__referral">Referred by <strong>${jn(t)}</strong></p>`:""}
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
    `;let a=e.querySelector("#login-form");a&&a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i=a.querySelector("button");i.disabled=!0,i.textContent="Logging in\u2026";try{let n=await $s(r.get("email"),r.get("password"));l("Welcome back!","success"),n&&n.is_admin?h("/admin"):h("/")}catch(n){l(n.message||"Login failed","error"),i.disabled=!1,i.textContent="Log in"}})}function jn(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Fa=_(()=>{w()});var yr={};A(yr,{RegisterPage:()=>Ba});function Ba(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;let t="details",a=null,s=window.JMJOB_CONFIG&&window.JMJOB_CONFIG.referralCode||"",r=()=>{if(e.innerHTML="",e.className="view view--auth",t==="otp"){let d=a.phone?"phone":"email";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Check your '+d+"</h1>",'<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',Ia(a.phone||a.email),"</strong>.</p>",'<form id="register-otp-form" class="auth-form">','<label class="auth-form__label">Verification code','<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',"</label>",'<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',"</form>",'<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',"</div>"].join(""),e.querySelector("#register-back").addEventListener("click",()=>{t="details",r()}),e.querySelector("#register-otp-form").addEventListener("submit",n);return}let o=s?'<p class="auth-card__referral">\u{1F381} You were referred by <strong>'+Ia(s)+"</strong></p>":"";e.innerHTML=['<div class="auth-card">','<h1 class="auth-card__title">Create your JMJob account</h1>','<p class="auth-card__sub">Start earning in minutes</p>',o,'<form id="register-form" class="auth-form">','<label class="auth-form__label">Full name','<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',"</label>",'<label class="auth-form__label">Email','<input name="email" type="email" required placeholder="you@example.com">',"</label>",'<label class="auth-form__label">Phone <span class="muted">(optional \u2014 leave empty for email verification)</span>','<input name="phone" type="tel" placeholder="01XXXXXXXXX" autocomplete="tel">',"</label>",'<label class="auth-form__label">Password','<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',"</label>",'<label class="auth-form__label">Confirm password','<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',"</label>",s?'<input type="hidden" name="referral_code" value="'+Ia(s)+'">':"",'<button type="submit" class="btn btn--primary btn--xl">Create account</button>',"</form>",'<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',"</div>"].join(""),e.querySelector("#register-form").addEventListener("submit",i)},i=async o=>{o.preventDefault();let d=o.currentTarget,p=new FormData(d),u=d.querySelector('button[type="submit"]');u.disabled=!0,u.textContent="Creating account\u2026",a={name:String(p.get("name")||"").trim(),email:String(p.get("email")||"").trim().toLowerCase(),phone:String(p.get("phone")||"").trim(),password:String(p.get("password")||""),password_confirmation:String(p.get("password_confirmation")||""),referral_code:String(p.get("referral_code")||"")};try{if((await Ss(a))?.data?.token){l("Account created \u2014 welcome!","success"),h("/");return}t="otp",l("Verification code sent. It expires in 15 minutes.","success"),r()}catch(b){l(hr(b)||"Could not send the verification code.","error"),u.disabled=!1,u.textContent="Create account"}},n=async o=>{o.preventDefault();let d=o.currentTarget,p=d.querySelector('button[type="submit"]');p.disabled=!0,p.textContent="Verifying\u2026";try{await ks({email:a.email,otp:String(new FormData(d).get("otp")||"").trim()}),l("Account created \u2014 welcome!","success"),h("/")}catch(u){l(hr(u)||"Invalid or expired verification code.","error"),p.disabled=!1,p.textContent="Verify and create account"}};r()}}function hr(e){let t=e&&e.payload&&e.payload.errors;if(!t)return e&&e.message;let a=Object.values(t)[0];return Array.isArray(a)?a[0]:a}function Ia(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ha=_(()=>{w()});var wr={};A(wr,{default:()=>_t});async function _t(){let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
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
    `;let t=document.getElementById("forgot-form"),a=document.getElementById("submit-btn");t.addEventListener("submit",async s=>{s.preventDefault();let r=t.email.value.trim();if(!r){l("Please enter your email address.","error");return}a.disabled=!0,a.textContent="Sending...";try{await c.forgotPassword({email:r}),l("If an account exists with this email, you will receive a reset code.","success"),h(`/reset-password?email=${encodeURIComponent(r)}`)}catch(i){l(i.message||"Failed to send reset code.","error"),a.disabled=!1,a.textContent="Send Reset Code"}})}var Ua=_(()=>{T();w()});var _r={};A(_r,{default:()=>$t});async function $t(){let e=document.querySelector("[data-view]");if(!e)return;let a=(new URLSearchParams(window.location.hash.split("?")[1]).get("email")||"").trim().toLowerCase();e.innerHTML="",e.removeAttribute("data-view"),e.className="view view--auth",e.innerHTML=`
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${Nn(a)}" placeholder="you@example.com" required autocomplete="email">
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
    `;let s=document.getElementById("reset-form"),r=document.getElementById("submit-btn");s.addEventListener("submit",async i=>{i.preventDefault();let n=s.email.value.trim(),o=s.otp.value.trim(),d=s.password.value,p=s.password_confirmation.value;if(!n||!o||!d){l("Please fill in all fields.","error");return}if(o.length!==6){l("Please enter a valid 6-digit code.","error");return}if(d!==p){l("Passwords do not match.","error");return}if(d.length<6){l("Password must be at least 6 characters.","error");return}r.disabled=!0,r.textContent="Resetting...";try{await c.resetPassword({email:n,otp:o,password:d,password_confirmation:p}),l("Password reset successfully! You can now log in.","success"),h("/login")}catch(u){l(u.message||"Failed to reset password.","error"),r.disabled=!1,r.textContent="Reset Password"}})}function Nn(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}var Ja=_(()=>{T();w()});var ni={};A(ni,{JobDetailPage:()=>Qo});function Zo(e){return typeof e=="object"?String(e?.type||"text").toLowerCase():String(e||"text").toLowerCase()}function Ye(e){return Ko.has(Zo(e))}function Qo(e){return async()=>{let t=document.querySelector("[data-view]");if(!t)return;t.innerHTML="",t.className="view view--job-detail";let a=v.get();t.innerHTML=`
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;try{let s=await c.job(e),{job:r,bids:i,bid_count:n,my_bid:o,my_submission:d}=s.data;ed(r,i,n,o,d,a)}catch(s){document.getElementById("job-detail-content").innerHTML=`<p class="muted">Failed to load: ${U(s.message||"unknown")}</p>`}}}function ed(e,t,a,s,r,i){let n=document.getElementById("job-detail-content");if(!n)return;let o=e.bidding_closes_at?new Date(e.bidding_closes_at.replace(" ","T")+"Z"):null,d=o?Math.max(0,Math.floor((o-Date.now())/1e3)):null,p=d!=null?id(d):"\u2014",u=["open","in_review"].includes(e.status),b=!!i&&!i.is_admin,y=!!i&&Number(e.poster?.id||0)===Number(i.id),g=b&&(!!e.assignment_id||Number(e.assigned_worker_id||0)===Number(i.id)),k=g&&e.assignment_status?e.assignment_status:e.status;n.innerHTML=`
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${e.category?`<span class="job-detail__cat"><i class="bi ${e.category.icon_class||""}"></i> ${U(e.category.name)}</span>`:""}
                    <h1 class="job-detail__title">${U(e.title)}</h1>
                    ${e.subtitle?`<p class="muted">${U(e.subtitle)}</p>`:""}
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Pay <strong>\u09F3${parseFloat(e.cost_per_worker||e.budget||0).toFixed(2)}</strong> / worker</span>
                        <span><i class="bi bi-people"></i> ${Number(e.remaining_workers??e.worker_count??1)} available</span>
                        <span><i class="bi bi-people"></i> ${a} bid${a===1?"":"s"}</span>
                        <span><i class="bi bi-eye"></i> ${e.view_count} view${e.view_count===1?"":"s"}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${p}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${k}">${k.replace("_"," ").toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${U(e.description).replace(/\n/g,"<br>")}</p>
                ${e.requirements?`<h3>Requirements</h3><p>${U(e.requirements).replace(/\n/g,"<br>")}</p>`:""}
                ${Array.isArray(e.proof_requirements)&&e.proof_requirements.length?`
                    <h3>Proof required</h3>
                    <div class="proof-requirements-list" style="margin-top:8px;">
                        ${e.proof_requirements.map(($,P)=>{let M=Ye($),x=(typeof $=="object"?$?.title:"")||(M?"Screenshot / Image proof":"Written report"),C=typeof $=="object"&&($.image_url||$.fileBase64)?$.image_url||$.fileBase64:null;return`
                                <div style="margin-bottom:8px; padding:10px 12px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span><strong>#${P+1}.</strong> ${U(x)}</span>
                                        <span class="badge" style="font-size:11px;">${M?"IMAGE / SCREENSHOT":"TEXT PROOF"}</span>
                                    </div>
                                    ${C?`
                                        <div style="margin-top:8px;">
                                            <span class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Sample reference image:</span>
                                            <a href="${U(C)}" target="_blank" rel="noopener noreferrer">
                                                <img src="${U(C)}" alt="Proof sample" style="max-height:120px; max-width:100%; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
                                            </a>
                                        </div>
                                    `:""}
                                </div>
                            `}).join("")}
                    </div>
                `:""}
                <h3>Posted by</h3>
                <p>${e.poster?U(e.poster.name):"Unknown"} <span class="muted">@${e.poster?.username||"?"}</span></p>
            </div>
        </div>

        ${td(e,r,g)}
        ${g?"":sd(e,t,s,i,u,y)}
    `,rd(e,s,i),ad(e)}function td(e,t,a){if(!a)return"";let s=e.assignment_status||e.status,r=t?.status||s;if(t&&(t.status==="pending_review"||s==="submitted"))return`
            <div class="card">
                <h3 class="card__title">Your submission</h3>
                <p><span class="badge badge--status badge--${r}">${r.replace("_"," ").toUpperCase()}</span></p>
                <p class="muted">Your work is awaiting poster review.</p>
            </div>
        `;if(t?.status==="approved"||["approved","completed"].includes(s))return`
            <div class="card">
                <h3 class="card__title">Your submission</h3>
                <p><span class="badge badge--status badge--approved">APPROVED</span></p>
                <p class="muted">Your work was approved and payment was released.</p>
            </div>
        `;if(!["assigned","in_progress","revision"].includes(s))return`<div class="card"><p class="muted">This assignment is ${U(String(s).replace("_"," "))}.</p></div>`;let n=Array.isArray(e.proof_requirements)&&e.proof_requirements.length>0,o=n&&e.proof_requirements.some(Ye),d=n&&e.proof_requirements.some(u=>!Ye(u)),p=t?.reviewer_note||t?.rejection_reason;return`
        <div class="card">
            <h3 class="card__title">Submit Work</h3>
            ${p?`<p class="alert alert--warning"><strong>Revision requested:</strong> ${U(p)}</p>`:""}
            <form id="job-submission-form" class="submit-form">
                <label class="submit-form__label">
                    ${d?"Written report / delivery details (required)":o?"Submission notes / comments (optional)":"What did you deliver? (description)"}
                    <textarea name="description" rows="4" ${d?"required":""} placeholder="${d?"Describe your completed work or provide requested text proofs\u2026":"Optional notes or comments about your submission\u2026"}">${U(t?.description||"")}</textarea>
                </label>
                <label class="submit-form__label">
                    External link (optional)
                    <input name="external_link" type="url" value="${U(t?.external_link||"")}" placeholder="https://\u2026">
                </label>
                <label class="submit-form__label">
                    Work proof attachment ${o?"(required)":"(optional)"}
                    <input name="screenshot" type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx" ${o?"required":""}>
                    <small class="muted">Screenshot/image: JPG, PNG, GIF, or WEBP up to 10 MB. Documents: PDF, DOC, or DOCX up to 20 MB.</small>
                </label>
                <button type="submit" class="btn btn--success btn--xl" id="job-submit-work-btn">
                    <i class="bi bi-send"></i> Submit Work
                </button>
            </form>
        </div>
    `}function ad(e){let t=document.getElementById("job-submission-form");if(!t)return;let a=Array.isArray(e.proof_requirements)&&e.proof_requirements.length>0,s=a&&e.proof_requirements.some(Ye),r=a&&e.proof_requirements.some(i=>!Ye(i));t.addEventListener("submit",async i=>{i.preventDefault();let n=document.getElementById("job-submit-work-btn"),o=new FormData(t),d=String(o.get("description")||"").trim(),p=String(o.get("external_link")||"").trim(),u=o.get("screenshot"),b=u instanceof File&&u.size>0;if(s&&!b){l("Please upload your proof screenshot/attachment.","error");return}if(r&&!d){l("Please provide a written report description.","error");return}if(!s&&!r&&!d&&!b&&!p){l("Please provide at least one form of proof (written description, screenshot, or external link).","error");return}let y=new FormData;y.append("description",d),y.append("external_link",p),b&&y.append("screenshot",u),n.disabled=!0,n.innerHTML='<i class="bi bi-hourglass"></i> Submitting\u2026';try{await c.submitWork(e.id,y),l("Work submitted!","success"),h("/jobs/"+e.id)}catch(g){l(g.message||"Failed to submit.","error"),n.disabled=!1,n.innerHTML='<i class="bi bi-send"></i> Submit Work'}})}function sd(e,t,a,s,r,i){return i?'<div class="card"><p class="muted">You posted this job and cannot apply or bid on it.</p></div>':s?.is_admin?'<div class="card"><p class="muted">Administrators manage applications from the admin console.</p></div>':a?`
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${a.status}">
                    <div>
                        <strong>\u09F3${parseFloat(a.amount).toFixed(2)}</strong> in <strong>${a.delivery_days} day${a.delivery_days===1?"":"s"}</strong>
                        <div class="muted">${U(a.proposal)}</div>
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
                                <div class="muted">${U(n.proposal).slice(0,100)}${n.proposal.length>100?"\u2026":""}</div>
                            </div>
                            <span class="muted">${n.worker?.name||"Worker"}</span>
                        </div>
                    `).join("")}
                </div>
            `}
        </div>
    `:'<div class="card"><p class="muted">Please log in to place a bid.</p></div>':'<div class="card"><p class="muted">Bidding is closed for this job.</p></div>'}function rd(e,t,a){if(t){let r=document.getElementById("withdraw-bid-btn");r&&r.addEventListener("click",async()=>{if(confirm("Withdraw your bid?"))try{await c.withdrawBid(t.id),l("Bid withdrawn.","success"),h(`/jobs/${e.id}`)}catch(i){l(i.message||"Failed to withdraw.","error")}});return}let s=document.getElementById("bid-form");s&&s.addEventListener("submit",async r=>{r.preventDefault();let i=new FormData(s),n=document.getElementById("bid-submit-btn");n.disabled=!0,n.textContent="Submitting\u2026";try{await c.placeBid(e.id,{amount:parseFloat(i.get("amount")),delivery_days:parseInt(i.get("delivery_days"),10),proposal:String(i.get("proposal")||"").trim()}),l("Bid placed!","success"),h(`/jobs/${e.id}`)}catch(o){l(o.message||"Failed to place bid.","error")}finally{n.disabled=!1,n.textContent="Submit Bid"}})}function id(e){if(e<=0)return"expired";let t=Math.floor(e/86400),a=Math.floor(e%86400/3600);if(t>0)return`${t}d ${a}h`;let s=Math.floor(e%3600/60);return a>0?`${a}h ${s}m`:`${s}m`}function U(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var Ko,oi=_(()=>{T();w();Ko=new Set(["screenshot","file","attachment","image","document"])});var ci={};A(ci,{PosterJobDetailPage:()=>nd});function nd(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.innerHTML="",t.className="view view--poster-job-detail",!vd()){t.innerHTML='<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>';return}t.innerHTML='<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>',await di(e)}}}async function di(e){let t=document.getElementById("poster-job-detail-content");if(t)try{let s=(await c.posterJobBids(e)).data||{};od(t,s.job||{},s.bids||[],s.submissions||[])}catch(a){t.innerHTML=`<p class="muted">Failed to load job: ${J(a.message||"unknown error")}</p>`}}function od(e,t,a,s){e.innerHTML=`
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${J(t.title)}</h1><p class="muted">${J(t.description||"")}</p></div><span class="badge badge--status badge--${J(t.status)}">${J(fd(t.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>\u09F3${Number(t.budget||0).toFixed(2)}</strong></span><span>Bids <strong>${Number(t.bid_count||a.length)}</strong></span><span>Views <strong>${Number(t.view_count||0)}</strong></span><span>Created <strong>${li(t.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${dd(t,a)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${ld(t,s)}</div></div>
        </div>
        ${["completed","cancelled"].includes(t.status)?"":'<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>'}
    `,e.querySelectorAll("[data-accept-bid]").forEach(r=>r.addEventListener("click",()=>ud(t.id,r.dataset.acceptBid))),e.querySelectorAll("[data-release-submission]").forEach(r=>r.addEventListener("click",()=>md(t.id,r.dataset.releaseSubmission))),e.querySelectorAll("[data-revision-submission]").forEach(r=>r.addEventListener("click",()=>bd(t.id,r.dataset.revisionSubmission))),e.querySelectorAll("[data-proof-attachment]").forEach(r=>r.addEventListener("click",()=>pd(r.dataset.proofAttachment))),e.querySelector("#poster-detail-cancel")?.addEventListener("click",()=>gd(t.id))}function dd(e,t){return t.length?t.map(a=>`
        <div class="poster-bid-row poster-bid-row--${J(a.status)}"><div class="poster-bid-row__main"><strong>${J(a.worker?.name||"Worker")}</strong><span class="muted">${J(a.worker?.email||"")} \xB7 Rating ${Number(a.worker?.rating||0).toFixed(2)}</span><p>${J(a.proposal||"")}</p></div><div class="poster-bid-row__offer"><strong>\u09F3${Number(a.amount||0).toFixed(2)}</strong><span>${Number(a.delivery_days||0)} days</span><span class="badge">${J(String(a.status||"").toUpperCase())}</span>${a.status==="pending"&&["open","in_review"].includes(e.status)?`<button class="btn btn--primary btn--sm" data-accept-bid="${Number(a.id)}">Select worker</button>`:""}</div></div>
    `).join(""):'<p class="muted">No bids yet.</p>'}function ld(e,t){return t.length?t.map(a=>`
        <div class="poster-submission-row poster-submission-row--${J(a.status)}"><div><strong>${J(a.worker?.name||"Worker")}</strong><span class="muted">Submitted ${li(a.created_at)} \xB7 ${J(String(a.status||"").replace("_"," "))}</span><p>${J(a.description||"")}</p>${a.external_link?`<a href="${J(a.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>`:""}${cd(a)}${a.reviewer_note?`<p class="muted"><strong>Revision note:</strong> ${J(a.reviewer_note)}</p>`:""}</div>${a.status==="pending_review"&&["submitted","revision"].includes(e.status)?`<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(a.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(a.id)}">Request revision</button></div>`:""}</div>
    `).join(""):'<p class="muted">No work submitted yet.</p>'}function cd(e){if(!e.attachment_url)return"";let t=String(e.attachment_path||""),a=/\.(jpg|jpeg|png|gif|webp)$/i.test(t),s=a?"View screenshot":"Open proof attachment";return`<div class="poster-proof-attachment"><i class="bi ${a?"bi-image":"bi-file-earmark-text"}"></i> <button type="button" class="btn btn--ghost btn--sm" data-proof-attachment="${Number(e.id)}">${s}</button></div>`}async function pd(e){let t=window.open("about:blank","_blank","noopener,noreferrer");try{let a=await c.proofAttachment(e),s=URL.createObjectURL(a);t?t.location.href=s:window.location.href=s,setTimeout(()=>URL.revokeObjectURL(s),6e4)}catch(a){t&&t.close(),l(a.message||"Could not open the proof attachment.","error")}}async function ud(e,t){if(confirm("Select this worker? The bid amount will be moved into escrow."))try{await c.posterAcceptBid(e,t),l("Worker selected and escrow held.","success"),await ds(e)}catch(a){l(a.message||"Could not select worker.","error")}}async function md(e,t){if(confirm("Approve this submission and release payment to the worker?"))try{await c.posterReleasePayment(e,{submission_id:Number(t)}),l("Payment released.","success"),await ds(e)}catch(a){l(a.message||"Could not release payment.","error")}}async function bd(e,t){let a=prompt("What should the worker revise?");if(!(!a||!a.trim()))try{await c.posterRequestRevision(e,{submission_id:Number(t),note:a.trim()}),l("Revision requested.","success"),await ds(e)}catch(s){l(s.message||"Could not request revision.","error")}}async function gd(e){if(confirm("Cancel this job? Any escrow for this job will be refunded."))try{await c.posterCancelJob(e,{reason:"Cancelled by poster"}),l("Job cancelled.","success"),h("/poster/jobs")}catch(t){l(t.message||"Could not cancel job.","error")}}async function ds(e){let t=document.getElementById("poster-job-detail-content");t&&(t.innerHTML='<div class="spinner"></div>',await di(e))}function vd(){return!!v.get()}function fd(e){return String(e||"").replace("_"," ").replace(/\b\w/g,t=>t.toUpperCase())}function li(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function J(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}var pi=_(()=>{T();w()});K();w();K();w();var St=[{path:"/",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Wt(),Ts))},{path:"/tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(rt(),Vt))},{path:"/webtask",requireAuth:!0,render:()=>Promise.resolve().then(()=>(rt(),Vt))},{path:"/earn",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Gt(),Cs))},{path:"/refer",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Yt(),Es))},{path:"/withdraw",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Zt(),Ps))},{path:"/deposit",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ea(),Ns))},{path:"/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ot(),aa))},{path:"/leaderboard",requireAuth:!0,render:()=>Promise.resolve().then(()=>(sa(),Ms))},{path:"/achievements",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ra(),Rs))},{path:"/support",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ia(),Ds))},{path:"/settings",requireAuth:!0,render:()=>Promise.resolve().then(()=>(la(),Ws))},{path:"/notifications",requireAuth:!0,render:()=>Promise.resolve().then(()=>(pa(),zs))},{path:"/profile",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ot(),aa))},{path:"/tg-tasks",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ua(),Gs))},{path:"/poster",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ga(),Ks))},{path:"/poster/post-job",requireAuth:!0,render:()=>Promise.resolve().then(()=>(ha(),er))},{path:"/poster/jobs",requireAuth:!0,render:()=>Promise.resolve().then(()=>(wa(),ar))},{path:"/poster/wallet",requireAuth:!0,render:()=>Promise.resolve().then(()=>(Sa(),sr))},{path:"/admin",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ta(),nr))},{path:"/admin/payments",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(La(),lr))},{path:"/admin/jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ve(),yt))},{path:"/admin/pending-jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ve(),yt))},{path:"/admin/active-jobs",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ve(),yt))},{path:"/admin/transactions",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Na(),gr))},{path:"/admin/reports",requireAuth:!0,requireAdmin:!0,render:()=>Promise.resolve().then(()=>(Ra(),vr))},{path:"/login",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Fa(),fr))},{path:"/register",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ha(),yr))},{path:"/forgot-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ua(),wr))},{path:"/reset-password",requireAuth:!1,render:()=>Promise.resolve().then(()=>(Ja(),_r))}],Sc=F(()=>{let e=D.get().split("?")[0]||"/";return St.find(t=>t.path===e)||St[0]});window.addEventListener("hashchange",()=>{let e=window.location.hash.replace(/^#/,"")||"/";D.set(e)});K();w();K();Te();var Mn=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],Rn=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/pending-jobs",label:"Job Post",icon:"bi-file-earmark-plus"},{path:"/admin/admin-job-post",label:"Admin Job Post",icon:"bi-plus-square"},{path:"/admin/active-jobs",label:"Active Job",icon:"bi-lightning-charge"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/advertisement",label:"Advertisement",icon:"bi-megaphone"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],Dn=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Fn(){let e=v.get();if(e&&e.is_admin)return[{header:"ADMIN CONSOLE"},...Rn];let t=[...Mn];return e&&!e.is_admin&&t.push({separator:!0},...Dn),t.filter(a=>a.path!=="/deposit")}var $r="sidebar_collapsed",qe=V(localStorage.getItem($r)==="true");function In(){let e=!qe.get();qe.set(e),localStorage.setItem($r,String(e))}function Sr(){let e=()=>D.get().startsWith("/admin");return{tag:"aside",props:{class:()=>`sidebar ${qe.get()?"sidebar--collapsed":""} ${e()?"sidebar--admin":""}`,id:"sidebar","aria-label":()=>e()?"Admin navigation":"Navigation"},children:[Bn(),Hn(),Un()]}}function Bn(){let e=()=>D.get().startsWith("/admin");return{tag:"div",props:{class:"sidebar__brand"},children:[{tag:"div",props:{class:"sidebar__brand-text"},children:[{tag:"span",props:{class:"sidebar__brand-prefix"},children:["JM"]},{tag:"span",props:{class:"sidebar__brand-suffix"},children:["JOB"]}]},{tag:"span",props:{class:()=>`sidebar__admin-badge ${e()?"sidebar__admin-badge--active":""}`},children:["ADMIN"]},{tag:"button",props:{type:"button",class:"sidebar__mobile-close","aria-label":"Close navigation",onclick:()=>Oa()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function Hn(){return{tag:"button",props:{class:"sidebar__collapse-btn",onclick:()=>In(),title:()=>qe.get()?"Expand sidebar":"Collapse sidebar"},children:[{tag:"i",props:{class:()=>`bi ${qe.get()?"bi-chevron-right":"bi-chevron-left"}`},children:[]}]}}function Un(){return{tag:"nav",props:{class:"sidebar__nav"},children:Fn().map(e=>e.header?Jn(e.header):e.separator?On():Wn(e))}}function Jn(e){return{tag:"div",props:{class:"sidebar__header"},children:[e]}}function On(){return{tag:"div",props:{class:"sidebar__separator"},children:[]}}function Wn({path:e,label:t,icon:a}){return{tag:"a",props:{class:`sidebar__item${D.get()===e?" sidebar__item--active":""}`,href:`#${e}`,title:()=>qe.get()?t:"",onclick:r=>{r.preventDefault(),h(e),Oa()}},children:[{tag:"i",props:{class:`bi ${a} sidebar__icon`},children:[]},{tag:"span",props:{class:"sidebar__label"},children:[t]}]}}function kr(){return{tag:"div",props:{class:"sidebar-overlay",id:"sidebar-overlay",onclick:()=>Oa()},children:[]}}function xr(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.add("sidebar--open"),t&&t.classList.add("sidebar-overlay--active"),document.body.style.overflow="hidden",document.querySelector('.topbar__menu-btn[aria-controls="sidebar"]')?.setAttribute("aria-expanded","true")}function Oa(){let e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e&&e.classList.remove("sidebar--open"),t&&t.classList.remove("sidebar-overlay--active"),document.body.style.overflow="",document.querySelector('.topbar__menu-btn[aria-controls="sidebar"]')?.setAttribute("aria-expanded","false")}w();K();w();Te();var Vn=[{path:"/",label:"Dashboard",icon:"bi-house-door"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-briefcase-fill"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square-fill"},{path:"/earn",label:"Watch Ads",icon:"bi-play-circle"},{path:"/refer",label:"Refer & Earn",icon:"bi-people"},{path:"/deposit",label:"Deposit",icon:"bi-cash-coin"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/wallet",label:"Wallet",icon:"bi-wallet"},{path:"/notifications",label:"Notifications",icon:"bi-bell"},{path:"/worker/bids",label:"My Submissions",icon:"bi-clipboard-check"},{path:"/leaderboard",label:"Leaderboard",icon:"bi-bar-chart"},{path:"/support",label:"Support",icon:"bi-question-circle"},{path:"/settings",label:"Settings",icon:"bi-gear"}],zn=[{path:"/admin",label:"Overview",icon:"bi-speedometer2"},{path:"/admin/pending-jobs",label:"Job Post",icon:"bi-file-earmark-plus"},{path:"/admin/admin-job-post",label:"Admin Job Post",icon:"bi-plus-square"},{path:"/admin/active-jobs",label:"Active Job",icon:"bi-lightning-charge"},{path:"/admin/payments",label:"Payments & TRX",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Job Moderation",icon:"bi-shield-check"},{path:"/admin/transactions",label:"Ledger Audit",icon:"bi-receipt"},{path:"/admin/reports",label:"Analytics & Reports",icon:"bi-bar-chart-line"},{path:"/admin/advertisement",label:"Advertisement",icon:"bi-megaphone"},{path:"/admin/categories",label:"Categories",icon:"bi-tags"},{path:"/admin/settings",label:"Platform Settings",icon:"bi-sliders"}],Gn=[{path:"/poster",label:"Poster Dashboard",icon:"bi-kanban"},{path:"/poster/post-job",label:"Post a Job",icon:"bi-plus-square"},{path:"/poster/jobs",label:"My Jobs",icon:"bi-briefcase"},{path:"/poster/wallet",label:"Poster Wallet",icon:"bi-wallet2"}];function Xn(){let e=v.get();if(e&&e.is_admin)return zn;let t=[...Vn];return e&&!e.is_admin&&t.push({separator:!0},...Gn),t.filter(a=>a.path!=="/deposit")}function Yn({path:e,label:t,icon:a}){return{tag:"a",props:{class:`mobile-nav__item${D.get()===e?" mobile-nav__item--active":""}`,href:`#${e}`,onclick:r=>{r.preventDefault(),h(e),Wa()}},children:[{tag:"i",props:{class:`bi ${a} mobile-nav__icon`},children:[]},{tag:"span",props:{class:"mobile-nav__label"},children:[t]}]}}function Kn(){return{tag:"div",props:{class:"mobile-nav__brand"},children:[{tag:"span",props:{class:"mobile-nav__brand-text"},children:["JM JOB"]},{tag:"button",props:{class:"mobile-nav__close","aria-label":"Close menu",onclick:()=>Wa()},children:[{tag:"i",props:{class:"bi bi-x-lg"},children:[]}]}]}}function Zn(){return{tag:"nav",props:{class:"mobile-nav__list"},children:Xn().map(e=>e.separator?Qn():Yn(e))}}function Qn(){return{tag:"div",props:{class:"mobile-nav__separator"},children:[]}}function Tr(){return{tag:"aside",props:{class:"mobile-nav",id:"mobile-nav"},children:[Kn(),Zn()]}}function Ar(){return{tag:"div",props:{class:"mobile-nav-overlay",id:"mobile-nav-overlay",onclick:()=>Wa()},children:[]}}function Cr(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.add("mobile-nav--open"),t&&t.classList.add("mobile-nav-overlay--active"),document.body.style.overflow="hidden"}function Wa(){let e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-nav-overlay");e&&e.classList.remove("mobile-nav--open"),t&&t.classList.remove("mobile-nav-overlay--active"),document.body.style.overflow=""}da();T();var Nr="jmjob_language",Ga=["aria-label","aria-description","alt","placeholder","title"],eo=["script","style","textarea","code","pre",'[contenteditable="true"]',"[data-i18n-ignore]",".job-card__cat",".job-card__title",".job-card__subtitle",".job-card__desc",".job-detail__cat",".job-detail__title",".job-detail__head > div > .muted",".job-detail__body p",".bid-row-card__title",".admin-job-row__description",".poster-job-row__description",".admin-job-row__header > div > strong",".poster-job-row__header > div > strong",".poster-detail-card__header h1",".poster-detail-card__header p",".poster-bid-row__main",".poster-submission-row p",".admin-row p",".admin-row > div > strong",".leaderboard-name",".topbar__user-name",".view--profile .card--profile .card__title",".view--profile .card--profile .card__sub",".topbar-active-job__title",".topbar-active-job__text",".topbar-notification__title",".topbar-notification__text",".welcome-popup__text-wrap span",".refer-link__input",'#jobs-category option:not([value=""])','#admin-category-select option:not([value=""])','#admin-subcategory-select option:not([value=""])','#main-category-select option:not([value=""])','#sub-category-select option:not([value=""])',".view--admin-categories tbody td:first-child strong",".view--admin-categories tbody td:nth-child(2) .badge"].join(","),Va=new WeakMap,Lr=new WeakMap,Er=new WeakMap,Pr=new WeakMap,je=so(),za=null,qr=!1;function _e(e){return String(e??"").replace(/\s+/g," ").trim().toLowerCase()}var Za=new Map(Object.entries({"JMJob \u2014 Work. Earn. Grow.":"JMJob \u2014 \u0995\u09BE\u099C \u0995\u09B0\u09C1\u09A8, \u0986\u09DF \u0995\u09B0\u09C1\u09A8, \u098F\u0997\u09BF\u09DF\u09C7 \u09AF\u09BE\u09A8\u0964","Work. Earn. Grow.":"\u0995\u09BE\u099C \u0995\u09B0\u09C1\u09A8, \u0986\u09DF \u0995\u09B0\u09C1\u09A8, \u098F\u0997\u09BF\u09DF\u09C7 \u09AF\u09BE\u09A8\u0964","Select language":"\u09AD\u09BE\u09B7\u09BE \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8","Switch to English":"\u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AD\u09BE\u09B7\u09BE \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8","Switch to Bengali":"\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8","Open menu":"\u09AE\u09C7\u09A8\u09C1 \u0996\u09C1\u09B2\u09C1\u09A8",Dashboard:"\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1","Active Jobs":"\u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C","Active Job":"\u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C","Post a Job":"\u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C1\u09A8","Post Job":"\u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C1\u09A8","Watch Ads":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8","Watch Ad":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8","Earn Ad":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C7 \u0986\u09DF","Refer & Earn":"\u09B0\u09C7\u09AB\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8 \u0993 \u0986\u09DF \u0995\u09B0\u09C1\u09A8",Referral:"\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2",Deposit:"\u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE",Withdraw:"\u099F\u09BE\u0995\u09BE \u09A4\u09C1\u09B2\u09C1\u09A8",Wallet:"\u0993\u09DF\u09BE\u09B2\u09C7\u099F",Notifications:"\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF","My Submissions":"\u0986\u09AE\u09BE\u09B0 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C",Leaderboard:"\u09B6\u09C0\u09B0\u09CD\u09B7 \u0989\u09AA\u09BE\u09B0\u09CD\u099C\u09A8\u0995\u09BE\u09B0\u09C0",Support:"\u09B8\u09B9\u09BE\u09DF\u09A4\u09BE",Settings:"\u09B8\u09C7\u099F\u09BF\u0982\u09B8","ADMIN CONSOLE":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0995\u09A8\u09B8\u09CB\u09B2","ADMIN CONTROL CENTER":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09A8\u09BF\u09DF\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0",Admin:"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8",Overview:"\u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA","Job Post":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F","Admin Job Post":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F","Payments & TRX":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0993 TRX","Job Moderation":"\u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE","Ledger Audit":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8 \u09AF\u09BE\u099A\u09BE\u0987","Analytics & Reports":"\u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3 \u0993 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8",Advertisement:"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8",Categories:"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Platform Settings":"\u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u09B8\u09C7\u099F\u09BF\u0982\u09B8","Poster Dashboard":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1","Poster dashboard":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1","My Jobs":"\u0986\u09AE\u09BE\u09B0 \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB","Poster Wallet":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u0993\u09DF\u09BE\u09B2\u09C7\u099F","Sign up":"\u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0995\u09B0\u09C1\u09A8","Log in":"\u09B2\u0997 \u0987\u09A8","Log in to your account":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 \u09B2\u0997 \u0987\u09A8 \u0995\u09B0\u09C1\u09A8","Log Out":"\u09B2\u0997 \u0986\u0989\u099F","Log out":"\u09B2\u0997 \u0986\u0989\u099F","Sign out of your account":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A5\u09C7\u0995\u09C7 \u09B2\u0997 \u0986\u0989\u099F \u0995\u09B0\u09C1\u09A8","Go home":"\u09B9\u09CB\u09AE\u09C7 \u09AF\u09BE\u09A8",Back:"\u09AA\u09C7\u099B\u09A8\u09C7 \u09AF\u09BE\u09A8","Back to jobs":"\u0995\u09BE\u099C\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09DF \u09AB\u09BF\u09B0\u09C1\u09A8","Back to login":"\u09B2\u0997 \u0987\u09A8 \u09AA\u09BE\u09A4\u09BE\u09DF \u09AB\u09BF\u09B0\u09C1\u09A8","Loading\u2026":"\u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7\u2026","Loading JMJob\u2026":"JMJob \u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7\u2026","Loading active jobs\u2026":"\u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB \u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7\u2026","Your active job list will appear here.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7\u0964","View all active jobs":"\u09B8\u09AC \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C \u09A6\u09C7\u0996\u09C1\u09A8",Open:"\u0996\u09C1\u09B2\u09C1\u09A8",Close:"\u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8","Close Active Jobs":"\u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8","Active Jobs are unavailable right now.":"\u098F\u0987 \u09AE\u09C1\u09B9\u09C2\u09B0\u09CD\u09A4\u09C7 \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09A8\u09BE\u0964","No active jobs right now.":"\u098F\u0996\u09A8 \u0995\u09CB\u09A8\u09CB \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C \u09A8\u09C7\u0987\u0964","Untitled job":"\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE\u09B9\u09C0\u09A8 \u0995\u09BE\u099C","Switch to light mode":"\u09B2\u09BE\u0987\u099F \u09AE\u09CB\u09A1 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8","Switch to dark mode":"\u09A1\u09BE\u09B0\u09CD\u0995 \u09AE\u09CB\u09A1 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8","Expand sidebar":"\u09B8\u09BE\u0987\u09A1\u09AC\u09BE\u09B0 \u09AC\u09DC \u0995\u09B0\u09C1\u09A8","Collapse sidebar":"\u09B8\u09BE\u0987\u09A1\u09AC\u09BE\u09B0 \u099B\u09CB\u099F \u0995\u09B0\u09C1\u09A8",Active:"\u099A\u09B2\u09AE\u09BE\u09A8",Search:"\u0996\u09C1\u0981\u099C\u09C1\u09A8","Search jobs\u2026":"\u0995\u09BE\u099C \u0996\u09C1\u0981\u099C\u09C1\u09A8\u2026","Search jobs":"\u0995\u09BE\u099C \u0996\u09C1\u0981\u099C\u09C1\u09A8","Apply filters":"\u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8",Reset:"\u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8",Retry:"\u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8",Refresh:"\u09B0\u09BF\u09AB\u09CD\u09B0\u09C7\u09B6 \u0995\u09B0\u09C1\u09A8",Next:"\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0","Next \u2192":"\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u2192","\u2190 Previous":"\u2190 \u0986\u0997\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE",Save:"\u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09C1\u09A8","Save All Changes":"\u09B8\u09AC \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09C1\u09A8","Saving\u2026":"\u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u09B9\u099A\u09CD\u099B\u09C7\u2026",Cancel:"\u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09C1\u09A8",Delete:"\u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8",Edit:"\u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE",Change:"\u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09C1\u09A8",Remove:"\u09B8\u09B0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8",Copy:"\u0995\u09AA\u09BF \u0995\u09B0\u09C1\u09A8",Clear:"\u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8",Enable:"\u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8",Enabled:"\u099A\u09BE\u09B2\u09C1","Not enabled":"\u099A\u09BE\u09B2\u09C1 \u09A8\u09C7\u0987",Disabled:"\u09AC\u09A8\u09CD\u09A7",DISABLED:"\u09AC\u09A8\u09CD\u09A7",ENABLED:"\u099A\u09BE\u09B2\u09C1",Yes:"\u09B9\u09CD\u09AF\u09BE\u0981",No:"\u09A8\u09BE",All:"\u09B8\u09AC",Pending:"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3",PENDING:"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3",Approved:"\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4",APPROVED:"\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4",Rejected:"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4","Rejected jobs":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u0995\u09BE\u099C","Rejected submissions":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u099C\u09AE\u09BE",Completed:"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8",Assigned:"\u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7",Working:"\u0995\u09BE\u099C \u099A\u09B2\u099B\u09C7",Revision:"\u09B8\u0982\u09B6\u09CB\u09A7\u09A8",Paid:"\u09AA\u09B0\u09BF\u09B6\u09CB\u09A7\u09BF\u09A4",Featured:"\u09AC\u09BF\u09B6\u09C7\u09B7\u09AD\u09BE\u09AC\u09C7 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4","AVAILABLE TO APPLY":"\u0986\u09AC\u09C7\u09A6\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0989\u09A8\u09CD\u09AE\u09C1\u0995\u09CD\u09A4","Pending review":"\u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF",Error:"\u09A4\u09CD\u09B0\u09C1\u099F\u09BF",Warning:"\u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE",Success:"\u09B8\u09AB\u09B2",Info:"\u09A4\u09A5\u09CD\u09AF","Confirm fraud":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8","Admin only.":"\u09B6\u09C1\u09A7\u09C1 \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF\u0964","Admin access required.":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0985\u09A8\u09C1\u09AE\u09A4\u09BF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964","Poster access required":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u0985\u09A8\u09C1\u09AE\u09A4\u09BF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8","Page not found.":"\u09AA\u09BE\u09A4\u09BE\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964",Email:"\u0987\u09AE\u09C7\u0987\u09B2","Email Address":"\u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE",Password:"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1","Current Password":"\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1","New Password":"\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1","Confirm Password":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8","Confirm New Password":"\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8","At least 6 characters":"\u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC\u099F\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09A6\u09BF\u09A8","Forgot Password":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AD\u09C1\u09B2\u09C7 \u0997\u09C7\u099B\u09C7\u09A8?","Forgot your password?":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AD\u09C1\u09B2\u09C7 \u0997\u09C7\u099B\u09C7\u09A8?","Remember your password?":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AE\u09A8\u09C7 \u0986\u099B\u09C7?","No account?":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09C7\u0987?","Create account":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8","Creating account\u2026":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u09B9\u099A\u09CD\u099B\u09C7\u2026","Verify and create account":"\u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8","Verifying\u2026":"\u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09BE \u09B9\u099A\u09CD\u099B\u09C7\u2026","Logging in\u2026":"\u09B2\u0997 \u0987\u09A8 \u09B9\u099A\u09CD\u099B\u09C7\u2026","Demo accounts:":"\u09A1\u09C7\u09AE\u09CB \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F:","Reset Code":"\u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09CB\u09A1","Send Reset Code":"\u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A8","Sending...":"\u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7\u2026","Reset Password":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8","Resetting...":"\u09B0\u09BF\u09B8\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7\u2026","Enter your email address and we'll send you a code to reset your password.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09BE\u09B0 \u0995\u09CB\u09A1 \u09AA\u09C7\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09B2\u09BF\u0996\u09C1\u09A8\u0964","Enter the 6-digit code sent to your email and your new password.":"\u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09EC \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0995\u09CB\u09A1 \u0993 \u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B2\u09BF\u0996\u09C1\u09A8\u0964","Didn't receive a code?":"\u0995\u09CB\u09A1 \u09AA\u09BE\u09A8\u09A8\u09BF?","Change Password":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09C1\u09A8","Update Your Password":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09C1\u09A8","Enter your current password and choose a new one.":"\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B2\u09BF\u0996\u09C7 \u09A8\u09A4\u09C1\u09A8 \u098F\u0995\u099F\u09BF \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A6\u09BF\u09A8\u0964",Username:"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09A8\u09BE\u09AE",Name:"\u09A8\u09BE\u09AE",Account:"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F",Security:"\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE","Two-Factor Authentication":"\u09A6\u09C1\u0987 \u09A7\u09BE\u09AA\u09C7\u09B0 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3","Delete Account":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8","Permanently delete your account and data":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993 \u09A4\u09A5\u09CD\u09AF \u09B8\u09CD\u09A5\u09BE\u09DF\u09C0\u09AD\u09BE\u09AC\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8","Danger Zone":"\u099D\u09C1\u0981\u0995\u09BF\u09AA\u09C2\u09B0\u09CD\u09A3 \u0995\u09BE\u099C",Appearance:"\u099A\u09C7\u09B9\u09BE\u09B0\u09BE","Theme Mode":"\u09A5\u09BF\u09AE \u09AE\u09CB\u09A1","Theme mode":"\u09A5\u09BF\u09AE \u09AE\u09CB\u09A1",Light:"\u09B2\u09BE\u0987\u099F",Dark:"\u09A1\u09BE\u09B0\u09CD\u0995",System:"\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0","Light, dark, or follow system":"\u09B2\u09BE\u0987\u099F, \u09A1\u09BE\u09B0\u09CD\u0995 \u0985\u09A5\u09AC\u09BE \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u09C7\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6 \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0","Accent Color":"\u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u09B0\u0982","Email Notifications":"\u0987\u09AE\u09C7\u0987\u09B2 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF","Withdrawal Alerts":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF","Get notified about withdrawal status":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09AA\u09BE\u09A8","Receive updates about your account":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7\u09B0 \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09A4\u09A5\u09CD\u09AF \u09AA\u09BE\u09A8","Customize how JMJob looks for you. Only your device is affected.":"JMJob \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u099B\u09C7 \u0995\u09C7\u09AE\u09A8 \u09A6\u09C7\u0996\u09BE\u09AC\u09C7 \u09A4\u09BE \u09A0\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u099F\u09BF \u09B6\u09C1\u09A7\u09C1 \u098F\u0987 \u09A1\u09BF\u09AD\u09BE\u0987\u09B8\u09C7 \u09AA\u09CD\u09B0\u09AF\u09CB\u099C\u09CD\u09AF \u09B9\u09AC\u09C7\u0964","Last changed: Never":"\u09B8\u09B0\u09CD\u09AC\u09B6\u09C7\u09B7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8: \u0995\u0996\u09A8\u09CB \u09A8\u09DF",Balance:"\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8","Main Balance":"\u09AE\u09C2\u09B2 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8","Total Earned":"\u09AE\u09CB\u099F \u0986\u09DF","Lifetime Earn":"\u09B8\u09B0\u09CD\u09AC\u09AE\u09CB\u099F \u0986\u09DF","Earn Today":"\u0986\u099C\u0995\u09C7\u09B0 \u0986\u09DF","My Network":"\u0986\u09AE\u09BE\u09B0 \u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995","Recent Ad History":"\u09B8\u09BE\u09AE\u09CD\u09AA\u09CD\u09B0\u09A4\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8","Ads Viewed":"\u09A6\u09C7\u0996\u09BE \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","Ads Watched":"\u09A6\u09C7\u0996\u09BE \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","Tasks Completed":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09BE\u099C","Tasks Remaining:":"\u09AC\u09BE\u0995\u09BF \u0995\u09BE\u099C:","Daily Mission":"\u0986\u099C\u0995\u09C7\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF","Mission Progress:":"\u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF:","\u{1F381} Claim Daily Bonus":"\u{1F381} \u0986\u099C\u0995\u09C7\u09B0 \u09AC\u09CB\u09A8\u09BE\u09B8 \u09A8\u09BF\u09A8","Daily bonus claimed!":"\u0986\u099C\u0995\u09C7\u09B0 \u09AC\u09CB\u09A8\u09BE\u09B8 \u09AF\u09CB\u0997 \u09B9\u09DF\u09C7\u099B\u09C7!","Bonus not available.":"\u098F\u0987 \u09AE\u09C1\u09B9\u09C2\u09B0\u09CD\u09A4\u09C7 \u09AC\u09CB\u09A8\u09BE\u09B8 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09A8\u09BE\u0964","Could not claim. Try again later.":"\u09AC\u09CB\u09A8\u09BE\u09B8 \u09A8\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Target:":"\u09B2\u0995\u09CD\u09B7\u09CD\u09AF:","Completed:":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8:","Ads Reward Center":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A5\u09C7\u0995\u09C7 \u0986\u09DF","Ad will play here\u2026":"\u098F\u0996\u09BE\u09A8\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u099A\u09B2\u09AC\u09C7\u2026","Simulated Sponsor Ad":"\u09A8\u09AE\u09C1\u09A8\u09BE \u09B8\u09CD\u09AA\u09A8\u09B8\u09B0 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","This is a placeholder for a real ad.":"\u098F\u099F\u09BF \u0986\u09B8\u09B2 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u09C7\u09B0 \u09A8\u09AE\u09C1\u09A8\u09BE \u09B8\u09CD\u09A5\u09BE\u09A8\u0964","Watch the ad":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u099F\u09BF \u09A6\u09C7\u0996\u09C1\u09A8","Watch-and-earn is currently paused.":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C7 \u0986\u09DF \u0986\u09AA\u09BE\u09A4\u09A4 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964","Available ads":"\u0989\u09AA\u09B2\u09AD\u09CD\u09AF \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","Remaining limit":"\u0985\u09AC\u09B6\u09BF\u09B7\u09CD\u099F \u09B8\u09C0\u09AE\u09BE","Total ad earnings":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A5\u09C7\u0995\u09C7 \u09AE\u09CB\u099F \u0986\u09DF","Today\u2019s ad earnings":"\u0986\u099C \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A5\u09C7\u0995\u09C7 \u0986\u09DF","Total ad views":"\u09AE\u09CB\u099F \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7","Completed ad views":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE","Sponsored Content":"\u09B8\u09CD\u09AA\u09A8\u09B8\u09B0 \u0995\u09B0\u09BE \u0995\u09A8\u099F\u09C7\u09A8\u09CD\u099F","Preparing ad\u2026":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u09B9\u099A\u09CD\u099B\u09C7\u2026","Starting\u2026":"\u09B6\u09C1\u09B0\u09C1 \u09B9\u099A\u09CD\u099B\u09C7\u2026","No sponsor videos are available right now.":"\u098F\u0987 \u09AE\u09C1\u09B9\u09C2\u09B0\u09CD\u09A4\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09AA\u09A8\u09B8\u09B0 \u09AD\u09BF\u09A1\u09BF\u0993 \u09A8\u09C7\u0987\u0964","Server-timed sponsor videos and daily rewards":"\u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0\u09BF\u09A4 \u09B8\u09AE\u09DF\u09C7\u09B0 \u09B8\u09CD\u09AA\u09A8\u09B8\u09B0 \u09AD\u09BF\u09A1\u09BF\u0993 \u0993 \u09A6\u09C8\u09A8\u09BF\u0995 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0","Use standard ad reward":"\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8","Thank you for watching \u2014 your reward will be credited in":"\u09A6\u09C7\u0996\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6 \u2014 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AF\u09CB\u0997 \u09B9\u09AC\u09C7","Your reward will be credited in":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AF\u09CB\u0997 \u09B9\u09AC\u09C7","Web Task Center":"\u0993\u09DF\u09C7\u09AC \u0995\u09BE\u099C\u09C7\u09B0 \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0","Telegram Tasks":"\u099F\u09C7\u09B2\u09BF\u0997\u09CD\u09B0\u09BE\u09AE \u0995\u09BE\u099C","Join these channels to earn rewards.":"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AA\u09C7\u09A4\u09C7 \u098F\u0987 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u0997\u09C1\u09B2\u09CB\u09A4\u09C7 \u09AF\u09CB\u0997 \u09A6\u09BF\u09A8\u0964","Your Badges":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u099C",Achievements:"\u0985\u09B0\u09CD\u099C\u09A8\u09B8\u09AE\u09C2\u09B9","Earn badges by completing milestones":"\u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C7 \u09AC\u09CD\u09AF\u09BE\u099C \u0985\u09B0\u09CD\u099C\u09A8 \u0995\u09B0\u09C1\u09A8","First Steps":"\u09AA\u09CD\u09B0\u09A5\u09AE \u09AA\u09A6\u0995\u09CD\u09B7\u09C7\u09AA","Complete your first task":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u0995\u09BE\u099C\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8","Ad Watcher":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09B0\u09CD\u09B6\u0995","Big Earner":"\u09AC\u09DC \u0989\u09AA\u09BE\u09B0\u09CD\u099C\u09A8\u0995\u09BE\u09B0\u09C0",Networker:"\u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995 \u0997\u09DC\u09C1\u09A8",Champion:"\u099A\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BF\u09DF\u09A8","On Fire":"\u09A6\u09BE\u09B0\u09C1\u09A3 \u09A7\u09BE\u09B0\u09BE\u09AC\u09BE\u09B9\u09BF\u0995\u09A4\u09BE","7-day streak":"\u099F\u09BE\u09A8\u09BE \u09ED \u09A6\u09BF\u09A8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09BE","Watch 10 ads":"\u09E7\u09E6\u099F\u09BF \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8","Earn $10 total":"\u09AE\u09CB\u099F $\u09E7\u09E6 \u0986\u09DF \u0995\u09B0\u09C1\u09A8","Refer 5 friends":"\u09EB \u099C\u09A8 \u09AC\u09A8\u09CD\u09A7\u09C1\u0995\u09C7 \u09B0\u09C7\u09AB\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8","Reach #1 on leaderboard":"\u09B6\u09C0\u09B0\u09CD\u09B7 \u0989\u09AA\u09BE\u09B0\u09CD\u099C\u09A8\u0995\u09BE\u09B0\u09C0\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09DF \u09E7 \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u0989\u09A0\u09C1\u09A8",Progress:"\u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF","Complete more tasks to appear on the leaderboard!":"\u09B6\u09C0\u09B0\u09CD\u09B7 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09DF \u0986\u09B8\u09A4\u09C7 \u0986\u09B0\u0993 \u0995\u09BE\u099C \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8!","See who's earning the most on JMJob":"JMJob-\u098F \u0995\u09BE\u09B0\u09BE \u09B8\u09AC\u099A\u09C7\u09DF\u09C7 \u09AC\u09C7\u09B6\u09BF \u0986\u09DF \u0995\u09B0\u099B\u09C7\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8","Top Earners":"\u09B6\u09C0\u09B0\u09CD\u09B7 \u0989\u09AA\u09BE\u09B0\u09CD\u099C\u09A8\u0995\u09BE\u09B0\u09C0","This Month":"\u098F\u0987 \u09AE\u09BE\u09B8\u09C7","Your Rank":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8","Browse Jobs":"\u0995\u09BE\u099C \u0996\u09C1\u0981\u099C\u09C1\u09A8","Browse jobs":"\u0995\u09BE\u099C \u0996\u09C1\u0981\u099C\u09C1\u09A8","Find work that matches your skills. Place a bid to get started.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09A6\u0995\u09CD\u09B7\u09A4\u09BE\u09B0 \u09B8\u0999\u09CD\u0997\u09C7 \u09AE\u09C7\u09B2\u09C7 \u098F\u09AE\u09A8 \u0995\u09BE\u099C \u0996\u09C1\u0981\u099C\u09C1\u09A8\u0964 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09BF\u09A8\u0964",Category:"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Category:":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF:","All categories":"\u09B8\u09AC \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Choose category\u2026":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u2026","Choose Main Category\u2026":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u2026","Select Main Category\u2026":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8\u2026","Choose Sub Category (Optional)\u2026":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8 (\u0990\u099A\u09CD\u099B\u09BF\u0995)\u2026","Select Sub Category (Optional)\u2026":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8 (\u0990\u099A\u09CD\u099B\u09BF\u0995)\u2026","Sub Category":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF",Subcategory:"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF",Subcategories:"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u0997\u09C1\u09B2\u09CB",Description:"\u09AC\u09BF\u09AC\u09B0\u09A3","Job Title":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE","Job title":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE","Job Subtitle (Optional)":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE (\u0990\u099A\u09CD\u099B\u09BF\u0995)","Job subtitle (Optional)":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE (\u0990\u099A\u09CD\u099B\u09BF\u0995)","Short description":"\u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09AC\u09BF\u09AC\u09B0\u09A3","Short job-card summary":"\u0995\u09BE\u099C\u09C7\u09B0 \u0995\u09BE\u09B0\u09CD\u09A1\u09C7\u09B0 \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4 \u09AC\u09BF\u09AC\u09B0\u09A3","Short summary shown on job cards":"\u0995\u09BE\u099C\u09C7\u09B0 \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u09A6\u09C7\u0996\u09BE\u09A8\u09CB \u09B8\u0982\u0995\u09CD\u09B7\u09BF\u09AA\u09CD\u09A4\u09B8\u09BE\u09B0","Task Instructions (Description)":"\u0995\u09BE\u099C\u09C7\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE (\u09AC\u09BF\u09AC\u09B0\u09A3)","Job details / instructions":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0993 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE","Job:":"\u0995\u09BE\u099C:","Job details":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3","Posted by":"\u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C7\u099B\u09C7\u09A8","Posted by:":"\u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C7\u099B\u09C7\u09A8:","Job pages":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE","Bidding Window":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF\u09B8\u09C0\u09AE\u09BE","Bidding closes in":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u09AC\u09BE\u0995\u09BF","Bidding is closed for this job.":"\u098F\u0987 \u0995\u09BE\u099C\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u09B6\u09C7\u09B7\u0964","Place a Bid":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09BF\u09A8","Submit Bid":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Submit Work":"\u0995\u09BE\u099C \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Proposal (why you're a good fit)":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC (\u0995\u09C7\u09A8 \u0986\u09AA\u09A8\u09BF \u098F\u0987 \u0995\u09BE\u099C\u09C7\u09B0 \u0989\u09AA\u09AF\u09C1\u0995\u09CD\u09A4)","Your bid amount (\u09F3)":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 (\u09F3)","Your Bid":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC","Your submission":"\u0986\u09AA\u09A8\u09BE\u09B0 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C","My Bids":"\u0986\u09AE\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09B8\u09AE\u09C2\u09B9","All the bids you've placed, with their current status.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE \u09B8\u09AC \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u0993 \u09B8\u09C7\u0997\u09C1\u09B2\u09CB\u09B0 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u0964","You haven't placed any bids yet.":"\u0986\u09AA\u09A8\u09BF \u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09C7\u09A8\u09A8\u09BF\u0964","No bids yet. Be the first!":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A8\u09C7\u0987\u0964 \u0986\u09AA\u09A8\u09BF\u0987 \u09AA\u09CD\u09B0\u09A5\u09AE \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!","Other Bids":"\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC",Bids:"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09B8\u09AE\u09C2\u09B9","Applications/Bids:":"\u0986\u09AC\u09C7\u09A6\u09A8/\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC:","Please log in to place a bid.":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09BF\u09A4\u09C7 \u0986\u0997\u09C7 \u09B2\u0997 \u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964","Open job details to place your bid. Assigned workers can submit work from the job details page.":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A6\u09BF\u09A4\u09C7 \u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0996\u09C1\u09B2\u09C1\u09A8\u0964 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u0995\u09B0\u09CD\u09AE\u09C0\u09B0\u09BE \u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A5\u09C7\u0995\u09C7\u0987 \u0995\u09BE\u099C \u099C\u09AE\u09BE \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964","View job details":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A6\u09C7\u0996\u09C1\u09A8","My jobs":"\u0986\u09AE\u09BE\u09B0 \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB","Manage Job":"\u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8","Manage jobs":"\u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8","Manage your job listings, track worker progress, and review submissions.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE \u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8, \u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF \u09A6\u09C7\u0996\u09C1\u09A8 \u098F\u09AC\u0982 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Manage your jobs, compare bids, and manage work in progress.":"\u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8, \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C\u09C7\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF \u09A6\u09C7\u0996\u09C1\u09A8\u0964","Create a clear brief and let workers send you proposals.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A6\u09BF\u09A8, \u09AF\u09BE\u09A4\u09C7 \u0995\u09B0\u09CD\u09AE\u09C0\u09B0\u09BE \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964","Post jobs, compare bids, and manage work in progress.":"\u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C1\u09A8, \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Post your first job":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09C1\u09A8","Ready to get started?":"\u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4?","See where your posted jobs are in the workflow.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB \u0995\u09CB\u09A8 \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u0986\u099B\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964","Job pipeline":"\u0995\u09BE\u099C\u09C7\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF\u09B0 \u09A7\u09BE\u09AA","Job management":"\u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE","Job Management Center":"\u0995\u09BE\u099C \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0",Budget:"\u09AC\u09BE\u099C\u09C7\u099F","Job budget":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BE\u099C\u09C7\u099F","Min budget":"\u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u09AC\u09BE\u099C\u09C7\u099F","Max budget":"\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09AC\u09BE\u099C\u09C7\u099F","No limit":"\u0995\u09CB\u09A8\u09CB \u09B8\u09C0\u09AE\u09BE \u09A8\u09C7\u0987","Sort by":"\u09B8\u09BE\u099C\u09BE\u09A8","Newest first":"\u09A8\u09A4\u09C1\u09A8\u0997\u09C1\u09B2\u09CB \u0986\u0997\u09C7","Lowest budget":"\u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u09AC\u09BE\u099C\u09C7\u099F \u0986\u0997\u09C7","Highest budget":"\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09AC\u09BE\u099C\u09C7\u099F \u0986\u0997\u09C7","Closing soon":"\u09AF\u09C7\u0997\u09C1\u09B2\u09CB\u09B0 \u09B8\u09AE\u09DF \u0986\u0997\u09C7 \u09B6\u09C7\u09B7 \u09B9\u09AC\u09C7","No open jobs found":"\u0995\u09CB\u09A8\u09CB \u0996\u09CB\u09B2\u09BE \u0995\u09BE\u099C \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","No jobs match your filters. Try clearing them.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0\u09C7\u09B0 \u09B8\u0999\u09CD\u0997\u09C7 \u09AE\u09C7\u09B2\u09C7 \u098F\u09AE\u09A8 \u0995\u09BE\u099C \u09A8\u09C7\u0987\u0964 \u09AB\u09BF\u09B2\u09CD\u099F\u09BE\u09B0 \u09AE\u09C1\u099B\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964","No job screenshot attached.":"\u0995\u09BE\u099C\u09C7\u09B0 \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF\u0964","Open full size":"\u09AA\u09C2\u09B0\u09CD\u09A3 \u0986\u0995\u09BE\u09B0\u09C7 \u0996\u09C1\u09B2\u09C1\u09A8","Reference screenshot:":"\u09A8\u09AE\u09C1\u09A8\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F:","Job Screenshot / Thumbnail (Optional)":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F / \u09A5\u09BE\u09AE\u09CD\u09AC\u09A8\u09C7\u0987\u09B2 (\u0990\u099A\u09CD\u099B\u09BF\u0995)","Job Screenshot / Thumbnail:":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F / \u09A5\u09BE\u09AE\u09CD\u09AC\u09A8\u09C7\u0987\u09B2:","Thumbnail Image Upload (Optional)":"\u09A5\u09BE\u09AE\u09CD\u09AC\u09A8\u09C7\u0987\u09B2 \u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 (\u0990\u099A\u09CD\u099B\u09BF\u0995)","Upload sample reference image for worker (optional)":"\u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09A8\u09AE\u09C1\u09A8\u09BE \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8 \u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8 (\u0990\u099A\u09CD\u099B\u09BF\u0995)","Screenshot Proof":"\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3","Work Proof Requirements":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4","Proof Requirements":"\u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4","Proof requirements:":"\u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4:","Images only":"\u09B6\u09C1\u09A7\u09C1 \u099B\u09AC\u09BF","Texts only":"\u09B6\u09C1\u09A7\u09C1 \u09B2\u09C7\u0996\u09BE","\u{1F4DD} Written Text":"\u{1F4DD} \u09B2\u09BF\u0996\u09BF\u09A4 \u09B2\u09C7\u0996\u09BE","\u{1F4F7} Image / Screenshot":"\u{1F4F7} \u099B\u09AC\u09BF / \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F","Both (Images & Texts)":"\u099B\u09AC\u09BF \u0993 \u09B2\u09C7\u0996\u09BE\u2014\u09A6\u09C1\u099F\u09BF\u0987","Choose whether proof will take images only, texts only, or both pairs of images and texts.":"\u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09B6\u09C1\u09A7\u09C1 \u099B\u09AC\u09BF, \u09B6\u09C1\u09A7\u09C1 \u09B2\u09C7\u0996\u09BE, \u0985\u09A5\u09AC\u09BE \u099B\u09AC\u09BF \u0993 \u09B2\u09C7\u0996\u09BE\u2014\u0995\u09CB\u09A8\u099F\u09BF \u09B2\u09BE\u0997\u09AC\u09C7 \u09A4\u09BE \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964","Screenshot/image: JPG, PNG, GIF, or WEBP up to 10 MB. Documents: PDF, DOC, or DOCX up to 20 MB.":"\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F/\u099B\u09AC\u09BF: \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09E7\u09E6 MB-\u098F\u09B0 JPG, PNG, GIF \u09AC\u09BE WEBP\u0964 \u09A8\u09A5\u09BF: \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09E8\u09E6 MB-\u098F\u09B0 PDF, DOC \u09AC\u09BE DOCX\u0964","Delivery time (days)":"\u0995\u09BE\u099C \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF (\u09A6\u09BF\u09A8)",Deadline:"\u09B6\u09C7\u09B7 \u09B8\u09AE\u09DF","Deadline (Optional)":"\u09B6\u09C7\u09B7 \u09B8\u09AE\u09DF (\u0990\u099A\u09CD\u099B\u09BF\u0995)",Days:"\u09A6\u09BF\u09A8",Hours:"\u0998\u09A3\u09CD\u099F\u09BE",Minutes:"\u09AE\u09BF\u09A8\u09BF\u099F",Months:"\u09AE\u09BE\u09B8","Workers Needed":"\u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u0995\u09B0\u09CD\u09AE\u09C0","Workers Needed:":"\u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u0995\u09B0\u09CD\u09AE\u09C0:","Workers required":"\u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u0995\u09B0\u09CD\u09AE\u09C0","Workers:":"\u0995\u09B0\u09CD\u09AE\u09C0:","Cost Per Worker (\u09F3)":"\u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u0996\u09B0\u099A (\u09F3)","Cost/Worker:":"\u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u0996\u09B0\u099A:","Payment per worker":"\u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09AA\u09BE\u09B0\u09BF\u09B6\u09CD\u09B0\u09AE\u09BF\u0995","Minimum cost per worker for selected category:":"\u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09A4\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A:","Fee Breakdown":"\u09AB\u09BF-\u098F\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC",Subtotal:"\u0989\u09AA\u09AE\u09CB\u099F","System Fee":"\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09AB\u09BF","Total Cost:":"\u09AE\u09CB\u099F \u0996\u09B0\u099A:","Total payable":"\u09AE\u09CB\u099F \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7\u09AF\u09CB\u0997\u09CD\u09AF","Cancel Job":"\u0995\u09BE\u099C \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09C1\u09A8","Cancel job":"\u0995\u09BE\u099C \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09C1\u09A8","Delete job":"\u0995\u09BE\u099C \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8","Edit job":"\u0995\u09BE\u099C \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE \u0995\u09B0\u09C1\u09A8",Approve:"\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C1\u09A8",Reject:"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8","Approve delivery to release payment or request changes.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u099B\u09BE\u09DC \u0995\u09B0\u09A4\u09C7 \u0995\u09BE\u099C \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C1\u09A8, \u0985\u09A5\u09AC\u09BE \u09B8\u0982\u09B6\u09CB\u09A7\u09A8\u09C7\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0995\u09B0\u09C1\u09A8\u0964","Choose one pending proposal to assign the job.":"\u0995\u09BE\u099C\u099F\u09BF \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u0997\u09C1\u09B2\u09CB\u09B0 \u098F\u0995\u099F\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964","Bid comparison":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A4\u09C1\u09B2\u09A8\u09BE","Submission review":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE","Submission History":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8",Submissions:"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C","No submissions yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u0995\u09BE\u099C \u099C\u09AE\u09BE \u09AA\u09DC\u09C7\u09A8\u09BF\u0964","No assignments yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09BE\u0989\u0995\u09C7 \u0995\u09BE\u099C\u09C7 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09A8\u09BF\u0964","No pending bids.":"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09A8\u09C7\u0987\u0964","Approve for payment review":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C1\u09A8","Approved submissions":"\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u099C\u09AE\u09BE","Total workers":"\u09AE\u09CB\u099F \u0995\u09B0\u09CD\u09AE\u09C0",Remaining:"\u09AC\u09BE\u0995\u09BF","Remaining amount":"\u09AC\u09BE\u0995\u09BF \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Pending amount":"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Completed amount":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Total job amount":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AE\u09CB\u099F \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Total spent":"\u09AE\u09CB\u099F \u0996\u09B0\u099A","Frozen in escrow":"\u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09A4\u09C7 \u0986\u099F\u0995\u09C7 \u0986\u099B\u09C7","Funds available for new jobs and active escrow.":"\u09A8\u09A4\u09C1\u09A8 \u0995\u09BE\u099C \u0993 \u099A\u09B2\u09AE\u09BE\u09A8 \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u09AF\u09CB\u0997\u09CD\u09AF \u099F\u09BE\u0995\u09BE\u0964","Your work is awaiting poster review.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u099C\u099F\u09BF \u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF \u0986\u099B\u09C7\u0964","Your work was approved and payment was released.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u099C \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","\u23F3 Awaiting poster review.":"\u23F3 \u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF\u0964","\u2705 Approved! Payment has been released.":"\u2705 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4! \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","\u{1F504} Poster requested changes. Open job details to resubmit your work.":"\u{1F504} \u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE \u09B8\u0982\u09B6\u09CB\u09A7\u09A8 \u099A\u09C7\u09DF\u09C7\u099B\u09C7\u09A8\u0964 \u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0996\u09C1\u09B2\u09C7 \u09B8\u0982\u09B6\u09CB\u09A7\u09BF\u09A4 \u0995\u09BE\u099C \u099C\u09AE\u09BE \u09A6\u09BF\u09A8\u0964","Job Submitted & Pending Approval":"\u0995\u09BE\u099C \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7, \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF","Your job has been submitted to the admin panel for review. Contact the admin on WhatsApp to talk about payment and job approval.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BE\u099C\u099F\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0993 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u09A8\u09BF\u09DF\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 WhatsApp-\u098F \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09B8\u0999\u09CD\u0997\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964","Step 1: Select Category":"\u09A7\u09BE\u09AA \u09E7: \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8","Step 2: Job Details & Proof Requirements":"\u09A7\u09BE\u09AA \u09E8: \u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0993 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4","Step 3: Workers & Pricing":"\u09A7\u09BE\u09AA \u09E9: \u0995\u09B0\u09CD\u09AE\u09C0 \u0993 \u09AA\u09BE\u09B0\u09BF\u09B6\u09CD\u09B0\u09AE\u09BF\u0995","1. Category Selection":"\u09E7. \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8","2. Job Details & Proofs":"\u09E8. \u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0993 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3","3. Workers & Pricing":"\u09E9. \u0995\u09B0\u09CD\u09AE\u09C0 \u0993 \u09AA\u09BE\u09B0\u09BF\u09B6\u09CD\u09B0\u09AE\u09BF\u0995","Publish Job":"\u0995\u09BE\u099C \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0995\u09B0\u09C1\u09A8","Publish / activate immediately":"\u098F\u0996\u09A8\u0987 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 / \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8","Publishing\u2026":"\u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0995\u09B0\u09BE \u09B9\u099A\u09CD\u099B\u09C7\u2026","Go to My Jobs":"\u0986\u09AE\u09BE\u09B0 \u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB\u09A4\u09C7 \u09AF\u09BE\u09A8","Deposit Funds":"\u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Make a deposit":"\u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Deposit history":"\u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8",Deposits:"\u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE","Funds are added after admin verification.":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09BE\u09B0 \u09AA\u09B0 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u09B9\u09AC\u09C7\u0964","Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF bKash, Nagad, Rocket \u09AC\u09BE Upay-\u098F\u09B0 TRXID \u099C\u09AE\u09BE \u09A6\u09BF\u09A8\u0964","1. Select Payment Method":"\u09E7. \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8","2. Send Money":"\u09E8. \u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8","3. Submit TRXID":"\u09E9. TRXID \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Send money to:":"\u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8:","Sender Number":"\u09AA\u09CD\u09B0\u09C7\u09B0\u0995\u09C7\u09B0 \u09A8\u09AE\u09CD\u09AC\u09B0","Amount (Taka)":"\u099F\u09BE\u0995\u09BE\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Transaction ID (TRXID)":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 (TRXID)","Submit Payment":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u099C\u09AE\u09BE \u09A6\u09BF\u09A8","Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.":"\u09A8\u09BF\u099A\u09C7 \u09AF\u09C7 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09B2\u09BF\u0996\u09AC\u09C7\u09A8 \u09A0\u09BF\u0995 \u09B8\u09C7\u0987 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 TRXID \u099C\u09AE\u09BE \u09A6\u09BF\u09A8\u0964 \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7 \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B2\u09BE\u0997\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964","\u26A0 Please double-check the TRXID. Duplicate or invalid TRXIDs will be rejected.":"\u26A0 TRXID \u09AD\u09BE\u09B2\u09CB\u09AD\u09BE\u09AC\u09C7 \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09A8\u09BF\u09A8\u0964 \u098F\u0995\u0987 \u09AC\u09BE \u09AD\u09C1\u09B2 TRXID \u099C\u09AE\u09BE \u09A6\u09BF\u09B2\u09C7 \u09A4\u09BE \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09AC\u09C7\u0964","Payment Verifications":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AF\u09BE\u099A\u09BE\u0987","Review TRXID-based deposits submitted by users. Approving credits the user's balance.":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09A6\u09C7\u09B0 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE TRXID \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8\u0964 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09B2\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8\u09C7 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u09B9\u09AC\u09C7\u0964","Withdrawal Amount (Taka)":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3","Account / Wallet Address":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F / \u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09A8\u09AE\u09CD\u09AC\u09B0","Payment Method":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF","Confirm Withdrawal":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8","Withdrawable Balance":"\u09A4\u09CB\u09B2\u09BE\u09B0 \u0989\u09AA\u09AF\u09CB\u0997\u09C0 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8","Withdrawal History":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8",Withdrawals:"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE","Pending withdrawals":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7","No pending withdrawals.":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09A8\u09C7\u0987\u0964","Withdrawals may be rejected due to insufficient balance, invalid wallet address, or not meeting the minimum referral requirement.":"\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u0995\u09AE \u09A5\u09BE\u0995\u09B2\u09C7, \u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AD\u09C1\u09B2 \u09B9\u09B2\u09C7 \u0985\u09A5\u09AC\u09BE \u09A8\u09CD\u09AF\u09C2\u09A8\u09A4\u09AE \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A8\u09BE \u09A5\u09BE\u0995\u09B2\u09C7 \u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964",bKash:"\u09AC\u09BF\u0995\u09BE\u09B6",Nagad:"\u09A8\u0997\u09A6",Rocket:"\u09B0\u0995\u09C7\u099F",Upay:"\u0989\u09AA\u09BE\u09DF",Referrals:"\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2","Referral Network":"\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995","Your Referrals":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2","Total Network:":"\u09AE\u09CB\u099F \u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995:","Invite & Earn":"\u0986\u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u099C\u09BE\u09A8\u09BE\u09A8 \u0993 \u0986\u09DF \u0995\u09B0\u09C1\u09A8","Copy and share your unique referral link":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0986\u09B2\u09BE\u09A6\u09BE \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09B2\u09BF\u0982\u0995 \u0995\u09AA\u09BF \u0995\u09B0\u09C7 \u09B6\u09C7\u09DF\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8","Share on Telegram":"\u099F\u09C7\u09B2\u09BF\u0997\u09CD\u09B0\u09BE\u09AE\u09C7 \u09B6\u09C7\u09DF\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8","No referrals yet. Share your link to start earning 50% of their rewards!":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A8\u09C7\u0987\u0964 \u09B2\u09BF\u0982\u0995 \u09B6\u09C7\u09DF\u09BE\u09B0 \u0995\u09B0\u09C7 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0\u09C7\u09B0 \u09EB\u09E6% \u0986\u09DF \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8!","Share your referral link with friends. When they earn, you get 50% commission on their earnings!":"\u09AC\u09A8\u09CD\u09A7\u09C1\u09A6\u09C7\u09B0 \u09B8\u0999\u09CD\u0997\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09B2\u09BF\u0982\u0995 \u09B6\u09C7\u09DF\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 \u09A4\u09BE\u09B0\u09BE \u0986\u09DF \u0995\u09B0\u09B2\u09C7 \u0986\u09AA\u09A8\u09BF \u09A4\u09BE\u09A6\u09C7\u09B0 \u0986\u09DF\u09C7\u09B0 \u09EB\u09E6% \u0995\u09AE\u09BF\u09B6\u09A8 \u09AA\u09BE\u09AC\u09C7\u09A8!","When they register and start watching ads or completing tasks":"\u09A4\u09BE\u09B0\u09BE \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0995\u09B0\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE \u09AC\u09BE \u0995\u09BE\u099C \u0995\u09B0\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09B2\u09C7","You will receive 50% commission instantly":"\u0986\u09AA\u09A8\u09BF \u09B8\u0999\u09CD\u0997\u09C7 \u09B8\u0999\u09CD\u0997\u09C7 \u09EB\u09E6% \u0995\u09AE\u09BF\u09B6\u09A8 \u09AA\u09BE\u09AC\u09C7\u09A8","| Bonus Rate:":"| \u09AC\u09CB\u09A8\u09BE\u09B8\u09C7\u09B0 \u09B9\u09BE\u09B0:","| Earned so far:":"| \u098F \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0986\u09DF:","No referrals yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A8\u09C7\u0987\u0964","Contact Us":"\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Contact Whatsapp":"WhatsApp-\u098F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Telegram Support":"\u099F\u09C7\u09B2\u09BF\u0997\u09CD\u09B0\u09BE\u09AE \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE","Help Center":"\u09B8\u09B9\u09BE\u09DF\u09A4\u09BE \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0","Find answers to common questions":"\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u0997\u09C1\u09B2\u09CB\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u0996\u09C1\u0981\u099C\u09C1\u09A8","How do I earn money?":"\u0986\u09AE\u09BF \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0986\u09DF \u0995\u09B0\u09AC?","How do referrals work?":"\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0995\u09BE\u099C \u0995\u09B0\u09C7?","How do withdrawals work?":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u09A8\u09BF\u09DF\u09AE \u0995\u09C0?","Why was my withdrawal rejected?":"\u0986\u09AE\u09BE\u09B0 \u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0995\u09C7\u09A8 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7?","You can earn money by watching ads, completing web tasks, and referring friends. Each activity has its own reward rate.":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C7, \u0993\u09DF\u09C7\u09AC \u0995\u09BE\u099C \u0995\u09B0\u09C7 \u098F\u09AC\u0982 \u09AC\u09A8\u09CD\u09A7\u09C1\u09A6\u09C7\u09B0 \u09B0\u09C7\u09AB\u09BE\u09B0 \u0995\u09B0\u09C7 \u0986\u09DF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0\u09C7\u09B0 \u09B9\u09BE\u09B0 \u0986\u09B2\u09BE\u09A6\u09BE\u0964","You can withdraw your earnings via bKash or Nagad. Minimum withdrawal is $1.00 and you need at least 1 referral.":"bKash \u09AC\u09BE Nagad-\u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09DF \u09A4\u09CB\u09B2\u09BE \u09AF\u09BE\u09DF\u0964 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 $\u09E7.\u09E6\u09E6 \u098F\u09AC\u0982 \u0985\u09A8\u09CD\u09A4\u09A4 \u09E7\u099F\u09BF \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A5\u09BE\u0995\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Still need help? Reach out to our support team":"\u0986\u09B0\u0993 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE \u09A6\u09B0\u0995\u09BE\u09B0? \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE \u09A6\u09B2\u09C7\u09B0 \u09B8\u0999\u09CD\u0997\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Customer Support":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE","Account, payment, and marketplace updates.":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F, \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0993 \u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09AA\u09CD\u09B2\u09C7\u09B8\u09C7\u09B0 \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09A4\u09A5\u09CD\u09AF\u0964","Mark all read":"\u09B8\u09AC\u0997\u09C1\u09B2\u09CB \u09AA\u09DC\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8","No notifications yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09A8\u09C7\u0987\u0964","Notifications are unavailable right now.":"\u098F\u0987 \u09AE\u09C1\u09B9\u09C2\u09B0\u09CD\u09A4\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09A8\u09BE\u0964","View wallet":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09A6\u09C7\u0996\u09C1\u09A8","View ledger":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8\u09C7\u09B0 \u0996\u09BE\u09A4\u09BE \u09A6\u09C7\u0996\u09C1\u09A8","Withdraw Funds":"\u099F\u09BE\u0995\u09BE \u09A4\u09C1\u09B2\u09C1\u09A8","Executive Dashboard":"\u09AA\u09CD\u09B0\u09B6\u09BE\u09B8\u09A8\u09BF\u0995 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1","Operations overview":"\u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u09C7\u09B0 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA","System-wide operational metrics, finance auditing, and platform management.":"\u09AA\u09C1\u09B0\u09CB \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE, \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09A8\u09BF\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0993 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF\u0964","System Maintenance":"\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09B0\u0995\u09CD\u09B7\u09A3\u09BE\u09AC\u09C7\u0995\u09CD\u09B7\u09A3","Reset Daily Counters":"\u09A6\u09C8\u09A8\u09BF\u0995 \u0997\u09A3\u09A8\u09BE \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8","Reset daily user ad view limits and daily bonus claim timers for all users.":"\u09B8\u09AC \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09A6\u09C8\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE\u09B0 \u09B8\u09C0\u09AE\u09BE \u0993 \u09AC\u09CB\u09A8\u09BE\u09B8 \u09A8\u09C7\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8\u0964","Users & Roles":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u0993 \u09AD\u09C2\u09AE\u09BF\u0995\u09BE","Banned users":"\u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0","Ad rewards":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u09C7\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0","Legacy earning activity alongside marketplace finance.":"\u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09AA\u09CD\u09B2\u09C7\u09B8\u09C7\u09B0 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u09C7\u09B0 \u09AA\u09BE\u09B6\u09BE\u09AA\u09BE\u09B6\u09BF \u09AA\u09C1\u09B0\u09CB\u09A8\u09CB \u0986\u09DF\u09C7\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC\u0964","Worker earnings":"\u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u0986\u09DF",Commissions:"\u0995\u09AE\u09BF\u09B6\u09A8","Completed payments":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F","Pending payments":"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F","Completed video ads":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","Video ad views":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE","Video rewards paid":"\u09AD\u09BF\u09A1\u09BF\u0993\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7","User ad rewards":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0","Job Post (Pending Approval)":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F (\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF)","All Jobs Moderation":"\u09B8\u09AC \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE","Review pending user job postings, activate approved jobs, track live active jobs, and inspect worker proofs & screenshots.":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09C1\u09A8, \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u0995\u09BE\u099C \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8, \u099A\u09B2\u09AE\u09BE\u09A8 \u0995\u09BE\u099C \u09A6\u09C7\u0996\u09C1\u09A8 \u098F\u09AC\u0982 \u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 \u0993 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8\u0964","Filter Status":"\u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09A6\u09BF\u09DF\u09C7 \u09AC\u09BE\u099B\u09BE\u0987","Status:":"\u0985\u09AC\u09B8\u09CD\u09A5\u09BE:","Worker assignments":"\u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997","Pending worker bids":"\u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC","Pending jobs":"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u0995\u09BE\u099C","Proof Submissions for":"\u098F\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3","Current configuration":"\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8","Ad Providers":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u0995\u09BE\u09B0\u09C0","Manage Providers":"\u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u0995\u09BE\u09B0\u09C0 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE","Manage Video Ads":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE","Manage rewarded video ads, provider rotation, and website/app monetization settings.":"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0\u09AF\u09C1\u0995\u09CD\u09A4 \u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8, \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u0995\u09BE\u09B0\u09C0\u09B0 \u09AA\u09BE\u09B2\u09BE \u098F\u09AC\u0982 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F/\u0985\u09CD\u09AF\u09BE\u09AA\u09C7\u09B0 \u0986\u09DF-\u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Configure legacy provider rotation, placement identifiers, rewards, and minimum watch time.":"\u09AA\u09C1\u09B0\u09CB\u09A8\u09CB \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u0995\u09BE\u09B0\u09C0\u09B0 \u09AA\u09BE\u09B2\u09BE, \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u09C7\u09B0 \u09B8\u09CD\u09A5\u09BE\u09A8, \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0993 \u09A6\u09C7\u0996\u09BE\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u09B8\u09AE\u09DF \u09A0\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964","Control the advertisement and watch-and-earn master switches plus website/app ad units.":"\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09C7 \u0986\u09DF\u09C7\u09B0 \u09AE\u09C2\u09B2 \u09B8\u09C1\u0987\u099A \u098F\u09AC\u0982 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F/\u0985\u09CD\u09AF\u09BE\u09AA\u09C7\u09B0 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A8\u09BF\u09DF\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964","Monetization Settings":"\u0986\u09DF\u09C7\u09B0 \u09B8\u09C7\u099F\u09BF\u0982\u09B8","Upload promotional videos, set rewards and limits, and pause or activate campaigns.":"\u09AA\u09CD\u09B0\u099A\u09BE\u09B0\u09AE\u09C2\u09B2\u0995 \u09AD\u09BF\u09A1\u09BF\u0993 \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8, \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0993 \u09B8\u09C0\u09AE\u09BE \u09A0\u09BF\u0995 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u099A\u09BE\u09B0 \u099A\u09BE\u09B2\u09C1 \u09AC\u09BE \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8\u0964","Video Ads":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8","Add sponsored video":"\u09B8\u09CD\u09AA\u09A8\u09B8\u09B0 \u09AD\u09BF\u09A1\u09BF\u0993 \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Upload video ad":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8","Video file (optional if URL is provided)":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AB\u09BE\u0987\u09B2 (URL \u09A6\u09BF\u09B2\u09C7 \u0990\u099A\u09CD\u099B\u09BF\u0995)","HTTPS video URL (optional if file is provided)":"HTTPS \u09AD\u09BF\u09A1\u09BF\u0993 URL (\u09AB\u09BE\u0987\u09B2 \u09A6\u09BF\u09B2\u09C7 \u0990\u099A\u09CD\u099B\u09BF\u0995)","Duration (seconds)":"\u09B8\u09AE\u09DF\u0995\u09BE\u09B2 (\u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1)","Min duration (s):":"\u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u09B8\u09AE\u09DF (\u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1):","Daily limit (0 = unlimited)":"\u09A6\u09C8\u09A8\u09BF\u0995 \u09B8\u09C0\u09AE\u09BE (\u09E6 = \u09B8\u09C0\u09AE\u09BE\u09B9\u09C0\u09A8)","Total limit (0 = unlimited)":"\u09B8\u09B0\u09CD\u09AC\u09AE\u09CB\u099F \u09B8\u09C0\u09AE\u09BE (\u09E6 = \u09B8\u09C0\u09AE\u09BE\u09B9\u09C0\u09A8)","Set 0 for unlimited":"\u09B8\u09C0\u09AE\u09BE\u09B9\u09C0\u09A8 \u09B0\u09BE\u0996\u09A4\u09C7 \u09E6 \u09A6\u09BF\u09A8","Eligible rewards":"\u09AF\u09CB\u0997\u09CD\u09AF \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0",Reward:"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0","Reward:":"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0:","Weight:":"\u0985\u0997\u09CD\u09B0\u09BE\u09A7\u09BF\u0995\u09BE\u09B0:",Title:"\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE",Type:"\u09A7\u09B0\u09A8",Role:"\u09AD\u09C2\u09AE\u09BF\u0995\u09BE","Date:":"\u09A4\u09BE\u09B0\u09BF\u0996:","From:":"\u09AA\u09CD\u09B0\u09C7\u09B0\u0995:","User:":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0:","Customer:":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995:","Customer name":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE","Customer email":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995\u09C7\u09B0 \u0987\u09AE\u09C7\u0987\u09B2","Customer phone":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995\u09C7\u09B0 \u09AB\u09CB\u09A8","Customer requirements":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4","Phone:":"\u09AB\u09CB\u09A8:","Email:":"\u0987\u09AE\u09C7\u0987\u09B2:","Admin notes":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09A8\u09CB\u099F","Main Categories":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Main Categories List":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE","Subcategories List":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE","Categories & Subcategories":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u0993 \u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Add New Main Category":"\u09A8\u09A4\u09C1\u09A8 \u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Add New Subcategory":"\u09A8\u09A4\u09C1\u09A8 \u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Create Main Category":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8","Create Subcategory":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8","Category Name":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A8\u09BE\u09AE","Subcategory Name":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A8\u09BE\u09AE","Parent Main Category":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Display Order":"\u09AA\u09CD\u09B0\u09A6\u09B0\u09CD\u09B6\u09A8\u09C7\u09B0 \u0995\u09CD\u09B0\u09AE","Min Cost Per Task (\u09F3)":"\u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A (\u09F3)","No categories yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09C7\u0987\u0964","No subcategories yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09C7\u0987\u0964",Slug:"\u09B8\u09CD\u09B2\u09BE\u0997",Reports:"\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8","Aggregated transaction volume, assignment payments, submission risk, and marketplace job value.":"\u09AE\u09CB\u099F \u09B2\u09C7\u09A8\u09A6\u09C7\u09A8, \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F, \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C\u09C7\u09B0 \u099D\u09C1\u0981\u0995\u09BF \u098F\u09AC\u0982 \u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09AA\u09CD\u09B2\u09C7\u09B8\u09C7\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09AE\u09C2\u09B2\u09CD\u09AF\u0964","Export CSV":"CSV \u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09C1\u09A8","Jobs by status":"\u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u0995\u09BE\u099C","Assignments by payment state":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997","Submissions by risk":"\u099D\u09C1\u0981\u0995\u09BF \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C","Transactions by type":"\u09A7\u09B0\u09A8 \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09B2\u09C7\u09A8\u09A6\u09C7\u09A8","Transaction Ledger":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8\u09C7\u09B0 \u0996\u09BE\u09A4\u09BE","Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.":"\u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09AA\u09CD\u09B2\u09C7\u09B8\u09C7 \u09B9\u0993\u09DF\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE, \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8, \u098F\u09B8\u0995\u09CD\u09B0\u09CB \u09B2\u09C7\u09A8\u09A6\u09C7\u09A8, \u0995\u09AE\u09BF\u09B6\u09A8 \u0993 \u09AB\u09C7\u09B0\u09A4\u09C7\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC\u0964","Risk signals are advisory. Confirm fraud only after reviewing the proof. A confirmed decision can optionally ban the worker and revoke active sessions.":"\u099D\u09C1\u0981\u0995\u09BF\u09B0 \u09B8\u0982\u0995\u09C7\u09A4\u0997\u09C1\u09B2\u09CB \u0995\u09C7\u09AC\u09B2 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09BE\u09B0 \u09AA\u09B0\u0987 \u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u09B9\u09B2\u09C7 \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE \u0993 \u09A4\u09BE\u09B0 \u099A\u09B2\u09AE\u09BE\u09A8 \u09B8\u09C7\u09B6\u09A8 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09AF\u09C7\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964","Fraud Review":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE","Block ID:":"\u09AC\u09CD\u09B2\u0995 \u0986\u0987\u09A1\u09BF:","Current Screenshot":"\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F","No image uploaded":"\u0995\u09CB\u09A8\u09CB \u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF","Choose a new file to replace it, or remove it.":"\u09AC\u09A6\u09B2\u09BE\u09A4\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AB\u09BE\u0987\u09B2 \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8, \u0985\u09A5\u09AC\u09BE \u099B\u09AC\u09BF\u099F\u09BF \u09B8\u09B0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8\u0964","Add Requirement":"\u09B6\u09B0\u09CD\u09A4 \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Add Requirement Pair":"\u09B6\u09B0\u09CD\u09A4\u09C7\u09B0 \u099C\u09CB\u09DC\u09BE \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Remove requirement":"\u09B6\u09B0\u09CD\u09A4 \u09B8\u09B0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8","Animation Direction":"\u0985\u09CD\u09AF\u09BE\u09A8\u09BF\u09AE\u09C7\u09B6\u09A8\u09C7\u09B0 \u09A6\u09BF\u0995","Banner Images":"\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF","Banner Setting (Image Only)":"\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 (\u09B6\u09C1\u09A7\u09C1 \u099B\u09AC\u09BF)","Add Banner Image":"\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","+ Add Banner Image":"+ \u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8","Remove banner":"\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0 \u09B8\u09B0\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8","Upload image files directly (JPG, PNG, WEBP, GIF).":"JPG, PNG, WEBP \u09AC\u09BE GIF \u099B\u09AC\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8\u0964","Upload banner images to display on the homepage dashboard. Click":"\u09B9\u09CB\u09AE \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u09A6\u09C7\u0996\u09BE\u09A8\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8\u0964 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8","to upload images directly. Banners rotate randomly after every specified interval.":"\u099B\u09AC\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7\u0964 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09B8\u09AE\u09DF \u09AA\u09B0 \u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u0997\u09C1\u09B2\u09CB \u098F\u09B2\u09CB\u09AE\u09C7\u09B2\u09CB\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A6\u09B2\u09BE\u09AC\u09C7\u0964","Text Notice:":"\u09B2\u09C7\u0996\u09BE\u09B0 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF:","Rotation Interval (seconds)":"\u09AC\u09A6\u09B2\u09BE\u09A8\u09CB\u09B0 \u09AC\u09BF\u09B0\u09A4\u09BF (\u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1)","Time period before switching to a random banner image (default: 4 seconds).":"\u098F\u09B2\u09CB\u09AE\u09C7\u09B2\u09CB \u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7 \u09AF\u09BE\u0993\u09DF\u09BE\u09B0 \u0986\u0997\u09C7\u09B0 \u09B8\u09AE\u09DF (\u09A1\u09BF\u09AB\u09B2\u09CD\u099F \u09EA \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1)\u0964","Select transition animation style when switching banner images.":"\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF \u09AC\u09A6\u09B2\u09BE\u09A8\u09CB\u09B0 \u09B8\u09AE\u09DF \u0985\u09CD\u09AF\u09BE\u09A8\u09BF\u09AE\u09C7\u09B6\u09A8\u09C7\u09B0 \u09A7\u09B0\u09A8 \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964","Bottom to Top (Gradual Vanish)":"\u09A8\u09BF\u099A \u09A5\u09C7\u0995\u09C7 \u0993\u09AA\u09B0\u09C7 (\u09A7\u09C0\u09B0\u09C7 \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7)","Top to Bottom (Gradual Vanish)":"\u0993\u09AA\u09B0 \u09A5\u09C7\u0995\u09C7 \u09A8\u09BF\u099A\u09C7 (\u09A7\u09C0\u09B0\u09C7 \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7)","Left to Right (Gradual Vanish)":"\u09AC\u09BE\u09AE \u09A5\u09C7\u0995\u09C7 \u09A1\u09BE\u09A8\u09C7 (\u09A7\u09C0\u09B0\u09C7 \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7)","Right to Left (Gradual Vanish)":"\u09A1\u09BE\u09A8 \u09A5\u09C7\u0995\u09C7 \u09AC\u09BE\u09AE\u09C7 (\u09A7\u09C0\u09B0\u09C7 \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7)","Fade In / Out":"\u09A7\u09C0\u09B0\u09C7 \u09A6\u09C7\u0996\u09BE \u09A6\u09C7\u0993\u09DF\u09BE / \u09AE\u09BF\u09B2\u09BF\u09DF\u09C7 \u09AF\u09BE\u0993\u09DF\u09BE","Social Media Links (Footer)":"\u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7\u09B0 \u09B2\u09BF\u0982\u0995 (\u09AB\u09C1\u099F\u09BE\u09B0)","Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.":"\u09B8\u09BE\u0987\u099F\u09C7\u09B0 \u09AB\u09C1\u099F\u09BE\u09B0\u09C7 \u09A6\u09C7\u0996\u09BE\u09A8\u09CB \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7\u09B0 \u0986\u0987\u0995\u09A8\u09C7\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3 URL \u09A6\u09BF\u09A8\u0964 \u09B2\u09C1\u0995\u09BE\u09A4\u09C7 \u09AB\u09BE\u0981\u0995\u09BE \u09B0\u09BE\u0996\u09C1\u09A8\u0964","Facebook URL":"Facebook URL","Instagram URL":"Instagram URL","Telegram Link / Channel":"Telegram \u09B2\u09BF\u0982\u0995 / \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2","WhatsApp Link / Number":"WhatsApp \u09B2\u09BF\u0982\u0995 / \u09A8\u09AE\u09CD\u09AC\u09B0","Manage main categories, subcategories, and minimum cost limits.":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF, \u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u0993 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A\u09C7\u09B0 \u09B8\u09C0\u09AE\u09BE \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Configure platform-wide defaults, homepage popup notices, and social media links.":"\u09AA\u09C1\u09B0\u09CB \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09A1\u09BF\u09AB\u09B2\u09CD\u099F, \u09B9\u09CB\u09AE\u09AA\u09C7\u099C\u09C7\u09B0 \u09AA\u09AA-\u0986\u09AA \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u098F\u09AC\u0982 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7\u09B0 \u09B2\u09BF\u0982\u0995 \u09A0\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964","Failed to load jobs:":"\u0995\u09BE\u099C \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load job:":"\u0995\u09BE\u099C \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load job form:":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AB\u09B0\u09CD\u09AE \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load submissions:":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load notifications:":"\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load poster statistics:":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load reports:":"\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load ledger:":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8\u09C7\u09B0 \u0996\u09BE\u09A4\u09BE \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load wallet:":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Failed to load tasks.":"\u0995\u09BE\u099C\u0997\u09C1\u09B2\u09CB \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Error:":"\u09A4\u09CD\u09B0\u09C1\u099F\u09BF:","Could not load job:":"\u0995\u09BE\u099C \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Could not load job form:":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AB\u09B0\u09CD\u09AE \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF:","Try again":"\u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8","Welcome back!":"\u0986\u09AC\u09BE\u09B0 \u09AB\u09BF\u09B0\u09C7 \u0986\u09B8\u09BE\u09DF \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE!","Logged out.":"\u0986\u09AA\u09A8\u09BF \u09B2\u0997 \u0986\u0989\u099F \u0995\u09B0\u09C7\u099B\u09C7\u09A8\u0964","Login failed":"\u09B2\u0997 \u0987\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Session expired. Please log in.":"\u09B8\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u0964 \u0986\u09AC\u09BE\u09B0 \u09B2\u0997 \u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964","Uploaded!":"\u0986\u09AA\u09B2\u09CB\u09A1 \u09B9\u09DF\u09C7\u099B\u09C7!","Uploading\u2026":"\u0986\u09AA\u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7\u2026","New screenshot selected":"\u09A8\u09A4\u09C1\u09A8 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7","There are no jobs yet.":"\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u0995\u09BE\u099C \u09A8\u09C7\u0987\u0964"}).map(([e,t])=>[_e(e),t]));Object.entries({"Open Settings":"\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u0996\u09C1\u09B2\u09C1\u09A8","Cancel/refund":"\u09AC\u09BE\u09A4\u09BF\u09B2 / \u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4","Cancelled/refunded":"\u09AC\u09BE\u09A4\u09BF\u09B2 / \u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7","Deadline:":"\u09B6\u09C7\u09B7 \u09B8\u09AE\u09DF:","Start date:":"\u09B6\u09C1\u09B0\u09C1\u09B0 \u09A4\u09BE\u09B0\u09BF\u0996:","Upload / Edit screenshot":"\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u0986\u09AA\u09B2\u09CB\u09A1 / \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE","Create or maintain a job using the same worker assignment and payment workflow as customer posts.":"\u0997\u09CD\u09B0\u09BE\u09B9\u0995\u09C7\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09AE\u09A4\u09CB \u098F\u0995\u0987 \u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997 \u0993 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09DF \u0995\u09BE\u099C \u09A4\u09C8\u09B0\u09BF \u09AC\u09BE \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Days Remaining:":"\u09AC\u09BE\u0995\u09BF \u09A6\u09BF\u09A8:","Paid:":"\u09AA\u09B0\u09BF\u09B6\u09CB\u09A7\u09BF\u09A4:","Remaining:":"\u09AC\u09BE\u0995\u09BF:","Unassigned:":"\u09A8\u09BF\u09DF\u09CB\u0997 \u09B9\u09DF\u09A8\u09BF:","Lifetime paid":"\u09B8\u09B0\u09CD\u09AC\u09AE\u09CB\u099F \u09AA\u09B0\u09BF\u09B6\u09CB\u09A7","currency \xB7":"\u09AE\u09C1\u09A6\u09CD\u09B0\u09BE \xB7",escrow:"\u098F\u09B8\u0995\u09CD\u09B0\u09CB","External link (optional)":"\u09AC\u09BE\u0987\u09B0\u09C7\u09B0 \u09B2\u09BF\u0982\u0995 (\u0990\u099A\u09CD\u099B\u09BF\u0995)",in:"\u09AE\u09A7\u09CD\u09AF\u09C7",Pay:"\u09AA\u09B0\u09BF\u09B6\u09CB\u09A7 \u0995\u09B0\u09C1\u09A8","Main Category":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","Sample image":"\u09A8\u09AE\u09C1\u09A8\u09BE \u099B\u09AC\u09BF",Created:"\u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7","Created:":"\u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7:",Views:"\u09A6\u09C7\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7","Views:":"\u09A6\u09C7\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7:","Available wallet":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u09AF\u09CB\u0997\u09CD\u09AF \u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8","Fund your available wallet, monitor escrow, and review deposits.":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F\u09C7 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8, \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09B0 \u09B9\u09BF\u09B8\u09BE\u09AC \u09A6\u09C7\u0996\u09C1\u09A8 \u098F\u09AC\u0982 \u099C\u09AE\u09BE\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09C1\u09A8\u0964","Need more wallet funds?":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F\u09C7 \u0986\u09B0\u0993 \u099F\u09BE\u0995\u09BE \u09A6\u09B0\u0995\u09BE\u09B0?","to get started.":"\u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7\u0964","Wait:":"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE:","\xB7 Daily Limit:":"\xB7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B8\u09C0\u09AE\u09BE:","Ready to get started?":"\u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4?","Forgot Password":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AD\u09C1\u09B2\u09C7 \u0997\u09C7\u099B\u09C7\u09A8?","Admin access required.":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0985\u09A8\u09C1\u09AE\u09A4\u09BF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964","ADMIN CONTROL CENTER":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09A8\u09BF\u09DF\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0","Open job details":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u0996\u09C1\u09B2\u09C1\u09A8","TRX:":"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 (TRX):","JM Job:":"JMJob:","Facebook URL":"Facebook-\u098F\u09B0 URL","Instagram URL":"Instagram-\u098F\u09B0 URL","Submitted:":"\u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7:"}).forEach(([e,t])=>Za.set(_e(e),t));Object.entries({"Please fill in all fields.":"\u09B8\u09AC \u0998\u09B0 \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964","Please enter a valid 6-digit code.":"\u09B8\u09A0\u09BF\u0995 \u09EC \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C1\u09A8\u0964","Passwords do not match.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A6\u09C1\u099F\u09BF \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE\u0964","Password must be at least 6 characters.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Password reset successfully! You can now log in.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u09B9\u09DF\u09C7\u099B\u09C7! \u098F\u0996\u09A8 \u09B2\u0997 \u0987\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964","Failed to reset password.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not open the proof attachment.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u0996\u09CB\u09B2\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Rejection reason:":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3:","Optional admin note:":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09A8\u09CB\u099F (\u0990\u099A\u09CD\u099B\u09BF\u0995):","A rejection reason is required.":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3 \u09B2\u09BF\u0996\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Submission approved for payment review.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AF\u09BE\u099A\u09BE\u0987\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09BE\u099C\u099F\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Submission rejected.":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not review submission.":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Approve and activate this job post?":"\u098F\u0987 \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C7 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09AC\u09C7\u09A8?","Job approved and activated!":"\u0995\u09BE\u099C \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u0993 \u099A\u09BE\u09B2\u09C1 \u09B9\u09DF\u09C7\u099B\u09C7!","Could not approve job.":"\u0995\u09BE\u099C \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Reason for declining this job post:":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3:","Job declined.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not decline job.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Flag this job for admin dispute review?":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09AC\u09BF\u09B0\u09CB\u09A7 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09BE\u099C\u099F\u09BF \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09AC\u09C7\u09A8?","Job flagged for dispute review.":"\u09AC\u09BF\u09B0\u09CB\u09A7 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09BE\u099C\u099F\u09BF \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not flag job.":"\u0995\u09BE\u099C\u099F\u09BF \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Payment released.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Job cancelled and escrow refunded.":"\u0995\u09BE\u099C \u09AC\u09BE\u09A4\u09BF\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09B0 \u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not resolve dispute.":"\u09AC\u09BF\u09B0\u09CB\u09A7\u09C7\u09B0 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Reset daily ad view counters for all users?":"\u09B8\u09AC \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09A6\u09C8\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09A6\u09C7\u0996\u09BE\u09B0 \u0997\u09A3\u09A8\u09BE \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09AC\u09C7\u09A8?","Daily counters reset.":"\u09A6\u09C8\u09A8\u09BF\u0995 \u0997\u09A3\u09A8\u09BE \u09B0\u09BF\u09B8\u09C7\u099F \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Reset failed.":"\u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","User role updated":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09AD\u09C2\u09AE\u09BF\u0995\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7","Role update failed":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09AD\u09C2\u09AE\u09BF\u0995\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Reason for unbanning:":"\u09A8\u09BF\u09B7\u09C7\u09A7\u09BE\u099C\u09CD\u099E\u09BE \u09A4\u09C1\u09B2\u09C7 \u09A8\u09C7\u0993\u09DF\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","Reason for banning this user:":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","User status updated.":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not update user status.":"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Reason for confirming fraud:":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","Optional review note:":"\u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u09A8\u09CB\u099F (\u0990\u099A\u09CD\u099B\u09BF\u0995):","Also ban this worker and revoke active sessions?":"\u098F\u0987 \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09C7 \u099A\u09B2\u09AE\u09BE\u09A8 \u09B8\u09C7\u09B6\u09A8\u0993 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09AC\u09C7\u09A8?","Fraud review saved and worker banned.":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7; \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Fraud review saved.":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Fraud review failed.":"\u099C\u09BE\u09B2\u09BF\u09DF\u09BE\u09A4\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Withdrawal approved":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7","Reason for rejection (optional):":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3 (\u0990\u099A\u09CD\u099B\u09BF\u0995):","Invalid wallet address":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF","Withdrawal rejected (refunded)":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7 (\u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7)","Marked as paid":"\u09AA\u09B0\u09BF\u09B6\u09CB\u09A7\u09BF\u09A4 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7","Provider saved":"\u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u0995\u09BE\u09B0\u09C0\u09B0 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7","Video ad uploaded.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u0986\u09AA\u09B2\u09CB\u09A1 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Video upload failed.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Video ad status updated.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not update video ad.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Video ad deleted.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not delete video ad.":"\u09AD\u09BF\u09A1\u09BF\u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not export the report.":"\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8 \u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Select this worker? The bid amount will be moved into escrow.":"\u098F\u0987 \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09AC\u09C7\u099B\u09C7 \u09A8\u09C7\u09AC\u09C7\u09A8? \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09C7\u09B0 \u099F\u09BE\u0995\u09BE \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09A4\u09C7 \u09B0\u09BE\u0996\u09BE \u09B9\u09AC\u09C7\u0964","Worker selected and escrow held.":"\u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u099F\u09BE\u0995\u09BE \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09A4\u09C7 \u09B0\u09BE\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not select worker.":"\u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Approve this submission and release payment to the worker?":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C7 \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09A6\u09C7\u09AC\u09C7\u09A8?","Could not release payment.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09A6\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","What should the worker revise?":"\u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u0995\u09C0 \u09B8\u0982\u09B6\u09CB\u09A7\u09A8 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7?","Revision requested.":"\u09B8\u0982\u09B6\u09CB\u09A7\u09A8\u09C7\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not request revision.":"\u09B8\u0982\u09B6\u09CB\u09A7\u09A8\u09C7\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Cancel this job? Any escrow for this job will be refunded.":"\u0995\u09BE\u099C\u099F\u09BF \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09AC\u09C7\u09A8? \u098F\u0987 \u0995\u09BE\u099C\u09C7\u09B0 \u098F\u09B8\u0995\u09CD\u09B0\u09CB\u09A4\u09C7 \u09A5\u09BE\u0995\u09BE \u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09AC\u09C7\u0964","Reason (optional):":"\u0995\u09BE\u09B0\u09A3 (\u0990\u099A\u09CD\u099B\u09BF\u0995):","Cancelled by poster":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09C7\u099B\u09C7\u09A8","Job cancelled.":"\u0995\u09BE\u099C \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not cancel job.":"\u0995\u09BE\u099C \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Please enter your email address.":"\u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09B2\u09BF\u0996\u09C1\u09A8\u0964","If an account exists with this email, you will receive a reset code.":"\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A5\u09BE\u0995\u09B2\u09C7 \u0986\u09AA\u09A8\u09BF \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F\u09C7\u09B0 \u0995\u09CB\u09A1 \u09AA\u09BE\u09AC\u09C7\u09A8\u0964","Failed to send reset code.":"\u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Failed to load referrals":"\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Link copied to clipboard!":"\u09B2\u09BF\u0982\u0995 \u0995\u09CD\u09B2\u09BF\u09AA\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u0995\u09AA\u09BF \u09B9\u09DF\u09C7\u099B\u09C7!","Link copied!":"\u09B2\u09BF\u0982\u0995 \u0995\u09AA\u09BF \u09B9\u09DF\u09C7\u099B\u09C7!","Please enter a valid positive cost amount.":"\u09B6\u09C2\u09A8\u09CD\u09AF\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09B8\u09A0\u09BF\u0995 \u0996\u09B0\u099A\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09B2\u09BF\u0996\u09C1\u09A8\u0964","Category updated.":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Deleted.":"\u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Main Category created.":"\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Subcategory updated.":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Subcategory created.":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Delete category?":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u099F\u09BF \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09AC\u09C7\u09A8?","Delete subcategory?":"\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u099F\u09BF \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09AC\u09C7\u09A8?","Please select a main category.":"\u098F\u0995\u099F\u09BF \u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8\u0964","Job title is required.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Task instructions are required.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE \u09B2\u09BF\u0996\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Job submitted for admin review.":"\u0995\u09BE\u099C\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not publish job.":"\u0995\u09BE\u099C \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Are you sure you want to cancel posting this job?":"\u098F\u0987 \u0995\u09BE\u099C \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8?","Please upload your proof screenshot/attachment.":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AC\u09BE \u09AB\u09BE\u0987\u09B2 \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8\u0964","Please provide a written report description.":"\u09B2\u09BF\u0996\u09BF\u09A4 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09A6\u09BF\u09A8\u0964","Please provide at least one form of proof (written description, screenshot, or external link).":"\u0985\u09A8\u09CD\u09A4\u09A4 \u098F\u0995\u099F\u09BF \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 \u09A6\u09BF\u09A8 (\u09B2\u09BF\u0996\u09BF\u09A4 \u09AC\u09BF\u09AC\u09B0\u09A3, \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u0985\u09A5\u09AC\u09BE \u09AC\u09BE\u0987\u09B0\u09C7\u09B0 \u09B2\u09BF\u0982\u0995)\u0964","Work submitted!":"\u0995\u09BE\u099C \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7!","Failed to submit.":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Withdraw your bid?":"\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8?","Bid withdrawn.":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Failed to withdraw.":"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Bid placed!":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7!","Failed to place bid.":"\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Settings, notices, and social links saved successfully.":"\u09B8\u09C7\u099F\u09BF\u0982\u09B8, \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u0993 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7\u09B0 \u09B2\u09BF\u0982\u0995 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","New passwords do not match.":"\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A6\u09C1\u099F\u09BF \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE\u0964","New password must be at least 6 characters.":"\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","New password must be different from current password.":"\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u099F\u09BF \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 \u0986\u09B2\u09BE\u09A6\u09BE \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964","Password changed successfully!":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7!","Failed to change password.":"\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Delete this job and its unassigned bids?":"\u098F\u0987 \u0995\u09BE\u099C \u0993 \u098F\u09A4\u09C7 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A8\u09BE \u09B9\u0993\u09DF\u09BE \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u0997\u09C1\u09B2\u09CB \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09AC\u09C7\u09A8?","Job deleted.":"\u0995\u09BE\u099C \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Submission reviewed.":"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Reason for unbanning this worker:":"\u098F\u0987 \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09A8\u09BF\u09B7\u09C7\u09A7\u09BE\u099C\u09CD\u099E\u09BE \u09A4\u09C1\u09B2\u09C7 \u09A8\u09C7\u0993\u09DF\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","Reason for banning this worker:":"\u098F\u0987 \u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","Restored by administrator":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09A8\u09BF\u09B7\u09C7\u09A7\u09BE\u099C\u09CD\u099E\u09BE \u09A4\u09C1\u09B2\u09C7 \u09A8\u09BF\u09DF\u09C7\u099B\u09C7\u09A8","Worker unbanned.":"\u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09A8\u09BF\u09B7\u09C7\u09A7\u09BE\u099C\u09CD\u099E\u09BE \u09A4\u09C1\u09B2\u09C7 \u09A8\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Worker banned and active sessions revoked.":"\u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u099A\u09B2\u09AE\u09BE\u09A8 \u09B8\u09C7\u09B6\u09A8 \u09AC\u09BE\u09A4\u09BF\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not update worker ban state.":"\u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09A8\u09BF\u09B7\u09C7\u09A7\u09BE\u099C\u09CD\u099E\u09BE\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Reason for cancelling this assignment:":"\u098F\u0987 \u09A8\u09BF\u09DF\u09CB\u0997 \u09AC\u09BE\u09A4\u09BF\u09B2\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3:","Assignment cancelled and refunded.":"\u09A8\u09BF\u09DF\u09CB\u0997 \u09AC\u09BE\u09A4\u09BF\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u099F\u09BE\u0995\u09BE \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Select a pending replacement bid first.":"\u0986\u0997\u09C7 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AC\u09BF\u0995\u09B2\u09CD\u09AA \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u099F\u09BF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964","Reason for reassignment:":"\u0986\u09AC\u09BE\u09B0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3:","Reassigned by administrator":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0986\u09AC\u09BE\u09B0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u09A8","Worker reassigned.":"\u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u0986\u09AC\u09BE\u09B0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not reassign worker.":"\u0995\u09B0\u09CD\u09AE\u09C0\u0995\u09C7 \u0986\u09AC\u09BE\u09B0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Wallet number copied.":"\u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u0995\u09AA\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not copy. Please copy manually.":"\u0995\u09AA\u09BF \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u09A8\u09BF\u099C\u09C7 \u0995\u09AA\u09BF \u0995\u09B0\u09C1\u09A8\u0964","Please select a payment method.":"\u098F\u0995\u099F\u09BF \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8\u0964","Payment submitted.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Failed to submit payment.":"\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Withdrawal requested!":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7!","Theme mode set to":"\u09A5\u09BF\u09AE \u09AE\u09CB\u09A1 \u09B8\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7:","Could not start this ad.":"\u098F\u0987 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8\u099F\u09BF \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Reward failed":"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Claim failed":"\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09A8\u09C7\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","All notifications marked as read.":"\u09B8\u09AC \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09AA\u09DC\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Could not update notifications.":"\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not mark notification as read.":"\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF\u099F\u09BF \u09AA\u09DC\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Done.":"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8\u0964","Action failed.":"\u0995\u09BE\u099C\u099F\u09BF \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not save job.":"\u0995\u09BE\u099C \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Failed to load category data.":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A4\u09A5\u09CD\u09AF \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not delete job.":"\u0995\u09BE\u099C \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not cancel assignment.":"\u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Job saved.":"\u0995\u09BE\u099C \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Reason for cancellation:":"\u09AC\u09BE\u09A4\u09BF\u09B2\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3:","Resolved by admin":"\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u09A8","Failed to upload image.":"\u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Failed to save.":"\u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Could not load categories.":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Failed to load poster statistics.":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Account created \u2014 welcome!":"\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7 \u2014 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE!","Verification code sent. It expires in 15 minutes.":"\u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09E7\u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u0995\u09CB\u09A1\u099F\u09BF\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09AC\u09C7\u0964","Could not send the verification code.":"\u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09AF\u09BE\u09DF\u09A8\u09BF\u0964","Invalid or expired verification code.":"\u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1\u099F\u09BF \u09AD\u09C1\u09B2 \u0985\u09A5\u09AC\u09BE \u098F\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09DF\u09C7\u099B\u09C7\u0964","Verification failed":"\u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Withdrawal failed":"\u099F\u09BE\u0995\u09BE \u09A4\u09CB\u09B2\u09BE\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF","Why do you need to cancel this assignment?":"\u098F\u0987 \u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8 \u0995\u09C7\u09A8?","Assignment cancelled and returned for reassignment.":"\u0995\u09B0\u09CD\u09AE\u09C0 \u09A8\u09BF\u09DF\u09CB\u0997 \u09AC\u09BE\u09A4\u09BF\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7; \u0995\u09BE\u099C\u099F\u09BF \u0986\u09AC\u09BE\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964"}).forEach(([e,t])=>Za.set(_e(e),t));var to=[[/^page (\d+) of (\d+)$/i,(e,t,a)=>`\u09AA\u09C3\u09B7\u09CD\u09A0\u09BE ${t} / ${a}`],[/^showing ([\d,]+)-([\d,]+) of ([\d,]+) open jobs$/i,(e,t,a,s)=>`${s}\u099F\u09BF \u0996\u09CB\u09B2\u09BE \u0995\u09BE\u099C\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 ${t}\u2013${a}\u099F\u09BF \u09A6\u09C7\u0996\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7`],[/^target: ([\d,]+) \| completed: ([\d,]+)$/i,(e,t,a)=>`\u09B2\u0995\u09CD\u09B7\u09CD\u09AF: ${t} | \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8: ${a}`],[/^mission progress: ([\d,]+) \/ ([\d,]+) \(([\d,]+) remaining\)$/i,(e,t,a,s)=>`\u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF: ${t} / ${a} (\u09AC\u09BE\u0995\u09BF ${s})`],[/^balance: (.+?) · earned: (.+)$/i,(e,t,a)=>`\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8: ${t} \xB7 \u09AE\u09CB\u099F \u0986\u09DF: ${a}`],[/^\$([\d,.]+) earned$/i,(e,t)=>`$${t} \u0986\u09DF`],[/^(\d+) \/ (\d+) ads today$/i,(e,t,a)=>`\u0986\u099C ${t} / ${a}\u099F\u09BF \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8`],[/^(\d+) ads$/i,(e,t)=>`${t}\u099F\u09BF \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8`],[/^(\d+) available$/i,(e,t)=>`${t}\u099F\u09BF \u099C\u09BE\u09DF\u0997\u09BE \u0996\u09BE\u09B2\u09BF`],[/^(\d+) slots left$/i,(e,t)=>`${t}\u099F\u09BF \u099C\u09BE\u09DF\u0997\u09BE \u09AC\u09BE\u0995\u09BF`],[/^(\d+) day$/i,(e,t)=>`${t} \u09A6\u09BF\u09A8`],[/^(\d+) days$/i,(e,t)=>`${t} \u09A6\u09BF\u09A8`],[/^(\d+) view$/i,(e,t)=>`${t} \u09AC\u09BE\u09B0 \u09A6\u09C7\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7`],[/^(\d+) views$/i,(e,t)=>`${t} \u09AC\u09BE\u09B0 \u09A6\u09C7\u0996\u09BE \u09B9\u09DF\u09C7\u099B\u09C7`],[/^(\d+) jobs$/i,(e,t)=>`${t}\u099F\u09BF \u0995\u09BE\u099C`],[/^(\d+) entries$/i,(e,t)=>`${t}\u099F\u09BF \u098F\u09A8\u09CD\u099F\u09CD\u09B0\u09BF`],[/^(\d+) bid$/i,(e,t)=>`${t}\u099F\u09BF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC`],[/^(\d+) bids$/i,(e,t)=>`${t}\u099F\u09BF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC`],[/^৳([\d,.]+) \/ worker$/i,(e,t)=>`\u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0 \u09F3${t}`],[/^\{.+\} slots left$/i,()=>"\u0995\u09BE\u099C\u09C7\u09B0 \u099C\u09BE\u09DF\u0997\u09BE \u09AC\u09BE\u0995\u09BF"],[/^other bids \((\d+)\)$/i,(e,t)=>`\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC (${t})`],[/^referral network \((\d+)\)$/i,(e,t)=>`\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995 (${t})`],[/^submitted on: (.+?) · attempt (\d+)$/i,(e,t,a)=>`\u099C\u09AE\u09BE: ${t} \xB7 \u099A\u09C7\u09B7\u09CD\u099F\u09BE ${a}`],[/^submitted (.+?) · attempt (\d+) · (.+?) · (.+)$/i,(e,t,a,s,r)=>`\u099C\u09AE\u09BE: ${t} \xB7 \u099A\u09C7\u09B7\u09CD\u099F\u09BE ${a} \xB7 ${kt(s)} \xB7 ${r}`],[/^submitted (.+?) · attempt (\d+) · (.+)$/i,(e,t,a,s)=>`\u099C\u09AE\u09BE: ${t} \xB7 \u099A\u09C7\u09B7\u09CD\u099F\u09BE ${a} \xB7 ${kt(s)}`],[/^submitted: (.+)$/i,(e,t)=>`\u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7: ${t}`],[/^this assignment is (.+)\.$/i,(e,t)=>`\u098F\u0987 \u0995\u09BE\u099C\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE: ${kt(t)}\u0964`],[/^pay: ৳([\d,.]+) · available slots: ([\d,]+) · deadline: (.+)$/i,(e,t,a,s)=>`\u09AA\u09BE\u09B0\u09BF\u09B6\u09CD\u09B0\u09AE\u09BF\u0995: \u09F3${t} \xB7 \u0996\u09BE\u09B2\u09BF \u099C\u09BE\u09DF\u0997\u09BE: ${a} \xB7 \u09B6\u09C7\u09B7 \u09B8\u09AE\u09DF: ${s}`],[/^days remaining: (\d+)$/i,(e,t)=>`\u09AC\u09BE\u0995\u09BF \u09A6\u09BF\u09A8: ${t}`],[/^status: (.+)$/i,(e,t)=>`\u0985\u09AC\u09B8\u09CD\u09A5\u09BE: ${kt(t)}`],[/^job: (.+)$/i,(e,t)=>`\u0995\u09BE\u099C: ${t}`],[/^failed to load (.+?):\s*(.*)$/i,(e,t,a)=>`\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF: ${jr(t)}${a?`: ${a}`:""}`],[/^failed to load:\s*(.*)$/i,(e,t)=>`\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF${t?`: ${t}`:""}`],[/^could not load (.+?):\s*(.*)$/i,(e,t,a)=>`\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF: ${jr(t)}${a?`: ${a}`:""}`],[/^error:\s*(.+)$/i,(e,t)=>`\u09A4\u09CD\u09B0\u09C1\u099F\u09BF: ${t}`],[/^risk ([\d,.]+)$/i,(e,t)=>`\u099D\u09C1\u0981\u0995\u09BF ${t}`],[/^(.+?) · job: (.+)$/i,(e,t,a)=>`${t} \xB7 \u0995\u09BE\u099C: ${a}`],[/^(.+?) · rating ([\d,.]+)$/i,(e,t,a)=>`${t} \xB7 \u09B0\u09C7\u099F\u09BF\u0982 ${a}`],[/^(.+?) · (\d+) assignments$/i,(e,t,a)=>`${t} \xB7 ${a}\u099F\u09BF \u09A8\u09BF\u09DF\u09CB\u0997`],[/^(.+?) working \/ (\d+) review \/ (\d+) revision \/ (\d+) rejected \/ (\d+) completed$/i,(e,t,a,s,r,i)=>`${t} \u099A\u09B2\u099B\u09C7 / ${a} \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09DF / ${s} \u09B8\u0982\u09B6\u09CB\u09A7\u09A8\u09C7 / ${r} \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 / ${i} \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8`],[/^work proof attachment (.+)$/i,(e,t)=>`\u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09C7\u09B0 \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4\u09BF ${t}`],[/^banner (\d+)$/i,(e,t)=>`\u09AC\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0 ${t}`],[/^user id #([^ ·]+) · (.+)$/i,(e,t,a)=>`\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u0986\u0987\u09A1\u09BF #${t} \xB7 ${a}`],[/^proof submissions for ["“](.+?)["”]$/i,(e,t)=>`\u201C${t}\u201D-\u098F\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3`],[/^minimum cost per worker for selected category: ৳([\d,.]+)$/i,(e,t)=>`\u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09A4\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF \u0995\u09B0\u09CD\u09AE\u09C0\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A: \u09F3${t}`],[/^subtotal \(([\d,]+) workers × ৳([\d,.]+)\):$/i,(e,t,a)=>`\u0989\u09AA\u09AE\u09CB\u099F (${t} \u099C\u09A8 \u0995\u09B0\u09CD\u09AE\u09C0 \xD7 \u09F3${a}):`],[/^system fee \(([\d,.]+)%\):$/i,(e,t)=>`\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09AB\u09BF (${t}%):`],[/^(.+?) · trx: (.+)$/i,(e,t,a)=>`${t} \xB7 TRX: ${a}`],[/^(.+?) • trx: (.+)$/i,(e,t,a)=>`${t} \u2022 TRX: ${a}`],[/^(.+?) (\d+) entries$/i,(e,t,a)=>`${t} ${a}\u099F\u09BF \u098F\u09A8\u09CD\u099F\u09CD\u09B0\u09BF`],[/^(.+?) (\d+) jobs$/i,(e,t,a)=>`${t} ${a}\u099F\u09BF \u0995\u09BE\u099C`],[/^(.+?)s · reward (.+?) · ([\d,]+)\/([\d,]+) completed$/i,(e,t,a,s,r)=>`${t} \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \xB7 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 ${a} \xB7 ${s}/${r} \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8`],[/^(.+?)s · \+(.+?) · ([\d,]+)\/([\d,]+) today$/i,(e,t,a,s,r)=>`${t} \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \xB7 +${a} \xB7 \u0986\u099C ${s}/${r}`],[/^watch ([\d,]+)s to unlock the reward\.$/i,(e,t)=>`\u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09AA\u09C7\u09A4\u09C7 ${t} \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09A6\u09C7\u0996\u09C1\u09A8\u0964`],[/^did you join (.+?)\? click ok to claim the reward\.$/i,(e,t)=>`\u0986\u09AA\u09A8\u09BF \u0995\u09BF ${t} \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u09C7 \u09AF\u09CB\u0997 \u09A6\u09BF\u09DF\u09C7\u099B\u09C7\u09A8? \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u09A8\u09BF\u09A4\u09C7 OK \u099A\u09BE\u09AA\u09C1\u09A8\u0964`],[/^delete [“"](.+?)[”"]\?$/i,(e,t)=>`\u201C${t}\u201D \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09AC\u09C7\u09A8?`],[/^update min cost \(৳\) for main category "(.+)":$/i,(e,t)=>`\u09AE\u09C2\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u201C${t}\u201D-\u098F\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A \u09AC\u09A6\u09B2\u09BE\u09A8 (\u09F3):`],[/^update min cost \(৳\) for subcategory "(.+)":$/i,(e,t)=>`\u09B8\u09BE\u09AC-\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u201C${t}\u201D-\u098F\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A \u09AC\u09A6\u09B2\u09BE\u09A8 (\u09F3):`],[/^min cost updated for (.+)\.$/i,(e,t)=>`${t}-\u098F\u09B0 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0996\u09B0\u099A \u09B9\u09BE\u09B2\u09A8\u09BE\u0997\u09BE\u09A6 \u09B9\u09DF\u09C7\u099B\u09C7\u0964`],[/^accent color set to (.+)\.$/i,(e,t)=>`\u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u09B0\u0982 ${t} \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`],[/^theme mode set to (.+)\.$/i,(e,t)=>`\u09A5\u09BF\u09AE \u09AE\u09CB\u09A1 ${ao(t)} \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`],[/^([+]?\s*\$?)([\d,.]+) credited!$/i,(e,t,a)=>`${t}${a} \u09AF\u09CB\u0997 \u09B9\u09DF\u09C7\u099B\u09C7!`],[/^failed to load deposit info:\s*(.*)$/i,(e,t)=>`\u099C\u09AE\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF${t?`: ${t}`:""}`]];function kt(e){return{active:"\u099A\u09B2\u09AE\u09BE\u09A8",assigned:"\u09A8\u09BF\u09DF\u09CB\u0997 \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7",approved:"\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4",completed:"\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8",cancelled:"\u09AC\u09BE\u09A4\u09BF\u09B2",declined:"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4",pending:"\u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3",pending_review:"\u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09DF",revision:"\u09B8\u0982\u09B6\u09CB\u09A7\u09A8 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8",rejected:"\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4",working:"\u0995\u09BE\u099C \u099A\u09B2\u099B\u09C7"}[_e(e).replace(/\s+/g,"_")]||e}function ao(e){return{light:"\u09B2\u09BE\u0987\u099F",dark:"\u09A1\u09BE\u09B0\u09CD\u0995",system:"\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0"}[_e(e)]||e}function jr(e){return{jobs:"\u0995\u09BE\u099C",job:"\u0995\u09BE\u099C","job form":"\u0995\u09BE\u099C\u09C7\u09B0 \u09AB\u09B0\u09CD\u09AE",submissions:"\u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0995\u09BE\u099C",categories:"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF","category data":"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A4\u09A5\u09CD\u09AF",notifications:"\u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF","poster statistics":"\u0995\u09BE\u099C\u09A6\u09BE\u09A4\u09BE\u09B0 \u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8",reports:"\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8",ledger:"\u09B2\u09C7\u09A8\u09A6\u09C7\u09A8\u09C7\u09B0 \u0996\u09BE\u09A4\u09BE",wallet:"\u0993\u09DF\u09BE\u09B2\u09C7\u099F"}[_e(e)]||e}function so(){try{return localStorage.getItem(Nr)==="bn"?"bn":"en"}catch{return"en"}}function Mr(){return je}function he(e){if(je!=="bn")return e;let t=String(e).match(/^\s*/)?.[0]||"",a=String(e).match(/\s*$/)?.[0]||"",s=String(e).trim(),r=Za.get(_e(s));if(r)return`${t}${r}${a}`;for(let[i,n]of to)if(i.test(s))return`${t}${s.replace(i,n)}${a}`;return e}function xt(e){return!!e?.closest(eo)}function Xa(e){if(!e.parentElement||xt(e.parentElement))return;let t=e.nodeValue??"",a=Lr.get(e);(!Va.has(e)||a!==void 0&&t!==a)&&Va.set(e,t);let s=he(Va.get(e));Lr.set(e,s),s!==t&&(e.nodeValue=s)}function Ya(e,t){if(!e.hasAttribute(t)||xt(e))return;let a=Er.get(e),s=Pr.get(e);a||(a=new Map,Er.set(e,a)),s||(s=new Map,Pr.set(e,s));let r=e.getAttribute(t)??"",i=s.get(t);(!a.has(t)||i!==void 0&&r!==i)&&a.set(t,r);let n=he(a.get(t));s.set(t,n),n!==r&&e.setAttribute(t,n)}function Ka(e){if(e.nodeType===Node.TEXT_NODE){Xa(e);return}if(e.nodeType!==Node.ELEMENT_NODE||xt(e))return;Ga.forEach(s=>Ya(e,s));let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),a;for(;a=t.nextNode();)Xa(a);e.querySelectorAll("*").forEach(s=>{xt(s)||Ga.forEach(r=>Ya(s,r))})}function Rr(){document.querySelectorAll("[data-language-choice]").forEach(e=>{let t=e.dataset.languageChoice===je;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",String(t))})}function ro(){if(!(qr||typeof window>"u"))try{let e=window.alert.bind(window),t=window.confirm.bind(window),a=window.prompt.bind(window);window.alert=s=>e(he(String(s??""))),window.confirm=s=>t(he(String(s??""))),window.prompt=(s,r)=>a(he(String(s??"")),typeof r=="string"?he(r):r),qr=!0}catch{}}function Dr(e){if(!(!["en","bn"].includes(e)||e===je)){je=e;try{localStorage.setItem(Nr,e)}catch{}document.documentElement.lang=e,document.title=he("JMJob \u2014 Work. Earn. Grow."),Rr(),Ka(document.body)}}function Fr(){document.documentElement.lang=je,document.title=he("JMJob \u2014 Work. Earn. Grow."),ro(),Ka(document.body),Rr(),!(za||!document.body)&&(za=new MutationObserver(e=>{e.forEach(t=>{t.type==="characterData"?Xa(t.target):t.type==="attributes"?Ya(t.target,t.attributeName):t.addedNodes.forEach(Ka)})}),za.observe(document.body,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:Ga}))}function es(){return!!v.get()?.is_admin||D.get().startsWith("/admin")}function io(){if(es()){xr();return}Cr()}function Ir(){return se(()=>I.get(),()=>mo(),()=>uo())}function Br(){let e=()=>{let t=Z.get();return t==="system"?typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches:t==="dark"};return{tag:"button",props:{class:"topbar__icon-btn theme-toggle",title:()=>e()?"Switch to light mode":"Switch to dark mode",onclick:()=>Is(),"data-theme":()=>Z.get()},children:[{tag:"i",props:{class:()=>`bi ${e()?"bi-sun":"bi-moon"}`},children:[]}]}}function Hr(){let e=Mr();return{tag:"div",props:{class:"language-switcher",role:"group","aria-label":"Select language"},children:["en","bn"].map(t=>({tag:"button",props:{type:"button",class:`language-switcher__button ${e===t?"is-active":""}`,"data-language-choice":t,"aria-label":t==="en"?"Switch to English":"Switch to Bengali","aria-pressed":String(e===t),onclick:()=>Dr(t)},children:[t.toUpperCase()]}))}}function Ur(){let e=!!v.get()?.is_admin;return{isAdmin:e,route:e?"/admin/active-jobs":"/worker/active-jobs",load:e?()=>c.adminJobs("open"):()=>c.workerActiveJobs()}}function no(){let e=document.getElementById("topbar-active-jobs-panel");if(!e)return;let t=e.classList.contains("topbar-active-jobs--open");document.querySelectorAll(".topbar-active-jobs--open").forEach(a=>a.classList.remove("topbar-active-jobs--open")),t||(e.innerHTML.trim()||(e.innerHTML=lo(Ur()),e.querySelector("[data-active-jobs-close]")?.addEventListener("click",()=>e.classList.remove("topbar-active-jobs--open"))),e.classList.add("topbar-active-jobs--open"),setTimeout(co,0))}function oo(){return{tag:"div",props:{class:"topbar__active-jobs-wrap"},children:[{tag:"button",props:{class:"topbar__icon-btn topbar__active-jobs","aria-label":"Active Jobs",title:"Active Jobs",onclick:e=>{e.stopPropagation(),no()}},children:[{tag:"i",props:{class:"bi bi-briefcase-fill"},children:[]},{tag:"span",props:{class:"topbar__active-jobs-badge",id:"topbar-active-jobs-count","aria-live":"polite"},children:["0"]}]},{tag:"div",props:{class:"topbar-active-jobs",id:"topbar-active-jobs-panel"},children:[]}]}}function lo(e){return`<div class="topbar-active-jobs__header"><strong>Active Jobs</strong><button type="button" class="topbar-active-jobs__close" data-active-jobs-close aria-label="Close Active Jobs"><i class="bi bi-x-lg"></i></button></div><ul class="topbar-active-jobs__list" id="topbar-active-jobs-list"><li class="topbar-active-job"><i class="bi bi-hourglass-split topbar-active-job__icon"></i><div class="topbar-active-job__body"><div class="topbar-active-job__title">Loading active jobs\u2026</div><div class="topbar-active-job__text">Your active job list will appear here.</div></div></li></ul><div class="topbar-active-jobs__footer"><a href="#${e.route}" class="topbar-active-jobs__link">View all active jobs</a></div>`}async function co(){let e=document.getElementById("topbar-active-jobs-list"),t=document.getElementById("topbar-active-jobs-count");if(!(!e||!t))try{let a=Ur(),s=await a.load(),r=Array.isArray(s.data)?s.data:[];t.textContent=r.length>99?"99+":String(r.length),e.innerHTML=r.length?r.slice(0,5).map(i=>po(i,a)).join(""):'<li class="topbar-active-jobs__empty">No active jobs right now.</li>'}catch{e.innerHTML='<li class="topbar-active-jobs__empty">Active Jobs are unavailable right now.</li>',t.textContent="0"}}function po(e,t){let a=Qa(e.title||"Untitled job"),s=Qa(String(e.subtitle||e.description||"").trim().slice(0,90)),r=Qa(String(e.worker_state||e.assignment_status||e.status||"active").replace(/_/g," ")),i=t.isAdmin?`#${t.route}`:`#/jobs/${encodeURIComponent(e.id)}`;return`<li class="topbar-active-job"><i class="bi bi-briefcase topbar-active-job__icon"></i><div class="topbar-active-job__body"><div class="topbar-active-job__title">${a}</div><div class="topbar-active-job__text">${s||"Active job"} \xB7 ${r}</div><a class="topbar-active-job__action" href="${i}">Open</a></div></li>`}function Qa(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}typeof document<"u"&&document.addEventListener("click",e=>{let t=document.getElementById("topbar-active-jobs-panel");t&&t.classList.contains("topbar-active-jobs--open")&&!t.contains(e.target)&&!e.target.closest(".topbar__active-jobs")&&t.classList.remove("topbar-active-jobs--open")});function uo(){return{tag:"header",props:{class:"topbar topbar--public"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Br(),Hr(),{tag:"a",props:{class:"topbar__link",href:"#/login"},children:["Log in"]},{tag:"a",props:{class:"topbar__link topbar__link--cta",href:"#/register"},children:["Sign up"]}]}]}}function mo(){let e=v.get(),t=e?parseFloat(e.balance||0).toFixed(2):"0.00",a=e?e.name.charAt(0).toUpperCase():"U";return{tag:"header",props:{class:"topbar topbar--user"},children:[{tag:"div",props:{class:"topbar__left"},children:[{tag:"button",props:{class:"topbar__menu-btn",onclick:()=>io(),"aria-label":()=>es()?"Open admin navigation":"Open menu","aria-controls":()=>es()?"sidebar":"mobile-nav","aria-expanded":"false"},children:[{tag:"i",props:{class:"bi bi-list"},children:[]}]},{tag:"a",props:{class:"topbar__brand",href:"#/"},children:["JMJOB"]}]},{tag:"div",props:{class:"topbar__right"},children:[Br(),Hr(),oo(),{tag:"div",props:{class:"topbar__user"},children:[{tag:"div",props:{class:"topbar__avatar"},children:[a]},{tag:"div",props:{class:"topbar__user-info"},children:[{tag:"div",props:{class:"topbar__user-name"},children:[{tag:"span",props:{},children:[e?e.name:"Loading\u2026"]},{tag:"span",props:{class:"topbar__user-active-dot",title:"Active"},children:[]}]},{tag:"div",props:{class:"topbar__user-balance"},children:[`$${t}`]}]}]},{tag:"button",props:{class:"topbar__icon-btn",title:"Log out",onclick:async()=>{await at(),l("Logged out.","info")}},children:[{tag:"i",props:{class:"bi bi-box-arrow-right"},children:[]}]}]}]}}w();K();function Jr(){return se(()=>!!Fe.get(),()=>{let e=Fe.get();return{tag:"div",props:{class:"toast-container"},children:[{tag:"div",props:{class:"toast toast--"+(e.type||"info"),key:e.id||"toast"},children:[{tag:"span",props:{},children:[e.message]}]}]}},()=>({tag:"div",props:{class:"toast-container"},children:[]}))}T();function Or(){let e=new Date().getFullYear();return{tag:"footer",props:{class:"app-footer",ghostStyle:{mount:t=>{c.socialLinks().then(a=>{let s=t.querySelector("#app-footer-social");if(!s||!a)return;let r=[];a.facebook&&r.push(`<a href="${Tt(a.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`),a.instagram&&r.push(`<a href="${Tt(a.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`),a.whatsapp&&r.push(`<a href="${Tt(a.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`),a.telegram&&r.push(`<a href="${Tt(a.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`),s.innerHTML=r.join("")}).catch(()=>{})}}},children:[{tag:"div",props:{class:"app-footer__copy"},children:[`\xA9 ${e} JMJob`]},{tag:"div",props:{class:"app-footer__social",id:"app-footer-social"},children:[]},{tag:"div",props:{class:"app-footer__developed"},children:[{tag:"span",props:{},children:["Developed By: "]},{tag:"a",props:{class:"app-footer__link",href:"https://nextstagesoftware.com/",target:"_blank",rel:"noopener noreferrer"},children:["NextStageSoftware"]}]}]}}function Tt(e){return e?String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]):""}w();var bo=[{path:"/",label:"Home",icon:"bi-house-door"},{path:"/poster/post-job",label:"Post Job",icon:"bi-plus-square-fill"},{path:"/worker/active-jobs",label:"Active Jobs",icon:"bi-hammer"},{path:"/withdraw",label:"Withdraw",icon:"bi-wallet2"},{path:"/profile",label:"Account",icon:"bi-person-circle"}],go=[{path:"/admin",label:"Admin",icon:"bi-shield-lock-fill"},{path:"/admin/pending-jobs",label:"Job Post",icon:"bi-file-earmark-plus"},{path:"/admin/admin-job-post",label:"Admin Job Post",icon:"bi-plus-square"},{path:"/admin/active-jobs",label:"Active Job",icon:"bi-lightning-charge"},{path:"/admin/payments",label:"Payments",icon:"bi-cash-stack"},{path:"/admin/jobs",label:"Jobs",icon:"bi-briefcase"},{path:"/admin/transactions",label:"Ledger",icon:"bi-receipt"},{path:"/admin/reports",label:"Reports",icon:"bi-bar-chart-line"},{path:"/admin/advertisement",label:"Advertisement",icon:"bi-megaphone"}];function vo(){let e=v.get();return e&&e.is_admin?go:bo}function fo({path:e,label:t,icon:a}){return{tag:"a",props:{class:`hnav__item${D.get()===e?" hnav__item--active":""}`,href:`#${e}`,title:t,"aria-label":t,onclick:r=>{r.preventDefault(),h(e)}},children:[{tag:"i",props:{class:`bi ${a} hnav__icon`},children:[]},{tag:"span",props:{class:"hnav__label"},children:[t]}]}}function ho(){return{tag:"div",props:{class:"hnav__separator"},children:[]}}function yo(){return{tag:"nav",props:{class:"hnav__list",id:"hnav-list"},children:vo().map(e=>e.separator?ho():fo(e))}}function ts(){let e=document.getElementById("hnav-list"),t=document.getElementById("hnav-scroll-left"),a=document.getElementById("hnav-scroll-right");if(!e||!t||!a)return;let s=e.scrollWidth-e.clientWidth;t.disabled=e.scrollLeft<=1,a.disabled=e.scrollLeft>=s-1,t.classList.toggle("is-disabled",t.disabled),a.classList.toggle("is-disabled",a.disabled)}typeof document<"u"&&(document.addEventListener("scroll",e=>{e.target&&e.target.id==="hnav-list"&&ts()},!0),window.addEventListener("resize",()=>setTimeout(ts,50)),document.addEventListener("hnav:rendered",()=>setTimeout(ts,0)));function Wr(){return{tag:"div",props:{class:"hnav",id:"horizontal-nav"},children:[yo()]}}function Vr(){let e=()=>!!v.get()?.is_admin,t=()=>D.get().startsWith("/admin"),a=()=>I.get();return{tag:"div",props:{class:()=>`app-shell ${a()?"app-shell--authed":"app-shell--public"} ${e()||t()?"app-shell--admin":""}`},children:[se(()=>I.get(),()=>Sr(),()=>null),se(()=>I.get(),()=>kr(),()=>null),se(()=>I.get(),()=>Tr(),()=>null),se(()=>I.get(),()=>Ar(),()=>null),{tag:"div",props:{class:"main-wrapper"},children:[Ir(),se(()=>I.get()&&!e(),()=>Wr(),()=>null),{tag:"main",props:{class:"app-main"},children:[wo()]},Or()]},Jr()]}}function wo(){let t=D.get().split("?")[0]||"/",a=St.find(r=>r.path===t),s=v.get();return s&&s.is_admin&&!t.startsWith("/admin")?(h("/admin"),as()):a?a.requireAuth&&!I.get()?(h("/login"),as()):a.requireAdmin&&(!v.get()||!v.get().is_admin)?So():!a.requireAuth&&I.get()&&["/login","/register","/forgot-password","/reset-password"].includes(t)?(h("/"),as()):_o(a):$o()}function _o(e){return{tag:"div",props:{class:"view-placeholder","data-view":e.path},children:[{tag:"p",props:{class:"muted"},children:["Loading "+e.path+"\u2026"]}]}}function $o(){return{tag:"div",props:{class:"view-404"},children:[{tag:"h1",props:{},children:["404"]},{tag:"p",props:{},children:["Page not found."]},{tag:"button",props:{class:"btn-primary",onclick:()=>h("/")},children:["Go home"]}]}}function So(){return{tag:"div",props:{class:"view-403"},children:[{tag:"h1",props:{},children:["403"]},{tag:"p",props:{},children:["Admin access required."]},{tag:"button",props:{class:"btn-primary",onclick:()=>h("/")},children:["Go home"]}]}}function as(){return{tag:"div",props:{class:"view-loading"},children:[{tag:"div",props:{class:"spinner"},children:[]}]}}K();w();Wt();Fa();Ha();Ua();Ja();Yt();rt();Gt();ua();Zt();ot();Ta();La();ea();sa();ra();ia();la();T();w();var f={jobs:[],categories:[],loading:!1,search:"",categoryId:"",minBudget:"",maxBudget:"",sort:"latest",page:1,perPage:12,total:0,lastPage:1,requestSerial:0};function Gr(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--jobs-available",e.innerHTML=`
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
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs\u2026" value="${te(f.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${zr()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="\u09F30" value="${te(f.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${te(f.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${f.sort==="latest"?"selected":""}>Newest first</option>
                            <option value="budget_low" ${f.sort==="budget_low"?"selected":""}>Lowest budget</option>
                            <option value="budget_high" ${f.sort==="budget_high"?"selected":""}>Highest budget</option>
                            <option value="closing" ${f.sort==="closing"?"selected":""}>Closing soon</option>
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
        `,f.categories.length===0)try{let t=await c.categories();f.categories=Array.isArray(t.data)?t.data:[];let a=document.getElementById("jobs-category");a&&(a.innerHTML=zr())}catch{}document.getElementById("jobs-apply")?.addEventListener("click",()=>{ko(),f.page=1,At()}),document.getElementById("jobs-reset")?.addEventListener("click",()=>{f.search="",f.categoryId="",f.minBudget="",f.maxBudget="",f.sort="latest",f.page=1,xo(),At()}),document.getElementById("jobs-search")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("jobs-apply")?.click()}),await At()}}}function zr(){return'<option value="">All categories</option>'+f.categories.map(e=>`<option value="${te(e.id)}" ${String(e.id)===String(f.categoryId)?"selected":""}>${te(e.name)}</option>`).join("")}function ko(){f.search=document.getElementById("jobs-search")?.value.trim()||"",f.categoryId=document.getElementById("jobs-category")?.value||"",f.minBudget=document.getElementById("jobs-min-budget")?.value.trim()||"",f.maxBudget=document.getElementById("jobs-max-budget")?.value.trim()||"",f.sort=document.getElementById("jobs-sort")?.value||"latest"}function xo(){let e={"jobs-search":f.search,"jobs-category":f.categoryId,"jobs-min-budget":f.minBudget,"jobs-max-budget":f.maxBudget,"jobs-sort":f.sort};Object.entries(e).forEach(([t,a])=>{let s=document.getElementById(t);s&&(s.value=a)})}async function At(){let e=document.getElementById("jobs-grid");if(!e)return;let t=++f.requestSerial;f.loading=!0,e.innerHTML='<div class="spinner"></div>';try{let a={page:f.page,per_page:f.perPage,sort:f.sort};f.search&&(a.search=f.search),f.categoryId&&(a.category_id=f.categoryId),f.minBudget!==""&&(a.min_budget=f.minBudget),f.maxBudget!==""&&(a.max_budget=f.maxBudget);let s=await c.jobs(a);if(t!==f.requestSerial)return;f.jobs=Array.isArray(s.data)?s.data:[],f.total=Number(s.meta?.total||0),f.lastPage=Math.max(1,Number(s.meta?.last_page||1)),To()}catch(a){if(t!==f.requestSerial)return;e.innerHTML=`<p class="muted">Failed to load jobs: ${te(a.message||"unknown error")}</p>`,Xr(),Yr()}finally{t===f.requestSerial&&(f.loading=!1)}}function To(){let e=document.getElementById("jobs-grid");if(e){if(Xr(),Yr(),f.jobs.length===0){e.innerHTML='<p class="muted">No jobs match your filters. Try clearing them.</p>';return}e.innerHTML=f.jobs.map(t=>`
        <a class="job-card" href="#/jobs/${encodeURIComponent(t.id)}" data-id="${te(t.id)}">
            <div class="job-card__head">
                ${t.category&&t.category.icon_class?`<i class="bi ${Ao(t.category.icon_class)} job-card__cat-icon"></i>`:""}
                <span class="job-card__cat">${te(t.category?.name||"")}</span>
                ${t.is_featured?'<span class="job-card__badge">Featured</span>':""}
            </div>
            <h3 class="job-card__title">${te(t.title)}</h3>
            ${t.subtitle?`<p class="job-card__subtitle muted">${te(t.subtitle)}</p>`:""}
            <p class="job-card__desc">${te(Co(t.description,140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">\u09F3${Number.parseFloat(t.cost_per_worker||t.budget||0).toFixed(2)} / worker</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(t.remaining_workers??t.worker_count??1)} available</span>
            </div>
        </a>
    `).join(""),e.querySelectorAll("a.job-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),h(`/jobs/${t.getAttribute("data-id")}`)})})}}function Xr(){let e=document.getElementById("jobs-results-meta");if(!e)return;if(f.total===0){e.textContent="No open jobs found";return}let t=(f.page-1)*f.perPage+1,a=Math.min(f.page*f.perPage,f.total);e.textContent=`Showing ${t}-${a} of ${f.total} open jobs`}function Yr(){let e=document.getElementById("jobs-pagination");if(e){if(f.lastPage<=1){e.innerHTML="";return}e.innerHTML=`
        <button class="btn btn--secondary btn--sm" data-jobs-page="${f.page-1}" ${f.page<=1?"disabled":""}>\u2190 Previous</button>
        <span class="jobs-pagination__status">Page ${f.page} of ${f.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${f.page+1}" ${f.page>=f.lastPage?"disabled":""}>Next \u2192</button>
    `,e.querySelectorAll("[data-jobs-page]").forEach(t=>{t.addEventListener("click",()=>{let a=Number(t.getAttribute("data-jobs-page"));a<1||a>f.lastPage||a===f.page||(f.page=a,At())})})}}function Ao(e){return/^bi-[a-z0-9-]+$/.test(String(e||""))?e:"bi-briefcase"}function Co(e,t){let a=(e||"").toString();return a.length>t?a.slice(0,t-1)+"\u2026":a}function te(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}T();w();var ss={bids:[],loading:!1};function Kr(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-bids",e.innerHTML=`
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;try{let t=await c.workerBids();ss.bids=t.data||[],Lo()}catch(t){document.getElementById("bids-list").innerHTML=`<p class="muted">Failed to load: ${Zr(t.message||"unknown")}</p>`}}}}function Lo(){let e=document.getElementById("bids-list");if(e){if(ss.bids.length===0){e.innerHTML=`<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;return}e.innerHTML=ss.bids.map(t=>`
        <a class="bid-row-card" href="#/jobs/${t.job_id}" data-id="${t.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${Zr(t.job?.title||"Job")}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> \u09F3${parseFloat(t.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${t.delivery_days} day${t.delivery_days===1?"":"s"}</span>
                    <span class="muted">${Eo(t.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${t.status}">${t.status.toUpperCase()}</span>
        </a>
    `).join(""),e.querySelectorAll("a.bid-row-card").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),h(`/jobs/${t.getAttribute("data-id")}`)})})}}function Eo(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Zr(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}T();w();var Ne={jobs:[],submissions:[],loading:!1};function rs(){return async()=>{let e=document.querySelector("[data-view]");if(e){e.innerHTML="",e.className="view view--worker-active",e.innerHTML=`
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted active-jobs__intro"><strong>AVAILABLE TO APPLY</strong> Open job details to place your bid. Assigned workers can submit work from the job details page.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;try{let[t,a]=await Promise.all([c.workerActiveJobs(),c.workerSubmissions()]);Ne.jobs=t.data||[],Ne.submissions=a.data||[],Po()}catch(t){document.getElementById("active-jobs-list").innerHTML=`<p class="muted">Failed to load: ${Me(t.message||"unknown")}</p>`}}}}function Po(){let e=document.getElementById("active-jobs-list");if(e){if(Ne.jobs.length===0){e.innerHTML='<p class="muted">No activated or assigned jobs are available right now. New jobs appear here after admin activation.</p>';return}e.innerHTML=Ne.jobs.map(t=>{let a=t.assignment_id?Ne.submissions.find(n=>Number(n.assignment_id)===Number(t.assignment_id)):Ne.submissions.find(n=>n.job_id===t.id),s=t.worker_state==="available"?"available":t.assignment_status||t.status,r=String(t.description||"").trim(),i=Number(t.remaining_workers??t.remaining_tasks_count??0);return`
            <div class="active-job-card" data-id="${t.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3 data-i18n-ignore>${Me(t.title)}</h3>
                       ${t.subtitle?`<div class="muted" data-i18n-ignore>${Me(t.subtitle)}</div>`:""}
                        ${r?`<p class="muted" data-i18n-ignore>${Me(r.slice(0,180))}${r.length>180?"\u2026":""}</p>`:""}
                        <div class="muted">Pay: \u09F3${parseFloat(t.cost_per_worker||t.budget||0).toFixed(2)} \xB7 Available slots: ${i} \xB7 Deadline: ${Me(t.deadline_at||"None")}</div>
                    </div>
                    <span class="badge badge--status badge--${s}">${s.toUpperCase()}</span>
                </div>
                <div class="active-job-card__actions">
                    <a class="btn btn--primary btn--details" href="#/jobs/${encodeURIComponent(t.id)}">View job details</a>
                </div>
                ${a?qo(a):""}
                ${!a&&t.assignment_id?`<div class="active-job-card__actions"><button type="button" class="btn btn--ghost btn--sm" data-cancel-assignment="${t.assignment_id}">Request cancellation</button><small class="muted">Available before submitting work.</small></div>`:""}
            </div>
        `}).join(""),jo()}}function qo(e){return`
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${No(e.created_at)}
            <div class="muted" data-i18n-ignore>${Me((e.description||"").slice(0,200))}${(e.description||"").length>200?"\u2026":""}</div>
            ${e.status==="pending_review"?'<p class="muted">\u23F3 Awaiting poster review.</p>':""}
            ${e.status==="revision"?'<p class="muted">\u{1F504} Poster requested changes. Open job details to resubmit your work.</p>':""}
            ${e.status==="approved"?'<p class="muted">\u2705 Approved! Payment has been released.</p>':""}
        </div>
    `}function jo(){document.querySelectorAll("[data-cancel-assignment]").forEach(e=>{e.addEventListener("click",async()=>{let t=prompt("Why do you need to cancel this assignment?");if(!(!t||!t.trim())){e.disabled=!0;try{await c.workerCancelAssignment(e.dataset.cancelAssignment,{reason:t.trim()}),l("Assignment cancelled and returned for reassignment.","success"),rs()()}catch(a){l(a.message||"Could not cancel assignment.","error"),e.disabled=!1}}})})}function No(e){if(!e)return"";try{return new Date(e.replace(" ","T")+"Z").toLocaleString()}catch{return e}}function Me(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}T();w();var B={activeTab:"categories",categories:[],subcategories:[],loading:!1};function Qr(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-categories";let t=v.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Categories & Subcategories</h1>
            <p class="muted">Manage main categories, subcategories, and minimum cost limits.</p>
            
            <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button class="btn ${B.activeTab==="categories"?"btn--primary":"btn--ghost"}" id="tab-cats-btn">Main Categories</button>
                <button class="btn ${B.activeTab==="subcategories"?"btn--primary":"btn--ghost"}" id="tab-subcats-btn">Subcategories</button>
            </div>

            <div id="tab-content">
                <div class="card" id="cat-list"><div class="spinner"></div></div>
            </div>
        `,e.querySelector("#tab-cats-btn").addEventListener("click",()=>{B.activeTab="categories",is(e)}),e.querySelector("#tab-subcats-btn").addEventListener("click",()=>{B.activeTab="subcategories",is(e)}),await me(e)}}async function me(e){try{let[t,a]=await Promise.all([c.adminCategories(),c.adminSubcategories()]);B.categories=t.data||[],B.subcategories=a.data||[],is(e)}catch(t){l(t.message||"Failed to load category data.","error")}}function is(e){let t=e.querySelector("#tab-cats-btn"),a=e.querySelector("#tab-subcats-btn"),s=e.querySelector("#tab-content");s&&(B.activeTab==="categories"?(t&&(t.className="btn btn--primary"),a&&(a.className="btn btn--ghost"),Mo(s,e)):(t&&(t.className="btn btn--ghost"),a&&(a.className="btn btn--primary"),Ro(s,e)))}function Mo(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Main Categories List</h3>
            ${B.categories.length===0?'<p class="muted">No categories yet.</p>':`
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
                            ${B.categories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${ue(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;" class="muted">/${ue(s.slug)}</td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${ue(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${ue(s.updated_at||"-")}</td>
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
    `,e.querySelectorAll(".edit-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=B.categories.find(d=>String(d.id)===String(r));if(!i)return;let n=prompt(`Update Min Cost (\u09F3) for Main Category "${i.name}":`,String(i.min_cost||1));if(n===null)return;let o=parseFloat(n);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await c.adminUpdateCategory(r,{min_cost:o}),l(`Min cost updated for ${i.name}.`,"success"),await me(t)}catch(d){l(d.message,"error")}})}),e.querySelectorAll(".toggle-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=B.categories.find(n=>String(n.id)===String(r));if(i)try{await c.adminUpdateCategory(r,{is_active:!i.is_active}),l("Category updated.","success"),await me(t)}catch(n){l(n.message,"error")}})}),e.querySelectorAll(".del-cat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id");if(confirm("Delete category?"))try{let i=await c.adminDeleteCategory(r);l(i.message||"Deleted.","success"),await me(t)}catch(i){l(i.message,"error")}})});let a=e.querySelector("#add-cat-form");a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i={name:String(r.get("name")||"").trim(),slug:String(r.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(r.get("min_cost")||"1.00"),display_order:parseInt(r.get("display_order")||"0",10),description:String(r.get("description")||"").trim()||null,is_active:r.get("is_active")==="on"};try{await c.adminCreateCategory(i),l("Main Category created.","success"),await me(t)}catch(n){l(n.message,"error")}})}function Ro(e,t){e.innerHTML=`
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Subcategories List</h3>
            ${B.subcategories.length===0?'<p class="muted">No subcategories yet.</p>':`
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
                            ${B.subcategories.map(s=>`
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${ue(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;"><span class="badge" style="background:#e0e7ff; color:#3730a3;">${ue(s.category_name||"-")}</span></td>
                                    <td style="padding:0.75rem 0.5rem;">\u09F3${Number(s.min_cost||1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active?"badge--success":"badge--warning"}">
                                            ${s.is_active?"Active":"Inactive"}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${ue(s.created_at||"-")}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${ue(s.updated_at||"-")}</td>
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
                        ${B.categories.map(s=>`
                            <option value="${s.id}">${ue(s.name)}</option>
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
    `,e.querySelectorAll(".edit-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=B.subcategories.find(d=>String(d.id)===String(r));if(!i)return;let n=prompt(`Update Min Cost (\u09F3) for Subcategory "${i.name}":`,String(i.min_cost||1));if(n===null)return;let o=parseFloat(n);if(isNaN(o)||o<0){l("Please enter a valid positive cost amount.","error");return}try{await c.adminUpdateSubcategory(r,{min_cost:o}),l(`Min cost updated for ${i.name}.`,"success"),await me(t)}catch(d){l(d.message,"error")}})}),e.querySelectorAll(".toggle-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id"),i=B.subcategories.find(n=>String(n.id)===String(r));if(i)try{await c.adminUpdateSubcategory(r,{is_active:!i.is_active}),l("Subcategory updated.","success"),await me(t)}catch(n){l(n.message,"error")}})}),e.querySelectorAll(".del-subcat-btn").forEach(s=>{s.addEventListener("click",async()=>{let r=s.getAttribute("data-id");if(confirm("Delete subcategory?"))try{let i=await c.adminDeleteSubcategory(r);l(i.message||"Deleted.","success"),await me(t)}catch(i){l(i.message,"error")}})});let a=e.querySelector("#add-subcat-form");a.addEventListener("submit",async s=>{s.preventDefault();let r=new FormData(a),i={category_id:parseInt(r.get("category_id")||"0",10),name:String(r.get("name")||"").trim(),slug:String(r.get("slug")||"").trim().toLowerCase(),min_cost:parseFloat(r.get("min_cost")||"1.00"),display_order:parseInt(r.get("display_order")||"0",10),is_active:r.get("is_active")==="on"};try{await c.adminCreateSubcategory(i),l("Subcategory created.","success"),await me(t)}catch(n){l(n.message,"error")}})}function ue(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}T();w();var be={grouped:{},social:{},noticesData:{interval:4,notices:[]},loading:!1},Do={advertisement_system_enabled:"Advertisement System",video_ads_enabled:"Video Ads",watch_earn_enabled:"User Watch & Earn",reward_system_enabled:"Reward System",ad_network_enabled:"External Ad Network",website_ads_enabled:"Website Ads",app_ads_enabled:"Android App Ads",ad_frequency_seconds:"Ad Frequency (seconds)",fraud_min_description_chars:"Fraud: Minimum Description Characters",fraud_daily_submission_velocity_limit:"Fraud: Daily Submission Limit",fraud_shared_identity_worker_threshold:"Fraud: Shared Identity Threshold",fraud_review_threshold:"Fraud: Review Score Threshold",fraud_ban_requires_confirmation:"Fraud: Require Explicit Ban Confirmation",registration_otp_enabled:"Registration OTP Verification"};function ei(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;e.innerHTML="",e.className="view view--admin-settings";let t=v.get();if(!t||!t.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `,await ti()}}async function ti(){let e=document.getElementById("settings-container");if(e){e.innerHTML='<div class="spinner"></div>';try{let[t,a,s]=await Promise.all([c.adminSettings(),c.socialLinks(),c.notices()]);be.grouped=t.data||{},be.social=a||{},be.noticesData=s||{interval:4,notices:[]},Fo()}catch(t){e.innerHTML=`<p class="muted">Failed to load: ${W(t.message||"unknown")}</p>`}}}function Fo(){let e=document.getElementById("settings-container");if(!e)return;let a=Object.keys(be.grouped).map(n=>`
        <div class="card settings-group">
            <h3 class="card__title">${W(n.charAt(0).toUpperCase()+n.slice(1))}</h3>
            <div class="settings-group__rows">
                ${be.grouped[n].map(o=>Bo(n,o)).join("")}
            </div>
        </div>
    `).join(""),s=be.noticesData,r=[];Array.isArray(s.notices)&&s.notices.length&&(r=s.notices.map(n=>typeof n=="string"?n.startsWith("/")||n.startsWith("http")?{image:n,text:""}:{image:"",text:n}:{image:n.image||"",text:n.text||""})),r.length||(r=[{image:"",text:""}]),a+=`
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
                        ${r.map((n,o)=>ai(o+1,n)).join("")}
                    </div>
                    <div style="margin-top: 12px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Banner Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;let i=be.social;a+=`
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${W(i.facebook||"")}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${W(i.instagram||"")}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${W(i.whatsapp||"")}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${W(i.telegram||"")}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `,e.innerHTML=a,document.getElementById("settings-save-btn").addEventListener("click",Ho),document.getElementById("add-notice-btn").addEventListener("click",Io),ns()}function ai(e,t={image:"",text:""}){let a=typeof t=="string"?t.startsWith("/")||t.startsWith("http")?t:"":t?.image||"",s=typeof t=="string"?!t.startsWith("/")&&!t.startsWith("http")?t:"":t?.text||"",r="";return a?r=`<div class="banner-preview"><img src="${W(a)}" alt="Banner preview"></div>`:s?r=`<div class="banner-preview banner-preview--text"><strong>Text Notice:</strong> <span>${W(s)}</span></div>`:r='<div class="banner-preview banner-preview--empty"><i class="bi bi-image muted"></i> No image uploaded</div>',`
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
                    <input type="hidden" class="notice-msg-image" value="${W(a)}">
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
    `}function Io(){let e=document.getElementById("notice-messages-container");if(!e)return;let t=e.querySelectorAll(".banner-message-row").length+1,a=document.createElement("div");a.innerHTML=ai(t,{image:""});let s=a.firstElementChild;e.appendChild(s),ns()}function ns(){let e=document.getElementById("notice-messages-container");if(!e)return;e.querySelectorAll(".banner-message-row").forEach((a,s)=>{let r=a.querySelector(".banner-message-num");r&&(r.textContent=`Banner ${s+1}`);let i=a.querySelector(".banner-file-input"),n=a.querySelector(".notice-msg-image"),o=a.querySelector(".banner-preview"),d=a.querySelector(".banner-upload-status"),p=a.querySelector(".banner-upload-btn");i&&!i.dataset.wired&&(i.dataset.wired="true",i.addEventListener("change",async b=>{let y=b.target.files[0];if(y){d&&(d.textContent="Uploading\u2026");try{let g=new FormData;g.append("image",y);let k=await c.adminUploadBannerImage(g);k&&k.url&&(n.value=k.url,o.className="banner-preview",o.innerHTML=`<img src="${W(k.url)}" alt="Banner preview">`,d&&(d.textContent="Uploaded!"))}catch(g){d&&(d.textContent=g.message||"Upload failed."),l(g.message||"Failed to upload image.","error")}}}));let u=a.querySelector(".remove-notice-btn");u&&(u.onclick=()=>{a.remove(),ns()})})}function Bo(e,t){let a=`set-${t.key.replace(/[^a-z0-9]/gi,"_")}`,s=Do[t.key]||t.key,r;switch(t.value_type){case"boolean":r=`<label class="settings-row__check"><input type="checkbox" id="${a}" ${t.value?"checked":""}></label>`;break;case"integer":case"percent":r=`<input type="number" step="1" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"decimal":r=`<input type="number" step="0.0001" id="${a}" value="${t.value}" class="settings-row__input">`;break;case"json":r=`<textarea id="${a}" rows="3" class="settings-row__input">${W(JSON.stringify(t.value,null,2)||"")}</textarea>`;break;default:r=`<input type="text" id="${a}" value="${W(String(t.value))}" class="settings-row__input">`}return`
        <div class="settings-row">
            <label for="${a}" class="settings-row__label">
                <strong>${W(s)}</strong>
                <span class="muted">${W(t.description||"")}</span>
            </label>
            <div class="settings-row__control">${r}</div>
        </div>
    `}async function Ho(){let e={};for(let n of Object.keys(be.grouped))for(let o of be.grouped[n]){let d=`set-${o.key.replace(/[^a-z0-9]/gi,"_")}`,p=document.getElementById(d);if(!p)continue;let u;o.value_type==="boolean"?u=p.checked:o.value_type==="integer"||o.value_type==="percent"?u=parseInt(p.value,10):o.value_type==="decimal"?u=parseFloat(p.value):o.value_type==="json"?u=p.value?JSON.parse(p.value):null:u=p.value,e[o.key]=u}let t={facebook:document.getElementById("social-facebook")?.value||"",instagram:document.getElementById("social-instagram")?.value||"",whatsapp:document.getElementById("social-whatsapp")?.value||"",telegram:document.getElementById("social-telegram")?.value||""},s=Array.from(document.querySelectorAll(".banner-message-row")).map(n=>({image:n.querySelector(".notice-msg-image")?.value.trim()||""})).filter(n=>n.image!==""),r={interval:document.getElementById("notice-interval")?.value||4,direction:document.getElementById("notice-direction")?.value||"right_to_left",notices:s},i=document.getElementById("settings-save-btn");i.disabled=!0,i.textContent="Saving\u2026";try{await Promise.all([c.adminUpdateSettings(e),c.adminUpdateSocialLinks(t),c.adminUpdateNotices(r)]),l("Settings, notices, and social links saved successfully.","success"),await ti()}catch(n){l(n.message||"Failed to save.","error")}finally{i.disabled=!1,i.textContent="Save All Changes"}}function W(e){return e==null?"":String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Ve();T();w();function si(){return async()=>{let e=document.querySelector("[data-view]");if(!e)return;if(e.className="view view--admin-job-post",!v.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p></div>';return}let t=new URLSearchParams(window.location.hash.split("?")[1]||""),a=Number(t.get("edit")||0);e.innerHTML='<div class="card"><p class="muted">Loading job form\u2026</p></div>';try{let s=await c.categories(),r=a?(await c.adminJobDetail(a)).data:null;Uo(e,s.data||[],r?.job||null,a)}catch(s){e.innerHTML=`<div class="card"><p class="muted">Could not load job form: ${H(s.message||"unknown error")}</p></div>`}}}function Uo(e,t,a,s){let r=[];Array.isArray(a?.proof_requirements)&&a.proof_requirements.length>0?r=a.proof_requirements.map(x=>({title:typeof x=="object"?x.title||"":typeof x=="string"?x:"",type:(typeof x=="object"?x.type:x)==="screenshot"?"screenshot":"text"})):r=[{title:"Screenshot proof",type:"screenshot"}];let i=a?.category_id?Number(a.category_id):"",n=t.find(x=>Number(x.id)===i),o=n?.subcategories||[],d=a?.subcategory_id?Number(a.subcategory_id):"",p=a?.attachment_url||(a?.attachment_path?a.attachment_path.startsWith("http")?a.attachment_path:`/storage/${a.attachment_path}`:null),u=null,b=!1;e.innerHTML=`
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title">${s?"Edit Job":"Admin Job Post"}</h1><p class="muted">Create or maintain a job using the same worker assignment and payment workflow as customer posts.</p></div></div>
        <form class="card admin-job-form" id="admin-job-form">
            <div class="poster-form__grid">
                <label>Category
                    <select name="category_id" id="admin-category-select" required>
                        <option value="">Choose category\u2026</option>
                        ${t.map(x=>`<option value="${x.id}" ${Number(x.id)===i?"selected":""}>${H(x.name)}</option>`).join("")}
                    </select>
                </label>
                <label>Subcategory
                    <select name="subcategory_id" id="admin-subcategory-select" ${n?"":"disabled"}>
                        <option value="">${n&&o.length===0?"No subcategories available":"Choose subcategory (optional)\u2026"}</option>
                        ${o.map(x=>`<option value="${x.id}" ${Number(x.id)===d?"selected":""}>${H(x.name)}</option>`).join("")}
                    </select>
                </label>
            </div>
            <div class="poster-form__grid">
                <label>Job title <input name="title" maxlength="160" required value="${H(a?.title||"")}"></label>
                <label>Job subtitle (Optional) <input name="subtitle" maxlength="255" value="${H(a?.subtitle||"")}" placeholder="Short job-card summary"></label>
            </div>
            <label>Customer name <input name="customer_name" maxlength="160" value="${H(a?.customer_name||"")}"></label>
            <div class="poster-form__grid">
                <label>Customer phone <input name="customer_phone" maxlength="32" value="${H(a?.customer_phone||"")}"></label>
                <label>Customer email <input name="customer_email" type="email" maxlength="190" value="${H(a?.customer_email||"")}"></label>
            </div>
            <label>Job details / instructions <textarea name="description" rows="7" required>${H(a?.description||"")}</textarea></label>
            <label>Customer requirements <textarea name="requirements" rows="4">${H(a?.requirements||"")}</textarea></label>
            <div class="poster-form__grid">
                <label>Workers required <input name="worker_count" type="number" min="1" value="${Number(a?.worker_count||1)}" required></label>
                <label>Payment per worker <input name="cost_per_worker" type="number" min="0.01" step="0.0001" value="${Number(a?.cost_per_worker||0)}" required></label>
            </div>
            <label>Deadline <input name="deadline_at" type="datetime-local" value="${Jo(a?.deadline_at)}"></label>
            <label>Job Screenshot / Thumbnail (Optional)
                <input id="admin-thumbnail-input" type="file" accept="image/*">
                <div id="admin-thumbnail-preview" style="margin-top: 8px;">
                    ${p?`
                        <div id="admin-current-thumbnail-box" style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                            <img src="${H(p)}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="Current thumbnail">
                            <div style="flex:1;">
                                <div style="font-size:13px; font-weight:600;">Current Screenshot</div>
                                <span class="muted" style="font-size:12px;">Choose a new file to replace it, or remove it.</span>
                            </div>
                            <button type="button" class="btn btn--ghost btn--sm" id="admin-remove-thumbnail" style="color:#ef4444;"><i class="bi bi-trash"></i> Remove</button>
                        </div>
                    `:""}
                </div>
            </label>
            <div class="admin-job-proof-card" style="margin: 1rem 0; padding: 1.25rem; background: var(--bg-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem; flex-wrap:wrap; gap:8px;">
                    <div>
                        <div style="font-weight:600; font-size:14px;"><i class="bi bi-shield-check"></i> Work Proof Requirements</div>
                        <span class="muted" style="font-size:12px;">Choose whether proof will take images only, texts only, or both pairs of images and texts.</span>
                    </div>
                    <button type="button" class="btn btn--sm btn--ghost" id="admin-add-proof-btn"><i class="bi bi-plus-circle"></i> Add Requirement</button>
                </div>

                <div class="proof-mode-presets" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <button type="button" class="btn btn--sm" id="admin-mode-images"><i class="bi bi-image"></i> Images only</button>
                    <button type="button" class="btn btn--sm" id="admin-mode-texts"><i class="bi bi-file-text"></i> Texts only</button>
                    <button type="button" class="btn btn--sm" id="admin-mode-both"><i class="bi bi-collection"></i> Both (Images & Texts)</button>
                </div>

                <div id="admin-proof-pairs-container"></div>
            </div>
            <label>Admin notes <textarea name="admin_notes" rows="3">${H(a?.admin_notes||"")}</textarea></label>
            <label><input name="publish" type="checkbox" ${!a||a.status==="open"?"checked":""}> Publish / activate immediately</label>
            <div class="poster-form__actions"><button class="btn btn--ghost" type="button" id="admin-job-cancel">Cancel</button><button class="btn btn--primary" type="submit">${s?"Save changes":"Create job"}</button></div>
        </form>
    `;let y=e.querySelector("#admin-category-select"),g=e.querySelector("#admin-subcategory-select"),k=e.querySelector("#admin-thumbnail-input"),$=e.querySelector("#admin-thumbnail-preview");function P(){let x=e.querySelectorAll(".admin-proof-row");x.length&&(r=Array.from(x).map(C=>{let L=C.querySelector(".admin-proof-type-select")?.value||"screenshot";return{title:C.querySelector(".admin-proof-title-input")?.value.trim()||"",type:L}}))}function M(){let x=e.querySelector("#admin-proof-pairs-container");if(!x)return;let C=r.some(R=>R.type==="screenshot"),L=r.some(R=>R.type==="text"),z=e.querySelector("#admin-mode-images"),Se=e.querySelector("#admin-mode-texts"),Ke=e.querySelector("#admin-mode-both");z&&(z.className=`btn btn--sm ${C&&!L?"btn--primary":"btn--outline"}`),Se&&(Se.className=`btn btn--sm ${L&&!C?"btn--primary":"btn--outline"}`),Ke&&(Ke.className=`btn btn--sm ${C&&L?"btn--primary":"btn--outline"}`),x.innerHTML=r.map((R,ae)=>`
            <div class="admin-proof-row" style="display:flex; gap:8px; align-items:center; margin-bottom:8px;" data-index="${ae}">
                <select class="admin-proof-type-select" style="min-width: 170px;">
                    <option value="screenshot" ${R.type==="screenshot"?"selected":""}>\u{1F4F7} Image / Screenshot</option>
                    <option value="text" ${R.type==="text"?"selected":""}>\u{1F4DD} Written Text</option>
                </select>
                <input type="text" class="admin-proof-title-input" placeholder="${R.type==="screenshot"?"Requirement (e.g. Screenshot of completed task)":"Requirement (e.g. Account username / ID)"}" value="${H(R.title||"")}" style="flex:1;" required>
                ${r.length>1?`
                    <button type="button" class="btn btn--ghost btn--sm admin-remove-proof-btn" data-index="${ae}" style="color:#ef4444;" title="Remove requirement"><i class="bi bi-trash"></i></button>
                `:""}
            </div>
        `).join(""),x.querySelectorAll(".admin-proof-type-select").forEach(R=>{R.addEventListener("change",ae=>{let Y=ae.target.closest(".admin-proof-row"),vi=Number(Y.dataset.index);P(),r[vi].type=ae.target.value,M()})}),x.querySelectorAll(".admin-remove-proof-btn").forEach(R=>{R.addEventListener("click",ae=>{let Y=Number(ae.currentTarget.dataset.index);P(),r.splice(Y,1),r.length===0&&r.push({title:"Screenshot proof",type:"screenshot"}),M()})})}M(),e.querySelector("#admin-mode-images")?.addEventListener("click",()=>{r=[{title:"Screenshot proof",type:"screenshot"}],M()}),e.querySelector("#admin-mode-texts")?.addEventListener("click",()=>{r=[{title:"Written report",type:"text"}],M()}),e.querySelector("#admin-mode-both")?.addEventListener("click",()=>{r=[{title:"Written report / Task info",type:"text"},{title:"Screenshot proof",type:"screenshot"}],M()}),e.querySelector("#admin-add-proof-btn")?.addEventListener("click",()=>{P();let C=r[r.length-1]?.type==="screenshot"?"text":"screenshot";r.push({title:"",type:C}),M()});function $e(){e.querySelector("#admin-remove-thumbnail")?.addEventListener("click",()=>{b=!0,u=null,k&&(k.value=""),$&&($.innerHTML='<span class="muted" style="font-size:12px; font-style:italic;">Screenshot removed. Click "Save changes" to apply.</span>')})}$e(),k?.addEventListener("change",x=>{let C=x.target.files[0];if(!C)return;let L=new FileReader;L.onload=z=>{u=z.target.result,b=!1,$.innerHTML=`
                <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                    <img src="${u}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="New thumbnail preview">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:600; color:#10b981;"><i class="bi bi-check-circle"></i> New screenshot selected</div>
                        <span class="muted" style="font-size:12px;">${H(C.name)} (${(C.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" class="btn btn--ghost btn--sm" id="admin-clear-new-thumbnail" style="color:#ef4444;"><i class="bi bi-x-circle"></i> Clear</button>
                </div>
            `,e.querySelector("#admin-clear-new-thumbnail")?.addEventListener("click",()=>{u=null,k.value="",p&&!b?($.innerHTML=`
                        <div id="admin-current-thumbnail-box" style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                            <img src="${H(p)}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="Current thumbnail">
                            <div style="flex:1;">
                                <div style="font-size:13px; font-weight:600;">Current Screenshot</div>
                                <span class="muted" style="font-size:12px;">Choose a new file to replace it, or remove it.</span>
                            </div>
                            <button type="button" class="btn btn--ghost btn--sm" id="admin-remove-thumbnail" style="color:#ef4444;"><i class="bi bi-trash"></i> Remove</button>
                        </div>
                    `,$e()):$.innerHTML=""})},L.readAsDataURL(C)}),y.addEventListener("change",()=>{let x=Number(y.value),C=t.find(z=>Number(z.id)===x),L=C?.subcategories||[];C?L.length===0?(g.innerHTML='<option value="">No subcategories available</option>',g.disabled=!0):(g.innerHTML='<option value="">Choose subcategory (optional)\u2026</option>'+L.map(z=>`<option value="${z.id}">${H(z.name)}</option>`).join(""),g.disabled=!1):(g.innerHTML='<option value="">Choose subcategory (optional)\u2026</option>',g.disabled=!0)}),e.querySelector("#admin-job-cancel").addEventListener("click",()=>h("/admin/jobs")),e.querySelector("#admin-job-form").addEventListener("submit",async x=>{x.preventDefault(),P();let C=x.currentTarget,L=new FormData(C),z=r.map(Y=>({title:Y.title.trim()||(Y.type==="screenshot"?"Screenshot proof":"Written report"),type:Y.type})),Se=L.get("subcategory_id"),Ke=Se&&Number(Se)>0?Number(Se):null,R={category_id:Number(L.get("category_id")),subcategory_id:Ke,title:String(L.get("title")||"").trim(),subtitle:String(L.get("subtitle")||"").trim(),customer_name:String(L.get("customer_name")||"").trim(),customer_phone:String(L.get("customer_phone")||"").trim(),customer_email:String(L.get("customer_email")||"").trim(),description:String(L.get("description")||"").trim(),requirements:String(L.get("requirements")||"").trim(),worker_count:Number(L.get("worker_count")),cost_per_worker:Number(L.get("cost_per_worker")),deadline_at:Oo(String(L.get("deadline_at")||"")),proof_requirements:z,admin_notes:String(L.get("admin_notes")||"").trim(),publish:!!L.get("publish")};u?R.thumbnail=u:b?R.attachment_path=null:a?.attachment_path&&(R.attachment_path=a.attachment_path);let ae=C.querySelector('[type="submit"]');ae.disabled=!0;try{let Y=s?await c.adminUpdateJob(s,R):await c.adminCreateJob(R);l(Y.message||"Job saved.","success"),h(s?`/admin/jobs/${s}`:"/admin/jobs")}catch(Y){l(Y.message||"Could not save job.","error"),ae.disabled=!1}})}function Jo(e){if(!e)return"";let t=new Date(String(e).replace(" ","T")+"Z");if(Number.isNaN(t.getTime()))return"";let a=s=>String(s).padStart(2,"0");return`${t.getFullYear()}-${a(t.getMonth()+1)}-${a(t.getDate())}T${a(t.getHours())}:${a(t.getMinutes())}`}function Oo(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,19).replace("T"," ")}function H(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}T();w();function ri(e){return async()=>{let t=document.querySelector("[data-view]");if(t){if(t.className="view view--admin-job-detail",!v.get()?.is_admin){t.innerHTML='<div class="card"><h2>403</h2><p>Admin access required.</p></div>';return}t.innerHTML='<div class="card"><p class="muted">Loading job detail\u2026</p></div>',await Xe(t,e)}}}async function Xe(e,t){try{let a=await c.adminJobDetail(t);Wo(e,a.data||{},t)}catch(a){e.innerHTML=`<div class="card"><p class="muted">Could not load job: ${S(a.message||"unknown error")}</p></div>`}}function Wo(e,t,a){let s=t.job||{},r=t.progress||{},i=t.assignments||[],n=t.bids||[],o=t.submissions||[],d=s.currency||"BDT",p=Array.isArray(s.proof_requirements)?s.proof_requirements:[],u=s.attachment_url||(s.attachment_path?s.attachment_path.startsWith("http")?s.attachment_path:`/storage/${s.attachment_path}`:null),b=u?`
        <div class="job-screenshot-section" style="margin: 16px 0; padding: 14px; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <strong style="display:flex; align-items:center; gap:6px;"><i class="bi bi-image" style="color:var(--primary, #4f46e5); font-size:1.1rem;"></i> Job Screenshot / Thumbnail:</strong>
                <a href="${S(u)}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost btn--sm"><i class="bi bi-box-arrow-up-right"></i> Open full size</a>
            </div>
            <div style="text-align:center; background:#f8fafc; border-radius:6px; padding:10px; border:1px solid #edf2f7;">
                <a href="${S(u)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; max-width:100%;">
                    <img src="${S(u)}" alt="Job screenshot" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);" />
                </a>
            </div>
        </div>
    `:`
        <div class="job-screenshot-empty" style="margin: 16px 0; padding: 12px 16px; background: var(--bg-secondary, #f8fafc); border: 1px dashed var(--border-color, #cbd5e1); border-radius: 8px; display:flex; justify-content:space-between; align-items:center;">
            <span class="muted"><i class="bi bi-image"></i> No job screenshot attached.</span>
            <button type="button" class="btn btn--ghost btn--sm" id="btn-add-screenshot"><i class="bi bi-upload"></i> Upload / Edit screenshot</button>
        </div>
    `,y=p.length?`<div class="proof-requirements-list" style="margin-top:8px;">${p.map((g,k)=>{let $=g.image_url||g.fileBase64||null;return`
                <div style="margin-bottom:8px; padding:10px 12px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>#${k+1}. ${S(g.title||"Requirement")}</strong>
                        <span class="badge" style="font-size:11px;">${S(String(g.type||"text").toUpperCase())}</span>
                    </div>
                    ${$?`
                        <div style="margin-top:8px;">
                            <span class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Reference screenshot:</span>
                            <a href="${S($)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
                                <img src="${S($)}" alt="Proof sample" style="max-height:160px; max-width:100%; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
                            </a>
                        </div>
                    `:""}
                </div>
            `}).join("")}</div>`:'<p class="muted">No structured proof requirements configured.</p>';e.innerHTML=`
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title" data-i18n-ignore>${S(s.title)}</h1><p class="muted" data-i18n-ignore>${S(s.subtitle||"")}</p></div><div class="admin-row__actions"><button class="btn btn--ghost btn--sm" id="edit-job">Edit job</button>${Yo(s,i)?'<button class="btn btn--danger btn--sm" id="delete-job">Delete job</button>':""}</div></div>
        <div class="card"><div class="admin-job-row__meta"><span><strong>Customer:</strong> <span data-i18n-ignore>${S(s.customer_name||"\u2014")}</span></span><span><strong>Phone:</strong> <span data-i18n-ignore>${S(s.customer_phone||"\u2014")}</span></span><span><strong>Email:</strong> <span data-i18n-ignore>${S(s.customer_email||"\u2014")}</span></span><span><strong>Status:</strong> ${S(String(s.status||"").replace("_"," ").toUpperCase())}</span><span><strong>Start date:</strong> ${S(os(s.created_at))}</span><span><strong>Deadline:</strong> ${S(os(s.deadline_at))}</span></div>${b}<p data-i18n-ignore>${S(s.description||"").replace(/\n/g,"<br>")}</p>${s.requirements?`<p><strong>Requirements:</strong><br><span data-i18n-ignore>${S(s.requirements).replace(/\n/g,"<br>")}</span></p>`:""}<div><strong>Proof requirements:</strong>${y}</div></div>
        <div class="stat-grid"><div class="stat-tile"><span class="muted">Total workers</span><strong>${Number(r.total_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Assigned</span><strong>${Number(r.assigned_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Working</span><strong>${Number(r.in_progress_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Pending review</span><strong>${Number(r.pending_review_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Revision</span><strong>${Number(r.revision_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Completed</span><strong>${Number(r.completed_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Rejected</span><strong>${Number(r.rejected_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Cancelled/refunded</span><strong>${Number(r.cancelled_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Remaining</span><strong>${Number(r.remaining_workers||0)}</strong></div><div class="stat-tile"><span class="muted">Total job amount</span><strong>${Ge(r.total_amount,d)}</strong></div><div class="stat-tile"><span class="muted">Total payable</span><strong>${Ge(r.total_payable_amount,d)}</strong></div><div class="stat-tile"><span class="muted">Completed amount</span><strong>${Ge(r.completed_amount,d)}</strong></div><div class="stat-tile"><span class="muted">Pending amount</span><strong>${Ge(r.pending_amount,d)}</strong></div><div class="stat-tile"><span class="muted">Remaining amount</span><strong>${Ge(r.remaining_amount,d)}</strong></div></div>
        <div class="card"><h2 class="card__title">Worker assignments</h2><div class="admin-list">${i.length?i.map(g=>Vo(g,n)).join(""):'<p class="muted">No assignments yet.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Pending worker bids</h2><div class="admin-list">${n.filter(g=>g.status==="pending").length?n.filter(g=>g.status==="pending").map(zo).join(""):'<p class="muted">No pending bids.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Submissions</h2><div class="admin-list" id="admin-detail-submissions">${o.length?o.map(Go).join(""):'<p class="muted">No submissions yet.</p>'}</div></div>
   `,e.querySelector("#btn-add-screenshot")?.addEventListener("click",()=>h(`/admin/admin-job-post?edit=${a}`)),e.querySelector("#edit-job")?.addEventListener("click",()=>h(`/admin/admin-job-post?edit=${a}`)),e.querySelector("#delete-job")?.addEventListener("click",async()=>{if(confirm("Delete this job and its unassigned bids?"))try{await c.adminDeleteJob(a),l("Job deleted.","success"),h("/admin/jobs")}catch(g){l(g.message||"Could not delete job.","error")}}),e.querySelectorAll("[data-review-id]").forEach(g=>g.addEventListener("click",async()=>{let k=g.dataset.reviewDecision,$=k==="reject"?prompt("Rejection reason:"):prompt("Optional admin note:")||"";if(!($===null||k==="reject"&&!$.trim()))try{await c.adminReviewSubmission(g.dataset.reviewId,{decision:k,note:$}),l("Submission reviewed.","success"),await Xe(e,a)}catch(P){l(P.message||"Could not review submission.","error")}})),e.querySelectorAll("[data-proof-attachment]").forEach(g=>g.addEventListener("click",()=>Xo(g.dataset.proofAttachment))),e.querySelectorAll("[data-ban-worker]").forEach(g=>g.addEventListener("click",async()=>{let k=g.dataset.banWorker,$=g.dataset.banState==="1",P=prompt($?"Reason for unbanning this worker:":"Reason for banning this worker:",$?"Restored by administrator":"");if(!(P===null||!$&&!P.trim())){g.disabled=!0;try{$?await c.adminUnbanUser(k,{reason:P.trim()}):await c.adminBanUser(k,{reason:P.trim()}),l($?"Worker unbanned.":"Worker banned and active sessions revoked.","success"),await Xe(e,a)}catch(M){g.disabled=!1,l(M.message||"Could not update worker ban state.","error")}}})),e.querySelectorAll("[data-cancel-assignment]").forEach(g=>g.addEventListener("click",async()=>{let k=prompt("Reason for cancelling this assignment:");if(!(!k||!k.trim()))try{await c.adminCancelAssignment(g.dataset.cancelAssignment,{reason:k.trim()}),l("Assignment cancelled and refunded.","success"),await Xe(e,a)}catch($){l($.message||"Could not cancel assignment.","error")}})),e.querySelectorAll("[data-reassign-assignment]").forEach(g=>g.addEventListener("click",async()=>{let k=e.querySelector(`[data-reassign-select="${g.dataset.reassignAssignment}"]`),$=Number(k?.value||0);if(!$){l("Select a pending replacement bid first.","error");return}let P=prompt("Reason for reassignment:")||"Reassigned by administrator";try{await c.adminReassignAssignment(g.dataset.reassignAssignment,{bid_id:$,reason:P.trim()}),l("Worker reassigned.","success"),await Xe(e,a)}catch(M){l(M.message||"Could not reassign worker.","error")}}))}function Vo(e,t){let a=e.payment_status==="held"&&!["cancelled","completed"].includes(e.status),s=t.filter(i=>i.status==="pending"&&i.worker_id!==e.worker_id),r=a?`<div class="admin-row__actions"><button class="btn btn--danger btn--sm" data-cancel-assignment="${e.id}">Cancel/refund</button>${s.length?`<select data-reassign-select="${e.id}" aria-label="Replacement worker"><option value="">Replace with\u2026</option>${s.map(i=>`<option value="${i.id}">${S(i.worker?.name||`Worker #${i.worker_id}`)} \xB7 \u09F3${Number(i.amount||0).toFixed(2)}</option>`).join("")}</select><button class="btn btn--ghost btn--sm" data-reassign-assignment="${e.id}">Reassign</button>`:""}</div>`:"";return`<div class="admin-row"><div><strong>${S(e.worker?.name||"Unknown worker")}</strong><span class="muted">${S(e.worker?.email||"")} \xB7 ${S(e.worker?.phone||"")}</span></div><div><span class="badge">${S(String(e.status||"").toUpperCase())}</span><span class="muted"> ${S(String(e.payment_status||"").toUpperCase())} \xB7 ${Number(e.payment_amount||0).toFixed(2)}</span>${r}</div></div>`}function zo(e){return`<div class="admin-row"><div><strong>${S(e.worker?.name||`Worker #${e.worker_id}`)}</strong><span class="muted">${S(e.worker?.email||"")} \xB7 ${S(e.worker?.phone||"")}</span><p>${S(e.proposal||"")}</p></div><div><span class="badge">PENDING</span><span class="muted"> \u09F3${Number(e.amount||0).toFixed(2)}</span></div></div>`}function Go(e){let t=e.worker||{},a=e.status==="pending_review"?`<button class="btn btn--success btn--sm" data-review-id="${e.id}" data-review-decision="approve">Approve</button><button class="btn btn--danger btn--sm" data-review-id="${e.id}" data-review-decision="reject">Reject</button>`:"",s=t.id?`<button class="btn ${t.is_banned?"btn--success":"btn--danger"} btn--sm" data-ban-worker="${t.id}" data-ban-state="${t.is_banned?"1":"0"}">${t.is_banned?"Unban worker":"Ban worker"}</button>`:"",r=a||s?`<div class="admin-row__actions">${a}${s}</div>`:"",i=`User ID #${S(e.worker_id)} \xB7 ${S(t.phone||"Phone unavailable")} \xB7 ${S(t.email||"Email unavailable")}`,n=e.reviewer_note||e.rejection_reason,o=e.risk_status&&e.risk_status!=="clear"?` \xB7 Risk ${S(String(e.risk_status).replace("_"," "))} (${Number(e.risk_score||0).toFixed(0)})`:"",d=e.attachment_url||(e.attachment_path?e.attachment_path.startsWith("http")?e.attachment_path:`/storage/${e.attachment_path}`:null),p=String(e.attachment_path||""),u=!!(d&&(/\.(jpg|jpeg|png|gif|webp)$/i.test(d)||/\.(jpg|jpeg|png|gif|webp)$/i.test(p))),b=d?`${e.external_link?" \xB7 ":""}<button type="button" class="btn btn--ghost btn--sm" data-proof-attachment="${Number(e.id)}"><i class="bi ${u?"bi-image":"bi-file-earmark-text"}"></i> ${u?"View screenshot":"Open proof attachment"}</button>`:"",y=u?`
        <div style="margin-top:8px;">
            <a href="${S(d)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
                <img src="${S(d)}" alt="Submission proof screenshot" style="max-height:160px; max-width:100%; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
            </a>
        </div>
    `:"";return`<div class="admin-row"><div><strong>${S(t.name||"Unknown worker")}</strong><span class="muted">${i}</span><span class="muted">Submitted ${S(os(e.submitted_at||e.created_at))} \xB7 Attempt ${Number(e.attempt_number||1)} \xB7 ${S(String(e.status||"").replace("_"," "))}${o}</span><p>${S(e.description||"")}</p>${e.external_link?`<a href="${S(e.external_link)}" target="_blank" rel="noopener">Open delivery link</a>`:""}${b}${y}${n?`<p class="muted"><strong>Review note:</strong> ${S(n)}</p>`:""}</div>${r}</div>`}async function Xo(e){let t=window.open("about:blank","_blank","noopener,noreferrer");try{let a=await c.proofAttachment(e),s=URL.createObjectURL(a);t?t.location.href=s:window.location.href=s,setTimeout(()=>URL.revokeObjectURL(s),6e4)}catch(a){t&&t.close(),l(a.message||"Could not open the proof attachment.","error")}}function Yo(e,t){return!["completed","disputed"].includes(e.status)&&!t.some(a=>!["cancelled"].includes(a.status))}function os(e){if(!e)return"unknown";let t=new Date(String(e).replace(" ","T")+"Z");return Number.isNaN(t.getTime())?String(e):t.toLocaleString()}function Ge(e,t){return`${S(t||"BDT")} ${Number(e||0).toFixed(2)}`}function S(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}Na();Ra();w();function ii(){return async()=>{let e=document.querySelector("[data-view]");if(e){if(e.innerHTML="",e.className="view view--admin-advertisement",!v.get()?.is_admin){e.innerHTML='<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>';return}e.innerHTML=`
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Advertisement</h1>
                    <p class="muted">Manage rewarded video ads, provider rotation, and website/app monetization settings.</p>
                </div>
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title"><i class="bi bi-film"></i> Video Ads</h3>
                    <p class="muted">Upload promotional videos, set rewards and limits, and pause or activate campaigns.</p>
                    <a class="btn btn--primary btn--sm" href="#/admin?tab=video-ads">Manage Video Ads</a>
                </div>
                <div class="card">
                    <h3 class="card__title"><i class="bi bi-play-circle"></i> Ad Providers</h3>
                    <p class="muted">Configure legacy provider rotation, placement identifiers, rewards, and minimum watch time.</p>
                    <a class="btn btn--primary btn--sm" href="#/admin?tab=providers">Manage Providers</a>
                </div>
                <div class="card">
                    <h3 class="card__title"><i class="bi bi-sliders"></i> Monetization Settings</h3>
                    <p class="muted">Control the advertisement and watch-and-earn master switches plus website/app ad units.</p>
                    <a class="btn btn--primary btn--sm" href="#/admin/settings">Open Settings</a>
                </div>
            </div>
        `}}}ga();ha();wa();Sa();pa();var ui={"/":Ot,"/refer":Xt,"/webtask":Be,"/tasks":Be,"/earn":He,"/tg-tasks":bt,"/withdraw":it,"/profile":nt,"/wallet":nt,"/admin":ka,"/admin/payments":Ca,"/admin/categories":Qr,"/admin/settings":ei,"/admin/jobs":We,"/admin/pending-jobs":We,"/admin/active-jobs":We,"/admin/admin-job-post":si,"/admin/transactions":ja,"/admin/reports":Ma,"/admin/advertisement":ii,"/deposit":Qt,"/leaderboard":dt,"/achievements":lt,"/support":ct,"/settings":ut,"/jobs/available":Gr,"/worker/bids":Kr,"/worker/active-jobs":rs,"/poster":ba,"/poster/post-job":va,"/poster/jobs":ya,"/poster/wallet":$a,"/notifications":ca,"/login":Da,"/register":Ba,"/forgot-password":_t,"/reset-password":$t};function bi(){Ct(),setTimeout(Ct,50),window.addEventListener("hashchange",Ct),F(()=>{I.get(),setTimeout(Ct,0)})}async function Ct(){let t=(window.location.hash.replace(/^#/,"")||"/").split("?")[0]||"/";if(!ui[t]){let n=t.match(/^\/admin\/jobs\/(\d+)$/);if(n){if(!I.get()){h("/login");return}let p=v.get();if(!p||!p.is_admin){mi();return}await Lt(()=>ri(n[1]),t);return}let o=t.match(/^\/jobs\/(\d+)$/);if(o){if(!I.get()){h("/login");return}let p=await Promise.resolve().then(()=>(oi(),ni));await Lt(()=>p.JobDetailPage(o[1]),t);return}let d=t.match(/^\/poster\/jobs\/(\d+)$/);if(d){if(!I.get()){h("/login");return}let p=await Promise.resolve().then(()=>(pi(),ci));await Lt(()=>p.PosterJobDetailPage(d[1]),t);return}t="/"}let a=I.get(),s=v.get(),r=["/login","/register","/forgot-password","/reset-password"];if(r.includes(t)&&a){s&&s.is_admin?h("/admin"):h("/");return}if(!r.includes(t)&&!a){h("/login");return}if(t==="/"&&s&&s.is_admin){h("/admin");return}if(t.startsWith("/admin")&&(!s||!s.is_admin)){mi();return}let i=ui[t];await Lt(i,t)}async function Lt(e,t){let a=document.getElementById("app"),s=a.querySelector(".app-main");if(!s){s=document.createElement("div"),s.className="app-main";let r=a.querySelector(".bottomnav");r?a.insertBefore(s,r):a.appendChild(s)}s.innerHTML=`<div data-view="${t}" class="view-skeleton"><div class="spinner"></div></div>`;try{let r=typeof e=="function"?e():e;typeof r=="function"?await r():r&&typeof r.then=="function"&&await r}catch(r){console.error("View render threw synchronously for",t,r),s.innerHTML=`<div class="card"><h2>Error</h2><p>${r.message}</p></div>`}}function mi(){let e=document.getElementById("app"),t=e.querySelector(".app-main");t||(t=document.createElement("div"),t.className="app-main",e.appendChild(t)),t.innerHTML=`
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `}w();var gi=document.getElementById("app")||(()=>{let e=document.createElement("div");return e.id="app",document.body.appendChild(e),e})();gi.innerHTML="";ie(Vr(),gi);Fr();re.get()&&O();bi();
