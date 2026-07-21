# CLAUDE.md — `prod-cts` (IDFCTS production fork)

This branch is the **IDFCTS production fork** of `kafbat/kafka-ui`, forked at
upstream **v1.5.0**. It carries custom changes on top of upstream.

## Fork changelog — MUST stay current

[FORK-CHANGES.md](FORK-CHANGES.md) is the authoritative list of every
customization this fork adds on top of upstream. It is what we use to re-apply
our changes when updating to a newer kafbat-ui version.

**Rule:** Whenever you make a code change on `prod-cts` (any new feature, fix, or
customization that deviates from upstream), you MUST update
[FORK-CHANGES.md](FORK-CHANGES.md) **in the same commit**:
- Add or extend the relevant feature section (what changed, why, and the key
  files touched), and
- Append a row to the "Change log" table at the bottom.

Do not commit a fork customization without a corresponding FORK-CHANGES.md
update.

> This file and FORK-CHANGES.md are `prod-cts`-only. Do not port them upstream or
> onto the feature branches that feed the kafbat PRs.
