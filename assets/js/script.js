// Resolve the repository path from CONFIG projects mapping or fallback to template
function getResolvedRepoPath(projectKey) {
  if (typeof CONFIG !== 'undefined') {
    if (CONFIG.projects && CONFIG.projects[projectKey]) {
      return CONFIG.projects[projectKey];
    }
    if (CONFIG.githubUsername) {
      // Backwards compatibility if a full path is passed in HTML
      if (projectKey.includes('/')) {
        const parts = projectKey.split('/');
        return `${CONFIG.githubUsername}/${parts[parts.length - 1]}`;
      }
      return `${CONFIG.githubUsername}/${projectKey}`;
    }
  }
  return projectKey;
}

async function goToRepo(projectKey, el){
  if (el.classList.contains('is-checking')) return;
  
  const resolvedPath = getResolvedRepoPath(projectKey);

  if (resolvedPath.startsWith('http://') || resolvedPath.startsWith('https://')) {
    window.open(resolvedPath, '_blank', 'noopener');
    return;
  }

  el.classList.add('is-checking');
  let exists = false;
  try {
    const res = await fetch('https://api.github.com/repos/' + resolvedPath, { headers: { 'Accept': 'application/vnd.github+json' } });
    exists = res.ok;
  } catch (err) {
    exists = false;
  }
  el.classList.remove('is-checking');
  if (exists) {
    window.open('https://github.com/' + resolvedPath, '_blank', 'noopener');
  } else {
    showMissingOverlay(projectKey);
  }
}

function showMissingOverlay(projectKey){
  const resolvedPath = getResolvedRepoPath(projectKey);
  document.getElementById('repo-overlay-path').textContent = resolvedPath;
  document.getElementById('repo-overlay').classList.add('is-visible');
}

function closeOverlay(){
  document.getElementById('repo-overlay').classList.remove('is-visible');
}

document.getElementById('repo-overlay').addEventListener('click', function(e){
  if (e.target === this) closeOverlay();
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') closeOverlay();
});

// Dynamically bind footer/contact links from CONFIG on page load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONFIG !== 'undefined') {
    const emailEl = document.getElementById('contact-email');
    if (emailEl && CONFIG.email) {
      emailEl.href = 'mailto:' + CONFIG.email;
      emailEl.textContent = CONFIG.email;
    }

    const robloxEl = document.getElementById('contact-roblox');
    if (robloxEl && CONFIG.robloxUrl) {
      robloxEl.href = CONFIG.robloxUrl;
      // Display clean URL text (remove protocols)
      robloxEl.textContent = CONFIG.robloxUrl.replace(/https?:\/\/(www\.)?/, '');
    }

    const githubEl = document.getElementById('contact-github');
    if (githubEl && CONFIG.githubUrl) {
      githubEl.href = CONFIG.githubUrl;
      githubEl.textContent = CONFIG.githubUrl.replace(/https?:\/\/(www\.)?/, '');
    }

    const discordEl = document.getElementById('contact-discord');
    if (discordEl && CONFIG.discordTag) {
      discordEl.href = '#';
      discordEl.textContent = 'discord: ' + CONFIG.discordTag;
    }
  }
});
