import { EditorCommand, CommandType, UpdateBlockContentPayload } from '@/types/editor/commands';
import { useEditorStore } from '@/store/editorStore';

/**
 * UPDATE_BLOCK_CONTENT Command
 * 블록의 텍스트 내용(InlineNode[])을 업데이트
 * 
 * 주의 : 실시간 타이핑 시 명령이 매 키스트로크마다 실행되면
 * Undo 스택이 과도하게 커질 수 있습니다. 이는 상위 계층(useCommand 훅 또는 Editor Component)에서 적절한 디바운싱을 구현해야 합니다.
 */
export class UpdateBlockContentCommand implements EditorCommand {
  readonly type = CommandType.UPDATE_BLOCK_CONTENT;
  readonly timestamp: number;
  
  private payload: UpdateBlockContentPayload;


  constructor(payload: UpdateBlockContentPayload) {
    this.payload = payload;
    this.timestamp = Date.now();
  }

  execute(): void {
    const { blockId, sectionId, content } = this.payload;
    const store = useEditorStore.getState();

    if (!store.document) return;

    store.pushHistory();

    store.updateBlock(blockId, sectionId, { content });

    store.setEditing(true);

  }

  undo(): void {
    const store = useEditorStore.getState();
    store.undo();
  }

  describe(): string {
    return `Update content of block ${this.payload.blockId} in section ${this.payload.sectionId}`;
  }
}

