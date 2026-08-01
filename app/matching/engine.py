"""Matching engine interface. Pure stdlib.

The application depends on this Protocol, not on a concrete engine — so the mock (stdlib) and
the future OR-Tools engine (free, OSS) are interchangeable and testable in isolation
(docs/architecture.md: the optimizer is a boundary).
"""
from __future__ import annotations

from typing import Protocol

from ..domain.models import Constraints, Formation, Project, Student


class MatchingEngine(Protocol):
    def form_teams(
        self,
        students: list[Student],
        project: Project,
        constraints: Constraints,
        seed: int = 0,
    ) -> Formation:
        """Return a Formation. Must never emit a formation that violates a hard constraint;
        on infeasibility, return status='infeasible' with conflicts populated."""
        ...
