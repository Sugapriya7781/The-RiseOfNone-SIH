/* =========================
   script.js
   Handles:
   - login / logout
   - sidebar navigation
   - rendering internship lists (dashboard/private/govt)
   - search and apply flow
   - profile save (localStorage)
   - simple modal details
   ========================= */

/* ---------- Sample internship data ---------- */
const internships = [
  {
    id: "i1",
    title: "Cyber Security Intern",
    company: "EXTION INFOTECH",
    location: "Remote",
    duration: "2 Months",
    stipend: "Unpaid",
    applyBy: "20-Sep-2025",
    logo: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=200&auto=format&fit=crop",
    type: "private",
    description: "Work on basic security assessments, vulnerability checks, and report writing. Great for beginners."
  },
  {
    id: "i2",
    title: "Content Creator & Graphic Design Intern",
    company: "EXTION INFOTECH",
    location: "Remote",
    duration: "2 Months",
    stipend: "Unpaid",
    applyBy: "11-Sep-2025",
    logo: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=200&auto=format&fit=crop",
    type: "private",
    description: "Design social assets, promotional material and short videos for clients."
  },
  {
    id: "i3",
    title: "Machine Learning Intern",
    company: "TechVision Labs",
    location: "Remote",
    duration: "3 Months",
    stipend: "₹5,000/month",
    applyBy: "09-Sep-2025",
    logo: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=200&auto=format&fit=crop",
    type: "private",
    description: "Build and evaluate ML models; work with datasets and model deployment."
  },
  {
    id: "i4",
    title: "Product Design Intern",
    company: "Pixelcraft Studios",
    location: "Bangalore",
    duration: "2 Months",
    stipend: "₹4,000/month",
    applyBy: "08-Sep-2025",
    logo: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=200&auto=format&fit=crop",
    type: "private",
    description: "UX/UI tasks, wireframing, prototyping and user research."
  },
  {
    id: "i5",
    title: "Data Analyst Intern",
    company: "NITI Aayog",
    location: "New Delhi",
    duration: "3 Months",
    stipend: "₹8,000/month",
    applyBy: "30-Sep-2025",
    logo: "https://images.unsplash.com/photo-1526378723894-3b9f16b9b3b8?q=80&w=200&auto=format&fit=crop",
    type: "government",
    description: "Assist with data cleaning, visualization and report generation for policy teams."
  }
];

/* ---------- application state (persisted in localStorage) ---------- */
let applied = JSON.parse(localStorage.getItem("appliedInternships") || "[]");
let profile = JSON.parse(localStorage.getItem("userProfile") || "null");
const usernameKey = "intern_portal_user";

/* ---------- DOM elements ---------- */
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const sidebarUser = document.getElementById("sidebarUser");

const menuItems = document.querySelectorAll(".menu-item");
const contentSections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("pageTitle");
const welcomeText = document.getElementById("welcomeText");

const internshipCards = document.getElementById("internshipCards");
const privateCards = document.getElementById("privateCards");
const govCards = document.getElementById("govCards");
const applicationsList = document.getElementById("applicationsList");
const appliedCount = document.getElementById("appliedCount");

const globalSearch = document.getElementById("globalSearch");
const globalSearchBtn = document.getElementById("globalSearchBtn");

/* modal */
const detailModal = document.getElementById("detailModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

/* profile */
const profileForm = document.getElementById("profileForm");
const pfName = document.getElementById("pfName");
const pfEmail = document.getElementById("pfEmail");
const pfLocation = document.getElementById("pfLocation");
const pfSkills = document.getElementById("pfSkills");
const profilePic = document.getElementById("profilePic");
const resumeInput = document.getElementById("resumeInput");

/* ---------- Helpers ---------- */
function saveApplied(){
  localStorage.setItem("appliedInternships", JSON.stringify(applied));
  renderApplications();
  appliedCount.textContent = applied.length;
}

function saveProfile(){
  const p = {
    name: pfName.value || "Guest User",
    email: pfEmail.value || "",
    location: pfLocation.value || "",
    skills: pfSkills.value || ""
  };
  localStorage.setItem("userProfile", JSON.stringify(p));
  profile = p;
  renderProfile();
}

function loadProfile(){
  const stored = JSON.parse(localStorage.getItem("userProfile") || "null");
  if(stored){
    profile = stored;
  }
}

/* ---------- Login / Logout ---------- */
loginForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const user = document.getElementById("username").value.trim() || "Guest";
  localStorage.setItem(usernameKey, user);
  sidebarUser.textContent = user;
  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  // initial render
  renderAll();
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  localStorage.removeItem(usernameKey);
  loginSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
});

