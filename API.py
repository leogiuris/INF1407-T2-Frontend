from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allows all origins - use specific origins in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# Data model
class RowData(BaseModel):
    id: int
    col_A: str
    col_B: str

class CreateRowData(BaseModel):  # Separate model for creation
    col_A: str
    col_B: str
    
# Dummy database
database = [
    RowData(id=1, col_A="Sample A1", col_B="Sample B1"),
    RowData(id=2, col_A="Sample A2", col_B="Sample B2"),
]

# Get all data
@app.get("/api/data", response_model=List[RowData])
async def get_data():
    return database

# Create new row, receive row without id
@app.post("/api/data", response_model=RowData)
async def create_data(row: CreateRowData):
    new_id = max((r.id for r in database), default=0) + 1
    new_row = RowData(id=new_id, col_A=row.col_A, col_B=row.col_B)
    database.append(new_row)
    return new_row


# Update a row
@app.put("/api/data/{row_id}", response_model=RowData)
async def update_data(row_id: int, updated_row: RowData):
    for idx, row in enumerate(database):
        if row.id == row_id:
            database[idx] = updated_row
            return updated_row
    raise HTTPException(status_code=404, detail="Row not found")

# Delete a row
@app.delete("/api/data/{row_id}")
async def delete_data(row_id: int):
    for row in database:
        if row.id == row_id:
            database.remove(row)
            return {"message": "Row deleted successfully"}
    raise HTTPException(status_code=404, detail="Row not found")
