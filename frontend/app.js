const API = '';

//  All Repositories 

async function loadRepositories() {
  const res = await fetch(`${API}/repositories`);
  const repos = await res.json();
  renderRepositories(repos);
}

function renderRepositories(repos) {
  const tbody = document.getElementById('repos-body');
  if (repos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No repositories yet.</td></tr>';
    return;
  }
  tbody.innerHTML = repos.map(repo => `
    <tr>
      <td>${repo.id}</td>
      <td>${repo.url}</td>
      <td>${repo.secret_name || '<em>none</em>'}</td>
      <td class="actions">
        <button class="secondary" onclick="openLinkModal(${repo.id}, '${repo.url}')">Link Secret</button>
        <button class="success" onclick="validateSecret(${repo.id}, this)">Validate</button>
        <span class="validate-result" id="validate-${repo.id}"></span>
        <button class="danger" onclick="deleteRepo(${repo.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('add-repo-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const url = document.getElementById('repo-url').value.trim();
  const errorEl = document.getElementById('repo-error');
  errorEl.textContent = '';

  const res = await fetch(`${API}/repositories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    return;
  }

  document.getElementById('repo-url').value = '';
  loadRepositories();
});

async function deleteRepo(id) {
  if (!confirm('Delete this repository?')) return;
  const res = await fetch(`${API}/repositories/${id}`, { method: 'DELETE' });
  if (res.ok) {
    loadRepositories();
  }
}

async function validateSecret(repoId, btn) {
  const resultEl = document.getElementById(`validate-${repoId}`);
  resultEl.textContent = 'Checking...';
  resultEl.className = 'validate-result';

  const res = await fetch(`${API}/repositories/${repoId}/validate-secret`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    resultEl.textContent = data.error;
    resultEl.className = 'validate-result fail';
    return;
  }

  if (data.valid) {
    resultEl.textContent = 'Valid';
    resultEl.className = 'validate-result ok';
  } else {
    resultEl.textContent = `Invalid (${data.statusCode})`;
    resultEl.className = 'validate-result fail';
  }
}

// All Secrets

async function loadSecrets() {
  const res = await fetch(`${API}/secrets`);
  const secrets = await res.json();
  renderSecrets(secrets);
  return secrets;
}

function renderSecrets(secrets) {
  const tbody = document.getElementById('secrets-body');
  if (secrets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No secrets yet.</td></tr>';
    return;
  }
  tbody.innerHTML = secrets.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.created_at}</td>
      <td>
        <button class="danger" onclick="deleteSecret(${s.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('add-secret-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('secret-name').value.trim();
  const value = document.getElementById('secret-value').value.trim();
  const errorEl = document.getElementById('secret-error');
  errorEl.textContent = '';

  const res = await fetch(`${API}/secrets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, value })
  });
  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    return;
  }

  document.getElementById('secret-name').value = '';
  document.getElementById('secret-value').value = '';
  loadSecrets();
});

async function deleteSecret(id) {
  if (!confirm('Delete this secret?')) return;
  const res = await fetch(`${API}/secrets/${id}`, { method: 'DELETE' });
  if (res.ok) {
    loadSecrets();
  }
}

//  Link Modal 

let modalRepoId = null;

async function openLinkModal(repoId, repoUrl) {
  modalRepoId = repoId;
  document.getElementById('modal-repo-label').textContent = repoUrl;

  const res = await fetch(`${API}/secrets`);
  const secrets = await res.json();

  const select = document.getElementById('modal-secret-select');
  if (secrets.length === 0) {
    select.innerHTML = '<option disabled>No secrets available</option>';
  } else {
    select.innerHTML = secrets.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  document.getElementById('link-modal').classList.remove('hidden');
}

document.getElementById('modal-cancel').addEventListener('click', function() {
  document.getElementById('link-modal').classList.add('hidden');
  modalRepoId = null;
});

document.getElementById('modal-confirm').addEventListener('click', async function() {
  const secretId = document.getElementById('modal-secret-select').value;
  if (!secretId) return;

  const res = await fetch(`${API}/repositories/${modalRepoId}/secret`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretId: Number(secretId) })
  });

  if (res.ok) {
    document.getElementById('link-modal').classList.add('hidden');
    modalRepoId = null;
    loadRepositories();
  }
});

//  Init 

loadRepositories();
loadSecrets();
