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

  let currentY = startY;
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
  score: number,
  isRed: boolean,
  isWinner: boolean,
  fontSize: number
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

  if (name) {
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
}

function buildBracketTree(matches: any[]): BracketNode | null {
  const matchMap = new Map<number, BracketNode>();
  matches.forEach(m => matchMap.set(m.id, { match: m, children: [], round: 0, position: 0 }));

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

function drawBracket(doc: jsPDF, matches: any[], startY: number) {
  const root = buildBracketTree(matches);
  if (!root) return;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Espacio disponible verticalmente
  const availableHeight = pageHeight - startY - margin; 
  // Espacio disponible horizontalmente
  const availableWidth = pageWidth - (margin * 2);

  const roundsMap = getNodesByRound(root);
  const numRounds = root.round + 1;
  const maxMatchesInRound = Math.max(...Array.from(roundsMap.values()).map(r => r.length));

  // --- DIMENSIONES BASE (VERTICAL A4) ---
  const baseBoxW = 110; // Cajas más angostas para caber en vertical
  const baseBoxH = 25;  // Altura estándar
  const baseBoxGap = 4; // Gap pequeño entre rojo/azul
  const baseHGap = 20;  // Conectores cortos
  const baseVGap = 10;  // Gap vertical entre peleas

  const totalMatchHeight = baseBoxH * 2 + baseBoxGap;
  const idealTotalHeight = maxMatchesInRound * totalMatchHeight + (maxMatchesInRound - 1) * baseVGap;
  const idealTotalWidth = numRounds * baseBoxW + (numRounds - 1) * baseHGap;

  // --- AUTO-SCALING VERTICAL ---
  // Si el bracket es muy alto, reducimos la escala para que entre en la página
  let scaleH = 1;
  if (idealTotalHeight > availableHeight) {
    scaleH = availableHeight / idealTotalHeight;
  }
  
  // Auto-scaling horizontal (por si son muchas rondas)
  let scaleW = 1;
  if (idealTotalWidth > availableWidth) {
    scaleW = availableWidth / idealTotalWidth;
  }

  // Usamos la escala más restrictiva, pero limitando para no hacer texto ilegible
  let scale = Math.min(scaleH, scaleW);
  scale = Math.max(0.65, Math.min(scale, 1)); // Mínimo 65% del tamaño original

  const boxW = baseBoxW * scale;
  const boxH = baseBoxH * scale;
  const boxGap = baseBoxGap * scale;
  const hGap = baseHGap * scale;
  const vGap = baseVGap * scale;
  const fontSize = Math.max(7, 9 * scale); // Fuente dinámica

  const exits = new Map<number, { x: number, y: number }>(); 
  const entries = new Map<number, { red: {x: number, y: number}, blue: {x: number, y: number} }>();

  // Centrado Horizontal
  const actualContentWidth = numRounds * boxW + (numRounds - 1) * hGap;
  const startX = margin + (availableWidth - actualContentWidth) / 2;
  
  // Centrado Vertical (o inicio desde arriba si está apretado)
  const actualContentHeight = maxMatchesInRound * (boxH * 2 + boxGap) + (maxMatchesInRound - 1) * vGap;
  const verticalOffset = (availableHeight > actualContentHeight) 
    ? (availableHeight - actualContentHeight) / 2 
    : 0;
    
  const bracketStartY = startY + verticalOffset;

  // --- DIBUJAR ---
  for (let round = 0; round < numRounds; round++) {
    const nodesInRound = roundsMap.get(round) || [];
    nodesInRound.sort((a, b) => a.position - b.position);

    const roundX = startX + round * (boxW + hGap);

    nodesInRound.forEach((node) => {
      let matchCenterY = 0;

      if (node.children && node.children.length > 0) {
        const childYPositions = node.children
          .map(c => exits.get(c.match.id)?.y)
          .filter(y => y !== undefined) as number[];
        
        if (childYPositions.length > 0) {
          const minY = Math.min(...childYPositions);
          const maxY = Math.max(...childYPositions);
          matchCenterY = (minY + maxY) / 2;
        } else {
           const matchBlockH = boxH * 2 + boxGap;
           matchCenterY = bracketStartY + node.position * (matchBlockH + vGap) + (matchBlockH / 2);
        }
      } else {
        const matchBlockH = boxH * 2 + boxGap;
        matchCenterY = bracketStartY + node.position * (matchBlockH + vGap) + (matchBlockH / 2);
      }

      const redY = matchCenterY - (boxGap / 2) - boxH;
      const blueY = matchCenterY + (boxGap / 2);
      const redCenterY = redY + (boxH / 2);
      const blueCenterY = blueY + (boxH / 2);

      entries.set(node.match.id, {
        red: { x: roundX, y: redCenterY },
        blue: { x: roundX, y: blueCenterY }
      });

      const m = node.match;

      // --- LÓGICA PARA 'BYE' ---
      // Si un participante no existe, es un BYE.
      const isBye = !m.participantAkka || !m.participantAo;

      // Por defecto, usamos los nombres que vienen en el match.
      let akName = m.participantAkka ? `${m.participantAkka.student.firstname} ${m.participantAkka.student.lastname}` : '';
      let akClub = m.participantAkka?.student?.academy?.name || '';
      let aoName = m.participantAo ? `${m.participantAo.student.firstname} ${m.participantAo.student.lastname}` : '';
      let aoClub = m.participantAo?.student?.academy?.name || '';

      // Si es un BYE, el ganador (que es el único participante) no debe mostrarse
      // en esta ronda inicial. Su nombre se renderizará en la siguiente ronda.
      if (isBye) {
        if (m.winnerId && m.winnerId === m.participantAkka?.id) {
          akName = ''; // Ocultar nombre
          akClub = ''; // Ocultar club
        }
        if (m.winnerId && m.winnerId === m.participantAo?.id) {
          aoName = ''; // Ocultar nombre
          aoClub = ''; // Ocultar club
        }
      }
      // --- FIN LÓGICA 'BYE' ---

      drawSingleBox(doc, roundX, redY, boxW, boxH, akName, akClub, m.scoreAkka, true, m.winnerId === m.participantAkka?.id, fontSize);
      drawSingleBox(doc, roundX, blueY, boxW, boxH, aoName, aoClub, m.scoreAo, false, m.winnerId === m.participantAo?.id, fontSize);

      // Corchete
      const bracketDepth = 5;
      const bracketX = roundX + boxW + bracketDepth;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(roundX + boxW, redCenterY, bracketX, redCenterY);
      doc.line(roundX + boxW, blueCenterY, bracketX, blueCenterY);
      doc.line(bracketX, redCenterY, bracketX, blueCenterY);

      exits.set(m.id, { x: bracketX, y: matchCenterY });
    });
  }

  // Conectores
  matches.forEach(m => {
    if (m.nextMatchId) {
      const start = exits.get(m.id);
      const parentEntry = entries.get(m.nextMatchId);

      if (start && parentEntry) {
        const parentY = (parentEntry.red.y + parentEntry.blue.y) / 2;
        const target = (start.y < parentY) ? parentEntry.red : parentEntry.blue;
        const midX = (start.x + target.x) / 2;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);

        doc.line(start.x, start.y, midX, start.y);
        doc.line(midX, start.y, midX, target.y);
        doc.line(midX, target.y, target.x, target.y);
      }
    }
  });
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

    // Dibujamos el bracket después de la tabla
    drawBracket(doc, matches, afterTableY + 15);
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

    doc.save(`brackets_${Date.now()}.pdf`);
  } catch (e) {
    console.error(e);
    alert("Error generando PDF");
  }
  isGenerating.value = false;
}
</script>