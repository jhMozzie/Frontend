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
// HELPERS BÁSICOS
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
  doc.text(titleLeft, pageWidth / 2, margin + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(titleRight, pageWidth / 2, margin + 35, { align: 'center' });

  doc.line(margin + 5, margin + 50, pageWidth - margin - 5, margin + 50);
}

// -----------------------------------------------------------------------------
// TABLA DE PARTICIPANTES (más compacta)
// -----------------------------------------------------------------------------
function drawParticipantsTable(doc: jsPDF, participants: any[], startY = 70) {
  autoTable(doc, {
    startY,
    head: [['Nr.', 'Nombre', 'Club']],
    body: participants.map((p: any) => [p.nr, p.nombre, p.club]),
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 102, 153], lineWidth: 0.5 },
    headStyles: { fontStyle: 'bold', fillColor: [0, 102, 153], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
    theme: 'grid'
  });
  return (doc as any).lastAutoTable.finalY;
}

// -----------------------------------------------------------------------------
// CAJA DEL MATCH
// -----------------------------------------------------------------------------
function drawMatchBox(
  doc: jsPDF, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  t: any, 
  b: any, 
  aT: string, 
  aB: string, 
  scoreT: number, 
  scoreB: number, 
  winnerId: number, 
  topId: number, 
  botId: number, 
  isBye: boolean,
  fontSize: number = 8
) {
  const half = h / 2;

  if (isBye) {
    doc.setFillColor(230, 230, 230);
    doc.rect(x, y, w, h, 'FD');
    doc.rect(x, y, w, h);
    doc.line(x, y + half, x + w, y + half);
    return;
  }

  const drawSide = (sy: number, name: string, acad: string, score: number, win: boolean, color: string) => {
    if (win) {
      doc.setFillColor(color === 'red' ? 255 : 200, color === 'red' ? 200 : 220, color === 'red' ? 200 : 255);
      doc.rect(x, sy, w, half, 'F');
    }
    doc.rect(x, sy, w, half);

    if (!name) return;

    doc.setFont('helvetica', win ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const textColor = color === 'red' ? [255, 0, 0] : [0, 0, 255];
    doc.setTextColor(...(textColor as [number, number, number]));
    
    const maxChars = Math.floor(w / (fontSize * 0.5));
    doc.text(name.substring(0, maxChars), x + 3, sy + half / 2);

    if (acad) {
      doc.setFontSize(Math.max(5, fontSize - 2));
      doc.text(acad.substring(0, maxChars), x + 3, sy + half / 2 + (fontSize * 0.7));
    }

    if (score !== null && score !== undefined) {
      doc.setFontSize(fontSize + 1);
      doc.text(String(score), x + w - 3, sy + half / 2, { align: 'right' });
    }
  };

  drawSide(y, t, aT, scoreT, winnerId === topId, 'red');
  drawSide(y + half, b, aB, scoreB, winnerId === botId, 'blue');

  doc.setTextColor(0, 0, 0);
}

// -----------------------------------------------------------------------------
// ARMAR ÁRBOL
// -----------------------------------------------------------------------------
function transformMatches(matches: any[]) {
  return matches.map((m: any) => {
    const bye = (m.participantAkkaId && !m.participantAoId) || (!m.participantAkkaId && m.participantAoId);
    return bye && m.status === 'Completado'
      ? { ...m, participantAkka: null, participantAo: null, scoreAkka: null, scoreAo: null, status: 'BYE' }
      : m;
  });
}

function buildTree(matches: any[]) {
  const m = transformMatches(matches);
  const map = new Map();
  m.forEach((x: any) => map.set(x.id, { ...x, children: [] }));

  let root = null;
  m.forEach((x: any) => {
    if (x.nextMatchId) map.get(x.nextMatchId).children.push(map.get(x.id));
    else root = map.get(x.id);
  });

  return root;
}

function calcDims(node: any, boxH: number, vGap: number): { width: number; height: number } {
  if (!node.children.length) return { width: 1, height: boxH };

  const dims = node.children.map((c: any) => calcDims(c, boxH, vGap));
  return {
    width: Math.max(...dims.map((d: any) => d.width)) + 1,
    height: dims.reduce((s: number, d: any) => s + d.height, 0) + (dims.length - 1) * vGap
  };
}

function drawTree(
  doc: jsPDF, 
  node: any, 
  x: number, 
  y: number, 
  boxW: number, 
  boxH: number, 
  hGap: number, 
  vGap: number,
  fontSize: number
): number {
  if (!node) return y;

  let currentY = y;
  const pos: any[] = [];

  for (const child of node.children) {
    const d = calcDims(child, boxH, vGap);
    drawTree(doc, child, x - boxW - hGap, currentY, boxW, boxH, hGap, vGap, fontSize);
    pos.push({ y: currentY, center: currentY + d.height / 2 });
    currentY += d.height + vGap;
  }

  if (pos.length) {
    y = (pos[0].center + pos[pos.length - 1].center) / 2 - boxH / 2;
  }

  drawMatchBox(
    doc,
    x,
    y,
    boxW,
    boxH,
    node.participantAkka ? `${node.participantAkka.student.firstname} ${node.participantAkka.student.lastname}` : "",
    node.participantAo ? `${node.participantAo.student.firstname} ${node.participantAo.student.lastname}` : "",
    node.participantAkka?.student?.academy?.name ?? "",
    node.participantAo?.student?.academy?.name ?? "",
    node.scoreAkka,
    node.scoreAo,
    node.winnerId,
    node.participantAkka?.id,
    node.participantAo?.id,
    node.status === "BYE",
    fontSize
  );

  // Líneas conectoras
  if (node.children.length === 2) {
    const [c1, c2] = pos;
    const parentY = y + boxH / 2;
    const connectorX = x - hGap / 2;

    doc.line(x - hGap, c1.center, connectorX, c1.center);
    doc.line(x - hGap, c2.center, connectorX, c2.center);
    doc.line(connectorX, c1.center, connectorX, c2.center);
    doc.line(connectorX, parentY, x, parentY);
  }

  return currentY;
}

// -----------------------------------------------------------------------------
// DIBUJAR BRACKET (ajustado dinámicamente, CENTRADO VERTICAL)
// -----------------------------------------------------------------------------
function drawBracket(doc: jsPDF, matches: any[], startY: number): number {
  const node = buildTree(matches);
  if (!node) return startY;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Espacio disponible
  const availableHeight = pageHeight - startY - margin - 10;
  const availableWidth = pageWidth - (margin * 2) - 20;

  // Dimensiones base (valores óptimos para legibilidad)
  let boxW = 110;
  let boxH = 32;
  let hGap = 35;
  let vGap = 12;

  // Calcular dimensiones necesarias con valores base
  const baseDims = calcDims(node, boxH, vGap);
  const baseTotalWidth = baseDims.width * boxW + (baseDims.width - 1) * hGap;
  const baseTotalHeight = Math.max(baseDims.height, boxH);

  // Factor de escala (AHORA SÍ PUEDE AGRANDAR hasta llenar espacio)
  const scaleWidth = availableWidth / baseTotalWidth;
  const scaleHeight = availableHeight / baseTotalHeight;
  
  // Permitimos agrandar hasta 1.8x para brackets pequeños, pero limitamos el máximo
  const scale = Math.min(scaleWidth, scaleHeight, 1.8);

  // Aplicar escala con límites razonables
  boxW = Math.max(70, Math.min(150, Math.round(boxW * scale)));
  boxH = Math.max(28, Math.min(50, Math.round(boxH * scale)));
  hGap = Math.max(10, Math.min(60, Math.round(hGap * scale)));
  vGap = Math.max(8, Math.min(25, Math.round(vGap * scale)));

  // Recalcular con valores escalados
  const scaledDims = calcDims(node, boxH, vGap);
  const scaledWidth = scaledDims.width * boxW + (scaledDims.width - 1) * hGap;
  const scaledHeight = scaledDims.height;

  // ✅ CENTRADO HORIZONTAL
  const startX = Math.max(margin + 10, (pageWidth - scaledWidth) / 2);

  // ✅ CENTRADO VERTICAL (si hay espacio sobrante)
  const verticalMargin = Math.max(0, (availableHeight - scaledHeight) / 2);
  const finalStartY = startY + verticalMargin;

  // Ajustar tamaño de fuente según escala (más grande para brackets pequeños)
  const fontSize = Math.max(7, Math.min(10, Math.round(8 * scale)));

  drawTree(doc, node, startX + scaledWidth - boxW, finalStartY, boxW, boxH, hGap, vGap, fontSize);

  return finalStartY + scaledHeight + 20;
}

// -----------------------------------------------------------------------------
// BUILD PDF FINAL - TODO EN UNA PÁGINA
// -----------------------------------------------------------------------------
async function buildPdf(doc: jsPDF, matchesTotal: any[], championshipName: string, logoUrl?: string) {
  const grouped = groupByCategory(matchesTotal);

  let first = true;

  for (const [, matches] of grouped) {
    if (!first) doc.addPage();
    first = false;

    // Información de categoría
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
    const afterTableY = drawParticipantsTable(doc, participants, 70);

    // ✅ TODO EN LA MISMA PÁGINA - SIN doc.addPage()
    drawBracket(doc, matches, afterTableY + 10);
  }
}

// -----------------------------------------------------------------------------
// GENERAR PDF
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

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    await buildPdf(doc, allMatches, props.championshipName ?? "Campeonato de Karate", props.logoUrl);

    const filename = `brackets_${Date.now()}.pdf`;
    doc.save(filename);

  } catch (e) {
    console.error(e);
    alert("Error generando PDF");
  }

  isGenerating.value = false;
}
</script>