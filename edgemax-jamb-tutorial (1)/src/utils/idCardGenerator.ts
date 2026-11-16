import QRCode from 'qrcode';
import {
  EDGEMAX_INFO,
  StudentIdCardData,
  buildStudentIdQrPayload,
} from './tutorialData';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function generateStudentIdCardDataUrl(
  details: StudentIdCardData
): Promise<string> {
  const width = 1200;
  const height = 740;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for ID card.');
  }

  // 1. Deep navy card backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#040d1e');
  bgGrad.addColorStop(0.55, '#091a38');
  bgGrad.addColorStop(1, '#061229');
  ctx.fillStyle = bgGrad;
  drawRoundedRect(ctx, 0, 0, width, height, 32);
  ctx.fill();

  // Subtle corner radial accents
  const glowLeft = ctx.createRadialGradient(180, 120, 10, 180, 120, 420);
  glowLeft.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
  glowLeft.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = glowLeft;
  ctx.fillRect(0, 0, width, height);

  const glowRight = ctx.createRadialGradient(1040, 620, 10, 1040, 620, 380);
  glowRight.addColorStop(0, 'rgba(249, 115, 22, 0.16)');
  glowRight.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = glowRight;
  ctx.fillRect(0, 0, width, height);

  // Outer hairline border
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 26);
  ctx.stroke();

  // Top-right decorative EdgeMax diagonal stripes
  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, 32);
  ctx.clip();
  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.moveTo(width - 150, 0);
  ctx.lineTo(width - 115, 0);
  ctx.lineTo(width, 115);
  ctx.lineTo(width, 150);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(width - 95, 0);
  ctx.lineTo(width - 70, 0);
  ctx.lineTo(width, 70);
  ctx.lineTo(width, 95);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Drawn EdgeMax Vector Logo ("EX | EDGEMAX")
  const logoX = 56;
  const logoY = 50;

  // Emblem frame
  ctx.fillStyle = '#0b1e3f';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, logoX, logoY, 68, 68, 16);
  ctx.fill();
  ctx.stroke();

  // Letter E inside emblem
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(logoX + 30, logoY + 18);
  ctx.lineTo(logoX + 14, logoY + 18);
  ctx.lineTo(logoX + 14, logoY + 50);
  ctx.lineTo(logoX + 30, logoY + 50);
  ctx.moveTo(logoX + 14, logoY + 34);
  ctx.lineTo(logoX + 27, logoY + 34);
  ctx.stroke();

  // Letter X + rising arrow inside emblem
  ctx.strokeStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(logoX + 34, logoY + 18);
  ctx.lineTo(logoX + 54, logoY + 50);
  ctx.moveTo(logoX + 54, logoY + 18);
  ctx.lineTo(logoX + 34, logoY + 50);
  ctx.stroke();

  // Vertical divider
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.fillRect(logoX + 86, logoY + 8, 2, 52);

  // Brand wordmark
  ctx.font = '800 38px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('EDGE', logoX + 106, logoY + 38);
  const edgeW = ctx.measureText('EDGE').width;
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('MAX', logoX + 106 + edgeW, logoY + 38);

  // Motto below logo
  ctx.font = 'italic 500 17px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(details.motto, logoX + 106, logoY + 64);

  // 3. Verification Mark Badge (Top Right inside content area, clear of diagonal corner stripes)
  const badgeX = 716;
  const badgeY = 54;
  const badgeW = 356;
  const badgeH = 56;
  ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fill();
  ctx.stroke();

  // Checkmark circle seal
  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.arc(badgeX + 32, badgeY + 28, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(badgeX + 25, badgeY + 28);
  ctx.lineTo(badgeX + 30, badgeY + 33);
  ctx.lineTo(badgeX + 40, badgeY + 22);
  ctx.stroke();

  ctx.font = '700 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText('VERIFIED STUDENT ID CARD', badgeX + 58, badgeY + 26);
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText(`ID: ${details.id}`, badgeX + 58, badgeY + 44);

  // Divider line below header
  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.fillRect(56, 142, width - 112, 2);

  // 4. Left Content Column: Student Fields
  const leftX = 56;
  const maxFieldWidth = 685;

  // Full Name
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('FULL NAME', leftX, 184);

  ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  const nameLines = wrapTextLines(ctx, details.fullName.toUpperCase(), maxFieldWidth, 2);
  nameLines.forEach((line, idx) => {
    ctx.fillText(line, leftX, 228 + idx * 44);
  });

  const nameBottomOffset = nameLines.length > 1 ? 42 : 0;

  // Aspiring Course & Aspiring School
  const courseY = 278 + nameBottomOffset;
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('ASPIRING COURSE', leftX, courseY);

  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#f8fafc';
  const courseLines = wrapTextLines(ctx, details.aspiringCourse, maxFieldWidth, 2);
  courseLines.forEach((line, idx) => {
    ctx.fillText(line, leftX, courseY + 32 + idx * 28);
  });

  const schoolY = courseY + 78 + (courseLines.length > 1 ? 24 : 0);
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('ASPIRING UNIVERSITY', leftX, schoolY);

  ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  const schoolLines = wrapTextLines(ctx, details.aspiringSchool, maxFieldWidth, 1);
  ctx.fillText(schoolLines[0] ?? details.aspiringSchool, leftX, schoolY + 28);

  // Registered Subjects (4 boxes)
  const subjLabelY = schoolY + 70;
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('JAMB SUBJECTS (4)', leftX, subjLabelY);

  let chipX = leftX;
  const chipY = subjLabelY + 14;
  ctx.font = '700 17px "DM Sans", system-ui, sans-serif';

  details.subjects.forEach((subj, idx) => {
    const labelW = ctx.measureText(subj).width;
    const chipW = labelW + 34;
    const isEnglish = idx === 0;
    ctx.fillStyle = isEnglish
      ? 'rgba(14, 165, 233, 0.24)'
      : 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = isEnglish
      ? 'rgba(56, 189, 248, 0.7)'
      : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, chipX, chipY, chipW, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isEnglish ? '#e0f2fe' : '#f1f5f9';
    ctx.fillText(subj, chipX + 17, chipY + 26);
    chipX += chipW + 12;
  });

  // Date Issued & Time Issued
  const issuedY = 588;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, leftX, issuedY, 685, 76, 14);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('DATE ISSUED', leftX + 22, issuedY + 27);
  ctx.fillText('TIME ISSUED', leftX + 265, issuedY + 27);
  ctx.fillText('VERIFICATION STATUS', leftX + 490, issuedY + 27);

  ctx.font = '700 19px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(details.dateIssued, leftX + 22, issuedY + 55);
  ctx.fillText(details.timeIssued, leftX + 265, issuedY + 55);
  ctx.fillStyle = '#fb923c';
  ctx.fillText('VERIFIED SEAL', leftX + 490, issuedY + 55);

  // 5. Right Panel: Scannable QR Code Card
  const qrPayload = buildStudentIdQrPayload(details);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 310,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#061229',
      light: '#ffffff',
    },
  });
  const qrImg = await loadImage(qrDataUrl);

  const panelX = 776;
  const panelY = 166;
  const panelW = 360;
  const panelH = 498;

  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 22);
  ctx.fill();

  // Accent header bar inside QR panel
  ctx.fillStyle = '#0ea5e9';
  drawRoundedRect(ctx, panelX + 22, panelY + 22, panelW - 44, 42, 10);
  ctx.fill();

  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SCAN QR FOR FULL DETAILS', panelX + 58, panelY + 48);

  // Draw crisp QR image
  ctx.drawImage(qrImg, panelX + 35, panelY + 78, 290, 290);

  // Details caption under QR
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(panelX + 28, panelY + 382, panelW - 56, 2);

  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(details.id, panelX + 104, panelY + 418);

  ctx.font = '500 14px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    'Scan with any phone camera to view',
    panelX + 54,
    panelY + 448
  );
  ctx.fillText(
    'name, course, subjects & issue time.',
    panelX + 56,
    panelY + 470
  );

  // 6. Bottom Footer Strip
  ctx.font = '600 15px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `${EDGEMAX_INFO.footerMotto}  ·  ${EDGEMAX_INFO.email}  ·  JAMB ${EDGEMAX_INFO.programYear} Verified Profile`,
    leftX,
    height - 34
  );

  return canvas.toDataURL('image/png');
}
