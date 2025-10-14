import { useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { EditorCommand, CommandResult, CommandType } from '@/types/editor/commands';
import { CommandRegistry } from '@/commands';

/**
 * Command Pattern Hook
 * 
 * 모든 에디터 액션을 Command로 실행하여:
 * - Undo/Redo 지원
 * - Command History 추적
 * - 일관된 상태 관리
 */
export function useCommand() {
  const { 
    document, 
    undo: storeUndo,
    redo: storeRedo,
    history,
    setEditing,
  } = useEditorStore();

  const { setDirty, setSaveStatus } = useUIStore();

  /**
   * Command 실행
   */
  const execute = useCallback(
    (command: EditorCommand): CommandResult => {
      if (!document) {
        return {
          success: false,
          error: 'No document loaded',
        };
      }

      try {
        // Command 실행
        command.execute();
        
        // UI 상태 업데이트
        setEditing(true);
        setDirty(true);
        setSaveStatus('idle');
        
        console.log(`✅ Command executed: ${command.describe()}`);
        return {
          success: true
        };
      } 
        catch (error) {
        console.error('❌ Command execution failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [document, setEditing, setDirty, setSaveStatus]
  );

  /**
   * CommandType 기반 실행 (CommandRegistry 사용)
   */

  const dispatch = useCallback(
    (type: CommandType, payload: any): CommandResult => {
      const CommandClass = CommandRegistry[type];
      if (!CommandClass) {
        console.error(`❌ Unknown command type: ${type}`);
        return { success: false, error: 'Unknown command type' };
      }
      const command: EditorCommand = new CommandClass(payload);
      return execute(command);
    },
    [execute]
  );


  /**
   * Command Undo 실행
   */
  const undoCommand = useCallback(() => {
    if (history.past.length === 0) {
      console.warn('⚠️ Nothing to undo');
      return false;
    }

    storeUndo();
    setDirty(true);
    console.log('↶ Undo executed');
    return true;
  }, [storeUndo, history.past.length, setDirty]);

  /**
   * Command Redo 실행
   */
  const redoCommand = useCallback(() => {
    if (history.future.length === 0) {
      console.warn('⚠️ Nothing to redo');
      return false;
    }

    storeRedo();
    setDirty(true);
    console.log('↷ Redo executed');
    return true;
  }, [storeRedo, history.future.length, setDirty]);

  /**
   * 히스토리 상태 조회
   */
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    execute,
    undo: undoCommand,
    redo: redoCommand,
    canUndo,
    canRedo,
    historySize: history.past.length,
  };
}

