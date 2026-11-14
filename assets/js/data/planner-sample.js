// Made-up sample data for the planner demo. People, courses and projects are invented.
// One clash is deliberate (Ton, mid-February) so the double-booking check shows on load.
export const SAMPLE = {
  people: ['Ploy', 'Ton', 'Nok', 'Mint', 'Bank', 'Fah'],
  areas: ['Leadership', 'Credit', 'Digital', 'Product', 'Sustainability', 'Sales', 'Special event'],
  labels: [
    { id: 'urgent', name: 'Urgent', color: '#b23a32' },
    { id: 'important', name: 'Important', color: '#c06a1c' },
    { id: 'approval', name: 'Waiting approval', color: '#a8862a' },
    { id: 'info', name: 'Waiting info', color: '#7a5a9e' },
    { id: 'follow', name: 'Follow up', color: '#2f7a8c' },
    { id: 'ready', name: 'Ready', color: '#4f6b3a' },
  ],
  items: [
    // Project 1
    { id: 'p1', kind: 'project', name: 'New-hire onboarding revamp', area: 'Product', people: ['Ploy'], start: '2026-11-09', end: '2027-02-26', label: 'important', status: 'in-progress' },
    { id: 'p1a', kind: 'phase', parent: 'p1', name: 'Discovery', area: 'Product', people: ['Ploy', 'Mint'], start: '2026-11-09', end: '2026-11-27', status: 'done' },
    { id: 'p1a1', kind: 'task', parent: 'p1a', name: 'Interview recent hires', area: 'Product', people: ['Ploy'], start: '2026-11-09', end: '2026-11-18', status: 'done' },
    { id: 'p1a2', kind: 'task', parent: 'p1a', name: 'Write up findings', area: 'Product', people: ['Ploy', 'Mint'], start: '2026-11-19', end: '2026-11-27', status: 'done' },
    { id: 'p1b', kind: 'phase', parent: 'p1', name: 'Build modules', area: 'Product', people: ['Ploy'], start: '2026-12-01', end: '2027-01-22', label: 'follow', status: 'in-progress' },
    { id: 'p1c', kind: 'phase', parent: 'p1', name: 'Pilot with two branches', area: 'Product', people: ['Ploy', 'Nok'], start: '2027-02-01', end: '2027-02-26', label: 'approval', status: 'not-started' },
    // Project 2
    { id: 'p2', kind: 'project', name: 'Innovation challenge, season 7', area: 'Special event', people: ['Nok'], start: '2026-11-16', end: '2027-03-05', label: 'urgent', status: 'in-progress' },
    { id: 'p2a', kind: 'phase', parent: 'p2', name: 'Call for ideas', area: 'Special event', people: ['Nok'], start: '2026-11-16', end: '2026-12-18', status: 'in-progress' },
    { id: 'p2b', kind: 'phase', parent: 'p2', name: 'Screening', area: 'Special event', people: ['Nok', 'Bank'], start: '2027-01-04', end: '2027-01-22', status: 'not-started' },
    { id: 'p2c', kind: 'phase', parent: 'p2', name: 'Final pitch day', area: 'Special event', people: ['Nok', 'Bank', 'Fah'], start: '2027-02-22', end: '2027-03-05', label: 'info', status: 'not-started' },
    { id: 'p2c1', kind: 'task', parent: 'p2c', name: 'Brief the judges', area: 'Special event', people: ['Bank'], start: '2027-02-22', end: '2027-02-26', status: 'not-started' },
    { id: 'p2c2', kind: 'task', parent: 'p2c', name: 'Run the day', area: 'Special event', people: ['Nok', 'Fah'], start: '2027-03-05', end: '2027-03-05', status: 'not-started' },
    // Project 3
    { id: 'p3', kind: 'project', name: 'Learning dashboard', area: 'Digital', people: ['Ton'], start: '2026-11-02', end: '2027-02-26', status: 'in-progress' },
    { id: 'p3a', kind: 'phase', parent: 'p3', name: 'Data model', area: 'Digital', people: ['Ton'], start: '2026-11-02', end: '2026-11-20', status: 'done' },
    { id: 'p3b', kind: 'phase', parent: 'p3', name: 'Build', area: 'Digital', people: ['Ton'], start: '2026-11-23', end: '2026-12-31', status: 'in-progress' },
    { id: 'p3b1', kind: 'task', parent: 'p3b', name: 'Connect course records', area: 'Digital', people: ['Ton'], start: '2026-11-23', end: '2026-12-11', status: 'in-progress' },
    { id: 'p3b2', kind: 'task', parent: 'p3b', name: 'Manager view', area: 'Digital', people: ['Ton'], start: '2026-12-14', end: '2026-12-31', status: 'blocked', label: 'info' },
    { id: 'p3c', kind: 'phase', parent: 'p3', name: 'Launch', area: 'Digital', people: ['Ton'], start: '2027-02-15', end: '2027-02-26', label: 'urgent', status: 'not-started' },
    // Courses: each has a plan stage and a run stage
    { id: 'c1p', kind: 'course', group: 'c1', stage: 'plan', name: 'Credit fundamentals', area: 'Credit', people: ['Mint'], start: '2026-12-01', end: '2026-12-18', status: 'in-progress' },
    { id: 'c1r', kind: 'course', group: 'c1', stage: 'run', name: 'Credit fundamentals', area: 'Credit', people: ['Mint'], start: '2027-01-11', end: '2027-01-29', label: 'ready', status: 'not-started' },
    { id: 'c2p', kind: 'course', group: 'c2', stage: 'plan', name: 'Leading a team for the first time', area: 'Leadership', people: ['Bank'], start: '2026-11-02', end: '2026-11-27', status: 'done' },
    { id: 'c2r', kind: 'course', group: 'c2', stage: 'run', name: 'Leading a team for the first time', area: 'Leadership', people: ['Bank', 'Fah'], start: '2027-03-15', end: '2027-03-26', label: 'approval', status: 'not-started' },
    { id: 'c3p', kind: 'course', group: 'c3', stage: 'plan', name: 'Sustainability basics', area: 'Sustainability', people: ['Fah'], start: '2026-12-07', end: '2026-12-24', status: 'in-progress' },
    { id: 'c3r', kind: 'course', group: 'c3', stage: 'run', name: 'Sustainability basics', area: 'Sustainability', people: ['Fah'], start: '2027-02-08', end: '2027-02-12', status: 'not-started' },
    { id: 'c4p', kind: 'course', group: 'c4', stage: 'plan', name: 'Data literacy', area: 'Digital', people: ['Ton'], start: '2027-01-04', end: '2027-01-15', status: 'not-started' },
    { id: 'c4r', kind: 'course', group: 'c4', stage: 'run', name: 'Data literacy', area: 'Digital', people: ['Ton'], start: '2027-02-01', end: '2027-02-19', label: 'important', status: 'not-started' },
  ],
};
