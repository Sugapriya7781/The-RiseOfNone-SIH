// Skill sets data
const SKILL_SETS = {
  business_analyst: {
    hard: [
      "excel",
      "sql",
      "tableau",
      "power bi",
      "sas",
      "r",
      "statistics",
      "financial modeling",
      "data visualization",
      "reporting",
    ],
    domain: [
      "finance",
      "banking",
      "insurance",
      "healthcare",
      "supply chain",
      "marketing",
      "operations",
    ],
    soft: [
      "communication",
      "stakeholder management",
      "problem solving",
      "analytical thinking",
      "documentation",
    ],
  },
  data_analyst: {
    hard: [
      "sql",
      "python",
      "pandas",
      "numpy",
      "excel",
      "tableau",
      "power bi",
      "looker",
      "r",
      "statistics",
      "data cleaning",
      "etl",
    ],
    domain: ["retail", "e-commerce", "marketing", "healthcare", "operations"],
    soft: [
      "attention to detail",
      "visualization storytelling",
      "collaboration",
      "critical thinking",
    ],
  },
  data_engineer: {
    hard: [
      "python",
      "sql",
      "java",
      "scala",
      "spark",
      "hadoop",
      "kafka",
      "airflow",
      "dbt",
      "snowflake",
      "redshift",
      "bigquery",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "etl",
      "data warehouse",
      "pipelines",
    ],
    domain: [
      "cloud",
      "streaming",
      "data pipelines",
      "big data",
      "healthcare",
      "finance",
    ],
    soft: ["problem solving", "teamwork", "ownership", "documentation"],
  },
  data_scientist: {
    hard: [
      "python",
      "r",
      "sql",
      "machine learning",
      "deep learning",
      "nlp",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "statistics",
      "probability",
      "optimization",
      "time series",
      "computer vision",
    ],
    domain: [
      "ai",
      "healthcare",
      "finance",
      "retail",
      "predictive analytics",
      "genai",
    ],
    soft: ["critical thinking", "research mindset", "communication", "problem solving"],
  },
};
// Flatten and deduplicate all skills
const allSkills = Array.from(
  new Set(
    Object.values(SKILL_SETS).flatMap((role) =>
      Object.values(role).flat()
    )
  )
).sort();

const skillsInput = document.getElementById("skillsInput");
const skillsList = document.getElementById("skillsList");
const suggestionBox = document.getElementById("suggestionBox");

const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");

const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("inputPhone");

const sidebarEmail = document.getElementById("sidebarEmail");
const sidebarPhone = document.getElementById("sidebarPhone");
const sidebarLocation = document.getElementById("sidebarLocation");
const sidebarUniversity = document.getElementById("sidebarUniversity");

// Country and cities data
const countriesWithCities = {
  India: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ],
  USA: [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ],
  UK: [
    "London",
    "Birmingham",
    "Leeds",
    "Glasgow",
    "Sheffield",
    "Bradford",
    "Liverpool",
    "Edinburgh",
    "Manchester",
    "Bristol",
  ],
  Australia: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Canberra",
    "Newcastle",
    "Wollongong",
    "Logan City",
  ],
  Japan: [
    "Tokyo",
    "Yokohama",
    "Osaka",
    "Nagoya",
    "Sapporo",
    "Kobe",
    "Kyoto",
    "Fukuoka",
    "Kawasaki",
    "Saitama",
  ],
  // Add more countries and cities if needed
};

// Skill autocomplete
skillsInput.addEventListener("input", function () {
  const val = this.value.toLowerCase();
  suggestionBox.innerHTML = "";
  if (!val) return;
  const suggestions = allSkills
    .filter((skill) => skill.toLowerCase().startsWith(val))
    .slice(0, 7);
  suggestions.forEach((skill) => {
    const item = document.createElement("div");
    item.innerHTML = skill.replace(
      new RegExp(val, "i"),
      "<strong>" + skill.substr(0, val.length) + "</strong>"
    );
    item.className = "suggestion-item";
    item.onclick = function () {
      skillsInput.value = skill;
      suggestionBox.innerHTML = "";
    };
    suggestionBox.appendChild(item);
  });
});
document.addEventListener("click", function (e) {
  if (e.target !== skillsInput) {
    suggestionBox.innerHTML = "";
  }
});

// Add skill with no duplicates
function addSkill() {
  let value = skillsInput.value.trim();
  if (!value) return;
  const skills = Array.from(skillsList.querySelectorAll(".skills-badge")).map(
    (badge) => badge.getAttribute("data-skill").toLowerCase().trim()
  );
  if (skills.includes(value.toLowerCase().trim())) {
    skillsInput.value = "";
    suggestionBox.innerHTML = "";
    return;
  }
  const badge = document.createElement("span");
  badge.className = "skills-badge";
  badge.setAttribute("data-skill", value.trim());
  badge.textContent = value;
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-skill-btn";
  removeBtn.innerHTML = "&times;";
  removeBtn.onclick = function (e) {
    e.stopPropagation();
    badge.remove();
  };
  badge.appendChild(removeBtn);
  skillsList.appendChild(badge);
  skillsInput.value = "";
  suggestionBox.innerHTML = "";
}
window.addSkill = addSkill;

// Profile image upload preview
document.getElementById("photoUpload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("profileImg").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Populate cities based on selected country
countrySelect.addEventListener("change", () => {
  const country = countrySelect.value;
  citySelect.innerHTML = '<option value="" selected disabled>Select a city</option>';
  if (country && countriesWithCities[country]) {
    countriesWithCities[country].forEach((city) => {
      let opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = false;
  } else {
    citySelect.disabled = true;
  }
});

// Country code phone length adjust and digit validation
countryCodeSelect.addEventListener("change", () => {
  const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
  const maxLength = selectedOption.getAttribute("data-length") || "10";
  phoneInput.value = "";
  phoneInput.setAttribute("maxlength", maxLength);
  phoneInput.placeholder = `Enter ${maxLength} digit phone number`;
});
phoneInput.addEventListener("input", () => {
  let val = phoneInput.value;
  val = val.replace(/\D/g, "");
  const maxLength = phoneInput.getAttribute("maxlength");
  if (val.length > maxLength) val = val.slice(0, maxLength);
  phoneInput.value = val;
});

// Save and update sidebar info
function saveProfile() {
  const firstName = document.getElementById("inputFirstName").value.trim();
  const lastName = document.getElementById("inputLastName").value.trim();
  const fullName = (firstName || lastName) ? (firstName + " " + lastName).trim() : "Unnamed User";
  const email = document.getElementById("inputEmail").value.trim();
  const countryLocation = countrySelect.value;
  const city = citySelect.value || "";
  const locationDisplay = city ? `${city}, ${countryLocation}` : countryLocation || "No location provided";

  const countryCode = countryCodeSelect.value;
  const phone = phoneInput.value.trim();
  const fullPhoneDisplay = phone ? `${countryCode} ${phone}` : "No phone provided";

  const university = document.getElementById("inputUniversity").value.trim() || "No university provided";

  // Update sidebar dynamically
  document.getElementById("profileName").textContent = fullName;
  sidebarEmail.textContent = email || "No email provided";
  sidebarPhone.textContent = fullPhoneDisplay;
  sidebarLocation.textContent = locationDisplay;
  sidebarUniversity.textContent = university;

  alert("Profile saved and updated!");
}
window.saveProfile = saveProfile;