/* if already logged in, skip login */
const logged = localStorage.getItem(usernameKey);
if(logged){
  document.addEventListener("DOMContentLoaded", ()=>{
    sidebarUser.textContent = logged;
    loginSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    renderAll();
  });
}

/* ---------- Sidebar navigation ---------- */
menuItems.forEach(item=>{
  item.addEventListener("click", ()=> {
    // logout item has id logoutBtn and is handled separately
    if(item.id === "logoutBtn"){
      return;
    }

    // set active menu
    menuItems.forEach(m => m.classList.remove("active"));
    item.classList.add("active");

    // show section mapped by data-section
    contentSections.forEach(s => s.classList.remove("active"));
    const sectionId = item.dataset.section;
    const section = document.getElementById(sectionId);
    if(section) {
      section.classList.add("active");
      pageTitle.textContent = section.querySelector("h3") ? section.querySelector("h3").innerText : (section.querySelector("h2") ? section.querySelector("h2").innerText : "Section");
    }
  });
});

/* ---------- Render helpers ---------- */
function createInternCard(intern){
  const el = document.createElement("div");
  el.className = "intern-card";
  el.innerHTML = `
    <img src="${intern.logo}" alt="${intern.company} logo">
    <div class="info">
      <h4>${intern.title}</h4>
      <p><strong>Company:</strong> ${intern.company}</p>
      <p><strong>Location:</strong> ${intern.location} • <strong>Duration:</strong> ${intern.duration}</p>
      <p class="muted"><strong>Apply by:</strong> ${intern.applyBy} • <strong>Stipend:</strong> ${intern.stipend}</p>
      <div class="actions">
        <button data-id="${intern.id}" class="btn primary apply-btn">Apply Now</button>
        <button data-id="${intern.id}" class="btn outline view-btn">View</button>
      </div>
    </div>
  `;
  return el;
}

function renderList(container, list){
  container.innerHTML = "";
  if(!list.length){
    container.innerHTML = `<div class="card small"><p class="muted">No internships found.</p></div>`;
    return;
  }
  list.forEach(i => container.appendChild(createInternCard(i)));
  // attach listeners via delegation
}

function renderAll(){
  // Dashboard: top picks (all private + govt combined)
  renderList(internshipCards, internships);

  // private / govt lists
  renderList(privateCards, internships.filter(i=>i.type==="private"));
  renderList(govCards, internships.filter(i=>i.type==="government"));

  // applications
  renderApplications();

  // profile load
  loadProfile();
  renderProfile();

  // counts
  appliedCount.textContent = applied.length;
}

