export type KuficPosition = 'initial' | 'medial' | 'final' | 'isolate' | 'variant';

export interface RasmGroup {
  id: string;
  label: string;
  keywords: string[];
}

export const RASM_GROUPS: RasmGroup[] = [
  { id: 'alif', label: 'ا (Alif)', keywords: ['alif', 'ا', 'أ', 'إ', 'آ'] },
  { id: 'ba', label: 'ب / ت / ث (Ba/Ta/Tha)', keywords: ['ba', 'ta', 'tha', 'ب', 'ت', 'ث'] },
  { id: 'jim', label: 'ج / ح / خ (Jim/Ha/Kha)', keywords: ['jim', 'jeem', 'ha', 'kha', 'ج', 'ح', 'خ'] },
  { id: 'dal', label: 'د / ذ (Dal/Dhal)', keywords: ['dal', 'daal', 'dhal', 'د', 'ذ'] },
  { id: 'ra', label: 'ر / ز (Ra/Zay)', keywords: ['ra', 'raa', 'zay', 'zaa', 'ر', 'ز'] },
  { id: 'sin', label: 'س / ش (Sin/Shin)', keywords: ['sin', 'seen', 'shin', 'sheen', 'س', 'ش'] },
  { id: 'sad', label: 'ص / ض (Sad/Dad)', keywords: ['sad', 'saad', 'dad', 'daad', 'ص', 'ض'] },
  { id: 'ta', label: 'ط / ظ (Ta/Za)', keywords: ['ta', 'taa', 'za', 'zaa', 'ط', 'ظ'] },
  { id: 'ayn', label: 'ع / غ (Ayn/Ghayn)', keywords: ['ayn', 'ghayn', 'ع', 'غ'] },
  { id: 'fa', label: 'ف (Fa)', keywords: ['fa', 'faa', 'ف'] },
  { id: 'qaf', label: 'ق (Qaf)', keywords: ['qaf', 'qaaf', 'ق'] },
  { id: 'kaf', label: 'ك (Kaf)', keywords: ['kaf', 'kaaf', 'ك'] },
  { id: 'lam', label: 'ل (Lam)', keywords: ['lam', 'laam', 'ل'] },
  { id: 'mim', label: 'م (Mim)', keywords: ['mim', 'meem', 'م'] },
  { id: 'nun', label: 'ن (Nun)', keywords: ['nun', 'noon', 'ن'] },
  { id: 'ha', label: 'هـ (Ha)', keywords: ['ha', 'haa', 'ه', 'هـ'] },
  { id: 'waw', label: 'و (Waw)', keywords: ['waw', 'waaw', 'و'] },
  { id: 'ya', label: 'ي / ى (Ya/Alif Maqsura)', keywords: ['ya', 'yaa', 'alif maqsura', 'ي', 'ى'] },
  { id: 'lam_alif', label: 'لا (Lam-Alif)', keywords: ['lam alif', 'lam-alif', 'لا'] },
];

export interface PresetShape {
  id: string;
  rasmId: string;
  letterName?: string;
  position: KuficPosition;
  cells: Record<string, string>;
  width: number;
  height: number;
}

export type GridCellStyle = 'sharp' | 'round';
export type GridTool = 'draw' | 'erase' | 'pan' | 'select' | 'stamp';

export interface GridDimensions {
  minR: number;
  maxR: number;
  minC: number;
  maxC: number;
  width: number;
  height: number;
}

/**
 * Calculates bounding box of drawn cells
 */
export function getBoundingBox(cells: Record<string, string>): GridDimensions | null {
  const keys = Object.keys(cells);
  if (keys.length === 0) return null;

  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const key of keys) {
    const [r, c] = key.split(',').map(Number);
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }

  return {
    minR,
    maxR,
    minC,
    maxC,
    width: maxC - minC + 1,
    height: maxR - minR + 1,
  };
}

/**
 * Normalizes cells so top-left starts at 0,0
 */
export function normalizeCells(cells: Record<string, string>): { normalized: Record<string, string>; width: number; height: number } {
  const bbox = getBoundingBox(cells);
  if (!bbox) return { normalized: {}, width: 0, height: 0 };

  const normalized: Record<string, string> = {};
  for (const [key, color] of Object.entries(cells)) {
    const [r, c] = key.split(',').map(Number);
    normalized[`${r - bbox.minR},${c - bbox.minC}`] = color;
  }

  return {
    normalized,
    width: bbox.width,
    height: bbox.height,
  };
}

/**
 * Generates an SVG string representation of cells
 */
export function exportCellsToSvg(cells: Record<string, string>, cellSize = 20, cellStyle: GridCellStyle = 'sharp'): string {
  const bbox = getBoundingBox(cells);
  if (!bbox) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"></svg>`;
  }

  const width = bbox.width * cellSize;
  const height = bbox.height * cellSize;
  const radius = cellStyle === 'round' ? cellSize * 0.25 : 0;

  const rects = Object.entries(cells).map(([key, color]) => {
    const [r, c] = key.split(',').map(Number);
    const x = (c - bbox.minC) * cellSize;
    const y = (r - bbox.minR) * cellSize;
    return `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${radius}" fill="${color}" />`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${rects}\n</svg>`;
}
