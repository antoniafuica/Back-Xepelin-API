const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

const client = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: client });

app.post('/api/xepelin', async (req, res) => {
    const {idOp, tasa, email} = req.body;

    console.log("Recibiendo data: ", idOp, tasa, email)

    const data = {
        idOp: idOp,
        tasa: tasa,
        email: email
    };

    try {
        const response = await fetch('https://hooks.zapier.com/hooks/catch/6872019/oahrt5g/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            res.status(200).send("Tasa actualizada, se informará por correo a: " + email);
        } else {
            res.status(400).send("Error al enviar notificación");
        
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Error al enviar notificación");
    }
});

app.get('/api/xepelin/get-data', async (req, res) => {
    const spreadsheetId = '1UM7ganfucor7vw5Z7iAL3Vqw77erB9EpaFPjtZ-nbQI';
    const range = 'Sheet1!A1:C15';

    try{
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        res.status(200).send(response.data.values);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al obtener datos de Google Sheets");
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

