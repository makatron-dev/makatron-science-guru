from database import Base, engine
import models  # noqa

print("Dropping all msg_* tables...")
Base.metadata.drop_all(bind=engine)
print("Creating fresh tables...")
Base.metadata.create_all(bind=engine)
print("Done. Tables now in DB:")
for name in sorted(Base.metadata.tables.keys()):
    print(" -", name)