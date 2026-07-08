export interface BairroData {
  id: number
  nome: string
  valores: Record<string, number>
}

export interface IndicatorDef {
  key: string
  label: string
  unit?: string
  category: IndicatorCategory
  format?: "number" | "percent" | "currency" | "km"
  higherIsBetter?: boolean
}

export type IndicatorCategory =
  | "demografia"
  | "economia"
  | "habitacao"
  | "social"
  | "saude"
  | "educacao"
  | "infraestrutura"

export const categoryLabels: Record<IndicatorCategory, string> = {
  demografia: "Demografia",
  economia: "Economia",
  habitacao: "Habitação",
  social: "Programas Sociais",
  saude: "Saúde",
  educacao: "Educação",
  infraestrutura: "Infraestrutura",
}


export const indicators: IndicatorDef[] = [
  { key: "POPULACAO", label: "População", category: "demografia", format: "number" },
  { key: "MEDIA_MORA_DOM", label: "Média moradores/domicílio", category: "demografia", format: "number" },
  { key: "DESOCUPADO_PCT", label: "Desocupação (%)", category: "economia", format: "percent", higherIsBetter: false },
  { key: "CRESCIMENTO_PCT", label: "Crescimento populacional (%)", category: "demografia", format: "percent" },
  { key: "TAXA_GEOME_CRESC_ANUAL_PCT", label: "Taxa geom. cresc. anual (%)", category: "demografia", format: "percent" },
  { key: "RENDA_SM_2010", label: "Renda familiar (salários mínimos)", category: "economia", format: "number", higherIsBetter: true },
  { key: "RENDA_ESTIMADA_2025", label: "Renda familiar estimada (R$)", category: "economia", format: "currency", higherIsBetter: true },
  { key: "MORADIAS_PRECARIAS_DOM", label: "Moradias precárias (domicílios)", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "MORADIAS_PRECARIAS_PESSOAS", label: "Moradias precárias (pessoas)", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "MORADIAS_PRECARIAS_ASSENT", label: "Moradias precárias (assentamentos)", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "MORADIA_SUBNORMAL", label: "Moradia subnormal", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "FAMILIAS_ATENDIDAS_EMHA", label: "Famílias atendidas pela EMHA", category: "habitacao", format: "number" },
  { key: "NAO_ATENDIDAS_EHMA", label: "Famílias não atendidas EMHA", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "ASSENTAMENTOS_REGULARIZAR", label: "Assentamentos a regularizar", category: "habitacao", format: "number", higherIsBetter: false },
  { key: "CADUNICO", label: "Pessoas cadastradas no CadÚnico", category: "social", format: "number" },
  { key: "BOLSA_FAMILIA", label: "Beneficiários do Bolsa Família", category: "social", format: "number" },
  { key: "IDOSOS_BPC", label: "Idosos beneficiados pelo BPC", category: "social", format: "number" },
  { key: "PCD_BPC", label: "PcD beneficiadas pelo BPC", category: "social", format: "number" },
  { key: "OUTROS_PROGRAMAS_SOCIAIS", label: "Beneficiados outros prog. sociais", category: "social", format: "number" },
  { key: "CADASTRO_PCD", label: "Cadastro de pessoas com deficiência", category: "social", format: "number" },
  { key: "INDIGENAS_ALDEADAS", label: "Famílias indígenas aldeadas", category: "social", format: "number" },
  { key: "INDIGENAS_DESALDEADAS", label: "Famílias indígenas desaldeadas", category: "social", format: "number" },
  { key: "INDIGENAS_TOTAL", label: "Famílias indígenas (total)", category: "social", format: "number" },
  { key: "MULHERES_VIOLENCIA", label: "Mulheres vítimas de violência", category: "social", format: "number", higherIsBetter: false },
  { key: "TARIFA_SOCIAL_AGUAS", label: "Benef. tarifa social de água", category: "social", format: "number" },
  { key: "CONSULTAS_SAUDE", label: "Consultas de saúde", category: "saude", format: "number", higherIsBetter: true },
  { key: "EXAMES_SAUDE", label: "Exames de saúde", category: "saude", format: "number", higherIsBetter: true },
  { key: "UBS_UBSF", label: "UBS e UBSF (quantidade)", category: "saude", format: "number", higherIsBetter: true },
  { key: "EDU_INFANTIL", label: "Matrículas ed. infantil", category: "educacao", format: "number" },
  { key: "ENSINO_FUNDAMENTAL", label: "Matrículas ensino fundamental", category: "educacao", format: "number" },
  { key: "ENSINO_MEDIO", label: "Matrículas ensino médio", category: "educacao", format: "number" },
  { key: "JOVENS_POP", label: "Jovens (17-24) população", category: "educacao", format: "number" },
  { key: "JOVENS_RENDIMENTO", label: "Jovens (17-24) rendimento (R$)", category: "educacao", format: "currency" },
  { key: "JOVENS_ALFABETIZACAO", label: "Jovens (17-24) alfabetização (%)", category: "educacao", format: "percent", higherIsBetter: true },
  { key: "IDOSOS_65", label: "Pessoas idosas (65+)", category: "demografia", format: "number" },
  { key: "ALFABETIZADOS", label: "Pessoas alfabetizadas (%)", category: "educacao", format: "percent", higherIsBetter: true },
  { key: "NAO_ALFABETIZADOS", label: "Pessoas não alfabetizadas (%)", category: "educacao", format: "percent", higherIsBetter: false },
  { key: "NAO_ALFABETIZADOS_H", label: "Homens não alfabetizados (%)", category: "educacao", format: "percent", higherIsBetter: false },
  { key: "NAO_ALFABETIZADOS_M", label: "Mulheres não alfabetizadas (%)", category: "educacao", format: "percent", higherIsBetter: false },
  { key: "NAO_PAVIMENTADA_KM", label: "Vias não pavimentadas (km)", category: "infraestrutura", format: "km", higherIsBetter: false },
  { key: "PAVIMENTADA_KM", label: "Vias pavimentadas (km)", category: "infraestrutura", format: "km", higherIsBetter: true },
  { key: "NAO_PAVIMENTADA_PCT", label: "Vias não pavimentadas (%)", category: "infraestrutura", format: "percent", higherIsBetter: false },
  { key: "PAVIMENTADA_PCT", label: "Vias pavimentadas (%)", category: "infraestrutura", format: "percent", higherIsBetter: true },
  { key: "RECAPEAMENTO_QTD", label: "Recapeamento de vias (qtd)", category: "infraestrutura", format: "number" },
  { key: "RECAPEAMENTO_M", label: "Recapeamento (metros)", category: "infraestrutura", format: "number" },
  { key: "AREAS_PUBLICAS_HA", label: "Áreas públicas (hectares)", category: "infraestrutura", format: "number", higherIsBetter: true },
]

