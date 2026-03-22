import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('Missing YOUTUBE_API_KEY environment variable');
    return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
  }

  try {
    // 1. Search for videos to get video IDs
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    
    if (searchData.error) {
      console.error('YouTube API Error:', searchData.error);
      return NextResponse.json({ error: 'YouTube API Error' }, { status: 500 });
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    // 2. Fetch video details to get duration
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
    );
    const detailsData = await detailsRes.json();
    
    // Parse duration helper (ISO 8601 to human readable)
    const parseDuration = (pt: string) => {
      const match = pt.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return pt;
      const h = match[1] ? parseInt(match[1]) : 0;
      const m = match[2] ? parseInt(match[2]) : 0;
      const s = match[3] ? parseInt(match[3]) : 0;
      if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const durationMap: Record<string, string> = {};
    if (detailsData.items) {
      detailsData.items.forEach((item: any) => {
        durationMap[item.id] = parseDuration(item.contentDetails.duration);
      });
    }

    const results = searchData.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      // Decode HTML entities safely from the title
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      author: item.snippet.channelTitle,
      duration: durationMap[item.id.videoId] || ''
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('YouTube API fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube data' }, { status: 500 });
  }
}
