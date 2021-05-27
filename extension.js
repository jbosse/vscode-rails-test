const vscode = require("vscode");

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

function findIts(document) {
  const its = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const index = line.text.indexOf("it");
    if (index >= 0) {
      its.push({
        line: i,
        range: new vscode.Range(i, index, i, line.text.length)
      });
    }
  }
  return its;

}

function runFile(terminal, _index, document) {
  console.log(document);
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const command = `bin/rails test ${path}`;
  terminal.sendText(command);
}

function runDescribe(terminal, index, document) {
  const line = document.lineAt(index);
  const describeRegex = /\s*describe\s+.(.*).\s+do/;
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const testName = line.text.match(describeRegex)[1];
  const testRegex = testName.replace(/[^a-zA-Z]/g, ".");
  const command = `bin/rails test ${path} --name /${testRegex}/`;
  terminal.sendText(command);
}

function runTest(terminal, index, document) {
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const command = `bin/rails test ${path}:${index + 1}`;
  terminal.sendText(command);
}

function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "rails-tests" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("rails.lens.test.run", function (type, index, document) {
    // `bin/rails -t test/controllers/my_controller_test.rb -n /my\ test\ description/`
    const railsTestsTerminal =
      vscode.window.terminals.find((terminal) => terminal.name == "Rails Tests") ||
      vscode.window.createTerminal("Rails Tests");

    railsTestsTerminal.show();
    railsTestsTerminal.sendText("clear");
    if (type === "file") {
      runFile(railsTestsTerminal, index, document);
    }
    if (type === "describe") {
      runDescribe(railsTestsTerminal, index, document);
    }
    if (type === "it" || type === "test") {
      runTest(railsTestsTerminal, index, document);
    }
  });

  let docSelector = {
    language: "ruby",
    scheme: "file"
  };

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

  context.subscriptions.push(disposable);
  context.subscriptions.push(fileLensProvider);
  context.subscriptions.push(describeLensProvider);
  context.subscriptions.push(testLensProvider);
  context.subscriptions.push(itLensProvider);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
