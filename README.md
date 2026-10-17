# Khattat (خطاط)

Khattat is a free and open-source geometric drafting tool for creating Square Kufic (الخط الكوفي المربع) calligraphy. It provides a precise infinite-grid canvas for drawing, transforming, saving, and exporting typographic designs.

## Features

- Infinite, zoomable grid workspace with snap-to-grid drawing
- Draw, erase, pan, marquee-select, recolor, rotate, flip, and scale tools
- Reusable Kufic preset library with positional categories
- SVG and high-resolution PNG export
- Portable `.khatt` project files
- Undo and redo history
- Web-based application with no install required

## Repository structure

- `src/app` — Next.js App Router routes and layouts
- `src/components/editor` — Khattat geometric Kufic editor component
- `public` — static brand and media assets

## Development

Khattat is built with Next.js and uses [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Other useful commands:

```bash
bun run build
bun run lint
```

## Contributing

Bug reports, feature requests, documentation improvements, and code contributions are welcome. Please open an issue before beginning a large change so the approach can be discussed.

## License

Khattat is released under the [Apache License 2.0](LICENSE).
