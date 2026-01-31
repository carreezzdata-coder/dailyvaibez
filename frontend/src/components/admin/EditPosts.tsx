import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/components/includes/Session';
import { usePermissions } from './adminhooks/usePermissions';
import EditStage1 from './editors/EditStage1';
import EditStage2 from './editors/EditStage2';
import EditStage3 from './editors/EditStage3';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  group?: string;
  description?: string;
  color?: string;
  icon?: string;
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

interface Stage1Data {
  title: string;
  category_ids: number[];
  primary_category_id: string;
  priority: 'high' | 'medium' | 'low';
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

interface Stage2Data {
  content: string;
  excerpt: string;
  images: ImageFile[];
  existing_images?: ImageFile[];
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

interface Stage3Data {
  tags: string;
  meta_description: string;
  seo_keywords: string;
  social_media_links: SocialMediaLink[];
}

interface User {
  admin_id: number;
  first_name: string;
  last_name: string;
  role: string;
}

const EditPost: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const newsId = params?.id as string;
  const { user: sessionUser, csrfToken, isAuthenticated } = useSession();
  const { 
    canPublish, 
    canCreatePosts,
    requiresApproval,
    isLoading: permissionsLoading 
  } = usePermissions();

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const submitControllerRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false);

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
    existing_images: []
  });

  const [stage3Data, setStage3Data] = useState<Stage3Data>({
    tags: '',
    meta_description: '',
    seo_keywords: '',
    social_media_links: []
  });

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
      console.error('[EditPost Categories] Error:', error);
      setCategoriesError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPostData = async () => {
    if (!newsId) {
      console.error('[EditPost] No news ID provided');
      setFetchError('Invalid post ID');
      setIsLoading(false);
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    setIsLoading(true);
    setFetchError(null);

    try {
      console.log('[EditPost] Fetching data for ID:', newsId);
      
      const response = await fetch(`/api/admin/edit/${newsId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('[EditPost] Fetch response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.message || `Failed to fetch post: ${response.status}`);
      }

      const data = await response.json();
      console.log('[EditPost] Data received:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Server returned unsuccessful response');
      }

      if (!data.news) {
        throw new Error('No post data in response');
      }

      const news = data.news;
      
      console.log('[EditPost] Processing news data:', {
        title: news.title,
        categoryIds: news.category_ids,
        primaryCategoryId: news.primary_category_id,
        contentLength: news.content?.length || 0,
        imagesCount: news.images_data?.length || 0
      });

      setStage1Data({
        title: news.title || '',
        category_ids: Array.isArray(news.category_ids) ? news.category_ids : [],
        primary_category_id: news.primary_category_id ? news.primary_category_id.toString() : '',
        priority: news.priority || 'medium'
      });

      const existingImages: ImageFile[] = (news.images_data || []).map((img: any, index: number) => ({
        id: `existing-${img.image_id || index}`,
        image_id: img.image_id,
        preview: img.image_path || img.image_url || '',
        caption: img.caption || img.image_caption || '',
        order: img.display_order !== undefined ? img.display_order : (img.order !== undefined ? img.order : index),
        isFeatured: img.is_featured || false,
        hasWatermark: img.has_watermark || (img.metadata?.has_watermark) || false,
        isExisting: true
      }));

      console.log('[EditPost] Processed existing images:', existingImages.length);

      setStage2Data({
        content: news.content || '',
        excerpt: news.excerpt || '',
        images: [],
        existing_images: existingImages
      });

      setStage3Data({
        tags: news.tags || '',
        meta_description: news.meta_description || '',
        seo_keywords: news.seo_keywords || '',
        social_media_links: Array.isArray(news.social_media_links) ? news.social_media_links : []
      });

      console.log('[EditPost] All state updated successfully');
      setIsLoading(false);
      
    } catch (error) {
      console.error('[EditPost] Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load post data';
      setFetchError(errorMessage);
      setMessage({
        type: 'error',
        text: errorMessage
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[EditPost] Component mounted');
    console.log('[EditPost] newsId:', newsId);
    console.log('[EditPost] csrfToken:', csrfToken ? 'present' : 'missing');
    console.log('[EditPost] isAuthenticated:', isAuthenticated);
    console.log('[EditPost] permissionsLoading:', permissionsLoading);
    console.log('[EditPost] categoriesLoading:', categoriesLoading);
    
    if (isAuthenticated && !permissionsLoading) {
      fetchCategories();
    }
  }, [isAuthenticated, permissionsLoading]);

  useEffect(() => {
    console.log('[EditPost] Data fetch check:', {
      newsId: newsId || 'missing',
      csrfToken: csrfToken ? 'present' : 'missing',
      permissionsLoading,
      categoriesLoading,
      canCreatePosts,
      hasFetched: hasFetchedRef.current
    });

    if (newsId && csrfToken && !permissionsLoading && !categoriesLoading && canCreatePosts && !hasFetchedRef.current) {
      console.log('[EditPost] Triggering fetchPostData');
      fetchPostData();
    }
  }, [newsId, csrfToken, permissionsLoading, categoriesLoading, canCreatePosts]);

  const handleStage1Submit = (data: Stage1Data) => {
    setStage1Data(data);
    setCurrentStage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStage2Submit = (data: Stage2Data) => {
    setStage2Data(data);
    setCurrentStage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStage3Submit = async (data: Stage3Data, actionType: 'draft' | 'publish') => {
    setStage3Data(data);
    await handleFinalSubmit(data, actionType);
  };

  const handleFinalSubmit = async (data: Stage3Data, actionType: 'draft' | 'publish') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);

    submitControllerRef.current?.abort();
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      if (!sessionUser?.admin_id) {
        throw new Error('User authentication required');
      }

      if (stage1Data.category_ids.length === 0) {
        throw new Error('Please select at least one category');
      }

      if (!stage1Data.primary_category_id) {
        throw new Error('Please select a primary category');
      }

      const formData = new FormData();

      formData.append('title', stage1Data.title.trim());
      formData.append('content', stage2Data.content.trim());
      formData.append('excerpt', stage2Data.excerpt.trim() || stage1Data.title.substring(0, 200) + '...');
      formData.append('category_ids', JSON.stringify(stage1Data.category_ids));
      formData.append('primary_category_id', stage1Data.primary_category_id.toString());
      formData.append('priority', stage1Data.priority);
      formData.append('tags', data.tags.trim());
      formData.append('meta_description', data.meta_description.trim());
      formData.append('seo_keywords', data.seo_keywords.trim());
      formData.append('status', actionType === 'publish' ? 'published' : 'draft');
      formData.append('author_id', sessionUser.admin_id.toString());

      if (data.social_media_links && data.social_media_links.length > 0) {
        const validLinks = data.social_media_links
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

        formData.append('social_media_links', JSON.stringify(validLinks));
      } else {
        formData.append('social_media_links', '[]');
      }

      const existingImagesData = (stage2Data.existing_images || []).map(img => ({
        image_id: img.image_id,
        image_path: img.preview,
        caption: img.caption,
        order: img.order,
        is_featured: img.isFeatured,
        has_watermark: img.hasWatermark || false
      }));
      formData.append('existing_images', JSON.stringify(existingImagesData));

      if (stage2Data.images && stage2Data.images.length > 0) {
        stage2Data.images.forEach((img, index) => {
          if (img.file) {
            formData.append('new_images', img.file);
            formData.append(`new_image_metadata_${index}`, JSON.stringify({
              caption: img.caption || '',
              order: img.order + (stage2Data.existing_images?.length || 0),
              is_featured: img.isFeatured || false,
              has_watermark: img.hasWatermark || false
            }));
          }
        });
      }

      console.log('[EditPost] Submitting update for ID:', newsId);

      const response = await fetch(`/api/admin/edit/${newsId}`, {
        method: 'PUT',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include',
        body: formData,
        signal: controller.signal
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      const requiresApprovalFlag = result.requires_approval || false;

      let successMessage = 'Article updated successfully';
      if (actionType === 'publish') {
        if (canPublish) {
          successMessage = '✅ Article Updated & Published Successfully';
        } else if (requiresApprovalFlag) {
          successMessage = '📤 Updated & Submitted for approval';
        } else {
          successMessage = '💾 Draft Updated Successfully';
        }
      } else {
        successMessage = '💾 Draft Updated Successfully';
      }

      setMessage({ 
        type: 'success', 
        text: successMessage
      });

      setTimeout(() => {
        router.push('/admin/posts');
      }, 2000);

    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        console.error('[EditPost] Submit error:', error);
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to update post'
        });
      }
    } finally {
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

  if (permissionsLoading) {
    return (
      <div className="create-posts-loading">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-content">
        <div className="message error">
          Session expired. Please log in again.
        </div>
        <button onClick={() => router.push('/admin/login')} className="new-post-btn">
          Go to Login
        </button>
      </div>
    );
  }

  if (!canCreatePosts) {
    return (
      <div className="admin-content">
        <div className="message error">
          You do not have permission to edit posts. Please contact an administrator.
        </div>
      </div>
    );
  }

  if (categoriesLoading) {
    return (
      <div className="create-posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
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

  if (isLoading) {
    return (
      <div className="create-posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading post data...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="admin-content">
        <div className="message error">
          {fetchError}
        </div>
        <button onClick={() => router.push('/admin/posts')} className="new-post-btn">
          ← Back to Posts
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
        <EditStage1
          initialData={stage1Data}
          onNext={handleStage1Submit}
          categoryGroups={categoryGroups}
          allCategories={allCategories}
          categoriesError={categoriesError}
        />
      )}

      {currentStage === 2 && (
        <EditStage2
          initialData={stage2Data}
          onSubmit={handleStage2Submit}
          onBack={handleBack}
          maxImages={10}
        />
      )}

      {currentStage === 3 && (
        <EditStage3
          initialData={stage3Data}
          onSubmit={handleStage3Submit}
          onBack={handleBack}
          maxSocialLinks={5}
          canPublish={canPublish}
          requiresApproval={requiresApproval}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditPost;