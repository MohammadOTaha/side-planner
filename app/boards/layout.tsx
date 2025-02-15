import { type ReactNode } from "react";
import BoardsNavbar from "./components/boards-navbar";

export default function BoardsLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<BoardsNavbar />
			{children}
		</>
	);
}
