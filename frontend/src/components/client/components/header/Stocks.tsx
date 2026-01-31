'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  direction: 'up' | 'down';
  name?: string;
}

export default function Stocks() {
  const [isMobile, setIsMobile] = useState(false);
  const ribbonTrackRef = useRef<HTMLDivElement>(null);
  const desktopTickerRef = useRef<HTMLDivElement>(null);

  const [stockPrices, setStockPrices] = useState<Stock[]>([
    { symbol: 'SCOM', price: 12.45, change: 0.32, direction: 'up', name: 'Safaricom' },
    { symbol: 'EQTY', price: 45.80, change: -0.15, direction: 'down', name: 'Equity Bank' },
    { symbol: 'KCB', price: 38.50, change: 0.75, direction: 'up', name: 'KCB Bank' },
    { symbol: 'EABL', price: 156.00, change: 1.50, direction: 'up', name: 'EABL' },
    { symbol: 'BAMB', price: 35.40, change: -0.30, direction: 'down', name: 'Bamburi Cement' },
    { symbol: 'COOP', price: 14.20, change: 0.25, direction: 'up', name: 'Co-op Bank' },
    { symbol: 'ABSA', price: 13.95, change: 0.18, direction: 'up', name: 'Absa Bank Kenya' },
    { symbol: 'NCBA', price: 42.00, change: -0.25, direction: 'down', name: 'NCBA Bank' },
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStockPrices(prev => prev.map(stock => {
        const priceChange = (Math.random() - 0.5) * 0.5;
        const newPrice = Math.max(stock.price + priceChange, 0.5);
        const newChange = (Math.random() - 0.5) * 1;
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(newChange.toFixed(2)),
          direction: newChange >= 0 ? 'up' : 'down'
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollRibbonLeft = () => {
    if (ribbonTrackRef.current) {
      ribbonTrackRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRibbonRight = () => {
    if (ribbonTrackRef.current) {
      ribbonTrackRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const scrollDesktopLeft = () => {
    if (desktopTickerRef.current) {
      const ticker = desktopTickerRef.current.querySelector('.stock-ticker') as HTMLElement;
      if (ticker) {
        ticker.style.animationPlayState = 'paused';
        const currentTransform = window.getComputedStyle(ticker).transform;
        const matrix = new DOMMatrix(currentTransform);
        const currentX = matrix.m41;
        ticker.style.transform = `translateX(${currentX + 300}px)`;
        setTimeout(() => {
          ticker.style.animationPlayState = 'running';
        }, 500);
      }
    }
  };

  const scrollDesktopRight = () => {
    if (desktopTickerRef.current) {
      const ticker = desktopTickerRef.current.querySelector('.stock-ticker') as HTMLElement;
      if (ticker) {
        ticker.style.animationPlayState = 'paused';
        const currentTransform = window.getComputedStyle(ticker).transform;
        const matrix = new DOMMatrix(currentTransform);
        const currentX = matrix.m41;
        ticker.style.transform = `translateX(${currentX - 300}px)`;
        setTimeout(() => {
          ticker.style.animationPlayState = 'running';
        }, 500);
      }
    }
  };

  const renderStockItem = (stock: Stock, isMobile: boolean = false) => {
    const classes = isMobile ? 'stock-item-mobile' : 'stock-item';
    const symbolClass = isMobile ? 'stock-symbol-mobile' : 'stock-symbol';
    const priceClass = isMobile ? 'stock-price-mobile' : 'stock-price';
    const changeClass = isMobile ? 'stock-change-mobile' : 'stock-change';

    return (
      <div className={classes} key={stock.symbol} title={stock.name}>
        <span className={symbolClass}>{stock.symbol}</span>
        <span className={priceClass}>KSh {stock.price.toFixed(2)}</span>
        <span className={`${changeClass} ${stock.direction}`}>
          {stock.direction === 'up' ? '↗' : '↘'} {Math.abs(stock.change).toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div className="stock-ticker-compact">
      {!isMobile ? (
        <>
          <button 
            className="stock-scroll-btn-desktop"
            onClick={scrollDesktopLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
          
          <div ref={desktopTickerRef} className="stock-ticker-wrapper">
            <div className="stock-ticker">
              {[...stockPrices, ...stockPrices].map((stock, index) => (
                <React.Fragment key={`stock-${index}`}>
                  {renderStockItem(stock, false)}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <button 
            className="stock-scroll-btn-desktop"
            onClick={scrollDesktopRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        </>
      ) : (
        <div className="stock-ribbon-wrapper">
          <button 
            className="stock-scroll-btn"
            onClick={scrollRibbonLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
          
          <div className="stock-ribbon-container">
            <div ref={ribbonTrackRef} className="stock-ribbon-track">
              {stockPrices.map((stock, index) => (
                <React.Fragment key={`mobile-${index}`}>
                  {renderStockItem(stock, true)}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <button 
            className="stock-scroll-btn"
            onClick={scrollRibbonRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}