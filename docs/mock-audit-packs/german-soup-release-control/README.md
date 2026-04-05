# German Soup Release-Control Mock

This mock document is designed for `Auditor` mode testing on a pre-release manufacturer scenario.

Goal:
- test release hold judgment
- test allergen / label / wrong-pack findings
- test whether the auditor treats this as a prompt-and-document-based preliminary audit

Suggested prompt:

`Audit this German soup manufacturer before release. Use only the uploaded file as evidence where relevant, and do not assume records or controls that are not shown. Give findings, objective evidence, severity, immediate containment, corrective actions, and evidence needed to close.`

Upload options:
- `german-soup-release-audit-pack.txt`
- `german-soup-release-audit-pack.docx`

Expected pressure points:
- new intentional allergens: celery and milk
- allergen matrix not updated
- old packaging still available on the line
- artwork approval not complete
- release checklist not fully signed off
