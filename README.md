# Hourly Math Code

**HouseLearning Hourly Math Code** brings spaced math practice directly into VS Code. Stay sharp with periodic challenges without leaving your environment.

---

## Features

* **Periodic Math Challenges**: Configurable intervals from **1–75 minutes**.
* **Difficulty Levels**: 5 distinct levels powered by **HL‑VSMathEngine**.
* **Customizable Operations**: Support for `+`, `-`, `x`, and `/`.
* **Audio Feedback**: Dedicated chimes for new prompts, correct answers, and errors.
* **Seamless Workflow**: Toast notifications paired with a dedicated terminal flow.

---

## User Experience

### Toast Notification
When it’s time for a challenge, a notification appears:
* **Title**: `HouseLearning Hourly Math Code`
* **Body**: `Check the terminal for your hourly math problem!`
* **Buttons**: `Ok`, `Terminal` (opens the dedicated math terminal).

### Terminal Interaction
```text
>> Math time!
>> What is {A (op) B}?
>> Answer: _
```
* Type your numeric answer and press **Enter**.
* Type `quit` to exit the current problem.

### Audio Feedback
* `media/chime.mp3`: When a new problem appears.
* `media/chime-correct.mp3`: When you answer correctly.
* `media/chime-bad.mp3`: When you answer incorrectly.

---

## HL‑VSMathEngine

The math level controls the range and complexity of the problems generated:

| Level | Range & Complexity |
| :--- | :--- |
| **Level 1** | Small integers, `+` and `-` |
| **Level 2** | Up to 2-digit numbers, `+`, `-`, `x` |
| **Level 3** | Up to 3-digit numbers, `+`, `-`, `x`, `/` |
| **Level 4** | Up to 4-digit numbers, all ops, integer division |
| **Level 5** | Up to 5-digit numbers, all ops, integer division, larger ranges |

> **Note**: Division problems are generated specifically so that the result is always an integer.

---

## Settings

Open **Settings** → **Extensions** → **Hourly Math Code** (or search `hourlyMathCode`).

* **`hourlyMathCode.intervalMinutes`**
    * **Type**: `number` (Range: 1–75)
    * **Default**: `60`
    * **Description**: Minutes between math problems.
* **`hourlyMathCode.mathLevel`**
    * **Type**: `number` (Range: 1–5)
    * **Default**: `3`
    * **Description**: Difficulty level for HL‑VSMathEngine.
* **`hourlyMathCode.operations`**
    * **Type**: `string[]`
    * **Allowed values**: `"+"`, `"-"`, `"x"`, `"/"`
    * **Default**: `["+", "-", "x", "/"]`
    * **Description**: Operations to include in generated problems.

---

## Quitting and Disabling

### To quit a single problem:
Type `quit` in the terminal. You will see a toast:
> Quitting this problem... to disable this extension, go to the extension pane. **[Ok] [Extensions]**

### To disable the extension entirely:
1. Go to the **Extensions** pane.
2. Search for **Hourly Math Code**.
3. Click **Disable** or **Uninstall**.

---

## Development

1.  Clone the repository.
2.  Run `npm install`.
3.  Press `F5` in VS Code to launch an **Extension Development Host**.
4.  Ensure the `media/` folder contains:
    * `chime.mp3`
    * `chime-correct.mp3`
    * `chime-bad.mp3`
