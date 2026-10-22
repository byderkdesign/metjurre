# Spotify-koppeling instellen

Elke dag om 08:00 (Nederlandse zomertijd, 07:00 in de winter) haalt GitHub de afleveringen van de TWIcast op bij Spotify. Nieuwe afleveringen komen automatisch live in de Webflow-collectie **TWI Podcasts**, met titel, nummer, lengte, beschrijving, cover en Spotify-link. Bestaande items worden niet aangepast.

Je hoeft dit maar één keer in te stellen. Het kost ongeveer 10 minuten.

## 1. Spotify developer-app aanmaken

1. Ga naar [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) en log in met een Spotify-account (mag elk account zijn).
2. Klik op **Create app**.
3. Vul in:
   - App name: `Met Jurre website`
   - App description: `Afleveringen ophalen voor de website`
   - Redirect URI: `https://met-jurre-disc.webflow.io` (wordt niet gebruikt, maar is verplicht)
   - Vink **Web API** aan.
4. Open de app, ga naar **Settings** en kopieer de **Client ID** en (via *View client secret*) de **Client secret**.

## 2. Webflow API-token aanmaken

1. Open in Webflow de site **Met Jurre** → **Site settings** → **Apps & integrations**.
2. Scroll naar **API access** en klik op **Generate API token**.
3. Naam: `Spotify sync`. Zet **CMS** op **Read and write**. De rest mag op *No access*.
4. Kopieer het token. Je ziet het maar één keer.

## 3. Geheimen in GitHub zetten

1. Ga naar [github.com/byderkdesign/metjurre/settings/secrets/actions](https://github.com/byderkdesign/metjurre/settings/secrets/actions).
2. Klik drie keer op **New repository secret** en maak aan:

| Name | Waarde |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | Client ID uit stap 1 |
| `SPOTIFY_CLIENT_SECRET` | Client secret uit stap 1 |
| `WEBFLOW_API_TOKEN` | Token uit stap 2 |

## 4. Testen

1. Ga naar het tabblad **Actions** → **Spotify naar Webflow** → **Run workflow**.
2. Zet eerst **Alleen tonen wat er zou gebeuren** aan. In het logboek zie je welke afleveringen er nieuw zijn.
3. Klopt het? Draai hem dan nog een keer zonder dat vinkje. Daarna loopt hij elke ochtend vanzelf.

De dagelijkse taak werkt pas als deze code op de `main`-branch staat.
