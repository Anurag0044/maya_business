from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0004_human_handoff"
down_revision = "0003_notification_engine"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "handoffs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("businesses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "conversation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column(
            "lead_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("leads.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "assigned_to",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("status", sa.String(30), nullable=False, server_default="PENDING"),
        sa.Column("priority", sa.String(20), nullable=False, server_default="NORMAL"),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_handoffs_business_id",
        "handoffs",
        ["business_id"],
    )

    op.create_index(
        "ix_handoffs_conversation_id",
        "handoffs",
        ["conversation_id"],
    )

    op.create_index(
        "ix_handoffs_lead_id",
        "handoffs",
        ["lead_id"],
    )

    op.create_index(
        "ix_handoffs_assigned_to",
        "handoffs",
        ["assigned_to"],
    )

    op.create_index(
        "ix_handoffs_status",
        "handoffs",
        ["status"],
    )

    op.create_index(
        "ix_handoffs_priority",
        "handoffs",
        ["priority"],
    )


def downgrade() -> None:
    op.drop_index("ix_handoffs_priority", table_name="handoffs")
    op.drop_index("ix_handoffs_status", table_name="handoffs")
    op.drop_index("ix_handoffs_assigned_to", table_name="handoffs")
    op.drop_index("ix_handoffs_lead_id", table_name="handoffs")
    op.drop_index("ix_handoffs_conversation_id", table_name="handoffs")
    op.drop_index("ix_handoffs_business_id", table_name="handoffs")

    op.drop_table("handoffs")