# Badge images

Custom badge images are configured through `manifest.json`.

Rules:
- `byId` uses the badge id from the app state.
- `byName` uses the badge display name.
- If a value does not start with `./`, `/`, `http`, `https`, `data`, or `blob`, it is resolved relative to `./resource-v7/badges/`.
- `byId` has higher priority than `byName`.

Example:

```json
{
  "byId": {
    "guardian_冰拳艾司_10": "guardian_冰拳艾司_10.png",
    "boss_骰子大王_first_v1": "boss_骰子大王_first_v1.png"
  },
  "byName": {
    "无念专属黑金徽章": "weekly_wunian_honor.png"
  }
}
```

Auto refresh:
- Double-click [刷新徽章映射.cmd](/G:/aolaxing/resource-v7/刷新徽章映射.cmd:1) to rescan `./resource-v7/勋章/` and rewrite the auto-detected boss badge mappings in `manifest.json`.
- The refresh script preserves `byName` and non-`boss_` entries in `byId`.
