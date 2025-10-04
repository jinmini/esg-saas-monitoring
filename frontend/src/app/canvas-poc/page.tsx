'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { A4Page } from '@/components/canvas/A4Page';
import { ImageObject } from '@/types/canvas';
import { FileImage, Plus, Save, Download, AlertCircle } from 'lucide-react';

export default function CanvasPOCPage() {
  const [objects, setObjects] = useState<ImageObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          x: 100,
          y: 100,
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setObjects([...objects, newImage]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 객체 업데이트
  const handleObjectUpdate = (objectId: string, attrs: Partial<ImageObject>) => {
    setObjects(
      objects.map((obj) =>
        obj.id === objectId ? { ...obj, ...attrs } : obj
      )
    );
  };

  // 선택된 객체 삭제
  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    setObjects(objects.filter((obj) => obj.id !== selectedObjectId));
    setSelectedObjectId(null);
  };

  // 비율 유지 토글
  const toggleAspectRatio = () => {
    if (!selectedObjectId) return;
    setObjects(
      objects.map((obj) =>
        obj.id === selectedObjectId
          ? { ...obj, maintainAspectRatio: !obj.maintainAspectRatio }
          : obj
      )
    );
  };

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileImage className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Canvas POC - A4 Report Editor
              </h1>
              <p className="text-xs text-gray-500">
                Konva.js 기반 자유 배치 에디터
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 이미지 추가 */}
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>이미지 추가</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save className="w-4 h-4" />
              <span>저장</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF 출력</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center space-x-2 text-blue-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            <p>
              <strong>Sprint 8 POC:</strong> A4 페이지 + 이미지 드래그 앤 드롭 + 크기 조절 (Transformer) | 
              Ctrl + 휠로 줌 인/아웃 가능
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden bg-gray-100">
          {/* Sidebar - 객체 속성 */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">객체 속성</h3>
            
            {selectedObject ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600">타입</label>
                  <p className="text-sm font-medium">{selectedObject.type}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">X</label>
                    <p className="text-sm">{Math.round(selectedObject.x)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Y</label>
                    <p className="text-sm">{Math.round(selectedObject.y)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Width</label>
                    <p className="text-sm">{Math.round(selectedObject.width)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Height</label>
                    <p className="text-sm">{Math.round(selectedObject.height)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600">회전</label>
                  <p className="text-sm">{Math.round(selectedObject.rotation)}°</p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">비율 유지</label>
                  <button
                    onClick={toggleAspectRatio}
                    className={`px-3 py-1 text-xs rounded ${
                      selectedObject.maintainAspectRatio
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedObject.maintainAspectRatio ? 'ON' : 'OFF'}
                  </button>
                </div>

                <button
                  onClick={handleDeleteSelected}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  삭제
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">객체를 선택하세요</p>
            )}

            {/* 객체 목록 */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                객체 목록 ({objects.length})
              </h3>
              <div className="space-y-1">
                {objects.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`w-full text-left px-2 py-1 text-xs rounded ${
                      selectedObjectId === obj.id
                        ? 'bg-green-100 text-green-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {obj.type} - {obj.id.slice(-6)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8">
            <A4Page
              pageIndex={0}
              objects={objects}
              selectedObjectId={selectedObjectId}
              onObjectSelect={setSelectedObjectId}
              onObjectUpdate={handleObjectUpdate}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

