// // src/state/editorReducer.ts

// import { EditorState } from './editorState';
// import { EditorAction } from './editorActions';
// import produce from 'immer';

// export function editorReducer(state: EditorState, action: EditorAction): EditorState {
//   return produce(state, (draft) => {
//     switch (action.type) {
//       case 'INSERT_BLOCK': {
//         const { sectionId, block } = action.payload;
//         const section = draft.document.sections.find((s) => s.id === sectionId);
//         if (section) section.blocks.push(block);
//         draft.ui.isDirty = true;
//         break;
//       }

//       case 'DELETE_BLOCK': {
//         const { sectionId, blockId } = action.payload;
//         const section = draft.document.sections.find((s) => s.id === sectionId);
//         if (section) section.blocks = section.blocks.filter((b) => b.id !== blockId);
//         draft.ui.isDirty = true;
//         break;
//       }

//       case 'UPDATE_BLOCK_CONTENT': {
//         const { blockId, content } = action.payload;
//         for (const section of draft.document.sections) {
//           const block = section.blocks.find((b) => b.id === blockId);
//           if (block) block.content = content;
//         }
//         draft.ui.isDirty = true;
//         break;
//       }

//       case 'APPLY_MARK': {
//         const { inlineId, mark } = action.payload;
//         for (const section of draft.document.sections) {
//           for (const block of section.blocks) {
//             block.content?.forEach((inline) => {
//               if (inline.id === inlineId && !inline.marks?.includes(mark)) {
//                 inline.marks = [...(inline.marks || []), mark];
//               }
//             });
//           }
//         }
//         draft.ui.isDirty = true;
//         break;
//       }

//       case 'UNDO': {
//         if (draft.history.past.length > 0) {
//           const prev = draft.history.past.pop()!;
//           draft.history.future.unshift(draft.history.present);
//           draft.history.present = prev;
//           draft.document = prev;
//         }
//         break;
//       }

//       case 'REDO': {
//         if (draft.history.future.length > 0) {
//           const next = draft.history.future.shift()!;
//           draft.history.past.push(draft.history.present);
//           draft.history.present = next;
//           draft.document = next;
//         }
//         break;
//       }

//       case 'RESET': {
//         draft.document = action.payload;
//         draft.history = { past: [], present: action.payload, future: [] };
//         draft.ui.isDirty = false;
//         break;
//       }
//     }
//   });
// }
