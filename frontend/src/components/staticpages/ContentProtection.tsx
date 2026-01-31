// C:\Projects\DAILY VAIBE\frontend\src\components\staticpages\ContentProtection.tsx
import React, { useEffect } from 'react';

export function useContentProtection() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.static-content-wrapper, .no-select')) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.static-content-wrapper, .no-select')) {
        if ((e.ctrlKey || e.metaKey) && (
          e.key === 'c' || 
          e.key === 'x' || 
          e.key === 'a' ||
          e.key === 's' ||
          e.key === 'p'
        )) {
          e.preventDefault();
          return false;
        }
        if (
          e.key === 'F12' ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          ((e.ctrlKey || e.metaKey) && e.key === 'u')
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        const target = e.target as HTMLElement;
        if (target.closest('.static-content-wrapper, .no-select')) {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.static-content-wrapper, .no-select')) {
        e.preventDefault();
        return false;
      }
    };

    const handleBeforePrint = () => {
      const staticContent = document.querySelector('.static-content-wrapper');
      if (staticContent) {
        alert('Printing is disabled for this page. Please contact us for authorized copies.');
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);
}