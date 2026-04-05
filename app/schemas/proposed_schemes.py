from pydantic import BaseModel

class ProposedSchemeCreate(BaseModel):
    scheme_name: str
    state: str
    sector: str
    category: str
