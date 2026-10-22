# metjurre

Eigen code (CSS en JS) voor de Webflow-site **Met Jurre**. De opbouw, classes en content staan in Webflow; alles wat als custom code in Webflow stond, staat hier en wordt via jsDelivr ingeladen.

## Structuur

| Bestand | Wat | Waar geladen |
| --- | --- | --- |
| `src/css/scaling.css` | Osmo-schaal (`--size-font` op de body) en `flow-root` op `padding__global`, volgens het DONDRS-framework | Site head |
| `src/css/nav.css` | Animaties van de two-step navigatie | Site head |
| `src/js/transitions.js` | Barba-paginaovergangen met GSAP en Lenis | Site footer |
| `src/js/nav.js` | Openen en sluiten van de two-step navigatie | Site footer |
| `src/css/motion.css` | Motion-tokens (hover en beweging), focus-ring, knoppen bij toetsenbordfocus en reduced motion | Site head |
| `src/css/footer.css` | Footer: groene gloed, hover op afleveringen en focus | Site head |
| `src/js/footer.js` | Footer: jaartal, terug naar boven en de 3 nieuwste podcasts (uit de homepage) | Site footer |
| `src/js/tracking.js` | Conversietracking: klikken op CTA's, Spotify, mail, telefoon en formulieren naar GA4, GTM of Plausible (zie [Conversietracking](#conversietracking)) | Site footer |
| `src/css/podcast-swiper.css` | Podcastslider en -kaarten: overflow, gloed, geluidsgolf en focus | Home head |
| `src/js/podcast-swiper.js` | Podcastslider op de homepage | Home footer |
| `src/js/podcast-cards.js` | Podcastkaarten: aantal afleveringen, label "Nieuw", duur in minuten en Spotify in nieuw tabblad | Home footer |
| `src/css/bento.css` | Bento-sectie: DISC-ticker, stappenlijn en fotokaart | Home head |
| `src/js/bento.js` | Bento-sectie: naadloze DISC-ticker met oplichtende middelste pill | Home footer |
| `src/css/reviews.css` | Review-sectie: slider die rechts doorloopt, donkere actieve kaart, voortgangsbalk en decoratie | Home head |
| `src/css/hero.css` | Hero: "Bekend van" RTL en Videoland, donkere onderrand, gloed en rustiger intro | Home head |
| `src/js/reviews.js` | Review-sectie: aantal reviews en slider met voortgangsbalk en pijlen | Home footer |
| `assets/img/` | Afbeeldingen die via jsDelivr geladen worden (foto bento-kaart) | via `bento.css` |
| `scripts/sync-spotify.mjs` | Zet nieuwe Spotify-afleveringen in het Webflow CMS (dagelijks via GitHub Actions) | `.github/workflows/sync-spotify.yml` |
| `docs/` | DONDRS-framework v2.0, de framework-check van de homepage en de [Spotify-koppeling](docs/spotify-koppeling.md) | — |

## Inladen in Webflow

Vervang `REF` door een tag (bijvoorbeeld `v1.0.0`) of een commit-hash. Gebruik in productie geen `@main`: jsDelivr cachet een branch tot 7 dagen.

**Site settings → Custom code → Head**

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.17/dist/lenis.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/scaling.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/nav.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/motion.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/footer.css">

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
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/tracking.js"></script>
```

**Pagina Home → Custom code → Head**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/podcast-swiper.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/bento.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/hero.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/css/reviews.css">
```

**Pagina Home → Custom code → Footer**

```html
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-swiper.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/podcast-cards.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/bento.js"></script>
<script src="https://cdn.jsdelivr.net/gh/byderkdesign/metjurre@REF/src/js/reviews.js"></script>
```

## Conversietracking

`tracking.js` stuurt events naar wat er op de site staat: `gtag` (GA4), anders de `dataLayer` (Google Tag Manager), en daarnaast Plausible als dat geladen is. Zonder een van die drie gebeurt er niets.

| Event | Wanneer | Instellen |
| --- | --- | --- |
| eigen naam, bijv. `cta_click` | Klik op een element met `data-track="cta_click"` | Custom attribute in Webflow. Optioneel `data-track-label` als de knoptekst niet duidelijk genoeg is. |
| `podcast_listen` | Klik op een link naar `open.spotify.com` | Automatisch |
| `email_click` / `phone_click` | Klik op een `mailto:`- of `tel:`-link | Automatisch |
| `outbound_click` | Klik op een link naar een ander domein | Automatisch |
| `form_submit` | Een formulier wordt verstuurd | Automatisch, met de formuliernaam uit Webflow |
| `generate_lead` | De bedankmelding van een Webflow-formulier verschijnt | Automatisch. Dit is het event om als conversie te markeren. |
| `virtual_page_view` | Paginawissel via Barba (alleen in de `dataLayer`) | Alleen nodig in GTM. GA4 (verbeterde metingen) en Plausible zien Barba-wissels al zelf via de browsergeschiedenis. |

Elk event krijgt `section_name` mee: de waarde van `data-track-section` op een omliggend element, anders de id of eerste class van de sectie (bijv. `section__hero`). Zo zie je welke "Afspraak plannen"-knop werkt.

**Voorgestelde attributen in Webflow:** `data-track="cta_click"` op alle "Afspraak plannen"- en "Contact"-knoppen, `data-track="podcast_all"` op "Alle afleveringen".

**Testen:** open de site met `?debug-tracking` achter de URL. Elk event staat dan in de console.

**In GA4:** maak onder *Beheer → Aangepaste definities* dimensies aan voor `section_name`, `link_text` en `form_name`, en markeer `generate_lead` als belangrijke gebeurtenis.

## Werkwijze

1. Wijzig de code hier, via een branch en pull request.
2. Na de merge zet je een nieuwe tag, bijvoorbeeld `v1.0.1`.
3. Pas `REF` in Webflow aan naar die tag en publiceer de site.
