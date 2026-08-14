import jsPDF from 'jspdf';
import { supabase } from './supabase';

const CERTIFICATE_LEVEL = 'Básico - Intermedio';
const VERIFY_PATH = '/verificar';

export interface IssuedCertificate {
  code: string;
  full_name: string;
  issued_at: string;
}

export function buildVerificationUrl(code: string): string {
  return `${window.location.origin}${VERIFY_PATH}?codigo=${encodeURIComponent(code)}`;
}

/** Emite (o reutiliza, si ya existe) el folio del certificado para el usuario autenticado y esta lección. */
export async function getOrIssueCertificate(lessonId: string, score: number, total: number): Promise<IssuedCertificate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();
  if (profileError) throw profileError;

  const fullName = profile?.full_name?.trim() || 'Participante';

  const { data, error } = await supabase.rpc('issue_certificate', {
    p_lesson_id: lessonId,
    p_full_name: fullName,
    p_score: score,
    p_total: total,
  });
  if (error) throw error;
  return data as IssuedCertificate;
}

export function buildLinkedInAddUrl(cert: IssuedCertificate): string {
  const issued = new Date(cert.issued_at);
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: 'Capacitación en Inteligencia Artificial',
    organizationName: 'OpenView Academy',
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: buildVerificationUrl(cert.code),
    certId: cert.code,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Dibuja una firma manuscrita inventada (texto en fuente script + un trazo de pluma), rasterizada a PNG. */
function drawSignatureDataUrl(name: string): string | null {
  try {
    const scale = 3;
    const w = 620 * scale;
    const h = 200 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(scale, scale);
    const navy = '#16294a';

    ctx.font = "italic 62px 'Segoe Script','Snell Roundhand','Bradley Hand','Brush Script MT',cursive";
    ctx.fillStyle = navy;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(name, 310, 115);

    // Trazo de pluma bajo la firma, con espesor variable para simular presión de mano
    ctx.strokeStyle = navy;
    ctx.lineCap = 'round';
    const strokes: [number, number, number][] = [
      [1.8, 130, 90], [3.2, 135, 60], [2.2, 138, 30], [1.2, 140, 0],
    ];
    strokes.forEach(([width]) => {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(70, 128);
      ctx.bezierCurveTo(180, 150, 420, 108, 560, 132);
      ctx.stroke();
    });

    // Pequeño rizo final, como el remate de una firma real
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(555, 128);
    ctx.bezierCurveTo(575, 118, 578, 100, 562, 96);
    ctx.bezierCurveTo(550, 93, 552, 106, 566, 108);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

interface CertificateData {
  fullName: string;
  code: string;
}

function drawDecoration(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const skyBlue: [number, number, number] = [219, 234, 254];
  const cream: [number, number, number] = [250, 240, 217];

  doc.setFillColor(...skyBlue);
  doc.triangle(0, 0, pageWidth * 0.34, 0, 0, pageHeight * 0.55, 'F');

  doc.setFillColor(...cream);
  doc.circle(pageWidth - 18, 22, 40, 'F');

  doc.setFillColor(...skyBlue);
  doc.circle(14, pageHeight - 12, 32, 'F');

  doc.setFillColor(...cream);
  doc.triangle(pageWidth, pageHeight, pageWidth - pageWidth * 0.3, pageHeight, pageWidth, pageHeight - pageHeight * 0.42, 'F');
}

function drawCertificate(doc: jsPDF, { fullName, code }: CertificateData, logoDataUrl: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const navy: [number, number, number] = [22, 41, 74];
  const gold: [number, number, number] = [184, 134, 11];

  // Fondo blanco + formas decorativas en las esquinas (clip visual, quedan fuera del contenido)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawDecoration(doc, pageWidth, pageHeight);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, 12, pageWidth - 32, pageHeight - 18, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(16, 12, pageWidth - 32, pageHeight - 18, 4, 4, 'S');

  if (logoDataUrl) {
    const logoW = 26;
    const logoH = (184 / 320) * logoW;
    doc.addImage(logoDataUrl, 'PNG', centerX - logoW / 2, 26, logoW, logoH);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text('OPENVIEW ACADEMY', centerX, 52, { align: 'center' });

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(centerX - 14, 56, centerX + 14, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text('Certifica a', centerX, 70, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(26);
  doc.setTextColor(...navy);
  doc.text(fullName, centerX, 83, { align: 'center' });
  doc.setDrawColor(200, 200, 200);
  doc.line(centerX - 60, 87, centerX + 60, 87);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('Por participar y completar satisfactoriamente el', centerX, 97, { align: 'center' });
  doc.setFontSize(10);
  doc.text('PROGRAMA DE', centerX, 105, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...navy);
  doc.text('CAPACITACIÓN EN', centerX, 115, { align: 'center' });
  doc.text('INTELIGENCIA ARTIFICIAL', centerX, 124, { align: 'center' });

  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text('DURACIÓN', centerX - 45, 138, { align: 'center' });
  doc.text('FECHA', centerX + 45, 138, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text('8 sesiones · 16 horas', centerX - 45, 144, { align: 'center' });
  doc.text(`Bogotá D.C., ${today}`, centerX + 45, 144, { align: 'center' });

  // Nivel alcanzado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...gold);
  doc.text('NIVEL ALCANZADO', centerX, 158, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text(CERTIFICATE_LEVEL, centerX, 165, { align: 'center' });

  // Signature (single) — firma manuscrita inventada, rasterizada a imagen.
  // Sin línea de firma, pegada al nombre del instructor.
  const signatureDataUrl = drawSignatureDataUrl('Edgar Barragán G');
  if (signatureDataUrl) {
    const sigW = 44;
    const sigH = (200 / 620) * sigW;
    doc.addImage(signatureDataUrl, 'PNG', centerX - sigW / 2, 179, sigW, sigH);
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(18);
    doc.setTextColor(...navy);
    doc.text('Edgar Barragán G', centerX, 191, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Edgar Barragán G', centerX, 196, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('OPENVIEW · INSTRUCTOR', centerX, 200, { align: 'center' });

  // Folio consecutivo + verificación, en la esquina inferior izquierda del marco.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text(`Folio: ${code}`, 26, 197.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Verifica este certificado en ${window.location.host}${VERIFY_PATH}`, 26, 201.5);
}

/** Genera y descarga el certificado en PDF para el usuario autenticado, tras completar la Evaluación Final. */
export async function downloadCertificate(lessonId: string, score: number, total: number): Promise<void> {
  const cert = await getOrIssueCertificate(lessonId, score, total);
  const logoDataUrl = await loadLogoDataUrl();

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCertificate(doc, { fullName: cert.full_name, code: cert.code }, logoDataUrl);
  doc.save(`Certificado OpenView - ${cert.full_name}.pdf`);
}
