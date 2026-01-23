import json
import os
import datetime

ANX_ROOT = r"C:\Dev\.claude-anx"
POLICY_FILE = os.path.join(ANX_ROOT, "policies", "autonomy_policy.json")

class PolicyEngine:
    def __init__(self):
        self.policy = self._load_policy()
        
    def _load_policy(self):
        if not os.path.exists(POLICY_FILE):
            raise Exception(f"Policy file not found: {POLICY_FILE}")
        with open(POLICY_FILE, 'r') as f:
            return json.load(f)
            
    def check_kill_switch(self):
        # Reload policy to be responsive
        self.policy = self._load_policy()
        if self.policy.get('kill_switch', False):
            return True, "Kill Switch Engaged"
        return False, None
        
    def check_money_cap(self, amount_usd, daily_spend_so_far):
        caps = self.policy.get('caps', {}).get('money', {})
        tx_limit = caps.get('transaction_limit_usd', 0)
        daily_limit = caps.get('daily_limit_usd', 0)
        
        if amount_usd > tx_limit:
            return False, f"Transaction amount {amount_usd} exceeds limit {tx_limit}"
            
        if (daily_spend_so_far + amount_usd) > daily_limit:
            return False, f"Daily spend {daily_spend_so_far + amount_usd} would exceed limit {daily_limit}"
            
        return True, None
        
    def is_repo_allowed(self, repo_path):
        allowed = self.policy.get('allowlists', {}).get('repos', [])
        # Normalize paths
        norm_repo = os.path.normpath(repo_path)
        for p in allowed:
            if norm_repo.startswith(os.path.normpath(p)):
                return True
        return False

    def is_tool_allowed(self, tool_name):
        return tool_name in self.policy.get('allowlists', {}).get('safe_tools', [])
