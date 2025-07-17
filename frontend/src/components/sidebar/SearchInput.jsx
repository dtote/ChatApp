import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversations();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) {
			return toast.error("Search term must be at least 3 characters long");
		}

		const conversation = conversations.filteredUser.find((c) =>
			c.username.toLowerCase().includes(search.toLowerCase())
		);

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else {
			toast.error("No such user found!");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4 w-full">
			<div className="relative flex-1">
				<input
					type="text"
					placeholder="Search conversations..."
					className="input input-bordered rounded-full text-base px-4 py-3 w-full bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pr-12"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button
					type="submit"
					className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<IoSearchSharp className="w-4 h-4" />
				</button>
			</div>
		</form>
	);
};

export default SearchInput;

