// ===== 1. DADOS =====
// Cada material tem: orientação, dica, palavras-chave (para a busca) e pontos SIMULADOS.
// Os pontos são fictícios (sem endereço) e servem só para a demonstração.
const MATERIAIS = [
  {
    id: "papel", nome: "Papel", icone: "📄", cor: "#e3f0fb",
    resumo: "Folhas, jornais, caixas de papelão...",
    termos: ["papel", "papeis", "papelao", "jornal", "jornais", "revista", "caderno", "folha", "caixa de papelao"],
    orientacao: [
      "Separe papéis limpos e secos.",
      "Retire grampos, clipes e plásticos.",
      "Papel engordurado ou sujo pode não ser aceito na reciclagem comum.",
      "Procure o coletor de papel (em geral azul) ou a coleta seletiva da sua cidade."
    ],
    dica: "Use o verso das folhas como rascunho, faça blocos de anotação ou artesanato. Assim o papel dura mais e você reduz o desperdício.",
    pontos: [
      { nome: "Coletor da biblioteca (exemplo)", aceita: "Papel, papelão" },
      { nome: "Coletor do bloco de aulas (exemplo)", aceita: "Papel, papelão" },
      { nome: "Coletor da cantina (exemplo)", aceita: "Papel, papelão" }
    ]
  },
  {
    id: "plastico", nome: "Plástico", icone: "🧴", cor: "#fff1d0",
    resumo: "Garrafas, embalagens, copos...",
    termos: ["plastico", "garrafa pet", "pet", "embalagem", "embalagens", "copo", "sacola", "tampinha"],
    orientacao: [
      "Esvazie as embalagens e retire o excesso de resto de produto.",
      "Separe os plásticos dos outros resíduos.",
      "Não amasse nem misture com lixo orgânico.",
      "A aceitação de cada tipo de plástico depende das regras locais de coleta: confira no seu município."
    ],
    dica: "Reutilize potes e garrafas limpos para organizar itens não alimentícios, como parafusos, canetas e materiais de artes.",
    pontos: [
      { nome: "Coletor do pátio (exemplo)", aceita: "Garrafas e embalagens plásticas" },
      { nome: "Coletor da cantina (exemplo)", aceita: "Copos e embalagens plásticas" }
    ]
  },
  {
    id: "vidro", nome: "Vidro", icone: "🍾", cor: "#e1f4e8",
    resumo: "Garrafas, potes, frascos...",
    termos: ["vidro", "garrafa de vidro", "pote de vidro", "pote", "frasco", "copo de vidro"],
    orientacao: [
      "Separe embalagens de vidro, como garrafas, potes e frascos, esvaziadas e lavadas.",
      "Vidro quebrado: embrulhe em jornal ou papelão grosso e identifique como \"vidro quebrado\" para proteger quem faz a coleta.",
      "Confira as regras locais: nem todo vidro (espelhos, lâmpadas, vidro temperado) é aceito na coleta comum."
    ],
    dica: "Potes de conserva bem lavados servem para guardar itens secos, como grãos, botões e materiais de escritório.",
    pontos: [
      { nome: "Coletor do estacionamento (exemplo)", aceita: "Garrafas, potes e frascos de vidro" },
      { nome: "Coletor da cantina (exemplo)", aceita: "Garrafas e potes de vidro" }
    ]
  },
  {
    id: "pilhas", nome: "Pilhas e Baterias", icone: "🔋", cor: "#fde2e2",
    resumo: "Pilhas, baterias de celular...",
    termos: ["pilha", "pilhas e baterias", "bateria", "bateria de celular", "bateria recarregavel"],
    orientacao: [
      "Leve a pontos de recebimento apropriados (lojas e redes que fazem logística reversa).",
      "Não jogue no lixo comum.",
      "Não desmonte, perfure nem queime pilhas e baterias.",
      "Guarde em local seco até a entrega."
    ],
    dica: "Para reduzir o descarte, prefira pilhas recarregáveis em controles e brinquedos.",
    pontos: [
      { nome: "Caixa de pilhas da recepção (exemplo)", aceita: "Pilhas e baterias pequenas" },
      { nome: "Coletor do laboratório (exemplo)", aceita: "Pilhas e baterias de celular" }
    ]
  },
  {
    id: "eletronicos", nome: "Eletrônicos", icone: "📱", cor: "#ece4fb",
    resumo: "Celulares, carregadores, cabos...",
    termos: ["eletronico", "eletronicos", "celular", "carregador", "cabo", "fone", "fone de ouvido", "mouse", "teclado"],
    orientacao: [
      "Encaminhe celulares, cabos e carregadores para coleta específica de eletrônicos.",
      "Apague seus dados pessoais e saia das contas antes de entregar aparelhos.",
      "Não descarte no lixo comum.",
      "Se o aparelho ainda funciona, considere doar."
    ],
    dica: "Aparelhos que ainda funcionam podem ser doados ou trocados. Cabos e carregadores compatíveis podem ser reaproveitados em vez de comprar novos.",
    pontos: [
      { nome: "Coletor de eletrônicos da TI (exemplo)", aceita: "Celulares, cabos e carregadores" },
      { nome: "Coletor da biblioteca (exemplo)", aceita: "Cabos, carregadores e fones" }
    ]
  }
];

