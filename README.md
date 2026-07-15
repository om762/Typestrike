# ⌨️ TypeStrike

**A MonkeyType-inspired typing test for your terminal.**

Beautiful, offline, zero dependencies — just pure Node.js.

```
╺┳╸╻ ╻┏━┓┏━╸┏━┓╺┳╸┏━┓╻╻┏ ┏━╸
 ┃ ┗┳┛┣━┛┣╸ ┗━┓ ┃ ┣┳┛┃┣┻┓┣╸
 ╹  ╹ ╹  ┗━╸┗━┛ ╹ ╹┗╸╹╹ ╹┗━╸
```

## ✨ Features

- **Real-time feedback** — Characters light up green/red as you type
- **Live WPM & accuracy** — Updated every keystroke
- **4 Test Modes** — Timed (15/30/60/120s), Word Count (10/25/50/100), Quotes, Custom
- **4 Difficulty Levels** — Easy, Medium, Hard, Code (programming syntax!)
- **Animated countdown** — 3-2-1-GO! with ASCII art
- **History tracking** — Personal bests saved to `~/.typestrike/`
- **Zero dependencies** — Just Node.js ≥ 18
- **Beautiful TUI** — Unicode box-drawing, ANSI colors, smooth animations

## 🚀 Quick Start

```bash
# Clone and run
git clone <repo-url>
cd typingClI
node bin/typestrike.js

# Or install globally
npm link
typestrike
```

## 🎮 Controls

| Key | Action |
|---|---|
| `↑` `↓` | Navigate menu sections |
| `←` `→` | Select options |
| `Enter` | Start test |
| `Tab` | Restart test |
| `Esc` | Back to menu / Quit |
| `Backspace` | Delete last character |
| `Ctrl+C` | Force quit |

## 📊 Metrics

- **WPM (Net)** — (correct characters / 5) / minutes
- **WPM (Raw)** — (total characters / 5) / minutes
- **Accuracy** — correct / total characters × 100%
- **Consistency** — based on per-second WPM variance

## 🗂 Project Structure

```
typingCLI/
├── bin/typestrike.js         # Entry point
├── src/
│   ├── app.js                # Main orchestrator
│   ├── core/
│   │   ├── engine.js         # Typing test engine
│   │   ├── input.js          # Raw keypress handler
│   │   └── timer.js          # Countdown timer
│   ├── ui/
│   │   ├── renderer.js       # ANSI rendering engine
│   │   ├── menu.js           # Interactive menu
│   │   ├── countdown.js      # 3-2-1 animation
│   │   └── results.js        # Results screen
│   ├── data/
│   │   ├── words-easy.js     # 200 common words
│   │   ├── words-medium.js   # 1000 standard words
│   │   ├── words-hard.js     # Advanced + punctuation
│   │   ├── words-code.js     # Programming keywords
│   │   └── quotes.js         # Famous quotes
│   └── utils/
│       ├── helpers.js        # Text wrapping, formatting
│       └── history.js        # Test history persistence
├── package.json
└── README.md
```

## 📋 Requirements

- Node.js ≥ 18.0.0
- Interactive terminal (TTY)

## 📄 License

MIT
