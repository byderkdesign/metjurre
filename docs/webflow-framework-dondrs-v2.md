# Webflow-framework — DONDRS

Layoutbasis en naamgeving v2.0 · 29 september 2026

## Doel

Een vaste, herbruikbare opbouw voor secties en veelgebruikte onderdelen in Webflow. Dit document legt nesting, classnamen, schaal, spacing, breedte en responsive gedrag vast. Het bevat ook naamgevingsregels voor onder meer kolommen, beelden, tekst, cards, knoppen, links en formulieren.

## Classes en rollen

| Class | Rol |
| --- | --- |
| `section__{name}` | Sectie naar de inhoud benoemen, bijvoorbeeld `section__hero`, `section__services` of `section__contact`. |
| `padding__global` | Horizontale ruimte links en rechts; vormt ook de containment voor de verticale marge erbinnen. |
| `margin__global` | Werkelijke `margin-top` en `margin-bottom` voor sectieruimte. |
| `max-width__global` | `width: 100%`, `max-width: 80em`, horizontaal gecentreerd. |
| `max-width--text` | Combo class die de maximale breedte verlaagt naar `48em` voor lange tekst. |
| `wrap_vertical` | Flexwrapper met `flex-direction: column`. |
| `wrap_horizontal` | Flexwrapper met `flex-direction: row`; op mobiel standaard `column`. |
| `align--left`, `align--center` | Combo classes voor uitlijning van kinderen én tekst. |
| `space--between` | Combo class op horizontale wrappers voor `justify-content: space-between`. |
| `margin--small`, `margin--large` | Combo classes op `margin__global` voor sectieruimte. |
| `gap--small`, `gap--large` | Combo classes op beide layoutwrappers voor onderlinge afstand. |

## Naamgeving van onderdelen

Alle classnamen zijn Engels en lowercase. Bij meerdere woorden in één naam gebruik je een koppelteken, bijvoorbeeld `section__about-us` of `image--full-width`. Namen tussen accolades in dit document zijn placeholders, geen letterlijke Webflow-classes.

Gebruik `__` na het type voor een zelfstandige rol, een benoemde sectie of een onderdeel van een component: `button__primary`, `section__hero`, `card__title`. Gebruik `--` voor een stijl- of gedragsvariant op een basisclass: `image image--cover`, `pill pill--outline`, `wrap_vertical gap--small`. De basisclass bevat de gedeelde stijl; de combo class alleen het verschil. Noem een herbruikbare variant naar zijn werking of uiterlijk, niet naar de pagina waarop hij toevallig staat.

Als je een nieuw onderdeel toevoegt, kies dan eerst de rol: een zelfstandige variant krijgt `type__role` (bijvoorbeeld `link__download`), een onderdeel van een component krijgt `component__part` (bijvoorbeeld `form__label`), en een aanpassing van een herbruikbare basis krijgt `base--variant` (bijvoorbeeld `image--contain`). Zo blijft de naam voorspelbaar zonder per pagina een nieuwe stijl te maken.