// ===== 2. ELEMENTOS DA PÁGINA =====
const campo = document.getElementById("campo-busca");
const msg = document.getElementById("msg");
const resultado = document.getElementById("resultado");
const divCartoes = document.getElementById("cartoes");
const listaOutros = document.getElementById("outros");
let selecionado = "papel"; // categoria mostrada ao abrir a página

// ===== 3. FUNÇÕES =====

// Deixa o texto em minúsculas e sem acentos: "Plástico" vira "plastico".
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Tira o plural simples de CADA palavra: "pilhas" vira "pilha", "copos de vidro" vira "copo de vidro".
// Plurais que não terminam só com "s" (papéis, jornais, embalagens) estão escritos na lista "termos".
function singular(texto) {
  const palavras = texto.split(" ");
  const palavrasNoSingular = palavras.map(palavra => {
    return palavra.length > 3 ? palavra.replace(/s$/, "") : palavra;
  });
  return palavrasNoSingular.join(" ");
}

// Procura o material que combina com o que foi digitado. Retorna o material ou null.
function encontrarMaterial(texto) {
  const busca = singular(normalizar(texto));
  if (busca.length < 3) return null;

  // 1ª tentativa: o texto digitado é IGUAL a um termo (ex.: "copo de vidro" é termo do vidro).
  for (const material of MATERIAIS) {
    for (const termo of material.termos) {
      if (singular(normalizar(termo)) === busca) return material;
    }
  }

  // 2ª tentativa: o texto contém o termo, ou o termo contém o texto (ex.: "garrafas de plastico").
  // Termos com menos de 4 letras (como "pet") ficam de fora, porque aparecem dentro
  // de outras palavras (ex.: "carpete").
  for (const material of MATERIAIS) {
    for (const termo of material.termos) {
      const termoLimpo = singular(normalizar(termo));
      if (termoLimpo.length < 4) continue;
      if (busca.includes(termoLimpo) || termoLimpo.includes(busca)) return material;
    }
  }

  return null;
}

function mostrarMensagem(texto) {
  msg.textContent = texto;
  msg.hidden = !texto;
}

// Cria os cinco cartões de categoria. Roda UMA vez, ao abrir a página.
function criarCartoes() {
  MATERIAIS.forEach(material => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "cartao-cat";
    botao.dataset.id = material.id;               // guarda de qual material é este cartão
    botao.style.setProperty("--cor", material.cor);
    botao.setAttribute("aria-pressed", "false");
    botao.innerHTML = `<span class="icone" aria-hidden="true">${material.icone}</span>${material.nome}`;
    botao.addEventListener("click", () => selecionar(material.id));
    divCartoes.appendChild(botao);
  });
}

// Marca como "pressionado" só o cartão do material selecionado.
// Os botões continuam os mesmos, então o foco do teclado não se perde.
function atualizarCartoes() {
  divCartoes.querySelectorAll(".cartao-cat").forEach(botao => {
    botao.setAttribute("aria-pressed", String(botao.dataset.id === selecionado));
  });
}

