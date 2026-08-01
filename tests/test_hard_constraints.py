"""SC-001: hard constraints hold on generated feasible cohorts (R1, R2, R7)."""
from __future__ import annotations

import random
import unittest

from app.domain.models import Constraints, Project
from app.domain.rules import violations
from app.matching.mock_engine import MockMatchingEngine

from ._helpers import make_cohort

ENGINE = MockMatchingEngine()


class TestHardConstraints(unittest.TestCase):
    def test_generated_feasible_cohorts_never_violate(self):
        for trial in range(300):
            rng = random.Random(trial)
            n = rng.randint(6, 30)
            students = make_cohort(n, rng)
            project = Project(id="p", min_size=3, max_size=5)
            cons = Constraints()
            if n >= 8 and rng.random() < 0.5:
                a, b = rng.sample(range(n), 2)
                cons.cannot_pair.append((f"u{a}", f"u{b}"))
            formation = ENGINE.form_teams(students, project, cons, seed=trial)
            v = violations(formation, students, project, cons)
            self.assertEqual(v, [], msg=f"trial {trial} (n={n}): {v}")
            if formation.status == "ok":
                covered = {m for t in formation.teams for m in t.member_ids}
                covered |= {s for s, _ in formation.unassignable}
                self.assertEqual(covered, {s.id for s in students})

    def test_must_pair_kept_together(self):
        students = make_cohort(9, random.Random(1))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints(must_pair=[("u0", "u1")])
        f = ENGINE.form_teams(students, project, cons, seed=1)
        self.assertEqual(violations(f, students, project, cons), [])
        self.assertEqual(f.status, "ok")
        team_of = {m: t.id for t in f.teams for m in t.member_ids}
        self.assertEqual(team_of["u0"], team_of["u1"])

    def test_cannot_pair_kept_apart(self):
        students = make_cohort(9, random.Random(2))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints(cannot_pair=[("u0", "u1")])
        f = ENGINE.form_teams(students, project, cons, seed=2)
        self.assertEqual(violations(f, students, project, cons), [])
        if f.status == "ok":
            team_of = {m: t.id for t in f.teams for m in t.member_ids}
            self.assertNotEqual(team_of.get("u0"), team_of.get("u1"))


if __name__ == "__main__":
    unittest.main()
