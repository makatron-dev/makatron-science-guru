import { useEffect, useState } from "react";
import { api } from "../api.js";
import { SUBJECT_LABELS } from "../constants.js";

export default function ZoomPage() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.publicZoom().then(setRows).catch(() => setRows([])); }, []);
  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 720 }}>
      <h1>Zoom Classes</h1>
      <p className="text-dim">Live science sessions with the instructor. Click a session to join.</p>
      <div className="stack" style={{ marginTop: 24 }}>
        {!rows ? (
          <p className="text-faint">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="panel-placeholder">No sessions scheduled yet. Check back soon.</div>
        ) : (
          rows.map((z) => (
            <div key={z.id} className="card">
              <div className="row-between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{z.title}</div>
                  <div className="text-faint" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                    {new Date(z.scheduled_at).toLocaleString()}
                    {z.subject ? " · " + SUBJECT_LABELS[z.subject] : ""}
                  </div>
                </div>
              </div>
              {z.description && <p className="text-dim" style={{ marginTop: 12 }}>{z.description}</p>}
              <a href={z.zoom_url} target="_blank" rel="noreferrer">
                <button style={{ marginTop: 8 }}>Join session</button>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
