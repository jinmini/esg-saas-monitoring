import { TableObject, TableCell } from '@/types/canvas';

/**
 * 기본 테이블 생성
 */
export function createDefaultTable(
  x: number,
  y: number,
  rows: number,
  cols: number,
  pageIndex: number,
  zIndex: number
): TableObject {
  const cells: TableCell[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const rowCells: TableCell[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        text: row === 0 ? `Header ${col + 1}` : `Cell ${row}-${col}`,
        rowSpan: 1,
        colSpan: 1,
        textAlign: 'left',
        verticalAlign: 'middle',
      });
    }
    cells.push(rowCells);
  }

  return {
    id: `table-${Date.now()}`,
    type: 'table',
    x,
    y,
    width: 400,
    height: rows * 40,
    rotation: 0,
    zIndex,
    pageIndex,
    locked: false,
    visible: true,
    rows,
    cols,
    cells,
    borderColor: '#374151',
    borderWidth: 1,
    cellPadding: 8,
    headerRow: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 행 추가
 */
export function addTableRow(table: TableObject, position: 'top' | 'bottom'): TableObject {
  const newRow: TableCell[] = [];
  for (let col = 0; col < table.cols; col++) {
    newRow.push({
      text: '',
      rowSpan: 1,
      colSpan: 1,
      textAlign: 'left',
      verticalAlign: 'middle',
    });
  }

  const newCells = position === 'top' 
    ? [newRow, ...table.cells]
    : [...table.cells, newRow];

  return {
    ...table,
    rows: table.rows + 1,
    cells: newCells,
    height: table.height + (table.height / table.rows),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 열 추가
 */
export function addTableColumn(table: TableObject, position: 'left' | 'right'): TableObject {
  const newCells = table.cells.map(row => {
    const newCell: TableCell = {
      text: '',
      rowSpan: 1,
      colSpan: 1,
      textAlign: 'left',
      verticalAlign: 'middle',
    };
    return position === 'left' ? [newCell, ...row] : [...row, newCell];
  });

  return {
    ...table,
    cols: table.cols + 1,
    cells: newCells,
    width: table.width + (table.width / table.cols),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 행 삭제
 */
export function deleteTableRow(table: TableObject, rowIndex: number): TableObject | null {
  if (table.rows <= 1) return null; // 최소 1행 유지

  const newCells = table.cells.filter((_, index) => index !== rowIndex);

  return {
    ...table,
    rows: table.rows - 1,
    cells: newCells,
    height: table.height - (table.height / table.rows),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 열 삭제
 */
export function deleteTableColumn(table: TableObject, colIndex: number): TableObject | null {
  if (table.cols <= 1) return null; // 최소 1열 유지

  const newCells = table.cells.map(row => 
    row.filter((_, index) => index !== colIndex)
  );

  return {
    ...table,
    cols: table.cols - 1,
    cells: newCells,
    width: table.width - (table.width / table.cols),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 셀 병합
 */
export function mergeCells(
  table: TableObject,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): TableObject {
  const rowSpan = endRow - startRow + 1;
  const colSpan = endCol - startCol + 1;

  const newCells = table.cells.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      // 병합 시작 셀
      if (rowIndex === startRow && colIndex === startCol) {
        return {
          ...cell,
          rowSpan,
          colSpan,
        };
      }
      // 병합되는 다른 셀들은 숨김 (실제로는 UI에서만 처리)
      return cell;
    })
  );

  return {
    ...table,
    cells: newCells,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 셀 텍스트 업데이트
 */
export function updateCellText(
  table: TableObject,
  rowIndex: number,
  colIndex: number,
  text: string
): TableObject {
  const newCells = table.cells.map((row, rIndex) =>
    row.map((cell, cIndex) => 
      rIndex === rowIndex && cIndex === colIndex
        ? { ...cell, text }
        : cell
    )
  );

  return {
    ...table,
    cells: newCells,
    updatedAt: new Date().toISOString(),
  };
}

