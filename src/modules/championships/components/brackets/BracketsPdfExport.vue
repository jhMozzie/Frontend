<template>
  <button
    ref="exportBtn"
    @click="onButtonClick"
    :disabled="isGenerating"
    class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 relative"
    style="z-index:30;"
  >
    <FileDown class="w-4 h-4" />
    <span v-if="isGenerating">Generando PDF...</span>
    <span v-else>Exportar PDF</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { FileDown } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { matchService } from '@/modules/championships/services/matches.service';

const props = defineProps<{
  championshipId: number;
  championshipName?: string;
  logoUrl?: string;
}>();

const isGenerating = ref(false);
const exportBtn = ref<HTMLButtonElement | null>(null);
const championshipStore = useChampionshipStore();

function onButtonClick() {
  if (!isGenerating.value) exportPdf();
}

onMounted(() => {
  nextTick(() => {
    if (!exportBtn.value) return;
    exportBtn.value.addEventListener('click', () => {});
    exportBtn.value.onclick = () => {
      if (!isGenerating.value) exportPdf();
    };
  });
});

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function groupByCategory(matches: any[]) {
  const map = new Map<number, any[]>();
  for (const m of matches) {
    if (!map.has(m.championshipCategoryId)) map.set(m.championshipCategoryId, []);
    map.get(m.championshipCategoryId)?.push(m);
  }
  return map;
}

function extractParticipants(matches: any[]) {
  const map = new Map();
  const push = (p: any) => {
    if (!p) return;
    if (!map.has(p.id)) {
      map.set(p.id, {
        id: p.id,
        nombre: `${p.student?.firstname ?? ''} ${p.student?.lastname ?? ''}`.trim(),
        club: p.student?.academy?.name ?? 'Sin academia'
      });
    }
  };
  matches.forEach(m => {
    push(m.participantAkka);
    push(m.participantAo);
  });
  let nr = 1;
  return [...map.values()].map(p => ({ nr: nr++, ...p }));
}

