const username = "Bencheaa";

const projectsContainer = document.getElementById("projects");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const showLessBtn = document.getElementById("showLessBtn");

let allRepos = [];
let activeRepos = [];

const PAGE_SIZE = 5;
const LOAD_MORE_THRESHOLD = 6;
let visibleCount = PAGE_SIZE;

function setErrorMessage(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

function hideError() {
  error.classList.add("hidden");
}

function normalizeLocalProject(project) {
  return {
    name: String(project?.name || "").trim(),
    description: project?.description ?? null,
    language: project?.language ?? null,
    html_url: project?.url ?? null,
    stargazers_count: typeof project?.stargazers_count === "number" ? project.stargazers_count : null,
    updated_at: project?.updated_at || new Date().toISOString(),
    fork: false
  };
}

async function getLocalProjects() {
  try {
    const response = await fetch("projects.json", { cache: "no-store" });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data
      .map(normalizeLocalProject)
      .filter(p => p.name.length > 0);
  } catch {
    return [];
  }
}

async function getGithubRepos() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("OFFLINE");
  }

  const response = await fetch(`https://api.github.com/users/${username}/repos`);

  if (!response.ok) {
    if (response.status === 404) throw new Error("NOT_FOUND");

    if (response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining === "0") throw new Error("RATE_LIMIT");

      try {
        const body = await response.json();
        const msg = String(body?.message || "").toLowerCase();
        if (msg.includes("rate limit")) throw new Error("RATE_LIMIT");
      } catch {
        
      }
    }

    throw new Error("API_ERROR");
  }

  return response.json();
}

function mergeProjects(githubRepos, localProjects) {
  const byName = new Map();
  [...githubRepos, ...localProjects].forEach(repo => {
    const name = String(repo?.name || "").toLowerCase();
    if (!name) return;
    if (!byName.has(name)) byName.set(name, repo);
  });
  return Array.from(byName.values());
}

async function loadProjects() {
  hideError();
  loading.classList.remove("hidden");

  const localProjects = await getLocalProjects();

  let githubRepos = [];
  let githubError = null;
  try {
    githubRepos = await getGithubRepos();
  } catch (err) {
    githubError = err;
  }

  loading.classList.add("hidden");

  if (githubError) {
    const code = githubError instanceof Error ? githubError.message : "";
    if (code === "OFFLINE") {
      setErrorMessage("Ups! Nu ai conexiune la internet momentan. Afișez proiectele locale.");
    } else if (code === "NOT_FOUND") {
      setErrorMessage("Ups! Utilizatorul GitHub nu a fost găsit. Afișez proiectele locale.");
    } else if (code === "RATE_LIMIT") {
      setErrorMessage("Ups! Ai atins limita de request-uri GitHub. Afișez proiectele locale.");
    } else if (githubError instanceof TypeError) {
      setErrorMessage("Ups! Nu am putut contacta GitHub momentan. Afișez proiectele locale.");
    } else {
      setErrorMessage("Ups! Nu am putut încărca proiectele GitHub momentan. Afișez proiectele locale.");
    }
  }

  allRepos = mergeProjects(githubRepos, localProjects);
  activeRepos = allRepos;
  visibleCount = PAGE_SIZE;
  displayRepos(activeRepos);
}

function displayRepos(repos) {
  projectsContainer.innerHTML = "";

  const filtered = repos.filter(repo => repo.fork === false);

  const sorted = filtered.sort((a, b) =>
    new Date(b.updated_at) - new Date(a.updated_at)
  );

  if (sorted.length === 0) {
    projectsContainer.innerHTML = "<p>No projects found.</p>";
    loadMoreBtn.classList.add("hidden");
    showLessBtn.classList.add("hidden");
    return;
  }

  const shouldPaginate = sorted.length > LOAD_MORE_THRESHOLD;
  const renderCount = shouldPaginate ? Math.min(visibleCount, sorted.length) : sorted.length;

  sorted.slice(0, renderCount).forEach((repo, idx) => {
    const card = document.createElement("div");
    card.classList.add("card");
    if (renderCount >= 3 && idx === renderCount - 1) {
      card.classList.add("card--wide");
    }

    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : null;
    const statsLine = stars !== null
      ? `<p>⭐ ${stars}</p>`
      : "";

    const url = repo.html_url || repo.url || "";
    const link = url
      ? `<a href="${url}" target="_blank" rel="noreferrer">View project</a>`
      : "";

    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description ? repo.description : "Fără descriere disponibilă"}</p>
      <p>Language: ${repo.language || "N/A"}</p>
      ${statsLine}
      ${link}
    `;

    projectsContainer.appendChild(card);
  });

  if (shouldPaginate && renderCount < sorted.length) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }

  if (shouldPaginate && renderCount > PAGE_SIZE) {
    showLessBtn.classList.remove("hidden");
  } else {
    showLessBtn.classList.add("hidden");
  }
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  visibleCount = PAGE_SIZE;

  const filtered = allRepos.filter(repo => {
    return (
      repo.name.toLowerCase().includes(value) ||
      (repo.language || "").toLowerCase().includes(value)
    );
  });

  activeRepos = filtered;
  displayRepos(activeRepos);
});

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  displayRepos(activeRepos);
});

showLessBtn.addEventListener("click", () => {
  visibleCount = PAGE_SIZE;
  displayRepos(activeRepos);
});

loadProjects();