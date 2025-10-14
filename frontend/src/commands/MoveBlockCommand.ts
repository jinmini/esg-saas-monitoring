import { EditorCommand, CommandType, MoveBlockPayload } from '@/types/editor/commands';
import { useEditorStore } from '@/store/editorStore';

/**
 * MOVE_BLOCK Command
 * 블록을 같은 섹션 내 또는 다른 섹션으로 이동
 */
export class MoveBlockCommand implements EditorCommand {
  readonly type = CommandType.MOVE_BLOCK;
  readonly timestamp: number;
  private payload: MoveBlockPayload;

  constructor(payload: MoveBlockPayload) {
    this.payload = payload;
    this.timestamp = Date.now();
  }

  execute(): void {
    const { blockId, sourceSectionId, targetSectionId, fromPosition, toPosition } = this.payload;

    const store = useEditorStore.getState();
    
    if (!store.document) return;

    store.pushHistory();

    store.moveBlock(blockId, sourceSectionId, targetSectionId, fromPosition, toPosition);

    store.setEditing(true);
  }

  undo(): void {
    const store = useEditorStore.getState();
    store.undo();
  }

  describe(): string {
    const { blockId, sourceSectionId, targetSectionId, fromPosition, toPosition } = this.payload;

    return `Move block ${blockId} from section ${sourceSectionId}[${fromPosition}] → ${targetSectionId}[${toPosition}]`;
  }
}