async function toDataURL(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function formatAgeRange(label?: string): string {
  if (!label) return '';
  return label.replace(/\s*-\s*/g, ' - ');
}

function formatBelt(name?: string): string {
  if (!name) return '';
  const rankRegex = /(\d+(?:er|ro|to|mo)?\s*[Kk]yu)/;
  const m = name.match(rankRegex);
  if (m && m[1]) return m[1].toLowerCase();
  if (/negro/i.test(name)) return 'negro';
  const parts = name.trim().split(/\s+/);
  return parts.slice(-2).join(' ').toLowerCase();
}

// -----------------------------------------------------------------------------
// HEADER
// -----------------------------------------------------------------------------
async function drawHeader(doc: jsPDF, titleLeft: string, titleRight: string, logoUrl?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - margin * 2, doc.internal.pageSize.getHeight() - margin * 2);

  if (logoUrl) {
    const dataURL = await toDataURL(logoUrl);
    if (dataURL) {
      doc.addImage(dataURL, 'PNG', margin + 5, margin + 5, 50, 40);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(titleLeft, pageWidth / 2, margin + 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(titleRight, pageWidth / 2, margin + 40, { align: 'center' });

  // Línea divisoria header
  doc.line(margin + 5, margin + 50, pageWidth - margin - 5, margin + 50);
}

// -----------------------------------------------------------------------------
// TABLA DE PARTICIPANTES (MULTICOLUMNA)
// -----------------------------------------------------------------------------
function drawParticipantsTable(doc: jsPDF, participants: any[], startY: number) {
  // Configuración
  const maxRowsPerCol = 5; // Tu requerimiento: máx 5 por columna
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const colGap = 10;
  
  // Calcular cuántas columnas necesitamos
  const totalCols = Math.ceil(participants.length / maxRowsPerCol);
  // Ancho de cada tabla
  const tableWidth = (pageWidth - (margin * 2) - ((totalCols - 1) * colGap)) / totalCols;

  let maxFinalY = startY;

  // Dibujar columnas
  for (let i = 0; i < totalCols; i++) {
    const startIdx = i * maxRowsPerCol;
    const endIdx = startIdx + maxRowsPerCol;
    const chunk = participants.slice(startIdx, endIdx);

    const currentX = margin + (i * (tableWidth + colGap));

    autoTable(doc, {
      startY: startY,
      head: [['Nr.', 'Nombre', 'Club']],
      body: chunk.map((p: any) => [p.nr, p.nombre, p.club]),
      styles: { fontSize: 7, cellPadding: 1, lineColor: [0, 102, 153], lineWidth: 0.1 },
      headStyles: { fontStyle: 'bold', fillColor: [0, 102, 153], textColor: [255, 255, 255], minCellHeight: 10 },
      bodyStyles: { minCellHeight: 8 },
      margin: { left: currentX },
      tableWidth: tableWidth,
      theme: 'grid'
    });

    // Guardar la Y más baja alcanzada para saber dónde empezar el bracket
    if ((doc as any).lastAutoTable.finalY > maxFinalY) {
      maxFinalY = (doc as any).lastAutoTable.finalY;
    }
  }

  return maxFinalY;
}

// -----------------------------------------------------------------------------
// DIBUJAR CAJA (ESTILO LIMPIO)
// -----------------------------------------------------------------------------
function drawSingleBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  club: string,
  score: number | null | undefined,
  isRed: boolean,
  isWinner: boolean,
  fontSize: number,
  isEmpty: boolean = false
) {
  const colorObj = isRed 
    ? { r: 220, g: 53, b: 69 }
    : { r: 13, g: 110, b: 253 };
  
  doc.setLineWidth(1);
  doc.setDrawColor(colorObj.r, colorObj.g, colorObj.b);
  
  const fillColor = isWinner ? [245, 245, 245] : [255, 255, 255];
  doc.setFillColor(fillColor[0]!, fillColor[1]!, fillColor[2]!);

  if (typeof (doc as any).roundedRect === 'function') {
    (doc as any).roundedRect(x, y, w, h, 2, 2, 'FD');
  } else {
    doc.rect(x, y, w, h, 'FD');
  }

  // Si está vacío, no dibujamos texto
  if (isEmpty || !name) {
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0);
    return;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  doc.setTextColor(colorObj.r, colorObj.g, colorObj.b);
  
  // Truncar texto inteligente
  const scoreSpace = (score !== null && score !== undefined) ? 15 : 0;
  const maxTextWidth = w - 8 - scoreSpace;
  let textToDraw = name;
  
  if (doc.getTextWidth(textToDraw) > maxTextWidth) {
     while (doc.getTextWidth(textToDraw + "...") > maxTextWidth && textToDraw.length > 0) {
        textToDraw = textToDraw.slice(0, -1);
     }
     textToDraw += "...";
  }

  doc.text(textToDraw, x + 4, y + (h * 0.45));

  if (club) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(Math.max(5, fontSize - 2));
    doc.setTextColor(80, 80, 80);
    
    let clubToDraw = club;
    if (doc.getTextWidth(clubToDraw) > maxTextWidth) {
       while (doc.getTextWidth(clubToDraw + "...") > maxTextWidth && clubToDraw.length > 0) {
          clubToDraw = clubToDraw.slice(0, -1);
      }
      clubToDraw += "...";
    }
    doc.text(clubToDraw, x + 4, y + (h * 0.85));
  }

  if (score !== null && score !== undefined) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize + 1);
    doc.setTextColor(colorObj.r, colorObj.g, colorObj.b);
    doc.text(String(score), x + w - 4, y + (h / 2) + 2, { align: 'right' });
  }

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0);
}

// -----------------------------------------------------------------------------
// LÓGICA BRACKET
// -----------------------------------------------------------------------------
interface BracketNode {
  match: any;
  children: BracketNode[];
  round: number;
  position: number;
  isGhost?: boolean; // Para slots vacíos
}

function buildBracketTree(matches: any[]): BracketNode | null {
  const matchMap = new Map<number, BracketNode>();
  matches.forEach(m => matchMap.set(m.id, { match: m, children: [], round: 0, position: 0, isGhost: false }));

  let root: BracketNode | null = null;
  matches.forEach(m => {
    const node = matchMap.get(m.id)!;
    if (m.nextMatchId) {
      const parent = matchMap.get(m.nextMatchId);
      if (parent) parent.children.push(node);
    } else {
      root = node;
    }
  });

  function assignRounds(node: BracketNode): number {
    if (node.children.length === 0) {
      node.round = 0;
      return 0;
    }
    const maxChildRound = Math.max(...node.children.map(c => assignRounds(c)));
    node.round = maxChildRound + 1;
    return node.round;
  }
  if (root) assignRounds(root);
  return root;
}

