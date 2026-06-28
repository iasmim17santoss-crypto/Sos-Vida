export interface Animal {
  id: number;
  name: string;
  age: string;
  size: string;
  sex: string;
  castrated: boolean;
  vaccinated: boolean;
  description: string;
  status: "disponivel" | "tratamento" | "adotado";
  image: string;
  species: string;
  personality: string[];
  apadrinhar?: boolean;
}

export const ANIMALS: Animal[] = [
  {
    id: 1, name: "Pitucho", age: "2 meses", size: "Pequeno", sex: "Macho",
    castrated: false, vaccinated: true,
    description: "Filhote dachshund dourado de olhos azuis, resgatado ainda pequenino. Adora brincar e é super carinhoso. Vai crescer sendo seu melhor amigo!",
    status: "disponivel",
    image: "pitucho",
    species: "Cachorro", personality: ["Curioso", "Brincalhão", "Carinhoso"],
  },
  {
    id: 2, name: "Rex", age: "4 anos", size: "Grande", sex: "Macho",
    castrated: true, vaccinated: true,
    description: "Pastor Alemão preto imponente e leal. Muito inteligente, aprende comandos rapidamente. Resgatado de abandono, está pronto para um lar amoroso.",
    status: "tratamento",
    image: "rex",
    species: "Cachorro", personality: ["Leal", "Protetor", "Inteligente"],
  },
  {
    id: 3, name: "Calo", age: "1 ano", size: "Pequeno", sex: "Macho",
    castrated: false, vaccinated: true,
    description: "Calopsita linda com crista amarela, muito social e musical. Já interage bem com pessoas e adora ser observado. Perfeito para apartamento.",
    status: "disponivel",
    image: "calo",
    species: "Ave", personality: ["Musical", "Social", "Curioso"],
    apadrinhar: true,
  },
  {
    id: 4, name: "Fred", age: "8 meses", size: "Pequeno", sex: "Macho",
    castrated: false, vaccinated: true,
    description: "Coelho lop branco e marrom, com orelhinhas caídas derretedoras. Docinho e tranquilo, se adapta bem a apartamentos e adora atenção.",
    status: "disponivel",
    image: "fred",
    species: "Coelho", personality: ["Calmo", "Dócil", "Afetivo"],
  },
  {
    id: 5, name: "Mercury", age: "6 meses", size: "Pequeno", sex: "Macho",
    castrated: false, vaccinated: true,
    description: "Porquinho da índia branco e marrom com pelo estiloso. Super curioso e sociável, faz barulhinhos adoráveis quando feliz. Ideal para crianças.",
    status: "disponivel",
    image: "mercury",
    species: "Outro", personality: ["Curioso", "Sociável", "Carinhoso"],
  },
];

export const STATS = [
  { label: "Animais Resgatados", value: "4.820" },
  { label: "Adoções Realizadas", value: "3.215" },
  { label: "Castrações", value: "8.430" },
  { label: "Vacinas Aplicadas", value: "12.600" },
  { label: "Animais Silvestres", value: "940" },
  { label: "Doações (R$)", value: "892K" },
];

export const PROJECTS = [
  { title: "Patinhas Seguras", desc: "Resgate de cães e gatos abandonados nas ruas e matas da cidade." },
  { title: "Vida Silvestre", desc: "Resgate, reabilitação e soltura monitorada de animais silvestres." },
  { title: "Castração Solidária", desc: "Castração gratuita para famílias em vulnerabilidade social." },
  { title: "Hospital Solidário", desc: "Atendimento veterinário gratuito para animais resgatados." },
];
