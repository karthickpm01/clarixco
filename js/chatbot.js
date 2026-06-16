/* ============================================
   CLARIX CO — AI CHATBOT
   Local: calls Gemini directly (dev only)
   Production: calls /.netlify/functions/chat
   ============================================ */

const SYSTEM = `You are the Clarix Co AI assistant — friendly, professional, concise.

About Clarix Co Ltd:
- Founder & CEO: Karthick P M — UK Masters graduate, real UK experience
- Services: Web Development, Data Analytics, AI Solutions
- Location: London, UK — serving UK, India, USA worldwide

Services:
1. Web Development — full-stack websites, e-commerce, SaaS, portals, no templates
2. Data Analytics — Power BI dashboards, Python, SQL, Excel, data storytelling
3. AI Solutions — chatbots, LLM integrations, n8n automation, voice agents
4. App Development — coming soon: iOS, Android, React Native, Flutter

Projects built:
- JobHunt AI — live at job-hunt-ai.netlify.app (AI cover letters, resume tailoring)
- Build Planet Zero — Newcastle UK, net-zero construction, AI chatbot
- London Success Academy — London, business coaching platform
- EstateX — UK real estate platform, 70+ properties
- Lumiere Beauty — luxury e-commerce, 40+ SKUs
- MediCore — healthcare platform
- NicheFlow AI — Instagram content AI (coming soon)

Contact: hello@clarixco.co.uk | Book free call: calendly.com/varuv4672/30min

RULES — follow strictly:
1. Write COMPLETE sentences only — never cut off mid-sentence
2. Maximum 2-3 sentences per response
3. Always end with a short question or CTA
4. Pricing: say depends on scope, offer free call
5. Never invent facts`;

// ─── CONFIG ───────────────────────────────

const IS_LOCAL = window.location.hostname === '127.0.0.1'
              || window.location.hostname === 'localhost';
// ──────────────────────────────────────────

const SUGGESTIONS = [
  "What services do you offer?",
  "Can I see your work?",
  "How much does a website cost?",
  "Book a free call"
];

let messages = [];
let isTyping = false;
let lastRequestTime = 0;
const MIN_INTERVAL = 3000; // 3s between requests to avoid rate limits

function initChat() {
  const toggle  = document.getElementById('chatToggle');
  const win     = document.getElementById('chatWindow');
  const closeBtn= document.getElementById('chatClose');
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const body    = document.getElementById('chatBody');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open') && messages.length === 0) {
      addBotMessage("Hi! I'm the Clarix Co AI assistant 👋 I can tell you about our services, projects or help you get started. What are you looking for?", true);
    }
  });

  closeBtn.addEventListener('click', () => win.classList.remove('open'));
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });

  function handleSend() {
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    sendMessage(text);
  }

  function sendMessage(text) {
    addUserMessage(text);
    messages.push({ role: 'user', content: text });
    // Keep last 6 messages only
    if (messages.length > 6) messages = messages.slice(-6);
    getResponse();
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--user';
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(text, withSuggestions = false) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot';
    div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    body.appendChild(div);

    if (withSuggestions) {
      const sugDiv = document.createElement('div');
      sugDiv.className = 'chat-suggestions';
      SUGGESTIONS.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'chat-suggestion';
        btn.textContent = s;
        btn.onclick = () => {
          sugDiv.remove();
          sendMessage(s);
        };
        sugDiv.appendChild(btn);
      });
      body.appendChild(sugDiv);
    }

    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--typing';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  async function getResponse() {
    // Throttle: wait if last request was too recent
    const now = Date.now();
    const wait = MIN_INTERVAL - (now - lastRequestTime);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastRequestTime = Date.now();

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      let reply;

      if (IS_LOCAL && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        reply = await callGemini();
      } else if (!IS_LOCAL) {
        reply = await callNetlify();
      } else {
        reply = "I'm in local dev mode 🛠️ On the live site I'll be fully working! Email hello@clarixco.co.uk in the meantime 👋";
      }

      hideTyping();
      addBotMessage(reply);
      messages.push({ role: 'assistant', content: reply });

    } catch (err) {
      console.error('Chat error:', err.message);
      hideTyping();
      addBotMessage("I'm getting a lot of questions right now! 😊 Please email hello@clarixco.co.uk or book a free call at calendly.com/varuv4672/30min — Karthick replies within 24 hours.");
    }

    isTyping = false;
    sendBtn.disabled = false;
  }

  async function callGemini(attempt = 0) {
    const contents = [
      { role: 'user', parts: [{ text: `[System]: ${SYSTEM}\n\nHello!` }] },
      { role: 'model', parts: [{ text: "Hi! I'm the Clarix Co AI assistant 👋" }] },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
        })
      }
    );

    const data = await res.json();

    // Rate limited — retry once after 4 seconds
    if (res.status === 429 && attempt < 2) {
      await new Promise(r => setTimeout(r, 4000));
      return callGemini(attempt + 1);
    }

    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

    return data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Let me connect you with Karthick directly — email hello@clarixco.co.uk!";
  }

  async function callNetlify() {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error(`Function error: ${res.status}`);
    const data = await res.json();
    return data.reply;
  }
}

document.addEventListener('DOMContentLoaded', initChat);