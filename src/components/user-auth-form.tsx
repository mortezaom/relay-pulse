import { createForm, type SubmitHandler } from "@modular-forms/solid";
import * as z from "zod/v4-mini";

import { IconBrandGithub, IconLoader } from "~/components/icons";
import { Button } from "./ui/button";
import { Grid } from "./ui/grid";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export const AuthSchema = z.object({
	email: z.email(),
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
									placeholder="me@email.com"
								/>
							</TextField>
						)}
					</Field>
					<Button type="submit" disabled={authForm.submitting}>
						{authForm.submitting && (
							<IconLoader class="mr-2 size-4 animate-spin" />
						)}
						Login
					</Button>
				</Grid>
			</Form>
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="border-t w-full" />
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<Button variant="outline" type="button" disabled={authForm.submitting}>
				{authForm.submitting ? (
					<IconLoader class="mr-2 size-4 animate-spin" />
				) : (
					<IconBrandGithub class="mr-2 size-4" />
				)}{" "}
				Github
			</Button>
		</div>
	);
}
