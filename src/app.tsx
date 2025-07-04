import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";
import { Suspense } from "solid-js";
import { Toaster } from "solid-sonner";

export default function App() {
	return (
		<Router
			root={(props) => (
				<>
					<Toaster expand={false} richColors position="top-right" />
					<Suspense>{props.children}</Suspense>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
