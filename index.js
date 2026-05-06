const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        console.log("Initialisation...");
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode("237690612024");
                console.log("\n--- CODE WHATSAPP : " + code + " ---\n");
            } catch (err) {
                console.log("Erreur, relance le bot.");
            }
        }, 10000);
    }

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        
        await sock.sendPresenceUpdate('composing', jid);
        await delay(2000);
        await sock.sendMessage(jid, { text: "Salut ! C'est le bot de Denis Phéral. Je ne suis pas disponible pour le moment. 🤖🎮" });
    });

    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') console.log("✅ BOT CONNECTÉ !");
    });
}
start();
          
