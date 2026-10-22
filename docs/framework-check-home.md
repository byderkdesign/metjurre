# Met Jurre: homepage vergeleken met het DONDRS-framework (v2.0)

Site: Met Jurre (`67dbf878769345aebb61d262`), pagina Home. Bekeken op 21 oktober 2026 via de Webflow-MCP. Ik heb alleen gekeken en nog niets aangepast. De stijlwaarden zelf (padding, margins, de Osmo-schaal) heb ik nog niet gecontroleerd, alleen de opbouw en de classnamen.

## Opbouw per sectie

| Sectie | Nu | Volgens framework |
| --- | --- | --- |
| Hero | `Section-hero` → `Hero-wrap` → `container` → `Vertical-wrap V--medium align-center` | `section__hero` → `padding__global` → `margin__global` → `max-width__global` → `wrap_vertical align--center` |
| Logobalk | `Section-scroller` → `Carousel Horizontal` met twee `Carousel Placeholder`-beelden | Schermbreed: `section__logos` → `margin__global` → wrapper, met beelden als `image image--contain`. Nu staan er nog placeholderlogo's (Flowbase, Webflow). |
| Podcast | `Section-podcast` → `global_margin` → `Global_padding` → `container medium` → `Vertical-wrap V--xxLarge` | `section__podcast` → `padding__global` → `margin__global` → `max-width__global` → `wrap_vertical gap--large`. **De volgorde is nu omgedraaid**: margin zit buiten padding. |
| Footer | Ontbreekt | `section__footer` met `link__footer` |
| Contact / formulier | Ontbreekt | `section__contact` met `form`, `form__field`, `form__label`, `form__input`, `form__submit button__primary` |

## Classnamen: van naar

| Nu | Wordt |
| --- | --- |
| `Global_padding` | `padding__global` |
| `global_margin` | `margin__global` |
| `container` | `max-width__global` |
| `container medium`, `max-width MW--Medium` | `max-width__global max-width--text` (te checken: is `medium` echt 48em?) |
| `Vertical-wrap` | `wrap_vertical` |
| `Horizontal-wrap`, `Horizontal_wrap` (twee varianten!) | `wrap_horizontal` |
| `V--small`, `small` | `gap--small` |
| `V--medium` | weg (dat is de basis-gap) |
| `V--xLarge`, `V--xxLarge` | `gap--large` (het framework kent geen xl/xxl) |
| `align-center` | `align--center` |
| `spacebetween` | `space--between` |
| `align-top`, `press-bottom` | Niet in het framework. Weghalen of als componentuitzondering houden. |
| `Podcast-card`, `Podcast-card_thumbnail`, `Podcast-card_nr`, `Podcast-card_name`, `Podcast-card_time` | `card`, `card__image` (met `image image--cover`), `card__title heading__card`, `card__text text text--small` |
| `Primary Button` / `Secondary Button` (componenten) | `button__primary` / `button__secondary` binnen het component |

## Tekst en headings

- H1 in de hero heeft geen rolclass. Wordt `heading__hero`.
- De podcastkop is een **H3** zonder H2 ervoor. Wordt een H2 met `heading__section`.
- De titel in de podcastcard is een **H6**. Wordt een H3 met `card__title heading__card`.
- Paragrafen hebben geen class. Introteksten worden `text text--lead`, de rest `text text--body`.
- Het losse woordje "Min" na de speelduur kan in dezelfde tekst als de tijd ("42 min").

## Conversie (los van het framework)

- "Afspraak plannen", "Contact", "Alle afleveringen", het logo en alle menu-items linken naar `#`.
- Er is geen formulier, geen footer en er zijn geen contactgegevens.
- Er zijn geen pagina's per dienst (DISC-analyse, leiderschapscoaching, trainingen, coaching), terwijl het menu ze wel noemt.
- Er staan geen reviews of cases op de homepage, terwijl de CMS-collecties ervoor wel bestaan.
