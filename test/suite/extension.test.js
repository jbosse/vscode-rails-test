const assert = require('assert');
const vscode = require('vscode');
const { runFile, runDescribe, runTest, command } = require("../../command");

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test("runFile will send the command to the terminal", () => {
    let actualCommand = "";
    const fakeTerminal = { sendText: function (cmd) { actualCommand = cmd; } };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };

    runFile(fakeTerminal, fakeDocument);

    assert.strictEqual("bin/rails test my_file_name.something", actualCommand);
  });

  test("runDescribe will send the command to the terminal", () => {
    const index = Math.floor((Math.random() * 10) + 1);
    let actualCommand = "";
    const fakeTerminal = { sendText: function (cmd) { actualCommand = cmd; } };
    const fakeDocument = {
      lineAt: function (idx) {
        if (idx == index) {
          return { text: "     describe \"some rando'm test 122\" do         " };
        }
        return "";
      },
      fileName: `${vscode.workspace.rootPath}/my_file_name.something`
    };

    runDescribe(fakeTerminal, index, fakeDocument);

    assert.strictEqual("bin/rails test my_file_name.something --name /some.rando.m.test..../", actualCommand);
  });

  test("runTest will send the command to the terminal", () => {
    const index = Math.floor((Math.random() * 10) + 1);
    let actualCommand = "";
    const fakeTerminal = { sendText: function (cmd) { actualCommand = cmd; } };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };

    runTest(fakeTerminal, index, fakeDocument);

    assert.strictEqual(`bin/rails test my_file_name.something:${index + 1}`, actualCommand);
  });

  test("command will create a terminal when none exists", () => {
    let terminalName = "";
    let sendTexts = [];
    let showCalled = false;
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      show: function () { showCalled = true; },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };
    vscode.window = {
      terminals: [],
      createTerminal: function (name) {
        terminalName = name;
        return fakeTerminal;
      }
    };

    command("", index, fakeDocument);

    assert.strictEqual(`Rails Tests`, terminalName);
    assert.strictEqual(true, showCalled);
    assert.strictEqual("clear", sendTexts[0]);
  });

  test("command will use existing terminal", () => {
    let terminalName = "";
    let sendTexts = [];
    let showCalled = false;
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      name: "Rails Tests",
      show: function () { showCalled = true; },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };
    vscode.window = {
      terminals: [fakeTerminal],
      createTerminal: function (name) {
        terminalName = name;
        return null;
      }
    };

    command("", index, fakeDocument);

    assert.strictEqual("", terminalName);
    assert.strictEqual(true, showCalled);
    assert.strictEqual("clear", sendTexts[0]);
  });

  test("will run for the file", () => {
    let sendTexts = [];
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      name: "Rails Tests",
      show: function () { /*noop*/ },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };
    vscode.window = { terminals: [fakeTerminal] };

    command("file", index, fakeDocument);

    assert.strictEqual("bin/rails test my_file_name.something", sendTexts[1]);
  });

  test("will run for the describe", () => {
    let sendTexts = [];
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      name: "Rails Tests",
      show: function () { /*noop*/ },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = {
      lineAt: function (idx) {
        if (idx == index) {
          return { text: "     describe \"some rando'm test 122\" do         " };
        }
        return "";
      },
      fileName: `${vscode.workspace.rootPath}/my_file_name.something`
    }
    vscode.window = { terminals: [fakeTerminal] };

    command("describe", index, fakeDocument);

    assert.strictEqual("bin/rails test my_file_name.something --name /some.rando.m.test..../", sendTexts[1]);
  });

  test("will run for the test", () => {
    let sendTexts = [];
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      name: "Rails Tests",
      show: function () { /*noop*/ },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };
    vscode.window = { terminals: [fakeTerminal] };

    command("test", index, fakeDocument);

    assert.strictEqual(`bin/rails test my_file_name.something:${index + 1}`, sendTexts[1]);
  });

  test("will run for the it", () => {
    let sendTexts = [];
    const index = Math.floor((Math.random() * 10) + 1);
    const fakeTerminal = {
      name: "Rails Tests",
      show: function () { /*noop*/ },
      sendText: function (cmd) { sendTexts.push(cmd); }
    };
    const fakeDocument = { fileName: `${vscode.workspace.rootPath}/my_file_name.something` };
    vscode.window = { terminals: [fakeTerminal] };

    command("it", index, fakeDocument);

    assert.strictEqual(`bin/rails test my_file_name.something:${index + 1}`, sendTexts[1]);
  });
});
