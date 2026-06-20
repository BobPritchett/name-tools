const fs = require("fs");
const path = require("path");

const copy = (src, dest) => {
    const srcPath = path.resolve(__dirname, "..", src);
    const destPath = path.resolve(__dirname, "..", dest);
    fs.copyFileSync(srcPath, destPath);
};

const remove = (target) => {
    const targetPath = path.resolve(__dirname, "..", target);
    if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
    }
};

copy("docs/docs-entry.mjs", "docs/name-tools.js");
remove("docs/docs-entry.mjs");
copy("src/data/examples.json", "docs/examples.json");
