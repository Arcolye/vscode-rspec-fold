# RSpec Fold

Auto-folds `it` blocks when you open spec files, letting you see the specs at a glance.
Cycle through 3 folding levels: `it` -> no folding -> `describe` with `Cmd+Option+/`

## Usage

### Keyboard Shortcut

| Shortcut | Mac | Windows/Linux |
|----------|-----|---------------|
| Toggle RSpec Folding | `Cmd+Option+/` | `Ctrl+Alt+/` |

Cycles through: `it` folded → no folding → `describe` folded

### Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for:

- `RSpec Fold: Toggle RSpec Folding`
- `RSpec Fold: Fold All 'it' Blocks`
- `RSpec Fold: Unfold All 'it' Blocks`
- `RSpec Fold: Fold All 'describe' Blocks`
- `RSpec Fold: Unfold All 'describe' Blocks`

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `rspecFold.autoFoldOnOpen` | `true` | Auto-fold `it` blocks when opening spec files |
| `rspecFold.foldDelay` | `100` | Delay (ms) before auto-folding |
| `rspecFold.filePattern` | `**/spec/**/*_spec.rb` | Glob pattern for RSpec files |
