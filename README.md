# metjurre

Eigen code (CSS en JS) voor de Webflow-site **Met Jurre**. De opbouw, classes en content staan in Webflow; alles wat als custom code in Webflow stond, staat hier en wordt via jsDelivr ingeladen.

## Structuur

| Bestand | Wat | Waar geladen |
| --- | --- | --- |
| `src/css/scaling.css` | Osmo-schaal (`--size-font` op de body) en `flow-root` op `padding__global`, volgens het DONDRS-framework | Site head |
| `src/css/nav.css` | Animaties van de two-step navigatie | Site head |
| `src/js/transitions.js` | Barba-paginaovergangen met GSAP en Lenis: nieuwe pagina groeit vanuit een venster onderin (masked window) | Site footer |
| `src/js/nav.js` | Openen en sluiten van de two-step navigatie | Site footer |
| `src/css/motion.css` | Motion-tokens (hover en beweging), focus-ring, knoppen bij toetsenbordfocus en reduced motion | Site head |
| `src/css/footer.css` | Footer: groene gloed, hover op afleveringen en focus | Site head |
| `src/js/footer.js` | Footer: jaartal, terug naar boven en de 3 nieuwste podcasts (uit de homepage) | Site footer |
| `src/css/podcast-swiper.css` | Podcastslider en -kaarten: overflow, gloed, geluidsgolf en focus | Site head |
| `src/js/podcast-swiper.js` | Podcastslider op de homepage | Site footer |
| `src/js/podcast-cards.js` | Podcastkaarten: aantal afleveringen, label "Nieuw", duur in minuten en Spotify in nieuw tabblad | Site footer |
| `src/css/bento.css` | Bento-sectie: DISC-ticker, stappenlijn en fotokaart | Site head |
| `src/js/bento.js` | Bento-sectie: naadloze DISC-ticker met oplichtende middelste pill | Site footer |
| `src/css/reviews.css` | Review-sectie: slider die rechts doorloopt, donkere actieve kaart, voortgangsbalk en decoratie | Site head |
| `src/css/faq.css` | FAQ-sectie: accordeon met plus/min-icoon, sticky intro | Site head |
| `src/js/faq.js` | FAQ: vragen worden knoppen, één tegelijk open, telt de vragen | Site footer |
| `src/css/base.css` | Basis: lopende tekst op text-wrap pretty, scrollbar blijft staan als het menu opent, achtergrond en schaduwlaag voor de paginaovergang | Site head |
| `src/css/hero.css` | Hero: "Bekend van" RTL en Videoland, donkere onderrand, gloed en rustiger intro | Site head |
| `src/js/reviews.js` | Review-sectie: aantal reviews en slider met voortgangsbalk en pijlen | Site footer |
| `src/css/contact.css` | Contactpagina: iconen, focus- en foutstatus van velden, select-pijl en verstuurknop | Site head |
| `src/css/shapes.css` | Vormentaal: uitsparingen met holle hoeken (hero, werkwijze, over mij, podcast, kaarten). Laatst laden | Site head |
| `src/js/shapes.js` | Rekent per blok de vorm met uitsparing uit en zet die als `--notch-clip` (clip-path) | Site footer |
| `src/js/contact.js` | Contactpagina: onderwerpen (en `?onderwerp=`), placeholders, "(optioneel)" en formulier na een overgang opnieuw koppelen | Site footer |
| `assets/img/` | Afbeeldingen die via jsDelivr geladen worden (foto bento-kaart) | via `bento.css` |
| `scripts/sync-spotify.mjs` | Zet nieuwe Spotify-afleveringen in het Webflow CMS (dagelijks via GitHub Actions) | `.github/workflows/sync-spotify.yml` |
| `docs/` | DONDRS-framework v2.0, de framework-check van de homepage en de [Spotify-koppeling](docs/spotify-koppeling.md) | — |

## Inladen in Webflow

Vervang `REF` door een tag (bijvoorbeeld `v1.0.0`) of een commit-hash. Gebruik in productie geen `@main`: jsDelivr cachet een branch tot 7 dagen.

Barba wisselt bij een paginaovergang alleen de inhoud van `data-barba="container"`. Code die per pagina in Webflow staat, wordt dan niet geladen. Daarom staat alle code op siteniveau; elk script zoekt zelf of zijn sectie op de pagina staat.

**Site settings → Custom code → Head**

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.17/dist/lenis.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/base.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/nav.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/motion.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/footer.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/hero.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/podcast-swiper.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/bento.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/reviews.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/faq.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/contact.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/shapes.css">

<script src="https://cdn.jsdelivr.net/npm/@barba/core@2.10.3/dist/barba.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/CustomEase.min.js"></script>
```

**Site settings → Custom code → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/transitions.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/nav.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/footer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-swiper.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-cards.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/bento.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/reviews.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/faq.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/contact.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/shapes.js"></script>
```

## Werkwijze

1. Wijzig de code hier, via een branch en pull request.
2. Na de merge zet je een nieuwe tag, bijvoorbeeld `v1.0.1`.
3. Pas `REF` in Webflow aan naar die tag en publiceer de site.