export function formatValue(value: number | null | undefined, format?: IndicatorDef["format"]): string {
  if (value == null) return "—"
  switch (format) {
    case "percent":
      return `${value.toFixed(2).replace(".", ",")}%`
    case "currency":
      // Whole reais — raw averages carry float noise like "10.261,802".
      return `R$ ${Math.round(value).toLocaleString("pt-BR")}`
    case "km":
      return `${value.toFixed(2).replace(".", ",")} km`
    case "number":
    default:
      return value.toLocaleString("pt-BR")
  }
}

export function getIndicatorsByCategory(category: IndicatorCategory): IndicatorDef[] {
  return indicators.filter((i) => i.category === category)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import bairrosRaw from "../data/bairros.json"

function transformData(raw: Record<string, unknown>[]): BairroData[] {
  const keyMap: Record<string, string> = {
    "id_bairro": "id",
    "Bairro": "nome",
    "POPULACAO": "POPULACAO",
    "MEDIA_MORA_DOM": "MEDIA_MORA_DOM",
    "DESOCUPADO (%)": "DESOCUPADO_PCT",
    "CRESCIMENTO (%)": "CRESCIMENTO_PCT",
    "TAXA_GEOME_CRESC_ANUAL (%)": "TAXA_GEOME_CRESC_ANUAL_PCT",
    "RENDA FAMILIAR EM SALÁRIOS MÍNIMOS (2010)": "RENDA_SM_2010",
    "RENDA FAMILIAR (ESTIMADA 2025)": "RENDA_ESTIMADA_2025",
    "MORADIAS PRECÁRIAS (DOMICÍLIOS) DADOS PRELIMINARES": "MORADIAS_PRECARIAS_DOM",
    "MORADIAS PRECÁRIAS (PESSOAS) DADOS PRELIMINARES": "MORADIAS_PRECARIAS_PESSOAS",
    "MORADIAS PRECÁRIAS (ASSENTAMENTOS)DADOS PRELIMINARES": "MORADIAS_PRECARIAS_ASSENT",
    "MORADIA SUBNORMAL (2022)": "MORADIA_SUBNORMAL",
    "FAMÍLIAS ATENDIDAS PELA EMHA (2022)": "FAMILIAS_ATENDIDAS_EMHA",
    "NÃO ATENDIDAS EHMA (2022)": "NAO_ATENDIDAS_EHMA",
    "ASSENTAMENTOS A REGULARIZAR (2022)": "ASSENTAMENTOS_REGULARIZAR",
    "PESSOAS CADASTRADAS NO CADÚNICO (2022)": "CADUNICO",
    "PESSOAS BENEFICIÁRIAS NO BOLSA FAMÍLIA (2022)": "BOLSA_FAMILIA",
    "IDOSOS BENEFICIADOS PELO BPC (2022)": "IDOSOS_BPC",
    "PESSOAS COM DEFICIENCIA BENEFIADOS PELO BPC (2022)": "PCD_BPC",
    "PESSOAS BENEFICIADAS POR OUTROS PROGRAMAS SOCIAIS (2022)": "OUTROS_PROGRAMAS_SOCIAIS",
    "PESSOAS CADASTRADAS NO CADASTRO DE PESSOAS COM DEFICIENCIA (2022)": "CADASTRO_PCD",
    "FAMÍLIAS INDIGENAS ALDEADAS (2022)": "INDIGENAS_ALDEADAS",
    "FAMÍLIAS INDIGENAS DESALDEADAS (2022)": "INDIGENAS_DESALDEADAS",
    "FAMILIAS INDIGENAS TOTAL (2022)": "INDIGENAS_TOTAL",
    "MULHERES VÍTIMAS DE VIOLÊNCIA (2022)": "MULHERES_VIOLENCIA",
    "BENEFICIÁRIOS TARIFA SOCIAL ÁGUAS(2023)": "TARIFA_SOCIAL_AGUAS",
    "NÚMERO DE CONSULTAS SAÚDE (2022)": "CONSULTAS_SAUDE",
    "NÚMERO DE EXAMES SAÚDE (2022)": "EXAMES_SAUDE",
    "SAÚDE UBS E UBSF (QUANTIDADE)": "UBS_UBSF",
    "MATRICULAS NA EDUCAÇÃO INFANTIL EMEIS (2023)": "EDU_INFANTIL",
    "MATRÍCULAS NO ENSINO FUNDAMENTAL EE (2023)": "ENSINO_FUNDAMENTAL",
    "MATRICULAS NO ENSINO MÉDIO (2023)": "ENSINO_MEDIO",
    "JOVENS (17 A 24 ANOS) - POPULAÇÃO": "JOVENS_POP",
    "JOVENS (17 A 24 ANOS) - RENDIMENTO R$": "JOVENS_RENDIMENTO",
    "JOVENS (17 A 24 ANOS) - ALFABETIZAÇÃO %": "JOVENS_ALFABETIZACAO",
    "PESSOA IDOSA (65+) 2010": "IDOSOS_65",
    "PESSOA ALFABETIZADA (2010)": "ALFABETIZADOS",
    "PESSOA NÃO ALFABETIZADA (2010)": "NAO_ALFABETIZADOS",
    "PESSOA NÃO ALFABETIZADA HOMEM (2010)": "NAO_ALFABETIZADOS_H",
    "PESSOA NÃO ALFABETIZADA MULHER (2010)": "NAO_ALFABETIZADOS_M",
    "NÃO PAVIMENTADA (Km linear)": "NAO_PAVIMENTADA_KM",
    "PAVIMENTADA (Km linear)": "PAVIMENTADA_KM",
    "NÃO PAVIMENTADA (%)": "NAO_PAVIMENTADA_PCT",
    "PAVIMENTADA (%)": "PAVIMENTADA_PCT",
    "REACAPEAMENTO DE VIAS (QUANTIDADE)": "RECAPEAMENTO_QTD",
    "REACAPEAMENTO DE VIAS (METROS LINEARES)": "RECAPEAMENTO_M",
    "ÁREAS PÚBLICAS (HECTARE)": "AREAS_PUBLICAS_HA",
  }

  return raw.map((row) => {
    const valores: Record<string, number> = {}
    for (const [origKey, val] of Object.entries(row)) {
      const mapped = keyMap[origKey]
      if (mapped === "id") continue
      if (mapped === "nome") continue
      if (mapped) {
        valores[mapped] = typeof val === "number" ? val : 0
      }
    }
    return {
      id: row.id_bairro as number,
      nome: row.Bairro as string,
      valores,
    }
  })
}

const rawData = bairrosRaw as Record<string, unknown>[]
export const bairros: BairroData[] = transformData(rawData)

export function getVal(b: BairroData, key: string): number {
  return b.valores[key] ?? 0
}

export function getRanking(key: string, order: "asc" | "desc" = "desc"): BairroData[] {
  return [...bairros].sort((a, b) => {
    const va = getVal(a, key)
    const vb = getVal(b, key)
    return order === "desc" ? vb - va : va - vb
  })
}