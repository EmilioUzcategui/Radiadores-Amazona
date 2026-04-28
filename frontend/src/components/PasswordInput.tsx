type PasswordInputProps = {
	id: string;
	name: string;
	label: string;
	placeholder?: string;
	required?: boolean;
};

export const PasswordInput = ({
	id,
	name,
	label,
	placeholder = "••••••••",
	required = false,
}: PasswordInputProps) => {
	return (
		<div>
			<label htmlFor={id} className="block mb-2 text-sm font-label uppercase tracking-wider text-on-surface-variant">
				{label}
			</label>

			<input
				id={id}
				name={name}
				type="password"
				required={required}
				placeholder={placeholder}
				className="w-full bg-surface-container border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
			/>
		</div>
	);
};
