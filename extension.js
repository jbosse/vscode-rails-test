const vscode = require("vscode");
const { command } = require("./command");
const { fileLensProvider, describeLensProvider, testLensProvider, itLensProvider } = require("./lensProviders");

function activate(context) {
  let cmd = vscode.commands.registerCommand("rails.lens.test.run", command);
  context.subscriptions.push(cmd);
  context.subscriptions.push(fileLensProvider());
  context.subscriptions.push(describeLensProvider());
  context.subscriptions.push(testLensProvider());
  context.subscriptions.push(itLensProvider());
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
