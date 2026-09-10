# Narration audio

This directory holds the generated MP3 narration for each `/learn/*` step
(`intro.mp3`, `payoff.mp3`, ...). They're generated from the scripts in
`content/narration/*.txt` — see `scripts/generate-audio.mjs` and the
`npm run generate-audio` command — and are not committed as placeholders.

Run `npm run generate-audio` locally (after the one-time Piper TTS setup
described at the top of that script) to produce them. Until they exist, the
guided tour UI still works — play just no-ops with no narration.
