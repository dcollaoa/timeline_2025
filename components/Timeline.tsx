
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
const centerX = 0;
const centerY = 0;
const gap = 350; // Distance between nodes along the curve
const spiralGrowth = 80;
let theta = 0;

// Helper to determine handle positions based on angle
const getHandlePositions = (angle: number) => {
    // Normalize angle to 0-2PI
    const normAngle = angle % (2 * Math.PI);

    // Logic:
    // If moving roughly Right (0): Source Right, Target Left
    // If moving vaguely Down (PI/2): Source Bottom, Target Top
    // If moving roughly Left (PI): Source Left, Target Right
    // If moving roughly Up (3PI/2): Source Top, Target Bottom

    // We want the flow to be "Outward".
    // So Source should be on the side facing "out" (roughly angle direction)
    // Target should be on the side facing "in" (opposite to angle)

    // Rough quadrants
    // 0 +/- PI/4 (Right)
    // PI/2 +/- PI/4 (Down)
    // PI +/- PI/4 (Left)
    // 3PI/2 +/- PI/4 (Up)

    // Using cosine/sine to determine dominant direction
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    if (Math.abs(cos) > Math.abs(sin)) {
        // Horizontal dominant
        if (cos > 0) return { source: Position.Right, target: Position.Left };
        return { source: Position.Left, target: Position.Right };
    } else {
        // Vertical dominant
        if (sin > 0) return { source: Position.Bottom, target: Position.Top };
        return { source: Position.Top, target: Position.Bottom };
    }
};

certifications.forEach((cert, index) => {
    if (index === 0) {
        initialNodes.push({
            id: cert.id,
            type: 'cert',
            position: { x: centerX, y: centerY },
            sourcePosition: Position.Right, // Start moving right
            targetPosition: Position.Left,
            data: {
                label: cert.label,
                image: cert.image,
                date: cert.date,
                manufacturer: cert.manufacturer,
                index: 1,
            },
        });
        theta = 1.0;
        return;
    }

    const r = 200 + spiralGrowth * theta;
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);

    // Determine direction from previous node to this node roughly
    // Or just based on position relative to center?
    // Actually, theta determines where we are relative to center.
    // Flow is clockwise-ish?
    // r = a + b*theta is spiraling out.
    // Tangent is perpendicular to radius?

    // Let's use the position on the circle to determine handles.
    const { source, target } = getHandlePositions(theta);

    initialNodes.push({
        id: cert.id,
        type: 'cert',
        position: { x, y },
        sourcePosition: source,
        targetPosition: target,
        data: {
            label: cert.label,
            image: cert.image,
            date: cert.date,
            manufacturer: cert.manufacturer,
            index: index + 1, // Add 1-based index
        },
    });

    const deltaTheta = gap / r;
    theta += deltaTheta;
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
