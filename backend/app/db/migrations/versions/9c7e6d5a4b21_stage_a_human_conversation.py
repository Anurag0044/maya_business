from alembic import op
import sqlalchemy as sa


revision = "9c7e6d5a4b21"
down_revision = "83fd4a73a261"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The original handoff migration used CASCADE for conversation deletion,
    # while the SQLAlchemy model intentionally uses SET NULL so a retained
    # handoff record cannot point at a deleted conversation.
    op.drop_constraint(
        "handoffs_conversation_id_fkey",
        "handoffs",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_handoffs_conversation_id_conversations",
        "handoffs",
        "conversations",
        ["conversation_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # Existing rows created before the field was made required are backfilled
    # from created_at before enforcing NOT NULL.
    op.execute(
        sa.text(
            "UPDATE handoffs SET requested_at = COALESCE(requested_at, created_at) "
            "WHERE requested_at IS NULL"
        )
    )
    op.alter_column(
        "handoffs",
        "requested_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )

    # The ORM requires a reason for every handoff. Preserve old rows by using
    # a deterministic fallback before enforcing the constraint.
    op.execute(
        sa.text(
            "UPDATE handoffs SET reason = 'Human assistance requested' "
            "WHERE reason IS NULL OR trim(reason) = ''"
        )
    )
    op.alter_column(
        "handoffs",
        "reason",
        existing_type=sa.Text(),
        nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "handoffs",
        "reason",
        existing_type=sa.Text(),
        nullable=True,
    )
    op.alter_column(
        "handoffs",
        "requested_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
    )
    op.drop_constraint(
        "fk_handoffs_conversation_id_conversations",
        "handoffs",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "handoffs_conversation_id_fkey",
        "handoffs",
        "conversations",
        ["conversation_id"],
        ["id"],
        ondelete="CASCADE",
    )
