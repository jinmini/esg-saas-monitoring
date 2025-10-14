// src/commands/DummyCommand.ts
import { EditorCommand, CommandType } from '@/types/editor/commands';

export class DummyCommand implements EditorCommand {
  readonly type: CommandType;
  readonly timestamp: number;

  constructor(type: CommandType, payload?: any) {
    this.type = type;
    this.timestamp = Date.now();
    // console.warn(`DummyCommand for ${type} executed/instantiated with payload:`, payload);
  }

  execute(): void {
    console.warn(`Attempted to execute dummy command: ${this.describe()}`);
    // 실제 로직 없음
  }

  undo(): void {
    console.warn(`Attempted to undo dummy command: ${this.describe()}`);
    // 실제 로직 없음
  }

  describe(): string {
    return `Dummy command for type: ${this.type}`;
  }
}