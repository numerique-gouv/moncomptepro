# @gouvfr-lasuite/moncomptepro.core

## 0.3.3

### Patch Changes

- [#964](https://github.com/numerique-gouv/proconnect-identite/pull/964) [`eb63af3`](https://github.com/numerique-gouv/proconnect-identite/commit/eb63af3bf33139adece820c1cfadf3ee387713f1) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🧑‍💻 Ajout du package @gouvfr-lasuite/proconnect.devtools.typescript

  Partage de la configuration de TypeScript entre les packages.

## 0.3.2

### Patch Changes

- [#934](https://github.com/numerique-gouv/proconnect-identite/pull/934) [`78ba52f`](https://github.com/numerique-gouv/proconnect-identite/commit/78ba52f246fbb54e7b778347d47b9e05a55f6a71) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 📦️ Ajout du champs typesVersions dans le package.json

  Bien que [le champ `exports` est prioritaire sur typesVersions dans les version TypeScript >=4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#exports-is-prioritized-over-typesversions), pour PCF, il est nécessaire de le spécifier pour rendre Jest heureux...

## 0.3.1

### Patch Changes

- [#931](https://github.com/numerique-gouv/proconnect-identite/pull/931) [`9e2f382`](https://github.com/numerique-gouv/proconnect-identite/commit/9e2f382a896330868e91f18c14978874e78691a9) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 📦️ Publication d'une version cjs du core

## 0.3.0

### Minor Changes

- [#911](https://github.com/numerique-gouv/proconnect-identite/pull/911) [`c406e75`](https://github.com/numerique-gouv/proconnect-identite/commit/c406e7528fd74ee7efc49fb3dca7ddfa7cf32ddd) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 👮 Accueillons l'équipe de sécurité de ProConnect

  Dans le cadres la migration du script d'import de comptes coop, une partie des fonctions de validation sont déplacées dans le package `@gouvfr-lasuite/proconnect.core/security` pour permettre leur réutilisation dans Hyyypertool.

### Patch Changes

- [#909](https://github.com/numerique-gouv/proconnect-identite/pull/909) [`eaa069d`](https://github.com/numerique-gouv/proconnect-identite/commit/eaa069dc8a19134bd2b30ba1a4c451dc6d13f2ec) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ restriction des exports de fichier

  Seul les index peuvent être importé. Cela permet de réduire les confusions d'auto-import dans la majorité des IDEs.

- [#879](https://github.com/numerique-gouv/proconnect-identite/pull/879) [`7a1aca3`](https://github.com/numerique-gouv/proconnect-identite/commit/7a1aca395ed260ad77bd764e160eda48a66c54f9) Thanks [@douglasduteil](https://github.com/douglasduteil)! - :recycle: force la compatibilité avec Node.js

## 0.2.0

### Minor Changes

- [#871](https://github.com/numerique-gouv/proconnect-identite/pull/871) [`ea29c8d`](https://github.com/numerique-gouv/proconnect-identite/commit/ea29c8d6f5f63d7affef692470e9ac03763d0835) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🚚 Renommage des paquets en ProConnect

## 0.1.0

### Minor Changes

- [#861](https://github.com/numerique-gouv/proconnect-identite/pull/861) [`f00ff7b`](https://github.com/numerique-gouv/proconnect-identite/commit/f00ff7bed2d79f53712793c98f3a171d2a666748) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ✨ Ajout du service de suggestion

## 0.0.3

### Patch Changes

- [#852](https://github.com/numerique-gouv/proconnect-identite/pull/852) [`e8eddc8`](https://github.com/numerique-gouv/proconnect-identite/commit/e8eddc802ed0fc56ecf127aa76730cc9bdb51089) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Correction de bugs et amélioration des performances

## 0.0.2

### Patch Changes

- [#849](https://github.com/numerique-gouv/proconnect-identite/pull/849) [`6af924b`](https://github.com/numerique-gouv/proconnect-identite/commit/6af924bec7a5fa74cfc07adcdc6eda7ac725ba0e) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ouverture du coeur

## 0.0.1

### Patch Changes

- [#847](https://github.com/numerique-gouv/proconnect-identite/pull/847) [`8e9e944`](https://github.com/numerique-gouv/proconnect-identite/commit/8e9e944e99ae27b5f5fbb225885826a2e933d076) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Premier publication du coeur du system
