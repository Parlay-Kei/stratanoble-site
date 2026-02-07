#!/bin/bash
# Legal Ops Agent Invocation Script
# This script invokes the ANX Legal Ops agent for business plan analysis

cd /mnt/c/Dev/StrataNoble

echo "Invoking Legal Ops Agent..."
echo "Task: Create Series A investor-ready business plan"
echo "Context: StrataNoble business plan documents"
echo ""

node /mnt/c/Dev/.claude-anx/bin/anx-agent.js legal-ops \
  "Examine the Strata Noble Business Plan document and the codebase to create a professional business plan PDF structured for scaling long-term business strategy and operations to be reviewed by Series A round investors" \
  --context="/mnt/c/Dev/StrataNoble/ANX/02_Operating_Company_Strata_Noble_LLC"

echo ""
echo "Analysis complete. Check proof-packs directory for results."
