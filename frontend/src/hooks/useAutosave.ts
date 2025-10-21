import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useSaveDocument } from './useSaveDocument';

/**
 * useAutosave Hook
 * 
 * - 문서 편집 후 3초간 추가 변경이 없으면 자동 저장
 * - useSaveDocument mutation 사용
 * - Optimistic Update + 에러 핸들링
 * - 저장 성공 시: saveStatus → 'saved', lastSaved 갱신
 * - 저장 실패 시: saveStatus → 'error'
 * - 오프라인 시: saveStatus → 'offline'
 */
export function useAutosave(documentId: number | null, delay = 3000) {
  const { document } = useEditorStore();
  const {
    isDirty,
    saveStatus,
    setDirty,
    setSaveStatus,
    setLastSaved,
  } = useUIStore();

  const { mutate: saveDocument } = useSaveDocument();

  // 🔁 Debounce 타이머 관리
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 저장 조건 검증
    if (!isDirty || saveStatus === 'saving' || !document || !documentId) {
      return;
    }

    // 기존 타이머 초기화
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        // 오프라인 체크
        if (!navigator.onLine) {
          console.warn('⚠️ Offline: Autosave skipped');
          setSaveStatus('offline');
          return;
        }

        // Backend 연결 확인 (간단한 fetch로 테스트)
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
          const healthUrl = API_BASE_URL.replace('/api/v1', '/health');
          const testResponse = await fetch(healthUrl, {
            method: 'GET',
            mode: 'cors',
          });
          if (!testResponse.ok) {
            console.error('❌ Backend server is not responding');
            setSaveStatus('offline');
            return;
          }
        } catch (healthError) {
          console.error('❌ Backend server is not reachable:', healthError);
          setSaveStatus('offline');
          return;
        }

        // ⏳ 저장 시작
        setSaveStatus('saving');

        // ✅ React Query mutation으로 저장
        saveDocument(
          { documentId, document },
          {
            onSuccess: () => {
              setSaveStatus('saved');
              setLastSaved(new Date());
              setDirty(false);
              console.log(`💾 Autosaved: ${document.title}`);
            },
            onError: (error: any) => {
              console.error('❌ Autosave failed:', error);
              
              // Network Error 체크
              if (error.message === 'Network Error' || !error.response) {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
                console.error(`💡 Hint: Backend 서버가 실행 중인지 확인하세요 (${API_BASE_URL})`);
                setSaveStatus('offline');
              } else {
                setSaveStatus('error');
              }
            },
          }
        );
      } catch (err) {
        console.error('❌ Autosave failed:', err);
        setSaveStatus('error');
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [document, isDirty, saveStatus, documentId, delay, saveDocument, setSaveStatus, setDirty, setLastSaved]);
}

/**
 * 수동 저장 트리거
 */
export function useSaveNow() {
  const { document } = useEditorStore();
  const { setSaveStatus, setLastSaved, setDirty } = useUIStore();
  const { mutate: saveDocument, isPending } = useSaveDocument();

  const save = (documentId: number) => {
    if (!document || isPending) return;

    setSaveStatus('saving');

    saveDocument(
      { documentId, document },
      {
        onSuccess: () => {
          setSaveStatus('saved');
          setLastSaved(new Date());
          setDirty(false);
          console.log(`💾 Saved: ${document.title}`);
        },
        onError: (error) => {
          console.error('❌ Save failed:', error);
          setSaveStatus('error');
        },
      }
    );
  };

  return { save, isSaving: isPending };
}