function getNodesByRound(root: BracketNode): Map<number, BracketNode[]> {
  const rounds = new Map<number, BracketNode[]>();
  function traverse(node: BracketNode) {
    if (!rounds.has(node.round)) rounds.set(node.round, []);
    rounds.get(node.round)!.push(node);
    node.children.forEach(c => traverse(c));
  }
  traverse(root);
  
  const firstRoundNodes = rounds.get(0) || [];
  firstRoundNodes.forEach((node, idx) => { node.position = idx; });

  for (let round = 1; round <= root.round; round++) {
    const nodesInRound = rounds.get(round) || [];
    nodesInRound.forEach(node => {
      if (node.children.length > 0) {
        const childPositions = node.children.map(c => c.position);
        node.position = childPositions.reduce((a, b) => a + b, 0) / childPositions.length;
      }
    });
  }
  rounds.forEach(nodes => nodes.sort((a, b) => a.position - b.position));
  return rounds;
}

// Función para dibujar un bracket con estructura mínima de cuartos de final
function drawBracket(doc: jsPDF, matches: any[], startY: number, numParticipants: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Espacio disponible
  const availableHeight = pageHeight - startY - margin; 
  const availableWidth = pageWidth - (margin * 2);

  // ESTRUCTURA MÍNIMA: Cuartos de final = 3 rondas, 4 matches en ronda 0
  // Determinar el tamaño mínimo del bracket
  const MIN_BRACKET_SIZE = 8; // Mínimo cuartos de final
  const targetSize = Math.max(MIN_BRACKET_SIZE, Math.pow(2, Math.ceil(Math.log2(numParticipants))));
  const targetRounds = Math.log2(targetSize); // 3 para cuartos, 4 para octavos, etc.
  const matchesInFirstRound = targetSize / 2; // 4 para cuartos

  // Construir el árbol real si hay matches
  const realRoot = matches.length > 0 ? buildBracketTree(matches) : null;
  const realRoundsMap = realRoot ? getNodesByRound(realRoot) : new Map();
  const realNumRounds = realRoot ? realRoot.round + 1 : 0;

  // Calcular cuántas rondas reales tenemos y cuántas fantasma necesitamos
  const ghostRoundsNeeded = targetRounds - realNumRounds;

  // --- DIMENSIONES BASE (MÁS GRANDES) ---
  const baseBoxW = 130;   // Más ancho para nombres largos
  const baseBoxH = 32;    // Más alto para mejor legibilidad
  const baseBoxGap = 6;   // Mayor separación entre rojo/azul
  const baseHGap = 35;    // Mayor espacio horizontal entre rondas
  const baseVGap = 15;    // Mayor espacio vertical entre partidos

  const totalMatchHeight = baseBoxH * 2 + baseBoxGap;
  const idealTotalHeight = matchesInFirstRound * totalMatchHeight + (matchesInFirstRound - 1) * baseVGap;
  const idealTotalWidth = targetRounds * baseBoxW + (targetRounds - 1) * baseHGap;

  // Auto-scaling: escalar para llenar el espacio disponible
  const scaleH = availableHeight / idealTotalHeight;
  const scaleW = availableWidth / idealTotalWidth;
  // Usar la escala que mejor llene el espacio, con un máximo de 1.5 para no exagerar
  let scale = Math.min(scaleH, scaleW, 1.5);
  // Mínimo 0.7 para que siga siendo legible
  scale = Math.max(0.7, scale);

  const boxW = baseBoxW * scale;
  const boxH = baseBoxH * scale;
  const boxGap = baseBoxGap * scale;
  const hGap = baseHGap * scale;
  const vGap = baseVGap * scale;
  const fontSize = Math.max(8, 10 * scale);  // Fuente más grande

  const exits = new Map<string, { x: number, y: number }>();
  const entries = new Map<string, { red: {x: number, y: number}, blue: {x: number, y: number} }>();

  // Centrado - usar todo el espacio disponible
  const actualContentWidth = targetRounds * boxW + (targetRounds - 1) * hGap;
  const startX = margin + (availableWidth - actualContentWidth) / 2;
  
  const actualContentHeight = matchesInFirstRound * (boxH * 2 + boxGap) + (matchesInFirstRound - 1) * vGap;
  // Centrar verticalmente en el espacio disponible
  const verticalOffset = Math.max(0, (availableHeight - actualContentHeight) / 2);
  const bracketStartY = startY + verticalOffset;

  // Crear estructura completa del bracket (real + fantasma)
  // Estructura: Array de rondas, cada ronda tiene slots
  interface BracketSlot {
    id: string;
    realMatch?: any;
    isGhost: boolean;
    position: number;
    childIds: string[];
  }

  const bracketStructure: Map<number, BracketSlot[]> = new Map();
  
  // Inicializar todas las rondas con slots vacíos
  for (let round = 0; round < targetRounds; round++) {
    const slotsInRound = Math.pow(2, targetRounds - 1 - round);
    const slots: BracketSlot[] = [];
    for (let i = 0; i < slotsInRound; i++) {
      slots.push({
        id: `r${round}-s${i}`,
        isGhost: true,
        position: i,
        childIds: []
      });
    }
    bracketStructure.set(round, slots);
  }

  // Enlazar hijos
  for (let round = 1; round < targetRounds; round++) {
    const parentSlots = bracketStructure.get(round)!;
    const childSlots = bracketStructure.get(round - 1)!;
    parentSlots.forEach((parent, idx) => {
      const child1 = childSlots[idx * 2];
      const child2 = childSlots[idx * 2 + 1];
      if (child1 && child2) {
        parent.childIds = [child1.id, child2.id];
      }
    });
  }

  // Colocar los matches reales en la estructura
  // Los matches reales van en las rondas finales (las más a la derecha)
  if (realRoot && realRoundsMap.size > 0) {
    // Mapear rondas reales a rondas del bracket objetivo
    // Ronda real 0 (primera ronda) -> Ronda objetivo (ghostRoundsNeeded)
    // Ronda real 1 -> Ronda objetivo (ghostRoundsNeeded + 1)
    // etc.
    
    for (let realRound = 0; realRound < realNumRounds; realRound++) {
      const targetRound = realRound + ghostRoundsNeeded;
      const realNodes = realRoundsMap.get(realRound) || [];
      const targetSlots = bracketStructure.get(targetRound);
      
      if (targetSlots) {
        // Distribuir los matches reales en los slots disponibles
        // Centrar los matches en los slots
        const slotsCount = targetSlots.length;
        const matchesCount = realNodes.length;
        
        if (matchesCount <= slotsCount) {
          // Calcular offset para centrar
          const offset = Math.floor((slotsCount - matchesCount) / 2);
          realNodes.forEach((node: BracketNode, idx: number) => {
            const slotIdx = offset + idx;
            const targetSlot = targetSlots[slotIdx];
            if (slotIdx < slotsCount && targetSlot) {
              targetSlot.realMatch = node.match;
              targetSlot.isGhost = false;
            }
          });
        }
      }
    }
  }

  // --- DIBUJAR ---
  for (let round = 0; round < targetRounds; round++) {
    const slots = bracketStructure.get(round) || [];
    const roundX = startX + round * (boxW + hGap);

    slots.forEach((slot, idx) => {
      // Calcular posición Y basada en la estructura completa
      let matchCenterY: number;
      
      if (round === 0) {
        // Primera ronda: distribuir uniformemente
        const matchBlockH = boxH * 2 + boxGap;
        matchCenterY = bracketStartY + idx * (matchBlockH + vGap) + (matchBlockH / 2);
      } else {
        // Rondas posteriores: centrar entre los hijos
        const childSlots = bracketStructure.get(round - 1)!;
        const child1 = childSlots[idx * 2];
        const child2 = childSlots[idx * 2 + 1];
        
        const child1Exit = child1 ? exits.get(child1.id) : undefined;
        const child2Exit = child2 ? exits.get(child2.id) : undefined;
        
        if (child1Exit && child2Exit) {
          matchCenterY = (child1Exit.y + child2Exit.y) / 2;
        } else {
          const matchBlockH = boxH * 2 + boxGap;
          matchCenterY = bracketStartY + idx * (matchBlockH + vGap) + (matchBlockH / 2);
        }
      }

      const redY = matchCenterY - (boxGap / 2) - boxH;
      const blueY = matchCenterY + (boxGap / 2);
      const redCenterY = redY + (boxH / 2);
      const blueCenterY = blueY + (boxH / 2);

      entries.set(slot.id, {
        red: { x: roundX, y: redCenterY },
        blue: { x: roundX, y: blueCenterY }
      });

      // Obtener datos del match (real o vacío)
      const m = slot.realMatch;
      
      let akName = '';
      let akClub = '';
      let aoName = '';
      let aoClub = '';
      let scoreAkka = null;
      let scoreAo = null;
      let isAkWinner = false;
      let isAoWinner = false;

      if (m && !slot.isGhost) {
        // Match real
        const isBye = !m.participantAkka || !m.participantAo;
        
        akName = m.participantAkka ? `${m.participantAkka.student.firstname} ${m.participantAkka.student.lastname}` : '';
        akClub = m.participantAkka?.student?.academy?.name || '';
        aoName = m.participantAo ? `${m.participantAo.student.firstname} ${m.participantAo.student.lastname}` : '';
        aoClub = m.participantAo?.student?.academy?.name || '';
        scoreAkka = m.scoreAkka;
        scoreAo = m.scoreAo;
        isAkWinner = m.winnerId === m.participantAkka?.id;
        isAoWinner = m.winnerId === m.participantAo?.id;

        // Lógica BYE: ocultar el nombre del ganador en ronda inicial de BYE
        if (isBye) {
          if (m.winnerId && m.winnerId === m.participantAkka?.id) {
            akName = '';
            akClub = '';
          }
          if (m.winnerId && m.winnerId === m.participantAo?.id) {
            aoName = '';
            aoClub = '';
          }
        }
      }

      // Dibujar cajas
      drawSingleBox(doc, roundX, redY, boxW, boxH, akName, akClub, scoreAkka, true, isAkWinner, fontSize, slot.isGhost);
      drawSingleBox(doc, roundX, blueY, boxW, boxH, aoName, aoClub, scoreAo, false, isAoWinner, fontSize, slot.isGhost);

      // Corchete de salida
      const bracketDepth = 5;
      const bracketX = roundX + boxW + bracketDepth;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(roundX + boxW, redCenterY, bracketX, redCenterY);
      doc.line(roundX + boxW, blueCenterY, bracketX, blueCenterY);
      doc.line(bracketX, redCenterY, bracketX, blueCenterY);

      exits.set(slot.id, { x: bracketX, y: matchCenterY });
    });
  }

  // Conectores entre rondas
  for (let round = 1; round < targetRounds; round++) {
    const parentSlots = bracketStructure.get(round)!;
    const childSlots = bracketStructure.get(round - 1)!;

    parentSlots.forEach((parent, idx) => {
      const child1 = childSlots[idx * 2];
      const child2 = childSlots[idx * 2 + 1];

      const child1Exit = child1 ? exits.get(child1.id) : undefined;
      const child2Exit = child2 ? exits.get(child2.id) : undefined;
      const parentEntry = entries.get(parent.id);

      if (child1Exit && parentEntry) {
        const targetY = parentEntry.red.y;
        const midX = (child1Exit.x + parentEntry.red.x) / 2;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(child1Exit.x, child1Exit.y, midX, child1Exit.y);
        doc.line(midX, child1Exit.y, midX, targetY);
        doc.line(midX, targetY, parentEntry.red.x, targetY);
      }

      if (child2Exit && parentEntry) {
        const targetY = parentEntry.blue.y;
        const midX = (child2Exit.x + parentEntry.blue.x) / 2;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(child2Exit.x, child2Exit.y, midX, child2Exit.y);
        doc.line(midX, child2Exit.y, midX, targetY);
        doc.line(midX, targetY, parentEntry.blue.x, targetY);
      }
    });
  }

  // --- CUADRO DE PUESTOS (esquina inferior derecha) ---
  drawPuestosBox(doc);
}

