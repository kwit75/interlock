# INTERLOCK · Google Workspace Add-on

Apps Script project that registers INTERLOCK as a Google Meet add-on. When
deployed, the add-on appears in Meet's Activities tray; clicking it opens
the INTERLOCK Workspace add-on iframe in Meet's sidePanel.

## Files

| Path | Purpose |
|---|---|
| `appsscript.json` | Manifest. Declares `addOns.googleMeet.web.sidePanelUri` pointing to the Next.js app. OAuth scopes for `meetings.space.readonly` and `meetings.events.readonly`. |
| `Code.gs` | Server-side callbacks. `onInterlockHomepage` returns a CardService card for the out-of-meeting surface. `onActivateMeetAddon` is the in-meeting entry. |

## Deploy (production)

Prerequisite: A paid Google Workspace tenant. Personal Gmail accounts cannot install Workspace add-ons that require Marketplace listing.

```bash
# 1. Install the Apps Script CLI
npm install -g @google/clasp
clasp login

# 2. Create the project
cd workspace-addon/
clasp create --type standalone --title "INTERLOCK · Meet Add-on"
clasp push

# 3. Open the project in the Apps Script editor
clasp open

# 4. In the editor:
#    Project Settings → Google Cloud Platform (GCP) Project → Change project
#    Set to the same GCP project that hosts your OAuth client (774485276930
#    for the public demo, or your tenant's GCP project for self-hosted).

# 5. Enable the Meet API in GCP
#    https://console.cloud.google.com/apis/library/meet.googleapis.com

# 6. Deploy as test
clasp deploy --description "INTERLOCK v1.0 test"

# 7. In Apps Script editor:
#    Deploy → Test deployments → Install
#    The add-on now appears in your Meet Activities tray.
```

## Deploy (self-hosted for a single Workspace tenant)

If you have a free 14-day Google Workspace trial:

1. Sign up at https://workspace.google.com/business/signup/welcome
2. Verify your domain
3. Repeat the production deploy steps above; the add-on is private to your tenant.

## Without Workspace deployment (demo-only)

The `appsscript.json` and `Code.gs` files in this directory are the **real
deployment artifacts** even if they're never pushed to Apps Script. They
are downloadable from the public site at:

- https://interlock-mu.vercel.app/workspace-addon/deployment.json (the published version of `appsscript.json` content)
- https://interlock-mu.vercel.app/how-it-connects (full integration architecture)

For the hackathon demo, the Chrome Extension (under `../chrome-extension/`)
provides the user-installable surface that doesn't require Workspace tenant
provisioning. The Workspace Add-on is the production target.

## Iframe URLs

The add-on points at three iframe URLs hosted by the public Next.js app:

| `appsscript.json` key | URL | Renders |
|---|---|---|
| `sidePanelUri` | `https://interlock-mu.vercel.app/meet/sidepanel` | Out-of-meeting sidebar |
| `sidePanelUriWhenActiveConference` | `https://interlock-mu.vercel.app/meet/sidepanel?conference=true` | In-meeting sidebar with live detector + agent panels |
| `mainStageUri` | `https://interlock-mu.vercel.app/meet/stage` | Full-tab takeover view (used during the cinematic detection arc) |

These routes accept query params to scope to the active tenant + conference.
