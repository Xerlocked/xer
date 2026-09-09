export const CHASE = {
  duration: 30,
  safeTime: 3,
  playerX: 88,
  playerWidth: 32,
  playerHeight: 58,
  gravity: 1450,
  jumpSpeed: 510,
  speeds: [235, 255, 275],
  minGap: 1.55,
  gapVariation: 0.45,
} as const

export type Obstacle = { x: number; width: number; height: number; kind: "crate" | "chimney" }
export type ChaseWorld = {
  elapsed: number
  distance: number
  jumpHeight: number
  velocity: number
  nextSpawn: number
  obstacles: Obstacle[]
  outcome: "caught" | "escaped" | null
}
export type CaseFile = { id: string; title: string; summary: string; href: string }

export function createWorld(): ChaseWorld {
  return { elapsed: 0, distance: 0, jumpHeight: 0, velocity: 0, nextSpawn: CHASE.safeTime, obstacles: [], outcome: null }
}

export function jump(world: ChaseWorld) {
  if (!world.outcome && world.jumpHeight === 0) world.velocity = CHASE.jumpSpeed
}

// Small simulation steps make collision and jumping independent of display refresh rate.
export function advance(world: ChaseWorld, seconds: number, width: number, random = Math.random) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  let remaining = seconds
  while (remaining > 0 && !world.outcome) {
    const dt = Math.min(remaining, 1 / 120)
    remaining -= dt
    world.elapsed = Math.min(CHASE.duration, world.elapsed + dt)
    const speed = CHASE.speeds[Math.min(2, Math.floor(world.elapsed / 10))]
    world.distance += speed * dt
    world.jumpHeight = Math.max(0, world.jumpHeight + world.velocity * dt - CHASE.gravity * dt * dt / 2)
    world.velocity = world.jumpHeight > 0 ? world.velocity - CHASE.gravity * dt : 0

    if (world.elapsed >= world.nextSpawn) {
      const chimney = random() > 0.5
      world.obstacles.push({ x: width + 24, width: chimney ? 34 : 38, height: chimney ? 47 : 34, kind: chimney ? "chimney" : "crate" })
      world.nextSpawn = world.elapsed + CHASE.minGap + random() * CHASE.gapVariation
    }
    for (const obstacle of world.obstacles) {
      obstacle.x -= speed * dt
      if (
        CHASE.playerX + CHASE.playerWidth - 5 > obstacle.x + 4 &&
        CHASE.playerX + 6 < obstacle.x + obstacle.width - 4 &&
        world.jumpHeight + 5 < obstacle.height - 3
      ) world.outcome = "escaped"
    }
    world.obstacles = world.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20)
    // Collision wins if the time limit is reached in the same simulation step.
    if (!world.outcome && world.elapsed >= CHASE.duration) world.outcome = "caught"
  }
}

export function pickCase(files: CaseFile[], previousId?: string, random = Math.random): CaseFile | undefined {
  const candidates = files.length > 1 ? files.filter((file) => file.id !== previousId) : files
  return candidates[Math.floor(random() * candidates.length)]
}
