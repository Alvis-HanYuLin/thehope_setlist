import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const r = await ytSearch(q);
    // Return only the top 5 video results
    const videos = r.videos.slice(0, 5).map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      author: v.author.name,
      duration: v.timestamp
    }));
    return NextResponse.json({ results: videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
