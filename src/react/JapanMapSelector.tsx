// Reactラッパーコンポーネント

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JapanMapSelector as CoreSelector } from '../core/japan-map-selector';
import { 
  JapanMapSelectorProps, 
  MapState, 
  Prefecture, 
  Municipality 
} from '../types';

export interface ReactJapanMapSelectorProps extends JapanMapSelectorProps {
  prefectureDataUrl: string;
  municipalityDataUrl: string;
  className?: string;
}

export const JapanMapSelector: React.FC<ReactJapanMapSelectorProps> = ({
  prefectureDataUrl,
  municipalityDataUrl,
  className,
  ...props
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const selectorRef = useRef<CoreSelector | null>(null);
  const [state, setState] = useState<MapState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化
  useEffect(() => {
    const selector = new CoreSelector(props);
    selectorRef.current = selector;

    // 状態変更のリスナー設定
    selector.on('stateChanged', (newState: MapState) => {
      setState({ ...newState });
    });

    // データの読み込み
    selector.initialize(prefectureDataUrl, municipalityDataUrl)
      .then(() => {
        setIsLoading(false);
        setState(selector.getState());
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      // クリーンアップ
      selectorRef.current = null;
    };
  }, [prefectureDataUrl, municipalityDataUrl]);

  // プロパティの更新
  useEffect(() => {
    if (selectorRef.current && props.selectedPrefectureCode) {
      selectorRef.current.selectPrefecture(props.selectedPrefectureCode);
    }
  }, [props.selectedPrefectureCode]);

  // 都道府県クリックハンドラー
  const handlePrefectureClick = useCallback((prefecture: Prefecture) => {
    selectorRef.current?.selectPrefecture(prefecture.code);
  }, []);

  // 市区町村クリックハンドラー
  const handleMunicipalityClick = useCallback((municipality: Municipality) => {
    selectorRef.current?.selectMunicipality(municipality.code);
  }, []);

  // 都道府県ホバーハンドラー
  const handlePrefectureMouseEnter = useCallback((prefecture: Prefecture) => {
    selectorRef.current?.hoverPrefecture(prefecture.code);
  }, []);

  const handlePrefectureMouseLeave = useCallback(() => {
    selectorRef.current?.hoverPrefecture(null);
  }, []);

  // 市区町村ホバーハンドラー
  const handleMunicipalityMouseEnter = useCallback((municipality: Municipality) => {
    selectorRef.current?.hoverMunicipality(municipality.code);
  }, []);

  const handleMunicipalityMouseLeave = useCallback(() => {
    selectorRef.current?.hoverMunicipality(null);
  }, []);

  // 戻るボタンハンドラー
  const handleBackClick = useCallback(() => {
    selectorRef.current?.resetView();
  }, []);

  if (isLoading) {
    return <div className={className}>読み込み中...</div>;
  }

  if (error) {
    return <div className={className}>エラー: {error}</div>;
  }

  if (!selectorRef.current || !state) {
    return null;
  }

  const selector = selectorRef.current;
  const prefectures = selector.getPrefectures();
  const municipalities = selector.getSelectedMunicipalities();

  return (
    <div className={className} style={{ position: 'relative' }}>
      {state.selectedPrefecture && (
        <button
          onClick={handleBackClick}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 10,
            padding: '8px 16px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← 全国に戻る
        </button>
      )}
      
      <svg
        ref={svgRef}
        width={props.width || 800}
        height={props.height || 600}
        viewBox={state.viewBox}
        style={{ background: '#f8f8f8' }}
      >
        {/* 都道府県表示（全国ビュー時） */}
        {!state.selectedPrefecture && prefectures.map(prefecture => (
          <path
            key={prefecture.code}
            d={selector.getPrefecturePath(prefecture)}
            fill={
              state.hoveredPrefecture?.code === prefecture.code
                ? props.prefectureHoverColor || '#c0c0c0'
                : props.prefectureColor || '#e0e0e0'
            }
            stroke="#999"
            strokeWidth="0.5"
            style={{ cursor: 'pointer' }}
            onClick={() => handlePrefectureClick(prefecture)}
            onMouseEnter={() => handlePrefectureMouseEnter(prefecture)}
            onMouseLeave={handlePrefectureMouseLeave}
          >
            <title>{prefecture.name}</title>
          </path>
        ))}

        {/* 市区町村表示（都道府県選択時） */}
        {state.selectedPrefecture && municipalities.map(municipality => (
          <path
            key={municipality.code}
            d={selector.getMunicipalityPath(municipality)}
            fill={
              state.hoveredMunicipality?.code === municipality.code
                ? props.municipalityHoverColor || '#d0d0d0'
                : props.municipalityColor || '#f0f0f0'
            }
            stroke="#aaa"
            strokeWidth="0.5"
            style={{ cursor: 'pointer' }}
            onClick={() => handleMunicipalityClick(municipality)}
            onMouseEnter={() => handleMunicipalityMouseEnter(municipality)}
            onMouseLeave={handleMunicipalityMouseLeave}
          >
            <title>{municipality.name}</title>
          </path>
        ))}
      </svg>

      {/* ホバー情報表示 */}
      {(state.hoveredPrefecture || state.hoveredMunicipality) && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {state.hoveredPrefecture && !state.selectedPrefecture && (
            <div>{state.hoveredPrefecture.name}</div>
          )}
          {state.hoveredMunicipality && (
            <div>{state.hoveredMunicipality.name}</div>
          )}
        </div>
      )}
    </div>
  );
};