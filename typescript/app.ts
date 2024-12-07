interface RowData {
    id: number;
    col_A: string;
    col_B: string;
}

const API_URL = "http://127.0.0.1:8000"; // FastAPI server URL

// Fetch data from API
const fetchData = async (): Promise<RowData[]> => {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok){ 
        console.log(response.json());
        throw new Error("Failed to update data");
    }
    return response.json();
};

// Create new row in API
const createData = async (row: Omit<RowData, "id">): Promise<RowData> => {
    const response = await fetch(`${API_URL}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
    });
    if (!response.ok) throw new Error("Failed to create data");
    return response.json();
};

// Update existing row in API
const updateData = async (id: number, updatedRow: Partial<RowData>): Promise<RowData | undefined> => {
    const response = await fetch(`${API_URL}/data/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRow),
    });
    if (!response.ok){ 
        console.log(response.json());
        throw new Error("Failed to update data");
    }
    return response.json();
};

// Delete row from API
const deleteData = async (id: number): Promise<boolean> => {
    const response = await fetch(`${API_URL}/data/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete data");
    return true;
};

// DOM Elements
const tableBody = document.getElementById("table-body")!;
const colAInput = document.getElementById("col_A") as HTMLInputElement;
const colBInput = document.getElementById("col_B") as HTMLInputElement;
const createButton = document.getElementById("create")!;

// Render the table
const renderTable = (rows: RowData[]) => {
    tableBody.innerHTML = "";
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.col_A}</td>
            <td>${row.col_B}</td>
            <td>
                <button class="update" data-id="${row.id}">Update</button>
                <button class="delete" data-id="${row.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Add event listeners for update and delete buttons
    document.querySelectorAll(".update").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = parseInt((button as HTMLElement).getAttribute("data-id")!, 10);
            const updatedColA = prompt("Update Column A", rows.find((d) => d.id === id)?.col_A || "");
            const updatedColB = prompt("Update Column B", rows.find((d) => d.id === id)?.col_B || "");
            if (updatedColA !== null && updatedColB !== null) {
                await updateData(id, { col_A: updatedColA, col_B: updatedColB });
                const updatedRows = await fetchData();
                renderTable(updatedRows);
            }
        });
    });

    document.querySelectorAll(".delete").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = parseInt((button as HTMLElement).getAttribute("data-id")!, 10);
            await deleteData(id);
            const updatedRows = await fetchData();
            renderTable(updatedRows);
        });
    });
};

// Add a new row
createButton.addEventListener("click", async () => {
    const colA = colAInput.value.trim();
    const colB = colBInput.value.trim();
    if (colA && colB) {
        await createData({ col_A: colA, col_B: colB });
        colAInput.value = "";
        colBInput.value = "";
        const updatedRows = await fetchData();
        renderTable(updatedRows);
    } else {
        alert("Both fields are required!");
    }
});

// Fetch data on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const rows = await fetchData();
        renderTable(rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please try again later.");
    }
});