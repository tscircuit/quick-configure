const drawing = document.querySelector("#drawing")
const svgCanvas = document.querySelector("#svg-canvas")
const drawingLoading = document.querySelector("#drawing-loading")
const positionSelect = document.querySelector("#ram-position")
const boardFileLinks = [...document.querySelectorAll("[data-board-file]")]
function loadBoard() {
  const option = positionSelect.selectedOptions[0]
  if (option.disabled || !option.dataset.boardId) return
  const boardId = option.dataset.boardId
  const base = `../viewer/${boardId}`
  drawingLoading.hidden = false
  drawingLoading.querySelector("span").textContent = "Loading PCB"
  const unrouted = option.dataset.routingStatus === "unrouted"
  const status = document.querySelector("#routing-status")
  status.textContent = unrouted ? "Unrouted reference" : "Routed reference"
  status.classList.toggle("unrouted", unrouted)
  drawing.alt = `${unrouted ? "Unrouted" : "Routed"} AM62L DDR breakout with MT53E1G16D1ZW LPDDR4 RAM ${option.value === "top" ? "above" : "to the right of"} the CPU`
  drawing.src = `${base}/pcb.svg`
  document.querySelector("#caption-title").textContent =
    `AM62L · MT53E1G16D1ZW · ${option.text}`
  document.querySelector("#caption-dimensions").textContent =
    option.dataset.dimensions
  for (const link of boardFileLinks) {
    link.href = `${base}/${link.dataset.boardFile}`
    link.download = `${boardId}-${link.dataset.boardFile}`
  }
  resetDrawing()
}
positionSelect.addEventListener("change", loadBoard)
let transform = { x: 0, y: 0, scale: 1 },
  drag = null
function applyTransform() {
  drawing.style.width = `${94 * transform.scale}%`
  drawing.style.height = `${94 * transform.scale}%`
  drawing.style.transform = `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px)`
}
function resetDrawing() {
  transform = { x: 0, y: 0, scale: 1 }
  applyTransform()
}
function setZoom(scale, clientX, clientY) {
  const nextScale = Math.min(6, Math.max(0.45, scale))
  if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
    const rect = svgCanvas.getBoundingClientRect(),
      cursorX = clientX - (rect.left + rect.width / 2),
      cursorY = clientY - (rect.top + rect.height / 2),
      worldX = (cursorX - transform.x) / transform.scale,
      worldY = (cursorY - transform.y) / transform.scale
    transform.x = cursorX - worldX * nextScale
    transform.y = cursorY - worldY * nextScale
  }
  transform.scale = nextScale
  applyTransform()
}
document
  .querySelector("#zoom-in")
  .addEventListener("click", () => setZoom(transform.scale * 1.15))
document
  .querySelector("#zoom-out")
  .addEventListener("click", () => setZoom(transform.scale / 1.15))
document.querySelector("#zoom-reset").addEventListener("click", resetDrawing)
svgCanvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault()
    const factor = Math.min(
      1.06,
      Math.max(0.94, Math.exp(-event.deltaY * 0.0008)),
    )
    setZoom(transform.scale * factor, event.clientX, event.clientY)
  },
  { passive: false },
)
svgCanvas.addEventListener("pointerdown", (event) => {
  drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    originX: transform.x,
    originY: transform.y,
  }
  svgCanvas.setPointerCapture(event.pointerId)
  svgCanvas.classList.add("dragging")
})
svgCanvas.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return
  transform.x = drag.originX + event.clientX - drag.x
  transform.y = drag.originY + event.clientY - drag.y
  applyTransform()
})
function endDrag(event) {
  if (!drag || drag.pointerId !== event.pointerId) return
  drag = null
  svgCanvas.classList.remove("dragging")
}
svgCanvas.addEventListener("pointerup", endDrag)
svgCanvas.addEventListener("pointercancel", endDrag)

svgCanvas.addEventListener("keydown", (event) => {
  if (["+", "=", "-", "0"].includes(event.key)) event.preventDefault()
  if (event.key === "+" || event.key === "=") setZoom(transform.scale * 1.15)
  if (event.key === "-") setZoom(transform.scale / 1.15)
  if (event.key === "0") resetDrawing()
})
function markLoaded() {
  drawingLoading.hidden = true
}
function markFailed() {
  drawingLoading.hidden = false
  drawingLoading.querySelector("span").textContent = "PCB drawing unavailable"
}
drawing.addEventListener("load", markLoaded)
drawing.addEventListener("error", markFailed)
loadBoard()
if (drawing.complete) drawing.naturalWidth ? markLoaded() : markFailed()
