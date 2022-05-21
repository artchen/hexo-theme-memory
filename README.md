# Hexo Theme Memory

Memory is a minimal theme for [Hexo](http://hexo.io).

This theme is also available on:

* Ghost version: [ghost-theme-memory](https://github.com/artchen/ghost-theme-memory)

## Installation

Git Clone:
```bash
git clone https://github.com/artchen/hexo-theme-memory.git themes/hexo-theme-memory
```

Install Dependencies in Hexo site root directory:
```bash
npm i github:artchen/hexo-theme-memory
```
<details>
  <summary>If installing dependencies fails, try</summary>

  ```bash
  npm i hexo-generator-archive hexo-generator-tag hexo-renderer-ejs hexo-renderer-dartsass hexo-renderer-marked hexo-pagination hexo-toc
  ```

</details>

## Customization

The theme is customizable via `_config.yml` file under the theme directory.

The global `_config.yml` for Hexo may also need customization. In particular:

* Set `disqus_shortname` field to your disqus short name.
* Set `theme` field to `hexo-theme-memory`.

In addition to these settings, users may also want to edit/replace the following files:

* Replace the site logo: `source/img/logo.png`, `source/img/logo.psd`
* The icon fonts are from [icomoon](https://icomoon.io/).

This theme supports the following search services:

* Google custom search
* Algolia search
* Microsoft Azure search

Refer to [universal-search](https://github.com/artchen/universal-search) series to learn how to set up search.

## Demo

![Memory Demo](https://cdn.otakism.com/assets/hexo-theme-memory/demo/ghost-theme-memory-screenshot.jpg)

## Copyright

Public resources used in this theme:

* [icomoon](https://icomoon.io/)
* [normalize.css](https://necolas.github.io/normalize.css/)
* [fitvids.js](https://github.com/davatron5000/FitVids.js)

Copyright © Art Chen

Please do not remove the "Theme Memory designed by Art Chen" text and links.

请不要删除页面底部的作者信息和链接。


