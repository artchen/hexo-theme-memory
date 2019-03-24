# Hexo Theme Typescript

Typescript is a minimal theme for [Hexo](http://hexo.io).

This theme is also available on:

* Ghost version: [ghost-theme-typescript](https://github.com/artchen/ghost-theme-typescript)

## Dependencies

Recommended list of plugins:

* hexo-all-minifier
* hexo-autoprefixer
* hexo-front-matter
* hexo-generator-archive
* hexo-generator-category
* hexo-generator-feed
* hexo-generator-index
* hexo-generator-tag
* hexo-pagination
* hexo-renderer-less
* hexo-renderer-ejs
* hexo-renderer-marked

## Customization

Typescript is customizable via `_config.yml` file under the theme directory.

The global `_config.yml` for Hexo may also need customization. In particular:

* Set `disqus_shortname` field to your disqus short name.
* Set `theme` field to `hexo-theme-typescript`.

In addition to these settings, users may also want to edit/replace the following files:

* Replace the site logo: `source/images/logo.png`, `source/images/logo.psd`
* The icon fonts are from [icomoon](https://icomoon.io/).
* The default English font is Futura PT via Adobe Typekit. If you are using Typekit like me, please change the embedded javascript code in `layout/_partial/head.ejs`, else you can delete the corresponding code.

This theme currently support 3 search services:

* Google custom search
* Algolia search
* Microsoft Azure search

For information about how to setup searching, please refer to another project of mine, [universal-search](https://github.com/artchen/universal-search).

## Demo

![Typescript Demo](http://artifact.me/images/ghost-theme-typescript-screenshot.png)

## Copyright

Public resources used in this theme:

* [icomoon](https://icomoon.io/)
* [normalize.css](https://necolas.github.io/normalize.css/)
* [fitvids.js](https://github.com/davatron5000/FitVids.js)

Copyright © Art Chen

Please do not remove the "Theme Typescript designed by Art Chen" text and links.

请不要删除页面底部的作者信息和链接。


