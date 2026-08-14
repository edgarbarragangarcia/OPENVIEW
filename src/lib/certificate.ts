import jsPDF from 'jspdf';
import { supabase } from './supabase';

export type CertificateLevel = 'Básico' | 'Intermedio';

export function levelForScore(score: number, total: number): CertificateLevel {
  return total > 0 && score / total >= 0.7 ? 'Intermedio' : 'Básico';
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

interface CertificateData {
  fullName: string;
  level: CertificateLevel;
}

function drawCertificate(doc: jsPDF, { fullName, level }: CertificateData, logoDataUrl: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const navy: [number, number, number] = [22, 41, 74];
  const gold: [number, number, number] = [184, 134, 11];

  if (logoDataUrl) {
    const logoW = 22;
    const logoH = (184 / 320) * logoW;
    doc.addImage(logoDataUrl, 'PNG', centerX - logoW / 2, 18, logoW, logoH);
  }

  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('OPENVIEW', centerX, 48, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text('CONSULTORÍA & CAPACITACIÓN EN IA', centerX, 54, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text('Certifica a', centerX, 74, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(30);
  doc.setTextColor(...navy);
  doc.text(fullName, centerX, 88, { align: 'center' });
  doc.setDrawColor(200, 200, 200);
  doc.line(centerX - 60, 92, centerX + 60, 92);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('Por participar y completar satisfactoriamente el', centerX, 102, { align: 'center' });
  doc.setFontSize(10);
  doc.text('PROGRAMA DE', centerX, 110, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...navy);
  doc.text('CAPACITACIÓN EN', centerX, 120, { align: 'center' });
  doc.text('INTELIGENCIA ARTIFICIAL', centerX, 129, { align: 'center' });

  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text('DURACIÓN', centerX - 45, 143, { align: 'center' });
  doc.text('FECHA', centerX + 45, 143, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text('8 sesiones · 16 horas', centerX - 45, 149, { align: 'center' });
  doc.text(`Bogotá D.C., ${today}`, centerX + 45, 149, { align: 'center' });

  // Nivel alcanzado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text('NIVEL ALCANZADO', centerX, 165, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text(level, centerX, 172, { align: 'center' });

  // Signature (single)
  doc.setFont('times', 'italic');
  doc.setFontSize(20);
  doc.setTextColor(...navy);
  doc.text('Edgar Barragán G', centerX, 190, { align: 'center' });
  doc.setDrawColor(180, 180, 180);
  doc.line(centerX - 35, 193, centerX + 35, 193);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Edgar Barragán G', centerX, 198, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('OPENVIEW · INSTRUCTOR', centerX, 202, { align: 'center' });
}

/** Genera y descarga el certificado en PDF para el usuario autenticado, según su puntaje en la Evaluación Final. */
export async function downloadCertificate(score: number, total: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();
  if (error) throw error;

  const fullName = profile?.full_name?.trim() || 'Participante';
  const level = levelForScore(score, total);
  const logoDataUrl = await loadLogoDataUrl();

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCertificate(doc, { fullName, level }, logoDataUrl);
  doc.save(`Certificado OpenView - ${fullName}.pdf`);
}
