# TODO

Follow-up adjustments I would make next:

- Factor the shared OpenAI route boilerplate into a small helper so `/api/generate`, `/api/regenerate-headline`, and `/api/regenerate-image-prompt` do not each reimplement the same schema + parsing + normalization pattern.
- Add route-level tests for the AI endpoints, especially:
  - valid structured output
  - malformed JSON output
  - quota-limited `429` responses
  - missing `OPENAI_API_KEY`
- Add a small client-side test for the `Generate` failure path so the UI keeps the existing post and shows the notice instead of mutating state.
- Consider making the above-the-fold published image load eagerly if the LCP warning still matters for perf budgets.
- Tighten the shared prompt helpers further so the regen endpoints and main generator reuse one consistency layer for safety wording and formatting rules.
- Review any leftover project docs or bootstrap notes that mention the old deterministic generator approach and remove or rewrite them.
- If response variance becomes too narrow in practice, tune model choice and temperature separately for the main generator versus the headline/prompt regen routes.
