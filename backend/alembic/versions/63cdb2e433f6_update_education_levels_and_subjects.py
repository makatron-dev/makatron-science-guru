"""update_education_levels_and_subjects

Revision ID: 63cdb2e433f6
Revises: 
Create Date: 2026-11-10 20:29:30.816878

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '63cdb2e433f6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and migrate data."""
    
    # DATA MIGRATION (Safe) - Only updating msg_users
    op.execute("UPDATE msg_users SET exam_target = 'common_entrance' WHERE exam_target = 'primary_school';")
    op.execute("UPDATE msg_users SET exam_target = 'bece' WHERE exam_target = 'junior_school';")
    op.execute("UPDATE msg_users SET exam_target = 'waec' WHERE exam_target = 'senior_school';")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("UPDATE msg_users SET exam_target = 'primary_school' WHERE exam_target = 'common_entrance';")
    op.execute("UPDATE msg_users SET exam_target = 'junior_school' WHERE exam_target = 'bece';")
    op.execute("UPDATE msg_users SET exam_target = 'senior_school' WHERE exam_target = 'waec';")