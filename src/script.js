// script.js
/* ===== Component-Driven Data (swap with API/JSON easily) ===== */
const projects = [
  {
    title: "Design System Starter",
    desc: "A reusable UI kit with theming and tokens.",
    tags: ["Design System", "Tokens", "CSS"],
    live: "#",
    code: "#"
  },
  {
    title: "Performance Analyzer",
    desc: "Lighthouse-based CI reports for PRs.",
    tags: ["CI/CD", "Node.js", "DX"],
    live: "#",
    code: "#"
  },
  {
    title: "Realtime Chat",
    desc: "WebSocket chat with rooms and typing indicators.",
    tags: ["WebSocket", "Auth", "SPA"],
    live: "#",
    code: "#"
  },
  {
    title: "Headless Blog",
    desc: "Content API + static generation, MDX-ready.",
    tags: ["Jamstack", "MDX", "SSR"],
    live: "#",
    code: "#"
  }
];

/* ===== Theme handling (auto + toggle + persist) ===== */
const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");

function setTheme(mode) {
  // mode: "light" | "dark" | "auto"
  root.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  const dark = getComputedStyle(root).getPropertyValue("--bg").trim() === "#0b0c0f"; // heuristic
  toggleBtn.setAttribute("aria-pressed", String(!dark)); // pressed = light icon state
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    setTheme(saved);
  } else {
    root.setAttribute("data-theme", "auto");
  }
}
toggleBtn?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "auto";
  const next = current === "light" ? "dark" : current === "dark" ? "auto" : "light";
  setTheme(next);
  toggleBtn.title = `Theme: ${next}`;
});
initTheme();

/* ===== Render projects (component-ish via <template>) ===== */
const grid = document.getElementById("project-grid");
const tmpl = document.getElementById("project-card-template");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

function distinctTags(items) {
  return [...new Set(items.flatMap(p => p.tags))].sort();
}

function renderProjects(items) {
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  items.forEach(p => {
    const node = tmpl.content.cloneNode(true);
    const title = node.querySelector(".card__title a");
    const desc = node.querySelector(".card__desc");
    const tags = node.querySelector(".tags");
    const [liveBtn, codeBtn] = node.querySelectorAll(".card__footer a");

    title.textContent = p.title;
    title.href = p.live || "#";
    desc.textContent = p.desc;

    p.tags.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      tags.appendChild(li);
    });

    liveBtn.href = p.live || "#";
    codeBtn.href = p.code || "#";

    frag.appendChild(node);
  });
  grid.appendChild(frag);
}

function applyFilters() {
  const q = (search.value || "").toLowerCase().trim();
  const tag = filter.value;
  let items = projects.filter(p =>
    (!q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))) &&
    (tag === "all" || p.tags.includes(tag))
  );
  renderProjects(items);
}

function initFilters() {
  // populate tag select
  const tags = distinctTags(projects);
  for (const t of tags) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    filter.appendChild(opt);
  }
  filter.addEventListener("change", applyFilters);
  search.addEventListener("input", applyFilters);
}

initFilters();
renderProjects(projects);

/* ===== Contact form (client-side validation + demo submit) ===== */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

function showError(field, message = "") {
  const error = field.closest(".field").querySelector(".error");
  error.textContent = message;
}

function validateField(field) {
  if (field.validity.valueMissing) {
    showError(field, "This field is required.");
    return false;
  }
  if (field.type === "email" && field.validity.typeMismatch) {
    showError(field, "Enter a valid email address.");
    return false;
  }
  if (field.name === "message" && field.value.trim().length < 10) {
    showError(field, "Please write at least 10 characters.");
    return false;
  }
  showError(field, "");
  return true;
}

form?.addEventListener("input", (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    validateField(e.target);
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fields = [...form.querySelectorAll("input, textarea")];
  const ok = fields.every(validateField);
  if (!ok) return;

  // Demo submit: replace with your endpoint (Formspree, Netlify, your API, etc.)
  statusEl.textContent = "Sending…";
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    // Simulate network
    await new Promise(r => setTimeout(r, 700));
    // Example: await fetch("/api/contact", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    statusEl.textContent = "Thanks! Your message has been sent.";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Something went wrong. Please try again.";
  }
});

/* ===== Small niceties ===== */
document.getElementById("year").textContent = new Date().getFullYear();
// Keyboard helper for users navigating with Tab
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("using-keyboard");
});
