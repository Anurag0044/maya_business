from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "83fd4a73a261"
down_revision = "0004_human_handoff"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "handoffs",
        sa.Column(
            "call_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_handoffs_call_id_calls",
        "handoffs",
        "calls",
        ["call_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        "ix_handoffs_call_id",
        "handoffs",
        ["call_id"],
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "channel",
            sa.String(30),
            nullable=False,
            server_default="CHAT",
        ),
    )

    op.create_index(
        "ix_handoffs_channel",
        "handoffs",
        ["channel"],
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "customer_name",
            sa.String(255),
            nullable=True,
        ),
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "customer_phone",
            sa.String(50),
            nullable=True,
        ),
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "customer_email",
            sa.String(255),
            nullable=True,
        ),
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "requested_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_handoffs_requested_at",
        "handoffs",
        ["requested_at"],
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "assigned_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "handoffs",
        sa.Column(
            "metadata_json",
            postgresql.JSONB,
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("handoffs", "metadata_json")

    op.drop_column("handoffs", "assigned_at")

    op.drop_index(
        "ix_handoffs_requested_at",
        table_name="handoffs",
    )

    op.drop_column("handoffs", "requested_at")

    op.drop_column("handoffs", "customer_email")
    op.drop_column("handoffs", "customer_phone")
    op.drop_column("handoffs", "customer_name")

    op.drop_index(
        "ix_handoffs_channel",
        table_name="handoffs",
    )

    op.drop_column("handoffs", "channel")

    op.drop_index(
        "ix_handoffs_call_id",
        table_name="handoffs",
    )

    op.drop_constraint(
        "fk_handoffs_call_id_calls",
        "handoffs",
        type_="foreignkey",
    )

    op.drop_column("handoffs", "call_id")