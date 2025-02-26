import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE, API_VERSION } from '@/components/constants';

export async function GET(request) {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  const { searchParams } = new URL(request.url);
  const torrentId = searchParams.get('torrent_id');
  const fileId = searchParams.get('file_id');
  const zipLink = searchParams.get('zip_link') === 'true';

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key is required' },
      { status: 400 },
    );
  }

  if (!torrentId) {
    return NextResponse.json(
      { success: false, error: 'Torrent ID is required' },
      { status: 400 },
    );
  }

  try {
    const queryParams = new URLSearchParams({
      token: apiKey,
      torrent_id: torrentId,
      ...(fileId && { file_id: fileId }),
      ...(zipLink && { zip_link: zipLink }),
    });
    const apiUrl = `${API_BASE}/${API_VERSION}/api/torrents/requestdl?${queryParams}`;
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching torrent download link:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
