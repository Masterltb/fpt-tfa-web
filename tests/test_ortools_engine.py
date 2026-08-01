"""Real OR-Tools engine: same hard-constraint guarantees as the mock (R1/R2/R7), determinism
(R8), and honest infeasibility reporting. Skipped if OR-Tools is not installed."""
from __future__ import annotations

import random
import unittest

from app.domain.models import Constraints, Project
from app.domain.rules import violations

from ._helpers import make_cohort

try:
    from app.matching.ortools_engine import OrToolsMatchingEngine

    _HAVE_ORTOOLS = True
except Exception:  # pragma: no cover
    _HAVE_ORTOOLS = False


@unittest.skipUnless(_HAVE_ORTOOLS, "ortools not installed")
class TestOrToolsEngine(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = OrToolsMatchingEngine(max_time_s=3.0)

    def test_generated_feasible_never_violate(self) -> None:
        for trial in range(30):
            rng = random.Random(1000 + trial)
            n = rng.randint(6, 15)
            students = make_cohort(n, rng)
            project = Project(id="p", min_size=3, max_size=5)
            cons = Constraints()
            if n >= 8 and rng.random() < 0.5:
                a, b = rng.sample(range(n), 2)
                cons.cannot_pair.append((f"u{a}", f"u{b}"))
            f = self.engine.form_teams(students, project, cons, seed=trial)
            self.assertEqual(violations(f, students, project, cons), [], msg=f"trial {trial} (n={n})")
            if f.status == "ok":
                covered = {m for t in f.teams for m in t.member_ids}
                self.assertEqual(covered, {s.id for s in students})

    def test_must_and_cannot_pair(self) -> None:
        students = make_cohort(9, random.Random(11))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints(must_pair=[("u0", "u1")], cannot_pair=[("u2", "u3")])
        f = self.engine.form_teams(students, project, cons, seed=11)
        self.assertEqual(violations(f, students, project, cons), [])
        self.assertEqual(f.status, "ok")
        team_of = {m: t.id for t in f.teams for m in t.member_ids}
        self.assertEqual(team_of["u0"], team_of["u1"])
        self.assertNotEqual(team_of["u2"], team_of["u3"])

    def test_determinism_same_seed(self) -> None:
        students = make_cohort(12, random.Random(12))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints()
        f1 = self.engine.form_teams(students, project, cons, seed=7)
        f2 = self.engine.form_teams(students, project, cons, seed=7)
        self.assertEqual([t.member_ids for t in f1.teams], [t.member_ids for t in f2.teams])

    def test_infeasible_reported(self) -> None:
        students = make_cohort(2, random.Random(13))  # too few for min_size 3
        project = Project(id="p", min_size=3, max_size=5)
        f = self.engine.form_teams(students, project, Constraints(), seed=13)
        self.assertEqual(f.status, "infeasible")


if __name__ == "__main__":
    unittest.main()
