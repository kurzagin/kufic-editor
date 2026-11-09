"use client";

import React, { useState, useEffect, useRef } from 'react';

import { 
  Download, 
  Settings2, 
  Grid3X3, 
  Eraser, 
  Palette, 
  RefreshCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  ChevronDown,
  ChevronUp,
  Layout,
  Type,
  FileImage,
  FileCode2,
  X,
  Expand,
  Languages,
  Hand,
  PenTool,
  MousePointerSquareDashed,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Trash2,
  Save,
  Library,
  Undo2,
  Redo2,
  FolderOpen,
  Settings,
  Keyboard,
  BookOpen,
  Search,
  ExternalLink,
  Info,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';

type KuficPosition = 'initial' | 'medial' | 'final' | 'isolate' | 'variant';

interface RasmGroup {
  id: string;
  label: string;
  keywords: string[];
}

const RASM_GROUPS: RasmGroup[] = [
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

interface PresetShape {
  id: string;
  rasmId: string;
  letterName?: string; // Legacy support
  position: KuficPosition;
  cells: Record<string, string>; 
  width: number;
  height: number;
}

const DrawnCellsLayer = React.memo(({ cells, cellSize, cellStyle }: { cells: Record<string, string>, cellSize: number, cellStyle: 'sharp'|'round' }) => {
  return (
    <>
      {Object.entries(cells).map(([key, cellColor]) => {
        const [r, c] = key.split(',').map(Number);
        
        let brTL = '0px';
        let brTR = '0px';
        let brBL = '0px';
        let brBR = '0px';
        
        if (cellStyle === 'round') {
          const hasTop = cells[`${r - 1},${c}`] !== undefined;
          const hasBottom = cells[`${r + 1},${c}`] !== undefined;
          const hasLeft = cells[`${r},${c - 1}`] !== undefined;
          const hasRight = cells[`${r},${c + 1}`] !== undefined;
          
          if (!hasTop && !hasLeft) brTL = '6px';
          if (!hasTop && !hasRight) brTR = '6px';
          if (!hasBottom && !hasLeft) brBL = '6px';
          if (!hasBottom && !hasRight) brBR = '6px';
        }

        return (
          <div 
            key={key}
            className="absolute pointer-events-none transition-colors duration-75"
            style={{
              top: r * cellSize,
              left: c * cellSize,
              width: cellSize,
              height: cellSize,
              backgroundColor: cellColor,
              borderTopLeftRadius: brTL,
              borderTopRightRadius: brTR,
              borderBottomLeftRadius: brBL,
              borderBottomRightRadius: brBR
            }}
          />
        );
      })}
    </>
  );
});
DrawnCellsLayer.displayName = 'DrawnCellsLayer';

function GlobalTooltip() {
  const [tooltip, setTooltip] = useState<{ text: string, x: number, y: number, side: 'top'|'bottom'|'left'|'right' } | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      while (target && target !== document.body) {
        if (target.hasAttribute('title')) {
          const text = target.getAttribute('title');
          if (text) {
            target.setAttribute('data-title', text);
            target.removeAttribute('title');
          }
        }
        if (target.hasAttribute('data-title')) {
          const rect = target.getBoundingClientRect();
          let side: 'top'|'bottom'|'left'|'right' = 'top';
          if (rect.left < 80) side = 'right';
          else if (rect.right > window.innerWidth - 80) side = 'left';
          else if (rect.top < 80) side = 'bottom';
          
          setTooltip({
            text: target.getAttribute('data-title') || '',
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            side
          });
          return;
        }
        target = target.parentElement as HTMLElement;
      }
      setTooltip(null);
    };
    
    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (!tooltip) return null;

  let style: React.CSSProperties = {};
  if (tooltip.side === 'right') {
    style = { left: tooltip.x + 25, top: tooltip.y, transform: 'translateY(-50%)' };
  } else if (tooltip.side === 'left') {
    style = { right: window.innerWidth - tooltip.x + 25, top: tooltip.y, transform: 'translateY(-50%)' };
  } else if (tooltip.side === 'bottom') {
    style = { left: tooltip.x, top: tooltip.y + 25, transform: 'translateX(-50%)' };
  } else {
    style = { left: tooltip.x, bottom: window.innerHeight - tooltip.y + 25, transform: 'translateX(-50%)' };
  }

  return (
    <div 
      className="fixed z-[100] pointer-events-none whitespace-nowrap rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 shadow-xl border border-zinc-700/50 animate-in fade-in zoom-in-95 duration-100"
      style={style}
    >
      {tooltip.text}
    </div>
  );
}

const PRESETS_STORAGE_KEY = 'khattat-user-presets';
const REF_STORAGE_KEY = 'khattat-ref';

export default function Khattat() {
  const [drawnCells, setDrawnCells] = useState<Record<string, string>>({});
  const drawnCellsRef = useRef(drawnCells);
  drawnCellsRef.current = drawnCells;

  const [history, setHistory] = useState<Record<string, string>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [commitHistoryCounter, setCommitHistoryCounter] = useState(0);
  const hasUnsavedChangesRef = useRef(false);
  
  const historyRef = useRef(history);
  historyRef.current = history;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;

  const pushHistory = (newState: Record<string, string>) => {
    setHistory(prev => {
      const currentHistory = prev.slice(0, historyIndex + 1);
      const updated = [...currentHistory, newState];
      if (updated.length > 11) return updated.slice(updated.length - 11);
      return updated;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 10));
  };

  useEffect(() => {
    if (commitHistoryCounter > 0) {
      pushHistory(drawnCells);
    }
  }, [commitHistoryCounter]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'draw' | 'erase' | 'pan' | 'select' | 'stamp'>('draw');
  const drawModeRef = useRef(drawMode);
  drawModeRef.current = drawMode;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull) {
        setIsUIHidden(true);
      } else {
        setIsUIHidden(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [zoom, setZoom] = useState(100);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [showGrid, setShowGrid] = useState(true);
  const [gridColor, setGridColor] = useState('#18181b');
  const [gridPosition, setGridPosition] = useState<'background' | 'foreground'>('background');
  const [cellStyle, setCellStyle] = useState<'sharp' | 'round'>('sharp');

  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('khattat_prefs');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.showGrid !== undefined) setShowGrid(prefs.showGrid);
        if (prefs.gridColor) setGridColor(prefs.gridColor);
        if (prefs.gridPosition) setGridPosition(prefs.gridPosition);
        if (prefs.cellStyle) setCellStyle(prefs.cellStyle);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('khattat_prefs', JSON.stringify({
      showGrid,
      gridColor,
      gridPosition,
      cellStyle
    }));
  }, [showGrid, gridColor, gridPosition, cellStyle]);

  const resetGridPreferences = () => {
    setShowGrid(true);
    setGridColor('#18181b');
    setGridPosition('background');
    setCellStyle('sharp');
  };
  const [color, setColor] = useState('#ffffff');
  
  // Canvas Panning State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPanOffsetRef = useRef({ x: 0, y: 0 });

  // --- SELECTION STATES ---
  const [selectedCells, setSelectedCells] = useState<Record<string, string> | null>(null);
  const selectedCellsRef = useRef(selectedCells);
  selectedCellsRef.current = selectedCells;
  
  const [selectionOffset, setSelectionOffset] = useState({ r: 0, c: 0 });
  const selectionOffsetRef = useRef(selectionOffset);
  selectionOffsetRef.current = selectionOffset;

  const [clipboard, setClipboard] = useState<Record<string, string> | null>(null);
  const clipboardRef = useRef(clipboard);
  clipboardRef.current = clipboard;

  const [isSelectionDragging, setIsSelectionDragging] = useState(false);
  const selectionDragStartRef = useRef<{ r: number, c: number } | null>(null);

  const [isScaling, setIsScaling] = useState(false);
  const [scaleHandle, setScaleHandle] = useState<string | null>(null);
  const originalScaleCellsRef = useRef<Record<string, string> | null>(null);
  const scaleBoundsRef = useRef<{ minR: number, maxR: number, minC: number, maxC: number } | null>(null);
  const clickedHandleRef = useRef<string | null>(null);

  const [isMarqueeDrawing, setIsMarqueeDrawing] = useState(false);
  const marqueeStartRef = useRef<{ x: number, y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number, y: number } | null>(null);

  // --- PRESET / STAMP STATES ---
  const [presets, setPresets] = useState<PresetShape[]>([]);
  const [activeStamp, setActiveStamp] = useState<PresetShape | null>(null);
  const [hoverCell, setHoverCell] = useState<{ r: number, c: number } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({ rasmId: 'alif', position: 'initial' as KuficPosition });
  const [editPresetId, setEditPresetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
  };

  // Reference Font State
  const [referenceText, setReferenceText] = useState('');
  const referenceTextRef = useRef(referenceText);
  referenceTextRef.current = referenceText;
  const [tempRefText, setTempRefText] = useState('');
  const [isRefCollapsed, setIsRefCollapsed] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'library' | 'shortcuts' | 'support' | 'info'>('general');
  const [librarySearch, setLibrarySearch] = useState('');
  
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const quickSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showQuickSearch) {
      setTimeout(() => quickSearchInputRef.current?.focus(), 50);
    } else {
      setQuickSearchQuery('');
    }
  }, [showQuickSearch]);
  
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  });
  const [panelSide, setPanelSide] = useState<'center' | 'left' | 'right'>('center');

  const handleToolInteraction = (expectedStep: number) => {
    if (showOnboarding && onboardingStep === expectedStep) {
      if (onboardingStep === 9) {
        localStorage.setItem('khattat-onboarding-seen', 'true');
        setShowOnboarding(false);
      } else {
        setOnboardingStep(s => s + 1);
      }
    }
  };

  useEffect(() => {
    if (!showOnboarding) return;
    const targets = ['center', 'draw', 'erase', 'pan', 'select', 'color', 'library', 'reference', 'export'];
    const target = targets[onboardingStep - 1] || 'center';
    
    if (target === 'center') {
      setPanelStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setPanelSide('center');
      return;
    }
    
    // Short timeout to ensure DOM is ready and any animations settled
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.left < window.innerWidth / 2) {
          setPanelStyle({ top: rect.top + rect.height / 2, left: rect.right + 24, transform: 'translateY(-50%)' });
          setPanelSide('left');
        } else {
          setPanelStyle({ top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + 24, transform: 'translateY(-50%)' });
          setPanelSide('right');
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [onboardingStep, showOnboarding]);
  
  // Dragging State for Reference Panel
  const [refPanelPos, setRefPanelPos] = useState({ x: 0, y: 0 });
  const [isRefPanelDragging, setIsRefPanelDragging] = useState(false);
  const refDragStartPos = useRef({ x: 0, y: 0 });
  const refPanelStartPos = useRef({ x: 0, y: 0 });
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<'color' | 'export' | 'reference' | 'rasm' | 'position' | null>(null);
  const activeDropdownRef = useRef(activeDropdown);
  activeDropdownRef.current = activeDropdown;
  
  // Theme colors
  const theme = {
    bg: 'bg-zinc-950',
    panel: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    accent: 'bg-zinc-100',
    accentText: 'text-zinc-900',
    hover: 'hover:bg-zinc-800',
    active: 'bg-zinc-800',
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      if (selectedCellsRef.current) setSelectedCells(null);
      const newIndex = historyIndexRef.current - 1;
      setHistoryIndex(newIndex);
      setDrawnCells(historyRef.current[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      if (selectedCellsRef.current) setSelectedCells(null);
      const newIndex = historyIndexRef.current + 1;
      setHistoryIndex(newIndex);
      setDrawnCells(historyRef.current[newIndex]);
    }
  };

  useEffect(() => {
    try {
      const savedRef = localStorage.getItem(REF_STORAGE_KEY);
      if (savedRef) {
        setReferenceText(savedRef);
        setTempRefText(savedRef);
      }
      
      if (localStorage.getItem('khattat-onboarding-seen') !== 'true') {
        setShowOnboarding(true);
      }
      
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        const parsed = JSON.parse(storedPresets);
        if (Array.isArray(parsed)) {
          setPresets(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (key === 'tab') {
        e.preventDefault();
        setIsUIHidden(prev => !prev);
        return;
      }

      if (e.ctrlKey && key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveProject();
        return;
      }

      if (e.ctrlKey && key === 'o' && !e.shiftKey) {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      if (e.ctrlKey && key === 'l' && !e.shiftKey) {
        e.preventDefault();
        setShowQuickSearch(true);
        setActiveDropdown(null);
        setIsSettingsOpen(false);
        return;
      }

      if (e.ctrlKey && key === 'c' && !e.shiftKey) {
        e.preventDefault();
        copySelection();
        return;
      }

      if (e.ctrlKey && key === 'v' && !e.shiftKey) {
        e.preventDefault();
        pasteSelection();
        return;
      }

      if (e.ctrlKey && key === 'd' && !e.shiftKey) {
        e.preventDefault();
        duplicateSelection();
        return;
      }

      if (e.ctrlKey && key === 'z' && !e.shiftKey) {
        handleUndo();
        return;
      }
      if ((e.ctrlKey && key === 'y') || (e.ctrlKey && e.shiftKey && key === 'z')) {
        handleRedo();
        return;
      }
      if (selectedCellsRef.current && (key === 'backspace' || key === 'delete')) {
        deleteSelection();
        return;
      }

      // Tool Shortcuts
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        if (key === 't') { setDrawMode('draw'); commitSelectionToCanvas(); setActiveStamp(null); }
        if (key === 'e') { setDrawMode('erase'); commitSelectionToCanvas(); setActiveStamp(null); }
        if (key === 'h') { setDrawMode('pan'); commitSelectionToCanvas(); }
        if (key === 'v' || key === 'm') { setDrawMode('select'); commitSelectionToCanvas(); setActiveStamp(null); }
        if (key === 'c') { toggleDropdown('color'); }
        if (key === 'l') { setIsSettingsOpen(true); setSettingsTab('library'); setActiveDropdown(null); }
        if (key === 'escape') { setActiveDropdown(null); setIsSettingsOpen(false); setShowQuickSearch(false); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const baseCellSize = 32; 
  const cellSize = baseCellSize * (zoom / 100);

  // --- SELECTION LOGIC ---
  const getSelectionBounds = () => {
    if (!selectedCells) return null;
    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(selectedCells).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });
    return { 
      minR: minR + selectionOffset.r, 
      maxR: maxR + selectionOffset.r, 
      minC: minC + selectionOffset.c, 
      maxC: maxC + selectionOffset.c 
    };
  };

  const isInsideBounds = (r: number, c: number, bounds: any) => {
    if (!bounds) return false;
    return r >= bounds.minR && r <= bounds.maxR && c >= bounds.minC && c <= bounds.maxC;
  };

  const commitSelectionOffset = () => {
    if (!selectedCells) return null;
    if (selectionOffset.r === 0 && selectionOffset.c === 0) return selectedCells;
    
    const newSelected: Record<string, string> = {};
    Object.entries(selectedCells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      newSelected[`${r + selectionOffset.r},${c + selectionOffset.c}`] = v;
    });
    setSelectedCells(newSelected);
    setSelectionOffset({ r: 0, c: 0 });
    return newSelected;
  };

  const commitSelectionToCanvas = () => {
    if (!selectedCellsRef.current) return;
    const finalCells = commitSelectionOffset() || selectedCellsRef.current;
    setDrawnCells(prev => ({ ...prev, ...finalCells }));
    setSelectedCells(null);
    setCommitHistoryCounter(c => c + 1);
  };

  const deleteSelection = () => {
    setSelectedCells(null);
    setSelectionOffset({ r: 0, c: 0 });
    setCommitHistoryCounter(c => c + 1);
  };

  const copySelection = () => {
    if (!selectedCellsRef.current) return;
    const currentOffset = selectionOffsetRef.current;
    const copied: Record<string, string> = {};
    Object.keys(selectedCellsRef.current).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      const color = selectedCellsRef.current![k];
      copied[`${r + currentOffset.r},${c + currentOffset.c}`] = color;
    });
    clipboardRef.current = copied;
    setClipboard(copied);
  };

  const pasteSelection = () => {
    if (!clipboardRef.current) return;
    if (selectedCellsRef.current) {
      commitSelectionToCanvas();
    }
    setSelectedCells({ ...clipboardRef.current });
    setSelectionOffset({ r: 1, c: 1 });
    setDrawMode('select');
  };

  const duplicateSelection = () => {
    if (selectedCellsRef.current) {
      copySelection();
      pasteSelection();
    }
  };

  const flipHorizontal = () => {
    if (!selectedCells) return;
    const baked = commitSelectionOffset() || selectedCells;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(baked).forEach(k => {
      const [, c] = k.split(',').map(Number);
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });
    
    const flipped: Record<string, string> = {};
    Object.entries(baked).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      flipped[`${r},${maxC - (c - minC)}`] = v;
    });
    setSelectedCells(flipped);
  };

  const flipVertical = () => {
    if (!selectedCells) return;
    const baked = commitSelectionOffset() || selectedCells;
    let minR = Infinity, maxR = -Infinity;
    Object.keys(baked).forEach(k => {
      const [r] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    });
    
    const flipped: Record<string, string> = {};
    Object.entries(baked).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      flipped[`${maxR - (r - minR)},${c}`] = v;
    });
    setSelectedCells(flipped);
  };

  const rotate90 = () => {
    if (!selectedCells) return;
    const baked = commitSelectionOffset() || selectedCells;
    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(baked).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });
    
    const height = maxR - minR;
    const rotated: Record<string, string> = {};
    Object.entries(baked).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      const relR = r - minR;
      const relC = c - minC;
      rotated[`${minR + relC},${minC + (height - relR)}`] = v;
    });
    setSelectedCells(rotated);
  };

  const handleSavePreset = () => {
    if (editPresetId) {
      const presetToEdit = presets.find(p => p.id === editPresetId);
      if (presetToEdit) {
        const updatedPreset = { ...presetToEdit, rasmId: saveForm.rasmId, position: saveForm.position };
        const updatedList = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
        setPresets(updatedList);
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedList));
        showToast('Preset updated successfully!');
      }
      setShowSaveDialog(false);
      setEditPresetId(null);
      setSaveForm({ rasmId: 'alif', position: 'initial' });
      return;
    }

    if (!selectedCells || !saveForm.rasmId) return;
    const baked = commitSelectionOffset() || selectedCells;
    
    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(baked).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });

    const normalized: Record<string, string> = {};
    Object.entries(baked).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      normalized[`${r - minR},${c - minC}`] = v;
    });

    const newPreset: PresetShape = {
      id: Date.now().toString(),
      rasmId: saveForm.rasmId,
      position: saveForm.position,
      cells: normalized,
      width: maxC - minC + 1,
      height: maxR - minR + 1
    };

    const updatedList = [...presets, newPreset];
    setPresets(updatedList);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedList));
    setShowSaveDialog(false);
    setSaveForm({ rasmId: 'alif', position: 'initial' });
    showToast('Preset saved to library!');
    commitSelectionToCanvas();
  };

  // --- DRAWING LOGIC ---
  const applyStamp = (row: number, col: number) => {
    if (!activeStamp) return;
    setDrawnCells(prev => {
      const next = { ...prev };
      Object.entries(activeStamp.cells).forEach(([k, v]) => {
        const [r, c] = k.split(',').map(Number);
        next[`${row + r},${col + c}`] = color; 
      });
      hasUnsavedChangesRef.current = true;
      return next;
    });
  };

  const updateCell = (row: number, col: number) => {
    const key = `${row},${col}`;
    setDrawnCells(prev => {
      if (drawMode === 'draw' && prev[key] === color) return prev;
      if (drawMode === 'erase' && !prev[key]) return prev;

      const next = { ...prev };
      if (drawMode === 'draw') next[key] = color;
      else delete next[key];
      hasUnsavedChangesRef.current = true;
      return next;
    });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    if (drawMode === 'pan' || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      lastPanOffsetRef.current = { ...panOffset };
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    const gridX = relX - panOffset.x;
    const gridY = relY - panOffset.y;
    const gridC = Math.floor(gridX / cellSize);
    const gridR = Math.floor(gridY / cellSize);

    if (clickedHandleRef.current) {
      originalScaleCellsRef.current = commitSelectionOffset() || selectedCells;
      scaleBoundsRef.current = getSelectionBounds();
      setIsScaling(true);
      setScaleHandle(clickedHandleRef.current);
      clickedHandleRef.current = null;
      return;
    }

    if (drawMode === 'stamp' && activeStamp) {
      setIsDrawing(true);
      applyStamp(gridR, gridC);
      return;
    }

    if (drawMode === 'select') {
      if (selectedCells) {
        const bounds = getSelectionBounds();
        if (isInsideBounds(gridR, gridC, bounds)) {
          setIsSelectionDragging(true);
          selectionDragStartRef.current = { r: gridR, c: gridC };
          return;
        } else {
          commitSelectionToCanvas();
        }
      }

      setIsMarqueeDrawing(true);
      marqueeStartRef.current = { x: relX, y: relY };
      setMarqueeCurrent({ x: relX, y: relY });
      return;
    }

    if (selectedCells) commitSelectionToCanvas();

    setIsDrawing(true);
    updateCell(gridR, gridC);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({
        x: lastPanOffsetRef.current.x + dx,
        y: lastPanOffsetRef.current.y + dy
      });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    if (isMarqueeDrawing) {
      setMarqueeCurrent({ x: relX, y: relY });
      return;
    }

    const gridX = relX - panOffset.x;
    const gridY = relY - panOffset.y;
    const gridC = Math.floor(gridX / cellSize);
    const gridR = Math.floor(gridY / cellSize);

    if (drawMode === 'stamp') {
      setHoverCell({ r: gridR, c: gridC });
      if (isDrawing && activeStamp) applyStamp(gridR, gridC);
      return;
    }

    if (isScaling && originalScaleCellsRef.current && scaleBoundsRef.current && scaleHandle) {
      const origBounds = scaleBoundsRef.current;
      let newMinR = origBounds.minR;
      let newMaxR = origBounds.maxR;
      let newMinC = origBounds.minC;
      let newMaxC = origBounds.maxC;

      if (scaleHandle.includes('n')) newMinR = Math.min(origBounds.maxR, gridR);
      if (scaleHandle.includes('s')) newMaxR = Math.max(origBounds.minR, gridR);
      if (scaleHandle.includes('w')) newMinC = Math.min(origBounds.maxC, gridC);
      if (scaleHandle.includes('e')) newMaxC = Math.max(origBounds.minC, gridC);

      const originalW = origBounds.maxC - origBounds.minC + 1;
      const originalH = origBounds.maxR - origBounds.minR + 1;
      const newW = newMaxC - newMinC + 1;
      const newH = newMaxR - newMinR + 1;

      const newCells: Record<string, string> = {};
      Object.entries(originalScaleCellsRef.current).forEach(([k, color]) => {
        const [r, c] = k.split(',').map(Number);
        const relC = c - origBounds.minC;
        const relR = r - origBounds.minR;
        
        const targetCStart = newMinC + Math.floor(relC * (newW / originalW));
        let targetCEnd = newMinC + Math.floor((relC + 1) * (newW / originalW));
        if (targetCEnd === targetCStart) targetCEnd++;

        const targetRStart = newMinR + Math.floor(relR * (newH / originalH));
        let targetREnd = newMinR + Math.floor((relR + 1) * (newH / originalH));
        if (targetREnd === targetRStart) targetREnd++;

        for (let tr = targetRStart; tr < targetREnd; tr++) {
          for (let tc = targetCStart; tc < targetCEnd; tc++) {
            newCells[`${tr},${tc}`] = color;
          }
        }
      });

      setSelectedCells(newCells);
      setSelectionOffset({ r: 0, c: 0 });
      return;
    }

    if (isSelectionDragging && selectionDragStartRef.current) {
      const dr = gridR - selectionDragStartRef.current.r;
      const dc = gridC - selectionDragStartRef.current.c;
      setSelectionOffset({ r: dr, c: dc });
      return;
    }

    if (!isDrawing) return;
    updateCell(gridR, gridC);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    setIsDrawing(false);
    setIsPanning(false);

    if (hasUnsavedChangesRef.current) {
      setCommitHistoryCounter(c => c + 1);
      hasUnsavedChangesRef.current = false;
    }

    if (isScaling) {
      setIsScaling(false);
      setScaleHandle(null);
      originalScaleCellsRef.current = null;
      scaleBoundsRef.current = null;
    }

    if (isSelectionDragging) {
      setIsSelectionDragging(false);
      commitSelectionOffset();
    }

    if (isMarqueeDrawing) {
      setIsMarqueeDrawing(false);
      if (marqueeStartRef.current && marqueeCurrent) {
        const gridStartX = marqueeStartRef.current.x - panOffset.x;
        const gridStartY = marqueeStartRef.current.y - panOffset.y;
        const gridEndX = marqueeCurrent.x - panOffset.x;
        const gridEndY = marqueeCurrent.y - panOffset.y;

        const minC = Math.floor(Math.min(gridStartX, gridEndX) / cellSize);
        const maxC = Math.floor(Math.max(gridStartX, gridEndX) / cellSize);
        const minR = Math.floor(Math.min(gridStartY, gridEndY) / cellSize);
        const maxR = Math.floor(Math.max(gridStartY, gridEndY) / cellSize);

        const newSelected: Record<string, string> = {};
        const newDrawn = { ...drawnCellsRef.current };
        let hasExtracted = false;

        Object.keys(newDrawn).forEach(k => {
          const [r, c] = k.split(',').map(Number);
          if (r >= minR && r <= maxR && c >= minC && c <= maxC) {
            newSelected[k] = newDrawn[k];
            delete newDrawn[k];
            hasExtracted = true;
          }
        });

        if (hasExtracted) {
          setDrawnCells(newDrawn);
          setSelectedCells(newSelected);
          setSelectionOffset({ r: 0, c: 0 });
          setCommitHistoryCounter(c => c + 1);

          const firstColor = Object.values(newSelected)[0];
          if (firstColor) setColor(firstColor);
        }
      }
      marqueeStartRef.current = null;
      setMarqueeCurrent(null);
    }

    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLElement>) => {
    // Standardize delta for mouse wheels vs trackpads
    let delta = e.deltaY;
    if (Math.abs(delta) >= 50) {
      delta = delta < 0 ? -15 : 15;
    } else {
      delta = delta * 0.5;
    }

    const prevZoom = zoomRef.current;
    const prevOffset = panOffsetRef.current;

    const newZoom = Math.max(10, Math.min(500, prevZoom - delta));
    if (newZoom === prevZoom) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomRatio = newZoom / prevZoom;
    const newOffset = {
      x: mouseX - (mouseX - prevOffset.x) * zoomRatio,
      y: mouseY - (mouseY - prevOffset.y) * zoomRatio
    };

    zoomRef.current = newZoom;
    panOffsetRef.current = newOffset;

    setZoom(newZoom);
    setPanOffset(newOffset);
  };

  const clearGrid = () => {
    setDrawnCells({});
    setSelectedCells(null);
    setSelectionOffset({ r: 0, c: 0 });
    setPanOffset({ x: 0, y: 0 });
    setZoom(100);
    setCommitHistoryCounter(c => c + 1);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
    }
  };

  const toggleDropdown = (menu: 'color' | 'export' | 'reference') => {
    if (activeDropdownRef.current === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
      if (drawModeRef.current === 'stamp') {
        setDrawMode('draw');
        setActiveStamp(null);
      }
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProject = () => {
    const data = {
      version: "1.0",
      drawnCells: drawnCellsRef.current,
      panOffset: panOffsetRef.current,
      zoom: zoomRef.current,
      referenceText: referenceTextRef.current
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.khatt";
    a.click();
    URL.revokeObjectURL(url);
    setActiveDropdown(null);
  };

  const exportToSVG = () => {
    const cells = drawnCellsRef.current;
    if (Object.keys(cells).length === 0) {
      setDialog({
        isOpen: true,
        type: 'alert',
        title: 'Empty Canvas',
        message: 'There is nothing to export.'
      });
      return;
    }

    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(cells).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });

    const width = (maxC - minC + 1) * 32;
    const height = (maxR - minR + 1) * 32;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
    
    Object.entries(cells).forEach(([k, color]) => {
      const [r, c] = k.split(',').map(Number);
      const x = (c - minC) * 32;
      const y = (r - minR) * 32;
      
      let brTL = false, brTR = false, brBL = false, brBR = false;
      if (cellStyle === 'round') {
        const hasTop = cells[`${r - 1},${c}`] !== undefined;
        const hasBottom = cells[`${r + 1},${c}`] !== undefined;
        const hasLeft = cells[`${r},${c - 1}`] !== undefined;
        const hasRight = cells[`${r},${c + 1}`] !== undefined;
        brTL = !hasTop && !hasLeft;
        brTR = !hasTop && !hasRight;
        brBL = !hasBottom && !hasLeft;
        brBR = !hasBottom && !hasRight;
      }
      
      if (!brTL && !brTR && !brBL && !brBR) {
        svgContent += `  <rect x="${x}" y="${y}" width="32" height="32" fill="${color}" />\n`;
      } else {
        const rad = 6;
        let path = '';
        if (brTL) path += `M ${x + rad} ${y} `;
        else path += `M ${x} ${y} `;
        
        if (brTR) path += `L ${x + 32 - rad} ${y} A ${rad} ${rad} 0 0 1 ${x + 32} ${y + rad} `;
        else path += `L ${x + 32} ${y} `;
        
        if (brBR) path += `L ${x + 32} ${y + 32 - rad} A ${rad} ${rad} 0 0 1 ${x + 32 - rad} ${y + 32} `;
        else path += `L ${x + 32} ${y + 32} `;
        
        if (brBL) path += `L ${x + rad} ${y + 32} A ${rad} ${rad} 0 0 1 ${x} ${y + 32 - rad} `;
        else path += `L ${x} ${y + 32} `;
        
        if (brTL) path += `L ${x} ${y + rad} A ${rad} ${rad} 0 0 1 ${x + rad} ${y} `;
        else path += `L ${x} ${y} `;
        
        path += 'Z';
        svgContent += `  <path d="${path}" fill="${color}" />\n`;
      }
    });
    
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "khattat_export.svg";
    a.click();
    URL.revokeObjectURL(url);
    setActiveDropdown(null);
  };

  const exportToPNG = () => {
    const cells = drawnCellsRef.current;
    if (Object.keys(cells).length === 0) {
      setDialog({ isOpen: true, type: 'alert', title: 'Empty Canvas', message: 'There is nothing to export.' });
      return;
    }

    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;
    Object.keys(cells).forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });

    const width = (maxC - minC + 1) * 32;
    const height = (maxR - minR + 1) * 32;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
    Object.entries(cells).forEach(([k, color]) => {
      const [r, c] = k.split(',').map(Number);
      const x = (c - minC) * 32;
      const y = (r - minR) * 32;
      
      let brTL = false, brTR = false, brBL = false, brBR = false;
      if (cellStyle === 'round') {
        const hasTop = cells[`${r - 1},${c}`] !== undefined;
        const hasBottom = cells[`${r + 1},${c}`] !== undefined;
        const hasLeft = cells[`${r},${c - 1}`] !== undefined;
        const hasRight = cells[`${r},${c + 1}`] !== undefined;
        brTL = !hasTop && !hasLeft;
        brTR = !hasTop && !hasRight;
        brBL = !hasBottom && !hasLeft;
        brBR = !hasBottom && !hasRight;
      }
      
      if (!brTL && !brTR && !brBL && !brBR) {
        svgContent += `  <rect x="${x}" y="${y}" width="32" height="32" fill="${color}" />\n`;
      } else {
        const rad = 6;
        let path = '';
        if (brTL) path += `M ${x + rad} ${y} `;
        else path += `M ${x} ${y} `;
        if (brTR) path += `L ${x + 32 - rad} ${y} A ${rad} ${rad} 0 0 1 ${x + 32} ${y + rad} `;
        else path += `L ${x + 32} ${y} `;
        if (brBR) path += `L ${x + 32} ${y + 32 - rad} A ${rad} ${rad} 0 0 1 ${x + 32 - rad} ${y + 32} `;
        else path += `L ${x + 32} ${y + 32} `;
        if (brBL) path += `L ${x + rad} ${y + 32} A ${rad} ${rad} 0 0 1 ${x} ${y + 32 - rad} `;
        else path += `L ${x} ${y + 32} `;
        if (brTL) path += `L ${x} ${y + rad} A ${rad} ${rad} 0 0 1 ${x + rad} ${y} `;
        else path += `L ${x} ${y} `;
        path += 'Z';
        svgContent += `  <path d="${path}" fill="${color}" />\n`;
      }
    });
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `khattat_export.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setActiveDropdown(null);
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.drawnCells) {
          setDrawnCells(json.drawnCells);
          setCommitHistoryCounter(c => c + 1);
        }
        if (json.panOffset) setPanOffset(json.panOffset);
        if (json.zoom) setZoom(json.zoom);
        if (json.referenceText) {
          setReferenceText(json.referenceText);
          setTempRefText(json.referenceText);
          localStorage.setItem(REF_STORAGE_KEY, json.referenceText);
        }
        setActiveDropdown(null);
      } catch (err) {
        setDialog({ isOpen: true, type: 'alert', title: 'Error', message: 'Invalid .khatt file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Drag Handlers for Reference Panel
  const handleRefPanelPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsRefPanelDragging(true);
    refDragStartPos.current = { x: e.clientX, y: e.clientY };
    refPanelStartPos.current = { ...refPanelPos };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleRefPanelPointerMove = (e: React.PointerEvent) => {
    if (!isRefPanelDragging) return;
    const dx = e.clientX - refDragStartPos.current.x;
    const dy = e.clientY - refDragStartPos.current.y;
    setRefPanelPos({
      x: refPanelStartPos.current.x + dx,
      y: refPanelStartPos.current.y + dy
    });
  };

  const handleRefPanelPointerUp = (e: React.PointerEvent) => {
    setIsRefPanelDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const selBounds = getSelectionBounds();
  
  const showToolbars = !isUIHidden;
  const toolbarTransitionClass = "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <div className={`h-screen w-full flex ${theme.bg} ${theme.text} font-sans selection:bg-zinc-700 overflow-hidden relative`}>
      
      {/* Invisible backdrop for closing dropdowns */}
      {activeDropdown && (
        <div 
          className="absolute inset-0 z-[25]"
          onPointerDown={() => setActiveDropdown(null)}
        />
      )}



      {/* Top Floating Reference Panel */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-full max-w-5xl px-4 flex justify-center ${toolbarTransitionClass} ${showToolbars ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'}`}>
        {referenceText && (
          <div className="pointer-events-auto premium-glass rounded-3xl shadow-2xl flex flex-col w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-800/50 bg-zinc-900/50">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Languages size={14} /> Arabic Reference</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsRefCollapsed(!isRefCollapsed)} 
                  className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-zinc-800"
                >
                  {isRefCollapsed ? <><ChevronDown size={14} /> Expand</> : <><ChevronUp size={14} /> Collapse</>}
                </button>
                <div className="w-px h-4 bg-zinc-700"></div>
                <button 
                  onClick={() => { 
                    setDialog({
                      isOpen: true,
                      type: 'confirm',
                      title: 'Remove Reference',
                      message: 'Remove reference text?',
                      onConfirm: () => {
                        setReferenceText(''); setTempRefText('');
                        localStorage.removeItem(REF_STORAGE_KEY);
                        setDialog(null);
                      }
                    });
                  }} 
                  className="flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-full hover:bg-red-500/10"
                >
                  <X size={14} /> Close Reference
                </button>
              </div>
            </div>
            
            {!isRefCollapsed && (
              <div 
                className="w-full overflow-x-auto custom-scrollbar flex items-center min-h-[140px] px-8 py-4 animate-in slide-in-from-top-2 duration-300" 
                dir="rtl"
                onWheel={(e) => {
                  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.currentTarget.scrollLeft -= e.deltaY;
                  }
                }}
              >
                <div className="min-w-max mx-auto px-4">
                  <span 
                    className="text-[6rem] text-white font-serif leading-none tracking-wide whitespace-nowrap" 
                    style={{ fontFamily: "'Amiri', 'Tajawal', 'Traditional Arabic', serif" }}
                  >
                    {referenceText}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Left Toolbar (Drawing & Color) */}
      <div className={`absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 premium-glass rounded-2xl p-2 shadow-2xl ${toolbarTransitionClass} ${showToolbars ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' : '-translate-x-12 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="w-10 h-10 flex items-center justify-center mb-2 relative z-10" title="Khattat">
          <img src="/logo.svg" alt="Khattat" className="w-10 h-auto opacity-90" />
        </div>

        {/* Tools */}
        <button 
          data-tour="select"
          onClick={() => { setDrawMode('select'); commitSelectionToCanvas(); setActiveStamp(null); handleToolInteraction(5); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${drawMode === 'select' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Select (V or M)"
        >
          <MousePointerSquareDashed size={18} />
        </button>
        <button 
          data-tour="draw"
          onClick={() => { setDrawMode('draw'); commitSelectionToCanvas(); setActiveStamp(null); handleToolInteraction(2); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${drawMode === 'draw' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Draw (T)"
        >
          <Type size={18} />
        </button>
        <button 
          data-tour="erase"
          onClick={() => { setDrawMode('erase'); commitSelectionToCanvas(); setActiveStamp(null); handleToolInteraction(3); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${drawMode === 'erase' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Erase (E)"
        >
          <Eraser size={18} />
        </button>
        <button 
          data-tour="pan"
          onClick={() => { setDrawMode('pan'); commitSelectionToCanvas(); handleToolInteraction(4); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${drawMode === 'pan' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Pan Canvas (H)"
        >
          <Hand size={18} />
        </button>

        <div className="w-6 h-px bg-zinc-800 mx-auto my-1 rounded-full" />

        {/* Color Dropdown */}
        <div className="relative">
          <button 
            data-tour="color"
            onClick={() => { toggleDropdown('color'); handleToolInteraction(6); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${activeDropdown === 'color' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
            title="Colors (C)"
          >
            <Palette size={18} />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-zinc-900" style={{ backgroundColor: color }} />
          </button>
          {activeDropdown === 'color' && (
            <div className="absolute left-14 top-0 bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-64 flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-200 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="w-full flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Custom Color</span>
                <X size={14} className="text-zinc-500 cursor-pointer hover:text-zinc-300" onClick={() => setActiveDropdown(null)} />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-zinc-700 shrink-0">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setColor(newColor);
                      if (selectedCellsRef.current) {
                        const updated = { ...selectedCellsRef.current };
                        Object.keys(updated).forEach(k => updated[k] = newColor);
                        setSelectedCells(updated);
                      }
                    }}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono font-bold">#</span>
                  <input 
                    type="text" 
                    value={color.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                      const newColor = `#${val}`;
                      setColor(newColor);
                      if (val.length === 6 && selectedCellsRef.current) {
                        const updated = { ...selectedCellsRef.current };
                        Object.keys(updated).forEach(k => updated[k] = newColor);
                        setSelectedCells(updated);
                      }
                    }}
                    placeholder="FFFFFF"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 font-mono text-zinc-100 uppercase"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Toolbar (Library & Utilities) */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 premium-glass rounded-2xl p-2 shadow-2xl ${toolbarTransitionClass} ${showToolbars ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' : 'translate-x-12 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none -z-10" />
        
        {/* Project / Save Dropdown */}
        <div className="relative">
          <button 
            data-tour="export"
            onClick={() => { toggleDropdown('export'); handleToolInteraction(9); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${activeDropdown === 'export' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
            title="Project File"
          >
            <Save size={18} />
          </button>
          {activeDropdown === 'export' && (
            <div className="absolute right-14 top-0 bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-48 animate-in fade-in slide-in-from-right-2 duration-200 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="w-full flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Project</span>
                <X size={14} className="text-zinc-500 cursor-pointer hover:text-zinc-300" onClick={() => setActiveDropdown(null)} />
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <button onClick={saveProject} className="flex items-center justify-start gap-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                  <Download size={16} /> Save (.khatt)
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-start gap-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                  <FolderOpen size={16} /> Open (.khatt)
                </button>
                <div className="w-full h-px bg-zinc-800 my-1"></div>
                <button onClick={exportToSVG} className="flex items-center justify-start gap-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                  <ImageIcon size={16} /> Export as SVG
                </button>
                <button onClick={exportToPNG} className="flex items-center justify-start gap-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                  <ImageIcon size={16} /> Export as PNG
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-6 h-px bg-zinc-800 mx-auto my-1 rounded-full" />

        {/* Library Button */}
        <button 
          data-tour="library"
          onClick={() => { setIsSettingsOpen(true); setSettingsTab('library'); setActiveDropdown(null); handleToolInteraction(7); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${isSettingsOpen && settingsTab === 'library' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Kufic Library (L)"
        >
          <Library size={18} />
        </button>

        {/* Toggle Grid */}
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${showGrid ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
          title="Toggle Grid (G)"
        >
          <Grid3X3 size={18} />
        </button>

        {/* Reference Dropdown */}
        <div className="relative">
          <button 
            data-tour="reference"
            onClick={() => { toggleDropdown('reference'); handleToolInteraction(8); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-10 ${activeDropdown === 'reference' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-transparent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'}`}
            title="Reference Panel"
          >
            <Languages size={18} />
          </button>
          {activeDropdown === 'reference' && (
            <div className="absolute right-14 top-0 bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-64 animate-in fade-in slide-in-from-right-2 duration-200 cursor-default overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="w-full flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Arabic Reference</span>
                <X size={14} className="text-zinc-500 cursor-pointer" onClick={() => setActiveDropdown(null)} />
              </div>
              <div className="space-y-3 relative z-10">
                <input 
                  type="text" 
                  value={tempRefText}
                  onChange={(e) => setTempRefText(e.target.value)}
                  placeholder="e.g. محمد"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 text-right font-serif"
                  dir="rtl"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (tempRefText.trim()) {
                        setReferenceText(tempRefText);
                        localStorage.setItem(REF_STORAGE_KEY, tempRefText);
                        setActiveDropdown(null);
                      }
                    }}
                    className="flex-1 bg-zinc-100 text-zinc-900 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-6 h-px bg-zinc-800 mx-auto my-1 rounded-full" />

        {/* Settings Button */}
        <button 
          onClick={() => { setIsSettingsOpen(true); setSettingsTab('general'); setActiveDropdown(null); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSettingsOpen && settingsTab !== 'library' ? 'bg-zinc-800 text-zinc-100 shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
          title="Settings & Shortcuts"
        >
          <Settings size={18} />
        </button>

        <div className="w-6 h-px bg-zinc-800 mx-auto my-1 rounded-full" />

        {/* Clear Button */}
        <button 
          onClick={() => {
            setDialog({
              isOpen: true,
              type: 'confirm',
              title: 'Clear Grid',
              message: 'Clear the entire grid? This cannot be fully undone.',
              onConfirm: () => {
                clearGrid();
                setDialog(null);
              }
            });
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          title="Clear Grid"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Settings Modal (Centered Popover) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Header with Top Tabs */}
            <div className="h-16 px-6 flex items-center justify-between relative z-10 shrink-0">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Settings className="text-zinc-400" size={20} /> Settings
              </h2>
              
              <div className="flex items-center gap-1 bg-zinc-950/40 p-1 rounded-2xl border border-zinc-800/40">
                <button 
                  onClick={() => setSettingsTab('general')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${settingsTab === 'general' ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setSettingsTab('library')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${settingsTab === 'library' ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                >
                  <BookOpen size={16} /> Library
                </button>
                <button 
                  onClick={() => setSettingsTab('shortcuts')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${settingsTab === 'shortcuts' ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                >
                  <Keyboard size={16} /> Shortcuts
                </button>
                <button 
                  onClick={() => setSettingsTab('info')}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${settingsTab === 'info' ? 'bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                >
                  <Info size={16} /> Info
                </button>
              </div>

              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative z-10">
                {settingsTab === 'general' && (
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-3xl p-8 backdrop-blur-md">
                      <h4 className="text-lg font-bold text-zinc-100 mb-6">Canvas Grid</h4>
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-zinc-200 font-medium">Show Grid</p>
                            <p className="text-sm text-zinc-500">Toggle the visibility of grid lines on the drawing canvas.</p>
                          </div>
                          <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showGrid ? 'bg-blue-500' : 'bg-zinc-700'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showGrid ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-zinc-200 font-medium">Grid Color</p>
                            <p className="text-sm text-zinc-500">Customize the color of the grid lines.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={gridColor}
                              onChange={(e) => setGridColor(e.target.value)}
                              className="w-10 h-10 p-0 rounded-xl cursor-pointer bg-zinc-900 border border-zinc-800"
                            />
                            <span className="text-sm text-zinc-400 font-mono uppercase">{gridColor}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-zinc-200 font-medium">Grid Position</p>
                            <p className="text-sm text-zinc-500">Draw the grid behind or in front of the design.</p>
                          </div>
                          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                            <button
                              onClick={() => setGridPosition('background')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${gridPosition === 'background' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              Background
                            </button>
                            <button
                              onClick={() => setGridPosition('foreground')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${gridPosition === 'foreground' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              Foreground
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-zinc-200 font-medium">Cell Style</p>
                            <p className="text-sm text-zinc-500">Choose between sharp or rounded cell corners.</p>
                          </div>
                          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                            <button
                              onClick={() => setCellStyle('sharp')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${cellStyle === 'sharp' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              Sharp
                            </button>
                            <button
                              onClick={() => setCellStyle('round')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${cellStyle === 'round' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              Round
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={resetGridPreferences}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
                          >
                            Reset to Default
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-3xl p-8 backdrop-blur-md">
                      <h4 className="text-lg font-bold text-zinc-100 mb-2">Onboarding & Tutorial</h4>
                      <p className="text-sm text-zinc-400 mb-6">Replay the introduction tutorial to learn about the features of Khattat.</p>
                      <button 
                        onClick={() => {
                          setOnboardingStep(1);
                          setShowOnboarding(true);
                          setIsSettingsOpen(false);
                        }}
                        className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-white/5 hover:scale-105 active:scale-95"
                      >
                        <Compass size={18} /> Restart Tutorial
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'library' && (
                  <div className="flex flex-col h-full gap-8 max-w-5xl mx-auto">
                    {/* Search Header */}
                    <div className="flex items-center justify-center w-full pb-4">
                      <div className="relative w-full max-w-2xl">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder="Search presets by name or position..." 
                          value={librarySearch}
                          onChange={(e) => setLibrarySearch(e.target.value)}
                          className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-2xl py-3 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* Grouped Grid */}
                    {(() => {
                      const filteredPresets = presets.filter(p => {
                        const rasmGroup = RASM_GROUPS.find(g => g.id === p.rasmId);
                        const matchKeywords = rasmGroup?.keywords.some(k => k.toLowerCase().includes(librarySearch.toLowerCase()));
                        const matchLabel = rasmGroup?.label.toLowerCase().includes(librarySearch.toLowerCase());
                        const matchPosition = p.position.toLowerCase().includes(librarySearch.toLowerCase());
                        const matchLegacy = p.letterName?.toLowerCase().includes(librarySearch.toLowerCase());
                        return matchKeywords || matchLabel || matchPosition || matchLegacy;
                      });

                      if (filteredPresets.length === 0) {
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-20">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-lg">No presets found matching "{librarySearch}".</p>
                          </div>
                        );
                      }

                      const groupedPresets = filteredPresets.reduce((acc, p) => {
                        const rasmGroup = RASM_GROUPS.find(g => g.id === p.rasmId);
                        const groupKey = rasmGroup ? rasmGroup.label : (p.letterName || 'Unknown');
                        if (!acc[groupKey]) acc[groupKey] = [];
                        acc[groupKey].push(p);
                        return acc;
                      }, {} as Record<string, PresetShape[]>);

                      return (
                        <div className="space-y-8">
                          {Object.entries(groupedPresets)
                            .sort(([a], [b]) => {
                              const idxA = RASM_GROUPS.findIndex(g => g.label === a);
                              const idxB = RASM_GROUPS.findIndex(g => g.label === b);
                              return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                            })
                            .map(([letterName, group]) => (
                            <div key={letterName} className="space-y-4">
                              <h4 className="text-lg font-bold text-zinc-300 border-b border-zinc-800/50 pb-2 flex items-center gap-2">
                                {letterName}
                                <span className="text-sm font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">{group.length}</span>
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {[...group].sort((a, b) => {
                                  const order = { initial: 1, medial: 2, final: 3, isolate: 4, variant: 5 } as Record<string, number>;
                                  return (order[a.position] || 99) - (order[b.position] || 99);
                                }).map((preset: PresetShape) => {
                                  const w = preset.width || 1;
                                  const h = preset.height || 1;
                                  const size = Math.max(w, h);
                                  
                                  return (
                                    <div key={preset.id} className="group relative bg-zinc-950/30 border border-zinc-800/40 rounded-2xl p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-xl backdrop-blur-md"
                                      onClick={() => { setActiveStamp(preset); setDrawMode('stamp'); setIsSettingsOpen(false); }}
                                    >
                                      {/* Mini Canvas Render */}
                                      <div className="w-full aspect-square bg-zinc-950/80 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-zinc-800/50 relative p-3">
                                        <div style={{ position: 'relative', width: `${(w / size) * 100}%`, height: `${(h / size) * 100}%` }}>
                                          {Object.entries(preset.cells).map(([key, color]) => {
                                            const [r, c] = key.split(',').map(Number);
                                            return (
                                              <div 
                                                key={key}
                                                style={{ 
                                                  position: 'absolute', 
                                                  top: `${(r / h) * 100}%`, 
                                                  left: `${(c / w) * 100}%`, 
                                                  width: `${(1 / w) * 100.5}%`, 
                                                  height: `${(1 / h) * 100.5}%`, 
                                                  backgroundColor: color 
                                                }}
                                              />
                                            )
                                          })}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between mt-3">
                                        <h4 className="text-zinc-100 font-medium text-sm capitalize">
                                            {preset.position}
                                        </h4>
                                        
                                        {/* Actions */}
                                        <div className="flex gap-1">
                                          <button 
                                            onClick={(e) => { 
                                              e.stopPropagation();
                                              setEditPresetId(preset.id);
                                              setSaveForm({ rasmId: preset.rasmId, position: preset.position });
                                              setShowSaveDialog(true);
                                            }}
                                            className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
                                            title="Edit Preset"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setDialog({
                                                isOpen: true,
                                                type: 'confirm',
                                                title: 'Delete Preset',
                                                message: 'Delete this preset?',
                                                onConfirm: () => {
                                                  const updatedList = presets.filter(p => p.id !== preset.id);
                                                  setPresets(updatedList);
                                                  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedList));
                                                  if (activeStamp?.id === preset.id) {
                                                    setActiveStamp(null);
                                                    setDrawMode('draw');
                                                  }
                                                  setDialog(null);
                                                }
                                              });
                                            }}
                                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                            title="Delete Preset"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {settingsTab === 'shortcuts' && (
                  <div className="max-w-3xl mx-auto relative z-10">
                    <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-3xl overflow-hidden backdrop-blur-md">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800/50 text-zinc-500">
                            <th className="py-5 px-8 font-semibold w-1/3">Shortcut</th>
                            <th className="py-5 px-8 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-zinc-800/30">
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Tab</kbd></td><td className="py-4 px-6 text-zinc-400">Toggle UI</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">T</kbd></td><td className="py-4 px-6 text-zinc-400">Draw Tool</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">E</kbd></td><td className="py-4 px-6 text-zinc-400">Eraser Tool</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">H</kbd></td><td className="py-4 px-6 text-zinc-400">Pan Tool (Hand)</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">V</kbd> / <kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">M</kbd></td><td className="py-4 px-6 text-zinc-400">Selection Tool</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">C</kbd></td><td className="py-4 px-6 text-zinc-400">Toggle Colors</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">L</kbd></td><td className="py-4 px-6 text-zinc-400">Toggle Library</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + L</kbd></td><td className="py-4 px-6 text-zinc-400">Quick Search</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + Z</kbd></td><td className="py-4 px-6 text-zinc-400">Undo</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + Y</kbd></td><td className="py-4 px-6 text-zinc-400">Redo</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + C</kbd></td><td className="py-4 px-6 text-zinc-400">Copy</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + V</kbd></td><td className="py-4 px-6 text-zinc-400">Paste</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + D</kbd></td><td className="py-4 px-6 text-zinc-400">Duplicate</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + S</kbd></td><td className="py-4 px-6 text-zinc-400">Save Project</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Ctrl + O</kbd></td><td className="py-4 px-6 text-zinc-400">Open Project</td></tr>
                        <tr className="hover:bg-zinc-800/20 transition-colors"><td className="py-4 px-6"><kbd className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-zinc-200 shadow-sm">Delete</kbd></td><td className="py-4 px-6 text-zinc-400">Delete Selection</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {settingsTab === 'info' && (
                  <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                    <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-3xl p-8 backdrop-blur-md hover:bg-zinc-950/50 transition-colors">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                           <img src="/logo.svg" alt="Logo" className="w-16 h-16 opacity-90 animate-pulse-slow" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Khattat</h3>
                          <p className="text-zinc-400 mt-1 font-medium text-lg">The Open-Source Square Kufic Design Tool</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 flex flex-col gap-1">
                          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Version</span>
                          <span className="text-zinc-200 font-mono text-lg font-medium">v1.0.0</span>
                        </div>
                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 flex flex-col gap-1">
                          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Release Date</span>
                          <span className="text-zinc-200 font-medium text-lg">June 2026</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                        <p className="text-sm text-zinc-400 mb-4 text-center max-w-md">Stay up to date with the latest features, improvements, and bug fixes for Khattat.</p>
                        <a 
                          href="/updates" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center gap-2 hover:scale-105"
                        >
                          <RefreshCcw size={18} />
                          Check for Updates
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

      {/* Onboarding / Tutorial Panel */}
      {showOnboarding && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <style dangerouslySetInnerHTML={{__html: `
            [data-tour="${['center', 'draw', 'erase', 'pan', 'select', 'color', 'library', 'reference', 'export'][onboardingStep - 1]}"] {
              box-shadow: 0 0 0 2px #18181b, 0 0 0 4px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.5) !important;
              border-radius: 12px;
              z-index: 50;
              transition: all 0.3s ease;
            }
          `}} />
          
          <div 
            className="absolute bg-zinc-900 border border-zinc-800/80 rounded-xl shadow-2xl w-[280px] overflow-visible pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={panelStyle}
          >
            {/* Directional Line Connected to Tool */}
            {panelSide === 'left' && (
              <div className="absolute top-1/2 -left-6 w-6 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] -translate-y-1/2 origin-right">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]" />
              </div>
            )}
            {panelSide === 'right' && (
              <div className="absolute top-1/2 -right-6 w-6 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] -translate-y-1/2 origin-left">
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]" />
              </div>
            )}

            <div className="p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
              
              {(() => {
                const steps = [
                  { id: 1, title: 'Welcome to Khattat', desc: 'Create, design, and export intricate Square Kufic layouts with ease.', icon: Sparkles, color: 'text-blue-400' },
                  { id: 2, title: 'Draw Tool', desc: 'Click and drag on the grid to draw blocks.', icon: Type, color: 'text-emerald-400' },
                  { id: 3, title: 'Erase Tool', desc: 'Remove blocks by dragging over them.', icon: Eraser, color: 'text-rose-400' },
                  { id: 4, title: 'Pan Canvas', desc: 'Pan your canvas infinitely by dragging.', icon: Hand, color: 'text-amber-400' },
                  { id: 5, title: 'Marquee Selection', desc: 'Select an area to rotate, flip, or duplicate.', icon: MousePointerSquareDashed, color: 'text-purple-400' },
                  { id: 6, title: 'Color Picker', desc: 'Change your active drawing color or recolor blocks.', icon: Palette, color: 'text-pink-400' },
                  { id: 7, title: 'Kufic Library', desc: 'Save and reuse your favorite letter shapes.', icon: Library, color: 'text-indigo-400' },
                  { id: 8, title: 'Arabic Reference', desc: 'Pin text to help guide your designs.', icon: Languages, color: 'text-cyan-400' },
                  { id: 9, title: 'Save & Export', desc: 'Save your workspace to resume later.', icon: Save, color: 'text-teal-400' },
                ];
                
                const step = steps[onboardingStep - 1] || steps[0];
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                    <div className={`mt-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800 ${step.color} shadow-sm shrink-0`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h2 className="text-sm font-semibold text-zinc-100">{step.title}</h2>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })()}
              
              {/* Controls */}
              <div className="flex items-center justify-between pt-1 relative z-10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${onboardingStep === i ? 'w-4 bg-blue-500' : 'w-1 bg-zinc-800'}`} 
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      localStorage.setItem('khattat-onboarding-seen', 'true');
                      setShowOnboarding(false);
                    }}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Skip
                  </button>
                  {onboardingStep === 1 && (
                    <button 
                      onClick={() => setOnboardingStep(2)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {onboardingStep > 1 && (
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider animate-pulse">
                      Click Tool
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Preset Dialog Modal */}

      {showSaveDialog && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl w-80 p-6 animate-in zoom-in-95 duration-200">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-4 relative z-10">{editPresetId ? 'Edit Shape Preset' : 'Save Shape Preset'}</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="relative">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Base Shape (Rasm)</label>
                <div 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 text-white cursor-pointer flex items-center justify-between shadow-sm hover:border-zinc-700 transition-colors"
                  onClick={() => setActiveDropdown(activeDropdown === 'rasm' ? null : 'rasm')}
                >
                  <span className="truncate">{RASM_GROUPS.find(g => g.id === saveForm.rasmId)?.label || 'Select Rasm'}</span>
                  <ChevronDown size={16} className={`text-zinc-500 transition-transform ${activeDropdown === 'rasm' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'rasm' && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar overflow-x-hidden p-1">
                    {RASM_GROUPS.map(g => (
                      <div 
                        key={g.id}
                        onClick={() => {
                          setSaveForm({...saveForm, rasmId: g.id});
                          setActiveDropdown(null);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors flex items-center justify-between ${saveForm.rasmId === g.id ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
                      >
                        <span className="truncate">{g.label}</span>
                        {saveForm.rasmId === g.id && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Position Rule</label>
                <div 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 text-white cursor-pointer flex items-center justify-between shadow-sm hover:border-zinc-700 transition-colors"
                  onClick={() => setActiveDropdown(activeDropdown === 'position' ? null : 'position')}
                >
                  <span className="truncate">
                    {{
                      'initial': 'Initial (Start of word)',
                      'medial': 'Medial (Middle of word)',
                      'final': 'Final (End of word)',
                      'isolate': 'Isolate (Standalone)',
                      'variant': 'Variant (Alternative)'
                    }[saveForm.position] || 'Select Position'}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-500 transition-transform ${activeDropdown === 'position' ? 'rotate-180' : ''}`} />
                </div>
                {activeDropdown === 'position' && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1">
                    {[
                      { id: 'initial', label: 'Initial (Start of word)' },
                      { id: 'medial', label: 'Medial (Middle of word)' },
                      { id: 'final', label: 'Final (End of word)' },
                      { id: 'isolate', label: 'Isolate (Standalone)' },
                      { id: 'variant', label: 'Variant (Alternative)' }
                    ].map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSaveForm({...saveForm, position: p.id as KuficPosition});
                          setActiveDropdown(null);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer rounded-lg transition-colors flex items-center justify-between ${saveForm.position === p.id ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
                      >
                        <span className="truncate">{p.label}</span>
                        {saveForm.position === p.id && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    setShowSaveDialog(false);
                    setEditPresetId(null);
                  }}
                  className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePreset}
                  disabled={!saveForm.rasmId}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editPresetId ? 'Update Preset' : 'Save to Library'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center Workspace / Infinite Canvas */}
      <section 
        className={`flex-1 relative overflow-hidden bg-zinc-950 touch-none ${drawMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : drawMode === 'select' ? 'cursor-crosshair' : 'cursor-crosshair'}`}
        style={{
          backgroundImage: showGrid && gridPosition === 'background'
            ? `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
        }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={(e) => {
          setHoverCell(null);
          handleCanvasPointerUp(e);
        }}
        onWheel={handleCanvasWheel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          // Canvas click logic
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        >
          {/* Render drawn cells */}
          <DrawnCellsLayer cells={drawnCells} cellSize={cellSize} cellStyle={cellStyle} />

          {/* Render Stamp Preview */}
          {drawMode === 'stamp' && activeStamp && hoverCell && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {Object.entries(activeStamp.cells).map(([k, v]) => {
                const [r, c] = k.split(',').map(Number);
                return (
                  <div 
                    key={`stamp-${k}`}
                    className="absolute pointer-events-none opacity-50 bg-blue-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                    style={{
                      top: (hoverCell.r + r) * cellSize,
                      left: (hoverCell.c + c) * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Render selected cells */}
          {selectedCells && (
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(selectedCells).map(([key, cellColor]) => {
                const [r, c] = key.split(',').map(Number);
                return (
                  <div 
                    key={`sel-${key}`}
                    className="absolute pointer-events-none opacity-90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] z-10"
                    style={{
                      top: (r + selectionOffset.r) * cellSize,
                      left: (c + selectionOffset.c) * cellSize,
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cellColor
                    }}
                  />
                );
              })}
              {selBounds && (
                <div 
                  className="absolute border-2 border-blue-500 border-dashed z-20 pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  style={{
                    top: selBounds.minR * cellSize,
                    left: selBounds.minC * cellSize,
                    width: (selBounds.maxC - selBounds.minC + 1) * cellSize,
                    height: (selBounds.maxR - selBounds.minR + 1) * cellSize,
                  }}
                >
                  {/* Scale Handles */}
                  {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => {
                    let top = '50%';
                    let left = '50%';
                    let cursor = 'pointer';
                    if (handle.includes('n')) { top = '-6px'; cursor = 'ns-resize'; }
                    if (handle.includes('s')) { top = 'calc(100% - 6px)'; cursor = 'ns-resize'; }
                    if (handle.includes('w')) { left = '-6px'; cursor = 'ew-resize'; }
                    if (handle.includes('e')) { left = 'calc(100% - 6px)'; cursor = 'ew-resize'; }
                    if (handle === 'nw' || handle === 'se') cursor = 'nwse-resize';
                    if (handle === 'ne' || handle === 'sw') cursor = 'nesw-resize';

                    return (
                      <div 
                        key={handle}
                        onPointerDown={() => { clickedHandleRef.current = handle; }}
                        className="absolute w-3 h-3 bg-white border border-blue-600 rounded-sm pointer-events-auto"
                        style={{ top, left, cursor, transform: handle.length === 1 ? (handle === 'n' || handle === 's' ? 'translateX(-50%)' : 'translateY(-50%)') : 'none' }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Render Marquee Box */}
        {isMarqueeDrawing && marqueeStartRef.current && marqueeCurrent && (
          <div 
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-30"
            style={{
              left: Math.min(marqueeStartRef.current.x, marqueeCurrent.x),
              top: Math.min(marqueeStartRef.current.y, marqueeCurrent.y),
              width: Math.abs(marqueeCurrent.x - marqueeStartRef.current.x),
              height: Math.abs(marqueeCurrent.y - marqueeStartRef.current.y),
            }}
          />
        )}

        {showGrid && gridPosition === 'foreground' && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
          />
        )}
      </section>

      {/* Floating Selection Toolbar */}
      {selBounds && !isSelectionDragging && !isScaling && (
        <div 
          className="absolute z-40 bg-blue-600 border border-blue-500 shadow-xl rounded-xl flex gap-1 p-1 animate-in slide-in-from-top-2"
          style={{
            top: (selBounds.maxR + 1) * cellSize + panOffset.y + 12,
            left: selBounds.minC * cellSize + panOffset.x,
          }}
        >
          <button onClick={() => setShowSaveDialog(true)} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1 px-3 font-semibold text-xs" title="Save Preset to Library">
            <Save size={14} /> Save
          </button>
          <div className="w-px bg-blue-400 mx-1 my-1"></div>
          <button onClick={copySelection} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Copy (Ctrl+C)">
            <Copy size={16} />
          </button>
          <button onClick={pasteSelection} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Paste (Ctrl+V)">
            <ClipboardPaste size={16} />
          </button>
          <button onClick={duplicateSelection} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Duplicate (Ctrl+D)">
            <CopyPlus size={16} />
          </button>
          <div className="w-px bg-blue-400 mx-1 my-1"></div>
          <button onClick={flipHorizontal} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Flip Horizontal">
            <FlipHorizontal size={16} />
          </button>
          <button onClick={flipVertical} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Flip Vertical">
            <FlipVertical size={16} />
          </button>
          <button onClick={rotate90} className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Rotate 90°">
            <RotateCw size={16} />
          </button>
          <div className="w-px bg-blue-400 mx-1 my-1"></div>
          <button onClick={deleteSelection} className="p-2 hover:bg-red-500 text-white rounded-lg transition-colors" title="Delete Selection">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Viewport Controls */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 premium-glass rounded-full px-4 py-2 shadow-2xl z-30 overflow-hidden ${toolbarTransitionClass} ${showToolbars ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
        
        <button 
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 disabled:hover:bg-transparent transition-colors relative z-10"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button 
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 disabled:hover:bg-transparent transition-colors relative z-10"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-2 relative z-10"></div>
        <button 
          onClick={() => setZoom(Math.max(10, zoom - 10))}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors relative z-10"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-medium w-12 text-center text-zinc-300 relative z-10">{zoom}%</span>
        <button 
          onClick={() => setZoom(Math.min(500, zoom + 10))}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors relative z-10"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-2 relative z-10"></div>
        <button 
          onClick={() => { setZoom(100); setPanOffset({ x: 0, y: 0 }); }}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors relative z-10"
          title="Reset View"
        >
          <Maximize2 size={16} />
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Toggle Fullscreen"
        >
          <Expand size={16} />
        </button>
      </div>

      {/* Custom Dialogs */}
      {dialog && dialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDialog(null)}>
          <div className="bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">{dialog.title}</h3>
            <p className="text-zinc-400 mb-6">{dialog.message}</p>
            <div className="flex justify-end gap-3">
              {(dialog.type === 'confirm' || dialog.onCancel) && (
                <button 
                  onClick={() => {
                    if (dialog.onCancel) dialog.onCancel();
                    setDialog(null);
                  }}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-medium"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  if (dialog.type === 'alert') setDialog(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-medium shadow-sm"
              >
                {dialog.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-zinc-800 border border-zinc-700/50 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <Check size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {showQuickSearch && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuickSearch(false)}
        >
          <div 
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-zinc-800">
              <Search className="w-5 h-5 text-zinc-400 mr-3" />
              <input 
                ref={quickSearchInputRef}
                type="text"
                value={quickSearchQuery}
                onChange={e => setQuickSearchQuery(e.target.value)}
                placeholder="Search presets... (Esc to close)"
                className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-500 text-lg"
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setShowQuickSearch(false);
                  }
                }}
              />
            </div>
            {quickSearchQuery && (
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                {(() => {
                  const query = quickSearchQuery.toLowerCase();
                  const results = presets.filter(p => {
                    const rasmGroup = RASM_GROUPS.find(g => g.id === p.rasmId);
                    const matchKeywords = rasmGroup?.keywords.some(k => k.toLowerCase().includes(query));
                    const matchLabel = rasmGroup?.label?.toLowerCase().includes(query);
                    const matchPosition = p.position.toLowerCase().includes(query);
                    const matchLegacy = p.letterName?.toLowerCase().includes(query);
                    return matchKeywords || matchLabel || matchPosition || matchLegacy;
                  });
                  if (results.length === 0) return <div className="p-4 text-center text-zinc-500">No presets found.</div>;
                  return results.map(preset => (
                    <div 
                      key={preset.id}
                      onClick={() => {
                        setActiveStamp(preset);
                        setDrawMode('stamp');
                        setShowQuickSearch(false);
                      }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800 cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-zinc-950 rounded-lg flex items-center justify-center shrink-0">
                        <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                          {(() => {
                            let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
                            const entries = Object.entries(preset.cells);
                            entries.forEach(([k]) => {
                              const [r, c] = k.split(',').map(Number);
                              if (r < minR) minR = r; if (r > maxR) maxR = r;
                              if (c < minC) minC = c; if (c > maxC) maxC = c;
                            });
                            const w = maxC - minC + 1;
                            const h = maxR - minR + 1;
                            const size = Math.max(w, h, 1);
                            return entries.map(([k, color]) => {
                              const [r, c] = k.split(',').map(Number);
                              return (
                                <div 
                                  key={k}
                                  style={{
                                    position: 'absolute',
                                    top: `${((r - minR) / size) * 100}%`,
                                    left: `${((c - minC) / size) * 100}%`,
                                    width: `${(1 / size) * 100}%`,
                                    height: `${(1 / size) * 100}%`,
                                    backgroundColor: color
                                  }}
                                />
                              );
                            });
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 capitalize">{preset.letterName || RASM_GROUPS.find(g => g.id === preset.rasmId)?.label || preset.rasmId}</div>
                        <div className="text-sm text-zinc-500 capitalize">{preset.position}</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        accept=".khatt" 
        className="hidden" 
        onChange={loadProject}
      />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />

      <GlobalTooltip />
    </div>
  );
}
