# Proof Requirements Specification v1

**Version**: 1.0.0
**Effective**: 2026-01-20
**Owner**: QA Gatekeeper (A2)

---

## Purpose

This specification defines the schema and validation rules for proof requirements. All skill executions that claim completion MUST produce verifiable proof artifacts. No "pass with warnings" allowed - missing proof = FAIL.

---

## 1. Proof Requirements Schema

### 1.1 Skill-Level Definition

Each skill MUST define its proof requirements in frontmatter:

```yaml
---
name: example-ops
proof_requirements:
  required_files:
    - path: "screenshots/{{timestamp}}_action_complete.png"
      type: "image/png"
      min_bytes: 10000
      description: "Screenshot showing completed action"
    - path: "outputs/{{ticket_id}}_result.json"
      type: "application/json"
      min_bytes: 100
      description: "Structured output data"

  required_links:
    - url_pattern: "https://example.com/resource/{{id}}"
      description: "Link to created resource"
      must_resolve: true

  required_metadata:
    - key: "execution_id"
      type: "string"
      pattern: "^EXE-[0-9]{13}$"
    - key: "duration_ms"
      type: "number"
      min: 0
    - key: "status"
      type: "enum"
      values: ["success", "partial", "failed"]

  proof_level: "standard"  # minimal | standard | strict
---
```

### 1.2 File Requirement Schema

```typescript
interface FileRequirement {
  path: string;           // Path pattern with {{variables}}
  type: MimeType;         // Expected MIME type
  min_bytes: number;      // Minimum file size (prevents empty files)
  max_bytes?: number;     // Optional maximum size
  description: string;    // Human-readable purpose
  hash_algorithm?: 'sha256' | 'md5';  // Optional integrity check
  expected_hash?: string; // Optional expected hash
}

type MimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'video/webm'
  | 'video/mp4'
  | 'application/json'
  | 'application/pdf'
  | 'text/markdown'
  | 'text/plain';
```

### 1.3 Link Requirement Schema

```typescript
interface LinkRequirement {
  url_pattern: string;    // URL pattern with {{variables}}
  description: string;    // Human-readable purpose
  must_resolve: boolean;  // If true, HTTP HEAD must return 2xx
  expected_status?: number[];  // Acceptable status codes
  timeout_ms?: number;    // Resolution timeout (default 5000)
}
```

### 1.4 Metadata Requirement Schema

```typescript
interface MetadataRequirement {
  key: string;            // Metadata field name
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array';
  pattern?: string;       // Regex pattern for strings
  min?: number;           // Minimum for numbers
  max?: number;           // Maximum for numbers
  values?: string[];      // Valid values for enums
  required: boolean;      // Default true
}
```

---

## 2. Proof Levels

### 2.1 Minimal

For low-risk, internal operations:
- Receipt markdown file required
- Exit status required
- No screenshot/video required

```yaml
proof_level: "minimal"
required_files:
  - path: "receipts/{{execution_id}}.md"
    type: "text/markdown"
    min_bytes: 100
```

### 2.2 Standard (Default)

For most operations:
- Receipt markdown file required
- At least one screenshot OR structured output
- Execution metadata required

```yaml
proof_level: "standard"
required_files:
  - path: "receipts/{{execution_id}}.md"
    type: "text/markdown"
    min_bytes: 100
  - path: "outputs/{{execution_id}}.json"
    type: "application/json"
    min_bytes: 50
required_metadata:
  - key: "execution_id"
    type: "string"
  - key: "status"
    type: "enum"
    values: ["success", "partial", "failed"]
```

### 2.3 Strict

For high-risk operations (deployments, financial, external-facing):
- Receipt markdown file required
- Screenshot evidence required
- Video recording for UI operations
- All links must resolve
- Hash verification on critical files

```yaml
proof_level: "strict"
required_files:
  - path: "screenshots/{{timestamp}}_before.png"
    type: "image/png"
    min_bytes: 10000
  - path: "screenshots/{{timestamp}}_after.png"
    type: "image/png"
    min_bytes: 10000
  - path: "recordings/{{execution_id}}.webm"
    type: "video/webm"
    min_bytes: 100000
  - path: "receipts/{{execution_id}}.md"
    type: "text/markdown"
    min_bytes: 500
required_links:
  - url_pattern: "{{deployed_url}}"
    must_resolve: true
    expected_status: [200]
```

---

## 3. Validation Rules

### 3.1 File Validation

