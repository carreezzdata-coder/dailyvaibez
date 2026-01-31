import React, { useState, useEffect } from 'react';
import CreateStage1 from './creators/CreateStage1';
import CreateStage2 from './creators/CreateStage2';
import CreateStage3 from './creators/CreateStage3';
import { usePermissions } from './adminhooks/usePermissions';
import { useSession } from '@/components/includes/Session';

interface User {
  admin_id: number;
  first_name: string;
  last_name: string;
  role: string;
}

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description?: string;
  color?: string;
  icon?: string;
  order_index?: number;
  group?: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  description: string;
  color: string;
  parent_category: {
    category_id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  } | null;
  categories: Category[];
  mainSlug: string;
}

interface ImageFile {
  id: string;
  file?: File;
  image_id?: number;
  preview: string;
  caption: string;
  order: number;
  isFeatured: boolean;
  isUploading?: boolean;
  hasWatermark?: boolean;
  isExisting?: boolean;
}

interface SocialMediaLink {
  platform: 'youtube_video' | 'youtube_short' | 'twitter_post' | 'twitter_video' | 
            'instagram_post' | 'instagram_reel' | 'instagram_video' | 'facebook_post' | 
            'facebook_video' | 'facebook_reel' | 'tiktok_video' | 'tiktok_reel' | 
            'linkedin_post' | 'threads_post' | 'x_post' | 'x_video';
  post_type: 'post' | 'reel' | 'video' | 'short' | 'story' | 'status';
  post_url: string;
  display_order: number;
  auto_embed?: boolean;
  show_full_embed?: boolean;
  is_featured?: boolean;
  caption?: string;
}

interface Stage1Data {
  title: string;
  category_ids: number[];
  primary_category_id: string;
  priority: 'high' | 'medium' | 'low';
}

interface Stage2Data {
  content: string;
  excerpt: string;
  images: ImageFile[];
  autoGenerateMeta?: boolean;
  generatedMetadata?: {
    tags: string;
    meta_description: string;
    seo_keywords: string;
  } | null;
}

interface Stage3Data {
  tags: string;
  meta_description: string;
  seo_keywords: string;
  social_media_links: SocialMediaLink[];
}

interface CreatePostsProps {
  user?: User;
  maxImages?: number;
  maxSocialLinks?: number;
}

