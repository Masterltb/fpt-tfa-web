"""Balance scoring (A-01). Pure stdlib.

Default metric (assumption A-01, needs confirmation): variance of per-team mean competency,
reported as balance = 1 / (1 + variance). Higher is better; 1.0 = perfectly even.
Swap this function to change the objective without touching the engine.
"""
from __future__ import annotations

from ..domain.models import Student, Team


def _mean(xs: list[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


def team_mean_competency(team: Team, by_id: dict[str, Student]) -> float:
    return _mean([by_id[mid].competency() for mid in team.member_ids if mid in by_id])


def balance_score(teams: list[Team], by_id: dict[str, Student]) -> float:
    """1 / (1 + variance of per-team mean competency)."""
    means = [team_mean_competency(t, by_id) for t in teams]
    if len(means) <= 1:
        return 1.0
    mu = _mean(means)
    variance = _mean([(m - mu) ** 2 for m in means])
    return round(1.0 / (1.0 + variance), 6)
