const vscode = require("vscode");
const { command } = require("./command");

//#region
function findTests(document, kind) {
  const testRegex = new RegExp(`\\s*${kind}\\s+.(.*).\\s+do`);
  const tests = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const match = line.text.match(testRegex);
    if (match) {
      const start = line.text.indexOf(kind);
      tests.push({
        line: i,
        range: new vscode.Range(i, start, i, line.text.length)
      });
    }
  }
  return tests;
}
//#endregion
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "rails-tests" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("rails.lens.test.run", command);

  context.subscriptions.push(disposable);

  let docSelector = {
    language: "ruby",
    scheme: "file"
  };

  //#region
  // Register our CodeLens provider
  let fileLensProvider = vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        let topOfDocument = new vscode.Range(0, 0, 0, 0);
        return [new vscode.CodeLens(topOfDocument, { command: "rails.lens.test.run", title: "Run tests", arguments: ["file", 0, document] })];
      }
    }
  );

  // Register our CodeLens provider
  let describeLensProvider = vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        const describes = findTests(document, "describe");
        let lenses = describes.map((describe) => {
          return new vscode.CodeLens(describe.range, { command: "rails.lens.test.run", title: "Run tests", arguments: ["describe", describe.line, document] });
        });
        return lenses;
      }
    }
  );

  // Register our CodeLens provider
  let testLensProvider = vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        const describes = findTests(document, "test");
        let lenses = describes.map((describe) => {
          return new vscode.CodeLens(describe.range, { command: "rails.lens.test.run", title: "Run test", arguments: ["test", describe.line, document] });
        });
        return lenses;
      }
    }
  );

  // Register our CodeLens provider
  let itLensProvider = vscode.languages.registerCodeLensProvider(
    docSelector,
    {
      async provideCodeLenses(document) {
        const describes = findTests(document, "it");
        let lenses = describes.map((describe) => {
          return new vscode.CodeLens(describe.range, { command: "rails.lens.test.run", title: "Run test", arguments: ["it", describe.line, document] });
        });
        return lenses;
      }
    }
  );


  context.subscriptions.push(fileLensProvider);
  context.subscriptions.push(describeLensProvider);
  context.subscriptions.push(testLensProvider);
  context.subscriptions.push(itLensProvider);
  //#endregion
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
