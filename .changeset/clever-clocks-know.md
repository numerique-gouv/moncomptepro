---
"@gouvfr-lasuite/proconnect.core": patch
---

📦️ Ajout du champs typesVersions dans le package.json

Bien que [le champ `exports` est prioritaire sur typesVersions dans les version TypeScript >=4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#exports-is-prioritized-over-typesversions), pour PCF, il est nécessaire de le spécifier pour rendre Jest heureux...
