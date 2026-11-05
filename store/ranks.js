/*
 * Rank packages shown on the Ranks tab. Prices/types are the owner's decision; perks must match the live
 * server. Perks come from the live LuckPerms setup (groups `interstellar` = Nebula, `galaxy`) and the
 * AstroCore rank code as checked on 2026-11-05. A perk with  verified:false  is shown as a labelled
 * placeholder ("to be confirmed") instead of a promise.
 */
window.ASTRO_RANKS = [
  {
    id: "galaxy",
    name: "Galaxy Rank",
    price: 80, currency: "USD", period: "month",
    type: "Monthly subscription",
    button: "Subscribe",
    perks: [
      { text: "Everything in Nebula" },
      { text: "Rainbow Galaxy chat prefix and nametag" },
      { text: "Nebula Shop items are free" },
      { text: "No teleport warmup" },
      { text: "+10% crystal bonus (instead of +4%)" },
      { text: "7 homes", verified: false },
      { text: "Galaxy /kit", verified: false }
    ],
    notes: [
      "Renews every month until you cancel. The rank is removed when the subscription ends.",
      "Delivered on the factions server; you must be online."
    ]
  },
  {
    id: "nebula",
    name: "Nebula Rank",
    price: 50, currency: "USD", period: null,
    type: "One-time · permanent",
    button: "Buy",
    perks: [
      { text: "Everything in Apollo (the starting rank), including /armorcolor" },
      { text: "Nebula chat prefix" },
      { text: "/chatcolor and /nick" },
      { text: "/nebula: Nebula Shop and lounge" },
      { text: "x2 grinding XP" },
      { text: "No chat cooldown" },
      { text: "+4% crystal bonus" },
      { text: "5 homes" },
      { text: "99 player vaults" },
      { text: "x3 Fly Boost while flying is allowed (for example /f fly), not in combat" },
      { text: "Nebula /kit", verified: false }
    ],
    notes: [
      "Permanent: pay once, keep it.",
      "Delivered on the factions server; you must be online."
    ]
  }
];