// Desenha a lista "Outros materiais" (todos menos o selecionado).
function desenharOutros() {
  listaOutros.innerHTML = "";
  MATERIAIS.filter(material => material.id !== selecionado).forEach(material => {
    const itemLista = document.createElement("li");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.innerHTML = `<span class="icone" aria-hidden="true">${material.icone}</span><span><strong>${material.nome}</strong><small>${material.resumo}</small></span>`;
    botao.addEventListener("click", () => selecionar(material.id));
    itemLista.appendChild(botao);
    listaOutros.appendChild(itemLista);
  });
}

// Mostra orientação, dica e pontos simulados do material escolhido.
function desenharResultado(material) {
  resultado.innerHTML = `
    <div class="res-titulo" style="--cor:${material.cor}">
      <span class="icone" aria-hidden="true">${material.icone}</span>
      <div><h2>${material.nome}</h2><p>Como descartar corretamente?</p></div>
    </div>
    <div class="duas-colunas">
      <div><h3>♻️ Orientação de descarte</h3><ul>${material.orientacao.map(item => `<li>${item}</li>`).join("")}</ul></div>
      <div><h3>💡 Dica de reutilização</h3><p>${material.dica}</p></div>
    </div>
    <section class="pontos"><h3>📍 Pontos de coleta (simulados)</h3><ul id="lista-pontos"></ul></section>`;
  const ul = document.getElementById("lista-pontos");
  material.pontos.forEach((ponto, posicao) => {
    const itemLista = document.createElement("li");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "ponto";
    botao.setAttribute("aria-expanded", "false");
    botao.innerHTML = `<strong>${ponto.nome}</strong><small>${ponto.aceita}</small><span class="selo">SIMULADO</span>`;
    const det = document.createElement("p");
    det.className = "detalhe";
    det.hidden = true;
    det.id = `detalhe-${posicao}`;
    det.textContent = `Materiais aceitos: ${ponto.aceita}. Atenção: este local é fictício e serve apenas para demonstração do projeto.`;
    botao.setAttribute("aria-controls", det.id);
    botao.addEventListener("click", () => {        // abre/fecha os detalhes
      det.hidden = !det.hidden;
      botao.setAttribute("aria-expanded", String(!det.hidden));
    });
    itemLista.append(botao, det);
    ul.appendChild(itemLista);
  });
}

// Seleciona um material e atualiza a tela toda, sem recarregar a página.
function selecionar(id) {
  selecionado = id;
  mostrarMensagem("");
  atualizarCartoes();
  desenharOutros();
  desenharResultado(MATERIAIS.find(material => material.id === id));
}

// Executa a busca digitada pelo usuário.
function buscar(evento) {
  evento.preventDefault();                          // evita recarregar a página
  const texto = campo.value;
  if (!texto.trim()) {
    mostrarMensagem("Digite um material ou escolha uma categoria abaixo.");
    return;
  }
  const material = encontrarMaterial(texto);
  if (!material) {
    mostrarMensagem("Não encontramos esse material. Tente outro nome ou escolha uma categoria.");
    return;
  }
  selecionar(material.id);
}

// Troca entre as telas Início, Sobre e Dicas.
function irPara(tela) {
  ["inicio", "sobre", "dicas"].forEach(nomeTela => {
    document.getElementById("tela-" + nomeTela).hidden = nomeTela !== tela;
  });
  document.querySelectorAll("nav button").forEach(botao => botao.classList.toggle("ativo", botao.dataset.ir === tela));
  if (tela === "inicio") {                          // começa uma nova consulta
    campo.value = "";
    mostrarMensagem("");
  }
  window.scrollTo({ top: 0 });
}

// ===== 4. INÍCIO =====
document.getElementById("form-busca").addEventListener("submit", buscar); // Enter também dispara o submit
document.querySelectorAll("[data-ir]").forEach(botao => botao.addEventListener("click", () => irPara(botao.dataset.ir)));
criarCartoes();                                     // cria os cartões uma única vez
selecionar(selecionado);