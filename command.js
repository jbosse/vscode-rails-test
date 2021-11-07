const vscode = require("vscode");

const runFile = function (terminal, document) {
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const command = `bin/rails test ${path}`;
  terminal.sendText(command);
}

const runDescribe = function (terminal, index, document) {
  const line = document.lineAt(index);
  const describeRegex = /\s*describe\s+.(.*).\s+do/;
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const testName = line.text.match(describeRegex)[1];
  const testRegex = testName.replace(/[^a-zA-Z]/g, ".");
  const command = `bin/rails test ${path} --name /${testRegex}/`;
  terminal.sendText(command);
}

const runTest = function (terminal, index, document) {
  const path = document.fileName.replace(`${vscode.workspace.rootPath}/`, "");
  const command = `bin/rails test ${path}:${index + 1}`;
  terminal.sendText(command);
}

const command = function (type, index, document) {
  const railsTestsTerminal =
    vscode.window.terminals.find((terminal) => { return terminal.name === "Rails Tests"; }) ||
    vscode.window.createTerminal("Rails Tests");

  railsTestsTerminal.show();
  railsTestsTerminal.sendText("clear");
  if (type === "file") {
    runFile(railsTestsTerminal, document);
  }
  if (type === "describe") {
    runDescribe(railsTestsTerminal, index, document);
  }
  if (type === "it" || type === "test") {
    runTest(railsTestsTerminal, index, document);
  }
};

module.exports = { runFile, runDescribe, runTest, command };
