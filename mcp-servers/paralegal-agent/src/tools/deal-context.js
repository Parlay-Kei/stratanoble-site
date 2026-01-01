/**
 * Deal Context Tool
 * Retrieves deal intake data and client information
 *
 * IMPORTANT: Returns pinned template_version and playbook_version
 * These versions were locked when the deal was created to prevent contract drift.
 * Use these versions for all contract generation related to this deal.
 */

export async function getDealContext(args, supabase) {
  const { deal_id } = args;

  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', deal_id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(`Deal not found: ${deal_id}`);
    }

    // Extract version pinning info for clarity
    const versionInfo = {
      template_version: data.template_version,
      playbook_version: data.playbook_version,
      locked_at: data.locked_at,
      version_pinning_active: !!(data.template_version && data.playbook_version)
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            deal: data,
            version_pinning: versionInfo,
            notice: versionInfo.version_pinning_active
              ? 'This deal has pinned versions. Use the specified template_version and playbook_version for all contracts.'
              : 'Version pinning not set for this deal. Consider using latest versions or updating the deal.'
          }, null, 2)
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}
