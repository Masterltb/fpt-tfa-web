# Product Requirements Document — Team Formation Assistant

- **Version:** 1.0.0  ·  **Date:** 2026-07-16  ·  **Status:** draft
- **Related:** `docs/BRD.md`, `docs/domain.md`, `docs/rbac.md`, `docs/api-contract.md`,
  `docs/constitution.md`, feature spec `specs/001-team-suggestion/spec.md`
- **Priority:** MoSCoW (Must / Should / Could / Won't-yet)

---

## 1. Business Capabilities

The product-level capabilities that realize the BRD objectives. Each maps to business goals
and is delivered by the functional requirements in §2.

| ID | Capability | Delivers (BRD) | Notes |
|----|------------|----------------|-------|
| BC-01 | **Student profile management** | O5, BR-11 | Skills, major, experience, availability, preferences, desired roles |
| BC-02 | **Constraint capture** | BR-02 | Student proposes must/cannot-pair; lecturer approves |
| BC-03 | **Cohort & project setup** | O1 | Size band, required skills/roles, weights |
| BC-04 | **AI team formation** | O1, O2, O5 | Balanced teams satisfying hard constraints |
| BC-05 | **Explainable suggestions** | O4, BR-10 | Rationale + traded-off preferences per team |
| BC-06 | **Review & override** | O3, BR-09 | Lecturer edits and commits final teams |
| BC-07 | **Reproducibility & audit** | O4, BR-08 | Versioned, seeded, logged runs |
| BC-08 | **Access control & privacy** | BR-11, BR-12, BR-13 | Per-role, per-ownership; no protected attributes |

---

## 2. Functional Requirements

Grouped by capability. "Trace" links to business rules (BR) / objectives (O) and, where
applicable, to the feature spec's requirements (spec FR-###).

### BC-01 Student profile management
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-01 | A student can create/update their own profile (skills+proficiency, major, experience, availability, preferences, desired roles). | Must | Saved values persist; invalid input rejected at the boundary | BC-01 |
| FR-02 | A student can view only their own profile and the teams they belong to. | Must | Access to another student's profile returns 403 | BR-11, spec FR-010 |

### BC-02 Constraint capture
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-03 | A student can propose a must-pair / cannot-pair constraint involving themselves. | Should | Proposal recorded as pending | BR-02 |
| FR-04 | A lecturer approves/rejects proposed constraints before a run uses them. | Should | Only approved constraints affect a run | BR-02 |

### BC-03 Cohort & project setup
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-05 | A lecturer can create a cohort and add projects with a team-size band and required skills/roles. | Must | Project stores `[min,max]` and requirements | BR-01 |
| FR-06 | A lecturer can set formation weights or accept defaults. | Should | Defaults applied when unset | BRD assumption |

### BC-04 AI team formation
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-07 | A lecturer who owns the cohort can trigger a formation run for a project. | Must | Run starts; non-owner gets 403 | BR-13, spec FR-001 |
| FR-08 | Produced teams satisfy the size band. | Must | Property test over generated cohorts | BR-01, spec FR-002 |
| FR-09 | No team violates a must-pair / cannot-pair constraint. | Must | Property test: 0 violations | BR-02, spec FR-003 |
| FR-10 | Every eligible student is assigned exactly once or flagged unassignable with a reason. | Must | No silent drops | BR-07, spec FR-004 |
| FR-11 | Competency/experience are balanced across teams as far as hard constraints allow. | Must | Balance beats random baseline on average | BR-04, spec FR-008 |
| FR-12 | When hard constraints are infeasible, the run reports the conflicting constraints instead of a partial result. | Must | 422 names conflicts | BR-03, spec FR-007 |

### BC-05 Explainable suggestions
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-13 | Each suggested team includes a readable rationale and lists traded-off soft preferences. | Must | Rationale present for 100% of teams | BR-10, spec FR-005 |

### BC-06 Review & override
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-14 | A lecturer can override any assignment; the override becomes the committed result. | Must | Committed teams reflect overrides, not the AI | BR-09, spec FR-009 |
| FR-15 | A student can view their committed team and its short reason. | Should | Team + reason visible to members only | BR-11 |

### BC-07 Reproducibility & audit
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-16 | A run is reproducible from inputs + seed and is stored as an immutable version. | Must | Same inputs+seed → identical teams | BR-08, spec FR-006 |
| FR-17 | Every run logs inputs, seed, and result version for audit. | Should | Log entry exists per run | O4 |

### BC-08 Access control & privacy
| ID | Requirement | Priority | Acceptance | Trace |
|----|-------------|----------|------------|-------|
| FR-18 | Every protected endpoint enforces role + object-ownership server-side. | Must | Unauthorized/other-owner → 403 | BR-11/BR-13, spec SC-004 |
| FR-19 | Protected/sensitive attributes are never used as matching signals or returned to peers. | Must | Signals exclude protected attributes | BR-12 |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement | Target / acceptance | Trace |
|----|----------|-------------|---------------------|-------|
| NFR-01 | Performance | Formation run for a 60-student cohort completes within the effort target. | ≤ 2 min p95 (excl. review) | O1, spec SC-003 |
| NFR-02 | Reproducibility | Deterministic given inputs + seed. | Byte-identical across runs | BR-08, spec SC-002 |
| NFR-03 | Correctness | Hard constraints never violated. | 100% over property tests | BR-01/02/07, spec SC-001 |
| NFR-04 | Security / Privacy | AuthN + per-request authZ; no protected attributes; no cross-student leakage. | 403 on unauthorized; audits pass | BR-11/12/13 |
| NFR-05 | Explainability | Suggestions are human-auditable. | Rationale on 100% of teams | BR-10 |
| NFR-06 | Reliability | A failed run leaves no partial committed formation. | Atomic commit; safe retry | BR-07 |
| NFR-07 | Usability | Lecturer completes run→review→commit without training. | Task success in usability test | O1 |
| NFR-08 | Accessibility | Web UI meets WCAG 2.1 AA. | Automated + manual a11y checks | policy |
| NFR-09 | Scalability | Handles cohorts up to the assumed size band without redesign. | Meets NFR-01 at max assumed size | BRD assumption |
| NFR-10 | Maintainability | Domain pure; optimizer behind an interface; typed + linted. | mypy/ruff/tsc clean; boundaries hold | code-style |
| NFR-11 | Auditability | Runs are logged and reproducible. | Log + version per run | O4 |

---

## Traceability summary

`BRD objective (O#) → capability (BC-##) → functional (FR-##) / non-functional (NFR-##) →
business rule (BR-##) / domain rule (R#) → feature spec (spec FR-###/SC-###) → tests`.
This chain lets Verify confirm every requirement is covered and every test traces back to a
business reason.
