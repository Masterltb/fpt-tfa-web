# Tasks — 009: Multi-Objective Optimizer & Advanced Rationale

### Phase 1: Domain & Engine Interface Options [ ]
- [ ] Add optional `weights` parameter or model field to `RunFormationIn` and `MatchingEngine.form_teams`
- [ ] Verify `npm run typecheck` and Python lint/types pass with updated signatures

### Phase 2: CP-SAT Multi-Objective Formulation (`ortools_engine.py`) [ ]
- [ ] Implement availability overlap boolean decision variables ($avail\_slot[s, t]$) and reward total shared slots
- [ ] Implement role presence decision variables ($role\_present[r, t]$) and reward role diversity across teams
- [ ] Implement soft peer preference rewards for `preferred_teammates`
- [ ] Construct unified linear objective combining competency spread minimization with availability/role/preference maximization
- [ ] Build dynamic, detailed `rationale` string and `scores` breakdown dict (`mean_competency`, `common_slots`, `role_diversity`, `preference_score`) for each output `Team`

### Phase 3: Mock Engine & API Route Updates [ ]
- [ ] Update `MockEngine.form_teams` to generate equivalent `scores` breakdowns and detailed rationale strings
- [ ] Wire optional `weights` input in `POST /v1/cohorts/{cohort_id}/formations` (`routes_formation.py`)

### Phase 4: Testing & Verification [ ]
- [ ] Create `tests/test_multi_objective_engine.py` to test availability overlap, role diversity, and rationale formatting
- [ ] Run `.venv/Scripts/python -m pytest -q` — all existing + new tests must pass 100%
- [ ] Run frontend `npm run typecheck`, `npm test`, and `npm run build` inside `web/` to ensure full integration compatibility
