import { createForm, type SubmitHandler } from "@modular-forms/solid";
import * as z from "zod/v4-mini";

import { IconLoader } from "~/components/icons";
import { Button } from "./ui/button";
import { Grid } from "./ui/grid";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export const AuthSchema = z.object({
	email: z.email(),
	password: z.string().check(z.minLength(5), z.maxLength(10), z.trim()),
	secret: z.nullable(z.string().check(z.trim())),
});

export type AuthForm = z.infer<typeof AuthSchema>;

export function UserAuthForm() {
	const [authForm, { Form, Field }] = createForm<AuthForm>();

	const handleSubmit: SubmitHandler<AuthForm> = () => {
		return new Promise((resolve) => setTimeout(resolve, 2000));
	};

	return (
		<div class="gap-6 grid">
			<Form onSubmit={handleSubmit}>
				<Grid class="gap-4">
					<Field name="email">
						{(_, props) => (
							<TextField class="gap-1">
								<TextFieldLabel class="sr-only">Email</TextFieldLabel>
								<TextFieldInput
									{...props}
									type="email"
									class="border-[#8f8f8f] text-white"
									placeholder="me@email.com"
								/>
							</TextField>
						)}
					</Field>
					<Field name="password">
						{(_, props) => (
							<TextField class="gap-1">
								<TextFieldLabel class="sr-only">Password</TextFieldLabel>
								<TextFieldInput
									{...props}
									type="password"
									class="border-[#8f8f8f] text-white"
									placeholder="********"
								/>
							</TextField>
						)}
					</Field>
					<Button variant={"secondary"} type="submit" disabled={authForm.submitting}>
						{authForm.submitting && (
							<IconLoader class="mr-2 size-4 animate-spin" />
						)}
						Submit
					</Button>
				</Grid>
			</Form>
		</div>
	);
}
