import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import { uploadToS3Bucket, IMulterFile } from './s3Bucket'

export const generateCertificate = async ({
  studentName,
  courseName,
  instructorName,
  userId,
  courseId,
}: {
  studentName: string
  courseName: string
  instructorName: string
  userId: string
  courseId: string
}): Promise<string> => {
  const buffer = await createCertificatePDF(studentName, courseName, instructorName)

  const file: IMulterFile = {
    originalname: `certificate-${sanitize(studentName)}-${sanitize(courseName)}.pdf`,
    buffer,
    mimetype: 'application/pdf',
  }

  const s3Key = await uploadToS3Bucket(file, `certificates/${userId}/${courseId}`)
  return s3Key
}

const createCertificatePDF = async (
  studentName: string,
  courseName: string,
  instructorName: string,
): Promise<Buffer> => {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  })

  const stream = new PassThrough()
  doc.pipe(stream)

  const pageWidth = 841.89
  const pageHeight = 595.28


  // === Background Gradient ===
  doc.save()
  const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight)
  gradient.stop(0, '#2563EB').stop(1, '#9333EA')

  doc.rect(0, 0, pageWidth, pageHeight).fill(gradient)
  doc.restore()

  // === Watermark Logo ===
  doc.save()
  doc
    .fillColor('#FFFFFF')
    .opacity(0.08)
    .fontSize(160)
    .font('Helvetica-Bold')
    .text('SKILLZIO', 0, pageHeight / 3, {
      align: 'center',
      width: pageWidth,
    })
  doc.restore()

  // Elegant Border
  drawElegantBorder(doc, pageWidth, pageHeight)

  // Main Title
  doc
    .font('Helvetica-Bold')
    .fontSize(54)
    .fillColor('#FACC15')
    .text('CERTIFICATE', pageWidth / 2 - 250, 120, { align: 'center', width: 500 })

  // Subtitle
  doc
    .font('Helvetica-Oblique')
    .fontSize(26)
    .fillColor('#FFFFFF')
    .text('of Achievement', pageWidth / 2 - 200, 190, { align: 'center', width: 400 })

  // Student Name
  doc
    .font('Helvetica-Bold')
    .fontSize(36)
    .fillColor('#FFFFFF')
    .text(studentName, pageWidth / 2 - 250, 260, { align: 'center', width: 500 })

  // Divider line
  doc
    .moveTo(220, 320)
    .lineTo(pageWidth - 220, 320)
    .lineWidth(2)
    .strokeColor('#FACC15')
    .stroke()

  // Completion text
  doc
    .font('Helvetica')
    .fontSize(18)
    .fillColor('#E5E7EB')
    .text(`has successfully completed the course`, pageWidth / 2 - 250, 340, {
      align: 'center',
      width: 500,
    })

  // Course Name
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#FFFFFF')
    .text(courseName, pageWidth / 2 - 250, 375, { align: 'center', width: 500 })

  // Instructor
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#FFFFFF')
    .text('Instructor', 120, pageHeight - 120)

  doc
    .font('Helvetica')
    .fontSize(14)
    .fillColor('#FFFFFF')
    .text(instructorName, 120, pageHeight - 100)

  // Date
  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#E5E7EB')
    .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 180, pageHeight - 100)

  // Seal / Stamp
  drawSeal(doc, pageWidth - 180, pageHeight - 150)

  doc.end()
  return await streamToBuffer(stream)
}

// Elegant double border
const drawElegantBorder = (doc: PDFKit.PDFDocument, pageWidth: number, pageHeight: number) => {
  doc.save()
  doc
    .lineWidth(6)
    .strokeColor('#FACC15')
    .rect(25, 25, pageWidth - 50, pageHeight - 50)
    .stroke()
  doc
    .lineWidth(2)
    .strokeColor('#FFFFFF')
    .rect(40, 40, pageWidth - 80, pageHeight - 80)
    .stroke()
  doc.restore()
}

// Gold seal / stamp
const drawSeal = (doc: PDFKit.PDFDocument, x: number, y: number) => {
  doc.save()
  doc.circle(x, y, 50).fill('#FACC15')
  doc
    .fillColor('#9333EA')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('OFFICIAL', x - 35, y - 10, {
      align: 'center',
      width: 70,
    })
  doc.restore()
}

// Convert stream to buffer
const streamToBuffer = async (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// Safe filename
const sanitize = (str: string): string => str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
