# RSpec Fold

Auto-folds `it` blocks when you open spec files, letting you see the specs at a glance.

Cycle through 3 folding levels with `Cmd+Option+/`: `describe` -> `it` -> no folding

## Keyboard Shortcut

| Shortcut | Mac | Windows/Linux |
|----------|-----|---------------|
| Toggle RSpec Folding | `Cmd+Option+/` | `Ctrl+Alt+/` |

Cycles through:
- `describe`-level overview
- individual `it`-level specs
- complete test implementations (no folding)

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `rspecFold.autoFoldOnOpen` | `true` | Auto-fold `it` blocks when opening spec files |
| `rspecFold.foldDelay` | `100` | Delay (ms) before auto-folding |
| `rspecFold.filePattern` | `**/spec/**/*_spec.rb` | Glob pattern for RSpec files |
