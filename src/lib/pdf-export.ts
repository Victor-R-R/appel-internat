import { jsPDF } from 'jspdf'

type RecapData = {
  id: string
  date: string
  contenu: string
  createdAt: string
}

/**
 * Nettoie le texte des emojis et caractères spéciaux problématiques pour PDF
 */
function cleanTextForPDF(text: string): string {
  return text
    // Remplacer les emojis courants par du texte
    .replace(/🔥/g, '[Important]')
    .replace(/📝/g, '')
    .replace(/👧/g, '')
    .replace(/👦/g, '')
    .replace(/🎓/g, '')
    .replace(/👥/g, '')
    .replace(/✓/g, '[OK]')
    .replace(/✗/g, '[X]')
    .replace(/⚠️/g, '[Attention]')
    .replace(/💡/g, '[Info]')
    // Supprimer tous les autres emojis (Unicode)
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parse le contenu du récap pour identifier les sections
 */
function parseRecapContent(content: string): Array<{
  type: 'title' | 'niveau' | 'groupe' | 'text'
  text: string
  indent?: number
}> {
  const lines = content.split('\n')
  const parsed: Array<{
    type: 'title' | 'niveau' | 'groupe' | 'text'
    text: string
    indent?: number
  }> = []

  lines.forEach((line) => {
    const cleanLine = cleanTextForPDF(line).trim()
    if (!cleanLine) return

    // Identifier les titres de section (commence par emoji ou contient "Récapitulatif")
    if (cleanLine.includes('Recapitulatif') || cleanLine.includes('RECAP')) {
      parsed.push({ type: 'title', text: cleanLine })
    }
    // Identifier les niveaux (6EME, 5EME, 4EME, 3EME, etc.)
    else if (/^\d+\s*E\s*M\s*E/i.test(cleanLine) || /^6eme|5eme|4eme|3eme|2nde|1ere|terminale/i.test(cleanLine)) {
      parsed.push({ type: 'niveau', text: cleanLine })
    }
    // Identifier les groupes (Filles:, Garçons:)
    else if (/^(Filles?|Garcons?)\s*:/i.test(cleanLine)) {
      parsed.push({ type: 'groupe', text: cleanLine, indent: 1 })
    }
    // Texte normal
    else {
      // Détecter l'indentation selon le contexte
      const indent = line.startsWith('  ') ? 2 : line.startsWith(' ') ? 1 : 0
      parsed.push({ type: 'text', text: cleanLine, indent })
    }
  })

  return parsed
}

/**
 * Génère et télécharge un PDF du récap
 */
export function exportRecapToPDF(recap: RecapData) {
  const doc = new jsPDF()

  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Couleurs
  const colorPrimary = [12, 113, 195] // #0C71C3
  const colorSecondary = [77, 141, 193] // #4d8dc1
  const colorText = [0, 0, 0]
  const colorGray = [100, 100, 100]

  // En-tête
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
  doc.text('Recapitulatif de l\'internat', margin, yPosition)
  yPosition += 12

  // Date du récap
  const dateRecap = new Date(recap.date)
  const formattedDate = dateRecap.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorText[0], colorText[1], colorText[2])
  doc.text(`Date : ${formattedDate}`, margin, yPosition)
  yPosition += 8

  // Date de génération
  const dateGeneration = new Date(recap.createdAt)
  const formattedGeneration = dateGeneration.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2])
  doc.text(`Genere le : ${formattedGeneration}`, margin, yPosition)
  yPosition += 12

  // Ligne de séparation
  doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Parser et afficher le contenu
  const parsedContent = parseRecapContent(recap.contenu)

  parsedContent.forEach((item) => {
    // Vérifier si on doit créer une nouvelle page
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = margin
    }

    const indent = (item.indent || 0) * 5

    switch (item.type) {
      case 'title':
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
        doc.text(item.text, margin, yPosition)
        yPosition += 10
        break

      case 'niveau':
        // Espace avant le niveau
        yPosition += 4
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])
        doc.text(item.text, margin, yPosition)
        yPosition += 8
        break

      case 'groupe':
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(colorText[0], colorText[1], colorText[2])
        doc.text(item.text, margin + indent, yPosition)
        yPosition += 7
        break

      case 'text':
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(colorText[0], colorText[1], colorText[2])

        // Découper le texte si trop long
        const lines = doc.splitTextToSize(item.text, contentWidth - indent)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin + indent, yPosition)
          yPosition += 6
        })
        break
    }
  })

  // Pied de page sur chaque page
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2])
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Télécharger le PDF
  const fileName = `recap_${recap.date.split('T')[0]}.pdf`
  doc.save(fileName)
}

/**
 * Génère et télécharge un PDF de plusieurs récaps (pour export en masse)
 */
export function exportMultipleRecapsToPDF(recaps: RecapData[], title: string = 'Recapitulatifs') {
  if (recaps.length === 0) {
    throw new Error('Aucun recap a exporter')
  }

  const doc = new jsPDF()

  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Couleurs
  const colorPrimary = [12, 113, 195]
  const colorSecondary = [77, 141, 193]
  const colorText = [0, 0, 0]
  const colorGray = [100, 100, 100]

  // Page de titre
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
  doc.text(title, margin, yPosition)
  yPosition += 15

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(colorText[0], colorText[1], colorText[2])
  doc.text(`${recaps.length} recapitulatif(s)`, margin, yPosition)
  yPosition += 10

  const dateRange = recaps.length > 1
    ? `Du ${new Date(recaps[recaps.length - 1].date).toLocaleDateString('fr-FR')} au ${new Date(recaps[0].date).toLocaleDateString('fr-FR')}`
    : new Date(recaps[0].date).toLocaleDateString('fr-FR')

  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2])
  doc.text(dateRange, margin, yPosition)
  yPosition += 20

  // Parcourir chaque récap
  recaps.forEach((recap, index) => {
    // Nouvelle page pour chaque récap (sauf le premier)
    if (index > 0) {
      doc.addPage()
      yPosition = margin
    }

    // Date du récap
    const dateRecap = new Date(recap.date)
    const formattedDate = dateRecap.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])
    doc.text(formattedDate, margin, yPosition)
    yPosition += 10

    // Ligne de séparation
    doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Contenu parsé
    const parsedContent = parseRecapContent(recap.contenu)

    parsedContent.forEach((item) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
      }

      const indent = (item.indent || 0) * 5

      switch (item.type) {
        case 'title':
          doc.setFontSize(13)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
          doc.text(item.text, margin, yPosition)
          yPosition += 9
          break

        case 'niveau':
          yPosition += 3
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2])
          doc.text(item.text, margin, yPosition)
          yPosition += 7
          break

        case 'groupe':
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(colorText[0], colorText[1], colorText[2])
          doc.text(item.text, margin + indent, yPosition)
          yPosition += 6
          break

        case 'text':
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(colorText[0], colorText[1], colorText[2])

          const lines = doc.splitTextToSize(item.text, contentWidth - indent)
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin + indent, yPosition)
            yPosition += 5
          })
          break
      }
    })

    yPosition += 10
  })

  // Pied de page
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2])
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Télécharger
  const firstDate = recaps[0].date.split('T')[0]
  const lastDate = recaps[recaps.length - 1].date.split('T')[0]
  const fileName = recaps.length > 1
    ? `recaps_${lastDate}_to_${firstDate}.pdf`
    : `recap_${firstDate}.pdf`

  doc.save(fileName)
}
