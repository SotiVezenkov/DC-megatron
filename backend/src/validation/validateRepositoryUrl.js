function validateRepositoryUrl(url) {
  if (!url || typeof url !== "string") {
    return {
      valid: false,
      message: "Repository URL is required",
    };
  }

  const trimmedUrl = url.trim();

  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch (error) {
    return {
      valid: false,
      message: "Repository URL must be a valid URL",
    };
  }

  if (parsedUrl.protocol !== "https:") {
    return {
      valid: false,
      message: "Repository URL must use HTTPS",
    };
  }

  if (parsedUrl.hostname !== "github.com") {
    return {
      valid: false,
      message: "Only GitHub repository URLs are supported for now",
    };
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

  if (pathParts.length !== 2) {
    return {
      valid: false,
      message: "Repository URL must follow the format https://github.com/owner/repository",
    };
  }

  const [owner, repository] = pathParts;

  const githubNamePattern = /^[a-zA-Z0-9._-]+$/;

  if (!githubNamePattern.test(owner) || !githubNamePattern.test(repository)) {
    return {
      valid: false,
      message: "Repository owner and name can only contain letters, numbers, dots, underscores, and hyphens",
    };
  }

  return {
    valid: true,
    normalizedUrl: `https://github.com/${owner}/${repository}`,
  };
}

module.exports = {
  validateRepositoryUrl,
};