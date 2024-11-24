import { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";

const Chatbot = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false); // For toggling chat visibility

	const { backendUrl } = useContext(AppContext);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = { role: "user", content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true);

		try {
			const response = await axios.post(backendUrl + "/api/chat", {
				message: input,
			});

			const { reply } = response.data;

			const botMessage = {
				role: "assistant",
				content: reply,
			};

			setMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			console.error("Error fetching chat response:", error);

			const errorMessage = {
				role: "assistant",
				content: "Sorry, I couldn't process your request.",
			};

			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false);
		}
	};

	const toggleChat = () => setIsOpen((prev) => !prev);

	const clearChat = () => setMessages([]); // Clear all chat messages

	return (
		<div>
			{/* Floating button (User Doctor Icon) */}
			<div
				onClick={toggleChat}
				className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full cursor-pointer shadow-lg text-xl sm:text-2xl md:text-3xl"
			>
				<FaUserDoctor />
			</div>

			{/* Chat UI */}
			{isOpen && (
				<div className="fixed bottom-20 right-10 md:right-16 w-[80%] sm:w-[350px] lg:w-[400px] max-w-full p-5 bg-white shadow-lg rounded-lg z-50 max-h-[500px] overflow-y-auto ">
					{/* Header */}
					<div className="flex justify-between items-center mb-4">
						<div className="flex items-center">
							<FaUserDoctor className="text-xl text-blue-600 mr-2" />
							<span className="font-semibold text-lg">Medo</span>
						</div>

						{/* Close button */}
						<FaTimes
							onClick={() => setIsOpen(false)}
							className="text-xl cursor-pointer"
						/>
					</div>

					{/* Message Box */}
					<div className="max-h-[400px] overflow-y-scroll mb-5 border border-gray-300 p-4">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`mb-3 text-${
									msg.role === "user" ? "right" : "left"
								}`}
							>
								<div className="flex items-center space-x-2">
									{msg.role === "user" ? (
										<FaUserCircle className="text-xl text-gray-600" />
									) : (
										<FaUserDoctor className="text-xl text-blue-600" />
									)}
									<p>
										<strong>{msg.role === "user" ? "You" : "Medo"}:</strong>{" "}
										{msg.content}
									</p>
								</div>
							</div>
						))}
						{loading && <p className="text-left">Medo is typing...</p>}
					</div>

					{/* Input and Send Button */}
					<div className="flex flex-col md:flex-row gap-2 md:gap-3">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSend()}
							placeholder="Type your message..."
							className="w-full md:w-4/5 p-3 border border-gray-300 rounded-lg mb-2 md:mb-0"
							disabled={loading}
						/>
						<button
							onClick={handleSend}
							className="w-full md:w-auto px-5 py-3 bg-blue-600 text-white rounded-lg"
							disabled={loading}
						>
							{loading ? "Sending..." : "Send"}
						</button>
					</div>

					{/* Clear Chat Button */}
					<button
						onClick={clearChat}
						className="mt-3 w-full text-center py-2 text-sm text-red-600 border border-red-600 rounded-lg"
					>
						Clear Chat
					</button>
				</div>
			)}
		</div>
	);
};

export default Chatbot;
