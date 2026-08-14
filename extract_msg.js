const fs = require('fs');
const data = JSON.parse(fs.readFileSync('remix.json', 'utf8'));

let messages = [];

// Recursive function to find message objects
function findMessages(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (obj.message && obj.message.content && obj.message.content.parts) {
        messages.push({
            role: obj.message.author?.role || 'unknown',
            text: obj.message.content.parts.join('\n')
        });
    } else if (obj.message && obj.message.text) {
        messages.push({
            role: obj.message.author?.role || 'unknown',
            text: obj.message.text
        });
    }
    
    for (let key in obj) {
        findMessages(obj[key]);
    }
}

findMessages(data);

// Formatting for the user
if (messages.length === 0) {
    console.log('No messages found');
} else {
    // There are usually duplicate node references in the remix context, let's deduplicate
    const unique = [];
    const seen = new Set();
    messages.forEach(m => {
        if (!seen.has(m.text)) {
            seen.add(m.text);
            unique.push(m);
        }
    });

    let output = '';
    unique.forEach(m => {
        const roleStr = m.role === 'user' ? 'User:' : (m.role === 'assistant' ? 'ChatGPT:' : m.role + ':');
        output += roleStr + '\n' + m.text + '\n\n-----------------\n\n';
    });
    fs.writeFileSync('?????? 02.md', output, 'utf8');
    console.log('Conversation saved to ?????? 02.md (' + unique.length + ' messages)');
}
