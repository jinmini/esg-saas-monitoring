import { BlockNode } from './block';
import { InlineNode } from './inline';
import { TextMark } from './inline';
import { DocumentNode } from './document';

/**
 * Command 기본 인터페이스
 * 모든 Command는 execute와 undo 메서드를 구현해야 함
 */
export interface EditorCommand {
  readonly type: CommandType;
  readonly timestamp: number;
  
  /**
   * Command 실행
   * @returns 실행 후 새로운 문서 상태
   */
  execute(): void;
  /**
   * Command 되돌리기
   * @returns 되돌린 후 문서 상태
   */
  undo(): void;
  
  /**
   * Command 설명 (디버깅용)
   */
  describe(): string;
}

/**
 * Command 타입 열거
 */
export enum CommandType {
  INSERT_BLOCK = 'INSERT_BLOCK',
  UPDATE_BLOCK_CONTENT = 'UPDATE_BLOCK_CONTENT',
  DELETE_BLOCK = 'DELETE_BLOCK',
  MOVE_BLOCK = 'MOVE_BLOCK',
  APPLY_MARK = 'APPLY_MARK',
  UPDATE_BLOCK_ATTRIBUTES = 'UPDATE_BLOCK_ATTRIBUTES',
  INSERT_SECTION = 'INSERT_SECTION',
  DELETE_SECTION = 'DELETE_SECTION',
  UPDATE_SECTION = 'UPDATE_SECTION',
  SAVE_SNAPSHOT = 'SAVE_VERSION',
}

/**
 * INSERT_BLOCK Command Payload
 */
export interface InsertBlockPayload {
  sectionId: string;
  position: number;
  block: BlockNode;
}

/**
 * UPDATE_BLOCK_CONTENT Command Payload
 */
export interface UpdateBlockContentPayload {
  sectionId: string;
  blockId: string;
  content: InlineNode[];
}

/**
 * DELETE_BLOCK Command Payload
 */
export interface DeleteBlockPayload {
  sectionId: string;
  blockId: string;
}

/**
 * MOVE_BLOCK Command Payload
 */
export interface MoveBlockPayload {
  sourceSectionId: string;
  targetSectionId: string;
  blockId: string;
  fromPosition: number;
  toPosition: number;
}

/**
 * APPLY_MARK Command Payload
 */
export interface ApplyMarkPayload {
  sectionId: string;
  blockId: string;
  inlineIndex: number;
  mark: TextMark;
  toggle?: boolean; // true면 토글, false면 무조건 적용
}

/**
 * UPDATE_BLOCK_ATTRIBUTES Command Payload
 */
export interface UpdateBlockAttributesPayload {
  sectionId: string;
  blockId: string;
  attributes: Partial<BlockNode['attributes']>;
}

/**
 * Command History Entry
 */
export interface CommandHistoryEntry {
  command: EditorCommand;
  timestamp: number;
  description: string;
}

/**
 * Command 실행 결과
 */
export interface CommandResult {
  success: boolean;
  document?: DocumentNode;
  error?: string;
}