// Función para dibujar el cuadro de puestos/ganadores
function drawPuestosBox(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  
  // Dimensiones del cuadro (más grande para nombres completos)
  const boxWidth = 180;
  const boxHeight = 110;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = pageHeight - margin - boxHeight;
  
  // Dibujar recuadro exterior
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.setFillColor(255, 255, 255);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');
  
  // Título "PUESTOS"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('PUESTOS', boxX + boxWidth / 2, boxY + 18, { align: 'center' });
  
  // Línea debajo del título
  doc.setLineWidth(0.5);
  doc.line(boxX + 5, boxY + 24, boxX + boxWidth - 5, boxY + 24);
  
  // Posiciones con líneas punteadas
  const positions = ['1er', '2do', '3ro', '3ro'];
  const lineStartX = boxX + 35;
  const lineEndX = boxX + boxWidth - 10;
  const lineY = boxY + 42;
  const lineSpacing = 20;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  positions.forEach((pos, idx) => {
    const currentY = lineY + (idx * lineSpacing);
    
    // Número de posición
    doc.setTextColor(0, 0, 0);
    doc.text(pos, boxX + 10, currentY);
    
    // Línea punteada para escribir el nombre
    doc.setDrawColor(150, 150, 150);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(lineStartX, currentY, lineEndX, currentY);
  });
  
  // Restaurar línea sólida
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(0);
}

