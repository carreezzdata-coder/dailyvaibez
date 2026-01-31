import React, { useState, useMemo } from 'react';

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
}

interface CreateStage1Props {
  initialData: Stage1Data;
  onNext: (data: Stage1Data) => void;
  categoryGroups: CategoryGroup[];
  allCategories: Category[];
  categoriesError: string | null;
}

const MAIN_CATEGORY_GROUPS: Record<string, { icon: string; color: string }> = {
  'live-world': { icon: '🌍', color: '#2563eb' },
  'counties': { icon: '🏢', color: '#7c3aed' },
  'politics': { icon: '🏛️', color: '#dc2626' },
  'business': { icon: '💼', color: '#059669' },
  'opinion': { icon: '💭', color: '#ea580c' },
  'sports': { icon: '⚽', color: '#0891b2' },
  'lifestyle': { icon: '🎭', color: '#db2777' },
  'entertainment': { icon: '🎉', color: '#8b5cf6' },
  'tech': { icon: '💻', color: '#0284c7' },
  'other': { icon: '📌', color: '#0233df' }
};

const DEFAULT_CATEGORY_STYLE = { icon: '📰', color: '#6b7280' };

const CreateStage1: React.FC<CreateStage1Props> = ({ 
  initialData, 
  onNext, 
  categoryGroups,
  allCategories
}) => {
  const [formData, setFormData] = useState<Stage1Data>(initialData);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);

  const categoryStyleMap = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    categoryGroups.forEach(group => {
      const style = MAIN_CATEGORY_GROUPS[group.mainSlug] || DEFAULT_CATEGORY_STYLE;
      map.set(group.mainSlug, style);
    });
    return map;
  }, [categoryGroups]);

  const getCategoryStyle = (mainSlug: string) => {
    return categoryStyleMap.get(mainSlug) || DEFAULT_CATEGORY_STYLE;
  };

  const handleMainCategoryToggle = (group: CategoryGroup) => {
    const categoryKey = group.mainSlug;
    
    if (selectedMainCategories.includes(categoryKey)) {
      setSelectedMainCategories(prev => prev.filter(g => g !== categoryKey));
      const subCatIds = group.categories.map(sc => sc.category_id);
      
      setFormData(prev => {
        const newCategoryIds = prev.category_ids.filter(id => !subCatIds.includes(id));
        const currentPrimaryId = parseInt(prev.primary_category_id);
        
        let newPrimaryCategoryId = prev.primary_category_id;
        if (subCatIds.includes(currentPrimaryId)) {
          newPrimaryCategoryId = newCategoryIds.length > 0 ? newCategoryIds[0].toString() : '';
        }
        
        return {
          ...prev,
          category_ids: newCategoryIds,
          primary_category_id: newPrimaryCategoryId
        };
      });
    } else {
      if (selectedMainCategories.length >= 2) {
        alert('Maximum 2 main categories allowed');
        return;
      }
      setSelectedMainCategories(prev => [...prev, categoryKey]);
    }
  };

  const handleSubCategoryToggle = (categoryId: number, group: CategoryGroup) => {
    const categoryKey = group.mainSlug;
    
    if (!selectedMainCategories.includes(categoryKey)) {
      if (selectedMainCategories.length >= 2) {
        alert('Maximum 2 main categories allowed');
        return;
      }
      setSelectedMainCategories(prev => [...prev, categoryKey]);
    }

    setFormData(prev => {
      const isSelected = prev.category_ids.includes(categoryId);
      const newCategoryIds = isSelected
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId];

      let newPrimaryCategoryId = prev.primary_category_id;
      
      if (isSelected && prev.primary_category_id === categoryId.toString()) {
        newPrimaryCategoryId = newCategoryIds.length > 0 ? newCategoryIds[0].toString() : '';
      } else if (!isSelected && newCategoryIds.length === 1) {
        newPrimaryCategoryId = categoryId.toString();
      } else if (!isSelected && !prev.primary_category_id) {
        newPrimaryCategoryId = categoryId.toString();
      }

      return {
        ...prev,
        category_ids: newCategoryIds,
        primary_category_id: newPrimaryCategoryId
      };
    });
  };

  const handlePrimaryCategoryChange = (categoryId: number) => {
    if (!formData.category_ids.includes(categoryId)) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      primary_category_id: categoryId.toString()
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (formData.category_ids.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (!formData.primary_category_id || !formData.category_ids.includes(parseInt(formData.primary_category_id))) {
      alert('Please select a valid primary category from your selected categories');
      return;
    }

    onNext(formData);
  };

  const selectedCategoriesWithStyles = useMemo(() => {
    return allCategories
      .filter(cat => formData.category_ids.includes(cat.category_id))
      .map(cat => {
        const style = cat.group ? getCategoryStyle(cat.group) : DEFAULT_CATEGORY_STYLE;
        return { category: cat, style };
      });
  }, [allCategories, formData.category_ids, getCategoryStyle]);

  return (
    <div className="admin-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          📝 Create New Article - Stage 1
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Basic information and categorization
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem' }}>
            Title <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter article title..."
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              background: 'var(--bg-content)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '1rem' }}>
              Categories <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select up to 2 main categories and their subcategories. Choose one as primary.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {categoryGroups.map((group) => {
              const isSelected = selectedMainCategories.includes(group.mainSlug);
              const categoryStyle = getCategoryStyle(group.mainSlug);
              
              return (
                <div
                  key={group.mainSlug}
                  style={{
                    padding: '1rem',
                    border: isSelected ? `2px solid ${categoryStyle.color}` : '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    background: isSelected ? `${categoryStyle.color}10` : 'var(--bg-content)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => handleMainCategoryToggle(group)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1.5rem' }}>{categoryStyle.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {group.title}
                    </span>
                  </div>

                  {isSelected && group.categories.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-primary)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        Subcategories:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {group.categories.map((cat) => (
                          <label
                            key={cat.category_id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              background: formData.category_ids.includes(cat.category_id) ? 'var(--bg-card)' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.category_ids.includes(cat.category_id)}
                              onChange={() => handleSubCategoryToggle(cat.category_id, group)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{cat.name}</span>
                            {formData.primary_category_id === cat.category_id.toString() && (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: categoryStyle.color, color: 'white', borderRadius: '4px', fontWeight: 600 }}>
                                PRIMARY
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {formData.category_ids.length > 1 && (
            <div style={{ padding: '1rem', background: 'var(--bg-content)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Select Primary Category <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedCategoriesWithStyles.map(({ category: cat, style }) => {
                  const isPrimary = formData.primary_category_id === cat.category_id.toString();
                  
                  return (
                    <button
                      key={cat.category_id}
                      type="button"
                      onClick={() => handlePrimaryCategoryChange(cat.category_id)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: isPrimary ? `2px solid ${style.color}` : '1px solid var(--border-primary)',
                        borderRadius: '20px',
                        background: isPrimary ? `${style.color}20` : 'var(--bg-card)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isPrimary ? 600 : 400,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isPrimary && <span>⭐</span>}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1rem' }}>
            ⚡ Priority Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { value: 'high', label: 'High', icon: '🔴', color: '#dc2626' },
              { value: 'medium', label: 'Medium', icon: '🟡', color: '#f59e0b' },
              { value: 'low', label: 'Low', icon: '🟢', color: '#059669' }
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                style={{
                  padding: '1rem',
                  border: formData.priority === priority.value ? `2px solid ${priority.color}` : '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  background: formData.priority === priority.value ? `${priority.color}15` : 'var(--bg-content)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{priority.icon}</span>
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pagination" style={{ borderTop: '2px solid var(--border-primary)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="new-post-btn" style={{ minWidth: '200px' }}>
            Next: Content Editor →
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStage1;