/* ---------- Applications ---------- */
function renderApplications(){
  applicationsList.innerHTML = "";
  if(applied.length === 0){
    applicationsList.innerHTML = `<tr><td colspan="5" class="muted">You haven't applied to any internships yet.</td></tr>`;
    return;
  }

  applied.forEach(app => {
    const intern = internships.find(i=>i.id === app.id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${intern?.title || "Unknown"}</td>
      <td>${intern?.company || ""}</td>
      <td>${new Date(app.appliedAt).toLocaleString()}</td>
      <td>${app.status}</td>
      <td>
        <button class="btn outline view-app" data-id="${app.id}">View</button>
        <button class="btn" style="background:#ff7675;color:white" data-id="${app.id}" class="withdraw">Withdraw</button>
      </td>
    `;
    applicationsList.appendChild(tr);
  });
}

/* Apply / withdraw functions */
function applyToInternship(id){
  if(applied.some(a=>a.id===id)) {
    alert("You already applied to this internship.");
    return;
  }
  applied.push({ id, status: "Applied", appliedAt: Date.now() });
  saveApplied();
  alert("Application submitted. Check Application Management.");
}

function withdrawApplication(id){
  applied = applied.filter(a=>a.id !== id);
  saveApplied();
}

/* ---------- Profile ---------- */
function renderProfile(){
  const stored = JSON.parse(localStorage.getItem("userProfile") || "null");
  if(stored){
    pfName.value = stored.name || "";
    pfEmail.value = stored.email || "";
    pfLocation.value = stored.location || "";
    pfSkills.value = stored.skills || "";
    sidebarUser.textContent = stored.name || localStorage.getItem(usernameKey) || "Guest";
  } 
  if(profile){
    document.getElementById("pfNameDisplay").textContent = profile.name || "Guest";
    document.getElementById("pfSummary").textContent = profile.summary || "No summary added yet.";
    document.getElementById("pfLangs").textContent = profile.languages || "English";
    document.getElementById("pfExp").textContent = profile.experience || "0";
    document.getElementById("pfSalary").textContent = profile.salary || "—";

    // Skills as tags
    const skills = (profile.skills || "").split(",").map(s=>s.trim()).filter(Boolean);
    const tags = document.getElementById("pfSkillsTags");
    tags.innerHTML = "";
    skills.forEach(skill=>{
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = skill;
      tags.appendChild(span);
    });
  }else {
    // fallback values
    pfName.value = localStorage.getItem(usernameKey) || "";
  }
}

/* event: profile save */
profileForm && profileForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  saveProfile();
  alert("Profile saved.");
});

/* reset profile button */
document.getElementById("profileReset")?.addEventListener("click", ()=>{
  pfName.value = "";
  pfEmail.value = "";
  pfLocation.value = "";
  pfSkills.value = "";
  localStorage.removeItem("userProfile");
  alert("Profile reset.");
});

/* ---------- Search ---------- */
function searchAndRender(query){
  const q = (query||"").toLowerCase().trim();
  if(!q){ renderAll(); return; }
  const filtered = internships.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.company.toLowerCase().includes(q) ||
    i.location.toLowerCase().includes(q)
  );
  // show results in main cards (dashboard)
  renderList(internshipCards, filtered);
}

globalSearchBtn.addEventListener("click", ()=>{
  searchAndRender(globalSearch.value);
});

/* also support pressing enter in search */
globalSearch.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){ e.preventDefault(); searchAndRender(globalSearch.value); }
});

/* ---------- Event delegation for dynamic buttons ---------- */
document.addEventListener("click", (e)=>{
  const target = e.target;

  // Apply Now from cards
  if(target.matches(".apply-btn")){
    const id = target.dataset.id;
    applyToInternship(id);
  }

  // View details from cards
  if(target.matches(".view-btn")){
    const id = target.dataset.id;
    const intern = internships.find(x=>x.id===id);
    if(intern){
      modalContent.innerHTML = `
        <h3>${intern.title}</h3>
        <p><strong>${intern.company}</strong> • ${intern.location}</p>
        <p class="muted">Duration: ${intern.duration} • Stipend: ${intern.stipend} • Apply by: ${intern.applyBy}</p>
        <p style="margin-top:12px;">${intern.description}</p>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn primary apply-btn" data-id="${intern.id}">Apply Now</button>
          <button class="btn outline" id="modalCloseBtn">Close</button>
        </div>
      `;
      detailModal.classList.remove("hidden");
    }
  }

  // modal close
  if(target.matches(".modal-close") || target.id === "modalCloseBtn"){
    detailModal.classList.add("hidden");
    modalContent.innerHTML = "";
  }

  // withdraw from application table
  if(target.matches("button[data-id]") && target.textContent.includes("Withdraw")){
    const id = target.dataset.id;
    if(confirm("Withdraw application?")){
      withdrawApplication(id);
    }
  }

  // view application details
  if(target.matches(".view-app")){
    const id = target.dataset.id;
    const intern = internships.find(x=>x.id===id);
    if(intern){
      modalContent.innerHTML = `
        <h3>${intern.title}</h3>
        <p><strong>${intern.company}</strong> • ${intern.location}</p>
        <p class="muted">${intern.description}</p>
        <div style="margin-top:12px">
          <button class="btn outline" id="modalCloseBtn2">Close</button>
        </div>
      `;
      detailModal.classList.remove("hidden");
    }
  }

  // close modal button created from dynamic content
  if(target.id === "modalCloseBtn2"){
    detailModal.classList.add("hidden");
    modalContent.innerHTML = "";
  }
});

/* modal close helper */
modalClose?.addEventListener("click", ()=> detailModal.classList.add("hidden"));
detailModal.addEventListener("click", (e)=> {
  if(e.target === detailModal) detailModal.classList.add("hidden");
});

/* ---------- Persist / load state ---------- */
function init(){
  // ensure applied is loaded
  applied = JSON.parse(localStorage.getItem("appliedInternships") || "[]");
  // load profile
  loadProfile();
  // render UI
  renderAll();
}
init();
