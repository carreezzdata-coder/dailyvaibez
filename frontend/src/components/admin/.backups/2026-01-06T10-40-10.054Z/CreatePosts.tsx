import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreateStage1 from './creators/CreateStage1';
import CreateStage2 from './creators/CreateStage2';
import CreateStage3 from './creators/CreateStage3';

const cleanInput = (str: string) => {
  if (!str) return '';
  return str
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeBlocks = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\[HEADING\]/g, '\n\n[HEADING]')
    .replace(/\[\/HEADING\]/g, '[/HEADING]\n\n')
    .replace(/\[QUOTE\]/g, '\n\n[QUOTE]')
    .replace(/\[\/QUOTE\]/g, '[/QUOTE]\n\n')
    .replace(/\[TIMELINE\]/g, '\n\n[TIMELINE]')
    .replace(/\[\/TIMELINE\]/g, '[/TIMELINE]\n\n')
    .replace(/\[INTERVIEW\]/g, '\n\n[INTERVIEW]')
    .replace(/\[\/INTERVIEW\]/g, '[/INTERVIEW]\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const generateSlug = (title: string) => 
  cleanInput(title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  group?: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  color: string;
  mainSlug: string;
  categories: Category[];
}

interface Stage1Data {
  title: string;
  category_ids: number[];
  primary_category_id: string;
  priority: 'high' | 'medium' | 'low';
  featured: boolean;
  featured_hours: number;
  breaking: boolean;
  breaking_hours: number;
  pinned: boolean;
  pin_type: 'gold' | 'silver' | 'bronze' | null;
  has_timeline: boolean;
  has_interview: boolean;
  timeline_title: string;
  interviewee_name: string;
  interviewer_name: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
  order: number;
  isFeatured: boolean;
  isUploading: boolean;
  hasWatermark: boolean;
}

interface Stage2Data {
  content: string;
  excerpt: string;
  images: ImageFile[];
}

interface SocialMediaLink {
  platform: string;
  post_type: string;
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

interface CreatePostsProps {
  user?: User;
  maxImages?: number;
  maxSocialLinks?: number;
}

type SessionState = 'loading' | 'authenticated' | 'unauthenticated';

const CreatePosts: React.FC<CreatePostsProps> = ({ 
  user,
  maxImages = 10,
  maxSocialLinks = 5
}) => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const submitControllerRef = useRef<AbortController | null>(null);

  const [stage1Data, setStage1Data] = useState<Stage1Data>({
    title: '',
    category_ids: [],
    primary_category_id: '',
    priority: 'medium',
    featured: false,
    featured_hours: 72,
    breaking: false,
    breaking_hours: 9,
    pinned: false,
    pin_type: null,
    has_timeline: false,
    has_interview: false,
    timeline_title: '',
    interviewee_name: '',
    interviewer_name: ''
  });

  const [stage2Data, setStage2Data] = useState<Stage2Data>({
    content: '',
    excerpt: '',
    images: []
  });

  const [stage3Data, setStage3Data] = useState<Stage3Data>({
    tags: '',
    meta_description: '',
    seo_keywords: '',
    social_media_links: []
  });

  const fetchUserSession = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        setCurrentUser(null);
        setSessionState('unauthenticated');
        return;
      }

      if (!response.ok) {
        setCurrentUser(null);
        setSessionState('unauthenticated');
        return;
      }

      const data = await response.json();

      if (data?.success && data?.authenticated && data.user) {
        setCurrentUser(data.user);
        setSessionState('authenticated');
      } else {
        setCurrentUser(null);
        setSessionState('unauthenticated');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setCurrentUser(null);
      setSessionState('unauthenticated');
    }
  };

  const fetchCategories = async () => {
    setCategoriesError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/admin/createposts?endpoint=categories', {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Cache-Control': 'no-cache', 
          'Pragma': 'no-cache' 
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }

      if (!data?.success || !data?.groups) {
        throw new Error(data?.message || 'Invalid response format');
      }

      const groupsArray: CategoryGroup[] = Object.entries(data.groups)
        .map(([slug, group]: [string, any]) => ({
          title: group.title || slug,
          icon: group.icon || '📰',
          color: group.color || '#6b7280',
          mainSlug: slug,
          categories: (group.categories || []).map((cat: any) => ({
            ...cat,
            group: slug
          }))
        }))
        .filter(g => g.categories.length > 0);

      const allCats = groupsArray.flatMap(g => g.categories);

      setCategoryGroups(groupsArray);
      setAllCategories(allCats);
      
      if (allCats.length === 0) {
        setCategoriesError('No categories available. Please contact administrator.');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setCategoriesError('Request timeout. Please refresh and try again.');
      } else {
        setCategoriesError(err instanceof Error ? err.message : 'Failed to load categories');
      }
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    const initializeEditor = async () => {
      try {
        await fetchUserSession();
        if (!controller.signal.aborted) {
          await fetchCategories();
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error initializing editor:', error);
        }
      }
    };

    initializeEditor();
    
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStage]);

  useEffect(() => {
    if (currentStage < 1 || currentStage > 3) {
      setCurrentStage(1);
    }
  }, [currentStage]);

  if (sessionState === 'loading') {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  if (sessionState === 'unauthenticated') {
    return (
      <div className="retrieve-loading">
        <p style={{ color: 'var(--status-danger)', marginBottom: '1rem' }}>
          Session expired. Please log in again.
        </p>
        <button 
          onClick={() => router.push('/admin/login')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--vybez-primary)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          aria-label="Go to login page"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoadingCategories) {
    return (
      <div className="retrieve-loading">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="admin-content">
        <div style={{ 
          padding: '2rem', 
          background: 'rgba(220, 38, 38, 0.1)', 
          border: '1px solid rgba(220, 38, 38, 0.3)', 
          borderRadius: '8px', 
          color: '#dc2626', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Error Loading Editor</div>
          <div style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>{categoriesError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="new-post-btn"
            style={{ fontSize: '0.95rem' }}
            aria-label="Refresh page"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const canPublish = ['super_admin', 'admin', 'editor'].includes(currentUser!.role);
  const canFeature = ['super_admin', 'admin', 'editor'].includes(currentUser!.role);
  const canSetBreaking = ['super_admin', 'admin'].includes(currentUser!.role);
  const canSetPinned = ['super_admin', 'admin'].includes(currentUser!.role);
  const requiresApproval = !canPublish;

  const handleStage1Next = (data: Stage1Data) => {
    setStage1Data(data);
    setCurrentStage(2);
  };

  const handleStage2Next = (data: Stage2Data) => {
    setStage2Data(data);
    setCurrentStage(3);
  };

  const handleStage3Submit = async (data: Stage3Data, actionType: 'draft' | 'publish') => {
    setStage3Data(data);
    await handleFinalSubmit(data, actionType);
  };

  const handleFinalSubmit = async (data: Stage3Data, actionType: 'draft' | 'publish') => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    submitControllerRef.current?.abort();
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      if (stage2Data.images.length > maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed`);
      }

      if (!stage2Data.images || stage2Data.images.length === 0) {
        const confirmed = window.confirm('No images added. Continue without images?');
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      const cleanedTitle = cleanInput(stage1Data.title);
      const cleanedContent = normalizeBlocks(cleanInput(stage2Data.content));
      const cleanedExcerpt = cleanInput(stage2Data.excerpt || stage1Data.title.substring(0, 200) + '...');
      const cleanedTimelineTitle = stage1Data.has_timeline ? cleanInput(stage1Data.timeline_title || stage1Data.title) : '';
      const cleanedIntervieweeName = stage1Data.has_interview ? cleanInput(stage1Data.interviewee_name || '') : '';
      const cleanedInterviewerName = stage1Data.has_interview 
        ? cleanInput(stage1Data.interviewer_name || `${currentUser!.first_name} ${currentUser!.last_name}`)
        : '';
      const cleanedTags = cleanInput(data.tags);
      const cleanedMetaDescription = cleanInput(data.meta_description);
      const cleanedSeoKeywords = cleanInput(data.seo_keywords);

      const cleanedSocialLinks = data.social_media_links.map(link => ({
        ...link,
        post_url: cleanInput(link.post_url),
        caption: cleanInput(link.caption || '')
      }));

      const formData = new FormData();

      formData.append('title', cleanedTitle);
      formData.append('slug', generateSlug(cleanedTitle));
      formData.append('content', cleanedContent);
      formData.append('excerpt', cleanedExcerpt);
      formData.append('author_id', currentUser!.admin_id.toString());
      formData.append('category_ids', JSON.stringify(stage1Data.category_ids));
      formData.append('primary_category_id', stage1Data.primary_category_id);
      formData.append('priority', stage1Data.priority);
      formData.append('featured', stage1Data.featured.toString());
      formData.append('featured_hours', stage1Data.featured_hours.toString());
      formData.append('breaking', stage1Data.breaking.toString());
      formData.append('breaking_hours', stage1Data.breaking_hours.toString());
      formData.append('pinned', stage1Data.pinned.toString());
      formData.append('pin_type', stage1Data.pin_type || '');
      formData.append('has_timeline', stage1Data.has_timeline.toString());
      formData.append('has_interview', stage1Data.has_interview.toString());
      formData.append('timeline_title', cleanedTimelineTitle);
      formData.append('interviewee_name', cleanedIntervieweeName);
      formData.append('interviewer_name', cleanedInterviewerName);
      formData.append('tags', cleanedTags);
      formData.append('meta_description', cleanedMetaDescription);
      formData.append('seo_keywords', cleanedSeoKeywords);
      formData.append('social_media_links', JSON.stringify(cleanedSocialLinks));
      formData.append('status', actionType === 'publish' ? 'published' : 'draft');
      formData.append('requires_approval', (!canPublish && actionType === 'publish').toString());

      for (let i = 0; i < stage2Data.images.length; i++) {
        const img = stage2Data.images[i];
        
        if (!(img.file instanceof File)) continue;

        formData.append('images', img.file);
        
        const metadata = {
          caption: cleanInput(img.caption),
          order: img.order,
          is_featured: img.isFeatured,
          has_watermark: img.hasWatermark
        };
        formData.append(`image_metadata_${i}`, JSON.stringify(metadata));
      }

      const response = await fetch('/api/admin/createposts/news', {
        method: 'POST',
        credentials: 'include',
        body: formData,
        signal: controller.signal
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create post');
      }

      if (actionType === 'publish' && requiresApproval) {
        alert('Article submitted for approval successfully!');
      } else if (actionType === 'publish') {
        alert('Article published successfully!');
      } else {
        alert('Article saved as draft successfully!');
      }

      router.push('/admin/posts');

    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        alert(error instanceof Error ? error.message : 'Failed to create post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  return (
    <div className="admin-content">
      {currentStage === 1 && (
        <CreateStage1
          initialData={stage1Data}
          onNext={handleStage1Next}
          userRole={currentUser!.role}
          canFeature={canFeature}
          canSetBreaking={canSetBreaking}
          canSetPinned={canSetPinned}
          categoryGroups={categoryGroups}
          allCategories={allCategories}
          categoriesError={categoriesError}
        />
      )}

      {currentStage === 2 && (
        <CreateStage2
          initialData={stage2Data}
          onSubmit={handleStage2Next}
          onBack={handleBack}
          maxImages={maxImages}
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
        />
      )}
    </div>
  );
};

export default CreatePosts;