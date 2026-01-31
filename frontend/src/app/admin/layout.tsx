'use client';

// app/admin/layout.tsx - FULLY CLIENT-SIDE

import '../../styles/components_styles/admin/Admin.css';
import '../../styles/components_styles/admin/Dashboard.css';
import '../../styles/components_styles/auth/login.css';
import '../../styles/components_styles/news/News.css';
import '../../styles/components_styles/news/Retrieval.css';
import '../../styles/components_styles/admin/Users.css';
import '../../styles/components_styles/admin/AdminChat.css';
import '../../styles/components_styles/admin/Categories.css';
import '../../styles/components_styles/admin/Systemservices.css';
import '../../styles/components_styles/admin/Profile.css';
import '../../styles/components_styles/admin/Cache.css';
import '../../styles/components_styles/admin/Analytics.css';
import '../../styles/components_styles/admin/UserRoles.css';
import '../../styles/components_styles/admin/PostsIsolation.css';
import '../../styles/components_styles/admin/Pending.css';
import '../../styles/components_styles/admin/ManageQuotes.css';
import '../../styles/components_styles/admin/CreateQuotes.css';
import '../../styles/components_styles/admin/AdminVideos.css';
import '../../styles/components_styles/admin/SocialVideosManager.css';
import '../../styles/components_styles/admin/adminmessages.css';
import '../../styles/components_styles/admin/videosretrieval.css';
import '../../styles/components_styles/admin/posts/CoreLayout.css';
import '../../styles/components_styles/admin/posts/ImageUpload.css';
import '../../styles/components_styles/admin/posts/EditorSocialLinks.css';
import '../../styles/components_styles/admin/posts/CategorySelection.css';

import AdminLayout from './AdminLayout';

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}