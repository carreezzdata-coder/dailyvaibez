'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/includes/Session';

interface OverviewStats {
  total_articles: string;
  published_articles: string;
  draft_articles: string;
  total_views: string;
  total_likes: string;
  total_comments: string;
  total_shares: string;
  total_users: string;
  active_users_30d: string;
  new_users_30d: string;
  avg_engagement_rate: number;
}

interface ContentStats {
  top_articles: Array<{
    news_id: number;
    title: string;
    views: string;
    likes_count: string;
    comments_count: string;
    share_count: string;
    engagement_rate: string;
  }>;
  articles_by_category: Array<{
    category_name: string;
    article_count: string;
    total_views: string;
  }>;
  articles_by_author: Array<{
    author_name: string;
    article_count: string;
    total_views: string;
  }>;
}

interface UserStats {
  registration_trend: Array<{
    date: string;
    count: string;
  }>;
  top_engaged_users: Array<{
    user_id: number;
    full_name: string;
    interaction_count: string;
  }>;
}

interface EngagementStats {
  daily_metrics: Array<{
    date: string;
    views: string;
    likes: string;
    comments: string;
    shares: string;
  }>;
}

const Analytics: React.FC = () => {
  const { csrfToken } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users' | 'engagement'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      };

      console.log('[Analytics] Fetching data with range:', timeRange);

      const [overviewRes, contentRes, usersRes, engagementRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?range=${timeRange}`, {
          credentials: 'include',
          headers
        }),
        fetch(`/api/admin/analytics/content?range=${timeRange}`, {
          credentials: 'include',
          headers
        }),
        fetch(`/api/admin/analytics/users?range=${timeRange}`, {
          credentials: 'include',
          headers
        }),
        fetch(`/api/admin/analytics/engagement?range=${timeRange}`, {
          credentials: 'include',
          headers
        })
      ]);

      console.log('[Analytics] Responses:', {
        overview: overviewRes.status,
        content: contentRes.status,
        users: usersRes.status,
        engagement: engagementRes.status
      });

      if (!overviewRes.ok) {
        const errorText = await overviewRes.text();
        throw new Error(`Overview API error: ${overviewRes.status} - ${errorText}`);
      }
      if (!contentRes.ok) {
        const errorText = await contentRes.text();
        throw new Error(`Content API error: ${contentRes.status} - ${errorText}`);
      }
      if (!usersRes.ok) {
        const errorText = await usersRes.text();
        throw new Error(`Users API error: ${usersRes.status} - ${errorText}`);
      }
      if (!engagementRes.ok) {
        const errorText = await engagementRes.text();
        throw new Error(`Engagement API error: ${engagementRes.status} - ${errorText}`);
      }

      const overview = await overviewRes.json();
      const content = await contentRes.json();
      const users = await usersRes.json();
      const engagement = await engagementRes.json();

      console.log('[Analytics] Parsed data:', { overview, content, users, engagement });

      if (overview.success) setOverviewStats(overview.data);
      if (content.success) setContentStats(content.data);
      if (users.success) setUserStats(users.data);
      if (engagement.success) setEngagementStats(engagement.data);

    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button 
          onClick={fetchAnalytics} 
          style={{
            padding: '0.75rem 1.5rem',
            marginTop: '1rem',
            background: 'var(--vybez-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600
          }}
         aria-label="Action button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Sidebar */}
      <aside className="analytics-sidebar">
        <h2>Analytics</h2>
        <button 
          className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
         aria-label="Action button">
          Overview
        </button>
        <button 
          className={`sidebar-nav-item ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
         aria-label="Action button">
          Content
        </button>
        <button 
          className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
         aria-label="Action button">
          Users
        </button>
        <button 
          className={`sidebar-nav-item ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
         aria-label="Action button">
          Engagement
        </button>
      </aside>

      {/* Main Content */}
      <main className="analytics-main-content">
        {/* Time Range Selector */}
        <div className="stats-tabs">
          <button 
            className={`tab-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
           aria-label="Action button">
            7 Days
          </button>
          <button 
            className={`tab-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
           aria-label="Action button">
            30 Days
          </button>
          <button 
            className={`tab-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
           aria-label="Action button">
            90 Days
          </button>
          <button 
            className={`tab-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
           aria-label="Action button">
            All Time
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overviewStats && (
          <div className="overview-grid">
            <div className="stat-card">
              <h3>Total Articles</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_articles)}</span>
            </div>
            <div className="stat-card">
              <h3>Published</h3>
              <span className="stat-value">{formatNumber(overviewStats.published_articles)}</span>
            </div>
            <div className="stat-card">
              <h3>Drafts</h3>
              <span className="stat-value">{formatNumber(overviewStats.draft_articles)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_views)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Likes</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_likes)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Comments</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_comments)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Shares</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_shares)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <span className="stat-value">{formatNumber(overviewStats.total_users)}</span>
            </div>
            <div className="stat-card">
              <h3>Engagement Rate</h3>
              <span className="stat-value">{overviewStats.avg_engagement_rate.toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && contentStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Articles */}
            {contentStats.top_articles.length > 0 && (
              <div className="metrics-container">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
                  Top Performing Articles
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Title</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Views</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Likes</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Comments</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentStats.top_articles.map((article) => (
                        <tr key={article.news_id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                          <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{article.title}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(article.views)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(article.likes_count)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(article.comments_count)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              background: 'var(--bg-selected)', 
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--vybez-primary)',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}>
                              {parseFloat(article.engagement_rate).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories and Authors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Categories */}
              {contentStats.articles_by_category.length > 0 && (
                <div className="metrics-container">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
                    Top Categories
                  </h3>
                  {contentStats.articles_by_category.map((cat, idx) => {
                    const maxViews = Math.max(...contentStats.articles_by_category.map(c => parseInt(c.total_views)));
                    const percentage = maxViews > 0 ? (parseInt(cat.total_views) / maxViews) * 100 : 0;
                    
                    return (
                      <div key={idx} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.category_name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatNumber(cat.total_views)} views</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'var(--bg-hover)', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--vybez-primary), var(--vybez-accent))',
                            transition: 'width 0.6s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Authors */}
              {contentStats.articles_by_author.length > 0 && (
                <div className="metrics-container">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
                    Top Authors
                  </h3>
                  {contentStats.articles_by_author.map((author, idx) => {
                    const maxViews = Math.max(...contentStats.articles_by_author.map(a => parseInt(a.total_views)));
                    const percentage = maxViews > 0 ? (parseInt(author.total_views) / maxViews) * 100 : 0;
                    
                    return (
                      <div key={idx} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{author.author_name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatNumber(author.total_views)} views</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'var(--bg-hover)', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--vybez-accent), var(--vybez-secondary))',
                            transition: 'width 0.6s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && userStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {userStats.registration_trend.length > 0 && (
              <div className="metrics-container">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
                  User Registration Trend
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-around',
                  height: '300px',
                  gap: '0.5rem',
                  padding: '1rem 0'
                }}>
                  {userStats.registration_trend.map((item, idx) => {
                    const maxCount = Math.max(...userStats.registration_trend.map(i => parseInt(i.count)));
                    const height = maxCount > 0 ? (parseInt(item.count) / maxCount) * 100 : 0;
                    
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        flex: 1,
                        maxWidth: '60px'
                      }}>
                        <div style={{ 
                          width: '100%', 
                          height: `${height}%`,
                          minHeight: height > 0 ? '10px' : '0',
                          background: 'linear-gradient(180deg, var(--vybez-primary), var(--vybez-accent))',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.6s ease',
                          position: 'relative'
                        }}>
                          <span style={{ 
                            position: 'absolute',
                            top: '-1.5rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}>
                            {item.count}
                          </span>
                        </div>
                        <span style={{ 
                          marginTop: '0.5rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          textAlign: 'center'
                        }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {userStats.top_engaged_users.length > 0 && (
              <div className="metrics-container">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
                  Most Engaged Users
                </h3>
                {userStats.top_engaged_users.map((user, idx) => (
                  <div key={user.user_id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '1rem',
                    background: 'var(--bg-hover)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.75rem',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--vybez-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}>
                      {user.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.full_name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {formatNumber(user.interaction_count)} interactions
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--bg-selected)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--vybez-primary)',
                      fontWeight: 700
                    }}>
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && engagementStats && engagementStats.daily_metrics.length > 0 && (
          <div className="metrics-container">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--vybez-primary)' }}>
              Daily Engagement Metrics
            </h3>
            <div className="metrics-chart">
              {engagementStats.daily_metrics.map((metric, idx) => {
                const maxViews = Math.max(...engagementStats.daily_metrics.map(m => parseInt(m.views)));
                const maxLikes = Math.max(...engagementStats.daily_metrics.map(m => parseInt(m.likes)));
                const maxComments = Math.max(...engagementStats.daily_metrics.map(m => parseInt(m.comments)));
                const maxShares = Math.max(...engagementStats.daily_metrics.map(m => parseInt(m.shares)));
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px', height: '100%', alignItems: 'flex-end' }}>
                      <div 
                        className="metric-bar views"
                        style={{ 
                          height: `${maxViews > 0 ? (parseInt(metric.views) / maxViews) * 100 : 0}%`,
                          minHeight: parseInt(metric.views) > 0 ? '10px' : '0'
                        }}
                      ></div>
                      <div 
                        className="metric-bar likes"
                        style={{ 
                          height: `${maxLikes > 0 ? (parseInt(metric.likes) / maxLikes) * 100 : 0}%`,
                          minHeight: parseInt(metric.likes) > 0 ? '10px' : '0'
                        }}
                      ></div>
                      <div 
                        className="metric-bar comments"
                        style={{ 
                          height: `${maxComments > 0 ? (parseInt(metric.comments) / maxComments) * 100 : 0}%`,
                          minHeight: parseInt(metric.comments) > 0 ? '10px' : '0'
                        }}
                      ></div>
                      <div 
                        className="metric-bar shares"
                        style={{ 
                          height: `${maxShares > 0 ? (parseInt(metric.shares) / maxShares) * 100 : 0}%`,
                          minHeight: parseInt(metric.shares) > 0 ? '10px' : '0'
                        }}
                      ></div>
                    </div>
                    <span className="metric-date">
                      {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="metrics-legend">
              <span className="legend-item">
                <span className="legend-color views"></span> Views
              </span>
              <span className="legend-item">
                <span className="legend-color likes"></span> Likes
              </span>
              <span className="legend-item">
                <span className="legend-color comments"></span> Comments
              </span>
              <span className="legend-item">
                <span className="legend-color shares"></span> Shares
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;