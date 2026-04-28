type CodeInputProps = {
	label?: string;
	length?: number;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
};

export const CodeInput = ({
	label = "Código de verificación",
	length = 6,
	value,
	onChange,
	disabled = false,
}: CodeInputProps) => {
	const digits = Array.from({ length }, (_, index) => value[index] ?? "");

	const handleDigitChange = (index: number, rawValue: string) => {
		const nextDigit = rawValue.replace(/\D/g, "").slice(-1);
		const nextCode = Array.from({ length }, (_, idx) => (idx === index ? nextDigit : value[idx] ?? "")).join("");
		onChange(nextCode);
	};

	return (
		<div>
			<label className="block mb-3 text-sm font-label uppercase tracking-wider text-on-surface-variant">
				{label}
			</label>

			<div className="grid grid-cols-6 gap-3">
				{Array.from({ length }).map((_, index) => (
					<input
						key={index}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digits[index]}
						onChange={(event) => handleDigitChange(index, event.target.value)}
						disabled={disabled}
						aria-label={`Dígito ${index + 1}`}
						className="w-full bg-surface-container border border-outline-variant text-center text-xl font-headline font-black py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
					/>
				))}
			</div>
		</div>
	);
};
