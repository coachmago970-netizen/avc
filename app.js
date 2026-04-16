// ============================================================
// DRILL SERGEANT — PWA de inglês debochado
// ============================================================

const STORE = {
  key: () => localStorage.getItem('ds_api_key'),
  setKey: (k) => localStorage.setItem('ds_api_key', k),
  clearKey: () => localStorage.removeItem('ds_api_key'),
  level: () => localStorage.getItem('ds_level') || 'beginner',
  setLevel: (l) => localStorage.setItem('ds_level', l),
  xp: () => parseInt(localStorage.getItem('ds_xp') || '0', 10),
  addXp: (n) => localStorage.setItem('ds_xp', STORE.xp() + n),
  streak: () => parseInt(localStorage.getItem('ds_streak') || '0', 10),
  lastDay: () => localStorage.getItem('ds_last_day'),
  bumpStreak: () => {
    const today = new Date().toDateString();
    const last = STORE.lastDay();
    if (last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? STORE.streak() + 1 : 1;
    localStorage.setItem('ds_streak', newStreak);
    localStorage.setItem('ds_last_day', today);
  },
  log: () => JSON.parse(localStorage.getItem('ds_log') || '[]'),
  addLog: (e) => {
    const log = STORE.log();
    log.unshift(e);
    localStorage.setItem('ds_log', JSON.stringify(log.slice(0, 10)));
  },
  missionIdx: () => parseInt(localStorage.getItem('ds_mission_idx') || '0', 10),
  bumpMission: () => localStorage.setItem('ds_mission_idx', STORE.missionIdx() + 1),
  resetAll: () => {
    const k = STORE.key();
    localStorage.clear();
    if (k) STORE.setKey(k);
  }
};

// ============================================================
// MISSÕES — lista rotativa de tarefas
// ============================================================
const MISSIONS = [
  {
    title: "APRESENTE-SE, SOLDADO",
    briefing: "Todo recruta começa sendo humilhado no básico. Escreva três frases sobre você: seu nome, o que você faz e por que está aprendendo inglês. Em INGLÊS, obviamente.",
    task: "Write 3 sentences: name, occupation, why you're learning English."
  },
  {
    title: "OPERAÇÃO CAFÉ DA MANHÃ",
    briefing: "Descreva o que você comeu hoje de manhã. No mínimo 4 frases. Use o passado simples, recruta. Se não sabe o que é, está na hora de aprender.",
    task: "Describe your breakfast today. Min. 4 sentences. Use simple past."
  },
  {
    title: "INFILTRAÇÃO EM RESTAURANTE",
    briefing: "Você está num restaurante em Nova York. Escreva um diálogo curto com o garçom: cumprimente, peça uma bebida, peça um prato principal, peça a conta.",
    task: "Write a restaurant dialogue: greet, order drink, order main, ask for bill."
  },
  {
    title: "RECONHECIMENTO DE TERRITÓRIO",
    briefing: "Descreva sua cidade em 5 frases. Use 'there is' e 'there are'. Se errar, vai pagar flexão.",
    task: "Describe your city in 5 sentences. Use 'there is' and 'there are'."
  },
  {
    title: "MISSÃO FUTURO",
    briefing: "Conte o que você VAI FAZER amanhã. Use 'going to' e 'will'. Mínimo 5 frases, soldado.",
    task: "Tell me what you'll do tomorrow. Use 'going to' and 'will'. Min. 5 sentences."
  },
  {
    title: "INTERROGATÓRIO",
    briefing: "Escreva 6 perguntas que você faria pra um americano que acabou de conhecer. Misture question words: what, where, when, why, how, who.",
    task: "Write 6 questions for an American you just met. Mix all question words."
  },
  {
    title: "OPERAÇÃO OPINIÃO",
    briefing: "Dê sua opinião sobre redes sociais. 5 frases. Use 'I think', 'In my opinion', 'I believe'. Sem copiar dos outros, recruta.",
    task: "Give your opinion about social media. 5 sentences with opinion phrases."
  },
  {
    title: "RELATÓRIO DE CAMPO",
    briefing: "Descreva o melhor dia da sua vida. Passado simples. Mínimo 6 frases. E não me venha com clichê de 'meu casamento'.",
    task: "Describe the best day of your life. Simple past. Min. 6 sentences."
  },
  {
    title: "PHRASAL VERBS — COMBATE CORPO A CORPO",
    briefing: "Escreva 5 frases usando CADA UM destes phrasal verbs: give up, look for, run out of, take off, put on. UMA frase cada.",
    task: "Write 5 sentences — one for each: give up, look for, run out of, take off, put on."
  },
  {
    title: "MISSÃO CONDICIONAL",
    briefing: "Complete 4 frases com 'If I had a million dollars, I would...'. Criatividade, soldado. Não é só 'comprar carro'.",
    task: "Write 4 sentences starting with 'If I had a million dollars, I would...'"
  },
  {
    title: "OPERAÇÃO PRESENTE PERFEITO",
    briefing: "Use 'have/has + past participle' em 5 frases sobre experiências da sua vida. Ex: 'I have traveled to...'",
    task: "Write 5 sentences with present perfect about your life experiences."
  },
  {
    title: "EMBOSCADA GRAMATICAL",
    briefing: "Escreva um parágrafo de 7 frases sobre seu trabalho ou estudo. Use pelo menos 3 tempos verbais diferentes.",
    task: "Write a 7-sentence paragraph about your work/studies. Use 3+ verb tenses."
  }
];

function getMission() {
  const idx = STORE.missionIdx() % MISSIONS.length;
  return { ...MISSIONS[idx], num: idx + 1 };
}

// ============================================================
// SYSTEM PROMPT DO SARGENTO
// ============================================================
function buildSystemPrompt(level) {
  const levelDesc = {
    beginner: "O aluno é INICIANTE. Não use gramática muito complexa. Corrija erros básicos (verb to be, simple present, vocabulário).",
    intermediate: "O aluno é INTERMEDIÁRIO. Exija mais precisão em tempos verbais, preposições e vocabulário.",
    advanced: "O aluno é AVANÇADO. Seja exigente com nuances, phrasal verbs, collocations, naturalidade."
  }[level] || "";

  return `Você é o SARGENTO HAMMER, um professor de inglês brasileiro no estilo de um sargento militar durão, debochado e SEM FILTRO. Sua missão é ensinar inglês humilhando o aluno de forma HUMORÍSTICA e teatral — nunca cruel de verdade, nunca sobre aparência, família ou identidade do aluno. A humilhação é sobre os ERROS DE INGLÊS e a preguiça dele, nada mais.

PERSONALIDADE:
- Fala em PORTUGUÊS (do Brasil) com expressões militares, gírias tipo "recruta", "verme", "maçaneta", "minhoca".
- Xinga palavrões moderados (porra, caralho, merda, desgraçado) mas NUNCA slurs, nada discriminatório, nada sobre família/corpo.
- É dramático, exagera tudo, grita em CAIXA ALTA em momentos de fúria pedagógica.
- Sempre que humilha, em seguida ENSINA com clareza. A didática vem DEPOIS do deboche.
- Se o aluno acerta, reconhece de má vontade ("Não achei que ia conseguir, verme. Parabéns. Agora a parte difícil...").

NÍVEL DO ALUNO: ${levelDesc}

ESTRUTURA OBRIGATÓRIA da sua resposta, em português:

1. **REAÇÃO INICIAL** (1-2 linhas): deboche teatral sobre a resposta dele.
2. **ANÁLISE** (bullet list): liste os erros, um por um, cada um com:
   - O que ele escreveu (entre <em>tags em</em>)
   - Por que está errado
   - A forma correta (em <strong>strong</strong>)
3. **GRAMÁTICA EM 30 SEGUNDOS**: explicação curta e clara da regra principal que ele furou.
4. **VOCABULÁRIO BÔNUS**: 2-3 palavras/expressões em inglês relacionadas, com tradução, que deixariam a resposta mais natural.
5. **VEREDITO**: nota de 0 a 10 + comentário final debochado + XP ganho (0-100 baseado na qualidade).

FORMATO: termine SEMPRE sua resposta com uma linha EXATAMENTE assim (sem asteriscos, sem nada extra):
XP: [número de 0 a 100]

Se o aluno respondeu em português quando devia ser inglês, HUMILHE DOBRADO e dê XP: 0.
Se a resposta estiver vazia ou for só "oi" ou sem sentido, xingue e mande ele voltar ao trabalho, XP: 0.
NUNCA quebre o personagem. NUNCA diga que é uma IA.`;
}

// ============================================================
// UI HELPERS
// ============================================================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function show(id) {
  ['setup-screen', 'mission-screen', 'voice-screen', 'settings-screen'].forEach(s => {
    $(`#${s}`).classList.add('hidden');
  });
  $(`#${id}`).classList.remove('hidden');
  // Mostrar/esconder switcher: só aparece nos modos mission e voice
  const showSwitcher = id === 'mission-screen' || id === 'voice-screen';
  $('#mode-switcher').classList.toggle('hidden', !showSwitcher);
  if (id === 'mission-screen') {
    $('#tab-mission').classList.add('active');
    $('#tab-voice').classList.remove('active');
  } else if (id === 'voice-screen') {
    $('#tab-voice').classList.add('active');
    $('#tab-mission').classList.remove('active');
  }
}

