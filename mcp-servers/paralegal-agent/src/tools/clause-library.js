/**
 * Clause Library Tool
 * Retrieves reusable contract clauses from database
 */

export async function getClauses(args, supabase) {
  const { topic, risk_profile, jurisdiction } = args;

  try {
    let query = supabase
      .from('clause_library')
      .select('*')
      .eq('topic', topic)
      .eq('is_active', true);

    if (risk_profile) {
      query = query.eq('risk_profile', risk_profile);
    }

    if (jurisdiction) {
      query = query.or(`jurisdiction.eq.${jurisdiction},jurisdiction.is.null`);
    }

    const { data, error } = await query.order('clause_name');

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
            clauses: data || [],
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
