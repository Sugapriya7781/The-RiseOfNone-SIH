/* =========================
   script.js (CLEAN)
   Handles:
   - login / logout
   - sidebar navigation
   - rendering internships
   - search + apply flow
   - profile save (with skills)
   - skills autocomplete (from Flask ROLE_SKILLS)
   - assessment skills merge
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
    logo: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=200",
    type: "private",
    description: "Work on basic security assessments, vulnerability checks, and report writing."
  },
  {
    id: "i5",
    title: "Data Analyst Intern",
    company: "NITI Aayog",
    location: "New Delhi",
    duration: "3 Months",
    stipend: "₹8,000/month",
    applyBy: "30-Sep-2025",
    logo: "https://images.unsplash.com/photo-1526378723894-3b9f16b9b3b8?w=200",
    type: "government",
    description: "Assist with data cleaning, visualization and report generation for policy teams."
  }
];

/* ---------- State ---------- */
let applied = JSON.parse(localStorage.getItem("appliedInternships") || "[]");
let profile = JSON.parse(localStorage.getItem("userProfile") || "null");
let selectedSkills = JSON.parse(localStorage.getItem("selectedSkills") || "[]");
let roleSkills = {};
let allSkills = [];

const usernameKey = "intern_portal_user";

/* ---------- DOM ---------- */
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const sidebarUser = document.getElementById("sidebarUser");

const menuItems = document.querySelectorAll(".menu-item");
const contentSections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("pageTitle");

const internshipCards = document.getElementById("internshipCards");
const privateCards = document.getElementById("privateCards");
const govCards = document.getElementById("govCards");
const applicationsList = document.getElementById("applicationsList");
const appliedCount = document.getElementById("appliedCount");

const globalSearch = document.getElementById("globalSearch");
const globalSearchBtn = document.getElementById("globalSearchBtn");

const detailModal = document.getElementById("detailModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

const profileForm = document.getElementById("profileForm");
const pfName = document.getElementById("pfName");
const pfEmail = document.getElementById("pfEmail");
const pfLocation = document.getElementById("pfLocation");

const skillsInput = document.getElementById("skillsInput");
const suggestionBox = document.getElementById("suggestionBox");
const selectedSkillsDiv = document.getElementById("selectedSkills");
const skillsList = document.getElementById("skillsList");

/* ---------- Helpers ---------- */
function saveApplied() {
  localStorage.setItem("appliedInternships", JSON.stringify(applied));
  renderApplications();
  appliedCount.textContent = applied.length;
}

function saveProfile() {
  const profileData = {
    username: document.getElementById("inputUsername")?.value || "Guest",
    email: document.getElementById("inputEmail")?.value || "",
    firstName: document.getElementById("inputFirstName")?.value || "",
    lastName: document.getElementById("inputLastName")?.value || "",
    country: document.getElementById("countrySelect")?.value || "",
    city: document.getElementById("citySelect")?.value || "",
    phone: document.getElementById("inputPhone")?.value || "",
    university: document.getElementById("inputUniversity")?.value || "",
    degree: document.getElementById("inputDegree")?.value || "",
    fieldStudy: document.getElementById("inputFieldStudy")?.value || "",
    graduationYear: document.getElementById("inputGraduationYear")?.value || "",
    linkedIn: document.getElementById("inputLinkedIn")?.value || "",
    portfolio: document.getElementById("inputPortfolio")?.value || "",
    bio: document.getElementById("inputBio")?.value || "",
    skills: selectedSkills
  };

  localStorage.setItem("userProfile", JSON.stringify(profileData));
  profile = profileData;

  renderProfile();
  alert("Profile saved successfully!");
}

function loadProfile() {
  const stored = JSON.parse(localStorage.getItem("userProfile") || "null");
  if (stored) profile = stored;
}

/* ---------- Login ---------- */
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("username").value.trim() || "Guest";
  localStorage.setItem(usernameKey, user);
  sidebarUser.textContent = user;
  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderAll();
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem(usernameKey);
  loginSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
});

const logged = localStorage.getItem(usernameKey);
if (logged) {
  document.addEventListener("DOMContentLoaded", () => {
    sidebarUser.textContent = logged;
    loginSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    renderAll();
  });
}

/* ---------- Sidebar Navigation ---------- */
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    if (item.id === "logoutBtn") return;

    menuItems.forEach(m => m.classList.remove("active"));
    item.classList.add("active");

    contentSections.forEach(s => s.classList.remove("active"));
    const sectionId = item.dataset.section;
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("active");
      pageTitle.textContent = section.querySelector("h3")?.innerText || "Section";
    }
  });
});