// -----------------------------------------------------------------------------
// BUILD PDF
// -----------------------------------------------------------------------------
async function buildPdf(doc: jsPDF, matchesTotal: any[], championshipName: string, logoUrl?: string) {
  const grouped = groupByCategory(matchesTotal);
  let first = true;

  for (const [, matches] of grouped) {
    if (!first) doc.addPage();
    first = false;

    const rawCatFromMatch = matches[0]?.championshipCategory;
    const catId = matches[0]?.championshipCategoryId ?? rawCatFromMatch?.id;
    const storeCat = championshipStore.championshipCategories?.find((cc: any) => cc.id === catId);
    const c = storeCat ?? rawCatFromMatch ?? {};

    const ageLabel = formatAgeRange(c.ageRange?.label ?? c.weight ?? '');
    const minBelt = formatBelt(c.beltMinName ?? c.beltMin?.name ?? '');
    const maxBelt = formatBelt(c.beltMaxName ?? c.beltMax?.name ?? '');
    const title = `${c.code ?? ''}: ${c.gender ?? ''} ${ageLabel} de ${minBelt} hasta ${maxBelt}`;

    await drawHeader(doc, championshipName, title, logoUrl);

    const participants = extractParticipants(matches);
    
    // Aquí dibujamos la tabla. La función nos devuelve la Y final usada.
    const afterTableY = drawParticipantsTable(doc, participants, 60);

    // Dibujamos el bracket después de la tabla (con estructura mínima de cuartos)
    drawBracket(doc, matches, afterTableY + 15, participants.length);
  }
}

