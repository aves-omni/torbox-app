import { headers } from 'next/headers';
import { API_SEARCH_BASE } from '@/components/constants';

export async function GET(req) {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const searchUserEngines = searchParams.get('search_user_engines') === 'true';

  if (!query) {
    return new Response(
      JSON.stringify({ error: 'Query parameter is required' }),
      { status: 400 },
    );
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is required' }), {
      status: 401,
    });
  }

  try {
    const params = new URLSearchParams({
      metadata: true,
      check_cache: true,
      search_user_engines: searchUserEngines,
    });

    const res = await fetch(
      `${API_SEARCH_BASE}/usenet/search/${encodeURIComponent(query)}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Usenet search error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
