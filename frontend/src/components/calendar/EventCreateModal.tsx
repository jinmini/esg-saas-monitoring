'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, Tag, Link, FileText, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import type { EventCreateRequest, EventCategory } from '@/types/api';
import { EVENT_CATEGORY_COLORS } from '@/types/api';

interface EventCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string; // 선택된 날짜 기본값
}

const CATEGORIES: EventCategory[] = ['지원사업', '공시마감', '정책발표', '컨퍼런스'];

export function EventCreateModal({ open, onOpenChange, defaultDate }: EventCreateModalProps) {
  const onClose = () => onOpenChange(false);
  const queryClient = useQueryClient();
  
  // 폼 상태
  const [formData, setFormData] = useState<EventCreateRequest>({
    title: '',
    description: '',
    start_date: defaultDate || new Date().toISOString().split('T')[0],
    end_date: '',
    category: '지원사업',
    source_url: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 기본 날짜가 변경될 때 폼 업데이트
  useEffect(() => {
    if (defaultDate && open) {
      setFormData(prev => ({
        ...prev,
        start_date: defaultDate
      }));
    }
  }, [defaultDate, open]);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        start_date: defaultDate || new Date().toISOString().split('T')[0],
        end_date: '',
        category: '지원사업',
        source_url: ''
      });
      setErrors({});
    }
  }, [open, defaultDate]);

  // 이벤트 생성 뮤테이션
  const createEventMutation = useMutation({
    mutationFn: (data: EventCreateRequest) => eventsApi.create(data),
    onSuccess: () => {
      // 캘린더 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
      // 성공 메시지는 선택사항
    },
    onError: (error: any) => {
      console.error('이벤트 생성 실패:', error);
      setErrors({ submit: '이벤트 생성에 실패했습니다. 다시 시도해주세요.' });
    }
  });

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '이벤트 제목을 입력해주세요.';
    }

    if (!formData.start_date) {
      newErrors.start_date = '시작 날짜를 선택해주세요.';
    }

    if (formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = '종료 날짜는 시작 날짜보다 늦어야 합니다.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = '올바른 URL 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL 유효성 검사
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (
    field: keyof EventCreateRequest,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 종료 날짜가 없으면 null로 설정
    const submitData = {
      ...formData,
      end_date: formData.end_date || undefined,
      source_url: formData.source_url || undefined
    };

    createEventMutation.mutate(submitData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900">
                새 이벤트 추가
              </Dialog.Title>
            </div>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </Dialog.Close>
          </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              이벤트 제목 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ESG 이벤트 제목을 입력하세요"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              설명
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="이벤트 상세 설명 (선택사항)"
            />
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜 *
              </label>
              <input
                type="date"
                id="start_date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                id="end_date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                min={formData.start_date}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              카테고리 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.category === category
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={formData.category === category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${EVENT_CATEGORY_COLORS[category].dot}`}
                  />
                  <span className="text-sm font-medium">{category}</span>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* 원문 링크 */}
          <div>
            <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              원문 링크
            </label>
            <input
              type="url"
              id="source_url"
              value={formData.source_url}
              onChange={(e) => handleInputChange('source_url', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.source_url ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com/article"
            />
            {errors.source_url && (
              <p className="mt-1 text-sm text-red-600">{errors.source_url}</p>
            )}
          </div>

          {/* 제출 에러 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createEventMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {createEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  생성 중...
                </>
              ) : (
                '이벤트 생성'
              )}
            </button>
          </div>
        </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
