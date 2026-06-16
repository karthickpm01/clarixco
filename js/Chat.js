// Clarix Co — Netlify Serverless Function
// Uses Google Gemini API (free tier)

const SYSTEM = `You are the Clarix Co AI assistant — a helpful, friendly and professional assistant for Clarix Co Ltd, a full-stack technology studio based in London, UK.

About Clarix Co:
- Founded by Karthick P M — Founder & CEO
- Karthick has a UK Master's degree and real UK experience
- Services: Web Development, Data Analytics, AI Solutions
- Based in London, UK — serving UK, India, USA and worldwide
- Registered company in England & Wales

Services offered:
1. Web Development — full-stack websites, e-commerce, SaaS, portals. Built from scratch, no templates.
2. Data Analytics — Power BI dashboards, Python pipelines, SQL databases, Excel models, data storytelling
3. AI Solutions — custom chatbots, LLM integrations, automation with n8n, voice agents

Tech stack: HTML5, CSS3, JavaScript, React, Python, Supabase, PostgreSQL, Power BI, Excel, Gemini AI, OpenAI API, n8n, Netlify, Vercel, Redis, Twilio

Real projects:
- JobHunt AI — live AI SaaS at job-hunt-ai.netlify.app
- Build Planet Zero — net-zero construction company, Newcastle UK, with AI chatbot
- London Success Academy — business coaching platform, London UK
- EstateX — UK real estate platform, 70+ properties
- Lumière Beauty — luxury e-commerce, 40+ SKUs
- MediCore — healthcare platform, WCAG 2.1 AA
- NicheFlow AI — AI content idea generator (coming soon)

Contact:
- Email: hello@clarixco.co.uk
- Book a free 30-min call: calendly.com/varuv4672/30min
- Response time: within 24 hours

Rules:
- Be friendly, warm and concise (2-4 sentences max)
- Always end with a question or call to action
- For pricing: say it depends on scope, suggest a free call
- Never make up facts
- Always encourage booking a call or emailing`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    // Build Gemini contents array
    // Prepend system message as first user turn
    const contents = [];

    // Add system context as first exchange
    contents.push({
      role: 'user',
      parts: [{ text: `[SYSTEM CONTEXT - follow these instructions always]: ${SYSTEM}\n\nHello!` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Hi! I'm the Clarix Co AI assistant 👋 How can I help you today?" }]
    });

    // Add conversation history
    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "I'm having a moment — please email hello@clarixco.co.uk and Karthick will get back to you within 24 hours!";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Function error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        reply: "Sorry, I'm having a connection issue right now. Please email hello@clarixco.co.uk or book a free call at calendly.com/varuv4672/30min — Karthick replies within 24 hours!"
      })
    };
  }
}// Clarix Co — Netlify Serverless Function
// Uses Google Gemini API (free tier)

const SYSTEM = `You are the Clarix Co AI assistant — a helpful, friendly and professional assistant for Clarix Co Ltd, a full-stack technology studio based in London, UK.

About Clarix Co:
- Founded by Karthick P M — Founder & CEO
- Karthick has a UK Master's degree and real UK experience
- Services: Web Development, Data Analytics, AI Solutions
- Based in London, UK — serving UK, India, USA and worldwide
- Registered company in England & Wales

Services offered:
1. Web Development — full-stack websites, e-commerce, SaaS, portals. Built from scratch, no templates.
2. Data Analytics — Power BI dashboards, Python pipelines, SQL databases, Excel models, data storytelling
3. AI Solutions — custom chatbots, LLM integrations, automation with n8n, voice agents

Tech stack: HTML5, CSS3, JavaScript, React, Python, Supabase, PostgreSQL, Power BI, Excel, Gemini AI, OpenAI API, n8n, Netlify, Vercel, Redis, Twilio

Real projects:
- JobHunt AI — live AI SaaS at job-hunt-ai.netlify.app
- Build Planet Zero — net-zero construction company, Newcastle UK, with AI chatbot
- London Success Academy — business coaching platform, London UK
- EstateX — UK real estate platform, 70+ properties
- Lumière Beauty — luxury e-commerce, 40+ SKUs
- MediCore — healthcare platform, WCAG 2.1 AA
- NicheFlow AI — AI content idea generator (coming soon)

Contact:
- Email: hello@clarixco.co.uk
- Book a free 30-min call: calendly.com/varuv4672/30min
- Response time: within 24 hours

Rules:
- Be friendly and warm
- CRITICAL: always write COMPLETE sentences — never stop mid-sentence
- Keep to 2-3 short sentences maximum per response
- Always end with a question or call to action
- For pricing: say it depends on scope, suggest a free call
- Never make up facts
- Always encourage booking a call or emailing`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    // Build Gemini contents array
    // Prepend system message as first user turn
    const contents = [];

    // Add system context as first exchange
    contents.push({
      role: 'user',
      parts: [{ text: `[SYSTEM CONTEXT - follow these instructions always]: ${SYSTEM}\n\nHello!` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Hi! I'm the Clarix Co AI assistant 👋 How can I help you today?" }]
    });

    // Add conversation history
    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "I'm having a moment — please email hello@clarixco.co.uk and Karthick will get back to you within 24 hours!";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Function error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        reply: "Sorry, I'm having a connection issue right now. Please email hello@clarixco.co.uk or book a free call at calendly.com/varuv4672/30min — Karthick replies within 24 hours!"
      })
    };
  }
};