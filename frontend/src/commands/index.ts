/**
 * Command System
 * 모든 Command를 한 곳에서 export
 */

// 1. Command 클래스 임포트
import { InsertBlockCommand } from './InsertBlockCommand';
import { UpdateBlockContentCommand } from './UpdateBlockContentCommand';
import { DeleteBlockCommand } from './DeleteBlockCommand';
import { ApplyMarkCommand } from './ApplyMarkCommand';
import { MoveBlockCommand } from './MoveBlockCommand';
import { DummyCommand } from './DummyCommand';

// 2. Command 타입 임포트
import { CommandType, EditorCommand } from '@/types/editor/commands';

/**
 * Command Registry
 * 모든 Command 클래스를 CommandType에 매핑
 * 이 레지스트리를 통해 Command 인스턴스를 동적으로 생성
 */

export const CommandRegistry : Record<CommandType, new (payload: any) => EditorCommand> = {  
[CommandType.INSERT_BLOCK]: InsertBlockCommand,
[CommandType.UPDATE_BLOCK_CONTENT]: UpdateBlockContentCommand,
[CommandType.DELETE_BLOCK]: DeleteBlockCommand,
[CommandType.MOVE_BLOCK]: MoveBlockCommand,
[CommandType.APPLY_MARK]: ApplyMarkCommand,
[CommandType.UPDATE_BLOCK_ATTRIBUTES]: class extends DummyCommand { constructor(p: any) { super(CommandType.UPDATE_BLOCK_ATTRIBUTES, p); } },
[CommandType.INSERT_SECTION]: class extends DummyCommand { constructor(p: any) { super(CommandType.INSERT_SECTION, p); } },
[CommandType.DELETE_SECTION]: class extends DummyCommand { constructor(p: any) { super(CommandType.DELETE_SECTION, p); } },
[CommandType.UPDATE_SECTION]: class extends DummyCommand { constructor(p: any) { super(CommandType.UPDATE_SECTION, p); } },
[CommandType.SAVE_SNAPSHOT]: class extends DummyCommand { constructor(p: any) { super(CommandType.SAVE_SNAPSHOT, p); } },
};

// 3. 필요한 Command 클래스, 타입, 페이로드 외부로 내보내기
export {
  InsertBlockCommand,
  UpdateBlockContentCommand,
  DeleteBlockCommand,
  MoveBlockCommand,
  ApplyMarkCommand,
};

export type { EditorCommand, CommandType, InsertBlockPayload, UpdateBlockContentPayload, DeleteBlockPayload, ApplyMarkPayload, MoveBlockPayload, UpdateBlockAttributesPayload, CommandHistoryEntry, CommandResult, } from '@/types/editor/commands';