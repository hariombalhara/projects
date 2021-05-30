import frameworkInfo from "@netlify/framework-info";
import stc from "string-to-color";
import fs from "fs";
import path from "path";
import process from "process";
const frameworks = await frameworkInfo.listFrameworks();

function log(...params) {
  console.log.apply(console, params);
}

let badges = frameworks.map((framework) => {
  let badgeImageUrl = `https://img.shields.io/static/v1?label=${
    framework.category
  }&message=${framework.name}&color=${stc(framework.name)}`;
  log("Framework Found:", framework.name);
  // TODO: Add Project URL support as well.
  return {
    url: `<a><img alt="${framework.name}" src="${badgeImageUrl}"/></a>`,
    name: framework.name,
    label: framework.category,
  };
});

if (!badges.length) {
    log('No Framework Found.')
    process.exit(0)
}

let readmeFileContent = "";
try {
  readmeFileContent = fs.readFileSync(path.join(process.cwd(), "README.md"));
} catch (e) {}

badges = badges.filter(function (badge) {
  const isFrameworkBadgeAlreadyThere = readmeFileContent.includes(badge.url);
  if (isFrameworkBadgeAlreadyThere) {
    log("Skipping Adding Badge for", badge.name);
  }
  return !isFrameworkBadgeAlreadyThere;
});

if (badges.length) {
  readmeFileContent = badges.map((badge)=>{return badge.url}).join("\n") + "\n" + readmeFileContent;
}

fs.writeFileSync(path.join(process.cwd(), "README.md"), readmeFileContent);
