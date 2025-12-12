const GITHUB_USER = "Boxur";

const BLACKLIST = [
    "Leetcode"
];

const PINNED = [
    "NeuralNetwork",
    "Compiler",
    "Commands"
];

const MIN_LANGUAGE_PERCENT = 0;

const PROJECTS_CONTAINER = document.getElementById("projects-container");

async function loadRepos() {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);
    const repos = await response.json();

    const filtered = repos.filter(r => !BLACKLIST.includes(r.name));

    filtered.sort((a, b) => {
        const aPinned = PINNED.includes(a.name);
        const bPinned = PINNED.includes(b.name);

        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        return new Date(b.updated_at) - new Date(a.updated_at);
    });


    for (const repo of filtered) {
        const languages = await fetchLanguages(repo.languages_url);

        addRepoCard(repo, languages);
    }
}

async function fetchLanguages(url) {
    const response = await fetch(url);
    const data = await response.json();

    const total = Object.values(data).reduce((a, b) => a + b, 0);

    const filtered = Object.entries(data)
        .filter(([_, bytes]) => (bytes / total) * 100 >= MIN_LANGUAGE_PERCENT)
        .map(([lang]) => lang);

    return filtered;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

function addRepoCard(repo, languages) {
    const card = document.createElement("div");
    const updateDate = formatDate(repo.updated_at);
    card.className = "card";

    const langText = languages.length > 0
        ? languages.join(" · ")
        : "";

    const licenseText = repo.license
        ? repo.license.spdx_id + " • "
        : ""

    card.innerHTML = `
          <h3>${repo.name}<small> • ${repo.language}</small></h3>
          <div class="meta">${licenseText}Last updated: ${updateDate}</div>
          <div class="meta"><small>${langText}<small></div>
          <p>${repo.description || "No description provided"}</p>
          <a class="btn" href="${repo.html_url}" target="_blank" rel="noopener">View on GitHub</a>
    `;

    PROJECTS_CONTAINER.appendChild(card);
}

loadRepos();
