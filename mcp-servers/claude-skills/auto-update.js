const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const os = require('os');

class SkillsAutoUpdater {
  constructor(config = {}) {
    this.githubRepo = config.githubRepo || 'Parlay-Kei/stratanoble-site';
    this.branch = config.branch || 'main';
    this.skillsPath = config.skillsPath || 'mcp-servers/claude-skills';
    this.localCache = config.localCache || path.join(os.homedir(), '.claude', 'skills');
    this.updateInterval = config.updateInterval || 6 * 60 * 60 * 1000; // 6 hours
    this.manifest = null;
    this.updateTimer = null;
  }

  async initialize() {
    try {
      // Ensure local cache directory exists
      await fs.mkdir(this.localCache, { recursive: true });
      console.log('[skills-updater] Cache directory:', this.localCache);
      
      // Load or fetch manifest
      await this.loadManifest();
      
      // Start auto-update timer
      this.startAutoUpdate();
      
      console.log('[skills-updater] Initialized with', this.manifest.skills.length, 'skills');
    } catch (error) {
      console.error('[skills-updater] Initialization failed:', error);
      throw error;
    }
  }

  async loadManifest() {
    const manifestUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/skills-manifest.json`;
    
    try {
      console.log('[skills-updater] Fetching manifest from:', manifestUrl);
      const data = await this.fetchFromGitHub(manifestUrl);
      this.manifest = JSON.parse(data);
      
      // Cache manifest locally
      await fs.writeFile(
        path.join(this.localCache, 'manifest.json'),
        JSON.stringify(this.manifest, null, 2)
      );
      
      console.log('[skills-updater] Manifest loaded successfully');
    } catch (error) {
      console.error('[skills-updater] Failed to load remote manifest:', error.message);
      
      // Try to load from local cache
      try {
        const cached = await fs.readFile(path.join(this.localCache, 'manifest.json'), 'utf8');
        this.manifest = JSON.parse(cached);
        console.log('[skills-updater] Using cached manifest');
      } catch (cacheError) {
        throw new Error('No manifest available (remote or cached): ' + cacheError.message);
      }
    }
  }

  async fetchFromGitHub(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  async checkForUpdates() {
    console.log('[skills-updater] Checking for updates...');
    
    const remoteManifestUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/skills-manifest.json`;
    
    try {
      const remoteData = await this.fetchFromGitHub(remoteManifestUrl);
      const remoteManifest = JSON.parse(remoteData);
      
      const updates = [];
      
      for (const remoteSkill of remoteManifest.skills) {
        const localSkill = this.manifest.skills.find(s => s.name === remoteSkill.name);
        
        if (!localSkill) {
          updates.push({ action: 'install', skill: remoteSkill });
        } else if (remoteSkill.version !== localSkill.version) {
          updates.push({ 
            action: 'update', 
            skill: remoteSkill, 
            from: localSkill.version,
            to: remoteSkill.version
          });
        }
      }
      
      if (updates.length > 0) {
        console.log('[skills-updater] Found', updates.length, 'updates');
        await this.applyUpdates(updates);
      } else {
        console.log('[skills-updater] All skills up to date');
      }
      
      return updates;
    } catch (error) {
      console.error('[skills-updater] Update check failed:', error.message);
      return [];
    }
  }

  async applyUpdates(updates) {
    for (const update of updates) {
      const { action, skill, from, to } = update;
      
      try {
        const versionInfo = from ? `(${from} → ${to})` : `(${skill.version})`;
        console.log(`[skills-updater] ${action}: ${skill.name} ${versionInfo}`);
        
        const skillUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/${skill.path}`;
        const skillContent = await this.fetchFromGitHub(skillUrl);
        
        // Calculate and verify hash (if not pending)
        if (skill.hash !== 'sha256:pending') {
          const actualHash = 'sha256:' + crypto.createHash('sha256').update(skillContent).digest('hex');
          if (actualHash !== skill.hash) {
            console.error(`[skills-updater] Hash mismatch for ${skill.name}`);
            console.error(`  Expected: ${skill.hash}`);
            console.error(`  Actual:   ${actualHash}`);
            continue;
          }
        }
        
        // Save skill to local cache
        const skillDir = path.join(this.localCache, skill.name);
        await fs.mkdir(skillDir, { recursive: true });
        await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);
        
        // Update local manifest
        const skillIndex = this.manifest.skills.findIndex(s => s.name === skill.name);
        if (skillIndex >= 0) {
          this.manifest.skills[skillIndex] = skill;
        } else {
          this.manifest.skills.push(skill);
        }
        
        console.log(`[skills-updater] ✓ ${skill.name} ${action}ed successfully`);
      } catch (error) {
        console.error(`[skills-updater] Failed to ${action} ${skill.name}:`, error.message);
      }
    }
    
    // Save updated manifest
    await fs.writeFile(
      path.join(this.localCache, 'manifest.json'),
      JSON.stringify(this.manifest, null, 2)
    );
  }

  startAutoUpdate() {
    // Check on startup
    this.checkForUpdates().catch(err => {
      console.error('[skills-updater] Startup update check failed:', err);
    });
    
    // Check periodically
    this.updateTimer = setInterval(() => {
      this.checkForUpdates().catch(err => {
        console.error('[skills-updater] Periodic update check failed:', err);
      });
    }, this.updateInterval);
    
    console.log(`[skills-updater] Auto-update enabled (every ${this.updateInterval / 1000 / 60 / 60}h)`);
  }

  async getSkill(skillName) {
    const skill = this.manifest.skills.find(s => s.name === skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }
    
    const skillPath = path.join(this.localCache, skillName, 'SKILL.md');
    
    try {
      return await fs.readFile(skillPath, 'utf8');
    } catch {
      // Skill not cached - fetch it
      console.log(`[skills-updater] Skill ${skillName} not cached - fetching...`);
      await this.applyUpdates([{ action: 'install', skill }]);
      return await fs.readFile(skillPath, 'utf8');
    }
  }

  async listSkills() {
    return this.manifest.skills.map(s => ({
      name: s.name,
      version: s.version,
      autoUpdate: s.autoUpdate,
      description: s.description,
      capabilities: s.capabilities
    }));
  }

  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

// Singleton instance
let updaterInstance = null;

async function getUpdater(config) {
  if (!updaterInstance) {
    updaterInstance = new SkillsAutoUpdater(config);
    await updaterInstance.initialize();
  }
  return updaterInstance;
}

module.exports = { SkillsAutoUpdater, getUpdater };
