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
			<input
				type="text"
				placeholder="Search…"
				className="input input-bordered rounded-full text-base px-4 py-2 w-full max-w-[180px] sm:max-w-[320px]"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<button
				type="submit"
				className="btn btn-circle bg-sky-500 text-white w-10 h-10 sm:w-12 sm:h-12"
			>
				<IoSearchSharp className="w-5 h-5 sm:w-6 sm:h-6 outline-none" />
			</button>
		</form>
	);
};

export default SearchInput;

