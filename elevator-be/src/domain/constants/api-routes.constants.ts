export const API_ROUTES = {
  ELEVATORS: {
    ROOT: 'api/elevators',
    CALL: 'call',
    DESTINATION: ':id/destination',
    DOOR_OPEN: ':id/door/open',
    DOOR_CLOSE: ':id/door/close',
  },
  DOCS: 'docs',
} as const;
