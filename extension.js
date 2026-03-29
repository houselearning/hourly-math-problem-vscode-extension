const vscode = require("vscode");
const path = require("path");

let intervalHandle = null;

function activate(context) {
  console.log("Hourly Math Code activated.");

  const terminal = vscode.window.createTerminal("Hourly Math Code");

  const runWithConfig = () => {
    const config = vscode.workspace.getConfiguration("hourlyMathCode");
    const minutes = clamp(config.get("intervalMinutes", 60), 1, 75);

    if (intervalHandle) {
      clearInterval(intervalHandle);
    }

    // Run immediately
    runHourlyChallenge(terminal, context, config);

    // Schedule based on radius (minutes)
    intervalHandle = setInterval(() => {
      runHourlyChallenge(terminal, context, config);
    }, minutes * 60 * 1000);
  };

  runWithConfig();

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("hourlyMathCode")) {
      runWithConfig();
    }
  });
}

async function runHourlyChallenge(terminal, context, config) {
  playAudio(context, "chime.mp3");

  vscode.window
    .showInformationMessage(
      "HouseLearning Hourly Math Code\nCheck the terminal for your hourly math problem!",
      "Ok",
      "Terminal"
    )
    .then(selection => {
      if (selection === "Terminal") {
        terminal.show();
      }
    });

  terminal.show();
  await startMathLoop(terminal, context, config);
}

async function startMathLoop(terminal, context, config) {
  const engineConfig = {
    level: clamp(config.get("mathLevel", 3), 1, 5),
    operations: normalizeOperations(config.get("operations", ["+", "-", "x", "/"]))
  };

  const problem = generateProblem(engineConfig);

  terminal.sendText(">>Math time!");
  terminal.sendText(
    `>>What is {${problem.a} ${problem.op} ${problem.b}}?`
  );
  terminal.sendText(">>Answer: _");

  while (true) {
    const answer = await vscode.window.showInputBox({
      prompt: `What is ${problem.a} ${problem.op} ${problem.b}? (type 'quit' to exit)`
    });

    if (answer === undefined) {
      // User cancelled input box; just ask again
      continue;
    }

    const trimmed = answer.trim();

    if (trimmed.toLowerCase() === "quit") {
      vscode.window.showInformationMessage(
        "Quitting this problem... to disable this extension, go to the extension pane.",
        "Ok",
        "Extensions"
      );
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      terminal.sendText("Please enter a valid number or 'quit'.");
      continue;
    }

    if (Math.abs(numeric - problem.answer) < 1e-9) {
      playAudio(context, "chime-correct.mp3");
      terminal.sendText("Correct! +1 for you.");
      return;
    } else {
      playAudio(context, "chime-bad.mp3");
      terminal.sendText("Incorrect! Try again.");
      // New problem, loop again
      return startMathLoop(terminal, context, config);
    }
  }
}

/**
 * HL‑VSMathEngine
 * Levels:
 *  1: small positive integers, +/-
 *  2: up to 2-digit, +/-, x
 *  3: up to 3-digit, +/-, x, /
 *  4: up to 4-digit, all ops, division with integer result
 *  5: up to 5-digit, all ops, division with integer result and larger ranges
 */
function generateProblem({ level, operations }) {
  const ops = operations.length ? operations : ["+", "-", "x", "/"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let max;
  switch (level) {
    case 1:
      max = 20;
      break;
    case 2:
      max = 99;
      break;
    case 3:
      max = 999;
      break;
    case 4:
      max = 9999;
      break;
    case 5:
    default:
      max = 99999;
      break;
  }

  let a, b, answer;

  if (op === "/") {
    // Ensure integer division
    b = randomInt(1, Math.max(2, Math.floor(max / 10)));
    const quotient = randomInt(1, Math.max(2, Math.floor(max / b)));
    a = b * quotient;
    answer = quotient;
  } else {
    a = randomInt(0, max);
    b = randomInt(0, max);
    switch (op) {
      case "+":
        answer = a + b;
        break;
      case "-":
        answer = a - b;
        break;
      case "x":
        answer = a * b;
        break;
      default:
        answer = a + b;
        break;
    }
  }

  return { a, b, op, answer };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeOperations(ops) {
  if (!Array.isArray(ops)) return ["+", "-", "x", "/"];
  const allowed = new Set(["+", "-", "x", "/"]);
  return ops.filter(o => allowed.has(o));
}

function playAudio(context, file) {
  const audioPath = path.join(context.extensionPath, "media", file);
  // VS Code has no direct audio API; open externally to play sound.
  vscode.env.openExternal(vscode.Uri.file(audioPath));
}

function deactivate() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }
}

module.exports = {
  activate,
  deactivate
};