```javascript
async function validateFile(requirement, actualPath) {
  const result = {
    requirement,
    actualPath,
    passed: false,
    errors: []
  };

  // 1. File existence
  if (!fs.existsSync(actualPath)) {
    result.errors.push(`File not found: ${actualPath}`);
    return result;
  }

  // 2. File size
  const stats = fs.statSync(actualPath);
  if (stats.size < requirement.min_bytes) {
    result.errors.push(
      `File too small: ${stats.size} bytes < required ${requirement.min_bytes} bytes`
    );
    return result;
  }
  if (requirement.max_bytes && stats.size > requirement.max_bytes) {
    result.errors.push(
      `File too large: ${stats.size} bytes > max ${requirement.max_bytes} bytes`
    );
    return result;
  }

  // 3. MIME type validation
  const detectedType = await detectMimeType(actualPath);
  if (detectedType !== requirement.type) {
    result.errors.push(
      `Wrong file type: detected ${detectedType}, expected ${requirement.type}`
    );
    return result;
  }

  // 4. Hash verification (if specified)
  if (requirement.expected_hash) {
    const actualHash = await computeHash(actualPath, requirement.hash_algorithm);
    if (actualHash !== requirement.expected_hash) {
      result.errors.push(
        `Hash mismatch: ${actualHash} !== ${requirement.expected_hash}`
      );
      return result;
    }
  }

  result.passed = true;
  return result;
}
```

### 3.2 Link Validation

```javascript
async function validateLink(requirement, actualUrl) {
  const result = {
    requirement,
    actualUrl,
    passed: false,
    errors: []
  };

  if (!requirement.must_resolve) {
    result.passed = true;
    return result;
  }

  try {
    const response = await fetch(actualUrl, {
      method: 'HEAD',
      timeout: requirement.timeout_ms || 5000
    });

    const expectedStatuses = requirement.expected_status || [200, 201, 204];
    if (!expectedStatuses.includes(response.status)) {
      result.errors.push(
        `Unexpected status: ${response.status}, expected one of ${expectedStatuses.join(', ')}`
      );
      return result;
    }

    result.passed = true;
  } catch (err) {
    result.errors.push(`Failed to resolve: ${err.message}`);
  }

  return result;
}
```

### 3.3 Metadata Validation

```javascript
function validateMetadata(requirement, actualValue) {
  const result = {
    requirement,
    actualValue,
    passed: false,
    errors: []
  };

  // Check presence
  if (actualValue === undefined || actualValue === null) {
    if (requirement.required !== false) {
      result.errors.push(`Missing required metadata: ${requirement.key}`);
      return result;
    }
    result.passed = true;
    return result;
  }

  // Type validation
  switch (requirement.type) {
    case 'string':
      if (typeof actualValue !== 'string') {
        result.errors.push(`${requirement.key}: expected string, got ${typeof actualValue}`);
        return result;
      }
      if (requirement.pattern) {
        const regex = new RegExp(requirement.pattern);
        if (!regex.test(actualValue)) {
          result.errors.push(`${requirement.key}: does not match pattern ${requirement.pattern}`);
          return result;
        }
      }
      break;

    case 'number':
      if (typeof actualValue !== 'number') {
        result.errors.push(`${requirement.key}: expected number, got ${typeof actualValue}`);
        return result;
      }
      if (requirement.min !== undefined && actualValue < requirement.min) {
        result.errors.push(`${requirement.key}: ${actualValue} < min ${requirement.min}`);
        return result;
      }
      if (requirement.max !== undefined && actualValue > requirement.max) {
        result.errors.push(`${requirement.key}: ${actualValue} > max ${requirement.max}`);
        return result;
      }
      break;

    case 'enum':
      if (!requirement.values.includes(actualValue)) {
        result.errors.push(
          `${requirement.key}: "${actualValue}" not in allowed values [${requirement.values.join(', ')}]`
        );
        return result;
      }
      break;

    case 'boolean':
      if (typeof actualValue !== 'boolean') {
        result.errors.push(`${requirement.key}: expected boolean, got ${typeof actualValue}`);
        return result;
      }
      break;
  }

  result.passed = true;
  return result;
}
```

---

## 4. Failure Behavior

### 4.1 Hard Gate Rules

1. **ANY missing required file = FAIL**
2. **ANY file below min_bytes = FAIL**
3. **ANY wrong MIME type = FAIL**
4. **ANY unresolvable required link = FAIL**
5. **ANY missing required metadata = FAIL**

### 4.2 No Warnings Allowed

```javascript
// WRONG - This is not allowed
if (validation.errors.length > 0) {
  return { status: 'passed_with_warnings', warnings: validation.errors };
}

// CORRECT - Hard fail
if (validation.errors.length > 0) {
  return {
    status: 'FAILED',
    errors: validation.errors,
    message: 'Proof validation failed - pipeline stopped'
  };
}
```

### 4.3 Pipeline Stop Behavior

When proof validation fails:
1. Execution halts immediately
2. No downstream skills are invoked
3. Receipt is generated with FAILED status
4. All errors are listed explicitly
5. Rollback instructions are provided (if applicable)

---

## 5. Run Manifest Schema

Every skill execution MUST produce a run manifest:

