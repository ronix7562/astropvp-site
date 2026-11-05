/*
 * AstroPvP Store: ALL links and data sources live here.
 * Edit this one file to go live; the page code never needs changing.
 *
 * Empty string ""  =  not set yet  =  the page shows an honest "Coming soon" / placeholder state.
 */
window.ASTRO_STORE = {
  /* Header: "click to copy" server address. Empty = shows "IP coming soon" (no public address is set up yet). */
  serverIp: "",

  discord: {
    invite: "https://discord.gg/NtYpkCzpMy",
    inviteCode: "NtYpkCzpMy",      // used to read Discord's own public member count (invite API)
    support: "https://discord.gg/NtYpkCzpMy" // green "Support" button (tickets channel)
  },

  /* Community strip: shows "Join N players already on AstroPvP" only when a real number is known
     and is at least this big; otherwise "Join the AstroPvP community". */
  communityMinimum: 100,

  tebex: {
    /* Your Tebex webstore address, e.g. "https://astropvp.tebex.io". Used by Login and as fallback. */
    storeUrl: "",
    /* Per-package checkout links: Tebex panel -> Packages -> (package) -> "Link" / "Checkout URL".
       Empty = button shows "Coming soon". */
    packages: {
      galaxy: "",   // Galaxy Rank, $80 / month subscription
      nebula: ""    // Nebula Rank, $50 one-time
    }
  },

  /* Live data feeds. GitHub Pages cannot hold the Tebex secret key, so these must come from a small
     backend (e.g. Cloudflare Worker) that calls the Tebex Plugin API and returns public-safe JSON.
     Expected shapes are documented in store/README.md. Empty = placeholder state. */
  feeds: {
    recentPayments: "",   // GET -> [{ name, item, quantity, time }]
    topSpenders: "",      // GET -> { month: [{ name, rank }], all: [{ name, rank }] }  (no amounts)
    giftcardBalance: ""   // POST { code } -> { balance, currency }
  },

  /* Hero art: drop a finished render in store/img/ and put its path here, e.g. "img/hero.png".
     Empty = the built-in pixel concept art is shown. */
  heroImage: "img/hero.png",

  /* Sale banner on the Home tab. active:false shows the neutral welcome banner. */
  sale: { active: false, title: "", text: "" }
};
