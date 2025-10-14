import { BlockNode } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';

export interface BlockComponentProps {
    block: BlockNode;
    sectionId: string;
    isFocused: boolean;
    isHovered: boolean;
    isReadOnly: boolean;
    onFocus?: (blockId: string, sectionId: string) => void;
    onBlur?: (blockId: string, sectionId: string) => void;
    onMouseUp?: () => void;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onUpdateContent: (blockId: string, newContent: InlineNode[]) => void;
  }