from database import Base, engine
import models  # noqa: F401  ensures tables are registered

Base.metadata.create_all(bind=engine)
print("Tables created:")
for name in Base.metadata.tables.keys():
    print(" -", name)
