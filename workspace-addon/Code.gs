/**
 * INTERLOCK · Google Workspace Add-on (Apps Script)
 *
 * Registers the add-on for Google Meet. When invoked from Meet's Activities
 * tray, the add-on uses the `web.sidePanelUri` from appsscript.json to render
 * the INTERLOCK plugin iframe. This file holds the server-side callbacks
 * Apps Script invokes — most of the actual UI is the Next.js app at
 * https://interlock-mu.vercel.app/meet/sidepanel.
 *
 * Deploy:
 *   1. clasp clone <SCRIPT_ID>      # or `clasp create` from this directory
 *   2. clasp push
 *   3. clasp deploy --description "INTERLOCK v1.0"
 *   4. Google Workspace admin console → Marketplace → list as private add-on
 *      OR Apps Script editor → Deploy → Test deployments → Install
 */

/**
 * Homepage trigger fires when the user opens the add-on from outside a
 * meeting (e.g., from the Apps Script add-on settings).
 *
 * @param {Object} e - Apps Script event object.
 * @return {Card[]} A standard CardService configuration card.
 */
function onInterlockHomepage(e) {
  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("INTERLOCK")
        .setSubtitle("CFO Wire-Fraud Defense · v1.0")
        .setImageUrl("https://interlock-mu.vercel.app/logo-32.png"),
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "INTERLOCK monitors every Google Meet call where money moves. " +
              "On detection of synthetic media, the wire is frozen automatically " +
              "and an SEC Form 8-K Item 1.05 disclosure is drafted for the " +
              "authorized officer to sign.",
          ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText("Open dashboard")
            .setOpenLink(
              CardService.newOpenLink().setUrl(
                "https://interlock-mu.vercel.app/",
              ),
            ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText("Architecture & integration")
            .setOpenLink(
              CardService.newOpenLink().setUrl(
                "https://interlock-mu.vercel.app/how-it-connects",
              ),
            ),
        ),
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Status")
        .addWidget(
          CardService.newKeyValue()
            .setTopLabel("Detector")
            .setContent("detect-3b-omni-v2.1 · 1.1% EER")
            .setIcon(CardService.Icon.STAR),
        )
        .addWidget(
          CardService.newKeyValue()
            .setTopLabel("Mode")
            .setContent("CACHED · live toggle in plugin footer")
            .setIcon(CardService.Icon.CLOCK),
        )
        .addWidget(
          CardService.newKeyValue()
            .setTopLabel("Tenant")
            .setContent(
              Session.getActiveUser().getEmail() || "unauthenticated",
            )
            .setIcon(CardService.Icon.PERSON),
        ),
    )
    .build();
  return [card];
}

/**
 * Optional: invoked when the add-on is activated from inside an active
 * Google Meet conference. The real UI is the sidePanelUriWhenActiveConference
 * iframe — this function just authorises the session.
 *
 * @param {Object} e - Apps Script event object.
 * @return {Object} An empty navigation; the sidePanel iframe handles the rest.
 */
function onActivateMeetAddon(e) {
  // The Meet Add-ons SDK takes over from here via the sidePanelUri.
  return CardService.newActionResponseBuilder().build();
}
