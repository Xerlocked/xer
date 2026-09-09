import assert from "node:assert/strict"
// Node 22.12+: node --experimental-strip-types --test scripts/verify-chase.mjs
import { test } from "node:test"
import { advance, CHASE, createWorld, jump, pickCase } from "../src/lib/chase-game.ts"

function seededRandom(seed) {
  let value = seed
  return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

test("safe opening and collision without jumping", () => {
  const world = createWorld()
  advance(world, 2.99, 600, () => 0)
  assert.equal(world.obstacles.length, 0)
  assert.equal(world.outcome, null)
  advance(world, 8, 600, () => 0)
  assert.equal(world.outcome, "escaped")
  assert.ok(world.elapsed > CHASE.safeTime)
})

test("jump arc is consistent across refresh rates and rejects an air jump", () => {
  const worlds = [30, 60, 144].map((fps) => {
    const world = createWorld()
    jump(world)
    for (let i = 0; i < Math.round(fps / 2); i++) advance(world, 1 / fps, 600)
    const before = world.velocity
    jump(world)
    assert.equal(world.velocity, before)
    return world
  })
  for (const world of worlds) assert.ok(Math.abs(world.jumpHeight - worlds[0].jumpHeight) < 0.001)
})

test("generated obstacle sequences can be cleared at mobile and desktop widths", () => {
  for (const width of [600, 1030]) {
    for (const fps of [30, 60, 144]) {
      for (let seed = 1; seed <= 40; seed++) {
        const random = seededRandom(seed)
        const world = createWorld()
        while (!world.outcome) {
          const next = world.obstacles.find((obstacle) => obstacle.x + obstacle.width > CHASE.playerX)
          if (next && next.x - CHASE.playerX - CHASE.playerWidth < 65 && world.jumpHeight === 0) jump(world)
          advance(world, 1 / fps, width, random)
        }
        assert.equal(world.outcome, "caught", `width=${width}, fps=${fps}, seed=${seed}`)
        assert.equal(world.elapsed, CHASE.duration)
      }
    }
  }
})

test("collision takes precedence at the finish, and a finished world stops advancing", () => {
  const world = createWorld()
  world.elapsed = 29.999
  world.nextSpawn = Infinity
  world.obstacles = [{ x: CHASE.playerX, width: 38, height: 34, kind: "crate" }]
  advance(world, 1 / 60, 600)
  assert.equal(world.outcome, "escaped")
  const snapshot = structuredClone(world)
  advance(world, 10, 600)
  assert.deepEqual(world, snapshot)
  assert.deepEqual(createWorld(), { elapsed: 0, distance: 0, jumpHeight: 0, velocity: 0, nextSpawn: 3, obstacles: [], outcome: null })
})

test("recommendations handle empty/single pools and exclude the previous file", () => {
  const files = ["a", "b", "c"].map((id) => ({ id, title: id, summary: "기록", href: `/blog/${id}` }))
  assert.equal(pickCase([]), undefined)
  assert.equal(pickCase([files[0]], "a"), files[0])
  assert.equal(pickCase(files, "b", () => 0), files[0])
  assert.equal(pickCase(files, "b", () => 0.999), files[2])
  for (let i = 0; i < 100; i++) assert.notEqual(pickCase(files, "a")?.id, "a")
})
