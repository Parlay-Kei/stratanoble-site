# Kill Switch and Breakglass Policy V1

## 1. Kill Switch Mechanism

The Autonomous Execution System (ANX) is protected by a hard "Kill Switch" that
immediately halts all active runners.

### Mechanism

- **Source of Truth**: `C:\Dev\.claude-anx\policies\autonomy_policy.json`
- **Field**: `"kill_switch": boolean`
- **Behavior**:
  - `false` (Default): System operates normally.
  - `true`: All runners enter a HALTED state immediately upon next poll cycle
    (within 5-10 seconds). No new jobs are picked up. Active jobs may be
    interrupted or fail gracefully depending on the implementation.

### Triggering

Any authorized operator can trigger the kill switch by:

1. Editing `autonomy_policy.json` to set `"kill_switch": true`.
2. Running the script `scripts/eng_kill.py` (if available) or manually updating
   the JSON.

## 2. Breakglass Procedure

In the event of a system failure, rogue agent behavior, or security incident,
the "Breakglass" procedure allows humans to intervene.

### Conditions for Breakglass

- Unexpected financial spend velocity.
- Destructive file operations detected on unauthorized paths.
- Loop behavior (agent stuck in tight loop consuming resources).

### Procedure Steps

1. **KILL**: Immediately enable the Kill Switch (as above).
2. **VERIFY**: Check logs in `C:\Dev\.claude-anx\logs\` to confirm all runners
   have emitted "HALTED".
3. **ISOLATE**: Revoke API keys if external abuse is suspected.
4. **DEBUG**: Analyze the `runs/` artifacts to identify the faulty job/agent.
5. **FIX**: Patch the policy, code, or state.
6. **RESTORE**:
   - Reset `"kill_switch": false`.
   - Monitor the first 5 jobs closely.

## 3. Receipt Requirements

Every Kill Switch activation must be logged. A receipt should include:

- Timestamp of activation.
- Operator ID.
- Reason for activation.
- Confirmation of system halt (logs).
