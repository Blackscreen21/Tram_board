import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

//.env imports
const TRIAS_URL = process.env.TRIAS_API_URL;
const STOP1 = process.env.STOP1;
const STOP2 = process.env.STOP2;
if (!TRIAS_URL || !STOP1 || !STOP2) {
    throw new Error('Missing required environment variables');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmlParser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
});


async function callTrias(stopPointRef) {
    const now = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Trias version="1.2"
      xmlns:siri="http://www.siri.org.uk/siri">
  <ServiceRequest>
    <siri:RequestTimestamp>${now}</siri:RequestTimestamp>
    <siri:RequestorRef>mdv</siri:RequestorRef>
    <RequestPayload>
      <StopEventRequest>
        <Location>
          <LocationRef>
            <StopPointRef>${stopPointRef}</StopPointRef>
          </LocationRef>
        </Location>
        <Params>
          <StopEventType>departure</StopEventType>
          <DepArrTime>
            <TimetableTime>
              <Time>${now}</Time>
            </TimetableTime>
          </DepArrTime>
          <NumberOfResults>10</NumberOfResults>
           <IncludeRealtimeData>true</IncludeRealtimeData> 
        </Params>
      </StopEventRequest>
    </RequestPayload>
  </ServiceRequest>
</Trias>`;

    //the IncludeRealtimeData is important, as the default is false. --> which kinda breaks the whole point


    const res = await fetch(TRIAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        body: xml
    });
    if (!res.ok) {
        throw new Error(`TRIAS API error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();

    return new Promise((resolve, reject) => {
        xmlParser.parseString(text, (err, json) => {
            if (err) reject(err);
            else resolve(json);
        });
    });
}

//now instead of STOP1&2 you would put you at:xx:xxxx as parameter that you get as response from the first xml call as seen in the readme.md
//anyway I am not keen on getting my address leaked, hence I put mine into my .env :)

app.get('/api/departures/ea', async (req, res) => {
    try {
        const json = await callTrias(STOP1);
        res.json(json);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/departures/se', async (req, res) => {
    try {
        const json = await callTrias(STOP2);
        res.json(json);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const frontendPath = path.join(__dirname, '..', 'angular-frontend', 'dist', 'angular-frontend', 'browser');
app.use(express.static(frontendPath));


app.listen(PORT, () => {
    console.log(`🚊 Tram Departure Board server running on http://localhost:${PORT}`);
});
