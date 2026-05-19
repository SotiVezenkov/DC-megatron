const { decryptSecret } = require("../services/encryptionService");

function buildGitHubApiUrl(repositoryUrl) {
  const parsedUrl = new URL(repositoryUrl);
  const [owner, repo] = parsedUrl.pathname.split("/").filter(Boolean);

  return `https://api.github.com/repos/${owner}/${repo}`;
}

async function checkGitHubAccess(repository, secret) {
  const token = decryptSecret(secret.encrypted_value);
  const githubApiUrl = buildGitHubApiUrl(repository.url);

  const response = await fetch(githubApiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DC-Megatron",
    },
  });

  if (response.ok) {
    return {
      valid: true,
      statusCode: response.status,
      message: "Secret can access the repository",
    };
  }

  if (response.status === 401) {
    return {
      valid: false,
      statusCode: response.status,
      message: "Secret is invalid or expired",
    };
  }

  if (response.status === 403) {
    return {
      valid: false,
      statusCode: response.status,
      message: "Secret does not have permission to access this repository",
    };
  }

  if (response.status === 404) {
    return {
      valid: false,
      statusCode: response.status,
      message: "Repository was not found or the secret has no access to it",
    };
  }

  return {
    valid: false,
    statusCode: response.status,
    message: "GitHub access check failed",
  };
}

module.exports = {
  checkGitHubAccess,
};