const API_BASE='/api';

async function checkBackend(){
  try{
    const response=await fetch(`${API_BASE}/health`);
    const result=await response.json();
    console.log('Backend:',result);
  }catch(error){
    console.error('Backend connection failed:',error);
  }
}

async function loadCandidatesFromAPI(){
  try{
    const response=await fetch(`${API_BASE}/candidates`);
    if(!response.ok) throw new Error('Failed to load candidates');

    const candidates=await response.json();

    if(Array.isArray(candidates)){
      data.candidates=candidates;
      console.log('Candidates loaded from API:',candidates);
      renderAll();
    }
  }catch(error){
    console.error('Could not load candidates from API:',error);
  }
}

const STORAGE_KEY='talentflow_ai_data_v1';
const SESSION_KEY='talentflow_ai_session';

const demoData={
 candidates:[
  {id:1,name:'Aarav Mehta',email:'aarav@example.com',role:'Frontend Developer',experience:'3 years',score:94,stage:'Interview',applied:'2026-09-25',source:'LinkedIn'},
  {id:2,name:'Priya Shah',email:'priya@example.com',role:'Python Developer',experience:'2 years',score:91,stage:'Screening',applied:'2026-09-24',source:'Referral'},
  {id:3,name:'Rohan Patil',email:'rohan@example.com',role:'DevOps Engineer',experience:'4 years',score:88,stage:'Shortlisted',applied:'2026-09-23',source:'Indeed'},
  {id:4,name:'Sneha Kulkarni',email:'sneha@example.com',role:'Data Analyst',experience:'2 years',score:86,stage:'Applied',applied:'2026-09-22',source:'Website'},
  {id:5,name:'Vikram Joshi',email:'vikram@example.com',role:'Backend Developer',experience:'5 years',score:82,stage:'Offer',applied:'2026-09-20',source:'LinkedIn'}
 ],
 jobs:[
  {id:1,title:'Frontend Developer',department:'Engineering',location:'Mumbai / Hybrid',type:'Full-time',applicants:18},
  {id:2,title:'Python Developer',department:'Engineering',location:'Remote',type:'Full-time',applicants:12},
  {id:3,title:'Data Analyst',department:'Analytics',location:'Pune / Hybrid',type:'Full-time',applicants:9}
 ],
 interviews:[
  {id:1,candidate:'Aarav Mehta',role:'Frontend Developer',date:'2026-09-28',time:'10:30 AM',interviewer:'Neha Sharma',status:'Scheduled',link:'https://meet.google.com/'},
  {id:2,candidate:'Rohan Patil',role:'DevOps Engineer',date:'2026-09-29',time:'2:00 PM',interviewer:'Rahul Verma',status:'Pending',link:'https://meet.google.com/'},
  {id:3,candidate:'Priya Shah',role:'Python Developer',date:'2026-09-30',time:'11:00 AM',interviewer:'Anita Rao',status:'Scheduled',link:'https://meet.google.com/'}
 ],
 settings:{ai:true,notifications:true,compact:false}
};

