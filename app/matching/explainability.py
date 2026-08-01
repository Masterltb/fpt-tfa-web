"""Explainability Engine for AI Team Formation Suggestions.

Generates transparent, human-readable rationale explanations for each formed team,
highlighting skill balance, role fit, schedule compatibility, and diversity.
"""
from __future__ import annotations

from typing import Sequence
from app.domain.models import Student


def generate_team_rationale(
    members: Sequence[Student],
    scores: dict[str, float] | None = None
) -> str:
    """Generates an explainable summary rationale for a team."""
    if not members:
        return "Empty team."

    scores = scores or {}
    total_skills = set()
    for m in members:
        total_skills.update(s.name for s in m.skills)

    skills_str = ", ".join(sorted(total_skills)[:4]) if total_skills else "General technical skills"
    count = len(members)
    
    parts = [
        f"Team of {count} students with complementary skills ({skills_str}).",
    ]

    if "availability" in scores:
        parts.append(f"Schedule overlap score: {scores['availability']:.0f}%.")
    if "skillCoverage" in scores:
        parts.append(f"Skill coverage score: {scores['skillCoverage']:.0f}%.")

    return " ".join(parts)
