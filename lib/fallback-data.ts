export const SAMPLE_REPORTS = [
  {
    id: 'demo-001',
    mitarbeiter: 'Piotr Kowalski',
    workerId: 'worker-001',
    rolle: 'Baggerfahrer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '10:42:00',
    schicht: 2,
    gleis: '4',
    tags: ['Verzögerung', 'Material'],
    audio_url: '/media/demo-001.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 2,
    estimated_cost: 800,
    summary: 'Verzögerung durch undokumentiertes Rohr - 2h Stillstand, Bagger 3 betroffen',
  },
  {
    id: 'demo-002',
    mitarbeiter: 'Jan Nowak',
    workerId: 'worker-002',
    rolle: 'Gleisbauer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '11:15:00',
    schicht: 2,
    gleis: '3',
    tags: ['Material', 'Schotter'],
    audio_url: '/media/demo-002.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 1.5,
    estimated_cost: 400,
    summary: 'Materialmangel Schotter - 1.5h Wartezeit',
  },
  {
    id: 'demo-003',
    mitarbeiter: 'Marek Kowal',
    workerId: 'worker-003',
    rolle: 'Baggerfahrer',
    datum: new Date().toISOString().split('T')[0],
    zeit: '14:30:00',
    schicht: 2,
    gleis: '4',
    tags: ['Maschine', 'Wartung'],
    audio_url: '/media/demo-003.webm',
    image_urls: [],
    status: 'processed',
    delay_hours: 2,
    estimated_cost: 1200,
    summary: 'Hydraulikleck Bagger 3 - Wartung erforderlich',
  },
];

export function getSampleReports(shift?: number) {
  if (shift) {
    return SAMPLE_REPORTS.filter(r => r.schicht === shift);
  }
  return SAMPLE_REPORTS;
}
