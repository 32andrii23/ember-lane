# Ember Lane

A short pixel-art drama. One rainy night, one last train, one conversation eight years late.

Mara Voss comes back to the town she swore off after her brother calls: their father has had a stroke.
Walk from the station, down the lane, to room four. What she says along the way decides which of three endings she gets.

## Play

Open `index.html` in any modern browser. No build step, no dependencies, no image files: every sprite and tile is drawn from code.

If your browser blocks the font when opened from disk, serve the folder instead:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Controls

| Key | Action |
| --- | --- |
| Arrows / WASD | Move |
| E / Space / Enter | Talk, advance text, choose |
| Up / Down | Pick a reply |
| M | Mute rain and thunder |

## Structure

- `js/sprites.js` palette, character sprites, tile art
- `js/maps.js` the three scenes, NPC positions, exits
- `js/story.js` all dialogue, choices and the three endings
- `js/ui.js` title, text cards, dialog box
- `js/engine.js` loop, input, collision, rain, sound, flow

About five minutes to play. Three endings: Ember, Rain, The 4:10.
