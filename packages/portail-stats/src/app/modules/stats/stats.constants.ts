import { environment } from "src/environments/environment";

// Endpoints are still served under the `admin/` prefix by the backend. Keeping
// the base in one place makes a future `portail-stats/*` alias a one-line change.
export const STATS_API_BASE = `${environment.apiUrl}admin/national-stats`;
