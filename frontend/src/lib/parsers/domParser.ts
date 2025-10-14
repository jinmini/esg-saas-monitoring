import { InlineNode, TextMark } from '@/types/editor/inline';

/**
 * 주어진 HTML 엘리먼트의 자식 노드를 InlineNode 배열로 변환
 * @param element contentEditable 속성을 가진 DOM 엘리먼트
 * @returns InlineNode 배열
 */

export function domToInlineNodes(element: HTMLElement): InlineNode[] {
  const childNodes = Array.from(element.childNodes);

  const inlineNodes = childNodes.flatMap(node => parseNode(node));

  return mergeAdjacentTextNodes(inlineNodes);
}

function parseNode(node: ChildNode): InlineNode[] { 
    if (node.nodeType === Node.TEXT_NODE) {

        if (node.textContent && node.textContent.length > 0) {
            return [{
                id: `inline-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                type: 'inline',
                text: node.textContent,
                marks: [],
            }];
        }
    return [];
}

if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    const children = Array.from(element.childNodes).flatMap(child => parseNode(child));

    switch (tagName) {
        case 'strong':
        case 'b':
            return children.map(child => addMarkToNode(child, 'bold'));

        case 'em':
        case 'i':
            return children.map(child =>
                addMarkToNode(child, 'italic'));

        case 'u':
            return children.map(child => addMarkToNode(child, 'underline'));

        case 's':
        case 'strike':
            return children.map(child => addMarkToNode(child, 'strike'));

        case 'mark':
            return children.map(child => addMarkToNode(child, 'highlight'));

        case 'code':
            return children.map(child => addMarkToNode(child, 'code'));

        case 'a':
            return children.map(child => ({
                ...child,
                link: {
                    url: element.getAttribute('href') || '',
                    target: '_blank'
                }
            }));
            
        default:
            return children;
        }
    }
    // 주석 노드 등 다른 타입의 노드는 무시 
    return [];
}

function addMarkToNode(node: InlineNode, mark: TextMark): InlineNode {
    const marks = node.marks || [];
    const newMarks = marks.includes(mark) ? marks : [...marks, mark];

    return {
        ...node,
        marks: newMarks,
    };
}

function mergeAdjacentTextNodes(nodes: InlineNode[]): InlineNode[] {
    if (nodes.length <2) {
        return nodes;
    }

    const merged: InlineNode[] = [];
    let previousNode = nodes[0];

    for (let i = 1; i < nodes.length; i++) {
        const currentNode = nodes[i];

        const marksAreEqual = JSON.stringify(previousNode.marks?.sort()) === JSON.stringify(currentNode.marks?.sort());
        const linksAreEqual = JSON.stringify(previousNode.link) === JSON.stringify(currentNode.link);

        if (marksAreEqual && linksAreEqual) {
            previousNode.text += currentNode.text;
        } else {
            merged.push(previousNode);
            previousNode = currentNode;
        }
    }

    merged.push(previousNode);

    return merged;
}