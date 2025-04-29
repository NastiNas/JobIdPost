let jobList = [];

export default function handler(req, res) {
  // 🧹 Clean up expired servers
  const now = Date.now() / 1000;
  jobList = jobList.filter(entry => entry.despawnTimeUnix > now);

  if (req.method === 'POST') {
    const { jobId, placeId, despawnTimeUnix } = req.body;

    if (!jobId || !placeId || !despawnTimeUnix) {
      return res.status(400).end(); // missing required fields
    }

    if (despawnTimeUnix <= now) {
      return res.status(410).end(); // server already expired
    }

    const exists = jobList.some(entry => entry.jobId === jobId);
    if (exists) {
      return res.status(409).end(); // duplicate, silently fail
    }

    jobList.push({ jobId, placeId, despawnTimeUnix });
    return res.status(200).end(); // success
  }

  else if (req.method === 'GET') {
    if (jobList.length === 0) {
      return res.status(404).end(); // no valid servers
    }

    // Sort by furthest-out despawn time, descending
    jobList.sort((a, b) => b.despawnTimeUnix - a.despawnTimeUnix);

    // Return only the most "fresh" server
    return res.status(200).json(jobList[0]);
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(); // method not allowed
  }
}
