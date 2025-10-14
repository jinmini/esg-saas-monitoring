import { EditorCommand, CommandType, ApplyMarkPayload } from '@/types/editor/commands';
import { useEditorStore } from '@/store/editorStore';

/**
 * APPLY_MARK Command
 * 특정 인라인 노드에 텍스트 마크(bold, italic 등) 적용/제거
 */
export class ApplyMarkCommand implements EditorCommand {
  readonly type = CommandType.APPLY_MARK;
  readonly timestamp: number;
  private payload: ApplyMarkPayload;

  constructor(payload: ApplyMarkPayload) {
    this.payload = payload;
    this.timestamp = Date.now();
  }

  execute(): void {
    const { blockId, sectionId, inlineIndex, mark, toggle = true } = this.payload;
    const store = useEditorStore.getState();

    if (!store.document) return;

    store.pushHistory();

    store.applyMark(blockId, sectionId, inlineIndex, mark, toggle);

    store.setEditing(true);

  }
    

  undo(): void {
    const store = useEditorStore.getState();
    store.undo();
  }

  describe(): string {
    const { blockId, inlineIndex, mark, toggle } = this.payload;
    const action = toggle ? 'Toggle' : 'Apply';
    return `${action} mark "${mark}" on inline ${inlineIndex} of block ${blockId}`; 
  }
}