| Onderdeel | Patroon | Voorbeeld |
| --- | --- | --- |
| Sectie | `section__{name}` | `section__hero` |
| Linkerkolom / rechterkolom | `column__left` / `column__right` | Positie op desktop; de naam blijft op mobiel gelijk. |
| Herhaalde kolom | `column__item` | Voor drie of meer gelijksoortige items. |
| Afbeelding | `image` + `image--variant` | `image image--cover` |
| Eyebrow | `eyebrow` + `eyebrow--variant` | `eyebrow eyebrow--light` |
| Pill | `pill` + `pill--variant` | `pill pill--outline` |
| Primaire knop | Zelfstandige class | `button__primary` |
| Secundaire knop | Zelfstandige class | `button__secondary` |
| Tekstknop | Zelfstandige class | `button__text` voor een losse CTA zonder gevulde knop. |
| Gewone link | Zelfstandige class | `link__text` binnen lopende tekst. |
| Link met pijl | Zelfstandige class | `link__arrow` |
| Hoofdnavigatielink | Zelfstandige class | `link__nav` |
| Footerlink | Zelfstandige class | `link__footer` |
| Heading | Zelfstandige rolclass, los van H1–H6 | `heading__hero`, `heading__section`, `heading__card` |
| Lopende tekst | `text` + stijlcombo | `text text--body`, `text text--lead`, `text text--small` |
| Card | Basis + onderdelen + stijlcombo | `card`, `card__image`, `card__title`, `card__text`, `card--featured` |
| Icoon | Basis + stijl- of gedragscombo | `icon icon--arrow` |
| Video | Basis + stijl- of gedragscombo | `video video--background` |
| Formulier | Basis + onderdelen | `form`, `form__field`, `form__label`, `form__input`, `form__submit` |

Bij `image`, `eyebrow` en `pill` bevat de basisclass eigenschappen die voor elke toepassing gelden. De `--` class wijzigt alleen wat voor die stijl of dat gedrag anders is. Knoppen en links zijn zelfstandige classes zonder gedeelde `button`- of `link`-basisclass. `button__text` is een zelfstandige CTA; `link__text` staat in een zin of alinea. Kies voor twee vaste kolommen `column__left` en `column__right`. Voor drie of meer herhalende kolommen gebruik je `column__item`.

Een `heading__...` class beschrijft de visuele rol en staat los van de semantische H1–H6-tag. `text` bevat de gedeelde alinea-instellingen; `text--lead`, `text--body` en `text--small` passen de tekstrol aan. Een card heeft een eigen basis `card`, onderdelen met `card__...` en optionele stijlvarianten met `card--...`. De onderdelen kunnen globale classes dragen: `card__title heading__card` op de titel en `card__text text text--body` op de beschrijving. Een `card__image`-wrapper kan een afbeelding met `image image--cover` bevatten. Zo blijft de componentstructuur herkenbaar en blijft de beeld- of tekststijl herbruikbaar.

Voor formulieren geldt dezelfde opbouw: `form` als basis en `form__field`, `form__label`, `form__input` en `form__submit` als onderdelen. Het verzendelement mag ook de passende knopclass krijgen, bijvoorbeeld `form__submit button__primary`.

### Voorbeeld: sectie met tekst en beeld

| Plek in de Navigator | Class of combinatie |
| --- | --- |
| Buitenste sectie | `section__services` |
| Paginaruimte | `padding__global` → `margin__global` → `max-width__global` |
| Twee kolommen | `wrap_horizontal` |
| Tekstkolom | `column__left` |
| Label boven de titel | `eyebrow eyebrow--light` (als een lichte variant nodig is) |
| Titel | `heading__section` op een passend heading-element |
| Introductie | `text text--lead` |
| CTA | `button__primary` |
| Beeldkolom | `column__right` met daarin `image image--cover` |

Dit voorbeeld benoemt de rol van het element. De inhoud van de tekst of afbeelding komt niet in de classname terecht. `card__title`, `card__text` en `card__image` worden alleen binnen een card gebruikt; algemene styles kunnen daar op hetzelfde element of op een kind bij komen.

## Vaste sectieopbouw

De standaardvolgorde in de Webflow Navigator is:

1. `section__{name}`
2. `padding__global`
3. `margin__global`
4. `max-width__global` (`width: 100%`, maximaal `80em`, gecentreerd)
5. Layoutwrapper, bijvoorbeeld `wrap_vertical`

Dit is de standaard voor vrijwel iedere sectie. De beschrijvende sectieclass staat op het buitenste `<section>`-element. Combo classes staan op hetzelfde element als hun basisclass. Voor een echt schermbreed element vervallen doorgaans `padding__global` en `max-width__global`; de verticale ruimte via `margin__global` blijft.

