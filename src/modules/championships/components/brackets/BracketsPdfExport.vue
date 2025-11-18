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
  
  // 💥 CAMBIO: Eliminada la columna "Startnr" (p.nr + 100)
  const body: RowInput[] = participants.map(p => [p.nr, p.nombre, p.club]);
  autoTable(doc, {
    startY,
    head: [['Nr.', 'Nombre', 'Club']],
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
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' }
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
  academyTop: string,
  academyBottom: string,
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
  
  // Fondo: solo si es ganador, sino blanco
  if (isTopWinner) {
    doc.setFillColor(255, 200, 200); // Fondo rojo si gana
    doc.rect(x, y, w, halfH, 'F');
  }
  
  // Borde superior
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(x, y, w, halfH);
  
  // Contenido superior
  if (!isTopEmpty) {
    // Color del texto: Negro si es ganador, Rojo si no
    if (isTopWinner) {
      doc.setTextColor(0, 0, 0); // Negro para ganador
    } else {
      doc.setTextColor(255, 0, 0); // Rojo para competidor normal
    }
    
    const textX = x + 3;
    
    // Nombre
    doc.setFontSize(8);
    doc.setFont('helvetica', isTopWinner ? 'bold' : 'normal');
    const displayName = labelTop.length > 25 ? labelTop.substring(0, 25) + '...' : labelTop;
    doc.text(displayName, textX, y + halfH / 2 - 1);
    
    // Academia (debajo del nombre, más pequeña)
    if (academyTop) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      const displayAcademy = academyTop.length > 25 ? academyTop.substring(0, 25) + '...' : academyTop;
      doc.text(displayAcademy, textX, y + halfH / 2 + 5);
    }
    
    // Puntaje (mismo color que el texto)
    if (scoreTop != null) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(String(scoreTop), x + w - 4, y + halfH / 2 + 2, { align: 'right' });
    }
  }
  // Si está vacío, no mostrar nada (ni "Pendiente")

  // Parte inferior (Ao/Azul)
  const isBottomWinner = winnerId && bottomId && winnerId === bottomId;
  const isBottomEmpty = !labelBottom || labelBottom === 'Pendiente' || labelBottom === '';
  
  // Fondo: solo si es ganador, sino blanco
  if (isBottomWinner) {
    doc.setFillColor(200, 220, 255); // Fondo azul si gana
    doc.rect(x, y + halfH, w, halfH, 'F');
  }
  
  // Borde inferior
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(x, y + halfH, w, halfH);
  
  // Contenido inferior
  if (!isBottomEmpty) {
    // Color del texto: Negro si es ganador, Azul si no
    if (isBottomWinner) {
      doc.setTextColor(0, 0, 0); // Negro para ganador
    } else {
      doc.setTextColor(0, 0, 255); // Azul para competidor normal
    }
    
    const textX = x + 3;
    
    // Nombre
    doc.setFontSize(8);
    doc.setFont('helvetica', isBottomWinner ? 'bold' : 'normal');
    const displayNameBottom = labelBottom.length > 25 ? labelBottom.substring(0, 25) + '...' : labelBottom;
    doc.text(displayNameBottom, textX, y + halfH + halfH / 2 - 1);
    
    // Academia (debajo del nombre, más pequeña)
    if (academyBottom) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      const displayAcademyBottom = academyBottom.length > 25 ? academyBottom.substring(0, 25) + '...' : academyBottom;
      doc.text(displayAcademyBottom, textX, y + halfH + halfH / 2 + 5);
    }
    
    // Puntaje (mismo color que el texto)
    if (scoreBottom != null) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(String(scoreBottom), x + w - 4, y + halfH + halfH / 2 + 2, { align: 'right' });
    }
  }
  // Si está vacío, no mostrar nada (ni "Pendiente")
  
  // Resetear
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
}

/** 
 * 💥 NO generar matches ficticios - usar SOLO los matches reales del backend
 * El backend ya maneja correctamente la estructura del bracket con matches vacíos
 */
function generateCompleteBracket(realMatches: any[]): any[] {
  // Simplemente retornar los matches reales sin agregar nada ficticio
  return realMatches;
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
  
  const academyTop = match.participantAkka?.student?.academy?.name ?? '';
  const academyBottom = match.participantAo?.student?.academy?.name ?? '';
  
  drawMatchBox(
    doc, x, y, boxW, boxH,
    top, bot,
    academyTop, academyBottom,
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
/* No se usa actualmente, pero se mantiene por si se necesita
function getTreeDepth(match: any): number {
  if (!match || !match.children || match.children.length === 0) {
    return 0;
  }
  return 1 + Math.max(...match.children.map((child: any) => getTreeDepth(child)));
}
*/

/** Dibuja las llaves de forma recursiva (estilo árbol) */
function drawBracket(doc: jsPDF, matches: any[], startY: number) {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // DIMENSIONES FIJAS - No escalar horizontalmente
  const boxW = 85;      // Ancho fijo de caja
  const boxH = 28;      // Alto fijo de caja
  const hGap = 35;      // Espacio horizontal fijo entre niveles
  const vGap = 12;      // Espacio vertical entre matches
  
  // Construir árbol de matches
  const { root } = buildMatchTree(matches);
  
  if (!root) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No hay bracket disponible', pageWidth / 2, startY + 50, { align: 'center' });
    return startY + 100;
  }
  
  // Calcular dimensiones totales del árbol
  const treeDim = calculateTreeDimensions(root, boxH, vGap);
  
  // 💥 CAMBIO: Calcular el ancho total necesario para el bracket
  const totalBracketWidth = (treeDim.width * boxW) + ((treeDim.width - 1) * hGap);
  
  // 💥 CAMBIO: Posición inicial X desde la IZQUIERDA en lugar de derecha
  const startX = margin + totalBracketWidth - boxW;
  
  // Verificar si el bracket cabe verticalmente en esta página
  const availableHeight = pageHeight - startY - margin;
  const needsNewPage = treeDim.height > availableHeight;
  
  let finalStartY = startY;
  
  if (needsNewPage) {
    // Si no cabe, crear nueva página y empezar desde arriba
    doc.addPage();
    finalStartY = margin + 10;
    
    // Re-dibujar el header en la nueva página para continuidad
    const cat = matches[0]?.championshipCategory ?? {};
    const catTitle = `${cat?.code ?? ''} - ${cat?.gender ?? ''} ${cat?.ageRange?.label ?? cat?.weight ?? ''}`.trim();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${catTitle} (continuación)`, pageWidth / 2, finalStartY, { align: 'center' });
    finalStartY += 20;
  }
  
  // Verificar si necesita dividirse en múltiples páginas verticalmente
  const maxHeightPerPage = pageHeight - finalStartY - margin;
  
  if (treeDim.height > maxHeightPerPage) {
    // El bracket es demasiado alto incluso para una página nueva
    const startTreeY = finalStartY + 10;
    drawMatchRecursive(doc, root, startX, startTreeY, boxW, boxH, hGap, vGap);
    return pageHeight - margin; // Indicar que se usó toda la página
  } else {
    // Centrar verticalmente en el espacio disponible
    const startTreeY = finalStartY + Math.max(10, (maxHeightPerPage - treeDim.height) / 2);
    drawMatchRecursive(doc, root, startX, startTreeY, boxW, boxH, hGap, vGap);
    return startTreeY + treeDim.height + 20;
  }
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
