import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import Xarrow from "react-xarrows";
import { mockTables } from "../src/mock_data";
import "./styles.scss";
import Table from "./Table";

const App = () => {
    const [connections, setConnections] = useState([]);
    const [tablePositions, setTablePositions] = useState({});
    const [droppedTables, setDroppedTables] = useState([]);
    const [connecting, setConnecting] = useState(false);
    const [updateArrows, setUpdateArrows] = useState(false);

    useEffect(() => {
        if (droppedTables.length === mockTables.length) {
            alert("All tables are dragged");
        }
    }, [droppedTables]);

    const handleStop = (e, data, tableId) => {
        const newPosition = { x: data.x, y: data.y };
        let adjustedPosition = { ...newPosition };
        let isOverlapping;

        do {
            isOverlapping = false;
            for (let key in tablePositions) {
                if (key !== tableId) {
                    const pos = tablePositions[key];
                    if (
                        Math.abs(adjustedPosition.x - pos.x) < 300 &&
                        Math.abs(adjustedPosition.y - pos.y) < 290
                    ) {
                        isOverlapping = true;
                        adjustedPosition = {
                            x: adjustedPosition.x + 10,
                            y: adjustedPosition.y + 10,
                        };
                        break;
                    }
                }
            }
        } while (isOverlapping);

        setTablePositions((prevPositions) => ({
            ...prevPositions,
            [tableId]: adjustedPosition,
        }));
    };

    const addConnection = (connection) => {
        setConnections((prev) => [...prev, connection]);
    };

    const handleDrop = (e) => {
        if (
            droppedTables.length === mockTables.length &&
            e?.target?.tagName === "DIV"
        ) {
            alert("All tables are dragged");
        }
        const data = e.dataTransfer.getData("table");

        if (data) {
            const table = JSON.parse(data);
            if (!droppedTables.some((t) => t.id === table.id)) {
                let newPosition = { x: e.clientX - 250, y: e.clientY - 50 };
                let adjustedPosition = { ...newPosition };
                let isOverlapping;

                do {
                    isOverlapping = false;

                    for (let key in tablePositions) {
                        const pos = tablePositions[key];
                        if (
                            Math.abs(adjustedPosition.x - pos.x) < 300 &&
                            Math.abs(adjustedPosition.y - pos.y) < 290
                        ) {
                            isOverlapping = true;
                            adjustedPosition = {
                                x: adjustedPosition.x + 10,
                                y: adjustedPosition.y + 10,
                            };
                            break;
                        }
                    }
                } while (isOverlapping);

                setDroppedTables([...droppedTables, table]);
                setTablePositions((prevPositions) => ({
                    ...prevPositions,
                    [table.id]: adjustedPosition,
                    length: table?.columns?.length,
                }));
            } else {
                alert("Already existing Table!!");
            }
        }
    };


    const handleRemove = (tableId) => {
        setDroppedTables((prevTables) =>
            prevTables.filter((table) => table.id !== tableId)
        );
        setTablePositions((prevPositions) => {
            const newPositions = { ...prevPositions };
            delete newPositions[tableId];
            return newPositions;
        });
        setConnections((prevConnections) =>
            prevConnections.filter((conn) => {
                return (
                    conn.start.split("-")[0] !== tableId &&
                    conn.end.split("-")[0] !== tableId
                );
            })
        );
    };

    useEffect(() => {
        const handleScroll = () => setUpdateArrows((prev) => !prev);

        const scrollableTables = document.querySelectorAll(".table");

        scrollableTables.forEach((table) => {
            table.addEventListener("scroll", handleScroll);
        });

        return () => {
            scrollableTables.forEach((table) => {
                table.removeEventListener("scroll", handleScroll);
            });
        };
    }, [droppedTables]);

    return (
        <div className="app">
            <div className="left-panel">
                <input type="text" placeholder="Filter by Table Name" />
                <ul>
                    {mockTables.map((table) => (
                        <li
                            key={table.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("table", JSON.stringify(table));
                            }}
                        >
                            {table.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div
                className="right-panel"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {droppedTables.map((table) => (
                    <Draggable
                        key={table.id}
                        onStop={(e, data) => handleStop(e, data, table.id)}
                        position={tablePositions[table.id]}
                        disabled={connecting}
                        cancel={["ul"]}
                    >
                        <Resizable
                            width={300}
                            height={300}
                            minConstraints={[100, 100]}
                            onResizeStop={(e, data) => {
                                handleStop(e, data, table.id);
                            }}
                            draggableOpts={{ disabled: connecting }}
                        >
                            <div className="scrollable-table">
                                <Table
                                    tableId={table.id}
                                    tableName={table.name}
                                    columns={table.columns}
                                    addConnection={addConnection}
                                    onRemove={handleRemove}
                                    setConnecting={setConnecting}
                                />
                            </div>
                        </Resizable>
                    </Draggable>
                ))}
                {connections.map((conn, index) => (
                    <Xarrow
                        key={index}
                        start={conn.start}
                        end={conn.end}
                        animateDrawing={1}
                        color="#f4ab4c"
                        updateKey={updateArrows}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;