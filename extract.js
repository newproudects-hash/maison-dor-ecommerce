const fs = require('fs');
const html = fs.readFileSync('C:/Users/SHBA7x/.gemini/antigravity-ide/brain/5ba2321d-bff9-4ceb-801f-17812ae3ef2e/.system_generated/steps/2745/content.md', 'utf8');
const scriptMatch = html.match(/<script id="__REMIX_CONTEXT[^>]*>(.*?)<\/script>/s) || html.match(/<script type="application\/json".*?>(.*?)<\/script>/s) || html.match(/window\.__remixContext = (.*?);<\/script>/s);

if (scriptMatch) {
    try {
        const data = JSON.parse(scriptMatch[1]);
        fs.writeFileSync('remix.json', JSON.stringify(data, null, 2));
        console.log('Saved to remix.json');
    } catch(e) {
        console.log('Failed to parse:', e.message);
    }
} else {
    console.log('No remix context found');
}
