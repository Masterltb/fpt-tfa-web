"""Formation team composite key, persisted scores, persisted unassignable

The engine numbers teams "team-1..n" per run, so formation_teams.id is only unique
within a formation. The original global primary key made every formation run after
the first fail with UNIQUE constraint failed.

Also persists the solver's per-team scores and the run's unassignable list, which
were computed and then dropped on write.

Revision ID: b1f4a7c2d9e0
Revises: 32246137813a
Create Date: 2026-08-02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1f4a7c2d9e0"
down_revision: Union[str, None] = "32246137813a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "formation_runs",
        sa.Column("unassignable", sa.String(), nullable=False, server_default="[]"),
    )
    op.add_column(
        "formation_teams",
        sa.Column("scores", sa.String(), nullable=False, server_default="{}"),
    )
    op.add_column(
        "formation_teams",
        sa.Column("overridden", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    # Widen the primary key to (id, formation_id). batch_alter_table keeps this
    # workable on SQLite, which cannot drop or alter a constraint in place.
    with op.batch_alter_table("formation_teams") as batch:
        batch.drop_constraint("pk_formation_teams", type_="primary")
        batch.create_primary_key("pk_formation_teams", ["id", "formation_id"])


def downgrade() -> None:
    with op.batch_alter_table("formation_teams") as batch:
        batch.drop_constraint("pk_formation_teams", type_="primary")
        batch.create_primary_key("pk_formation_teams", ["id"])

    op.drop_column("formation_teams", "overridden")
    op.drop_column("formation_teams", "scores")
    op.drop_column("formation_runs", "unassignable")
