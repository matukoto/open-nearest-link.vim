# open-nearest-link.vim

Vim plugin to open the nearest link in the text using denops.vim.

## Requirements

- [denops.vim](https://github.com/vim-denops/denops.vim) >= 7.4.0
- [deno](https://deno.land/) >= 2.1.5

## Installation

If you use [vim-plug](https://github.com/junegunn/vim-plug):

```vim
Plug 'vim-denops/denops.vim'
Plug 'matukoto/open-nearest-link.vim'
```

## Usage

This plugin provides commands to find and open the nearest link in your text.

- `:OpenNearestLink` - Opens the nearest link from the cursor position

## Development

### Testing

```bash
deno task test   # Run all tests
deno task check  # Type check
```

## License

MIT