## Maatvoering en schaal

- Typografie, spacing en ontwerpafmetingen gebruiken in principe `em`.
- Voor schermvullende secties en elementen worden ook `dvh` en `dvw` gebruikt. Een element dat de ouder volledig vult, kan in procenten worden ingesteld.
- De onderstaande Osmo-schaal definieert een berekende `--size-font` op basis van de viewport en een ontwerpbreedte per breakpoint.
- Het desktopontwerp heeft een referentiebreedte van `1440` en een referentie-font-size van `16`.
- De berekende `--size-font` wordt toegepast als `font-size` op de `body`.

```css
/* ------------------------- Scaling System by Osmo [https://osmo.supply/] -------------------------  */

/* Desktop */
:root {
  --size-unit: 16; /* body font-size in design - no px */
  --size-container-ideal: 1440; /* screen-size in design - no px */
  --size-container-min: 992px;
  --size-container-max: 1920px;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
}

/* Tablet */
@media screen and (max-width: 991px) {
  :root {
    --size-container-ideal: 834; /* screen-size in design - no px */
    --size-container-min: 768px;
    --size-container-max: 991px;
  }
}

/* Mobile Landscape */
@media screen and (max-width: 767px) {
  :root {
    --size-container-ideal: 550; /* screen-size in design - no px */
    --size-container-min: 480px;
    --size-container-max: 767px;
  }
}

/* Mobile Portrait */
@media screen and (max-width: 479px) {
  :root {
    --size-container-ideal: 390; /* screen-size in design - no px */
    --size-container-min: 320px;
    --size-container-max: 479px;
  }
}
```

De aangeleverde Osmo-code definieert de variabele. In het project wordt `font-size: var(--size-font)` ook op de `body` toegepast. Op de ideale ontwerpbreedte is de body-font-size `16px`; een maat van `32px` uit dat ontwerp correspondeert dan met `2em` op een wrapper die de body-font-size erft. `em` is relatief aan de font-size van het element waarop de waarde staat. Geef de globale wrappers daarom geen eigen font-size als hun afmetingen vanaf de body moeten schalen.

### Ontwerpbreedtes per breakpoint

| Breakpoint | Bereik | Ideale ontwerpbreedte | Clamp voor berekening |
| --- | --- | ---: | --- |
| Desktop | Vanaf `992px` | `1440` | `992px`–`1920px` |
| Tablet | `768px`–`991px` | `834` | `768px`–`991px` |
| Mobile landscape | `480px`–`767px` | `550` | `480px`–`767px` |
| Mobile portrait | Tot `479px` | `390` | `320px`–`479px` |

## Layoutwrappers

`wrap_vertical` en `wrap_horizontal` zijn flexwrappers. De basisclasses regelen de richting en hebben op desktop en tablet standaard `gap: 2em` (medium). De combinatieclasses gelden voor beide wrappers.

| Gap | Desktop en tablet | Mobiel (`≤767px`) |
| --- | ---: | ---: |
| `gap--small` | `1em` | `0.5em` |
| Basis op beide wrappers | `2em` | `1em` |
| `gap--large` | `4em` | `2em` |

- Op `wrap_vertical` zetten `align--left` en `align--center` respectievelijk `align-items: flex-start` en `align-items: center`, plus de bijpassende `text-align`.
- Op `wrap_horizontal` zetten dezelfde classes respectievelijk `justify-content: flex-start` en `justify-content: center`, plus de bijpassende `text-align`.
- Combineer `align--center` en `space--between` niet op dezelfde horizontale wrapper; beide bepalen de verdeling langs de hoofdas.

Op een horizontale wrapper zet `space--between` de verdeling langs de hoofdas op `justify-content: space-between`.

