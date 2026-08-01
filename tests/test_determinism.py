"""SC-002 / R8: same inputs + same seed produce the same formation."""
from __future__ import annotations

import random
import unittest

from app.domain.models import Constraints, Project
from app.matching.mock_engine import MockMatchingEngine

from ._helpers import make_cohort

ENGINE = MockMatchingEngine()


class TestDeterminism(unittest.TestCase):
    def test_same_seed_identical(self):
        students = make_cohort(18, random.Random(5))
        project = Project(id="p", min_size=3, max_size=5)
        cons = Constraints(cannot_pair=[("u0", "u3")])
        f1 = ENGINE.form_teams(students, project, cons, seed=42)
        f2 = ENGINE.form_teams(students, project, cons, seed=42)
        self.assertEqual(
            [t.member_ids for t in f1.teams],
            [t.member_ids for t in f2.teams],
        )
        self.assertEqual(f1.balance, f2.balance)
        self.assertEqual(f1.unassignable, f2.unassignable)


if __name__ == "__main__":
    unittest.main()
