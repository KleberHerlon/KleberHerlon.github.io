# 📝 Form-Pesquisa — Formulário de Pesquisa de Satisfação

Formulário de **pesquisa de satisfação** com avaliação em escala de 0–10 (atendimento e resolução do problema) e envio estruturado das respostas — ideal para medir NPS/CSAT em serviços.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## 📌 Visão Geral do Problema de Negócio

Medir satisfação de forma **rápida e sem fricção** é pré-requisito para melhorar atendimento. O formulário padroniza a coleta (qualidade do atendimento + resolução do problema em escala 0–10), validando o envio e dando **feedback imediato** ao respondente.

## 🛠️ Arquitetura & Tech Stack Utilizada

| Camada | Papel |
|---|---|
| `index.html` | Estrutura dos campos (escalas 0–10) |
| `style.css` | Visual responsivo e estados de interação |
| `code.js` | Captura do `submit`, controle de UI e envio estruturado |

**Fluxo de envio (`code.js`):**

```
submit do form
   │
   ├─ esconde o formulário (sinal de sucesso)
   ├─ exibe mensagem "Pesquisa enviada com sucesso!"
   └─ chama submitAnswers() → consolida respostas para a fonte
```

## 📊 Modelagem de Dados & Pipelines

**Modelo de dados coletado (por resposta):**

| Campo | Tipo | Escala |
|---|---|---|
| Nome do atendente | texto | — |
| Satisfação com a resolução | numérica | 0–10 |
| Satisfação com o atendimento | numérica | 0–10 |

- **Transformação de UI**: após o envio, a resposta é estruturada em objeto e entregue a `submitAnswers()` (integração plugável com a fonte de dados — planilha/backend);
- **Estratégia anti-duplicidade de clique**: o formulário é ocultado no primeiro submit.

## 📈 Principais Insights / Resultados Gerados

- Coleta padronizada de **CSAT em escala 0–10**, diretamente comparável entre atendentes/períodos;
- Base direta para cálculo de **média de satisfação** e **distribuição de notas** (Promotores × Detratores);
- Variação do modelo NPS aplicável a serviços.

## 🚀 Como Executar o Projeto Localmente

```bash
# abrir diretamente no navegador
start index.html

# ou servir a pasta
python -m http.server 8000 --directory .
# → http://localhost:8000
```

> Para persistir as respostas, implemente o corpo de `submitAnswers()` com a sua API/planilha.

---

## 📁 Estrutura

```
Form-Pesquisa/
├── index.html      # Campos do formulário (0–10)
├── style.css       # Estilos responsivos
├── code.js         # Lógica de envio e feedback
└── README.md
```