```typescript
interface RunManifest {
  // Identification
  execution_id: string;
  skill_id: string;
  action: string;

  // Timing
  started_at: string;      // ISO 8601
  completed_at: string;    // ISO 8601
  duration_ms: number;

  // Inputs
  inputs: {
    directive?: string;
    params: Record<string, any>;
    context: Record<string, any>;
  };

  // Outputs
  outputs: {
    files: Array<{
      path: string;
      type: string;
      size_bytes: number;
      hash?: string;
    }>;
    links: Array<{
      url: string;
      description: string;
    }>;
    data: Record<string, any>;
  };

  // Status
  exit_status: 'success' | 'partial' | 'failed';
  exit_code: number;
  error_message?: string;

  // Proof validation
  proof_validation: {
    required_level: 'minimal' | 'standard' | 'strict';
    checks_performed: number;
    checks_passed: number;
    checks_failed: number;
    failures: Array<{
      check_type: 'file' | 'link' | 'metadata';
      requirement: string;
      error: string;
    }>;
    overall_status: 'PASSED' | 'FAILED';
  };
}
```

---

## 6. Integration Points

### 6.1 skill-executor.js

Must emit run manifest after each execution:
```javascript
const manifest = generateRunManifest(execution);
await fs.writeFile(
  `${PROOFS_DIR}/${manifest.execution_id}_manifest.json`,
  JSON.stringify(manifest, null, 2)
);
```

### 6.2 qa-gatekeeper-ops

Must validate proof requirements:
```javascript
const validation = await validateProofRequirements(
  skill.proof_requirements,
  manifest.outputs
);
if (validation.overall_status === 'FAILED') {
  throw new ProofValidationError(validation.failures);
}
```

### 6.3 oc_do.js

Must stop pipeline on failure:
```javascript
const result = await executeSkill(skill, action, params);
if (result.proof_validation.overall_status === 'FAILED') {
  console.error('[oc_do] PROOF VALIDATION FAILED - STOPPING PIPELINE');
  process.exit(1);
}
```

---

## 7. Example Proof Requirements by Skill

### 7.1 platform-ops (deploy action)

```yaml
proof_requirements:
  proof_level: "strict"
  required_files:
    - path: "screenshots/deploy_{{timestamp}}_before.png"
      type: "image/png"
      min_bytes: 10000
      description: "Pre-deployment state"
    - path: "screenshots/deploy_{{timestamp}}_after.png"
      type: "image/png"
      min_bytes: 10000
      description: "Post-deployment verification"
    - path: "outputs/deploy_{{execution_id}}.json"
      type: "application/json"
      min_bytes: 200
      description: "Deployment details"
  required_links:
    - url_pattern: "{{deployed_url}}"
      must_resolve: true
      expected_status: [200]
      description: "Deployed application URL"
  required_metadata:
    - key: "commit_sha"
      type: "string"
      pattern: "^[a-f0-9]{40}$"
    - key: "environment"
      type: "enum"
      values: ["preview", "staging", "production"]
```

### 7.2 bookkeeper-ops (sync action)

```yaml
proof_requirements:
  proof_level: "standard"
  required_files:
    - path: "outputs/sync_{{timestamp}}.json"
      type: "application/json"
      min_bytes: 100
      description: "Sync results summary"
  required_metadata:
    - key: "transactions_synced"
      type: "number"
      min: 0
    - key: "source"
      type: "enum"
      values: ["stripe", "plaid", "manual"]
```

### 7.3 browser-operator-ops (ui action)

```yaml
proof_requirements:
  proof_level: "strict"
  required_files:
    - path: "screenshots/{{action}}_{{timestamp}}_step_*.png"
      type: "image/png"
      min_bytes: 10000
      description: "Step-by-step screenshots"
    - path: "recordings/{{execution_id}}.webm"
      type: "video/webm"
      min_bytes: 50000
      description: "Full session recording"
  required_metadata:
    - key: "browser"
      type: "string"
    - key: "viewport"
      type: "string"
      pattern: "^[0-9]+x[0-9]+$"
```

---

## Appendix: MIME Type Detection

```javascript
const MAGIC_BYTES = {
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // + "WEBP" at offset 8
  'video/webm': [0x1A, 0x45, 0xDF, 0xA3],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/json': null, // Validate by parsing
  'text/markdown': null,    // Validate by extension + content
};

async function detectMimeType(filePath) {
  const buffer = Buffer.alloc(12);
  const fd = await fs.open(filePath, 'r');
  await fd.read(buffer, 0, 12, 0);
  await fd.close();

  for (const [type, magic] of Object.entries(MAGIC_BYTES)) {
    if (magic && magic.every((b, i) => buffer[i] === b)) {
      return type;
    }
  }

  // Fallback to extension-based detection
  const ext = path.extname(filePath).toLowerCase();
  const extMap = {
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain'
  };

  return extMap[ext] || 'application/octet-stream';
}
```

---

*End of Specification*
