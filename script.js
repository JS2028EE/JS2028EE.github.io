const $ = (sel) => document.querySelector(sel);

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  $("#themeToggle").textContent = theme === "light" ? "🌞" : "🌙";
}

function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return setTheme(saved);
  return setTheme("dark");
}

function uniqueTags(projects) {
  const set = new Set();
  for (const p of projects) for (const t of (p.tags || [])) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

function createProjectCard(p) {
  const card = document.createElement("div");
  card.className = "card project";

  const top = document.createElement("div");
  top.className = "project-top";

  const left = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.textContent = p.title;

  const meta = document.createElement("div");
  meta.className = "badges";
  const b1 = document.createElement("span");
  b1.className = "badge";
  b1.textContent = p.status || "Project";
  meta.appendChild(b1);

  if (p.year) {
    const by = document.createElement("span");
    by.className = "badge";
    by.textContent = String(p.year);
    meta.appendChild(by);
  }

  left.appendChild(h3);
  left.appendChild(meta);

  top.appendChild(left);
  card.appendChild(top);

  const desc = document.createElement("p");
  desc.textContent = p.description || "";
  card.appendChild(desc);

  const tags = document.createElement("div");
  tags.className = "badges";
  for (const t of (p.tags || [])) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t;
    tags.appendChild(badge);
  }
  card.appendChild(tags);

  const links = document.createElement("div");
  links.className = "project-links";

  if (p.repo) {
    const aRepo = document.createElement("a");
    aRepo.href = p.repo;
    aRepo.target = "_blank";
    aRepo.rel = "noreferrer";
    aRepo.textContent = "Repo →";
    links.appendChild(aRepo);
  }

  if (p.demo) {
    const aDemo = document.createElement("a");
    aDemo.href = p.demo;
    aDemo.target = "_blank";
    aDemo.rel = "noreferrer";
    aDemo.textContent = "Demo →";
    links.appendChild(aDemo);
  }

  if (!p.repo && !p.demo) {
    const span = document.createElement("span");
    span.className = "muted small";
    span.textContent = "Links coming soon.";
    links.appendChild(span);
  }

  card.appendChild(links);
  return card;
}

function renderProjects(projects, query = "", tag = "") {
  const grid = $("#projectsGrid");
  grid.innerHTML = "";

  const q = query.trim().toLowerCase();
  const filtered = projects.filter(p => {
    const hay = `${p.title || ""} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
    const matchesQuery = !q || hay.includes(q);
    const matchesTag = !tag || (p.tags || []).includes(tag);
    return matchesQuery && matchesTag;
  });

  for (const p of filtered) grid.appendChild(createProjectCard(p));

  $("#metricProjects").textContent = String(projects.length);
  $("#metricBuilds").textContent = String(Math.max(projects.length, filtered.length));
}

async function init() {
  loadTheme();
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  });

  $("#year").textContent = String(new Date().getFullYear());

  const res = await fetch("projects.json");
  const data = await res.json();

  const nowList = $("#nowList");
  (data.now || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    nowList.appendChild(li);
  });

  const projects = data.projects || [];

  const tags = uniqueTags(projects);
  const select = $("#tagSelect");
  tags.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });

  const search = $("#searchInput");
  const rerender = () => renderProjects(projects, search.value, select.value);

  search.addEventListener("input", rerender);
  select.addEventListener("change", rerender);

  renderProjects(projects);
}

init().catch(err => {
  console.error(err);
  $("#projectsGrid").innerHTML = `<div class="card"><strong>Error:</strong> Could not load projects.json</div>`;
});
