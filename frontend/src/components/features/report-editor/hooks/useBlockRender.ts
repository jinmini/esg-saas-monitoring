import React from 'react';
import { BlockType } from '@/types/editor/block';
import { BlockComponentProps } from '@/components/features/report-editor/canvas/blocks/types';

// 각 블록 컴포넌트 import
import { ParagraphBlock } from "@/components/features/report-editor/canvas/blocks/ParagraphBlock";
import { HeadingBlock } from "@/components/features/report-editor/canvas/blocks/HeadingBlock";
import { ListBlock } from "@/components/features/report-editor/canvas/blocks/ListBlock";
import { TableBlock } from "@/components/features/report-editor/canvas/blocks/TableBlock";
import { ImageBlock } from "@/components/features/report-editor/canvas/blocks/ImageBlock";
import { QuoteBlock } from "@/components/features/report-editor/canvas/blocks/QuoteBlock";
import { ChartBlock } from "@/components/features/report-editor/canvas/blocks/ChartBlock";
import { ESGMetricBlock } from "@/components/features/report-editor/canvas/blocks/ESGMetricBlock";

// 블록 타입과 실제 렌더링할 컴포넌트를 매핑하는 객체 (레지스트리)
const blockComponentRegistry: Record<BlockType, React.ComponentType<BlockComponentProps>> = {
    paragraph: ParagraphBlock,
    heading: HeadingBlock,
    list: ListBlock,
    table: TableBlock,
    image: ImageBlock,
    quote: QuoteBlock,
    chart: ChartBlock,
    esgMetric: ESGMetricBlock,
};

/**
 * 블록 타입에 따라 적절한 컴포넌트를 반환하는 hook
 * 
 * @param blockType - 렌더링할 블록의 타입
 * @returns 해당 블록 타입에 맞는 React 컴포넌트
 */
export function useBlockRender(blockType: BlockType): React.ComponentType<BlockComponentProps> {
    // 레지스트리에서 컴포넌트 조회
    const BlockComponent = blockComponentRegistry[blockType];
    
    // 만약 등록되지 않은 타입이면 기본적으로 ParagraphBlock 반환
    if (!BlockComponent) {
        console.warn(`Unknown block type: ${blockType}, falling back to ParagraphBlock`);
        return ParagraphBlock;
    }
    
    return BlockComponent;
}