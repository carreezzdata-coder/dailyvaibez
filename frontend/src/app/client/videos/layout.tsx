// app/client/videos/layout.tsx
import '../../../styles/SocialVideos.css';
import '../../../styles/Standardformatting.css';
import '../../../styles/zIndexSystem.css';
import '../../../styles/components_styles/news/Cookies.css';
import '../../../styles/components_styles/news/Horizontal.css';
import '../../../styles/components_styles/news/SearchNotifications.css';

import '../../../styles/components_styles/header/HeaderCore.css';
import '../../../styles/components_styles/header/StockTicker.css';
import '../../../styles/components_styles/header/SearchComponent.css';
import '../../../styles/components_styles/header/NotificationsComponent.css';




export const metadata = {
  title: 'Social Videos - Daily Vaibe',
  description: 'Watch the latest videos from across social media platforms',
  keywords: 'videos, social media, youtube, tiktok, instagram, facebook, twitter',
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}