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
		<form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
			<div className="relative flex-1">
				<input
					type="text"
					placeholder="Search conversations..."
					className="input input-bordered rounded-full text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 w-full bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pr-8 sm:pr-10 md:pr-12"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button
					type="submit"
					className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<IoSearchSharp className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
				</button>
			</div>
		</form>
	);
};

export default SearchInput;

