<template>
  <button 
    @click="exportPdf" 
    :disabled="isGenerating"
    class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
  >
    <FileDown class="w-4 h-4" />
    <span v-if="isGenerating">Generando PDF...</span>
    <span v-else>Exportar PDF</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileDown } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';

const props = defineProps<{
  championshipId: number;
  championshipName?: string;
  logoUrl?: string;
}>();

const isGenerating = ref(false);
const championshipStore = useChampionshipStore();

/** Util: agrupa por categoría */
function groupByCategory(matches: any[]) {
  const map = new Map<number, any[]>();
  for (const m of matches) {
    const id = m.championshipCategoryId;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(m);
  }
  return map;
}



/** Util: saca participantes únicos con detalle */
function extractParticipants(matches: any[]) {
  const key = (p: any) => p?.id ?? p?.studentId ?? Math.random();
  const map = new Map<number, any>();
  const add = (p: any) => {
    if (!p) return;
    const k = key(p);
    if (!map.has(k)) {
      map.set(k, {
        id: p.id,
        nombre: `${p.student?.firstname ?? ''} ${p.student?.lastname ?? ''}`.trim() || '(Sin nombre)',
        club: p.student?.academy?.name ?? 'Sin academia',
      });
    }
  };
  matches.forEach(m => {
    add(m.participantAkka);
    add(m.participantAo);
  });
  let i = 1;
  return [...map.values()].map(p => ({ nr: i++, ...p }));
}

/** Carga logo de una URL (o dataURL) a dataURL para jsPDF */
async function toDataURL(url: string): Promise<string> {
  // Si ya es dataURL, retorna directo
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error cargando logo:', error);
    return '';
  }
}

/** Dibuja encabezado con logo + título */
async function drawHeader(doc: jsPDF, titleLeft: string, titleRight: string, logoUrl?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Borde del documento
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

  // Logo a la izquierda
  if (logoUrl) {
    try {
      const dataURL = await toDataURL(logoUrl);
      if (dataURL) {
        doc.addImage(dataURL, 'PNG', margin + 5, margin + 5, 50, 40);
      }
    } catch (error) {
      console.error('Error agregando logo:', error);
    }
  }

  // Título centrado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(titleLeft, pageWidth / 2, margin + 20, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(titleRight, pageWidth / 2, margin + 35, { align: 'center' });

  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(margin + 5, margin + 50, pageWidth - margin - 5, margin + 50);
}

/** Tabla de participantes con autoTable */
function drawParticipantsTable(doc: jsPDF, participants: any[], startY = 70) {
  const margin = 20;
  
  const body: RowInput[] = participants.map(p => [p.nr, p.nr + 100, p.nombre, p.club]);
  autoTable(doc, {
    startY,
    head: [['Nr.', 'Startnr', 'Nombre', 'Club']],
    body,
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.5
    },
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 30 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.5,
  });
  return (doc as any).lastAutoTable.finalY as number;
}