let data=loadData();
let currentUser=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function loadData(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(demoData)}catch{return structuredClone(demoData)}}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function showToast(message){const el=document.createElement('div');el.className='toast';el.textContent=message;$('toastContainer').appendChild(el);setTimeout(()=>el.remove(),2800)}
function initials(name){return String(name||'Admin').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function fmtDate(v){if(!v)return '—';return new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function stageClass(stage){return stage.toLowerCase().replace(/\s/g,'-')}

function initAuth(){
 if(currentUser){$('authScreen').classList.add('hidden');$('app').classList.remove('hidden');updateUserUI();renderAll();}
 $('showRegister').onclick=()=>{$('loginPanel').classList.add('hidden');$('registerPanel').classList.remove('hidden')};
 $('showLogin').onclick=()=>{$('registerPanel').classList.add('hidden');$('loginPanel').classList.remove('hidden')};
 document.querySelectorAll('.password-toggle').forEach(btn=>btn.onclick=()=>{const input=$(btn.dataset.target);input.type=input.type==='password'?'text':'password';btn.textContent=input.type==='password'?'Show':'Hide'});
 $('loginForm').onsubmit=e=>{e.preventDefault();const email=$('loginEmail').value.trim(),pass=$('loginPassword').value;if(email==='admin@talentflowai.com'&&pass==='Admin@123'){currentUser={name:'Admin',email};localStorage.setItem(SESSION_KEY,JSON.stringify(currentUser));$('authScreen').classList.add('hidden');$('app').classList.remove('hidden');updateUserUI();renderAll();showToast('Welcome to TalentFlow AI')}else showToast('Create account')};
 $('registerForm').onsubmit=e=>{e.preventDefault();if($('registerPassword').value!==$('registerConfirmPassword').value)return showToast('Passwords do not match');currentUser={name:$('registerFirstName').value+' '+$('registerLastName').value,email:$('registerEmail').value};localStorage.setItem(SESSION_KEY,JSON.stringify(currentUser));$('authScreen').classList.add('hidden');$('app').classList.remove('hidden');updateUserUI();renderAll();showToast('Account created successfully')};
 $('forgotPassword').onclick=()=>showToast('Password reset instructions would be sent to your email.');
}
function updateUserUI(){const u=currentUser||{name:'Admin',email:'admin@talentflowai.com'};$('sidebarUserName').textContent=u.name;$('sidebarUserEmail').textContent=u.email;$('sidebarAvatar').textContent=initials(u.name);$('welcomeName').textContent=u.name.split(' ')[0]}

function initNavigation(){
 document.querySelectorAll('.nav-item[data-page]').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.page));
 document.querySelectorAll('[data-page-link]').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.pageLink));
 $('mobileMenu').onclick=()=>{$('sidebar').classList.toggle('open');$('sidebarOverlay').classList.toggle('open')};
 $('sidebarOverlay').onclick=()=>{$('sidebar').classList.remove('open');$('sidebarOverlay').classList.remove('open')};
 $('logoutButton').onclick=()=>{localStorage.removeItem(SESSION_KEY);location.reload()};
}
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const target=$('page-'+page);if(target)target.classList.add('active');document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const titles={dashboard:'Recruitment Dashboard',candidates:'Candidates',jobs:'Job Openings',interviews:'Scheduled Interviews',pipeline:'Candidate Pipeline',analytics:'Recruitment Analytics',settings:'Settings'};$('pageTitle').textContent=titles[page]||'TalentFlow AI';$('sidebar').classList.remove('open');$('sidebarOverlay').classList.remove('open');renderAll()}

