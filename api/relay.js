let jobList = [];

export default function handler(req, res) {
  const now = Date.now() / 1000;
  jobList = jobList.filter(entry => entry.despawnTimeUnix > now);

  if (req.method === 'POST') {
    const { jobId, placeId, despawnTimeUnix } = req.body;

    
    if (despawnTimeUnix <= now) {
      return res.status(410).end();
    }

    const exists = jobList.some(entry => entry.jobId === jobId);
    if (exists) {
      return res.status(409).end();
    }

    jobList.push({ jobId, placeId, despawnTimeUnix });
    return res.status(200).end();
  }

  else if (req.method === 'GET') {
    return res.status(200).json(jobList);
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  }
}
