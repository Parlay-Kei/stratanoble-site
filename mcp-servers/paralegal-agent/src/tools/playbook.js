/**
 * Playbook Tool
 * Retrieves negotiation playbook rules
 */

export async function getPlaybookRules(args, supabase) {
  const { topic, jurisdiction } = args;

  try {
    let query = supabase
      .from('playbook_rules')
      .select('*')
      .eq('topic', topic)
      .eq('is_active', true);

    if (jurisdiction) {
      query = query.or(`jurisdiction.eq.${jurisdiction},jurisdiction.is.null`);
    }

    const { data, error } = await query.order('priority', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            topic,
            rules: data || [],
            count: data?.length || 0
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
