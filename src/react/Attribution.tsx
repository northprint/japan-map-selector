import React from 'react';
import { AttributionProps, getAttributionText } from '../core/attribution';

/**
 * 国土数値情報の出典表示用Reactコンポーネント
 */
export const Attribution: React.FC<AttributionProps> = ({
  showLink = true,
  className = 'japan-map-attribution',
  style = {}
}) => {
  const defaultStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '4px',
    margin: '4px',
    ...style
  };

  if (showLink) {
    return (
      <div className={className} style={defaultStyle}>
        地図データ：
        <a 
          href="https://nlftp.mlit.go.jp/ksj/index.html" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0066cc', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          国土数値情報（行政区域データ）
        </a>
        （国土交通省）を加工して作成
      </div>
    );
  }

  return (
    <div className={className} style={defaultStyle}>
      {getAttributionText()}
    </div>
  );
};