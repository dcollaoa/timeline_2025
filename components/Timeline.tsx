
'use client';

import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Edge,
    Node,
    MarkerType,
    ConnectionLineType,
    Position,
    Panel,
    useReactFlow,
    getNodesBounds,
    getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';

import CertNode from './CertNode';
import { certifications } from '@/lib/data';

// Define custom node types
const nodeTypes = {
    cert: CertNode as any,
};

// ... (keep initialNodes/initialEdges logic same) ...
// ACTUALLY I CANNOT REPLACE THE WHOLE FILE EASILY WITHOUT KEEPING THE LOGIC.
// I will just add the imports and the DownloadButton component, then add the Panel to the JSX.

// HELPER FUNCTION FOR DOWNLOAD
function downloadImage(dataUrl: string) {
    const a = document.createElement('a');
    a.setAttribute('download', 'resume-spiral.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

const imageWidth = 2560; // QHD Width
const imageHeight = 1440; // QHD Height

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const onClick = () => {
        // We want to capture the whole flow, so we calculate the bounds of all nodes
        const nodesBounds = getNodesBounds(getNodes());

        // Calculate transform to fit all nodes into the QHD dimension with some margin
        const { x, y, zoom } = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.1, // min zoom
            2,   // max zoom
            50   // padding
        );

        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (viewport) {
            toPng(viewport, {
                backgroundColor: '#ffffff',
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: imageWidth.toString(),
                    height: imageHeight.toString(),
                    transform: `translate(${x}px, ${y}px) scale(${zoom})`,
                },
                pixelRatio: 2, // Higher density for crisp text
            }).then(downloadImage);
        }
    };

    return (
        <Panel position="top-right">
            <button
                className="download-btn"
                onClick={onClick}
                style={{
                    padding: '10px 20px',
                    background: '#0077b5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                Download QHD Image
            </button>
        </Panel>
    );
}


// Generate initial nodes and edges from data
// Generate initial nodes with a Spiral Layout (Archimedean Spiral)
// Generate initial nodes with a Spiral Layout (Archimedean Spiral)
const initialNodes: Node[] = [];
const xGap = 400; // Horizontal distance
const yGap = 350; // Vertical distance
const numCols = 4; // 4 columns

// Helper to determine handles based on neighbor positions
const getHandlesForZigZag = (i: number, count: number) => {
    const row = Math.floor(i / numCols);

    // Determine target (input)
    let targetPosition = Position.Left;
    if (i > 0) {
        const prevRow = Math.floor((i - 1) / numCols);
        // If coming from same row
        if (prevRow === row) {
            // Even row: Left -> Right. Coming from Left. Target Left.
            // Odd row: Right -> Left. Coming from Right. Target Right.
            targetPosition = (row % 2 === 0) ? Position.Left : Position.Right;
        } else {
            // Coming from row above
            targetPosition = Position.Top;
        }
    }

    // Determine source (output)
    let sourcePosition = Position.Right;
    if (i < count - 1) {
        const nextRow = Math.floor((i + 1) / numCols);
        if (nextRow === row) {
            // Going to same row
            sourcePosition = (row % 2 === 0) ? Position.Right : Position.Left;
        } else {
            // Going down
            sourcePosition = Position.Bottom;
        }
    }

    return { sourcePosition, targetPosition };
};

certifications.forEach((cert, index) => {
    const row = Math.floor(index / numCols);
    let col = index % numCols;

    // If odd row, invert column index for zig-zag
    if (row % 2 !== 0) {
        col = (numCols - 1) - col;
    }

    const x = col * xGap;
    const y = row * yGap;

    const { sourcePosition, targetPosition } = getHandlesForZigZag(index, certifications.length);

    initialNodes.push({
        id: cert.id,
        type: 'cert',
        position: { x, y },
        sourcePosition,
        targetPosition,
        data: {
            label: cert.label,
            image: cert.image,
            date: cert.date,
            manufacturer: cert.manufacturer,
            index: index + 1,
        },
    });
});

const initialEdges: Edge[] = certifications.slice(0, -1).map((cert, index) => ({
    id: `e${cert.id}-${certifications[index + 1].id}`,
    source: cert.id,
    target: certifications[index + 1].id,
    type: 'smoothstep', // User requested "las otras flechas" (angled)
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#0077b5',
    },
    style: { stroke: '#0077b5', strokeWidth: 2 },
    animated: false,
}));

export default function Timeline() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '100vh', background: '#ffffff' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#0077b5', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077b5' }
                }}
            >
                <Controls />
                <DownloadButton />
            </ReactFlow>
        </div>
    );
}
