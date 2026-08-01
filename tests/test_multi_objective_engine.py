"""Multi-objective matching engine tests.

Verifies the OR-Tools CP-SAT engine properly balances competency, availability, role diversity,
and peer preferences according to the weight configurations (feat 009).
"""
from __future__ import annotations

import unittest
import random

from app.domain.models import Constraints, Project, Student
from app.domain.rules import violations

try:
    from app.matching.ortools_engine import OrToolsMatchingEngine
    _HAVE_ORTOOLS = True
except Exception:  # pragma: no cover
    _HAVE_ORTOOLS = False


@unittest.skipUnless(_HAVE_ORTOOLS, "ortools not installed")
class TestMultiObjectiveEngine(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = OrToolsMatchingEngine(max_time_s=10.0)

    def test_availability_prioritized(self) -> None:
        # Create 6 students:
        # s0, s1, s2 have 'mon-am'
        # s3, s4, s5 have 'wed-pm'
        students = [
            Student(id="s0", availability=frozenset(["mon-am"])),
            Student(id="s1", availability=frozenset(["mon-am"])),
            Student(id="s2", availability=frozenset(["mon-am"])),
            Student(id="s3", availability=frozenset(["wed-pm"])),
            Student(id="s4", availability=frozenset(["wed-pm"])),
            Student(id="s5", availability=frozenset(["wed-pm"])),
        ]
        
        # High w_avail
        project = Project(id="p1", min_size=3, max_size=3, weights={"w_comp": 0.0, "w_avail": 10.0, "w_role": 0.0, "w_pref": 0.0})
        f = self.engine.form_teams(students, project, Constraints(), seed=1)
        self.assertEqual(f.status, "ok")
        self.assertEqual(len(f.teams), 2)
        
        for t in f.teams:
            self.assertGreater(t.scores["common_slots"], 0, "Team should have at least 1 common slot")
            self.assertIn("common availability", t.rationale)

    def test_role_diversity_prioritized(self) -> None:
        # Create 6 students, 3 want to be leader, 3 want to be member.
        students = [
            Student(id="s0", desired_role="leader"),
            Student(id="s1", desired_role="leader"),
            Student(id="s2", desired_role="leader"),
            Student(id="s3", desired_role="member"),
            Student(id="s4", desired_role="member"),
            Student(id="s5", desired_role="member"),
        ]
        
        # High w_role
        project = Project(id="p1", min_size=3, max_size=3, weights={"w_comp": 0.0, "w_avail": 0.0, "w_role": 10.0, "w_pref": 0.0})
        f = self.engine.form_teams(students, project, Constraints(), seed=2)
        
        self.assertEqual(f.status, "ok")
        for t in f.teams:
            # Should have both leader and member
            self.assertEqual(t.scores["role_diversity"], 2, "Team should have diverse roles")

    def test_peer_preferences_prioritized(self) -> None:
        students = [
            Student(id="s0", preferred_teammates=frozenset(["s1"])),
            Student(id="s1", preferred_teammates=frozenset(["s0"])),
            Student(id="s2", preferred_teammates=frozenset([])),
            Student(id="s3", preferred_teammates=frozenset(["s4"])),
            Student(id="s4", preferred_teammates=frozenset(["s3"])),
            Student(id="s5", preferred_teammates=frozenset([])),
        ]
        
        # High w_pref
        project = Project(id="p1", min_size=3, max_size=3, weights={"w_comp": 0.0, "w_avail": 0.0, "w_role": 0.0, "w_pref": 10.0})
        f = self.engine.form_teams(students, project, Constraints(), seed=3)
        self.assertEqual(f.status, "ok")
        
        total_prefs = sum(t.scores.get("preference_score", 0) for t in f.teams)
        self.assertEqual(total_prefs, 2, "Should satisfy both mutual preferences")

    def test_scores_and_rationale_populated(self) -> None:
        students = [
            Student(id="s0", desired_role="leader", availability=frozenset(["fri-pm"])),
            Student(id="s1", desired_role="member", availability=frozenset(["fri-pm"])),
            Student(id="s2", desired_role="member", availability=frozenset(["fri-pm"])),
        ]
        project = Project(id="p1", min_size=3, max_size=3)
        f = self.engine.form_teams(students, project, Constraints(), seed=4)
        self.assertEqual(f.status, "ok")
        
        t = f.teams[0]
        self.assertIn("mean_competency", t.scores)
        self.assertIn("common_slots", t.scores)
        self.assertIn("role_diversity", t.scores)
        self.assertIn("preference_score", t.scores)
        
        self.assertTrue(len(t.rationale) > 10)
        self.assertIn("roles covered", t.rationale)

    def test_determinism_with_weights(self) -> None:
        students = [
            Student(id="s0", desired_role="leader", availability=frozenset(["mon-am"])),
            Student(id="s1", desired_role="member", availability=frozenset(["mon-am"])),
            Student(id="s2", desired_role="leader", availability=frozenset(["wed-pm"])),
            Student(id="s3", desired_role="member", availability=frozenset(["wed-pm"])),
            Student(id="s4", desired_role="other", availability=frozenset(["mon-am"])),
            Student(id="s5", desired_role="other", availability=frozenset(["wed-pm"])),
        ]
        project = Project(id="p1", min_size=3, max_size=3, weights={"w_comp": 1.0, "w_avail": 5.0, "w_role": 5.0, "w_pref": 1.0})
        f1 = self.engine.form_teams(students, project, Constraints(), seed=42)
        f2 = self.engine.form_teams(students, project, Constraints(), seed=42)
        self.assertEqual([t.member_ids for t in f1.teams], [t.member_ids for t in f2.teams])

if __name__ == "__main__":
    unittest.main()
