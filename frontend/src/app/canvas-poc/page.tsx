'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { A4Page } from '@/components/canvas/A4Page';
import { ImageObject, TableObject, CanvasObject } from '@/types/canvas';
import { createDefaultTable, updateCellText, addTableRow, addTableColumn, deleteTableRow, deleteTableColumn } from '@/utils/tableUtils';
import { FileImage, Plus, Save, Download, AlertCircle, Table as TableIcon } from 'lucide-react';

export default function CanvasPOCPage() {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
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

  // 테이블 생성
  const handleCreateTable = () => {
    const rows = parseInt(window.prompt('행 수를 입력하세요:', '3') || '3');
    const cols = parseInt(window.prompt('열 수를 입력하세요:', '3') || '3');
    
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 10) {
      const newTable = createDefaultTable(150, 150, rows, cols, 0, objects.length);
      setObjects([...objects, newTable]);
    } else {
      alert('행은 1~20, 열은 1~10 범위로 입력해주세요.');
    }
  };

  // 객체 업데이트
  const handleObjectUpdate = (objectId: string, attrs: Partial<CanvasObject>) => {
    setObjects(
      objects.map((obj) =>
        obj.id === objectId ? { ...obj, ...attrs } : obj
      )
    );
  };

  // 셀 텍스트 편집
  const handleCellEdit = (objectId: string, rowIndex: number, colIndex: number, text: string) => {
    setObjects(
      objects.map((obj) => {
        if (obj.id === objectId && obj.type === 'table') {
          return updateCellText(obj, rowIndex, colIndex, text);
        }
        return obj;
      })
    );
  };

  // 테이블 행 추가
  const handleAddRow = (position: 'top' | 'bottom') => {
    if (!selectedObjectId) return;
    setObjects(
      objects.map((obj) => {
        if (obj.id === selectedObjectId && obj.type === 'table') {
          return addTableRow(obj, position);
        }
        return obj;
      })
    );
  };

  // 테이블 열 추가
  const handleAddColumn = (position: 'left' | 'right') => {
    if (!selectedObjectId) return;
    setObjects(
      objects.map((obj) => {
        if (obj.id === selectedObjectId && obj.type === 'table') {
          return addTableColumn(obj, position);
        }
        return obj;
      })
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
  const isTableSelected = selectedObject?.type === 'table';

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

            {/* 테이블 추가 */}
            <button
              onClick={handleCreateTable}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TableIcon className="w-4 h-4" />
              <span>테이블 추가</span>
            </button>

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

                {/* 이미지 전용 옵션 */}
                {selectedObject.type === 'image' && (
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
                )}

                {/* 테이블 전용 옵션 */}
                {isTableSelected && (
                  <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs font-semibold text-gray-700">테이블 편집</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddRow('top')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        위에 행 추가
                      </button>
                      <button
                        onClick={() => handleAddRow('bottom')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        아래 행 추가
                      </button>
                      <button
                        onClick={() => handleAddColumn('left')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        왼쪽 열 추가
                      </button>
                      <button
                        onClick={() => handleAddColumn('right')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        오른쪽 열 추가
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      💡 셀을 더블클릭하여 텍스트를 편집하세요
                    </p>
                  </div>
                )}

                <button
                  onClick={handleDeleteSelected}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm mt-3"
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
              onCellEdit={handleCellEdit}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

