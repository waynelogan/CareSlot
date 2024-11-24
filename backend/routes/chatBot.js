import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

export const getChatResponse = async (userMessage) => {
	try {
		// Define the messages array for the conversation
		const messages = [
			{
				role: "system",
				content: "You are a helpful assistant.",
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
