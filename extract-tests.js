const fs = require("fs");
const path = require("path");

let output = "";
function findTests(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findTests(fullPath);
        } else if (
            fullPath.endsWith(".test.ts") ||
            fullPath.endsWith(".test.tsx")
        ) {
            const content = fs.readFileSync(fullPath, "utf8");
            const matches = content.matchAll(
                /(?:it|test)\(\s*["'`](.*?)["'`]/g,
            );
            for (const match of matches) {
                output += `[${path.basename(fullPath)}] ${match[1]}\n`;
            }
        }
    }
}

findTests("frontend-next/src");
fs.writeFileSync("extracted_tests_utf8.txt", output, "utf8");
