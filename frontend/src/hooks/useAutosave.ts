import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';

/**
 * useAutosave Hook
 * 
 * - 문서 편집 후 3초간 추가 변경이 없으면 자동 저장
 * - 저장 성공 시: saveStatus → 'saved', lastSaved 갱신
 * - 저장 실패 시: saveStatus → 'error'
 * - 오프라인 시도 시: saveStatus → 'offline'
 */
export function useAutosave(delay = 3000) {
  const { document } = useEditorStore();
  const {
    isDirty,
    saveStatus,
    setDirty,
    setSaveStatus,
    setLastSaved,
  } = useUIStore();

  // 🔁 Debounce 타이머 관리
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 저장 조건: 더티 상태 + 저장 중 아님 + 온라인 상태
    if (!isDirty || saveStatus === 'saving' || !document) return;

    // 기존 타이머 초기화
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        if (!navigator.onLine) {
          console.warn('⚠️ Offline: Autosave skipped');
          setSaveStatus('offline');
          return;
        }

        // ⏳ 저장 시작
        setSaveStatus('saving');

        // ✅ 실제 저장 API 호출
        const res = await fetch(`/api/documents/${document.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(document),
        });

        if (!res.ok) throw new Error(`Failed to save document (${res.status})`);

        // ✅ 저장 완료
        setSaveStatus('saved');
        setLastSaved(new Date());
        setDirty(false);

        console.log(`💾 Autosaved: ${document.title}`);
      } catch (err) {
        console.error('❌ Autosave failed:', err);
        setSaveStatus('error');
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [document, isDirty, saveStatus, delay, setSaveStatus, setDirty, setLastSaved]);
}
