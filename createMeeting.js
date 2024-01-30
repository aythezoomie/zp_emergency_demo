require('dotenv').config()
const axios = require('axios');
const rp = require('request-promise')

const createMeeting = async () => {

    const TOKEN_URL = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_S2S_ACCOUNT_ID}`;
    const API_URL = `https://api.zoom.us/v2/rooms/${process.env.ZOOM_ROOM_ID}/events`;
    const tokenRequestPayload = {
    grant_type: 'client_credentials',
    };

    axios
    .post(TOKEN_URL, null, {
        params: tokenRequestPayload,
        auth: {
            username: process.env.ZOOM_S2S_CLIENT_ID,
            password: process.env.ZOOM_S2S_CLIENT_SECRET,
        },
    })
    .then((response) => {
        const { access_token } = response.data;      

        //LOGIC START
        const inviteZR = {
            "jsonrpc": "2.0",
            "method": "zoomroom.meeting_invite",
            "params": {
                "user_ids": process.env.ZR_INVITEE_LIST
            }
          }

          const options_zr = {
            method: 'PATCH',
            uri: API_URL,
            body: inviteZR,
            auth: {
                'bearer': access_token
            },
            headers: {
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            },
            json: true
        }

        rp(options_zr)
        .then(function(response) {
            console.log(response);
        }).catch(function(err) {
            console.log(err);
        })
        //LOGIC END
    })
    .catch((error) => {
        console.error('Error obtaining access token:', error);
    });

}

module.exports = createMeeting
