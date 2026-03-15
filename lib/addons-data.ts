export interface AddonMedia {
  type: "image" | "video"
  url: string
}

export interface Addon {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  category: string
  image: string
  media: AddonMedia[]
  features: string[]
  badge?: "Novo" | "Popular" | "Destaque"
  color: string
}

export const ADDON_CATEGORIES = ["Todos", "Relatorios", "Inteligencia Artificial", "Notificacoes", "Metas", "Integracao", "Familia"]

export const ADDONS: Addon[] = [
  {
    id: "relatorio-mensal",
    name: "Relatorio Mensal PDF",
    tagline: "Exporte seu financeiro em um relatorio profissional",
    description: "Gere relatorios mensais completos em PDF com todos os seus gastos, receitas, graficos de evolucao e analise de categorias. Ideal para quem quer ter um historico organizado ou compartilhar com um consultor financeiro.",
    price: 9.90,
    category: "Relatorios",
    image: "/addons/relatorio-mensal.jpg",
    media: [
      { type: "image", url: "/addons/relatorio-mensal.jpg" },
    ],
    badge: "Popular",
    color: "#21C25E",
    features: [
      "Exportacao em PDF de alta qualidade",
      "Graficos e tabelas detalhadas",
      "Comparativo entre meses",
      "Resumo por categoria e pessoa",
      "Historico de ate 12 meses",
      "Personalizacao com nome do casal",
    ],
  },
  {
    id: "ia-categorias",
    name: "Categorizacao com IA",
    tagline: "Categorize despesas automaticamente com inteligencia artificial",
    description: "Ao importar seu extrato CSV, a IA analisa a descricao de cada transacao e categoriza automaticamente: alimentacao, transporte, lazer e muito mais. Economize tempo e tenha dados mais precisos sem precisar categorizar manualmente.",
    price: 14.90,
    category: "Inteligencia Artificial",
    image: "/addons/ia-categorias.jpg",
    media: [
      { type: "image", url: "/addons/ia-categorias.jpg" },
    ],
    badge: "Novo",
    color: "#7C3AED",
    features: [
      "Categorizacao automatica ao importar CSV",
      "Aprende com suas correcoes ao longo do tempo",
      "Suporte a mais de 30 categorias",
      "Confianca de 95% de precisao",
      "Funciona com qualquer banco brasileiro",
      "Sugestoes de novas categorias personalizadas",
    ],
  },
  {
    id: "alertas-inteligentes",
    name: "Alertas Inteligentes",
    tagline: "Notificacoes em tempo real quando voce estoura o orcamento",
    description: "Receba alertas push no celular e por email sempre que estiver proximo ou acima do limite de alguma categoria do seu orcamento. Configure thresholds personalizados e nunca mais seja surpreendido com gastos excessivos.",
    price: 7.90,
    category: "Notificacoes",
    image: "/addons/alertas-inteligentes.jpg",
    media: [
      { type: "image", url: "/addons/alertas-inteligentes.jpg" },
    ],
    badge: "Destaque",
    color: "#F59E0B",
    features: [
      "Notificacoes push para iOS e Android",
      "Alertas por email configuravel",
      "Aviso ao atingir 80% do limite",
      "Alerta imediato ao estourar",
      "Resumo semanal do orcamento",
      "Silenciar alertas por periodo",
    ],
  },
  {
    id: "metas-avancadas",
    name: "Metas Avancadas",
    tagline: "Sistema completo de metas financeiras com plano de acao",
    description: "Va alem das metas basicas. Defina objetivos com sub-metas, depositos automaticos agendados, projecoes de quando voce vai atingir cada meta com base no historico de economia, e celebre conquistas com marcos visuais.",
    price: 12.90,
    category: "Metas",
    image: "/addons/metas-avancadas.jpg",
    media: [
      { type: "image", url: "/addons/metas-avancadas.jpg" },
    ],
    color: "#10B981",
    features: [
      "Sub-metas e marcos intermediarios",
      "Projecao de data de conclusao automatica",
      "Depositos recorrentes programados",
      "Historico de contribuicoes",
      "Compartilhamento de progresso",
      "Celebracoes visuais ao atingir metas",
    ],
  },
  {
    id: "multi-banco",
    name: "Sync Multi-Banco",
    tagline: "Conecte todos os seus bancos em um so lugar",
    description: "Sincronize automaticamente as transacoes dos principais bancos brasileiros: Nubank, Itau, Bradesco, Santander, C6 Bank, Inter e mais. Todas as movimentacoes aparecem no FinCasal em tempo real, sem precisar importar CSV manualmente.",
    price: 19.90,
    category: "Integracao",
    image: "/addons/multi-banco.jpg",
    media: [
      { type: "image", url: "/addons/multi-banco.jpg" },
    ],
    color: "#3B82F6",
    features: [
      "Suporte a Nubank, Itau, Bradesco, Santander e mais",
      "Sincronizacao automatica a cada hora",
      "Conexao segura via Open Finance",
      "Historico de ate 24 meses",
      "Deteccao de duplicatas",
      "Sem necessidade de CSV manual",
    ],
  },
  {
    id: "modo-familia",
    name: "Modo Familia",
    tagline: "Expanda o FinCasal para toda a familia",
    description: "Adicione filhos, pais e outros membros da familia ao seu dashboard. Cada membro tem sua propria visao e permissoes configuradas por voce. Ideal para quem quer controlar o financeiro familiar completo de forma centralizada.",
    price: 24.90,
    category: "Familia",
    image: "/addons/modo-familia.jpg",
    media: [
      { type: "image", url: "/addons/modo-familia.jpg" },
    ],
    color: "#EC4899",
    features: [
      "Ate 6 membros por dashboard",
      "Permissoes individuais por membro",
      "Visao consolidada da familia",
      "Historico separado por membro",
      "Contas de mesada para filhos",
      "Relatorios por nucleo familiar",
    ],
  },
]
