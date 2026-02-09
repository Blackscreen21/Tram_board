## Personal Tramboard Site for Home

I live in-between two tram stations in Austria.
The one station is to the north of my home, the other to the west, since the major points
of my city are also in the west, BusBahnBim and Scotty both fail to show both tram options;
recommending me to wait 20 minutes longer because the entire commute is 2 minutes faster.

I decided that I want to create my own Tramboard, a simple composed departure board for both stations.
Just a website that can run on mobile and maybe on an Adruino or Raspi with an e-ink at home.

As data source I required the [OGD-Service-Schnittstelle TRIAS](https://www.verbundlinie.at/de/kundenservice/weitere-infostellen/faqs-hilfe/faq-zur-ogd-service-schnittstelle-trias).
(This is an XML-based API)

***
This project is absolutely fantastic because I want to gain more knowledge in Angular and Node.js by building something.

So join me on my journey in automating 2 clicks :))

***
# Trias
Upon emailing the ogdtrias@verbundlinie.at that you accept their terms of service as stated in the website aforementioned you gain access to their API. (This process may take a bit, so in the meantime you can get yourself some coffee)

**After gaining access:**
You need to make one call to inquire the stop's at:xx:xxxx

this first call looks as follows 
```xml
<Trias version="1.2">
    <ServiceRequest>
    <siri:RequestTimestamp>2023-07-01T12:00:00Z</siri:RequestTimestamp>
    <siri:RequestorRef>SEUS</siri:RequestorRef>
        <RequestPayload>
            <LocationInformationRequest>
                <InitialInput>
                    <LocationName>Graz, Hauptplatz/Congress</LocationName>
                </InitialInput>
            </LocationInformationRequest>
        </RequestPayload>
    </ServiceRequest>
</Trias>
```
I personally used curl for this step.
```bash 
curl -X POST \
-H "Content-Type: text/xml" \
-d @request_stopname.xml \
<your API url>
```
**please note that the `content-type: text/xml` MUST be sent in the request.** <br>
The xml-response looks as follows
```xml
<Trias version="0.1">
    <ServiceDelivery>
        <siri:ResponseTimestamp>2014-07-14T16:46:34</siri:ResponseTimestamp>
        <siri:ProducerRef>MDV-TRIAS</siri:ProducerRef>
        <DeliveryPayload>
            <LocationInformationResponse>
                <Location>
                    <StopPoint>
                        <StopPointRef>at:46:4046</StopPointRef>
                        <StopPointName>
                            <Text>Hauptplatz/Congress</Text>
                            <Language>de</Language>
                        </StopPointName>
                        <LocalityRef>at:46001001:3</LocalityRef>
                    </StopPoint>
                    <LocationName>
                        <Text>Graz</Text>
                        <Language>de</Language>
                    </LocationName>
                    <GeoPosition>
                        <Longitude>15.43837</Longitude>
                        <Latitude>47.07122</Latitude>
                    </GeoPosition>
                    <Complete>true</Complete>
                </Location>
                <Location>
                    <LocationName>
                        <Text>Graz, Hauptplatz/Congress</Text>
                        <Language>de</Language>
                    </LocationName>
                    <GeoPosition>
                        <Longitude>15.43814</Longitude>
                        <Latitude>47.07133</Latitude>
                    </GeoPosition>
                    <Complete>true</Complete>
                </Location>
            </LocationInformationResponse>
        </DeliveryPayload>
    </ServiceDelivery>
</Trias>
```
For the endeavors I had with the API the `<StopPointRef>at:46:4046</StopPointRef>` is the important part.

You can clone this repo put the at:xx:xxxx of your stop(s) into your .env like so
```secret
TRIAS_API_URL=<your_API_url>
PORT=<specify your port>

STOP1=<at:xx:xxxx>
STOP2=<at:xx:xxxx>
```
From this point on you can start your backend and frontend:
`node server.js` (in node-backend)
this starts your API server on the port specified in your .env.
<br>
Then you can start your frontend for (development/testing) from angular frontend with
`ng serve`
This starts the Angular development server, which by default runs on port 4200. The CLI will indicate the exact port

>Note: ng serve is mainly for development and testing. For production or serving everything on a single port, the Angular app can be built (ng build) and served via your Node.js backend.
