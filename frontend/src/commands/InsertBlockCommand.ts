import { EditorCommand, CommandType, InsertBlockPayload } from '@/types/editor/commands';
import { useEditorStore } from '@/store/editorStore';

export class InsertBlockCommand implements EditorCommand {
  readonly type = CommandType.INSERT_BLOCK;
  readonly timestamp: number;

  private payload: InsertBlockPayload;

  constructor(payload: InsertBlockPayload) {
    this.payload = payload;
    this.timestamp = Date.now();
  }

  /** Store를 직접 변경 */
  execute(): void {
    const { sectionId, position, block } = this.payload;
    const store = useEditorStore.getState();

    // document 유무 가드
    if (!store.document) return;

    store.pushHistory();

    store.insertBlock(sectionId, position, block);

    store.setEditing(true);
  }

  /** 가장 최근 변경을 되돌림 (히스토리 스택 의존) */
  undo(): void {
    const store = useEditorStore.getState();
    // insertBlock 실행 시 pushHistory가 쌓였다는 가정 하에 하나 롤백
    store.undo();
  }

  describe(): string {
    const { position, sectionId, block } = this.payload;
    return `Insert ${block.blockType} block at position ${position} in section ${sectionId}`;
  }
}
