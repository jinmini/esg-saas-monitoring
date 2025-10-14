'use client';

import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { ImageObject } from '@/types/canvas';

interface CanvasImageProps {
  object: ImageObject;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (attrs: Partial<ImageObject>) => void;
}

export function CanvasImage({ object, isSelected, onSelect, onUpdate }: CanvasImageProps) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image] = useImage(object.src);

  // Transformer 연결
  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // 드래그 종료 시 위치 업데이트
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onUpdate({
      x: e.target.x(),
      y: e.target.y(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Transform 종료 시 크기/회전 업데이트
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // 비율 유지 옵션이 켜져 있으면 균일한 스케일 적용
    if (object.maintainAspectRatio) {
      const avgScale = (scaleX + scaleY) / 2;
      node.scaleX(avgScale);
      node.scaleY(avgScale);
    }

    // 스케일을 width/height에 적용하고 스케일 리셋
    onUpdate({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * node.scaleX()),
      height: Math.max(5, node.height() * node.scaleY()),
      rotation: node.rotation(),
      updatedAt: new Date().toISOString(),
    });

    // 스케일 리셋
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        rotation={object.rotation}
        draggable={!object.locked}
        opacity={object.opacity}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        // 그림자 효과 (선택 시)
        shadowColor={isSelected ? 'rgba(22, 163, 74, 0.5)' : undefined}
        shadowBlur={isSelected ? 10 : 0}
        shadowOffset={isSelected ? { x: 0, y: 0 } : undefined}
      />
      
      {/* Transformer - 선택된 경우에만 표시 */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          keepRatio={object.maintainAspectRatio}
          enabledAnchors={
            object.maintainAspectRatio
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
              : [
                  'top-left',
                  'top-center',
                  'top-right',
                  'middle-right',
                  'middle-left',
                  'bottom-left',
                  'bottom-center',
                  'bottom-right',
                ]
          }
          borderStroke="#16a34a"
          borderStrokeWidth={2}
          anchorStroke="#16a34a"
          anchorFill="white"
          anchorSize={8}
          anchorCornerRadius={4}
        />
      )}
    </>
  );
}

