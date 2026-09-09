import { createSignal, onCleanup, onMount, Show } from "solid-js"
import { advance, CHASE, createWorld, jump, pickCase, type CaseFile } from "@lib/chase-game"
import { drawChase } from "@lib/chase-renderer"
import "@styles/chase-game.css"

type Status = "ready" | "running" | "paused" | "escaped" | "caught" | "error"
type Props = { files: CaseFile[] }

export default function ChaseGame(props: Props) {
  let root!: HTMLDivElement
  let stage!: HTMLDivElement
  let canvas!: HTMLCanvasElement
  let resultTitle: HTMLHeadingElement | undefined
  let startButton: HTMLButtonElement | undefined
  let ctx: CanvasRenderingContext2D | null = null
  let world = createWorld()
  let frame = 0
  let lastTime = 0
  let width = 960
  let height = 440
  let dark = false
  let reducedMotion = false
  let previousId: string | undefined
  let disposed = false
  const [ready, setReady] = createSignal(false)
  const [gameInput, setGameInput] = createSignal(false)
  const [status, setStatus] = createSignal<Status>("ready")
  const [elapsed, setElapsed] = createSignal(0)
  const [file, setFile] = createSignal<CaseFile>()
  const [announcement, setAnnouncement] = createSignal("")
  const isResult = () => status() === "escaped" || status() === "caught"

  function draw() {
    if (ctx) drawChase(ctx, world, width, height, dark, reducedMotion, status() === "running")
  }

  function stopFrame() {
    cancelAnimationFrame(frame)
    frame = 0
    lastTime = 0
  }

  function fail() {
    stopFrame()
    setStatus("error")
    setAnnouncement("게임을 불러오지 못했습니다. 블로그와 프로젝트는 바로 살펴볼 수 있습니다.")
  }

  function pause() {
    if (status() !== "running") return
    stopFrame()
    setStatus("paused")
    setAnnouncement("추적을 잠시 멈췄습니다. 추적 재개를 선택하면 이어집니다.")
    draw()
  }

  function tick(time: number) {
    if (disposed || status() !== "running") return
    try {
      const delta = lastTime ? (time - lastTime) / 1000 : 0
      lastTime = time
      // A suspended or heavily stalled tab must not cause an unseen collision.
      if (delta > 0.25) { pause(); return }
      advance(world, delta, width)
      setElapsed(Math.floor(world.elapsed * 10) / 10)
      if (world.outcome) {
        stopFrame()
        const selected = pickCase(props.files, previousId)
        previousId = selected?.id
        setFile(selected)
        setStatus(world.outcome)
        setAnnouncement(world.outcome === "caught" ? "추적 완료. 새로운 단서를 확보했습니다." : "추적 실패. 범인은 안개 속으로 사라졌습니다.")
        draw()
        queueMicrotask(() => { if (!disposed) resultTitle?.focus({ preventScroll: true }) })
        return
      }
      draw()
      frame = requestAnimationFrame(tick)
    } catch {
      fail()
    }
  }

  function start(resume = false) {
    if (!ready() || disposed) return
    stopFrame()
    // Move focus before removing the start/result button to avoid a false focus-loss pause.
    stage.focus({ preventScroll: true })
    setGameInput(true)
    const bounds = stage.getBoundingClientRect()
    if (bounds.top < 72 || bounds.bottom > window.innerHeight - 64) {
      stage.scrollIntoView({ block: "center", behavior: "instant" })
    }
    if (!resume) {
      world = createWorld()
      setElapsed(0)
      setFile(undefined)
    }
    setStatus("running")
    setAnnouncement(resume ? "추적을 재개합니다." : "추적 시작. 점프로 장애물을 피해 30초 동안 버티세요.")
    frame = requestAnimationFrame(tick)
  }

  function leap() { if (status() === "running") jump(world) }

  function closeJournal() {
    stopFrame()
    world = createWorld()
    setElapsed(0)
    setStatus("ready")
    setFile(undefined)
    setAnnouncement("일지를 닫았습니다. 추적을 다시 시작할 수 있습니다.")
    draw()
    queueMicrotask(() => { if (!disposed) startButton?.focus({ preventScroll: true }) })
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === "Tab") setGameInput(false)
    if (event.target === stage && (event.code.startsWith("Arrow") || event.code === "Space")) {
      setGameInput(true)
    }
    if (event.key === "Escape" && isResult()) {
      event.preventDefault()
      closeJournal()
      return
    }
    if (event.key === "Escape" && status() === "running") {
      event.preventDefault()
      pause()
      return
    }
    // Buttons and links retain their native keyboard activation.
    if (event.target !== stage || status() !== "running") return
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault()
      if (!event.repeat) leap()
    }
  }

  onMount(() => {
    try {
      ctx = canvas.getContext("2d")
      if (!ctx) { fail(); return }
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
      const updateTheme = () => {
        dark = document.documentElement.classList.contains("dark")
        reducedMotion = motion.matches
        draw()
      }
      const resize = () => {
        const rect = stage.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const scale = Math.min(1, rect.width / 600)
        const nextWidth = rect.width / scale
        const nextHeight = rect.height / scale
        if (Math.abs(width - nextWidth) > 1 || Math.abs(height - nextHeight) > 1) pause()
        width = nextWidth
        height = nextHeight
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(rect.width * dpr)
        canvas.height = Math.round(rect.height * dpr)
        ctx?.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0)
        draw()
      }
      const visibility = () => { if (document.hidden) pause() }
      const resizeObserver = new ResizeObserver(resize)
      const intersectionObserver = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause() })
      const themeObserver = new MutationObserver(updateTheme)
      onCleanup(() => {
        disposed = true
        stopFrame()
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        themeObserver.disconnect()
        motion.removeEventListener("change", updateTheme)
        document.removeEventListener("visibilitychange", visibility)
        window.removeEventListener("blur", pause)
      })
      updateTheme()
      resize()
      resizeObserver.observe(stage)
      intersectionObserver.observe(stage)
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      motion.addEventListener("change", updateTheme)
      document.addEventListener("visibilitychange", visibility)
      window.addEventListener("blur", pause)
      setReady(true)
    } catch {
      fail()
    }
  })

  return (
    <div class="chase" ref={root} onKeyDown={handleKey} onFocusOut={(event) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) pause()
    }}>
      <div class="chase-bar">
        <span class="chase-clock" aria-label={`진행 시간 ${elapsed().toFixed(1)}초, 목표 ${CHASE.duration}초`}>
          {elapsed().toFixed(1).padStart(4, "0")} <span>/ 30.0 s</span>
        </span>
      </div>
      <div class="chase-stage" ref={stage} tabIndex={0} role="group" aria-label="게임 영역" aria-describedby="chase-instructions"
        data-game-input={gameInput()}
        onBlur={() => setGameInput(false)}
        onClick={(event) => {
          if (event.target === canvas && status() === "running") {
            stage.focus({ preventScroll: true })
            setGameInput(true)
            leap()
          }
        }}>
        <div class="chase-poster" classList={{ hidden: ready() }} aria-hidden="true">
          <svg viewBox="0 0 960 240" preserveAspectRatio="xMidYMax slice">
            <path fill="currentColor" d="M0 240V110h70V80l45-30 45 30v80h55V90h60v-30h15v30h35v65h50V115l45-30 45 30v45h65V70h45v-35l18-30 18 30v35h12v120h40V115h55v-20h12v20h25v40h35V95l40-25 40 25v55h90v90z" />
          </svg>
        </div>
        <canvas ref={canvas} class="chase-canvas" classList={{ "chase-canvas-ready": ready() }} aria-hidden="true" />
        <Show when={status() === "ready"}>
          <div class="chase-intro">
            <h1 id="landing-title">안녕하세요 개발자 Xerlock입니다.</h1>
            <p class="chase-intro-copy">블로그를 방문해주셔서 감사합니다.<br />게임과 글 중에서 하나를 선택해주세요.</p>
            <div class="chase-start-actions">
            <button ref={startButton} class="chase-button chase-button-primary" disabled={!ready()} onClick={() => start()}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 1.5v11L12 7z" /></svg>
              {ready() ? "게임 시작" : "게임 준비 중"}
            </button>
            <a class="chase-button" href="/blog">게시글 보기</a>
            </div>
          </div>
        </Show>
        <Show when={status() === "paused"}>
          <div class="chase-overlay">
            <div class="chase-report chase-pause">
              <p class="chase-eyebrow">TAKE A BREATH</p>
              <h2>추적을 잠시 멈췄습니다.</h2>
              <p>준비가 되면, 같은 자리에서 이어가세요.</p>
              <button class="chase-button chase-button-primary" onClick={() => start(true)}>다시하기</button>
              <a class="chase-text-link" href="/blog">게시글 읽기 ↗</a>
            </div>
          </div>
        </Show>
        <Show when={isResult()}>
          <div class="chase-overlay">
            <div class="chase-report chase-journal" role="region" aria-labelledby="chase-journal-title" onDragStart={(event) => event.preventDefault()}>
              <div class="chase-journal-header">
                <span>수사 일지 <span class="chase-journal-number">/ 001</span></span>
                <button class="chase-journal-close" onClick={closeJournal} aria-label="일지 닫기" title="일지 닫기">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
                </button>
              </div>
              <div class="chase-report-meta"><span>CASE REPORT</span><span>{elapsed().toFixed(1)} SECONDS</span></div>
              <h2 id="chase-journal-title" ref={resultTitle} tabIndex={-1}>{status() === "caught" ? "추적 완료." : "추적 실패."}</h2>
              <p class="chase-result-copy">{status() === "caught" ? "새로운 단서를 확보했습니다." : "범인은 안개 속으로 사라졌다."}</p>
              <Show when={file()} fallback={<p class="chase-empty">다음 기록을 준비하고 있습니다.<br />일지를 닫고 다시 추적해 보세요.</p>}>
                {(selected) => (
                  <div class="chase-file">
                    <p class="chase-file-label">발견한 단서 <span aria-hidden="true">↗</span></p>
                    <h3>{selected().title}</h3>
                    <p class="chase-file-summary">{selected().summary}</p>
                    <a class="chase-button chase-button-primary" href={selected().href}>기록 읽기 <span aria-hidden="true">↗</span></a>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </Show>
        <Show when={status() === "error"}>
          <div class="chase-overlay">
            <div class="chase-report chase-pause">
              <p class="chase-eyebrow">A SHORT DETOUR</p>
              <h2>추적을 준비하지 못했습니다.</h2>
              <p>개발 기록은 바로 읽을 수 있어요.</p>
              <a class="chase-button chase-button-primary" href="/blog">게시글 읽기 ↗</a>
            </div>
          </div>
        </Show>
      </div>
      <div class="chase-controls">
        <p id="chase-instructions"><span class="chase-desktop-instructions"><kbd>Space</kbd> / <kbd>↑</kbd> 점프</span><span class="chase-touch-instructions">화면 터치로 점프</span><span class="chase-instruction-divider">·</span>30초 동안 진행</p>
      </div>
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement()}</p>
    </div>
  )
}
