# Mission Rules

## Mission Execution Protocol

### 1. Mission Structure
Every mission requires:
- Mission ID (format: DEPT-TASK-####)
- Clear ownership (department/role)
- Defined objective
- Specific method
- Measurable outputs
- Receipt generation

### 2. Mission Lifecycle

#### Initiation
1. Receive mission via Intake Packet
2. Generate Mission Packet
3. Validate prerequisites

#### Execution
1. Follow method exactly as specified
2. Generate all required outputs
3. Handle errors with clear documentation
4. Create checkpoint files if mission spans sessions

#### Completion
1. Verify all outputs exist
2. Generate receipt with proof
3. Update status tracking
4. Archive mission materials

### 3. Quality Gates

#### Pre-execution
- Mission packet must be approved
- Dependencies must be satisfied
- Resources must be available

#### During execution
- Regular status updates
- Error documentation
- Progress checkpoints

#### Post-execution
- Output validation
- Receipt generation
- Success criteria verification

### 4. Documentation Requirements

#### Mission Packet
Must include:
```
MISSION PACKET
Mission ID: [DEPT-TASK-####]
Owner: [Department/Role]
Objective: [Clear, measurable goal]
Method: [Step-by-step approach]
Outputs: [List of deliverables]
Dependencies: [Prerequisites]
Success Criteria: [Verification method]
```

#### Receipt Format
Must include:
```
# [MISSION-ID] Receipt

## Mission: [Name]
**Owner**: [Department]
**Status**: [COMPLETE/FAILED/PARTIAL]
**Timestamp**: [ISO-8601]

## Objective Achieved
[Description of what was accomplished]

## Outputs Delivered
- [x] [Output 1]
- [x] [Output 2]
- [ ] [Any failed outputs]

## Verification
[How success was verified]

## Notes
[Any deviations or issues]
```

### 5. Mission Categories

#### Bootstrap Missions
- Initialize system components
- Set up canonical structures
- Apply configurations

#### Verification Missions
- Test system behavior
- Validate outputs
- Ensure compliance

#### Research Missions
- Gather information
- Document findings
- Update knowledge base

#### Release Missions
- Package deliverables
- Generate release notes
- Tag versions

### 6. Failure Handling

#### Soft Failures
- Document issue in receipt
- Continue with remaining tasks
- Mark mission as PARTIAL

#### Hard Failures
- Stop execution immediately
- Generate failure receipt
- Escalate to user
- Require manual intervention

### 7. Inter-Mission Dependencies

#### Sequential Dependencies
- Mission B requires Mission A outputs
- Verified via receipt checking
- Clear handoff documentation

#### Parallel Execution
- Independent missions may run concurrently
- Resource conflicts must be avoided
- Merge results appropriately

### 8. Compliance Requirements

#### No em/en dash rule
- Never use em dash
- Never use en dash
- Use hyphen (-) only

#### File Path Standards
- Always use absolute paths
- Canonical location: C:\Dev\.claude-anx\
- Repository-specific paths under repo root

#### Git Operations
- Clear commit messages
- Mission ID in commit
- Tag format: [mission-category]-v[version]