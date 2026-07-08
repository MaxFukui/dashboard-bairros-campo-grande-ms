# Dashboard Bairros — Campo Grande, MS

Painel interativo com indicadores socioeconômicos dos 74 bairros de
Campo Grande, Mato Grosso do Sul.

- **Stack:** React 19 · TypeScript · Vite · ECharts · Tailwind v4 · shadcn/ui
- **Dados:** IBGE Censo Demográfico 2022 + CadÚnico 2022 + MS Transparência
  (em `src/data/bairros.json`)
- **Mapa:** shapefile IBGE dos bairros de CG convertido para GeoJSON
  (em `public/geo/`)

## Documentação

- [`docs/geo-data.md`](docs/geo-data.md) — sistema de dados geográficos
  (shapefile → GeoJSON/TopoJSON → mapa coroplético)
- [`scripts/geo/README.md`](scripts/geo/README.md) — como re-gerar os
  arquivos geo quando o IBGE publicar uma nova versão

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm run lint
npm run preview  # serve dist/
```

## Estrutura

```
public/
  shapefiles_bairros/    # shapefiles brutos e filtrados (CG)
  geo/                   # GeoJSON + TopoJSON para o mapa

src/
  components/            # Dashboard, Charts, ChoroplethMap, ui/
  data/bairros.json      # 74 bairros + 46 indicadores
  lib/                   # data.ts (tipos + indicadores), geo.ts, utils.ts

scripts/geo/             # scripts de conversão shapefile → GeoJSON → TopoJSON
docs/                    # documentação
```

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
