'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = `tradingview-widget-${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  useEffect(() => {
    const container = containerRef.current;
    if (container && !container.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "zh_CN",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "${widgetId}"
        }`;
      container.appendChild(script);
    }
  }, [symbol, widgetId]);

  return (
    <div
      ref={containerRef}
      id={widgetId}
      style={{ height: '100%', width: '100%' }}
    />
  );
}

export default memo(TradingViewWidget);