/** Dibuja un bloque de texto dentro de una caja (match) */
function drawMatchBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  labelTop: string,
  labelBottom: string,
  startNumTop?: number,
  startNumBottom?: number,
  scoreTop?: string | number | null,
  scoreBottom?: string | number | null,
  winnerId?: number | null,
  topId?: number,
  bottomId?: number
) {
  const halfH = h / 2;
  
  // Parte superior (Akka/Rojo)
  const isTopWinner = winnerId && topId && winnerId === topId;
  const isTopEmpty = !labelTop || labelTop === 'Pendiente' || labelTop === '';
  
  // Fondo si es ganador o si está vacío
  if (isTopWinner) {
    doc.setFillColor(255, 200, 200);
    doc.rect(x, y, w, halfH, 'F');
  } else if (isTopEmpty) {
    doc.setFillColor(245, 245, 245); // Gris claro para slots vacíos
    doc.rect(x, y, w, halfH, 'F');
  }
  
  // Borde superior
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(x, y, w, halfH);
  
  // Contenido superior
  if (!isTopEmpty) {
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    let textX = x + 3;
    
    // Número de inicio en rojo
    if (startNumTop) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 0, 0);
      doc.text(String(startNumTop), textX, y + halfH - 4);
      textX += 15;
    }
    
    // Nombre
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', isTopWinner ? 'bold' : 'normal');
    const displayName = labelTop.length > 25 ? labelTop.substring(0, 25) + '...' : labelTop;
    doc.text(displayName, textX, y + halfH - 4);
    
    // Puntaje
    if (scoreTop != null) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(String(scoreTop), x + w - 4, y + halfH - 4, { align: 'right' });
    }
  } else {
    // Mostrar "Pendiente" centrado
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Pendiente', x + w / 2, y + halfH - 4, { align: 'center' });
  }

  // Parte inferior (Ao/Azul)
  const isBottomWinner = winnerId && bottomId && winnerId === bottomId;
  const isBottomEmpty = !labelBottom || labelBottom === 'Pendiente' || labelBottom === '';
  
  // Fondo si es ganador o si está vacío
  if (isBottomWinner) {
    doc.setFillColor(200, 220, 255);
    doc.rect(x, y + halfH, w, halfH, 'F');
  } else if (isBottomEmpty) {
    doc.setFillColor(245, 245, 245); // Gris claro para slots vacíos
    doc.rect(x, y + halfH, w, halfH, 'F');
  }
  
  // Borde inferior
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(x, y + halfH, w, halfH);
  
  // Contenido inferior
  if (!isBottomEmpty) {
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    let textX = x + 3;
    
    // Número de inicio en azul
    if (startNumBottom) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 255);
      doc.text(String(startNumBottom), textX, y + h - 4);
      textX += 15;
    }
    
    // Nombre
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', isBottomWinner ? 'bold' : 'normal');
    const displayNameBottom = labelBottom.length > 25 ? labelBottom.substring(0, 25) + '...' : labelBottom;
    doc.text(displayNameBottom, textX, y + h - 4);
    
    // Puntaje
    if (scoreBottom != null) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(String(scoreBottom), x + w - 4, y + h - 4, { align: 'right' });
    }
  } else {
    // Mostrar "Pendiente" centrado
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Pendiente', x + w / 2, y + h - 4, { align: 'center' });
  }
  
  // Resetear
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
}

/** Calcular profundidad del bracket */
function calculateBracketDepth(matches: any[]): number {
  const finalMatch = matches.find(m => m.nextMatchId === null);
  if (!finalMatch) return 1;
  
  function getMaxDepth(matchId: number, currentDepth: number = 1): number {
    const children = matches.filter(m => m.nextMatchId === matchId && m.id > 0);
    if (children.length === 0) return currentDepth;
    
    const childDepths = children.map(child => getMaxDepth(child.id, currentDepth + 1));
    return Math.max(...childDepths);
  }
  
  return getMaxDepth(finalMatch.id);
}

/** Generar bracket completo con matches BYE (vacíos) */
function generateCompleteBracket(realMatches: any[]): any[] {
  const allMatches: any[] = [...realMatches];
  let byeIdCounter = -1;
  
  const maxDepth = calculateBracketDepth(realMatches);
  const finalMatch = realMatches.find(m => m.nextMatchId === null);
  if (!finalMatch) return allMatches;
  
  function ensureChildren(parentMatch: any, depth: number = 1): void {
    const children = allMatches.filter(m => m.nextMatchId === parentMatch.id);
    
    if (children.length === 0 && depth < maxDepth) {
      // Crear dos hijos vacíos
      const childAkka = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        participantAkka: null,
        participantAo: null,
        scoreAkka: null,
        scoreAo: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: "Akka"
      };
      
      const childAo = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        participantAkka: null,
        participantAo: null,
        scoreAkka: null,
        scoreAo: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: "Ao"
      };
      
      allMatches.push(childAkka, childAo);
      ensureChildren(childAkka, depth + 1);
      ensureChildren(childAo, depth + 1);
      
    } else if (children.length === 1) {
      // Si solo hay un hijo, crear el que falta
      const existingChild = children[0]!;
      const missingSide = existingChild.nextMatchSide === 'Akka' ? 'Ao' : 'Akka';
      
      const missingChild = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        participantAkka: null,
        participantAo: null,
        scoreAkka: null,
        scoreAo: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: missingSide
      };
      
      allMatches.push(missingChild);
      ensureChildren(existingChild, depth + 1);
      ensureChildren(missingChild, depth + 1);
      
    } else if (children.length === 2) {
      // Ya tiene los dos hijos, seguir con la recursión
      if (depth < maxDepth) {
        children.forEach(child => ensureChildren(child, depth + 1));
      }
    }
  }
  
  ensureChildren(finalMatch, 1);
  return allMatches;
}

