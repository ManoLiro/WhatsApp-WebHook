/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

//Aqui é o Token do Whatsapp que vem da META.
const token = process.env.WHATSAPP_TOKEN;

// Depêndencias do Servidor HTTP
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Seta a porta, começa a ouvir e mostra que está funcionando
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Cria um endPoint /webhook
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Msg WebHook
  console.log(JSON.stringify(req.body, null, 2));

  //WhatsApp payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // Extrai o telefone que enviou a msg do payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; //Pega o conteúdo da Mensagem


      //Axios para enviar requisiçoes HTTP
      axios({
        method: "POST", //Metodo POST para poder enviar as mensagens.
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Resposta: " + msg_body }, //Aqui será o contéudo da mensagem que você vai enviar de volta, no caso está respondendo com a mesma mensagem que o cliente enviou
        },
        headers: { "Content-Type": "application/json" },
      });
    }
    res.sendStatus(200);
  } else {
    //Retorna um 404 caso n seja uma whatsapp API
    res.sendStatus(404);
  }
});

// Aqui é o GET Para aceitar a verificação do seu WebHook
// request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {

  //O Token de verificação do .env
  const verify_token = process.env.VERIFY_TOKEN;

  // Parametros da verificação do webhook
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Validação do Token
  if (mode && token) {
    // Validação pra ver se está correto
    if (mode === "subscribe" && token === verify_token) {
      // Status 200 Caso esteja OK
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // 403 Caso os Tokens não conferem
      res.sendStatus(403);
    }
  }
});
