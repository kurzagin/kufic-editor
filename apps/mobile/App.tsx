import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, CyberSwitch, Badge, TechLabel } from '@krpkg/ui/native';
import {
  GridTool,
  GridCellStyle,
  getBoundingBox,
} from '@khattat/core';

const CELL_SIZE = 24;
const DEFAULT_GRID_ROWS = 24;
const DEFAULT_GRID_COLS = 24;

export default function App() {
  const [cells, setCells] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState('#38bdf8');
  const [tool, setTool] = useState<GridTool>('draw');
  const [cellStyle, setCellStyle] = useState<GridCellStyle>('sharp');
  const [history, setHistory] = useState<Record<string, string>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active touch drawing state
  const isDrawingRef = useRef(false);
  const cellsRef = useRef(cells);
  cellsRef.current = cells;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;

  const pushHistory = useCallback((newCells: Record<string, string>) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newCells].slice(-15);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 14));
  }, [historyIndex]);

  const handleCellTouch = useCallback((r: number, c: number) => {
    if (r < 0 || r >= DEFAULT_GRID_ROWS || c < 0 || c >= DEFAULT_GRID_COLS) return;
    const key = `${r},${c}`;
    const currentTool = toolRef.current;
    const currentColor = selectedColorRef.current;

    setCells((prev) => {
      if (currentTool === 'erase') {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (prev[key] === currentColor) return prev;
      return { ...prev, [key]: currentColor };
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        isDrawingRef.current = true;
        const { locationX, locationY } = evt.nativeEvent;
        const c = Math.floor(locationX / CELL_SIZE);
        const r = Math.floor(locationY / CELL_SIZE);
        handleCellTouch(r, c);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        if (!isDrawingRef.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        const c = Math.floor(locationX / CELL_SIZE);
        const r = Math.floor(locationY / CELL_SIZE);
        handleCellTouch(r, c);
      },
      onPanResponderRelease: () => {
        isDrawingRef.current = false;
        pushHistory(cellsRef.current);
      },
    })
  ).current;

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setCells(history[nextIndex]);
    }
  };

  const handleClear = () => {
    setCells({});
    pushHistory({});
  };

  const cellCount = Object.keys(cells).length;
  const bbox = getBoundingBox(cells);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header HUD */}
      <View style={styles.header}>
        <View>
          <TechLabel label="KHATTAT KUFIC" coord="SYS.01" jp="クーフィー体" />
          <Text style={styles.subTitle}>Square Kufic Calligraphy Studio</Text>
        </View>
        <View style={styles.headerStats}>
          <Badge label={`${cellCount} Cells`} variant="accent" />
          {bbox && (
            <Badge
              label={`${bbox.width}x${bbox.height}`}
              variant="outline"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      </View>

      {/* Tools bar */}
      <View style={styles.toolbar}>
        <Button
          label="Pen"
          variant={tool === 'draw' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => setTool('draw')}
        />
        <Button
          label="Eraser"
          variant={tool === 'erase' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => setTool('erase')}
          style={{ marginLeft: 6 }}
        />
        <Button
          label="Undo"
          variant="outline"
          size="sm"
          disabled={historyIndex <= 0}
          onPress={handleUndo}
          style={{ marginLeft: 6 }}
        />
        <Button
          label="Clear"
          variant="danger"
          size="sm"
          onPress={handleClear}
          style={{ marginLeft: 6 }}
        />
      </View>

      {/* Canvas Viewport */}
      <View style={styles.canvasContainer}>
        <ScrollView horizontal bounces={false} contentContainerStyle={styles.canvasScroll}>
          <ScrollView bounces={false} contentContainerStyle={styles.canvasScroll}>
            <View
              style={[
                styles.gridSurface,
                {
                  width: DEFAULT_GRID_COLS * CELL_SIZE,
                  height: DEFAULT_GRID_ROWS * CELL_SIZE,
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* Grid cell lines */}
              {Array.from({ length: DEFAULT_GRID_ROWS }).map((_, r) => (
                <View key={`row-${r}`} style={styles.gridRow}>
                  {Array.from({ length: DEFAULT_GRID_COLS }).map((_, c) => {
                    const key = `${r},${c}`;
                    const color = cells[key];
                    return (
                      <View
                        key={key}
                        style={[
                          styles.cell,
                          {
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            backgroundColor: color || 'transparent',
                            borderRadius: cellStyle === 'round' && color ? 4 : 0,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Bottom Controls Sheet */}
      <View style={styles.footer}>
        <View style={styles.paletteRow}>
          {['#ffffff', '#38bdf8', '#4ade80', '#facc15', '#fb923c', '#f43f5e', '#a855f7'].map(
            (c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorDotActive,
                ]}
                onPress={() => setSelectedColor(c)}
              />
            )
          )}
        </View>

        <View style={styles.switchRow}>
          <CyberSwitch
            label="Rounded Corners"
            checked={cellStyle === 'round'}
            onChange={(checked) => setCellStyle(checked ? 'round' : 'sharp')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  subTitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerStats: {
    flexDirection: 'row',
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
    backgroundColor: '#0e131f',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#070a0f',
  },
  canvasScroll: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gridSurface: {
    backgroundColor: '#0b101b',
    borderColor: '#1e293b',
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#151d2f',
  },
  footer: {
    padding: 16,
    backgroundColor: '#0e131f',
    borderTopWidth: 1,
    borderTopColor: '#1e2638',
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
