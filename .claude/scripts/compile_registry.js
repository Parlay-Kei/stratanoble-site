const fs = require('fs');
const path = require('path');

const REPOS = [
    'C:\\Dev\\Direct-Cuts',
    'C:\\Dev\\DirectCuts-iOS',
    'C:\\Dev\\DSLV',
    'C:\\Dev\\msaudreys-house',
    'C:\\Dev\\StrataNoble',
    'C:\\Dev\\.claude-anx' // Include the system folder itself
];

const IGNORE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.vscode', 'tmp', 'bower_components'
]);

const REGISTRY_OUT = 'C:\\Dev\\.claude-anx\\registry\\anx_registry.compiled.json';
const REPORT_OUT = 'C:\\Dev\\.claude-anx\\registry\\REGISTRY_DIFF_REPORT_V1.md';

const SYSTEM_AGENTS = [
    { id: 'ocs', name: 'OCS (Orchestrator)', role: 'Orchestration', source: 'System' },
    { id: 'qa', name: 'QA Gatekeeper', role: 'Quality Assurance', source: 'System' },
    { id: 'legal', name: 'Legal Ops', role: 'Legal', source: 'System' },
    { id: 'cfo', name: 'CFO/Econ', role: 'Finance', source: 'System' }
];

const registry = {
    generatedAt: new Date().toISOString(),
    agents: [...SYSTEM_AGENTS],
    skills: [],
    workflows: []
};

function walk(dir, repoName) {
    let list;
    try {
        list = fs.readdirSync(dir);
    } catch (e) {
        console.warn(`Skipping ${dir}: ${e.message}`);
        return;
    }

    for (const item of list) {
        const fullPath = path.join(dir, item);
        let stats;
        try {
            stats = fs.statSync(fullPath);
        } catch (e) { continue; }

        if (stats.isDirectory()) {
            if (IGNORE_DIRS.has(item)) continue;
            walk(fullPath, repoName);
        } else {
            // Check for Agents
            if (item.endsWith('.agent.md')) {
                registry.agents.push({
                    id: path.basename(item, '.agent.md'),
                    name: item,
                    path: fullPath,
                    repo: repoName
                });
            }
            // Check for Skills
            if (item === 'SKILL.md') {
                const skillName = path.basename(path.dirname(fullPath));
                registry.skills.push({
                    id: skillName,
                    path: path.dirname(fullPath),
                    definitionFile: fullPath,
                    repo: repoName
                });
            }
            // Check for Workflows
            // Assuming workflows are in .agent/workflows/
            if (fullPath.includes('.agent') && fullPath.includes('workflows') && item.endsWith('.md')) {
                registry.workflows.push({
                    id: path.basename(item, '.md'),
                    path: fullPath,
                    repo: repoName
                });
            }
        }
    }
}

console.log("Starting Registry Compilation...");

for (const repo of REPOS) {
    if (fs.existsSync(repo)) {
        console.log(`Scanning ${repo}...`);
        walk(repo, path.basename(repo));
    } else {
        console.warn(`Repo not found: ${repo}`);
    }
}

// Write Registry
fs.writeFileSync(REGISTRY_OUT, JSON.stringify(registry, null, 2));
console.log(`Registry written to ${REGISTRY_OUT}`);

// Generate Report
const reportLines = [
    `# Registry Diff Report V1`,
    `Generated: ${registry.generatedAt}`,
    ``,
    `## Summary`,
    `- Agents Found: ${registry.agents.length}`,
    `- Skills Found: ${registry.skills.length}`,
    `- Workflows Found: ${registry.workflows.length}`,
    ``,
    `## Agents`,
    ...registry.agents.map(a => `- **${a.name}** (${a.source || a.repo})`),
    ``,
    `## Skills`,
    ...registry.skills.map(s => `- **${s.id}** in ${s.repo}`),
    ``,
    `## Workflows`,
    ...registry.workflows.map(w => `- **${w.id}** in ${w.repo}`)
];

fs.writeFileSync(REPORT_OUT, reportLines.join('\n'));
console.log(`Report written to ${REPORT_OUT}`);
