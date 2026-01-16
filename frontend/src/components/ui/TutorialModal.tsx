'use client';

import React, { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getTutorialConfig } from '@/constants/tutorialConfig';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TutorialModal
 * 
 * 페이지별 사용법 튜토리얼을 보여주는 모달 컴포넌트
 * - 자동 재생 및 반복 재생되는 영상
 * - 페이지별 맞춤 콘텐츠
 * - 2단 뷰 지원 (KR SaaS / Global SaaS 등)
 */
export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const pathname = usePathname();
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const config = getTutorialConfig(pathname);

  // 영상 자동 재생 및 반복 설정
  useEffect(() => {
    if (isOpen && config) {
      // 메인 영상 재생
      if (config.videoSrc && mainVideoRef.current) {
        mainVideoRef.current.play().catch((error) => {
          console.warn('Main video autoplay failed:', error);
        });
      }

      // 2단 뷰 영상 재생
      if (config.dualVideo) {
        if (leftVideoRef.current) {
          leftVideoRef.current.play().catch((error) => {
            console.warn('Left video autoplay failed:', error);
          });
        }
        if (rightVideoRef.current) {
          rightVideoRef.current.play().catch((error) => {
            console.warn('Right video autoplay failed:', error);
          });
        }
      }
    }
  }, [isOpen, config]);

  // 설정이 없으면 모달을 표시하지 않음
  if (!config) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* 오버레이 */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                  onClick={onClose}
                />
              </Dialog.Overlay>

              {/* 모달 컨텐츠 */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-[9999] p-6 focus:outline-none max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-gray-900">
                        {config.title}
                      </Dialog.Title>
                      <Dialog.Description className="text-gray-600 mt-1 text-sm">
                        {config.description}
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="닫기"
                      >
                        <X size={20} className="text-gray-600" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* 메인 영상 */}
                  {config.videoSrc && (
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                      <video
                        ref={mainVideoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      >
                        <source src={config.videoSrc} type="video/mp4" />
                        브라우저가 비디오를 지원하지 않습니다.
                      </video>
                    </div>
                  )}

                  {/* 2단 뷰 영상 (KR SaaS / Global SaaS) */}
                  {config.dualVideo && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        사이드바 메뉴 안내
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* 왼쪽: KR SaaS */}
                        <div className="space-y-2">
                          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              ref={leftVideoRef}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-contain"
                            >
                              <source
                                src={config.dualVideo.left.videoSrc}
                                type="video/mp4"
                              />
                              브라우저가 비디오를 지원하지 않습니다.
                            </video>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {config.dualVideo.left.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {config.dualVideo.left.description}
                            </p>
                          </div>
                        </div>

                        {/* 오른쪽: Global SaaS */}
                        <div className="space-y-2">
                          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              ref={rightVideoRef}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-contain"
                            >
                              <source
                                src={config.dualVideo.right.videoSrc}
                                type="video/mp4"
                              />
                              브라우저가 비디오를 지원하지 않습니다.
                            </video>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {config.dualVideo.right.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {config.dualVideo.right.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 단계별 설명 */}
                  {config.steps && config.steps.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        주요 단계
                      </h3>
                      <ul className="space-y-2">
                        {config.steps.map((step) => (
                          <li
                            key={step.number}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <span className="text-green-600 font-bold flex-shrink-0">
                              {step.number}.
                            </span>
                            <span>{step.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

