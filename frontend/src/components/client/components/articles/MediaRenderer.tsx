import React from 'react';
import VideoEmbed from './VideoEmbed';
import SocialPostEmbed from './SocialPostEmbed';

interface ArticleMedia {
  kind: 'video' | 'post';
  video_url: string;
  platform: string;
  embed_code?: string;
  caption?: string;
  position: number;
  thumbnail_url?: string;
  author_name?: string;
  author_handle?: string;
}

interface MediaRendererProps {
  media: ArticleMedia;
}

export default function MediaRenderer({ media }: MediaRendererProps) {
  if (media.kind === 'video') {
    return <VideoEmbed video={media} />;
  }

  if (media.kind === 'post') {
    return <SocialPostEmbed post={media} />;
  }

  return (
    <div className="media-unexpected" style={{
      padding: '20px',
      background: 'var(--background-secondary)',
      borderRadius: '8px',
      textAlign: 'center',
      margin: '20px 0'
    }}>
      <p>Cannot render media</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Kind: {media.kind}, Platform: {media.platform}
      </p>
    </div>
  );
}