// export type EditorAction =
//   | { type: 'INSERT_BLOCK'; payload: { sectionId: string; block: BlockNode } }
//   | { type: 'DELETE_BLOCK'; payload: { sectionId: string; blockId: string } }
//   | { type: 'UPDATE_BLOCK_CONTENT'; payload: { blockId: string; content: InlineNode[] } }
//   | { type: 'MOVE_BLOCK'; payload: { fromIndex: number; toIndex: number; sectionId: string } }
//   | { type: 'APPLY_MARK'; payload: { inlineId: string; mark: TextMark } }
//   | { type: 'REMOVE_MARK'; payload: { inlineId: string; mark: TextMark } }
//   | { type: 'UNDO' }
//   | { type: 'REDO' }
//   | { type: 'RESET'; payload: DocumentNode };
