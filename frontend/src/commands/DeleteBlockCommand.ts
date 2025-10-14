import { EditorCommand, CommandType, DeleteBlockPayload } from '@/types/editor/commands';
import { useEditorStore } from '@/store/editorStore';

/**
 * DELETE_BLOCK Command
 * 특정 블록을 삭제
 */
export class DeleteBlockCommand implements EditorCommand {
  readonly type = CommandType.DELETE_BLOCK;
  readonly timestamp: number;
  private payload: DeleteBlockPayload;

  constructor(payload: DeleteBlockPayload) {
    this.payload = payload;
    this.timestamp = Date.now();
  }

  execute(): void {
    const { blockId, sectionId } = this.payload;
    const store = useEditorStore.getState();
      
    if (!store.document) return;

    store.pushHistory();

    setTimeout(() => {
      store.deleteBlock(blockId, sectionId);
      store.setEditing(true);
    }, 10);
  }

  undo(): void {
    const store = useEditorStore.getState();
    store.undo();
  }

  describe(): string {
    const { blockId, sectionId } = this.payload;
    return `Delete block ${blockId} in section [${sectionId}]`;
  }
}


