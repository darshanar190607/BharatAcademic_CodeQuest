import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function test() {
    try {
        console.log("Sending...");
        const msg = await client.messages.create({
            body: 'Test msg',
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+918807715828'
        });
        console.log("Success: " + msg.sid);
    } catch (e) {
        console.log("Error code:", e.code);
        console.log("Error message:", e.message);
        console.log("Error details:", e.details);
    }
}
test();