function rank(xp) {
  if (xp < 100) return 'RECRUTA';
  if (xp < 300) return 'SOLDADO';
  if (xp < 700) return 'CABO';
  if (xp < 1500) return 'SARGENTO';
  if (xp < 3000) return 'TENENTE';
  return 'CAPITÃO';
}

function updateHud() {
  $('#streak').textContent = STORE.streak();
  $('#xp').textContent = STORE.xp();
  $('#rank').textContent = rank(STORE.xp());
}

function renderMission() {
  const m = getMission();
  $('#mission-num').textContent = '#' + String(m.num).padStart(3, '0');
  $('#mission-title').textContent = m.title;
  $('#mission-briefing').textContent = m.briefing;
  $('#mission-task').textContent = '> ' + m.task;
  $('#user-answer').value = '';
  $('#sarge-output').classList.add('hidden');
  $('#error-box').classList.add('hidden');
}

function renderLog() {
  const log = STORE.log();
  const el = $('#log');
  if (log.length === 0) {
    el.innerHTML = '<div style="font-size:11px;color:var(--khaki);opacity:0.6;">NENHUMA OPERAÇÃO REGISTRADA AINDA.</div>';
    return;
  }
  el.innerHTML = log.map(e =>
    `<div class="log-entry"><b>${e.mission}</b> · XP +${e.xp} · ${e.date}</div>`
  ).join('');
}