const CreatePosts: React.FC<CreatePostsProps> = ({ 
  user: propUser, 
  maxImages = 10, 
  maxSocialLinks = 5 
}) => {
  const { user: sessionUser, csrfToken } = useSession();
  const { canPublish, canCreatePosts, requiresApproval, isLoading: permissionsLoading } = usePermissions();
  
  const user = propUser || sessionUser;

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [stage1Data, setStage1Data] = useState<Stage1Data>({
    title: '',
    category_ids: [],
    primary_category_id: '',
    priority: 'medium'
  });

  const [stage2Data, setStage2Data] = useState<Stage2Data>({
    content: '',
    excerpt: '',
    images: [],
    autoGenerateMeta: false,
    generatedMetadata: null
  });

  const [stage3Data, setStage3Data] = useState<Stage3Data>({
    tags: '',
    meta_description: '',
    seo_keywords: '',
    social_media_links: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const response = await fetch('/api/admin/createposts?endpoint=categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load categories');
      }

      const groups = data.groups || {};
      const groupsArray: CategoryGroup[] = [];
      const categoriesFlat: Category[] = [];

      Object.keys(groups).forEach((key) => {
        const group = groups[key];
        const mainSlug = key;

        groupsArray.push({
          title: group.title,
          icon: group.icon,
          description: group.description,
          color: group.color,
          parent_category: group.parent_category,
          categories: group.categories || [],
          mainSlug
        });

        if (group.categories && Array.isArray(group.categories)) {
          group.categories.forEach((cat: Category) => {
            categoriesFlat.push({
              ...cat,
              group: mainSlug
            });
          });
        }
      });

      setCategoryGroups(groupsArray);
      setAllCategories(categoriesFlat);
    } catch (error) {
      console.error('[Categories] Error:', error);
      setCategoriesError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleStage1Submit = (data: Stage1Data) => {
    setStage1Data(data);
    setCurrentStage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStage2Submit = (data: Stage2Data) => {
    setStage2Data(data);
    
    if (data.autoGenerateMeta && data.generatedMetadata) {
      setStage3Data(prev => ({
        ...prev,
        tags: data.generatedMetadata?.tags || prev.tags,
        meta_description: data.generatedMetadata?.meta_description || prev.meta_description,
        seo_keywords: data.generatedMetadata?.seo_keywords || prev.seo_keywords
      }));
    }
    
    setCurrentStage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStage3Submit = async (data: Stage3Data, actionType: 'draft' | 'publish') => {
    setStage3Data(data);
    await handleFinalSubmit(data, actionType);
  };

  const handleDirectSubmit = async (data: Stage2Data, actionType: 'draft' | 'publish') => {
    setStage2Data(data);
    
    const defaultStage3Data: Stage3Data = {
      tags: data.generatedMetadata?.tags || '',
      meta_description: data.generatedMetadata?.meta_description || '',
      seo_keywords: data.generatedMetadata?.seo_keywords || '',
      social_media_links: []
    };
    
    await handleFinalSubmit(defaultStage3Data, actionType);
  };

  const handleFinalSubmit = async (
    finalStage3Data: Stage3Data,
    actionType: 'draft' | 'publish'
  ) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!user?.admin_id) {
        throw new Error('User authentication required');
      }

      if (stage1Data.category_ids.length === 0) {
        throw new Error('Please select at least one category');
      }

      if (!stage1Data.primary_category_id) {
        throw new Error('Please select a primary category');
      }

      const submitFormData = new FormData();

      submitFormData.append('title', stage1Data.title.trim());
      submitFormData.append('content', stage2Data.content.trim());
      submitFormData.append('excerpt', stage2Data.excerpt.trim() || stage1Data.title.substring(0, 200));
      submitFormData.append('category_ids', JSON.stringify(stage1Data.category_ids));
      submitFormData.append('primary_category_id', stage1Data.primary_category_id.toString());
      submitFormData.append('priority', stage1Data.priority);
      submitFormData.append('tags', finalStage3Data.tags.trim());
      submitFormData.append('meta_description', finalStage3Data.meta_description.trim());
      submitFormData.append('seo_keywords', finalStage3Data.seo_keywords.trim());
      submitFormData.append('status', actionType === 'publish' ? 'published' : 'draft');
      submitFormData.append('author_id', user.admin_id.toString());

      if (finalStage3Data.social_media_links && finalStage3Data.social_media_links.length > 0) {
        const validLinks = finalStage3Data.social_media_links
          .filter(link => link.post_url && link.post_url.trim())
          .map((link, index) => ({
            platform: link.platform,
            post_type: link.post_type,
            post_url: link.post_url.trim(),
            display_order: link.display_order || (index + 2),
            auto_embed: link.auto_embed !== false,
            show_full_embed: link.show_full_embed !== false,
            is_featured: link.is_featured || false,
            caption: link.caption || ''
          }));

        submitFormData.append('social_media_links', JSON.stringify(validLinks));
      } else {
        submitFormData.append('social_media_links', '[]');
      }

      if (stage2Data.images && stage2Data.images.length > 0) {
        stage2Data.images.forEach((img, index) => {
          if (img.file) {
            submitFormData.append('images', img.file);
            submitFormData.append(`image_metadata_${index}`, JSON.stringify({
              caption: img.caption || '',
              order: img.order !== undefined ? img.order : index,
              is_featured: img.isFeatured || (index === 0),
              has_watermark: img.hasWatermark || false
            }));
          }
        });
      }

      const response = await fetch('/api/admin/createposts', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include',
        body: submitFormData
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (result.success) {
        const requiresApprovalFlag = result.requires_approval || false;

        let successMessage = 'News created successfully';
        if (actionType === 'publish') {
          if (canPublish) {
            successMessage = '✅ Article Published Successfully';
          } else if (requiresApprovalFlag) {
            successMessage = '📤 Submitted for approval';
          } else {
            successMessage = '💾 Draft Saved Successfully';
          }
        } else {
          successMessage = '💾 Draft Saved Successfully';
        }

        setMessage({ 
          type: 'success', 
          text: successMessage
        });
        
        stage2Data.images.forEach(img => {
          try {
            URL.revokeObjectURL(img.preview);
          } catch (e) {
            console.warn('Failed to revoke object URL:', e);
          }
        });
        
        setTimeout(() => {
          window.location.href = '/admin/retrieveposts';
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to create news');
      }
    } catch (error) {
      console.error('[Submit] Error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Network error occurred'
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStage === 2) {
      setCurrentStage(1);
    } else if (currentStage === 3) {
      setCurrentStage(2);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (permissionsLoading || categoriesLoading) {
    return (
      <div className="create-posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!canCreatePosts) {
    return (
      <div className="admin-content">
        <div className="message error">
          You do not have permission to create posts. Please contact an administrator.
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="admin-content">
        <div className="message error">
          Error loading categories: {categoriesError}
        </div>
        <button onClick={fetchCategories} className="new-post-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="create-posts">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {currentStage === 1 && (
        <CreateStage1
          initialData={stage1Data}
          onNext={handleStage1Submit}
          categoryGroups={categoryGroups}
          allCategories={allCategories}
          categoriesError={categoriesError}
        />
      )}

      {currentStage === 2 && (
        <CreateStage2
          initialData={stage2Data}
          onSubmit={handleStage2Submit}
          onDirectSubmit={handleDirectSubmit}
          onBack={handleBack}
          maxImages={maxImages}
          currentUserName={user ? `${user.first_name} ${user.last_name}` : 'Unknown'}
          articleTitle={stage1Data.title}
          canPublish={canPublish}
        />
      )}

      {currentStage === 3 && (
        <CreateStage3
          initialData={stage3Data}
          onSubmit={handleStage3Submit}
          onBack={handleBack}
          maxSocialLinks={maxSocialLinks}
          canPublish={canPublish}
          requiresApproval={requiresApproval}
          isSubmitting={isSubmitting}
          generatedMetadata={stage2Data.generatedMetadata}
        />
      )}
    </div>
  );
};

export default CreatePosts;