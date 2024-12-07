from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Data model
class RowData(BaseModel):
    id: int
    col_A: str
    col_B: str

# Dummy database
database = [
    RowData(id=1, col_A="Sample A1", col_B="Sample B1"),
    RowData(id=2, col_A="Sample A2", col_B="Sample B2"),
]

# Get all data
@app.get("/data", response_model=List[RowData])
async def get_data():
    return database

# Create new row
@app.post("/data", response_model=RowData)
async def create_data(row: RowData):
    row.id = max((r.id for r in database), default=0) + 1
    database.append(row)
    return row

# Update a row
@app.put("/data/{row_id}", response_model=RowData)
async def update_data(row_id: int, updated_row: RowData):
    for idx, row in enumerate(database):
        if row.id == row_id:
            database[idx] = updated_row
            return updated_row
    raise HTTPException(status_code=404, detail="Row not found")

# Delete a row
@app.delete("/data/{row_id}")
async def delete_data(row_id: int):
    for row in database:
        if row.id == row_id:
            database.remove(row)
            return {"message": "Row deleted successfully"}
    raise HTTPException(status_code=404, detail="Row not found")