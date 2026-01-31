import React, { useRef, useCallback, useState } from 'react';

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

interface ImageUploadProps {
  images: ImageFile[];
  maxImages: number;
  onImagesChange: (images: ImageFile[]) => void;
  onMessage: (type: 'success' | 'error' | 'warning', text: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  maxImages, 
  onImagesChange,
  onMessage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addImages = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      onMessage('error', 'Please select image files only');
      return;
    }

    if (images.length + imageFiles.length > maxImages) {
      onMessage('warning', `Can only add ${maxImages - images.length} more images (max ${maxImages})`);
      return;
    }

    const newImages: ImageFile[] = imageFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      file,
      preview: URL.createObjectURL(file),
      caption: 'Photo Credit: ',
      order: images.length + idx + 1,
      isFeatured: images.length === 0 && idx === 0,
      isUploading: false,
      hasWatermark: false,
      isExisting: false
    }));

    onImagesChange([...images, ...newImages]);
    onMessage('success', `${newImages.length} image(s) added`);
  }, [images, maxImages, onImagesChange, onMessage]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) files.push(blob);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      addImages(files);
    }
  }, [addImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }, [addImages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    addImages(files);
    
    e.target.value = '';
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    const removedImg = images.find(img => img.id === imageId);
    
    if (removedImg?.isFeatured && updatedImages.length > 0) {
      updatedImages[0].isFeatured = true;
    }
    
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      order: idx + 1
    }));
    
    onImagesChange(reorderedImages);
    onMessage('success', 'Image removed');
  };

  const setFeaturedImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isFeatured: img.id === imageId
    }));
    onImagesChange(updatedImages);
    onMessage('success', 'Featured image updated');
  };

  const toggleWatermark = (imageId: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, hasWatermark: !(img.hasWatermark ?? false) } : img
    );
    onImagesChange(updatedImages);
  };

  const updateCaption = (imageId: string, caption: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    );
    onImagesChange(updatedImages);
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-sidebar">
        <div className="upload-header">
          <h4 className="upload-title">🖼️ Upload</h4>
          <span className="image-count-badge">
            {images.length}/{maxImages}
          </span>
        </div>

        <div
          ref={pasteAreaRef}
          className={`paste-zone-compact ${isDragging ? 'drag-over' : ''}`}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
        >
          <div className="paste-zone-icon">📸</div>
          <div className="paste-zone-text">Click or Drop Images</div>
          <div className="paste-zone-hint">Or paste (Ctrl+V / Cmd+V)</div>
          <button
            type="button"
            className="upload-button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="file-input-hidden"
        />

        <div className="upload-tips">
          <div className="tips-title">Quick Tips:</div>
          <div>• Copy image anywhere</div>
          <div>• Click here & paste</div>
          <div>• Drag & drop files</div>
          <div>• Right-click → Paste</div>
        </div>
      </div>

      <div className="image-list-container">
        {images.length === 0 ? (
          <div className="empty-images-state">
            <div className="empty-icon">📷</div>
            <div className="empty-text">No images uploaded yet</div>
            <div className="empty-hint">
              Add images using the upload area on the left
            </div>
          </div>
        ) : (
          <div className="image-list">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`image-item ${img.isFeatured ? 'featured' : ''}`}
              >
                <div className="image-item-content">
                  <div className="image-preview-wrapper">
                    <img 
                      src={img.preview} 
                      alt={`Upload ${index + 1}`}
                      className="image-preview-thumb"
                    />
                    {img.isFeatured && (
                      <div className="featured-badge-small">⭐ Featured</div>
                    )}
                    {img.isExisting && (
                      <div className="existing-badge-small">📁 Existing</div>
                    )}
                  </div>

                  <div className="image-item-details">
                    <div className="image-item-number">
                      Image {index + 1}
                    </div>

                    <div className="image-item-actions">
                      {!img.isFeatured && (
                        <button
                          type="button"
                          onClick={() => setFeaturedImage(img.id)}
                          className="btn-set-featured"
                        >
                          ⭐ Set Featured
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="btn-delete-image"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <div className={`watermark-checkbox ${(img.hasWatermark ?? false) ? 'has-watermark' : 'no-watermark'}`}>
                      <label className="watermark-label">
                        <input
                          type="checkbox"
                          checked={img.hasWatermark ?? false}
                          onChange={() => toggleWatermark(img.id)}
                          className="watermark-input"
                        />
                        <span className="watermark-text">
                          {(img.hasWatermark ?? false) ? '✓ DV Watermark' : '⚠️ No Watermark'}
                        </span>
                        <span className="watermark-source">
                          {(img.hasWatermark ?? false) ? 'Our content' : 'Licensed'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                  placeholder="Photo Credit: [Photographer/Agency]"
                  className="image-caption-input"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;