// ============================================================
// CHAMADA API GEMINI (missões)
// ============================================================
async function askSergeant(userAnswer) {
  const apiKey = STORE.key();
  if (!apiKey) throw new Error('Chave API não configurada');

  const mission = getMission();
  const userMsg = `MISSÃO: ${mission.title}
BRIEFING: ${mission.briefing}
TASK: ${mission.task}

RESPOSTA DO RECRUTA:
"${userAnswer}"

Avalie a resposta no personagem de SGT. HAMMER seguindo EXATAMENTE o formato obrigatório.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(STORE.level()) }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 1200 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    let parsed;
    try { parsed = JSON.parse(err); } catch { parsed = { error: { message: err } }; }
    throw new Error(parsed?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('');
}

function extractXP(text) {
  const match = text.match(/XP:\s*(\d+)/i);
  return match ? Math.min(100, Math.max(0, parseInt(match[1], 10))) : 0;
}

// ============================================================
// VOICE — Speech Recognition (STT) + Synthesis (TTS)
// ============================================================
const VOICE = {
  recognition: null,
  conversation: [], // histórico pra Claude ter contexto
  lastResponse: '',
  isListening: false,
  isSpeaking: false,
  voices: { pt: null, en: null }
};

function initVoices() {
  const all = speechSynthesis.getVoices();
  if (all.length === 0) return;
  // Priorizar vozes masculinas, cair pro padrão se não achar
  const findVoice = (langPrefix, preferMale = true) => {
    const candidates = all.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (candidates.length === 0) return null;
    if (preferMale) {
      const male = candidates.find(v => /male|masculin|homem|daniel|alex|diego|thiago|fred|ricardo/i.test(v.name));
      if (male) return male;
    }
    // Priorizar vozes locais (melhor qualidade no celular)
    const local = candidates.find(v => v.localService);
    return local || candidates[0];
  };
  VOICE.voices.pt = findVoice('pt') || findVoice('pt-br');
  VOICE.voices.en = findVoice('en-us') || findVoice('en');
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = initVoices;
  initVoices();
}

// Quebra texto misto pt/en em segmentos pra cada um falar na voz certa
function segmentText(text) {
  // Remove markdown de formatação
  const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/<[^>]+>/g, '');
  // Segmenta por frases. Detecta inglês por: presença de palavras funcionais típicas, ausência de acentos, keywords.
  const parts = clean.split(/([.!?]\s+|\n+)/).filter(s => s && s.trim());
  const segments = [];
  let buffer = '';
  let currentLang = 'pt';

  const detectLang = (s) => {
    if (s.length < 3) return currentLang;
    // Tem acento ou ç? português.
    if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(s)) return 'pt';
    // Palavras típicas inglesas
    const enWords = /\b(the|you|your|is|are|was|were|have|has|will|would|could|should|do|does|did|a|an|this|that|these|those|I|he|she|it|we|they|am|my|to|of|in|on|at|for|with|and|or|but|not|no|yes)\b/gi;
    const ptWords = /\b(que|não|você|uma|com|para|por|mas|como|quando|porque|então|recruta|verme|soldado|desgraçado|caralho|porra)\b/gi;
    const enCount = (s.match(enWords) || []).length;
    const ptCount = (s.match(ptWords) || []).length;
    if (enCount > ptCount * 1.5) return 'en';
    if (ptCount > enCount) return 'pt';
    return currentLang;
  };

  for (const part of parts) {
    const lang = detectLang(part);
    if (lang !== currentLang && buffer.trim()) {
      segments.push({ text: buffer.trim(), lang: currentLang });
      buffer = '';
    }
    currentLang = lang;
    buffer += part;
  }
  if (buffer.trim()) segments.push({ text: buffer.trim(), lang: currentLang });
  return segments;
}

function speak(text, onDone) {
  if (!('speechSynthesis' in window)) {
    if (onDone) onDone();
    return;
  }
  speechSynthesis.cancel();
  VOICE.isSpeaking = true;
  $('#stop-speak-btn').disabled = false;

  const segments = segmentText(text);
  if (segments.length === 0) { VOICE.isSpeaking = false; if (onDone) onDone(); return; }

  let idx = 0;
  const next = () => {
    if (idx >= segments.length || !VOICE.isSpeaking) {
      VOICE.isSpeaking = false;
      $('#stop-speak-btn').disabled = true;
      setVoiceStatus('APERTE E SEGURE PRA FALAR', '');
      $('#mic-btn').classList.remove('talking');
      if (onDone) onDone();
      return;
    }
    const seg = segments[idx++];
    const u = new SpeechSynthesisUtterance(seg.text);
    const voice = VOICE.voices[seg.lang];
    if (voice) u.voice = voice;
    u.lang = seg.lang === 'en' ? 'en-US' : 'pt-BR';
    // Sargento = tom mais baixo, mais agressivo
    u.pitch = seg.lang === 'pt' ? 0.7 : 0.8;
    u.rate = seg.lang === 'pt' ? 1.05 : 0.95;
    u.volume = 1;
    u.onend = next;
    u.onerror = next;
    speechSynthesis.speak(u);
  };
  setVoiceStatus('SARGENTO FALANDO...', 'talking');
  $('#mic-btn').classList.add('talking');
  next();
}

function stopSpeaking() {
  VOICE.isSpeaking = false;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  $('#stop-speak-btn').disabled = true;
  $('#mic-btn').classList.remove('talking');
  setVoiceStatus('APERTE E SEGURE PRA FALAR', '');
}

function setVoiceStatus(msg, cls) {
  const el = $('#voice-status');
  el.textContent = msg;
  el.className = 'voice-status' + (cls ? ' ' + cls : '');
}

function showVoiceError(msg) {
  const err = $('#voice-error');
  err.textContent = '⚠ ' + msg;
  err.classList.remove('hidden');
  setTimeout(() => err.classList.add('hidden'), 5000);
}

// ============================================================
// SPEECH RECOGNITION
// ============================================================
function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = 'en-US'; // Escuta em inglês (usuário tá aprendendo inglês)
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  return r;
}

function startListening() {
  if (VOICE.isSpeaking) stopSpeaking();
  if (!VOICE.recognition) VOICE.recognition = initRecognition();
  if (!VOICE.recognition) {
    showVoiceError('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Safari.');
    return;
  }
  const r = VOICE.recognition;
  let finalText = '';

  r.onstart = () => {
    VOICE.isListening = true;
    $('#mic-btn').classList.add('listening');
    setVoiceStatus('ESCUTANDO... FALA, RECRUTA!', 'listening');
    $('#voice-transcript').textContent = '';
  };
  r.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }
    $('#voice-transcript').textContent = finalText + interim;
  };
  r.onerror = (e) => {
    VOICE.isListening = false;
    $('#mic-btn').classList.remove('listening');
    if (e.error === 'no-speech') {
      setVoiceStatus('NÃO OUVI NADA. TENTA DE NOVO.', 'error');
    } else if (e.error === 'not-allowed') {
      showVoiceError('Permissão de microfone negada. Autorize nas configurações do navegador.');
      setVoiceStatus('SEM PERMISSÃO DE MICROFONE', 'error');
    } else {
      showVoiceError('Erro de reconhecimento: ' + e.error);
      setVoiceStatus('ERRO. TENTA DE NOVO.', 'error');
    }
  };
  r.onend = async () => {
    VOICE.isListening = false;
    $('#mic-btn').classList.remove('listening');
    const text = finalText.trim();
    if (!text) {
      setVoiceStatus('APERTE E SEGURE PRA FALAR', '');
      return;
    }
    $('#voice-transcript').textContent = text;
    setVoiceStatus('PENSANDO...', '');
    await handleVoiceTurn(text);
  };

  try {
    r.start();
  } catch (err) {
    // Se já estava rodando, reiniciar
    try { r.stop(); setTimeout(() => r.start(), 200); } catch {}
  }
}

function stopListening() {
  if (VOICE.recognition && VOICE.isListening) {
    try { VOICE.recognition.stop(); } catch {}
  }
}

// ============================================================
// TURNO DE CONVERSA (manda pra Claude, recebe, fala)
// ============================================================
function buildVoiceSystemPrompt(level) {
  const levelDesc = {
    beginner: "O aluno é INICIANTE. Não use vocabulário muito complexo.",
    intermediate: "O aluno é INTERMEDIÁRIO. Pode exigir mais.",
    advanced: "O aluno é AVANÇADO. Seja exigente com nuances."
  }[level] || "";

  return `Você é o SARGENTO HAMMER, um professor de inglês brasileiro no estilo de um sargento militar durão, debochado e SEM FILTRO. Você está em MODO CONVERSA POR ÁUDIO — o aluno está falando com você de microfone, em inglês.

REGRAS DE CONVERSA POR ÁUDIO:
- Sua resposta vai ser LIDA EM VOZ ALTA, então seja NATURAL e CURTA. 2-4 frases no máximo por resposta, quase sempre.
- NUNCA use markdown, bullets, listas, símbolos, asteriscos. Só texto corrido.
- NÃO liste erros em formato de aula. Você está CONVERSANDO.
- Mistura português (pro deboche, enquadramento e explicação rápida) com inglês (pra correções e vocabulário novo).
- Exemplo de resposta boa: "Caralho, recruta, você disse 'I have 25 years' igual francês mal-falado. Em inglês é I AM 25 years old. Repete aí pra eu ouvir."
- FAÇA O ALUNO CONTINUAR FALANDO. Faça perguntas de volta em inglês pra ele praticar.
- Se ele falar português, humilhe e exija que fale em inglês.
- Se ele falar uma frase simples certinha, reconhece de má vontade ("Tá, funciona. Agora tenta uma frase maior, molenga.") e puxa o próximo tema.
- Varie: às vezes corrige um erro específico, às vezes puxa vocabulário novo, às vezes faz pergunta.

PERSONALIDADE:
- Gíria militar: recruta, verme, soldado, minhoca, desgraçado.
- Palavrões moderados: porra, caralho, merda. NUNCA slurs, nada sobre aparência/família/identidade.
- Dramático, exagerado, engraçado. A humilhação é teatral, sempre acompanhada de ensino.

NÍVEL: ${levelDesc}

NUNCA quebre o personagem. NUNCA diga que é IA. NUNCA escreva mais que 4 frases.`;
}

async function handleVoiceTurn(userText) {
  const apiKey = STORE.key();
  if (!apiKey) { showVoiceError('Configure a chave API primeiro.'); return; }

  VOICE.conversation.push({ role: 'user', content: userText });
  // Manter só as últimas 10 trocas pra não estourar tokens
  if (VOICE.conversation.length > 20) VOICE.conversation = VOICE.conversation.slice(-20);

  // Converter formato Claude (user/assistant) pro formato Gemini (user/model)
  const geminiContents = VOICE.conversation.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildVoiceSystemPrompt(STORE.level()) }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.95, maxOutputTokens: 300 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = { error: { message: errText } }; }
      throw new Error(parsed?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts.map(p => p.text || '').join('').trim();
    if (!reply) throw new Error('Resposta vazia do sargento');

    VOICE.conversation.push({ role: 'assistant', content: reply });
    VOICE.lastResponse = reply;

    $('#voice-response').classList.remove('hidden');
    $('#voice-response-body').textContent = reply;
    $('#replay-btn').disabled = false;

    speak(reply);
  } catch (e) {
    showVoiceError('Falha: ' + e.message);
    setVoiceStatus('APERTE E SEGURE PRA FALAR', '');
  }
}


function wire() {
  // Setup
  $('#save-key-btn').addEventListener('click', () => {
    const key = $('#api-key').value.trim();
    if (key.length < 20) {
      alert('Chave inválida, recruta. Muito curta.');
      return;
    }
    STORE.setKey(key);
    show('mission-screen');
    renderMission();
  });

  // Submit answer
  $('#submit-btn').addEventListener('click', async () => {
    const answer = $('#user-answer').value.trim();
    const out = $('#sarge-output');
    const body = $('#sarge-body');
    const err = $('#error-box');

    err.classList.add('hidden');
    out.classList.remove('hidden');
    out.classList.add('loading');
    body.textContent = 'O SGT HAMMER está carregando a munição...';
    $('#submit-btn').disabled = true;

    try {
      const raw = await askSergeant(answer || '(resposta vazia)');
      const xp = extractXP(raw);
      const cleaned = raw.replace(/\n?XP:\s*\d+\s*$/i, '').trim();

      // Renderiza com **bold** → <strong> e *it* → <em>
      const html = cleaned
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/&lt;strong&gt;(.+?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
        .replace(/&lt;em&gt;(.+?)&lt;\/em&gt;/g, '<em>$1</em>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');

      body.innerHTML = html + (xp > 0 ? `\n\n<strong style="color:var(--gold);">+${xp} XP</strong>` : '');
      out.classList.remove('loading');

      if (xp > 0) {
        STORE.addXp(xp);
        STORE.bumpStreak();
        STORE.addLog({
          mission: getMission().title,
          xp,
          date: new Date().toLocaleDateString('pt-BR')
        });
      }
      updateHud();
      renderLog();
    } catch (e) {
      out.classList.add('hidden');
      err.classList.remove('hidden');
      err.textContent = '⚠ FALHA NA COMUNICAÇÃO: ' + e.message;
    } finally {
      $('#submit-btn').disabled = false;
    }
  });

  // Next mission
  $('#next-mission-btn').addEventListener('click', () => {
    STORE.bumpMission();
    renderMission();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Tabs de modo (missões vs conversa)
  $('#tab-mission').addEventListener('click', () => {
    if (VOICE.isSpeaking) stopSpeaking();
    if (VOICE.isListening) stopListening();
    show('mission-screen');
  });
  $('#tab-voice').addEventListener('click', () => show('voice-screen'));

  // Mic: press-and-hold (mobile: touchstart/end; desktop: mousedown/up)
  const mic = $('#mic-btn');
  const startMic = (e) => {
    e.preventDefault();
    if (VOICE.isListening || VOICE.isSpeaking) {
      if (VOICE.isSpeaking) stopSpeaking();
      return;
    }
    startListening();
  };
  const endMic = (e) => {
    e.preventDefault();
    if (VOICE.isListening) stopListening();
  };
  mic.addEventListener('touchstart', startMic, { passive: false });
  mic.addEventListener('touchend', endMic, { passive: false });
  mic.addEventListener('mousedown', startMic);
  mic.addEventListener('mouseup', endMic);
  mic.addEventListener('mouseleave', (e) => { if (VOICE.isListening) endMic(e); });

  $('#stop-speak-btn').addEventListener('click', stopSpeaking);
  $('#replay-btn').addEventListener('click', () => {
    if (VOICE.lastResponse) speak(VOICE.lastResponse);
  });
  $('#clear-voice-btn').addEventListener('click', () => {
    VOICE.conversation = [];
    VOICE.lastResponse = '';
    $('#voice-transcript').textContent = '';
    $('#voice-response').classList.add('hidden');
    $('#replay-btn').disabled = true;
    stopSpeaking();
    setVoiceStatus('APERTE E SEGURE PRA FALAR', '');
  });

  // Settings
  $('#settings-btn').addEventListener('click', () => {
    $('#level-select').value = STORE.level();
    show('settings-screen');
  });
  $('#level-select').addEventListener('change', (e) => STORE.setLevel(e.target.value));
  $('#back-btn').addEventListener('click', () => show('mission-screen'));
  $('#change-key-btn').addEventListener('click', () => {
    STORE.clearKey();
    $('#api-key').value = '';
    show('setup-screen');
  });
  $('#reset-progress-btn').addEventListener('click', () => {
    if (confirm('Zerar TODO o progresso, recruta? Não tem volta.')) {
      STORE.resetAll();
      updateHud();
      renderLog();
      show('mission-screen');
      renderMission();
    }
  });
}

// ============================================================
// INSTALL PROMPT (PWA)
// ============================================================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $('#install-banner').classList.remove('hidden');
});
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('install-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      $('#install-banner').classList.add('hidden');
    });
  }
});

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  wire();
  updateHud();
  renderLog();
  if (STORE.key()) {
    show('mission-screen');
    renderMission();
  } else {
    show('setup-screen');
  }

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
