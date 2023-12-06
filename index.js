require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_KEY);

const settings = {
    port: 1882
}

const options = {
    root: path.join(__dirname, 'html'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  app.post('/create-verification-session', async (req, res) => {
    const verificationSession = await stripe.identity.verificationSessions.create({
        type: 'document'
    })
    await res.json({ client_secret: verificationSession.client_secret })
  })

  app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
    let event;
  
    // Verify the event came from Stripe
    try {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Successfully constructed event
  
    res.json({received: true});
  });


app.get('/', (req, res) => {
    res.sendFile('anon.html', options)
    // res.redirect(settings.mainPageRedirect)
})

app.use('/static', express.static('static'))

app.listen(settings.port, () => {
  console.log(`Example app listening on port ${settings.port}`)
})