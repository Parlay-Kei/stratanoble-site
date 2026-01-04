#!/usr/bin/env node
/**
 * GitHub Token Validation Script
 * Tests token validity and permissions
 */

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

console.log(chalk.bold('\n🔍 GitHub Token Diagnostics\n'));

// Check if token is set
if (!token) {
  console.log(chalk.red('❌ GITHUB_TOKEN is not set in .env file'));
  process.exit(1);
}

console.log(chalk.gray(`Token format: ${token.substring(0, 20)}...`));
console.log(chalk.gray(`Repository: ${owner}/${repo}\n`));

const octokit = new Octokit({ auth: token });

// Test 1: Authenticate user
console.log(chalk.bold('1. Testing Authentication...'));
try {
  const { data: user } = await octokit.rest.users.getAuthenticated();
  console.log(chalk.green(`   ✅ Authenticated as: ${user.login}`));
  console.log(chalk.gray(`   Name: ${user.name || 'N/A'}`));
  console.log(chalk.gray(`   Type: ${user.type}`));
} catch (error) {
  console.log(chalk.red(`   ❌ Authentication failed: ${error.status} ${error.message}`));
  if (error.status === 401) {
    console.log(chalk.yellow('\n   💡 Possible issues:'));
    console.log(chalk.yellow('      - Token is expired or revoked'));
    console.log(chalk.yellow('      - Token format is incorrect'));
    console.log(chalk.yellow('      - Token was deleted from GitHub'));
    console.log(chalk.yellow('\n   🔧 Solution:'));
    console.log(chalk.cyan('      1. Go to https://github.com/settings/tokens'));
    console.log(chalk.cyan('      2. Generate a new token (classic or fine-grained)'));
    console.log(chalk.cyan('      3. For classic tokens, select scopes: repo, workflow'));
    console.log(chalk.cyan('      4. For fine-grained tokens, grant repository access'));
    console.log(chalk.cyan('      5. Update .env file with the new token'));
  }
  process.exit(1);
}

// Test 2: Check repository access
console.log(chalk.bold('\n2. Testing Repository Access...'));
try {
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo
  });
  console.log(chalk.green(`   ✅ Repository accessible: ${repoData.full_name}`));
  console.log(chalk.gray(`   Visibility: ${repoData.visibility}`));
  console.log(chalk.gray(`   Default branch: ${repoData.default_branch}`));
} catch (error) {
  console.log(chalk.red(`   ❌ Repository access failed: ${error.status} ${error.message}`));
  if (error.status === 404) {
    console.log(chalk.yellow(`   💡 Repository ${owner}/${repo} not found or no access`));
  } else if (error.status === 403) {
    console.log(chalk.yellow('   💡 Token lacks repository read permissions'));
  }
}

// Test 3: Check Actions permissions
console.log(chalk.bold('\n3. Testing Actions Permissions...'));
try {
  const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
    owner,
    repo
  });
  console.log(chalk.green(`   ✅ Actions access: ${workflows.total_count} workflows found`));
} catch (error) {
  console.log(chalk.red(`   ❌ Actions access failed: ${error.status} ${error.message}`));
  if (error.status === 403) {
    console.log(chalk.yellow('   💡 Token lacks Actions read permissions'));
    console.log(chalk.yellow('   🔧 For fine-grained tokens, grant "Actions: Read" permission'));
  }
}

// Test 4: Check Secrets permissions
console.log(chalk.bold('\n4. Testing Secrets Permissions...'));
try {
  const { data: secrets } = await octokit.rest.actions.listRepoSecrets({
    owner,
    repo
  });
  console.log(chalk.green(`   ✅ Secrets access: ${secrets.total_count} secrets found`));
} catch (error) {
  console.log(chalk.red(`   ❌ Secrets access failed: ${error.status} ${error.message}`));
  if (error.status === 403) {
    console.log(chalk.yellow('   💡 Token lacks Secrets read permissions'));
    console.log(chalk.yellow('   🔧 For fine-grained tokens, grant "Secrets: Read" permission'));
  }
}

// Summary
console.log(chalk.bold('\n✨ Diagnostics Complete\n'));
console.log(chalk.gray('If all tests passed, the agent should work correctly.'));
console.log(chalk.gray('If any failed, follow the suggested fixes above.\n'));