`wrap_horizontal` wisselt op mobiel (maximaal `767px`) standaard naar `flex-direction: column`. Een `space--between`-combo wordt dan gereset naar `justify-content: flex-start`; de mobiele gap bepaalt de onderlinge ruimte. Voor `align--left` en `align--center` verplaatst de kinduitlijning op dat breakpoint naar `align-items`, zodat links en gecentreerd ook na het stapelen logisch blijven. Onderdelen die op mobiel naast elkaar moeten blijven, krijgen een bewuste componentuitzondering.

## Ruimte rond secties

| Wrapper | Desktop | Tablet | Mobiel (`≤767px`) |
| --- | ---: | ---: | ---: |
| `padding__global` (links en rechts) | `2em` | `1.5em` | `1em` |
| `margin__global` (boven en onder) | `6em` | `5em` | `4em` |

`margin__global` krijgt daarnaast de combinatieclasses `margin--small` en `margin--large`. De classnamen zijn hier in lowercase genoteerd, in lijn met `gap--small`.

| Marginvariant (boven en onder) | Desktop | Tablet | Mobiel (`≤767px`) |
| --- | ---: | ---: | ---: |
| `margin--small` | `3em` | `2.5em` | `2em` |
| Basis: `margin__global` | `6em` | `5em` | `4em` |
| `margin--large` | `8em` | `7em` | `6em` |

`margin__global` gebruikt werkelijk `margin-top` en `margin-bottom` voor deze waarden. `padding__global` gebruikt horizontale padding.

## Breedte en andere eenheden

`max-width__global` is de algemene container van maximaal `80em`. Lange tekstblokken krijgen daarnaast `max-width--text` met maximaal `48em`. Bij een tekstsectie staat de combo op de sectiecontainer. Bij een gemengde sectie met beeld, cards of andere brede inhoud staat een extra neutrale wrapper met `max-width__global max-width--text` rond alleen de tekst. Houd de font-size van die wrapper gelijk aan de body om de `48em` voorspelbaar te maken.

Gebruik `em` voor typografie, spacing en schaalbare ontwerpwaarden. Gebruik `dvh` en `dvw` wanneer een sectie of element zich aan de actuele viewport moet aanpassen. Gebruik `%` wanneer een element de beschikbare ruimte van de ouder moet vullen. Een schermvullende sectie krijgt standaard `height: 100dvh`. Als de inhoud hoger kan worden dan de viewport, vervang de vaste hoogte voor die sectie door een passende minimumhoogte of automatische hoogte om afsnijden te voorkomen.

## Containment van verticale margins

`margin__global` blijft echte marge. Om te voorkomen dat die boven- of ondermarge buiten de sectie valt, krijgt `padding__global` in de standaardopbouw `display: flow-root`. Ontbreekt `padding__global` bij een schermbreed element, dan krijgt de buitenste sectie zelf `display: flow-root`. Controleer bij secties met een achtergrond of de verticale ruimte binnen die achtergrond valt. Aangrenzende verticale marges kunnen volgens de [CSS-specificatie](https://www.w3.org/TR/CSS22/box.html#collapsing-margins) samenvallen.

## Volgende uitbreiding

De layoutbasis en de classpatronen voor de belangrijkste elementen zijn vastgelegd. De exacte stijlwaarden van typografie, cards, pills en knoppen en de gridregels zijn een volgende laag van het framework.

## Voorbeeldopbouw

### Standaardsectie

`section__{name}` → `padding__global` → `margin__global` → `max-width__global` → `wrap_vertical`

Een gecentreerde, ruimere verticale layout krijgt op de laatste wrapper bijvoorbeeld `wrap_vertical align--center gap--large`.

### Schermbreed element

`section__{name}` → `margin__global` → `wrap_horizontal`

Hier kunnen de kinderen de volledige viewportbreedte gebruiken; zet `display: flow-root` op de buitenste sectie om de marge te bevatten. Een achtergrondkleur op de sectie is op zichzelf geen reden om de contentwrappers weg te halen: de vraag is of de **inhoud** tot de schermrand loopt.
