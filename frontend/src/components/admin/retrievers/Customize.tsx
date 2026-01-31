import React, { useState, useEffect } from 'react';

interface CustomizeProps {
  newsId: number;
  onClose: () => void;
  onSuccess: () => void;
  csrfToken: string;
}

const FEATURED_TIERS = [
  { tier: 'gold', hours: 72, label: 'Gold', icon: '🥇', color: '#ffd700' },
  { tier: 'silver', hours: 48, label: 'Silver', icon: '🥈', color: '#c0c0c0' },
  { tier: 'bronze', hours: 24, label: 'Bronze', icon: '🥉', color: '#cd7f32' }
];

const BREAKING_LEVELS = [
  { level: 'high', hours: 12, label: 'High', icon: '🔥', color: '#dc2626' },
  { level: 'medium', hours: 6, label: 'Medium', icon: '⚡', color: '#ea580c' },
  { level: 'low', hours: 3, label: 'Low', icon: '💨', color: '#f59e0b' }
];

const PIN_TYPES = [
  { type: 'gold', label: 'Gold', duration: '72h', icon: '🥇', color: '#ffd700' },
  { type: 'silver', label: 'Silver', duration: '48h', icon: '🥈', color: '#c0c0c0' },
  { type: 'bronze', label: 'Bronze', duration: '48h', icon: '🥉', color: '#cd7f32' }
];

