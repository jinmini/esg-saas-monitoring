'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { BlockComponentProps } from './types';

interface TableCell {
  id: string;
  content: string;
}

interface TableRow {
  id: string;
  cells: TableCell[];
}

/**
 * 표(Table) 블록 컴포넌트
 * - 행/열 추가/삭제
 * - 셀 편집
 * - 기본 스타일링
 */
export const TableBlock: React.FC<BlockComponentProps> = ({
  block,
  isFocused,
  isReadOnly,
}) => {
  const initialRows = 3;
  const initialCols = 3;

  // 초기 테이블 데이터 생성
  const createInitialData = () => {
    const rows: TableRow[] = [];
    for (let i = 0; i < initialRows; i++) {
      const cells: TableCell[] = [];
      for (let j = 0; j < initialCols; j++) {
        cells.push({
          id: `cell-${i}-${j}`,
          content: i === 0 ? `헤더 ${j + 1}` : '',
        });
      }
      rows.push({
        id: `row-${i}`,
        cells,
      });
    }
    return rows;
  };

  const [tableData, setTableData] = useState<TableRow[]>(
    block.data?.rows || createInitialData()
  );
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const baseClasses = `
    block-item 
    group
    relative
    transition-all 
    duration-200 
    rounded-lg 
    px-4 
    py-2
    ${isFocused ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}
    ${isReadOnly ? 'cursor-default' : 'cursor-text'}
  `;

  // 셀 내용 업데이트
  const updateCell = (rowIndex: number, colIndex: number, content: string) => {
    const newData = [...tableData];
    newData[rowIndex].cells[colIndex].content = content;
    setTableData(newData);
    // TODO: block.data를 업데이트하는 command 실행
  };

  // 행 추가
  const addRow = () => {
    const colCount = tableData[0]?.cells.length || initialCols;
    const newCells: TableCell[] = [];
    for (let i = 0; i < colCount; i++) {
      newCells.push({
        id: `cell-${tableData.length}-${i}`,
        content: '',
      });
    }
    const newRow: TableRow = {
      id: `row-${tableData.length}`,
      cells: newCells,
    };
    const newData = [...tableData, newRow];
    setTableData(newData);
  };

  // 행 삭제
  const deleteRow = (rowIndex: number) => {
    if (tableData.length <= 1) {
      alert('최소 1개의 행이 필요합니다.');
      return;
    }
    const newData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(newData);
  };

  // 열 추가
  const addColumn = () => {
    const newData = tableData.map((row, rowIndex) => ({
      ...row,
      cells: [
        ...row.cells,
        {
          id: `cell-${rowIndex}-${row.cells.length}`,
          content: '',
        },
      ],
    }));
    setTableData(newData);
  };

  // 열 삭제
  const deleteColumn = (colIndex: number) => {
    if (tableData[0]?.cells.length <= 1) {
      alert('최소 1개의 열이 필요합니다.');
      return;
    }
    const newData = tableData.map((row) => ({
      ...row,
      cells: row.cells.filter((_, index) => index !== colIndex),
    }));
    setTableData(newData);
  };

  return (
    <div className={baseClasses}>
      <div className="table-block relative overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse border border-gray-300 w-full">
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* 행 액션 버튼 */}
                  {!isReadOnly && hoveredRow === rowIndex && (
                    <td className="absolute left-0 -translate-x-full pr-2 align-middle">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                          title="행 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="p-1 cursor-grab" title="행 이동 (구현 예정)">
                          <GripVertical size={14} />
                        </div>
                      </div>
                    </td>
                  )}

                  {row.cells.map((cell, colIndex) => {
                    const isHeader = rowIndex === 0;
                    const CellTag = isHeader ? 'th' : 'td';

                    return (
                      <CellTag
                        key={cell.id}
                        className={`
                          border border-gray-300 px-4 py-2 min-w-[120px]
                          ${isHeader ? 'bg-gray-50 font-semibold' : 'bg-white'}
                          ${!isReadOnly ? 'hover:bg-blue-50' : ''}
                        `}
                        onMouseEnter={() => setHoveredCol(colIndex)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          disabled={isReadOnly}
                          className={`
                            w-full bg-transparent border-none outline-none
                            ${isReadOnly ? 'cursor-default' : 'cursor-text'}
                          `}
                          placeholder={isHeader ? '헤더' : '내용 입력'}
                        />
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* 열 추가/삭제 버튼 (테이블 하단) */}
          {!isReadOnly && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={addColumn}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} />
                열 추가
              </button>
              {hoveredCol !== null && (
                <button
                  onClick={() => deleteColumn(hoveredCol)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                  {hoveredCol + 1}번 열 삭제
                </button>
              )}
            </div>
          )}

          {/* 행 추가 버튼 */}
          {!isReadOnly && (
            <button
              onClick={addRow}
              className="mt-2 flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Plus size={14} />
              행 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

