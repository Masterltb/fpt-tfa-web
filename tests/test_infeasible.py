"""FR-007: infeasibility is reported (never a crash, never an invalid formation)."""
from __future__ import annotations

import random
import unittest

from app.domain.models import Constraints, Project
from app.matching.mock_engine import MockMatchingEngine

from ._helpers import make_cohort

ENGINE = MockMatchingEngine()


class TestInfeasible(unittest.TestCase):
    def test_must_pair_unit_larger_than_max(self):
        students = make_cohort(6, random.Random(3))
        project = Project(id="p", min_size=3, max_size=5)
        # a forced chain of 6 exceeds max_size 5
        cons = Constraints(must_pair=[("u0", "u1"), ("u1", "u2"), ("u2", "u3"), ("u3", "u4"), ("u4", "u5")])
        f = ENGINE.form_teams(students, project, cons, seed=3)
        self.assertEqual(f.status, "infeasible")
        self.assertTrue(f.conflicts)
        self.assertEqual(f.teams, [])

    def test_cohort_too_small_for_min(self):
        students = make_cohort(2, random.Random(4))
        project = Project(id="p", min_size=3, max_size=5)
        f = ENGINE.form_teams(students, project, Constraints(), seed=4)
        self.assertEqual(f.status, "infeasible")
        self.assertTrue(f.conflicts)

    def test_must_and_cannot_conflict(self):
        students = make_cohort(9, random.Random(5))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints(must_pair=[("u0", "u1")], cannot_pair=[("u0", "u1")])
        f = ENGINE.form_teams(students, project, cons, seed=5)
        self.assertEqual(f.status, "infeasible")


if __name__ == "__main__":
    unittest.main()
