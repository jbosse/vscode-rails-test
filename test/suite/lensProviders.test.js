const assert = require('assert');
const vscode = require('vscode');
const { fileLensProvider, describeLensProvider, testLensProvider, itLensProvider } = require("../../lensProviders");

const origCodeLens = vscode.CodeLens;
const origLanguages = vscode.languages;

const assertRange = function (expected, actual) {
  assert.strictEqual(expected[0], actual.start.line);
  assert.strictEqual(expected[1], actual.start.character);
  assert.strictEqual(expected[2], actual.end.line);
  assert.strictEqual(expected[3], actual.end.character);
};

const assertDefinition = function (command, title, kind, line, document, lens) {
  assert.strictEqual(command, lens.definition.command);
  assert.strictEqual(title, lens.definition.title);
  assert.strictEqual(kind, lens.definition.arguments[0]);
  assert.strictEqual(line, lens.definition.arguments[1]);
  assert.strictEqual(document, lens.definition.arguments[2]);
};

suite('Lens Providers Test Suite', () => {
  const fakeDocument = {
    lineCount: 5,
    lineAt: function (i) {
      if (i === 0) { return { text: `    match_this "test name" do ` }; }
      if (i === 1) { return { text: `    dont_match_this "other test name" do ` }; }
      if (i === 2) { return { text: `  match_this "second test" do ` }; }
      if (i === 3) { return { text: `    # pretend comment line ` }; }
      if (i === 4) { return { text: `    match_this just kidding ` }; }
    }
  };

  const fakeTestDocument = {
    lineCount: 6,
    lineAt: function (i) {
      if (i === 0) { return { text: ` describe "first describe matcb" do` }; }
      if (i === 1) { return { text: ` test "first test match" do` }; }
      if (i === 2) { return { text: ` it "first it match" do` }; }
      if (i === 3) { return { text: `   describe "second describe match" do` }; }
      if (i === 4) { return { text: `   test "second test match" do` }; }
      if (i === 5) { return { text: `   it "second it match" do` }; }
    }
  };

  setup(() => {
    vscode.CodeLens = function (location, definition) {
      return { location: location, definition: definition };
    };
    vscode.languages = {
      registerCodeLensProvider: function (selector, provider) {
        return { selector: selector, provider: provider };
      }
    }
  });

  teardown(() => {
    vscode.CodeLens = origCodeLens;
    vscode.languages = origLanguages;
  });

  test("finds a test", () => {
    const result = findTests(fakeDocument, "match_this");

    assert.strictEqual(2, result.length);
    assert.strictEqual(0, result[0].line);
    assertRange([0, 4, 0, 30], result[0].range);
    assertRange([2, 2, 2, 30], result[1].range);
  });

  test("fileLensProvider", async () => {
    const result = fileLensProvider();
    const lenses = await result.provider.provideCodeLenses(fakeDocument);

    assert.strictEqual("ruby", result.selector.language);
    assert.strictEqual("file", result.selector.scheme);
    assert.strictEqual(1, lenses.length);
    assertRange([0, 0, 0, 0], lenses[0].location);
    assertDefinition("rails.lens.test.run", "Run tests", "file", 0, fakeDocument, lenses[0]);
  });

  test("describeLensProvider", async () => {
    const result = describeLensProvider();
    const lenses = await result.provider.provideCodeLenses(fakeTestDocument);

    assert.strictEqual("ruby", result.selector.language);
    assert.strictEqual("file", result.selector.scheme);
    assert.strictEqual(2, lenses.length);
    assertRange([0, 1, 0, 35], lenses[0].location);
    assertDefinition("rails.lens.test.run", "Run tests", "describe", 0, fakeTestDocument, lenses[0]);
    assertRange([3, 3, 3, 38], lenses[1].location);
    assertDefinition("rails.lens.test.run", "Run tests", "describe", 3, fakeTestDocument, lenses[1]);
  });

  test("testLensProvider", async () => {
    const result = testLensProvider();
    const lenses = await result.provider.provideCodeLenses(fakeTestDocument);

    assert.strictEqual("ruby", result.selector.language);
    assert.strictEqual("file", result.selector.scheme);
    assert.strictEqual(2, lenses.length);
    assertRange([1, 1, 1, 27], lenses[0].location);
    assertDefinition("rails.lens.test.run", "Run test", "test", 1, fakeTestDocument, lenses[0]);
    assertRange([4, 3, 4, 30], lenses[1].location);
    assertDefinition("rails.lens.test.run", "Run test", "test", 4, fakeTestDocument, lenses[1]);
  });

  test("itLensProvider", async () => {
    const result = itLensProvider();
    const lenses = await result.provider.provideCodeLenses(fakeTestDocument);

    assert.strictEqual("ruby", result.selector.language);
    assert.strictEqual("file", result.selector.scheme);
    assert.strictEqual(2, lenses.length);
    assertRange([2, 1, 2, 23], lenses[0].location);
    assertDefinition("rails.lens.test.run", "Run test", "it", 2, fakeTestDocument, lenses[0]);
    assertRange([5, 3, 5, 26], lenses[1].location);
    assertDefinition("rails.lens.test.run", "Run test", "it", 5, fakeTestDocument, lenses[1]);
  });
});
