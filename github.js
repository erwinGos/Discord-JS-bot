const dotenv = require('dotenv');
dotenv.config();

async function CreateRepository(repoName, description) {
  // Importation dynamique de Octokit
  const { Octokit } = await import('@octokit/rest');

  // Configure Octokit avec le token d'accès personnel
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  try {
    const { data } = await octokit.request('POST /orgs/{org}/repos', {
      org: 'DuneSolutionsFrance',
      name: repoName,
      description: description,
      homepage: 'https://github.com',
      'private': true,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { CreateRepository };
