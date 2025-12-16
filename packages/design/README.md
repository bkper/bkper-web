# @bkper/web-design

Bkper's design system - CSS variables, tokens, and themes.

## Documentation

* [Developer Docs](https://bkper.com/docs/) is coming soon as part of the Bkper web packages documentation site.

## Installation

```bash
npm install @bkper/web-design
```

## Usage

```html
<link rel="stylesheet" href="node_modules/@bkper/web-design/src/bkper.css">
```

Or import in your build system:

```css
@import '@bkper/web-design/src/bkper.css';
```

## What's Included

- CSS custom properties (variables)
- Account type colors: blue (Assets), yellow (Liabilities), green (Incoming), red (Outgoing)
- Light/dark theme support
- Typography scale
- Spacing scale
- Border and color tokens

## Web Awesome Integration

This package works standalone with sensible default values. If [Web Awesome](https://www.webawesome.com/) is loaded, Bkper tokens will automatically inherit from Web Awesome's design system for seamless integration.

## License

Apache-2.0
