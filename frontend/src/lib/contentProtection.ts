/**
 * Enhanced Content Protection System
 * Prevents ALL text copying - only shares links instead
 */

import React from 'react';

interface ProtectionConfig {
  enabled: boolean;
  allowLinkSharing: boolean;
  showNotification: boolean;
  customMessage?: string;
  extraStrict?: boolean;
}

class ContentProtection {
  private config: ProtectionConfig;
  private notificationTimeout: NodeJS.Timeout | null = null;
  private cleanupFunctions: Array<() => void> = [];
  private styleElement: HTMLStyleElement | null = null;
  private clipboardInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ProtectionConfig> = {}) {
    this.config = {
      enabled: true,
      allowLinkSharing: true,
      showNotification: true,
      extraStrict: false,
      ...config
    };
  }

  public init(): () => void {
    if (typeof window === 'undefined' || !this.config.enabled) {
      return () => {};
    }

    this.addProtectionStyles();
    this.attachEventListeners();
    this.protectImages();
    
    if (this.config.extraStrict) {
      this.enableStrictMode();
    }

    this.preventDevTools();
    this.startClipboardCleaner();

    return () => this.cleanup();
  }

  private attachEventListeners(): void {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.showProtectionNotification('Right-click disabled. Share via link instead!');
      return false;
    };

    const handleSelectStart = (e: Event) => {
      if (this.isAllowedElement(e.target as Element)) return true;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (e.clipboardData) {
        e.clipboardData.clearData();
        
        if (this.config.allowLinkSharing) {
          const url = window.location.href;
          const title = document.title;
          e.clipboardData.setData('text/plain', `${title}\n${url}`);
          e.clipboardData.setData('text/html', `<a href="${url}">${title}</a>`);
          this.showProtectionNotification('📎 Link copied! Share this URL instead of copying content.');
        } else {
          this.showProtectionNotification('❌ Content copying is disabled.');
        }
      }
      
      setTimeout(() => {
        if (this.config.allowLinkSharing) {
          const url = window.location.href;
          const title = document.title;
          navigator.clipboard.writeText(`${title}\n${url}`).catch(() => {});
        } else {
          navigator.clipboard.writeText('').catch(() => {});
        }
      }, 10);
      
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.clipboardData) {
        e.clipboardData.clearData();
      }
      this.showProtectionNotification('❌ Content cannot be cut.');
      return false;
    };

    const handleBeforeCopy = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.isAllowedElement(e.target as Element)) return true;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      if (ctrl && ['c', 'x', 'a', 'insert'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        if (key === 'c' && this.config.allowLinkSharing) {
          const url = window.location.href;
          const title = document.title;
          navigator.clipboard.writeText(`${title}\n${url}`).then(() => {
            this.showProtectionNotification('📎 Link copied to clipboard!');
          }).catch(() => {});
        } else {
          this.showProtectionNotification('❌ This action is disabled.');
        }
        return false;
      }

      if (ctrl && shift && 'insert' === key) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      if (ctrl && ['u', 's', 'p'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.showProtectionNotification('❌ This action is disabled.');
        return false;
      }

      if (e.key === 'F12' || (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.showProtectionNotification('⚠️ Developer tools are restricted.');
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('').catch(() => {});
        this.showProtectionNotification('📸 Screenshots are discouraged. Please respect content rights.');
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.showProtectionNotification('❌ Dragging content is disabled.');
      return false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (this.isAllowedElement(e.target as Element)) return true;
      if (e.detail > 1) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setTimeout(() => {
          selection?.removeAllRanges();
        }, 0);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    document.addEventListener('selectstart', handleSelectStart, { capture: true, passive: false });
    document.addEventListener('copy', handleCopy, { capture: true, passive: false });
    document.addEventListener('cut', handleCut, { capture: true, passive: false });
    document.addEventListener('beforecopy', handleBeforeCopy, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    document.addEventListener('dragstart', handleDragStart, { capture: true, passive: false });
    document.addEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
    document.addEventListener('selectionchange', handleSelection, { capture: true });

    this.cleanupFunctions.push(
      () => document.removeEventListener('contextmenu', handleContextMenu, { capture: true }),
      () => document.removeEventListener('selectstart', handleSelectStart, { capture: true }),
      () => document.removeEventListener('copy', handleCopy, { capture: true }),
      () => document.removeEventListener('cut', handleCut, { capture: true }),
      () => document.removeEventListener('beforecopy', handleBeforeCopy, { capture: true }),
      () => document.removeEventListener('keydown', handleKeyDown, { capture: true }),
      () => document.removeEventListener('keyup', handleKeyUp, { capture: true }),
      () => document.removeEventListener('dragstart', handleDragStart, { capture: true }),
      () => document.removeEventListener('mousedown', handleMouseDown, { capture: true }),
      () => document.removeEventListener('selectionchange', handleSelection, { capture: true })
    );
  }

  private isAllowedElement(element: Element | null): boolean {
    if (!element) return false;
    const tag = element.tagName.toLowerCase();
    const isEditable = element.getAttribute('contenteditable') === 'true';
    return ['input', 'textarea'].includes(tag) || isEditable;
  }

  private protectImages(): void {
    const protectImage = (img: HTMLImageElement) => {
      img.setAttribute('draggable', 'false');
      img.style.userSelect = 'none';
      img.style.pointerEvents = 'none';
      (img.style as any).webkitUserDrag = 'none';
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    };

    document.querySelectorAll('img').forEach(img => protectImage(img as HTMLImageElement));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG') {
            protectImage(node as HTMLImageElement);
          }
          if (node instanceof Element) {
            node.querySelectorAll('img').forEach(img => protectImage(img as HTMLImageElement));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.cleanupFunctions.push(() => observer.disconnect());
  }

  private addProtectionStyles(): void {
    const styleId = 'content-protection-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      img, video, audio, svg, canvas {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
      
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        pointer-events: auto !important;
      }

      ::selection {
        background: transparent !important;
        color: inherit !important;
      }
      
      ::-moz-selection {
        background: transparent !important;
        color: inherit !important;
      }

      body {
        -webkit-user-modify: read-only !important;
      }
    `;
    
    document.head.appendChild(style);
    this.styleElement = style;
    
    this.cleanupFunctions.push(() => {
      const styleEl = document.getElementById(styleId);
      if (styleEl) styleEl.remove();
    });
  }

  private enableStrictMode(): void {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    const watermark = document.createElement('div');
    watermark.id = 'content-watermark';
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 200px,
        rgba(0,0,0,0.02) 200px,
        rgba(0,0,0,0.02) 220px
      );
    `;
    document.body.appendChild(watermark);
    
    this.cleanupFunctions.push(() => {
      const wm = document.getElementById('content-watermark');
      if (wm) wm.remove();
    });
  }

  private preventDevTools(): void {
    const element = new Image();
    let devtoolsOpen = false;

    Object.defineProperty(element, 'id', {
      get: () => {
        devtoolsOpen = true;
        this.showProtectionNotification('⚠️ Developer tools detected. Please close them.');
      }
    });

    setInterval(() => {
      devtoolsOpen = false;
      console.dir(element);
      console.clear();
    }, 1000);

    window.addEventListener('devtoolschange', () => {
      this.showProtectionNotification('⚠️ Developer tools are restricted on this site.');
    });
  }

  private startClipboardCleaner(): void {
    this.clipboardInterval = setInterval(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        selection.removeAllRanges();
      }
    }, 100);

    this.cleanupFunctions.push(() => {
      if (this.clipboardInterval) {
        clearInterval(this.clipboardInterval);
      }
    });
  }

  private showProtectionNotification(message: string): void {
    if (!this.config.showNotification) return;

    const notificationId = 'content-protection-notification';
    let notification = document.getElementById(notificationId);

    if (notification) notification.remove();

    notification = document.createElement('div');
    notification.id = notificationId;
    notification.textContent = this.config.customMessage || message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 320px;
      animation: slideInRight 0.3s ease-out;
      pointer-events: none;
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
    document.body.appendChild(notification);

    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);

    this.notificationTimeout = setTimeout(() => {
      if (notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification?.remove(), 300);
      }
    }, 3000);
  }

  private cleanup(): void {
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];
    
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
      this.clipboardInterval = null;
    }
  }

  public disable(): void {
    this.config.enabled = false;
    this.cleanup();
  }

  public enable(): void {
    this.config.enabled = true;
    this.init();
  }
}

export function useContentProtection(config?: Partial<ProtectionConfig>) {
  if (typeof window === 'undefined') return;

  const protection = React.useMemo(
    () => config ? new ContentProtection(config) : contentProtection,
    [config]
  );

  React.useEffect(() => {
    const cleanup = protection.init();
    return cleanup;
  }, [protection]);
}

const contentProtection = new ContentProtection({
  enabled: true,
  allowLinkSharing: true,
  showNotification: true,
});

export default contentProtection;
export { ContentProtection };

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      contentProtection.init();
    });
  } else {
    contentProtection.init();
  }
}

export const strictProtection = new ContentProtection({
  enabled: true,
  allowLinkSharing: false,
  showNotification: true,
  extraStrict: true,
  customMessage: '⚖️ Legal content is protected. Copying is prohibited.'
});

export const standardProtection = new ContentProtection({
  enabled: true,
  allowLinkSharing: true,
  showNotification: true,
  customMessage: '📰 Share this story using the link!'
});