# metjurre

Eigen code (CSS en JS) voor de Webflow-site **Met Jurre**. De opbouw, classes en content staan in Webflow; alles wat als custom code in Webflow stond, staat hier en wordt via jsDelivr ingeladen.

## Structuur

| Bestand | Wat | Waar geladen |
| --- | --- | --- |
| `src/css/scaling.css` | Osmo-schaal (`--size-font` op de body) en `flow-root` op `padding__global`, volgens het DONDRS-framework | Site head |
| `src/css/nav.css` | Animaties van de two-step navigatie | Site head |
| `src/js/transitions.js` | Barba-paginaovergangen met GSAP en Lenis | Site footer |
| `src/js/nav.js` | Openen en sluiten van de two-step navigatie | Site footer |
| `src/css/podcast-swiper.css` | Swiper-overflow voor de podcastslider | Home head |
| `src/js/podcast-swiper.js` | Podcastslider op de homepage | Home footer |
| `src/js/podcast-latest.js` | Label "Nieuw" op de nieuwste aflevering en het aantal afleveringen | Home footer |
| `scripts/sync-spotify.mjs` | Zet nieuwe Spotify-afleveringen in het Webflow CMS (dagelijks via GitHub Actions) | `.github/workflows/sync-spotify.yml` |
| `docs/` | DONDRS-framework v2.0, de framework-check van de homepage en de [Spotify-koppeling](docs/spotify-koppeling.md) | — |

## Inladen in Webflow

Vervang `REF` door een tag (bijvoorbeeld `v1.0.0`) of een commit-hash. Gebruik in productie geen `@main`: jsDelivr cachet een branch tot 7 dagen.

**Site settings → Custom code → Head**

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.17/dist/lenis.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/scaling.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/nav.css">

<script src="https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/CustomEase.min.js"></script>
```

**Site settings → Custom code → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/transitions.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/nav.js"></script>
```

**Pagina Home → Custom code → Head**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/podcast-swiper.css">
```

**Pagina Home → Custom code → Footer**

```html
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-swiper.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-latest.js"></script>
```

## Werkwijze

1. Wijzig de code hier, via een branch en pull request.
2. Na de merge zet je een nieuwe tag, bijvoorbeeld `v1.0.1`.
3. Pas `REF` in Webflow aan naar die tag en publiceer de site.
