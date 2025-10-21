'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Stage, Layer, Rect } from 'react-konva';
import { UnifiedObject, TextObject, ImageObject, A4_WIDTH, A4_HEIGHT } from '@/types/unified';
import { RichTextBox } from '@/components/legacy/unified/RichTextBox';
import { CanvasImage } from '@/components/legacy/canvas/CanvasImage';
import { CanvasTable } from '@/components/legacy/canvas/CanvasTable';
import { FileEdit, Type, Image as ImageIcon, Table as TableIcon, Save } from 'lucide-react';

export default function ReportEditorPage() {
  const [objects, setObjects] = useState<UnifiedObject[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  // 텍스트 박스 추가
  const handleAddText = () => {
    const newText: TextObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 100,
      rotation: 0,
      zIndex: objects.length,
      pageIndex: 0,
      locked: false,
      visible: true,
      content: '<p>텍스트를 입력하세요...</p>',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      textAlign: 'left',
      padding: 10,
      borderWidth: 1,
      borderColor: '#d1d5db',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setObjects([...objects, newText]);
    setSelectedObjectIds([newText.id]);
  };

  // 이미지 추가
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newImage: ImageObject = {
          id: `image-${Date.now()}`,
          type: 'image',
          src: event.target?.result as string,
          x: 150,
          y: 150,
          width: Math.min(400, img.width),
          height: Math.min(400, img.height * (400 / img.width)),
          rotation: 0,
          zIndex: objects.length,
          pageIndex: 0,
          locked: false,
          visible: true,
          originalWidth: img.width,
          originalHeight: img.height,
          maintainAspectRatio: true,
          opacity: 1,
          borderRadius: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setObjects([...objects, newImage]);
        setSelectedObjectIds([newImage.id]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 객체 업데이트
  const handleObjectUpdate = (objectId: string, attrs: any) => {
    const newObjects = objects.map((obj) =>
      obj.id === objectId ? { ...obj, ...attrs, updatedAt: new Date().toISOString() } : obj
    );
    setObjects(newObjects as UnifiedObject[]);
  };

  // 객체 선택
  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectIds([objectId]);
    setEditingObjectId(null);
  };

  // 배경 클릭 (선택 해제)
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedObjectIds([]);
      setEditingObjectId(null);
    }
  };

  const textObjects = objects.filter((obj) => obj.type === 'text') as TextObject[];
  const canvasObjects = objects.filter((obj) => obj.type !== 'text');

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileEdit className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Unified Report Editor
              </h1>
              <p className="text-xs text-gray-500">
                텍스트 + 이미지 + 표를 하나의 캔버스에서 편집
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddText}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Type className="w-4 h-4" />
              <span>텍스트</span>
            </button>

            <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              <span>이미지</span>
              <input type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
            </label>

            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4" />
              <span>저장</span>
            </button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="relative mx-auto" style={{ width: A4_WIDTH, height: A4_HEIGHT }}>
            {/* Konva Canvas Layer (이미지, 표) */}
            <Stage width={A4_WIDTH} height={A4_HEIGHT} onClick={handleStageClick}>
              <Layer>
                <Rect x={0} y={0} width={A4_WIDTH} height={A4_HEIGHT} fill="white" />
                
                {canvasObjects.map((obj) => {
                  if (obj.type === 'image') {
                    return (
                      <CanvasImage
                        key={obj.id}
                        object={obj}
                        isSelected={selectedObjectIds.includes(obj.id)}
                        onSelect={() => handleObjectSelect(obj.id)}
                        onUpdate={(attrs) => handleObjectUpdate(obj.id, attrs)}
                      />
                    );
                  }
                  if (obj.type === 'table') {
                    return (
                      <CanvasTable
                        key={obj.id}
                        object={obj}
                        isSelected={selectedObjectIds.includes(obj.id)}
                        onSelect={() => handleObjectSelect(obj.id)}
                        onUpdate={(attrs) => handleObjectUpdate(obj.id, attrs)}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>

            {/* HTML Overlay Layer (텍스트) */}
            {textObjects.map((obj) => (
              <RichTextBox
                key={obj.id}
                object={obj}
                isSelected={selectedObjectIds.includes(obj.id)}
                isEditing={editingObjectId === obj.id}
                onSelect={() => handleObjectSelect(obj.id)}
                onUpdate={(attrs) => handleObjectUpdate(obj.id, attrs)}
                onStartEdit={() => setEditingObjectId(obj.id)}
                onEndEdit={() => setEditingObjectId(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

