# IDFCTS Fork Changes (`prod-cts`)

This branch (`prod-cts`) is the **IDFCTS production fork** of
[`kafbat/kafka-ui`](https://github.com/kafbat/kafka-ui). It carries a set of
custom changes on top of an upstream release.

**Purpose of this file:** it is the authoritative list of *everything we changed
on top of upstream*. When you rebase / re-fork `prod-cts` onto a newer
kafbat-ui version, use this file as the checklist of customizations that must be
re-applied (or verified as still present) after the update.

> ⚠️ **Keep this file up to date.** Every time a new custom change is committed
> to `prod-cts`, add it to the relevant section below (or add a new section).
> This is enforced by a rule in [CLAUDE.md](CLAUDE.md).

---

## Fork base

- **Upstream base:** kafbat/kafka-ui **v1.5.0** (commit `afc9c918`)
- **Remotes:** `origin` = `IDFCTS/kafka-ui`, `upstream` = `kafbat/kafka-ui`
- To see the raw list of our commits at any time:
  ```bash
  git log --oneline --reverse $(git merge-base prod-cts upstream/main)..prod-cts
  ```

---

## 1. Controllable table refresh (frontend)

**What:** A reusable refresh control — a Grafana-style split button (manual
**Refresh** + an auto-refresh interval menu: Off / 2s / 5s / 10s / 15s) — added
to the main list pages. Auto-refresh polls in the background and the manual
button forces an immediate refetch. Also disables involuntary refetching so the
tables only refresh when the user asks or on the chosen interval.

**Ported from:** our PR to kafbat `IDFCTS:feature/controllable-table-refresh`
(issues #472 / #4027 / #1009). Cherry-picked onto `prod-cts`.

**Pages wired up:** Topics list, Consumer Groups list, Schema Registry list,
Kafka Connect connectors list.

**Key files:**
- `frontend/src/components/App.tsx` — global react-query defaults now set
  `refetchOnWindowFocus: false` and `refetchOnReconnect: false`
  (exported as `queryClientDefaultOptions`).
- `frontend/src/lib/hooks/useRefreshRate.ts` — reads the interval from
  localStorage and turns it into a react-query `refetchInterval`.
- `frontend/src/components/common/TableRefresh/` — `TableRefresh.tsx`,
  `TableRefresh.styled.ts` (the split-button control).
- `frontend/src/components/common/RefreshRateSelect/RefreshRateSelect.tsx` —
  `RefreshRateStorageKey` union (the allowed localStorage keys).
- `frontend/src/components/common/Icons/RefreshIcon.tsx`.
- List pages: `Topics/List/ListPage.tsx` + `Topics/List/TopicTable.tsx`,
  `ConsumerGroups/List.tsx`, `Schemas/List/List.tsx`,
  `Connect/List/ListPage.tsx`.
- `frontend/src/lib/hooks/api/topics.ts` — `useTopics` accepts query options.

**Behavior notes / things to re-check on upgrade:**
- The **Topics list** uses its own localStorage key
  `topics-list-refresh-rate`, deliberately distinct from `topics-refresh-rate`
  which the *topic-detail Consumer Groups tab* uses for lag polling. Do **not**
  merge these two keys — sharing them makes the two controls overwrite each
  other. (This was a bug found in review and fixed before porting.)
- Disabling `refetchOnWindowFocus`/`refetchOnReconnect` is **app-wide**, so it
  affects every page, not just the four list pages.
- The full-page loader on the list pages was narrowed from
  `isLoading || isRefetching` to `isLoading` only, so a background refetch /
  pagination no longer blanks the page (only the button spinner shows).

---

## 2. Custom ACL form enhancements (frontend + backend)

**What:** Extensions to the Custom ACL creation flow.

- **DELETE / ALTER_CONFIGS for PREFIXED topic ACLs** — the Custom ACL form
  allows the `DELETE` and `ALTER_CONFIGS` operations on `PREFIXED` topic
  resource patterns.
- **Optional Transaction ID for producer ACLs** — leaving the Transaction ID
  empty in the "For Producers" flow grants all transactional IDs (allow-all)
  instead of being required. Includes a themed `InputHint` explaining this.

**Key files:**
- Backend: `api/.../controller/AclsController.java`,
  `api/.../service/acl/AclsService.java` (+ `AclsServiceTest.java`),
  `api/.../resources/static/openapi/kafbat-ui-api.yaml`,
  `contract-typespec/api/acls.tsp`.
- Frontend: `frontend/src/components/ACLPage/Form/CustomACL/*`,
  `ACLPage/Form/ForProducers/*`, `ACLPage/Form/ForConsumers/*`,
  `ACLPage/Form/ForKafkaStreamApps/Form.tsx`, `ACLPage/Form/Form.tsx`,
  `ACLPage/lib/*`, `frontend/src/lib/hooks/api/acl.ts`.

---

## 3. Configurable documentation navbar buttons (frontend + backend)

**What:** Configurable **"Official Docs"** and **"Team Docs"** buttons in the
navbar, with the target URLs supplied via environment configuration.

**Key files:**
- `frontend/src/components/NavBar/NavBar.tsx`,
  `frontend/src/components/common/Icons/ExternalLinkIcon.tsx`,
  `frontend/src/components/common/Logo/Logo.tsx`,
  `frontend/src/lib/constants.ts`.
- Backend static/config serving: `api/.../controller/StaticController.java`.

---

## 4. Static version display

**What:** The `Version` component is simplified to show a static `v1.5.0`
instead of the upstream dynamic version/commit lookup.

**Key files:** `frontend/src/components/Version/Version.tsx`.

> On upgrade, decide whether to keep pinning the version string or restore the
> upstream dynamic version display.

---

## 5. Baseline restore (housekeeping)

**What:** Restored a few frontend files that had been broken by an automated
(Copilot) change back to the clean v1.5.0 baseline. Not a feature — listed for
completeness so it isn't mistaken for a customization to preserve.

**Key files:** `frontend/src/components/Brokers/BrokersList/BrokersList.tsx`,
`frontend/src/components/Schemas/Details/__test__/Details.spec.tsx`, and other
files reset during the `v1.5.0` port.

---

## Change log (append newest at the bottom)

| Date | Area | Summary |
|------|------|---------|
| 2026-07-21 | Table refresh | Ported the controllable-table-refresh feature from the kafbat PR onto `prod-cts` (with the `topics-list-refresh-rate` collision fix). |
