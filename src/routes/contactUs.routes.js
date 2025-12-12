import express from 'express';
import { sendContactUsMail } from '../services/email.service.js';
import ContactMessage from '../models/contactMessage.model.js';

const contactRouter = express.Router();

contactRouter.post('/contactUs', async (req, res) => {
   try {
    const { name, email, phoneNumber, message } = req.body;

    // send an email to the admin
    await sendContactUsMail({ name, email, message });

    // save the message in DB
    const newMessage = await ContactMessage.create({
      name,
      email,
      phoneNumber,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Your message has been sent to the admin!",
      data: newMessage,
    });

  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: "Failed to send your message, please try again later." });
  }
})

contactRouter.get('/contactUs', async (req, res) => {
  res.send("<h1>Contact us page hai bhai</h1>")
})


export default contactRouter;
