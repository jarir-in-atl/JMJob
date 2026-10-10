# Earn Page Video Income Redesign Plan

## Reference review

The BII Reward Zone uses a prominent video-earning header, balance and daily activity summaries, one clear watch card, a visible countdown and claim action, and a short explanation of the steps. Its admin area lets administrators configure video links, duration, active state, and ordering. JMJob already has a rewarded-video API, server-timed claims, user and campaign limits, and an admin page that accepts an uploaded video or an HTTPS URL.

## Stages

1. **Redesign the user earn page** in `earnap-client/src/views/EarnPage.js`: add a responsive video-income hero, readable reward and daily progress summaries, a focused video list with duration/reward/availability, a visible empty or paused state, and a short how-it-works section. Keep the existing reward API, limits, and server-timed claim flow.
2. **Support external video destinations** in the watch modal: play uploaded/direct media files in the native video element, embed recognized YouTube and Dailymotion video URLs, and show a safe external-open fallback for other HTTPS sites such as Likee or sites that disallow embedding. Preserve the server-side claim timer and make it clear when a link opens outside JMJob.
3. **Clarify admin video setup** in `earnap-client/src/views/AdminPage.js`: label the URL field as a hosted-video or external-site link, explain supported playback/fallback behavior, and keep upload and URL options mutually exclusive. The existing `video_url` database field and admin endpoint already cover HTTPS destinations, so no schema migration is planned unless implementation review reveals a gap.
4. **Localize the new interface** through the existing English/Bengali dictionary in `earnap-client/src/i18n.js`, so the redesign follows the selected app language.
5. **Build the active frontend** with `cd earnap-client && npm run build`, inspect the resulting diff, and report local build status separately from production deployment. Do not run the project test suite as part of this task.

## Acceptance criteria

- `/earn` presents a responsive, mobile-friendly video-earning experience in English and Bengali.
- Eligible videos show their configured reward, watch duration, and campaign availability; claim still goes through JMJob's existing server-timed endpoint.
- Uploaded/direct video files, YouTube embeds, and Dailymotion embeds have appropriate players; other HTTPS links can be opened externally.
- Administrators can continue uploading a video or supplying an HTTPS video/site URL with the current reward, duration, and limit controls.
- Frontend build succeeds locally; no production upload or live-site verification is implied.
