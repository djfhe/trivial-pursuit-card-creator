import { needsDarkText, type Category } from "../../types"


// Calculate how many lines text will take at a given font size (preserving newlines)
function calculateTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): number {
  ctx.font = `600 ${fontSize}px "Crimson Text", Georgia, serif`
  
  // Split by newlines first to preserve explicit line breaks
  const paragraphs = text.split('\n')
  let totalLines = 0

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      // Empty line still counts as a line
      totalLines++
      continue
    }
    
    const words = paragraph.split(' ')
    let line = ''
    let lineCount = 1

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        line = words[n] + ' '
        lineCount++
      } else {
        line = testLine
      }
    }
    totalLines += lineCount
  }
  
  return totalLines
}

// Find the optimal font size that fits text within maxHeight
function findOptimalFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  startFontSize: number,
  minFontSize: number = 8
): { fontSize: number; lineHeight: number; lines: number } {
  let fontSize = startFontSize
  
  while (fontSize >= minFontSize) {
    const lineHeight = fontSize * 1.2
    const lines = calculateTextLines(ctx, text, maxWidth, fontSize)
    const totalHeight = lines * lineHeight
    
    if (totalHeight <= maxHeight) {
      return { fontSize, lineHeight, lines }
    }
    fontSize -= 0.5
  }
  
  // Return minimum size if nothing fits
  const lineHeight = minFontSize * 1.2
  const lines = calculateTextLines(ctx, text, maxWidth, minFontSize)
  return { fontSize: minFontSize, lineHeight, lines }
}



// Draw text with auto-scaling (preserving newlines)
export function drawScaledText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  startFontSize: number,
  color: string
) {
  ctx.save()
  const { fontSize, lineHeight, lines } = findOptimalFontSize(ctx, text, maxWidth, maxHeight, startFontSize)
  
  ctx.font = `600 ${fontSize}px Georgia, serif`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  
  // Calculate starting Y to center the text block vertically
  const totalHeight = lines * lineHeight
  let currentY = y - totalHeight / 2 + lineHeight / 2
  
  // Split by newlines first to preserve explicit line breaks
  const paragraphs = text.split('\n')
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      // Empty line - just move down
      currentY += lineHeight
      continue
    }
    
    const words = paragraph.split(' ')
    let line = ''

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY)
        line = words[n] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    // Draw the last line of this paragraph
    ctx.fillText(line.trim(), x, currentY)
    currentY += lineHeight
  }

  ctx.restore()
}

export function drawOval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  letter: string,
  fontSize: number = 22
) {
  ctx.save()
  
  // Draw oval shadow
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 2, width / 2, height / 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fill()
  ctx.restore()

  // Draw oval
  ctx.beginPath()
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  
  // Draw border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw letter
  ctx.fillStyle = needsDarkText(color) ? '#2C3E50' : 'white'
  ctx.font = `italic 600 ${fontSize}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, x, y)

  ctx.restore()
}

export function drawCard(
    image: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    categories: Category[],
    config: {
      topPadding: number,
      bottomPadding: number,
      xOffset: number,
      cardWidth: number,
      cardHeight: number
      textGetter: (cat: Category) => string
      placeholderTextGetter: (cat: Category) => string
    }
) {
  ctx.save()

  const { topPadding, bottomPadding, xOffset, cardWidth, cardHeight, textGetter, placeholderTextGetter } = config
  
  ctx.drawImage(image, 0, 0, cardWidth, cardHeight)

  const count = categories.length
  if (count === 0) return

  // Define the usable area for questions
  const availableHeight = cardHeight - topPadding - bottomPadding
  
  // Calculate dynamic spacing
  const rowHeight = availableHeight / count
  const startY = topPadding + rowHeight / 2
  
  // Scale oval size based on available space (with min/max limits)
  const ovalHeight = Math.min(42, Math.max(25, rowHeight * 0.7))
  const ovalWidth = ovalHeight * 1.6
  const ovalX = xOffset + ovalWidth / 2
  const ovalFontSize = Math.min(22, Math.max(14, ovalHeight * 0.5))

  categories.forEach((cat, index) => {
    const y = startY + index * rowHeight
    drawOval(ctx, ovalX, y, ovalWidth, ovalHeight, cat.color, cat.letter, ovalFontSize)
  })

  // Draw questions text with auto-scaling
  const textStartX = xOffset + ovalWidth + 20
  const maxWidth = cardWidth - textStartX - 80
  const maxTextHeight = rowHeight * 0.75 // 75% of row height
  const startFontSize = Math.min(22, Math.max(12, rowHeight * 0.35))

  categories.forEach((cat, index) => {
    const y = startY + index * rowHeight
    const text = textGetter(cat) || placeholderTextGetter(cat)
    const color = text ? '#2C3E50' : '#9CA3AF'
    drawScaledText(ctx, text, textStartX, y, maxWidth, maxTextHeight, startFontSize, color)
  })

  ctx.restore()
}