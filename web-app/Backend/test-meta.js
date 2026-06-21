import axios from 'axios';
const metaAccessToken = 'EAA6Ki19JAr4BQxzYv6fJUZALCsRqTs3f1kCrRhZAuBLGJOqTdhX8BGc8PW0kmSiMhVPd8y65gzoLSgt46ixsWRlzmGqVylplzPZC4tqTStRKVaB6WMP6ZAuZABlZAPc4NxMGhXENWIFaoYL4DsNMk5Nqig1dtyFnXeklttIaZC56ZC6DxGAsBrZBVqzZAqs3ynQ6lCDN4ZAvIqZBGAMsEvKpVwAyJIuJjH37mUZAuH3dnZC5wsU0OZAaCI6DUYh0l4oT2Ol9nr7pBTNJJilbsECtYSFxoakUc4H';
const phoneNumberId = '985139691354987';

async function test() {
    try {
        console.log("Sending to Meta...");
        const response = await axios.post(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: "918807715828",
            type: "text",
            text: { preview_url: false, body: "Test free-form message" }
        }, {
            headers: {
                'Authorization': `Bearer ${metaAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.log("Error details:");
        console.log(JSON.stringify(e.response?.data, null, 2));
    }
}
test();
