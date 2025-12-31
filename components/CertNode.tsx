
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Image from 'next/image';

// We need to match the data structure we pass to the node
type CertNodeData = {
    label: string;
    image: string;
    date: string;
    manufacturer: string;
    index: number;
};


const CertNode = ({ data, sourcePosition = Position.Right, targetPosition = Position.Left }: NodeProps<any>) => {
    // Cast data to CertNodeData. React Flow types can be generic but explicit casting is often easier in simple setup
    const { label, image, date, manufacturer, index } = data as CertNodeData;

    return (
        <div className="cert-node">
            <div className="cert-badge">{index}</div>
            <Handle type="target" position={targetPosition} className="handle" />

            <div className="cert-frame">
                <div className="cert-image-wrapper">
                    {/* Using next/image for optimization, but we need width/height. 
              We'll set standard size for the frame. */}
                    <Image
                        src={image}
                        alt={label}
                        width={200}
                        height={140}
                        className="cert-img"
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="cert-info">
                    <h3 className="cert-title">{label}</h3>
                    <p className="cert-manufacturer">{manufacturer}</p>
                    <span className="cert-date">{date}</span>
                </div>
            </div>

            <Handle type="source" position={sourcePosition} className="handle" />
        </div>
    );
};

export default memo(CertNode);