// -----------------------------------------------------------------------------
// GENERAR PDF (PORTRAIT)
// -----------------------------------------------------------------------------
async function exportPdf() {
  isGenerating.value = true;
  try {
    await championshipStore.fetchChampionshipCategories(props.championshipId, 1, 999);
    const allMatches: any[] = [];
    for (const c of championshipStore.championshipCategories) {
      const ms = await matchService.getBracketsByCategory(c.id);
      allMatches.push(...ms.map(m => ({ ...m, championshipCategory: m.championshipCategory || c })));
    }

    // VOLVEMOS A PORTRAIT (VERTICAL)
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

    await buildPdf(doc, allMatches, props.championshipName ?? "Campeonato de Karate", props.logoUrl);

    // Crear un nombre de archivo seguro que incluya el nombre del campeonato
    const rawName = (props.championshipName && String(props.championshipName)) || 'Campeonato';
    const safeName = rawName
      .normalize('NFD')                    // descomponer acentos
      .replace(/\p{Diacritic}/gu, '')     // quitar diacríticos (compatible con unicode)
      .replace(/[^\w\s-]/g, '')          // quitar caracteres no alfanuméricos
      .trim()
      .replace(/\s+/g, '_');             // espacios por guiones bajos

    doc.save(`brackets-${safeName}-${Date.now()}.pdf`);
  } catch (e) {
    console.error(e);
    alert("Error generando PDF");
  }
  isGenerating.value = false;
}
</script>