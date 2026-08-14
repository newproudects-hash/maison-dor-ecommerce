const fs = require('fs');
const html = fs.readFileSync('C:/Users/SHBA7x/.gemini/antigravity-ide/brain/5ba2321d-bff9-4ceb-801f-17812ae3ef2e/.system_generated/steps/2745/content.md', 'utf8');

let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '\n');
clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '\n');
clean = clean.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '\n');
clean = clean.replace(/<[^>]+>/g, '\n');
clean = clean.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
clean = clean.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n\n');

fs.writeFileSync('chat_extracted.txt', clean, 'utf8');
console.log('Saved to chat_extracted.txt');
