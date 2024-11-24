import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

// Create a new Express router
const router = express.Router();

// Function to handle chat requests and interact with OpenAI API
const getChatResponse = async (userMessage) => {
	try {
		// Define the messages array for the conversation
		const messages = [
			{
				role: "system",
				content:
					"You are CareSlot, a helpful assistant designed to help users manage their healthcare appointments and health records.",
			},
			{
				role: "user",
				content: userMessage,
			},
		];

		// Send the request to OpenAI's chat completions API using fetch
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo", // You can replace with "gpt-4" if needed
				messages: messages,
				temperature: 0.7, // Adjust temperature for response creativity
			}),
		});

		// Check if the response is successful
		if (!response.ok) {
			throw new Error(
				"Oops! Something went wrong while processing your request."
			);
		}

		// Parse the JSON response from OpenAI
		const responseData = await response.json();

		// Return the assistant's reply
		return responseData.choices[0].message.content;
	} catch (error) {
		console.error("Error fetching OpenAI response:", error);

		// Handle errors and provide a fallback message
		return "Sorry, I couldn't process that.";
	}
};

// Chatbot route to handle OpenAI chat messages
router.post("/", async (req, res) => {
	const { message } = req.body;

	// Validate the incoming request
	if (!message) {
		return res.status(400).json({ error: "Message is required" });
	}

	try {
		// Get the response from the OpenAI API
		const reply = await getChatResponse(message);
		res.json({ reply });
	} catch (error) {
		console.error("Error in chatbot response:", error);
		res.status(500).json({ error: "Failed to process the request" });
	}
});

export default router;
