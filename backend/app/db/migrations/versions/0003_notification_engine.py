from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_notification_engine"
down_revision = "0002_conversation_retention"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Notification delivery state is separate from in-app read state.
    op.add_column(
        "notifications",
        sa.Column("delivery_status", sa.String(30), nullable=False, server_default="PENDING"),
    )
    op.add_column(
        "notifications",
        sa.Column("priority", sa.String(20), nullable=False, server_default="NORMAL"),
    )
    op.add_column("notifications", sa.Column("scheduled_at", sa.DateTime(timezone=True)))
    op.add_column("notifications", sa.Column("sent_at", sa.DateTime(timezone=True)))
    op.add_column("notifications", sa.Column("delivered_at", sa.DateTime(timezone=True)))
    op.add_column("notifications", sa.Column("failed_at", sa.DateTime(timezone=True)))
    op.add_column("notifications", sa.Column("failure_reason", sa.Text()))
    op.add_column(
        "notifications",
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("notifications", sa.Column("provider_message_id", sa.String(255)))
    op.add_column("notifications", sa.Column("metadata_json", postgresql.JSONB()))
    op.add_column(
        "notifications",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Existing V1 notifications were already persisted as in-app notifications.
    # Backfill their new delivery state so the new worker does not reinterpret
    # historical rows as pending deliveries.
    op.execute(
        "UPDATE notifications "
        "SET delivery_status = 'DELIVERED', "
        "sent_at = created_at, "
        "delivered_at = created_at "
        "WHERE channel = 'IN_APP'"
    )

    op.create_index("ix_notifications_type", "notifications", ["type"])
    op.create_index("ix_notifications_channel", "notifications", ["channel"])
    op.create_index("ix_notifications_status", "notifications", ["status"])
    op.create_index("ix_notifications_delivery_status", "notifications", ["delivery_status"])
    op.create_index("ix_notifications_scheduled_at", "notifications", ["scheduled_at"])

    op.create_table(
        "notification_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "notification_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("notifications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("businesses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("channel", sa.String(30), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("provider_message_id", sa.String(255)),
        sa.Column("error", sa.Text()),
        sa.Column("attempted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint(
            "notification_id",
            "attempt_number",
            name="uq_notification_attempt_number",
        ),
    )
    op.create_index(
        "ix_notification_attempts_notification_id",
        "notification_attempts",
        ["notification_id"],
    )
    op.create_index(
        "ix_notification_attempts_business_id",
        "notification_attempts",
        ["business_id"],
    )


def downgrade() -> None:
    op.drop_table("notification_attempts")
    for name in [
        "ix_notifications_scheduled_at",
        "ix_notifications_delivery_status",
        "ix_notifications_status",
        "ix_notifications_channel",
        "ix_notifications_type",
    ]:
        op.drop_index(name, table_name="notifications")

    for column in [
        "updated_at",
        "metadata_json",
        "provider_message_id",
        "attempt_count",
        "failure_reason",
        "failed_at",
        "delivered_at",
        "sent_at",
        "scheduled_at",
        "priority",
        "delivery_status",
    ]:
        op.drop_column("notifications", column)
