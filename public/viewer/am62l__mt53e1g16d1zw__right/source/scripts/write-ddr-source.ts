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
    `# DDR Breakouts · ${configuration.position}\n\nEntry point: src/ddr/${configuration.id}.circuit.tsx\n\nInstall with npm ci --force, then run bun scripts/build-ddr-artifacts.ts ${configuration.position}.\n\nRouting status: ${configuration.routingStatus}.\n\nRight preserves the routed core reference. Top uses core fanout coordination with the explicit @tscircuit/fanout-solver 0.0.53. npm ci applies the unreleased core fix from patches/. The current full Top build fails at RAM fanout (18/33); the page still shows the previous preview, which contains global vias. New builds require all 33 signals and zero global vias. Length matching remains pending. Its capacitor footprints only reserve placement space.\n`,
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
