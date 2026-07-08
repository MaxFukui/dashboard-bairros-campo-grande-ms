import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Must match the GitHub Pages URL: https://maxfukui.github.io/dashboard-bairros-campo-grande-ms/
  base: "/dashboard-bairros-campo-grande-ms/",
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