const Customize: React.FC<CustomizeProps> = ({ 
  newsId, 
  onClose, 
  onSuccess, 
  csrfToken 
}) => {
  const [featured, setFeatured] = useState(false);
  const [featuredTier, setFeaturedTier] = useState('gold');
  const [featuredHours, setFeaturedHours] = useState(72);
  
  const [breaking, setBreaking] = useState(false);
  const [breakingLevel, setBreakingLevel] = useState('medium');
  const [breakingHours, setBreakingHours] = useState(6);
  
  const [pinned, setPinned] = useState(false);
  const [pinType, setPinType] = useState('gold');
  const [pinPosition, setPinPosition] = useState(1);
  
  const [editorPick, setEditorPick] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/customize/${newsId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.promotions) {
            const p = data.promotions;
            
            setFeatured(p.featured || false);
            setFeaturedTier(p.featured_tier || 'gold');
            
            setBreaking(p.breaking || false);
            setBreakingLevel(p.breaking_level || 'medium');
            
            setPinned(p.pinned || false);
            setPinType(p.pin_type || 'gold');
            setPinPosition(p.pin_position || 1);
            
            setEditorPick(p.editor_pick || false);
          }
        }
      } catch (error) {
        console.error('[Customize] Fetch settings error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSettings();
  }, [newsId, csrfToken]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        featured: featured,
        featured_tier: featured ? featuredTier : null,
        featured_hours: featured ? featuredHours : null,
        breaking: breaking,
        breaking_level: breaking ? breakingLevel : null,
        breaking_hours: breaking ? breakingHours : null,
        pinned: pinned,
        pin_type: pinned ? pinType : null,
        pin_position: pinned ? pinPosition : null,
        editor_pick: editorPick
      };

      const response = await fetch(`/api/admin/customize/${newsId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to update settings');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('[Customize] Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeaturedTierSelect = (tier: typeof FEATURED_TIERS[0]) => {
    setFeaturedTier(tier.tier);
    setFeaturedHours(tier.hours);
  };

  const handleBreakingLevelSelect = (level: typeof BREAKING_LEVELS[0]) => {
    setBreakingLevel(level.level);
    setBreakingHours(level.hours);
  };

  const handlePinTypeSelect = (pin: typeof PIN_TYPES[0]) => {
    setPinType(pin.type);
  };

  if (isLoading) {
    return (
      <div className="customize-modal-overlay" onClick={onClose}>
        <div className="customize-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="customize-loading">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customize-modal-overlay" onClick={onClose}>
      <div className="customize-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="customize-modal-header">
          <h3>⚙️ Customize Post Promotion</h3>
          <button className="customize-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="customize-modal-body">
          {error && (
            <div className="customize-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="customize-section">
            <div className="customize-section-header">
              <div className="customize-checkbox-wrapper" onClick={() => setFeatured(!featured)}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <div className="customize-section-info">
                  <div className="customize-section-title">⭐ Featured Article</div>
                  <div className="customize-section-desc">Display article prominently on homepage</div>
                </div>
              </div>
            </div>

            {featured && (
              <div className="customize-options">
                <label className="customize-label">Select Featured Tier</label>
                <div className="customize-tier-grid">
                  {FEATURED_TIERS.map((tier) => (
                    <button
                      key={tier.tier}
                      type="button"
                      onClick={() => handleFeaturedTierSelect(tier)}
                      className={`customize-tier-btn ${featuredTier === tier.tier ? 'active' : ''}`}
                      style={{
                        borderColor: featuredTier === tier.tier ? tier.color : undefined,
                        backgroundColor: featuredTier === tier.tier ? `${tier.color}15` : undefined
                      }}
                    >
                      <div className="customize-tier-icon">{tier.icon}</div>
                      <div className="customize-tier-label">{tier.label}</div>
                      <div className="customize-tier-hours">{tier.hours}h</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="customize-section">
            <div className="customize-section-header">
              <div className="customize-checkbox-wrapper" onClick={() => setBreaking(!breaking)}>
                <input
                  type="checkbox"
                  checked={breaking}
                  onChange={(e) => setBreaking(e.target.checked)}
                />
                <div className="customize-section-info">
                  <div className="customize-section-title">🚨 Breaking News</div>
                  <div className="customize-section-desc">Mark as breaking news with urgent alert</div>
                </div>
              </div>
            </div>

            {breaking && (
              <div className="customize-options">
                <label className="customize-label">Select Breaking Level</label>
                <div className="customize-tier-grid">
                  {BREAKING_LEVELS.map((level) => (
                    <button
                      key={level.level}
                      type="button"
                      onClick={() => handleBreakingLevelSelect(level)}
                      className={`customize-tier-btn ${breakingLevel === level.level ? 'active' : ''}`}
                      style={{
                        borderColor: breakingLevel === level.level ? level.color : undefined,
                        backgroundColor: breakingLevel === level.level ? `${level.color}15` : undefined
                      }}
                    >
                      <div className="customize-tier-icon">{level.icon}</div>
                      <div className="customize-tier-label">{level.label}</div>
                      <div className="customize-tier-hours">{level.hours}h</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="customize-section">
            <div className="customize-section-header">
              <div className="customize-checkbox-wrapper" onClick={() => setPinned(!pinned)}>
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <div className="customize-section-info">
                  <div className="customize-section-title">📌 Pin Article</div>
                  <div className="customize-section-desc">Pin article to top of homepage</div>
                </div>
              </div>
            </div>

            {pinned && (
              <div className="customize-options">
                <label className="customize-label">Select Pin Type</label>
                <div className="customize-tier-grid">
                  {PIN_TYPES.map((pin) => (
                    <button
                      key={pin.type}
                      type="button"
                      onClick={() => handlePinTypeSelect(pin)}
                      className={`customize-tier-btn ${pinType === pin.type ? 'active' : ''}`}
                      style={{
                        borderColor: pinType === pin.type ? pin.color : undefined,
                        backgroundColor: pinType === pin.type ? `${pin.color}15` : undefined
                      }}
                    >
                      <div className="customize-tier-icon">{pin.icon}</div>
                      <div className="customize-tier-label">{pin.label}</div>
                      <div className="customize-tier-hours">{pin.duration}</div>
                    </button>
                  ))}
                </div>
                <div className="customize-pin-position">
                  <label className="customize-label">Pin Position</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={pinPosition}
                    onChange={(e) => setPinPosition(parseInt(e.target.value) || 1)}
                    className="customize-position-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="customize-section">
            <div className="customize-section-header">
              <div className="customize-checkbox-wrapper" onClick={() => setEditorPick(!editorPick)}>
                <input
                  type="checkbox"
                  checked={editorPick}
                  onChange={(e) => setEditorPick(e.target.checked)}
                />
                <div className="customize-section-info">
                  <div className="customize-section-title">💡 Editor's Pick</div>
                  <div className="customize-section-desc">Mark as exceptional content selected by editors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="customize-modal-actions">
          <button 
            className="customize-cancel-btn" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="customize-confirm-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : '✓ Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customize;