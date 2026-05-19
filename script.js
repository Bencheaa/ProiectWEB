const username = "Bencheaa";

const projectsContainer = document.getElementById("projects");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const searchInput = document.getElementById("searchInput");

let allRepos = [];

async function getRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);

    if (!response.ok) throw new Error("API error");

    const data = await response.json();

    loading.classList.add("hidden");

    allRepos = data;
    displayRepos(allRepos);

  } catch (err) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
  }
}

function displayRepos(repos) {
  projectsContainer.innerHTML = "";

  const filtered = repos.filter(repo => repo.fork === false);

  const sorted = filtered.sort((a, b) =>
    new Date(b.updated_at) - new Date(a.updated_at)
  );

  if (sorted.length === 0) {
    projectsContainer.innerHTML = "<p>No projects found.</p>";
    return;
  }

  sorted.slice(0, 5).forEach(repo => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description ? repo.description : "Fără descriere disponibilă"}</p>
      <p><strong>Language:</strong> ${repo.language || "N/A"}</p>
      <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
      <a href="${repo.html_url}" target="_blank">View on GitHub</a>
    `;

    projectsContainer.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = allRepos.filter(repo => {
    return (
      repo.name.toLowerCase().includes(value) ||
      (repo.language || "").toLowerCase().includes(value)
    );
  });

  displayRepos(filtered);
});

getRepos();