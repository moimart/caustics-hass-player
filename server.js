require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const port = 3000;

const homeAssistantUrl = process.env.HASS_URL;
const accessToken = process.env.HASS_TOKEN;
const entityId = process.env.HASS_ENTITY_ID;
const ZERO = [0.75, 0.375, 0.0];

async function getColorOfLight() {
    try {
        const response = await fetch(`${homeAssistantUrl}/api/states/${entityId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        });

        if (!response.ok) {
            console.error('Network response was not ok', response.statusText);
            return ZERO;
        }

        const data = await response.json();
        if (data.state == 'off')
            return ZERO;

        console.log('Light Data:', data);

        const color = data.attributes.rgb_color || data.attributes.hs_color || data.attributes.xy_color;
        console.log('Color:', color);
        
        return color.map((v, i) => color[i] = v / 255.0);;

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }

    return ZERO;
}

app.use(express.static(path.join(__dirname, 'html')));

app.get('/color', async (req, res) => {
  res.json({ color: await getColorOfLight() });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
