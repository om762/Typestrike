# ⌨️ TypeStrike

**A blazing-fast typing test for your terminal.**

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

## 📥 Installation

### Download Standalone Binary (No Node.js Required)

Grab the latest release for your platform from the [Releases](../../releases/latest) page:

| Platform | Architecture | Download |
|----------|-------------|----------|
| **Windows** | x64 (Intel/AMD) | `typestrike-win-x64.zip` |
| **Windows** | ARM64 | `typestrike-win-arm64.zip` |
| **macOS** | Intel | `typestrike-macos-x64.tar.gz` |
| **macOS** | Apple Silicon (M1–M4) | `typestrike-macos-arm64.tar.gz` |
| **Linux** | x64 (Intel/AMD) | `typestrike-linux-x64.tar.gz` |
| **Linux** | ARM64 | `typestrike-linux-arm64.tar.gz` |

**Windows:**
```powershell
# Download and extract, then run:
.\typestrike-win-x64.exe
```

**macOS / Linux:**
```bash
# Download, extract, and run:
tar -xzf typestrike-<platform>.tar.gz
chmod +x typestrike-<platform>
./typestrike-<platform>
```

### Run with Node.js

```bash
# Clone and run
git clone https://github.com/om762/Typestrike.git
cd Typestrike
node bin/typestrike.js
```

### Install via npm

```bash
npm install -g typestrike
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
TypeStrike/
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
├── build.cmd                 # Windows build script
├── build.sh                  # macOS/Linux build script
├── sea-config.json           # Node.js SEA configuration
├── package.json
└── README.md
```

## 🔨 Building From Source

To build a standalone executable locally:

**Windows:**
```powershell
build.cmd
# Output: dist\typestrike.exe
```

**macOS / Linux:**
```bash
bash build.sh
# Output: dist/typestrike
```

## 📋 Requirements

For running from source:
- Node.js ≥ 18.0.0
- Interactive terminal (TTY)

Standalone binaries have **no requirements** — they work out of the box.

## 📄 License

MIT