function renderStats(){const c=data.candidates;$('totalCandidates').textContent=c.length;$('shortlistedCandidates').textContent=c.filter(x=>['Shortlisted','Interview','Offer'].includes(x.stage)).length;$('totalInterviews').textContent=data.interviews.length;$('totalHired').textContent=c.filter(x=>x.stage==='Hired').length;$('interviewNavCount').textContent=data.interviews.length}
function renderDashboard(){
 const list=data.interviews.slice(0,4);$('dashboardInterviews').innerHTML=list.length?list.map(i=>`<div class="interview-card"><div><h4>${esc(i.candidate)}</h4><p>${esc(i.role)}</p><p>${fmtDate(i.date)} · ${esc(i.time)} · ${esc(i.interviewer)}</p></div><span class="tag">${esc(i.status)}</span></div>`).join(''):'<p class="ai-main-text">No interviews scheduled.</p>';
 $('recentCandidateBody').innerHTML=data.candidates.slice(0,5).map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><small>${esc(c.email)}</small></td><td>${esc(c.role)}</td><td><strong>${c.score}%</strong></td><td><span class="tag">${esc(c.stage)}</span></td><td>${fmtDate(c.applied)}</td><td><button class="link-button" data-candidate="${c.id}">View</button></td></tr>`).join('');bindCandidateButtons();
}
function renderCandidates(){
 const q=($('candidateSearch').value||'').toLowerCase(),status=$('candidateStatusFilter').value,role=$('candidateRoleFilter').value,sort=$('candidateSort').value;
 let arr=data.candidates.filter(c=>(!q||`${c.name} ${c.email} ${c.role}`.toLowerCase().includes(q))&&(status==='all'||c.stage===status)&&(role==='all'||c.role===role));
 if(sort==='score')arr.sort((a,b)=>b.score-a.score);if(sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name));if(sort==='recent')arr.sort((a,b)=>b.applied.localeCompare(a.applied));
 $('candidateResultCount').textContent=`${arr.length} candidate${arr.length!==1?'s':''}`;$('candidateTableBody').innerHTML=arr.map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><small>${esc(c.email)}</small></td><td>${esc(c.role)}</td><td>${esc(c.experience)}</td><td><strong>${c.score}%</strong></td><td><span class="tag">${esc(c.stage)}</span></td><td>${fmtDate(c.applied)}</td><td><button class="link-button" data-candidate="${c.id}">View</button></td></tr>`).join('');bindCandidateButtons();
}
function renderJobs(){$('jobsGrid').innerHTML=data.jobs.map(j=>`<div class="job-card"><span class="section-kicker">${esc(j.department)}</span><h3>${esc(j.title)}</h3><p>${esc(j.location)} · ${esc(j.type)}</p><div class="job-meta"><span class="tag">${j.applicants} applicants</span><span class="tag">Open</span></div></div>`).join('')}
function renderInterviews(){const now=new Date();$('todayInterviews').textContent=data.interviews.filter(i=>i.date===now.toISOString().slice(0,10)).length;$('weekInterviews').textContent=data.interviews.length;$('pendingInterviews').textContent=data.interviews.filter(i=>i.status==='Pending').length;$('interviewList').innerHTML=data.interviews.map(i=>`<div class="interview-card"><div><h4>${esc(i.candidate)}</h4><p>${esc(i.role)} · ${esc(i.interviewer)}</p><p>${fmtDate(i.date)} · ${esc(i.time)}</p></div><div><span class="tag">${esc(i.status)}</span><br><button class="link-button" data-interview="${i.id}">Open</button></div></div>`).join('');document.querySelectorAll('[data-interview]').forEach(b=>b.onclick=()=>openInterview(+b.dataset.interview))}
function renderPipeline(){const stages=['Applied','Screening','Shortlisted','Interview','Offer','Hired'];$('pipelineBoard').innerHTML=stages.map(s=>`<div class="pipeline-column"><h4>${s} <span class="pipeline-count">(${data.candidates.filter(c=>c.stage===s).length})</span></h4>${data.candidates.filter(c=>c.stage===s).map(c=>`<div class="pipeline-card"><strong>${esc(c.name)}</strong><span>${esc(c.role)}</span><span>AI Match ${c.score}%</span></div>`).join('')||'<span class="pipeline-count">No candidates</span>'}</div>`).join('')}
function renderAnalytics(){const stages=['Applied','Screening','Shortlisted','Interview','Offer','Hired'];$('funnelChart').innerHTML=stages.map(s=>{const n=data.candidates.filter(c=>c.stage===s).length;const pct=data.candidates.length?Math.round(n/data.candidates.length*100):0;return `<div class="chart-row"><span class="chart-label">${s}</span><div class="chart-bar"><div class="chart-fill" style="width:${pct}%"></div></div><span class="chart-value">${n}</span></div>`}).join('');const sources={};data.candidates.forEach(c=>sources[c.source]=(sources[c.source]||0)+1);$('sourceChart').innerHTML=Object.entries(sources).map(([s,n])=>{const pct=Math.round(n/data.candidates.length*100);return `<div class="chart-row"><span class="chart-label">${esc(s)}</span><div class="chart-bar"><div class="chart-fill" style="width:${pct}%"></div></div><span class="chart-value">${n}</span></div>`}).join('')||'<p class="ai-main-text">No source data yet.</p>'}
function renderSettings(){$('settingAI').checked=data.settings.ai;$('settingNotifications').checked=data.settings.notifications;$('settingCompact').checked=data.settings.compact;document.body.classList.toggle('compact-tables',data.settings.compact)}
function renderAll(){renderStats();renderDashboard();populateRoleFilter();renderCandidates();renderJobs();renderInterviews();renderPipeline();renderAnalytics();renderSettings()}
function populateRoleFilter(){const select=$('candidateRoleFilter'),value=select.value,roles=[...new Set(data.candidates.map(c=>c.role))];select.innerHTML='<option value="all">All positions</option>'+roles.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');select.value=roles.includes(value)?value:'all'}
function bindCandidateButtons(){document.querySelectorAll('[data-candidate]').forEach(b=>b.onclick=()=>openCandidate(+b.dataset.candidate))}

function openCandidate(id){const c=data.candidates.find(x=>x.id===id);if(!c)return;openModal('CANDIDATE','Candidate Profile',`<div><h3>${esc(c.name)}</h3><p class="ai-main-text">${esc(c.email)} · ${esc(c.experience)}</p><div class="job-meta"><span class="tag">${esc(c.role)}</span><span class="tag">AI Match ${c.score}%</span><span class="tag">${esc(c.stage)}</span></div><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><label>Update stage</label><select id="candidateStageEdit" class="form-control">${['Applied','Screening','Shortlisted','Interview','Offer','Hired','Rejected'].map(s=>`<option ${s===c.stage?'selected':''}>${s}</option>`).join('')}</select><button class="primary-button" id="saveCandidateStage" style="margin-top:14px">Save Changes</button></div>`);$('saveCandidateStage').onclick=()=>{c.stage=$('candidateStageEdit').value;saveData();closeModal();renderAll();showToast('Candidate stage updated')}}
function openInterview(id){const i=data.interviews.find(x=>x.id===id);if(!i)return;openModal('INTERVIEW','Interview Details',`<h3>${esc(i.candidate)}</h3><p class="ai-main-text">${esc(i.role)}</p><p><strong>Date:</strong> ${fmtDate(i.date)}<br><strong>Time:</strong> ${esc(i.time)}<br><strong>Interviewer:</strong> ${esc(i.interviewer)}</p><a class="primary-button" style="display:inline-block;text-decoration:none" href="${esc(i.link)}" target="_blank">Open Meeting</a>`)}
function openModal(kicker,title,body){$('modalKicker').textContent=kicker;$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalOverlay').classList.add('active')}
function closeModal(){$('modalOverlay').classList.remove('active')}

async function addCandidate(){
  openModal(
    'TALENT POOL',
    'Add Candidate',
    `<form class="modal-form" id="candidateForm">
      <div>
        <label>Name</label>
        <input id="newName" required>
      </div>

      <div>
        <label>Email</label>
        <input type="email" id="newEmail" required>
      </div>

      <div>
        <label>Position</label>
        <input id="newRole" required>
      </div>

      <div>
        <label>Experience</label>
        <input id="newExperience" placeholder="e.g. 2 years" required>
      </div>

      <div>
        <label>AI Match</label>
        <input id="newScore" type="number" min="0" max="100" value="85" required>
      </div>

      <button class="primary-button">Add Candidate</button>
    </form>`
  );

  $('candidateForm').onsubmit = async e => {
    e.preventDefault();

    const candidate = {
      name: $('newName').value,
      email: $('newEmail').value,
      role: $('newRole').value,
      experience: $('newExperience').value,
      score: Number($('newScore').value)
    };

    try {
      const response = await fetch(`${API_BASE}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(candidate)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add candidate');
      }

      closeModal();

      await loadCandidatesFromAPI();

      showToast('Candidate added successfully');

      console.log('Candidate added:', result);

    } catch (error) {
      console.error('Add candidate failed:', error);
      showToast('Failed to add candidate');
    }
  };
}

function addJob(){openModal('RECRUITMENT','Create Job',`<form class="modal-form" id="jobForm"><div><label>Job Title</label><input id="jobTitle" required></div><div><label>Department</label><input id="jobDept" required></div><div><label>Location</label><input id="jobLocation" required></div><div><label>Type</label><select id="jobType"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div><button class="primary-button">Create Job</button></form>`);$('jobForm').onsubmit=e=>{e.preventDefault();data.jobs.unshift({id:Date.now(),title:$('jobTitle').value,department:$('jobDept').value,location:$('jobLocation').value,type:$('jobType').value,applicants:0});saveData();closeModal();renderAll();showToast('Job opening created')}}
function scheduleInterview(){openModal('INTERVIEW MANAGEMENT','Schedule Interview',`<form class="modal-form" id="interviewForm"><div><label>Candidate</label><select id="intCandidate">${data.candidates.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.role)}</option>`).join('')}</select></div><div><label>Date</label><input type="date" id="intDate" required></div><div><label>Time</label><input type="text" id="intTime" placeholder="10:30 AM" required></div><div><label>Interviewer</label><input id="intInterviewer" required></div><button class="primary-button">Schedule Interview</button></form>`);$('interviewForm').onsubmit=e=>{e.preventDefault();const c=data.candidates.find(x=>x.id===+$('intCandidate').value);data.interviews.push({id:Date.now(),candidate:c.name,role:c.role,date:$('intDate').value,time:$('intTime').value,interviewer:$('intInterviewer').value,status:'Scheduled',link:'https://meet.google.com/'});saveData();closeModal();renderAll();showToast('Interview scheduled')}}

function initActions(){document.querySelectorAll('[data-action="add-candidate"]').forEach(b=>b.onclick=addCandidate);document.querySelectorAll('[data-action="add-job"]').forEach(b=>b.onclick=addJob);document.querySelectorAll('[data-action="schedule-interview"]').forEach(b=>b.onclick=scheduleInterview);$('modalClose').onclick=closeModal;$('modalOverlay').onclick=e=>{if(e.target===$('modalOverlay'))closeModal();};$('themeToggle').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('talentflow_theme',document.body.classList.contains('dark')?'dark':'light')};if(localStorage.getItem('talentflow_theme')==='dark')document.body.classList.add('dark');$('notificationButton').onclick=()=>{$('notificationPanel').classList.toggle('hidden');$('notificationDot').style.display='none'};$('clearNotifications').onclick=()=>{$('notificationList').innerHTML='<p style="padding:15px;color:var(--muted);font-size:12px">No new notifications.</p>'};$('generateInsight').onclick=()=>{const total=data.candidates.length,avg=total?Math.round(data.candidates.reduce((a,c)=>a+c.score,0)/total):0;$('aiInsightContent').innerHTML=`<p class="ai-main-text"><strong>${total} candidates</strong> are currently in the talent pool with an average AI match of <strong>${avg}%</strong>. ${data.interviews.length} interviews are scheduled. Review high-match candidates first and keep interview stages moving.</p>`;showToast('AI insight generated')};$('globalSearch').oninput=e=>{const q=e.target.value.trim();if(q){navigate('candidates');$('candidateSearch').value=q;renderCandidates()}};['candidateSearch','candidateStatusFilter','candidateRoleFilter','candidateSort'].forEach(id=>$(id).addEventListener('input',renderCandidates));$('settingAI').onchange=e=>{data.settings.ai=e.target.checked;saveData()};$('settingNotifications').onchange=e=>{data.settings.notifications=e.target.checked;saveData()};$('settingCompact').onchange=e=>{data.settings.compact=e.target.checked;saveData();renderSettings()};$('resetData').onclick=()=>{if(confirm('Reset all demo recruitment data?')){data=structuredClone(demoData);saveData();renderAll();showToast('Demo data reset')}}}

function boot(){initAuth();initNavigation();initActions();if(!currentUser){$('app').classList.add('hidden');$('authScreen').classList.remove('hidden')}else{$('authScreen').classList.add('hidden');$('app').classList.remove('hidden')}}
boot();
checkBackend();
loadCandidatesFromAPI();
