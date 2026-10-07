"""Phase 3: WhatsApp Cloud API connections.

Revision ID: b2c3d4e5f6a7
Revises: a1d2e3f4b5c6
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "b2c3d4e5f6a7"
down_revision = "a1d2e3f4b5c6"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "whatsapp_connections",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "phone_number_id",
            sa.String(100),
            nullable=False,
        ),
        sa.Column(
            "whatsapp_business_account_id",
            sa.String(100),
            nullable=True,
        ),
        sa.Column(
            "display_phone_number",
            sa.String(50),
            nullable=True,
        ),
        sa.Column(
            "access_token_encrypted",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "metadata_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["business_id"],
            ["businesses.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "business_id",
            name="uq_whatsapp_connections_business_id",
        ),
        sa.UniqueConstraint(
            "phone_number_id",
            name="uq_whatsapp_connections_phone_number_id",
        ),
    )
    op.create_index(
        "ix_whatsapp_connections_phone_number_id",
        "whatsapp_connections",
        ["phone_number_id"],
    )
    op.create_index(
        "ix_whatsapp_connections_business_id",
        "whatsapp_connections",
        ["business_id"],
    )


def downgrade():
    op.drop_index(
        "ix_whatsapp_connections_business_id",
        table_name="whatsapp_connections",
    )
    op.drop_index(
        "ix_whatsapp_connections_phone_number_id",
        table_name="whatsapp_connections",
    )
    op.drop_table("whatsapp_connections")
