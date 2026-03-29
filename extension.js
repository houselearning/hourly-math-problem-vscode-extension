const vscode = require("vscode");

// -----------------------------
// AUDIO ENGINE (Webview)
// -----------------------------
let audioPanel = null;

function ensureAudioPanel(context) {
  if (audioPanel) return audioPanel;

  audioPanel = vscode.window.createWebviewPanel(
    "hourlyMathAudio",
    "Hourly Math Audio Engine",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true }
  );

  audioPanel.webview.html = `
    <html>
      <body>
        <script>
          const vscode = acquireVsCodeApi();
          window.addEventListener('message', event => {
            const file = event.data.file;
            const audio = new Audio(file);
            audio.play();
          });
        </script>
      </body>
    </html>
  `;

  return audioPanel;
}

function playAudio(context, file) {
  const panel = ensureAudioPanel(context);
  const fileUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", file)
  );
  panel.webview.postMessage({ file: fileUri.toString() });
}

// -----------------------------
// PSEUDOTERMINAL ENGINE
// -----------------------------
class MathTerminal {
  constructor() {
    this.writeEmitter = new vscode.EventEmitter();
    this.onDidWrite = this.writeEmitter.event;
    this.onDidClose = new vscode.EventEmitter().event;
  }

  open() {
    this.write("Hourly Math Code Ready.\r\n");
  }

  close() {}

  write(text) {
    this.writeEmitter.fire(text);
  }
}

// -----------------------------
// HL‑VSMathEngine
// -----------------------------
function generateProblem(level, operations) {
  const ops = operations.length ? operations : ["+", "-", "x", "/"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let max;
  switch (level) {
    case 1: max = 20; break;
    case 2: max = 99; break;
    case 3: max = 999; break;
    case 4: max = 9999; break;
    case 5: max = 99999; break;
    default: max = 999;
  }

  let a, b, answer;

  if (op === "/") {
    b = randomInt(1, Math.max(2, Math.floor(max / 10)));
    const quotient = randomInt(1, Math.max(2, Math.floor(max / b)));
    a = b * quotient;
    answer = quotient;
  } else {
    a = randomInt(0, max);
    b = randomInt(0, max);
    switch (op) {
      case "+": answer = a + b; break;
      case "-": answer = a - b; break;
      case "x": answer = a * b; break;
    }
  }

  return { a, b, op, answer };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -----------------------------
// MAIN EXTENSION LOGIC
// -----------------------------
let intervalHandle = null;

function activate(context) {
  const mathTerminal = new MathTerminal();
  const terminal = vscode.window.createTerminal({
    name: "Hourly Math Code",
    pty: mathTerminal
  });

  const runWithConfig = () => {
    const config = vscode.workspace.getConfiguration("hourlyMathCode");
    const minutes = Math.min(75, Math.max(1, config.get("intervalMinutes", 60)));

    if (intervalHandle) clearInterval(intervalHandle);

    runChallenge(context, mathTerminal, config);

    intervalHandle = setInterval(() => {
      runChallenge(context, mathTerminal, config);
    }, minutes * 60 * 1000);
  };

  runWithConfig();

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("hourlyMathCode")) runWithConfig();
  });
}

async function runChallenge(context, mathTerminal, config) {
  playAudio(context, "chime.mp3");

  vscode.window.showInformationMessage(
    "HouseLearning Hourly Math Code\nCheck the terminal for your hourly math problem!",
    "Ok",
    "Terminal"
  ).then(sel => {
    if (sel === "Terminal") {
      vscode.window.terminals.find(t => t.name === "Hourly Math Code")?.show();
    }
  });

  await startMathLoop(context, mathTerminal, config);
}

async function startMathLoop(context, mathTerminal, config) {
  const level = config.get("mathLevel", 3);
  const operations = config.get("operations", ["+", "-", "x", "/"]);

  const problem = generateProblem(level, operations);

  mathTerminal.write(`\r\n>> Math time!\r\n`);
  mathTerminal.write(`>> What is {${problem.a} ${problem.op} ${problem.b}}?\r\n`);
  mathTerminal.write(`>> Answer: _\r\n`);

  while (true) {
    const answer = await vscode.window.showInputBox({
      prompt: `What is ${problem.a} ${problem.op} ${problem.b}? (type 'quit' to exit)`
    });

    if (!answer) continue;

    if (answer.toLowerCase() === "quit") {
      vscode.window.showInformationMessage(
        "Quitting this problem... to disable this extension, go to the extension pane.",
        "Ok",
        "Extensions"
      );
      return;
    }

    const numeric = Number(answer);
    if (!Number.isFinite(numeric)) {
      mathTerminal.write(">> Please enter a valid number.\r\n");
      continue;
    }

    if (Math.abs(numeric - problem.answer) < 1e-9) {
      playAudio(context, "chime-correct.mp3");
      mathTerminal.write(">> Correct! +1 for you.\r\n");
      return;
    } else {
      playAudio(context, "chime-bad.mp3");
      mathTerminal.write(">> Incorrect! Try again.\r\n");
      return startMathLoop(context, mathTerminal, config);
    }
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
