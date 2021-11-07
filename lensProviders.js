const vscode = require("vscode");

const docSelector = {
  language: "ruby",
  scheme: "file"
};

const findTests = function (document, kind) {
  const testRegex = new RegExp(`\\b${kind}\\b\\s+.(.*).\\s+\\bdo\\b`);
  const tests = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const match = line.text.match(testRegex);
    if (match) {
      const start = line.text.indexOf(kind);
      tests.push({ line: i, range: new vscode.Range(i, start, i, line.text.length) });
    }
  }
  return tests;
}

const buildProvider = function (title, kind) {
  return vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        const describes = findTests(document, kind);
        let lenses = describes.map((describe) => {
          return new vscode.CodeLens(describe.range, { command: "rails.lens.test.run", title: title, arguments: [kind, describe.line, document] });
        });
        return lenses;
      }
    }
  );
}

const fileLensProvider = function () {
  return vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        let topOfDocument = new vscode.Range(0, 0, 0, 0);
        return [new vscode.CodeLens(topOfDocument, { command: "rails.lens.test.run", title: "Run tests", arguments: ["file", 0, document] })];
      }
    }
  );
};

const describeLensProvider = function () { return buildProvider("Run tests", "describe"); };
const testLensProvider = function () { return buildProvider("Run test", "test"); };
const itLensProvider = function () { return buildProvider("Run test", "it"); };

module.exports = { findTests, fileLensProvider, describeLensProvider, testLensProvider, itLensProvider };
