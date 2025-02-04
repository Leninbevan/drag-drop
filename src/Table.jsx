import React, { useEffect, useRef } from "react";
import "./styles.scss";

const Table = ({
  tableId,
  tableName,
  columns,
  addConnection,
  onRemove,
  setConnecting,
}) => {
  const tableRef = useRef(null);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.style.resize = "both";
      tableElement.style.overflow = "auto";
    }
  }, []);

  return (
    <div className="table" id={tableId} ref={tableRef}>
      <div className="table_header">
        <div style={{ fontWeight: "bold" }}>{tableName}</div>{" "}
        <button onClick={() => onRemove(tableId)} className="close">
          x
        </button>
      </div>

      <ul>
        {/* Header row for Column and Data type */}
        <li style={{ display: "flex", alignItems: "center", gap: "15px", fontWeight: "bold" }}>
          <input type="checkbox" className="column-checkbox" checked readOnly />
          <div style={{ display: "flex", gap: "15px", width: "100%" }}>
            <div style={{ flex: 1 }}>Column</div>
            <div>|</div>
            <div style={{ flex: 1 }}>Data Type</div>
          </div>
        </li>
        {/* Loop through columns and display */}
        {columns.map((column) => (
          <li
            className="table-li"
            key={column.column_id}
            id={`${tableId}-${column.column_id}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "column",
                JSON.stringify({ tableId, columnId: column.column_id })
              );
              setConnecting(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData("column");
              if (data) {
                const draggedColumn = JSON.parse(data);

                if (
                  draggedColumn.tableId !== tableId ||
                  draggedColumn.columnId !== column.column_id
                ) {
                  addConnection({
                    start: `${draggedColumn.tableId}-${draggedColumn.columnId}`,
                    end: `${tableId}-${column.column_id}`,
                  });
                }
              }
              setConnecting(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => setConnecting(false)}
          >
            <input type="checkbox" className="column-checkbox" checked readOnly />
            <div style={{ display: "flex", gap: "15px", width: "100%" }}>
              <div style={{ flex: 1 }}>{column.name}</div>
              <div>{column.column_data_type}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>

  );
};

export default Table;