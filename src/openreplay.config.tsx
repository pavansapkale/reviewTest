import OpenReplay from "@openreplay/tracker"

//OPENREPLAY TRACKER
const tracker = new OpenReplay({
  projectKey: import.meta.env.VITE_APP_OPENREPLAY_PROJECT_KEY,
  ingestPoint: import.meta.env.VITE_APP_OPENREPLAY_DOMAIN_URL + "/ingest",
  network: {
    sessionTokenHeader: false,
    failuresOnly: true,
    ignoreHeaders: ["Authorization"],
    capturePayload: true,
    captureInIframes: false,
  },
  defaultInputMode: 0,
  obscureTextNumbers: false,
  obscureTextEmails: false,
  obscureInputNumbers: false,
  obscureInputDates: false,
  obscureInputEmails: false,
  __DISABLE_SECURE_MODE: false
})

export default tracker