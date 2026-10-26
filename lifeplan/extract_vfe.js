const fs = require('fs');
const content = fs.readFileSync('C:/Users/poom/.gemini/antigravity/brain/50794592-a95f-40f1-b032-fbf1deb5e2c5/.system_generated/steps/588/content.md', 'utf8');
const regex = /https?:\/\/[^\s"'<>]+\.(?:json|lottie|mp4|gif|png|webp)/gi;
const matches = Array.from(new Set(content.match(regex) || []));
console.log('Found media URLs:', matches.length);
matches.slice(0, 30).forEach(m => console.log(m));
