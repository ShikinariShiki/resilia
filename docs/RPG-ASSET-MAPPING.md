# RPG asset mapping

Every provided reference file is mapped to its chapter and its in-app asset. Source frames are bundled under `docs/rpg-references/` so the visual-novel layout can be matched exactly. Production assets live in `src/assets/rpg/`.

## Backgrounds (1920x1080, opaque, shipped as jpg)

| Source | In-app asset | Chapter | Scene |
|---|---|---|---|
| Background Assets/2.png | src/assets/rpg/bg-merapi.jpg | Merapi | Volcano village, amber sky |
| Background Assets/11.png | src/assets/rpg/bg-gotong.jpg | Gotong Royong | Hilltop, community raising a flag |
| Background Assets/46.png | src/assets/rpg/bg-evac.jpg | Evacuation Center | Tents on muddy ground, smoke |

## Character sprites (1080x1350, transparent png)

| Source | In-app asset | Who | Mood |
|---|---|---|---|
| Character Assets/48.png | src/assets/rpg/lia-mentor-happy.png | Lia the axolotl psychologist | bright |
| Character Assets/49.png | src/assets/rpg/lia-mentor-unsure.png | Lia | unsure, hand to face |
| Character Assets/46.png | src/assets/rpg/dewi-worried.png | Mbak Dewi, village resident | worried |
| Character Assets/47.png | src/assets/rpg/dewi-neutral.png | Mbak Dewi | neutral |
| Character Assets/50.png | src/assets/rpg/youth-crying.png | Youth, evacuee | crying |
| Character Assets/51.png | src/assets/rpg/youth-confident.png | Youth, player avatar | confident |

## Chapter reference frames (storyboards, full UI mockups)

These show the exact dialogue, the five-heart HP row, and the wrong-answer feedback, so the engine layout and copy can match one to one.

- docs/rpg-references/Chapter Merapi Ref/ frames 3 to 7 plus Pil 1 to 3 (choice screens)
- docs/rpg-references/Gotong Royong Ref/ frames 12 to 17 plus Pilihan 1 to 3
- docs/rpg-references/Evacuation Center Ref/ frames 21 to 26 plus Pilihan 1 to 3

## How they are wired

- `src/data/rpgScenarios.js` imports the backgrounds and sprites above and defines three chapters, `merapi`, `gotong`, `evac`, each with verbatim copy from the reference frames.
- `getScenario(id)` resolves `merapi`, `gotong`, `evac`, and numeric module ids 1, 2, 3.
- The existing route `/academy/rpg/:id` resolves these ids with no router change, so `/academy/rpg/gotong` and `/academy/rpg/evac` already load. The Academy chapter list still needs links added to these two, see CHANGELOG pending items.
- HP is the five-heart `questHP` model, one heart per wrong answer, matching every reference frame.

## Notes

- Backgrounds were re-encoded to jpg at quality 86 for weight. Per the spec they should also be exported to WebP with a jpg fallback on the dev machine.
- Sprites are kept as transparent png. For the desktop visual-novel stage, anchor the sprite to one side at full bleed and keep Lia on the mentor side.
