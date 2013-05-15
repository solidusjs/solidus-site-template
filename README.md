solidus-site-template
=====================

Grunt-init template for a Solidus site. This [grunt-init](https://github.com/gruntjs/grunt-init) template helps you get started building Solidus sites by quickly assembling a default file structure for you.

## Using The Template

In order to use this template, you'll need the following:

- [Grunt.js](http://gruntjs.com) installed globally*
- [grunt-init](https://github.com/gruntjs/grunt-init) installed globally*
- Download/clone this repo
- (Optional) move/rename the template folder to `~/.grunt-init/solidus/`

Once this is done, you can init a new site by running one of the following commands:

```
grunt-init solidus
```

OR (if you haven't moved the template folder to `~/.grunt-init/solidus/`)...

```
grunt-init /path/to/solidus/template/folder/
```

## Grunt tasks

The Solidus Site Template provides a set of [Grunt](http://gruntjs.com) instructions for asset compilation. These scripts will do the following:

- Compile all js in `/scripts/` to `/compiled/scripts.js`
- Compile all CSS/SASS in `/styles/` to `/compiled/styles.css`
- Compile all views in `/views/` to `/compiled/templates.js` and `/compiled/partials.js`

Here's a quick example of a Solidus site's asset structure:

```
assets
|-images
  |-kitties.png
|-scripts
  |-vendors
    |-jquery.js
  |--index.js
  |--kitties.js
|-styles
  |-index.sass
  |-kitties.sass
```

After `grunt compile` or `grunt dev` are run, a new folder is created with the compiled scripts, styles, and templates of the site.

```
assets
|-compiled
  |-partials.js
  |-scripts.js
  |-styles.css
  |-templates.js
...
```

All of a site's views can be accessed client-side as **JavaScript Templates**. Since views are just [Handlebars.js](http://handlebarsjs.com/) templates, all you need to do is include Handlebars, include your templates, and use them. Javascript templates, along with anything else solidus makes available client-side, is on the `solidus` namespace. Here's a quick example of how it works:

`index.hbs`
```html
<html>
	<head>
		<script src="/scripts/vendor/handlebars.js"></script>
		<script src="/compiled/templates.js"></script>
		<script src="/compiled/partials.js"></script>
		<script>
			var markup = solidus.templates['kitties/index']( data );
			$( function(){
				$('body').append( markup );
			});
		</script>
	</head>
</html>
```

At the moment, assets will be compiled in the order they appear in the filesystem. When building a site, you should always try to use the compiled assets, as they will be optimized for distribution. Other assets, such as fonts and images, have no compilation step and can be used as is.