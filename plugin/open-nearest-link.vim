if exists('g:loaded_open_nearest_link')
  finish
endif
let g:loaded_open_nearest_link = 1

" デフォルトのキーマッピング設定
if !exists('g:open_nearest_link_no_default_mappings')
  nmap gx <Cmd>OpenNearestLink<CR>
endif
