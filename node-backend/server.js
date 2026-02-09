import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

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


function processDepartures(json) {
    const results = json?.Trias?.ServiceDelivery?.DeliveryPayload?.StopEventResponse?.StopEventResult;

    if (!results) {
        return null;
    }

    const resultArray = Array.isArray(results) ? results : [results];

    return resultArray.map(r => {
        const stopEvent = r.StopEvent;
        const call = stopEvent?.ThisCall?.CallAtStop;
        const service = stopEvent?.Service;

        return {
            line: service?.ServiceSection?.PublishedLineName?.Text ?? null,
            destination: service?.DestinationText?.Text ?? null,
            origin: service?.OriginText?.Text ?? null,
            plannedTime: call?.ServiceDeparture?.TimetabledTime ?? null,
            estimatedTime: call?.ServiceDeparture?.EstimatedTime ?? null,
            stopName: call?.StopPointName?.Text ?? null,
            stopSeqNumber: call?.StopSeqNumber ?? null
        };
    });
}

async function getDepartures(stopPointRef, res) {
    try {
        const json = await callTrias(stopPointRef);
        const departures = processDepartures(json);

        if (!departures) {
            return res.status(404).json({ error: 'No departures found' });
        }

        res.json(departures);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

//now instead of STOP1&2 you would put you at:xx:xxxx as parameter that you get as response from the first xml call as seen in the readme.md
//anyway I am not keen on getting my address leaked, hence I put mine into my .env :)
app.get('/api/departures/se', (req, res) => getDepartures(STOP1, res));
app.get('/api/departures/ea', (req, res) => getDepartures(STOP2, res));


const frontendPath = path.join(__dirname, '..', 'angular-frontend', 'dist', 'angular-frontend', 'browser');
app.use(express.static(frontendPath));


app.listen(PORT, () => {
    console.log(`🚊 Tram Departure Board server running on http://localhost:${PORT}`);
});