/** Construir árbol a partir de los matches (incluyendo BYE) */
function buildMatchTree(matches: any[]) {
  // Generar bracket completo con matches vacíos
  const completeMatches = generateCompleteBracket(matches);
  
  const map = new Map<number, any>();
  completeMatches.forEach((m) => {
    map.set(m.id, { ...m, children: [] });
  });

  let root: any = null;
  completeMatches.forEach((m) => {
    const node = map.get(m.id);
    if (m.nextMatchId !== null) {
      const parent = map.get(m.nextMatchId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      root = node;
    }
  });

  return { root, map };
}

/** Calcula dimensiones del árbol recursivamente */
function calculateTreeDimensions(match: any, boxH: number, vGap: number): { width: number; height: number } {
  if (!match || match.children.length === 0) {
    return { width: 1, height: boxH };
  }
  
  const childDimensions = match.children.map((child: any) => 
    calculateTreeDimensions(child, boxH, vGap)
  );
  
  const totalHeight = childDimensions.reduce((sum: number, dim: any) => sum + dim.height, 0) + 
                      (match.children.length - 1) * vGap;
  
  return {
    width: Math.max(...childDimensions.map((d: any) => d.width)) + 1,
    height: totalHeight
  };
}

/** Dibuja un match y sus hijos recursivamente */
function drawMatchRecursive(
  doc: jsPDF,
  match: any,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
  hGap: number,
  vGap: number
): number {
  if (!match) return y;
  
  // Dibujar hijos primero (van a la izquierda)
  let currentY = y;
  const childPositions: { y: number; centerY: number }[] = [];
  
  if (match.children && match.children.length > 0) {
    match.children.forEach((child: any) => {
      const childDim = calculateTreeDimensions(child, boxH, vGap);
      const childStartY = currentY;
      
      drawMatchRecursive(doc, child, x - boxW - hGap, childStartY, boxW, boxH, hGap, vGap);
      
      const childCenterY = childStartY + childDim.height / 2;
      childPositions.push({ y: childStartY, centerY: childCenterY });
      
      currentY += childDim.height + vGap;
    });
    
    // Recalcular Y del match padre para centrarlo con sus hijos
    if (childPositions.length > 0) {
      const firstChild = childPositions[0];
      const lastChild = childPositions[childPositions.length - 1];
      if (firstChild && lastChild) {
        const firstChildCenter = firstChild.centerY;
        const lastChildCenter = lastChild.centerY;
        y = (firstChildCenter + lastChildCenter) / 2 - boxH / 2;
      }
    }
  }
  
  // Dibujar el match actual
  const top = match.participantAkka
    ? `${match.participantAkka.student?.firstname ?? ''} ${match.participantAkka.student?.lastname ?? ''}`.trim()
    : '';
  const bot = match.participantAo
    ? `${match.participantAo.student?.firstname ?? ''} ${match.participantAo.student?.lastname ?? ''}`.trim()
    : '';
  
  const startNumTop = match.participantAkka?.id ? match.participantAkka.id + 100 : undefined;
  const startNumBottom = match.participantAo?.id ? match.participantAo.id + 100 : undefined;
  
  drawMatchBox(
    doc, x, y, boxW, boxH,
    top, bot,
    startNumTop, startNumBottom,
    match.scoreAkka, match.scoreAo,
    match.winnerId,
    match.participantAkka?.id,
    match.participantAo?.id
  );
  
  // Dibujar conectores desde los hijos hacia el padre (estilo clásico de bracket)
  if (childPositions.length > 0) {
    const parentLeftEdge = x;
    const parentMidY = y + boxH / 2;
    
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    
    if (childPositions.length === 2) {
      // Caso típico: 2 hijos (bracket clásico)
      const firstChild = childPositions[0];
      const lastChild = childPositions[1];
      
      if (firstChild && lastChild) {
        const child1Y = firstChild.centerY;
        const child2Y = lastChild.centerY;
        const childRightEdge = x - hGap;
        const connectorX = childRightEdge + hGap / 2;
        
        // Líneas horizontales desde cada hijo hacia el conector
        doc.line(childRightEdge, child1Y, connectorX, child1Y);
        doc.line(childRightEdge, child2Y, connectorX, child2Y);
        
        // Línea vertical conectando ambos hijos
        doc.line(connectorX, child1Y, connectorX, child2Y);
        
        // Línea horizontal desde el conector hacia el padre
        doc.line(connectorX, parentMidY, parentLeftEdge, parentMidY);
      }
    } else if (childPositions.length === 1) {
      // Un solo hijo
      const child = childPositions[0];
      if (child) {
        const childRightEdge = x - hGap;
        doc.line(childRightEdge, child.centerY, parentLeftEdge, parentMidY);
      }
    }
  }
  
  return Math.max(currentY, y + boxH);
}

/** Calcula la profundidad máxima del árbol */
function getTreeDepth(match: any): number {
  if (!match || !match.children || match.children.length === 0) {
    return 0;
  }
  return 1 + Math.max(...match.children.map((child: any) => getTreeDepth(child)));
}

/** Dibuja las llaves de forma recursiva (estilo árbol) */
function drawBracket(doc: jsPDF, matches: any[], startY: number) {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxW = 100;
  const boxH = 30;
  const hGap = 40; // Espacio horizontal entre niveles
  const vGap = 15; // Espacio vertical entre matches
  
  // Construir árbol de matches
  const { root } = buildMatchTree(matches);
  
  if (!root) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No hay bracket disponible', pageWidth / 2, startY + 50, { align: 'center' });
    return startY + 100;
  }
  
  // Calcular dimensiones totales
  const treeDim = calculateTreeDimensions(root, boxH, vGap);
  const treeDepth = getTreeDepth(root);
  
  // Centrar horizontalmente
  const totalWidth = (treeDepth + 1) * (boxW + hGap);
  const startX = Math.min(pageWidth - margin - boxW - 10, (pageWidth + totalWidth) / 2 - boxW);
  
  // Centrar verticalmente en el espacio disponible
  const availableHeight = doc.internal.pageSize.getHeight() - startY - 40;
  const startTreeY = startY + Math.max(20, (availableHeight - treeDim.height) / 2);
  
  // Dibujar el árbol recursivamente
  drawMatchRecursive(doc, root, startX, startTreeY, boxW, boxH, hGap, vGap);
  
  return startTreeY + treeDim.height + 30;
}

