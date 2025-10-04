'use client';

import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { A4_WIDTH_SCREEN, A4_HEIGHT_SCREEN, CanvasObject } from '@/types/canvas';
import { CanvasImage } from './CanvasImage';
import { CanvasTable } from './CanvasTable';

interface A4PageProps {
  pageIndex: number;
  objects?: CanvasObject[];
  onObjectUpdate?: (objectId: string, attrs: any) => void;
  onObjectSelect?: (objectId: string | null) => void;
  onCellEdit?: (objectId: string, rowIndex: number, colIndex: number, text: string) => void;
  selectedObjectId?: string | null;
  className?: string;
}

export function A4Page({
  pageIndex,
  objects = [],
  onObjectUpdate,
  onObjectSelect,
  onCellEdit,
  selectedObjectId,
  className,
}: A4PageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);

  // 배경 클릭 시 선택 해제
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 빈 공간 클릭 시에만
    if (e.target === e.target.getStage()) {
      onObjectSelect?.(null);
    }
  };

  // 줌 기능 (Ctrl + Wheel)
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    if (e.evt.ctrlKey) {
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newScale = e.evt.deltaY > 0 ? oldScale * 0.95 : oldScale * 1.05;
      const clampedScale = Math.max(0.5, Math.min(2, newScale));

      setScale(clampedScale);
      stage.scale({ x: clampedScale, y: clampedScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      stage.position(newPos);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Page Number Indicator */}
      <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md z-10">
        Page {pageIndex + 1}
      </div>

      {/* Konva Stage - A4 크기 */}
      <div className="shadow-xl border border-gray-300 bg-white" style={{ width: A4_WIDTH_SCREEN, height: A4_HEIGHT_SCREEN }}>
        <Stage
          ref={stageRef}
          width={A4_WIDTH_SCREEN}
          height={A4_HEIGHT_SCREEN}
          onClick={handleStageClick}
          onWheel={handleWheel}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {/* 배경 */}
            <Rect
              x={0}
              y={0}
              width={A4_WIDTH_SCREEN}
              height={A4_HEIGHT_SCREEN}
              fill="white"
            />

            {/* 페이지 여백 가이드 (선택적) */}
            <Rect
              x={40}
              y={40}
              width={A4_WIDTH_SCREEN - 80}
              height={A4_HEIGHT_SCREEN - 80}
              stroke="#e5e7eb"
              strokeWidth={1}
              dash={[5, 5]}
              listening={false}
            />

            {/* 캔버스 객체들 렌더링 */}
            {objects.map((obj) => {
              if (obj.type === 'image') {
                return (
                  <CanvasImage
                    key={obj.id}
                    object={obj}
                    isSelected={selectedObjectId === obj.id}
                    onSelect={() => onObjectSelect?.(obj.id)}
                    onUpdate={(attrs) => onObjectUpdate?.(obj.id, attrs)}
                  />
                );
              }
              
              if (obj.type === 'table') {
                return (
                  <CanvasTable
                    key={obj.id}
                    object={obj}
                    isSelected={selectedObjectId === obj.id}
                    onSelect={() => onObjectSelect?.(obj.id)}
                    onUpdate={(attrs) => onObjectUpdate?.(obj.id, attrs)}
                    onCellEdit={(row, col, text) => onCellEdit?.(obj.id, row, col, text)}
                  />
                );
              }
              
              return null;
            })}

            {/* 워터마크 (개발용) */}
            <Text
              x={A4_WIDTH_SCREEN / 2 - 100}
              y={A4_HEIGHT_SCREEN - 60}
              text="ESG Report Editor POC"
              fontSize={12}
              fill="#d1d5db"
              listening={false}
            />
          </Layer>
        </Stage>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs">
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="px-2 py-1 hover:bg-gray-100 rounded"
        >
          −
        </button>
        <span className="text-gray-700 font-medium">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="px-2 py-1 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-2 py-1 hover:bg-gray-100 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

