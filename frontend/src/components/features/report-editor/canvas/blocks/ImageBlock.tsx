'use client';

import React, { useState, useRef } from 'react';
import { Image, Upload, Link, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { BlockComponentProps } from './types';

/**
 * 이미지 블록 컴포넌트
 * - 이미지 URL 입력
 * - 파일 업로드 (구현 예정)
 * - 정렬 옵션
 * - 너비 조절
 */
export const ImageBlock: React.FC<BlockComponentProps> = ({
  block,
  isFocused,
  isReadOnly,
}) => {
  const initialUrl = block.data?.url || '';
  const initialAlign = block.data?.align || 'center';
  const initialWidth = block.data?.width || 100;

  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialAlign);
  const [width, setWidth] = useState(initialWidth);
  const [alt, setAlt] = useState(block.data?.alt || '');
  const [showUrlInput, setShowUrlInput] = useState(!initialUrl);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseClasses = `
    block-item 
    group
    relative
    transition-all 
    duration-200 
    rounded-lg 
    px-4 
    py-2
    ${isFocused ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}
    ${isReadOnly ? 'cursor-default' : 'cursor-text'}
  `;

  // 이미지 URL 적용
  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      setImageUrl(urlInputValue);
      setShowUrlInput(false);
      // TODO: block.data를 업데이트하는 command 실행
    }
  };

  // 파일 업로드 핸들러 (Mock)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 실제로는 서버에 업로드하고 URL을 받아야 함
      const mockUrl = URL.createObjectURL(file);
      setImageUrl(mockUrl);
      setShowUrlInput(false);
      alert('⚠️ 파일 업로드는 백엔드 API 구현 후 사용 가능합니다.');
    }
  };

  // 정렬 변경
  const handleAlignChange = (newAlign: 'left' | 'center' | 'right') => {
    setAlign(newAlign);
    // TODO: block.data를 업데이트하는 command 실행
  };

  // 이미지 삭제
  const handleDelete = () => {
    if (confirm('이미지를 삭제하시겠습니까?')) {
      setImageUrl('');
      setShowUrlInput(true);
    }
  };

  // 이미지가 없는 경우 - 업로드 UI
  if (!imageUrl || showUrlInput) {
    return (
      <div className={baseClasses}>
        <div className="image-block-empty border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-200 rounded-full">
              <Image size={32} className="text-gray-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">이미지 추가</h3>
              <p className="text-xs text-gray-500">
                URL을 입력하거나 파일을 업로드하세요
              </p>
            </div>

            {/* URL 입력 */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyUrl();
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={isReadOnly}
                />
                <button
                  onClick={handleApplyUrl}
                  disabled={!urlInputValue.trim() || isReadOnly}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  적용
                </button>
              </div>

              {/* 또는 구분선 */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 border-t border-gray-300"></div>
                <span>또는</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* 파일 업로드 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadOnly}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload size={16} />
                파일 업로드 (구현 예정)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이미지가 있는 경우 - 이미지 표시
  return (
    <div className={baseClasses}>
      <div className="image-block relative group">
        {/* 이미지 툴바 */}
        {!isReadOnly && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={() => handleAlignChange('left')}
              className={`p-1.5 rounded transition-colors ${
                align === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="왼쪽 정렬"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => handleAlignChange('center')}
              className={`p-1.5 rounded transition-colors ${
                align === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="가운데 정렬"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => handleAlignChange('right')}
              className={`p-1.5 rounded transition-colors ${
                align === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="오른쪽 정렬"
            >
              <AlignRight size={16} />
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            <button
              onClick={() => setShowUrlInput(true)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="URL 변경"
            >
              <Link size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
              title="이미지 삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* 이미지 */}
        <div
          className={`
            ${align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'}
          `}
        >
          <img
            src={imageUrl}
            alt={alt || '이미지'}
            style={{ width: `${width}%` }}
            className="inline-block rounded-lg shadow-sm max-w-full h-auto"
            onError={(e) => {
              console.error('Image load error:', imageUrl);
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%239ca3af\' font-family=\'sans-serif\' font-size=\'20\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3E이미지 로드 실패%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* 너비 조절 슬라이더 */}
        {!isReadOnly && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>너비:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={width}
              onChange={(e) => {
                const newWidth = parseInt(e.target.value);
                setWidth(newWidth);
                // TODO: block.data를 업데이트하는 command 실행
              }}
              className="flex-1"
            />
            <span className="w-12 text-right">{width}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

