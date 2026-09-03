import { mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { ddrSourceFilenames } from "../src/ddr/configurations"

export async function writeDdrSource(
  projectRoot: string,
  outputDir: string,
  configuration: { id: string; position: string; routingStatus: string },
) {
  const sourceDir = join(outputDir, "source")
  await mkdir(sourceDir, { recursive: true })
  for (const filename of ddrSourceFilenames) {
    const target = join(sourceDir, filename)
    await mkdir(dirname(target), { recursive: true })
    await Bun.write(target, await Bun.file(join(projectRoot, filename)).text())
  }
  await Bun.write(
    join(sourceDir, "README.md"),
    `# DDR Breakouts · ${configuration.position}

Entry point: src/ddr/${configuration.id}.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts ${configuration.position}.

Both previews are generated from TSX. Top rotates the core Right reference's package placements and bus exit directions by 90 degrees, with CPU at (0, -9.5) and RAM at (-1.81916, 9.616917). It includes RAM power/ground fanout and eight DDR capacitors. Right additionally includes the reference's 60 direct processor decouplers.

Top explicitly uses @tscircuit/fanout-solver 0.0.54 and core's paired fanout handoff. Winding and fanout planning use the horizontal reference frame; core receives the solved copper and endpoints in board coordinates. npm ci applies the unreleased core handoff fix from patches/.

All 33 DDR signals must connect without global layer changes, and every Top via must fit inside a CPU or RAM fanout region. Both SVGs show the three actual routing regions. ../routing-phases.json contains the captured phase connections and bounds.

No circuit JSON or SVG is used as a routing input.
`,
  )
  const files = ["README.md", ...ddrSourceFilenames]
  const entry = `src/ddr/${configuration.id}.circuit.tsx`
  await Bun.write(
    join(sourceDir, "index.html"),
    `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>DDR ${configuration.position} source</title>
<style>body{margin:0;font:14px system-ui;color:#24292f;background:#fff}header{padding:18px 24px;border-bottom:1px solid #d0d7de}h1{font-size:20px;margin:12px 0}a{color:#0969da}main{display:grid;grid-template-columns:300px minmax(0,1fr)}nav{padding:16px;overflow-wrap:anywhere;border-right:1px solid #d0d7de}nav a{display:block;padding:7px 0}article{min-width:0;padding:16px}pre{overflow:auto;padding:16px;background:#f6f8fa;line-height:1.5;max-height:75vh}#filename{overflow-wrap:anywhere}@media(max-width:700px){main{grid-template-columns:1fr}nav{border-right:0;border-bottom:1px solid #d0d7de}}</style></head>
<body><header><a href="../../../ddr-breakouts/">← DDR Breakouts</a><h1>AM62L + LPDDR4 · ${configuration.position} source</h1><p>Browse the source files or download them individually. Start with README.md for build instructions.</p></header><main><nav aria-label="Source files">${files.map((file) => `<a href="?file=${encodeURIComponent(file)}">${file}</a>`).join("\n")}</nav><article><h2 id="filename"></h2><a id="download" download>Download file</a><pre><code id="code">Loading source…</code></pre></article></main>
<script>
const files = ${JSON.stringify(files)};
const requested = new URLSearchParams(location.search).get("file");
const file = files.includes(requested) ? requested : ${JSON.stringify(entry)};
document.querySelector("#filename").textContent = file;
const download = document.querySelector("#download");
download.href = file;
download.download = file.split("/").pop();
fetch(file).then(response => { if (!response.ok) throw new Error("Source unavailable"); return response.text(); }).then(source => { document.querySelector("#code").textContent = source; }).catch(() => { document.querySelector("#code").textContent = "Could not load this file. Try the download link."; });
</script></body></html>`,
  )
  await rm(join(outputDir, "source.zip"), { force: true })
}
