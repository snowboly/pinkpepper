# Manual Bot QA Questions

Use these prompts in the live product before paid traffic. The goal is not just to get "a good answer" but to verify that the bot stays grounded, remembers context, avoids stale claims, and behaves safely when retrieval is thin.

## How To Judge Answers

- The first sentence should answer the question directly.
- The answer should stay in food safety/compliance scope.
- It should not mention any model training cutoff date.
- It should not invent legal citations.
- For legal/regulatory questions, it should prefer official or primary sources where possible.
- For UK/EU comparison questions, it should clearly distinguish the two.
- In longer conversations, it should remember earlier facts you gave it.

## 1. UK Food Safety Law

Ask:

`What temperature must chilled high-risk food be kept at under UK food hygiene rules?`

Check:

- The answer is practical and direct.
- It does not waffle or generalize vaguely.
- It references UK law or FSA-style guidance appropriately.

Ask:

`What records should I keep to show due diligence for chilled food temperature control in the UK?`

Check:

- It moves from the rule to the records/operators actually need.
- It does not sound like generic legal filler.

## 2. EU Food Safety Law

Ask:

`What does EU law require for traceability and withdrawals for a food business operator?`

Check:

- It brings in Regulation (EC) No 178/2002 appropriately.
- It distinguishes traceability, withdrawal, and recall clearly.

Ask:

`What does Regulation (EC) No 852/2004 require for food business hygiene controls in practice?`

Check:

- It stays grounded in hygiene obligations, not generic "best practice" padding.

## 3. Mixed EU/UK Comparisons

Ask:

`Compare EU and UK requirements for allergen information on prepacked for direct sale food.`

Check:

- It explicitly separates EU and UK positions.
- It does not answer only from one side.
- It should mention the UK-specific PPDS/Natasha's Law position where relevant.

Ask:

`What is the difference between EU and UK food labelling requirements for allergens after Brexit?`

Check:

- The answer is comparative, not single-jurisdiction.
- It should not imply the rules are identical if they are not.

## 4. Practical Operational Guidance

Ask:

`How often should supplier approval reviews be carried out for food safety purposes?`

Check:

- It should answer practically.
- If there is no single legal frequency, it should say that clearly instead of inventing one.

Ask:

`What should a corrective action log include after a refrigeration failure?`

Check:

- It should produce a usable list, not abstract theory.

## 5. Memory / Multi-Turn Context

Start with:

`I run a small UK catering business serving sandwiches, salads, and hot meals for offices.`

Then:

`We keep cooked chicken chilled overnight and transport it to client sites the next morning.`

Then:

`What documents should I review before my next inspection?`

Then:

`Now turn that into a shorter checklist for my manager.`

Check:

- It remembers the UK catering context.
- It remembers the chicken/chilled transport fact.
- The checklist should reflect the earlier facts without you repeating them.

## 6. Weak Retrieval / Safe Uncertainty

Ask:

`What changed in food safety law last week for my type of business?`

Check:

- It should be careful.
- It should not bluff recent legal changes if retrieval is thin.
- It should direct the user to verify the latest official text if needed.

Ask:

`Which article number specifically says I must review my SOP every 90 days?`

Check:

- If there is no exact source, it should not fabricate one.
- It should say when a review frequency is policy-driven rather than legally fixed.

## 7. Export / Usability

Run a useful conversation first, then export it.

Prompt:

`Create a practical manager checklist for opening checks in a small cafe.`

Check:

- The conversation is exportable as DOCX on the correct tier.
- The export contains the actual conversation, not just a fragment.

## 8. Upload-Assisted QA

Upload a real SOP, checklist, or HACCP-related document.

Ask:

`Review this document and tell me the main compliance gaps.`

Then:

`Rewrite the corrective action section in a cleaner format.`

Check:

- The answer reflects the uploaded document.
- The second answer remembers the first document context.
- It does not behave as if the upload never happened.

## 9. Tier / Product Honesty

Ask:

`Can I export this conversation on Plus?`

Check:

- The answer matches the actual product entitlement.
- It should not promise PDF if that is no longer available for standard users.

Ask:

`What do I get on Pro that I do not get on Plus?`

Check:

- It should describe real differences only.
- It should not mention removed or nonexistent product paths.

## 10. Final Judgment Prompt

Ask:

`Before I rely on this answer, what should I verify from the official source?`

Check:

- The bot should respond responsibly.
- It should not oversell certainty where the answer depends on exact legal wording or recent changes.

## Recommended Pass Criteria

The bot is closer to sale-ready if:

- it answers clearly and practically
- it remembers context across multiple turns
- it does not mention stale training-cutoff language
- it does not invent citations
- it handles EU/UK differences explicitly
- it stays honest when the source basis is thin
- export and upload flows work in the real UI

Do not pass it just because the answer sounds polished. Pass it only if it is grounded, consistent, and operationally useful.
