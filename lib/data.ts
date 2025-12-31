
export interface Cert {
    id: string;
    label: string;
    image: string;
    date: string;
    manufacturer: string;
}

export const certifications: Cert[] = [
    {
        id: '1',
        label: 'ISO 27001 Lead Auditor',
        image: '/certs/iso27001.jpg',
        date: 'Jan 11, 2025',
        manufacturer: 'Certiprof',
    },
    {
        id: '2',
        label: 'CPTS',
        image: '/certs/cpts.jpg',
        date: 'Jan 15, 2025',
        manufacturer: 'Hack The Box',
    },
    {
        id: '3',
        label: 'CRTO',
        image: '/certs/crtov1.jpg',
        date: 'Feb 19, 2025',
        manufacturer: 'Zero-Point Security',
    },
    {
        id: '4',
        label: 'CRTE', // User said CRTE, mapping to carte.jpg
        image: '/certs/carte.jpg',
        date: 'Mar 11, 2025',
        manufacturer: 'Altered Security',
    },
    {
        id: '5',
        label: 'CRTA',
        image: '/certs/crta.jpg',
        date: 'Mar 28, 2025',
        manufacturer: 'CyberWarfare Labs',
    },
    {
        id: '6',
        label: 'CRTL',
        image: '/certs/crtl.jpg',
        date: 'May 11, 2025',
        manufacturer: 'Zero-Point Security',
    },
    {
        id: '7',
        label: 'CRTeamer',
        image: '/certs/crteamer.jpg',
        date: 'Jun 02, 2025',
        manufacturer: 'The SecOps Group',
    },
    {
        id: '8',
        label: 'CRTO v2',
        image: '/certs/crto.jpg', // Swapped based on user feedback
        date: 'Jun 12, 2025',
        manufacturer: 'Zero-Point Security',
    },
    {
        id: '9',
        label: 'CARTP',
        image: '/certs/cartp.jpg',
        date: 'Sep 10, 2025',
        manufacturer: 'Altered Security',
    },
    {
        id: '10',
        label: '???',
        image: '/certs/next_goal.png',
        date: '2026',
        manufacturer: 'Future',
    },
];
