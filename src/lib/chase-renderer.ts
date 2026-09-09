import { CHASE, type ChaseWorld } from "./chase-game"

export function drawChase(ctx: CanvasRenderingContext2D, world: ChaseWorld, width: number, height: number, dark: boolean, reducedMotion: boolean, running: boolean) {
  const colors = dark
    ? { sky: "#0a0a0a", ink: "#c2c2c2", line: "#666666", gold: "#8e8e8e" }
    : { sky: "#ffffff", ink: "#535353", line: "#aaaaaa", gold: "#888888" }
  const ground = height - 28
  const offset = reducedMotion ? 0 : world.distance
  // Keep the canvas transparent: the page itself is the game's background.
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = colors.line
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    const x = width * 0.35 + i * 150 - (offset * 0.035) % 150
    const roof = ground - 45 - (i % 2) * 28
    ctx.beginPath()
    ctx.moveTo(x, ground)
    ctx.lineTo(x, roof)
    ctx.lineTo(x + 24, roof - 19)
    ctx.lineTo(x + 48, roof)
    ctx.lineTo(x + 48, ground)
    ctx.moveTo(x + 35, roof - 10)
    ctx.lineTo(x + 35, roof - 23)
    ctx.lineTo(x + 40, roof - 23)
    ctx.lineTo(x + 40, roof - 6)
    ctx.stroke()
    ctx.strokeRect(x + 12, roof + 15, 7, 10)
    ctx.strokeRect(x + 30, roof + 15, 7, 10)
  }
  ctx.beginPath()
  ctx.arc(width * 0.81, ground - 160, 13, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  ctx.fillStyle = colors.line
  ctx.fillRect(0, ground, width, 1)
  for (let i = -1; i < width / 90 + 1; i++) {
    const x = i * 90 - offset % 90
    ctx.fillRect(x, ground + 9, 11, 1)
    ctx.fillRect(x + 45, ground + 17, 4, 1)
  }
  for (const obstacle of world.obstacles) {
    const y = ground - obstacle.height
    ctx.fillStyle = colors.ink
    ctx.fillRect(obstacle.x, y, obstacle.width, obstacle.height)
    ctx.strokeStyle = colors.sky
    ctx.lineWidth = 2
    if (obstacle.kind === "crate") {
      ctx.strokeRect(obstacle.x + 5, y + 5, obstacle.width - 10, obstacle.height - 10)
      ctx.beginPath()
      ctx.moveTo(obstacle.x + 5, y + 5)
      ctx.lineTo(obstacle.x + obstacle.width - 5, ground - 5)
      ctx.moveTo(obstacle.x + obstacle.width - 5, y + 5)
      ctx.lineTo(obstacle.x + 5, ground - 5)
      ctx.stroke()
    } else {
      ctx.fillRect(obstacle.x - 3, y, obstacle.width + 6, 7)
      ctx.fillStyle = colors.line
      ctx.fillRect(obstacle.x + 5, y + 19, obstacle.width - 10, 2)
      ctx.fillRect(obstacle.x + 5, y + 34, obstacle.width - 10, 2)
    }
  }

  const x = CHASE.playerX
  const y = ground - world.jumpHeight
  const stride = running && world.jumpHeight === 0 ? Math.sin(world.elapsed * 24) * 6 : 3
  ctx.fillStyle = colors.ink
  // Boots, coat, profile and deerstalker hat form one readable silhouette.
  ctx.fillRect(x + 7 - stride, y - 13, 8, 13)
  ctx.fillRect(x + 20 + stride, y - 13, 8, 13)
  ctx.beginPath()
  ctx.moveTo(x + 10, y - 40)
  ctx.lineTo(x + 27, y - 38)
  ctx.lineTo(x + 35, y - 13)
  ctx.lineTo(x + 2, y - 13)
  ctx.fill()
  ctx.fillRect(x + 14, y - 51, 15, 14)
  ctx.fillRect(x + 27, y - 47, 6, 5)
  ctx.fillRect(x + 9, y - 58, 19, 8)
  ctx.fillRect(x + 4, y - 52, 32, 4)
  ctx.fillStyle = colors.gold
  ctx.fillRect(x + 11, y - 39, 19, 4)
  ctx.fillRect(x + 4, y - 37, 9, 5)
  ctx.fillStyle = colors.sky
  ctx.fillRect(x + 26, y - 47, 2, 2)
}