/** Orquestador: por cada categoría, tabla + llaves (nueva página si hace falta) */
async function buildPdf(doc: jsPDF, allMatches: any[], championshipName: string, logoUrl?: string) {
  const byCat = groupByCategory(allMatches);

  let first = true;
  for (const [, matches] of byCat) {
    if (!first) doc.addPage();
    first = false;

    const cat = matches[0]?.championshipCategory ?? {};
    const catTitle = `${cat?.code ?? ''} - ${cat?.gender ?? ''} ${cat?.ageRange?.label ?? cat?.weight ?? ''}`.trim();

    await drawHeader(
      doc, 
      championshipName || 'CAMPEONATO', 
      catTitle,
      logoUrl
    );

    const participants = extractParticipants(matches);
    const endTableY = drawParticipantsTable(doc, participants, 70);

    // Espacio para las llaves
    const startBracketY = endTableY + 20;

    drawBracket(doc, matches, startBracketY);
  }
}

/** API pública para tu app */
async function exportPdf() {
  isGenerating.value = true;

  try {
    console.log('🎯 Iniciando exportación de PDF para campeonato:', props.championshipId);
    
    // 1. Cargar todas las categorías del campeonato
    await championshipStore.fetchChampionshipCategories(props.championshipId);
    
    const categories = championshipStore.championshipCategories;
    console.log('📋 Categorías encontradas:', categories.length);
    
    if (categories.length === 0) {
      alert('No hay categorías disponibles para exportar');
      return;
    }
    
    // 2. Cargar matches de todas las categorías
    const allMatches: any[] = [];
    
    for (const category of categories) {
      console.log(`📥 Cargando matches para categoría ${category.id}:`, category.modality, category.gender);
      await championshipStore.fetchMatches(category.id);
      
      // Agregar matches de esta categoría al array total
      const categoryMatches = championshipStore.matches.filter(
        m => m.championshipCategoryId === category.id
      );
      
      console.log(`✅ Matches cargados para categoría ${category.id}:`, categoryMatches.length);
      allMatches.push(...categoryMatches);
    }
    
    console.log('📊 Total de matches a exportar:', allMatches.length);
    
    if (allMatches.length === 0) {
      alert('No hay matches disponibles para exportar');
      return;
    }
    
    // 3. Generar el PDF
    console.log('📄 Generando PDF...');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    await buildPdf(
      doc, 
      allMatches,
      props.championshipName || 'Campeonato de Karate',
      props.logoUrl
    );
    
    const filename = `brackets_${props.championshipName?.replace(/\s+/g, '_') || 'campeonato'}_${new Date().getTime()}.pdf`;
    doc.save(filename);
    
    console.log('✅ PDF generado exitosamente:', filename);
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    alert('Error al generar el PDF. Por favor intenta nuevamente.\n\n' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
}
</script>
