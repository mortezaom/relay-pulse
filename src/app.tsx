import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";
import { Toaster } from "solid-sonner";
import { Suspense } from "solid-js";

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
