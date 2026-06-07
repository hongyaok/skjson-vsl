const fs = require('fs');
const file = 'src/components/DecisionTreeVis.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\\`/g, '\`').replace(/\\\$\{/g, '${');
fs.writeFileSync(file, content);
