import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GEOAPI_BASE = "https://geoapi-6wt7.onrender.com";

function geoHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env.GEOAPI_KEY ?? "",
  };
}

router.get("/geo/autocomplete", async (req, res): Promise<void> => {
  const { q, limit = "8" } = req.query as Record<string, string>;
  if (!q) { res.status(400).json({ error: "q is required" }); return; }

  try {
    const resp = await fetch(
      `${GEOAPI_BASE}/api/v1/autocomplete/?q=${encodeURIComponent(q)}&city=lagos&limit=${limit}`,
      { headers: geoHeaders() }
    );
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "GeoAPI unreachable" });
  }
});

router.post("/geo/geocode", async (req, res): Promise<void> => {
  const { raw_input } = req.body;
  if (!raw_input) { res.status(400).json({ error: "raw_input is required" }); return; }

  try {
    const resp = await fetch(`${GEOAPI_BASE}/api/v1/geocode/`, {
      method: "POST",
      headers: geoHeaders(),
      body: JSON.stringify({ raw_input, city: "lagos" }),
    });
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "GeoAPI unreachable" });
  }
});

router.post("/geo/route", async (req, res): Promise<void> => {
  const { origin_address, dest_address } = req.body;
  if (!origin_address || !dest_address) {
    res.status(400).json({ error: "origin_address and dest_address are required" });
    return;
  }

  try {
    const resp = await fetch(`${GEOAPI_BASE}/api/v1/route/`, {
      method: "POST",
      headers: geoHeaders(),
      body: JSON.stringify({ origin_address, dest_address, city: "lagos" }),
    });
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "GeoAPI unreachable" });
  }
});

router.get("/geo/reverse", async (req, res): Promise<void> => {
  const { lat, lng, radius_meters = "300" } = req.query as Record<string, string>;
  if (!lat || !lng) { res.status(400).json({ error: "lat and lng are required" }); return; }

  try {
    const resp = await fetch(
      `${GEOAPI_BASE}/api/v1/reverse-geocode/?lat=${lat}&lng=${lng}&radius_meters=${radius_meters}`,
      { headers: geoHeaders() }
    );
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "GeoAPI unreachable" });
  }
});

router.post("/geo/trace", async (req, res): Promise<void> => {
  const { raw_address, actual_lat, actual_lng, success = true, duration_seconds } = req.body;

  try {
    const resp = await fetch(`${GEOAPI_BASE}/api/v1/analytics/traces/`, {
      method: "POST",
      headers: geoHeaders(),
      body: JSON.stringify({ raw_address, actual_lat, actual_lng, success, duration_seconds }),
    });
    const data = await resp.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "GeoAPI unreachable" });
  }
});

export default router;
