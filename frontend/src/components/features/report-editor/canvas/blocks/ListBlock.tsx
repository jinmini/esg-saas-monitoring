import React from 'react';
import { InlineRenderer } from '../../renderers/InlineRenderer';
import { BlockComponentProps } from './types';
import { ListBlock as ListBlockNode, ListItemNode } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';
import { domToInlineNodes } from '@/lib/parsers/domParser';

interface ListItemProps {
  item: ListItemNode;
  sectionId: string;
  isReadOnly: boolean;
  onFocus?: (blockId: string, sectionId: string) => void;
  onBlur?: (blockId: string, sectionId: string) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onUpdateItem: (itemId: string, newContent: InlineNode[]) => void;
};

const ListItem: React.FC<ListItemProps> = ({
  item,
  sectionId,
  isReadOnly,
  onFocus,
  onBlur,
  onMouseUp,
  onKeyPress,
  onKeyDown,
  onUpdateItem,
}) => {
  const handleInput = (e: React.FormEvent<HTMLLIElement>) => {
    if (isReadOnly) return;
    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateItem(item.id, newContent);
  };

return (
  <li
    contentEditable={!isReadOnly}
    suppressContentEditableWarning
    onInput={handleInput}
    onMouseUp={onMouseUp}
    onKeyPress={onKeyPress}
    onKeyDown={onKeyDown}
    className="list-item"
  >
    <InlineRenderer content={item.content} />
  </li>
 );
};

export const ListBlock: React.FC<BlockComponentProps> = ({
  block,
  sectionId,
  isFocused,
  isReadOnly,
  onFocus,
  onBlur,
  onMouseUp,
  onKeyPress,
  onKeyDown,
  onUpdateContent,
}) => { 
  const listBlock = block as ListBlockNode;
  const ListContainerTag = listBlock.attributes?.listType === 'ordered' ? 'ol' : 'ul';

  const handleItemUpdate = (itemId: string, newContent: InlineNode[]) => {
    const newChildren = listBlock.children.map(item => item.id === itemId ? { ...item, content: newContent } : item);

  const updateBlock: ListBlockNode = {
    ...listBlock,
    children: newChildren,
  };

  (onUpdateContent as any)(block.id, updateBlock);

};

return (
  <div

    className={`
      block-item group relative
      ${isFocused ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}
      rounded-lg p-2
      `}

      onFocus={() => onFocus?.(block.id, sectionId)}
      onBlur={() => onBlur?.(block.id, sectionId)}
   >

     <ListContainerTag
      className={`
        list-inside p-4 space-y-1
        ${listBlock.attributes?.listType === 'ordered' ? 'list-decimal' : 'list-disc'
        }
      `}
     >

       {listBlock.children.map((item: ListItemNode) => (
         <ListItem
            key={item.id}
            item={item}
            sectionId={sectionId}
            isReadOnly={isReadOnly}
            onUpdateItem={handleItemUpdate}
            onMouseUp={onMouseUp as (e: React.MouseEvent) => void}
            onKeyPress={onKeyPress as (e: React.KeyboardEvent) => void}
            onKeyDown={onKeyDown as (e: React.KeyboardEvent) => void}
          />
        ))}
      </ListContainerTag>
    </div>
  );
};