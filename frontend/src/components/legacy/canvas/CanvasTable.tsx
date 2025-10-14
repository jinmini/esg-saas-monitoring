'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { TableObject } from '@/types/canvas';

interface CanvasTableProps {
  object: TableObject;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (attrs: Partial<TableObject>) => void;
  onCellEdit?: (rowIndex: number, colIndex: number, text: string) => void;
}

export function CanvasTable({ 
  object, 
  isSelected, 
  onSelect, 
  onUpdate,
  onCellEdit 
}: CanvasTableProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

  // Transformer 연결
  useEffect(() => {
    if (isSelected && groupRef.current && transformerRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // 드래그 종료
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onUpdate({
      x: e.target.x(),
      y: e.target.y(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Transform 종료
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onUpdate({
      x: node.x(),
      y: node.y(),
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      updatedAt: new Date().toISOString(),
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  // 셀 크기 계산
  const cellWidth = object.width / object.cols;
  const cellHeight = object.height / object.rows;

  // 셀 더블클릭 - 편집 모드
  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    
    // 간단한 프롬프트로 텍스트 편집 (추후 개선 가능)
    const currentText = object.cells[rowIndex][colIndex].text;
    const newText = window.prompt('셀 내용을 입력하세요:', currentText);
    
    if (newText !== null && onCellEdit) {
      onCellEdit(rowIndex, colIndex, newText);
    }
    setEditingCell(null);
  };

  // 테이블 렌더링
  const renderTable = () => {
    const elements: JSX.Element[] = [];
    
    // 배경
    elements.push(
      <Rect
        key="background"
        x={0}
        y={0}
        width={object.width}
        height={object.height}
        fill="white"
        listening={false}
      />
    );

    // 셀 렌더링
    for (let row = 0; row < object.rows; row++) {
      for (let col = 0; col < object.cols; col++) {
        const cell = object.cells[row][col];
        const x = col * cellWidth;
        const y = row * cellHeight;
        const width = cellWidth * cell.colSpan;
        const height = cellHeight * cell.rowSpan;

        // 셀 배경 (헤더 행인 경우 다른 색상)
        const isHeaderRow = object.headerRow && row === 0;
        elements.push(
          <Rect
            key={`cell-bg-${row}-${col}`}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={cell.backgroundColor || (isHeaderRow ? '#f3f4f6' : 'white')}
            onDblClick={() => handleCellDoubleClick(row, col)}
          />
        );

        // 셀 테두리
        elements.push(
          <Rect
            key={`cell-border-${row}-${col}`}
            x={x}
            y={y}
            width={width}
            height={height}
            stroke={object.borderColor}
            strokeWidth={object.borderWidth}
            listening={false}
          />
        );

        // 셀 텍스트
        elements.push(
          <Text
            key={`cell-text-${row}-${col}`}
            x={x + object.cellPadding}
            y={y + object.cellPadding}
            width={width - object.cellPadding * 2}
            height={height - object.cellPadding * 2}
            text={cell.text}
            fontSize={14}
            fontFamily="Arial"
            fill="black"
            align={cell.textAlign}
            verticalAlign={cell.verticalAlign}
            wrap="word"
            listening={false}
          />
        );
      }
    }

    return elements;
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={object.x}
        y={object.y}
        draggable={!object.locked && isSelected}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderTable()}
      </Group>

      {/* Transformer */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
          ]}
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