/* ---------- Render Internships ---------- */
function createInternCard(intern) {
  const el = document.createElement("div");
  el.className = "intern-card";
  el.innerHTML = `
    <img src="${intern.logo}" alt="${intern.company} logo">
    <div class="info">
      <h4>${intern.title}</h4>
      <p><strong>${intern.company}</strong></p>
      <p>${intern.location} • ${intern.duration}</p>
      <p>Apply by: ${intern.applyBy} • Stipend: ${intern.stipend}</p>
      <div class="actions">
        <button class="btn primary apply-btn" data-id="${intern.id}">Apply Now</button>
        <button class="btn outline view-btn" data-id="${intern.id}">View</button>
      </div>
    </div>
  `;
  return el;
}

function renderList(container, list) {
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<p class="muted">No internships found.</p>`;
    return;
  }
  list.forEach(i => container.appendChild(createInternCard(i)));
}

function renderAll() {
  renderList(internshipCards, internships);
  renderList(privateCards, internships.filter(i => i.type === "private"));
  renderList(govCards, internships.filter(i => i.type === "government"));
  renderApplications();
  loadProfile();
  renderProfile();
  appliedCount.textContent = applied.length;
}

/* ---------- Applications ---------- */
function renderApplications() {
  applicationsList.innerHTML = "";
  if (applied.length === 0) {
    applicationsList.innerHTML = `<tr><td colspan="5">No applications yet.</td></tr>`;
    return;
  }
  applied.forEach(id => {
    const intern = internships.find(i => i.id === id);
    if (!intern) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${intern.title}</td>
      <td>${intern.company}</td>
      <td>${new Date().toLocaleDateString()}</td>
      <td>Applied</td>
      <td><button class="btn outline" onclick="withdrawApplication('${intern.id}')">Withdraw</button></td>
    `;
    applicationsList.appendChild(tr);
  });
}

function applyToInternship(id) {
  if (applied.includes(id)) {
    alert("You already applied.");
    return;
  }
  applied.push(id);
  saveApplied();
  alert("Application submitted.");
}

function withdrawApplication(id) {
  applied = applied.filter(a => a !== id);
  saveApplied();
}

/* ---------- Profile + Skills ---------- */
function renderProfile() {
  if (!profile) return;
  pfName.value = profile.username || "";
  pfEmail.value = profile.email || "";
  pfLocation.value = profile.city || "";

  skillsList.innerHTML = "";
  (profile.skills || []).forEach(skill => {
    const span = document.createElement("span");
    span.className = "badge bg-success text-white";
    span.textContent = skill;
    skillsList.appendChild(span);
  });

  sidebarUser.textContent = profile.username || "Guest";
}

/* ---------- Skills Autocomplete ---------- */
async function loadSkills() {
  const res = await fetch("/get_skills");
  roleSkills = await res.json();
  allSkills = Object.values(roleSkills).flatMap(r => [...r.hard, ...r.domain, ...r.soft]);
  allSkills = [...new Set(allSkills)];
}
loadSkills();

skillsInput?.addEventListener("input", () => {
  const query = skillsInput.value.toLowerCase().trim();
  suggestionBox.innerHTML = "";
  if (!query) return;

  const matches = allSkills.filter(s => s.toLowerCase().includes(query));
  matches.slice(0, 5).forEach(skill => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = skill;
    div.onclick = () => addSkill(skill);
    suggestionBox.appendChild(div);
  });
});

function addSkill(skill) {
  if (selectedSkills.includes(skill)) return;
  selectedSkills.push(skill);
  localStorage.setItem("selectedSkills", JSON.stringify(selectedSkills));

  const tag = document.createElement("span");
  tag.className = "skill-tag";
  tag.textContent = skill;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = () => {
    selectedSkills = selectedSkills.filter(s => s !== skill);
    localStorage.setItem("selectedSkills", JSON.stringify(selectedSkills));
    tag.remove();
  };

  tag.appendChild(removeBtn);
  selectedSkillsDiv.appendChild(tag);

  skillsInput.value = "";
  suggestionBox.innerHTML = "";
}

/* ---------- Event Delegation ---------- */
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.matches(".apply-btn")) applyToInternship(t.dataset.id);
  if (t.matches(".view-btn")) {
    const intern = internships.find(i => i.id === t.dataset.id);
    if (intern) {
      modalContent.innerHTML = `
        <h3>${intern.title}</h3>
        <p><strong>${intern.company}</strong> • ${intern.location}</p>
        <p>${intern.description}</p>
      `;
      detailModal.classList.remove("hidden");
    }
  }
  if (t.matches(".modal-close") || t.id === "modalCloseBtn") {
    detailModal.classList.add("hidden");
  }
});

/* ---------- Init ---------- */
function init() {
  applied = JSON.parse(localStorage.getItem("appliedInternships") || "[]");
  selectedSkills = JSON.parse(localStorage.getItem("selectedSkills") || "[]");
  loadProfile();
  renderAll();

  // Load saved skills into profile view
  selectedSkills.forEach(skill => {
    const span = document.createElement("span");
    span.className = "badge bg-primary text-white";
    span.textContent = skill;
    skillsList.appendChild(span);
  });
}
init();
