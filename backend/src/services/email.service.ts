import { Resend } from "resend";

type SendRecoveryCodeEmailInput = {
    to: string;
    code: string;
    names?: string;
    expiresInMinutes?: number;
};

type SendRecoveryCodeEmailResult = {
    id: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const buildRecoveryTemplate = (
    code: string,
    names?: string,
    expiresInMinutes = 15,
) => {
    const greetingName = names?.trim() ? names.trim() : "usuario";

    const subject = "Recuperación de contraseña - Radiadores Amazona";
    const text = [
        `Hola ${greetingName},`,
        "",
        "Recibimos una solicitud para recuperar tu contraseña.",
        `Tu código de verificación es: ${code}`,
        `Este código vence en ${expiresInMinutes} minutos.`,
        "",
        "Si no solicitaste este cambio, ignora este correo.",
        "",
        "Radiadores Amazona",
    ].join("\n");

    const html = `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937;">
			<h2 style="margin-bottom: 8px;">Recuperación de contraseña</h2>
			<p>Hola <strong>${greetingName}</strong>,</p>
			<p>Recibimos una solicitud para recuperar tu contraseña.</p>
			<p>Tu código de verificación es:</p>
			<div
				style="
					display: inline-block;
					padding: 12px 20px;
					font-size: 28px;
					font-weight: 700;
					letter-spacing: 6px;
					background-color: #f3f4f6;
					border: 1px solid #d1d5db;
					border-radius: 8px;
					margin: 8px 0 12px 0;
				"
			>
				${code}
			</div>
			<p>Este código vence en <strong>${expiresInMinutes} minutos</strong>.</p>
			<p style="margin-top: 20px; color: #6b7280;">
				Si no solicitaste este cambio, ignora este correo.
			</p>
			<p style="margin-top: 20px;">Radiadores Amazona</p>
		</div>
	`;

    return { subject, text, html };
};

export const generatePasswordRecoveryCode = (length = 6): string => {
    if (!Number.isInteger(length) || length < 4 || length > 8) {
        throw new Error("La longitud del código debe estar entre 4 y 8 dígitos");
    }

    let code = "";
    for (let i = 0; i < length; i += 1) {
        code += Math.floor(Math.random() * 10).toString();
    }

    return code;
};

export const sendRecoveryCodeEmail = async ({
    to,
    code,
    names,
    expiresInMinutes = 15,
}: SendRecoveryCodeEmailInput): Promise<SendRecoveryCodeEmailResult> => {
    if (!RESEND_API_KEY) {
        throw new Error(
            "RESEND_API_KEY no está configurada en variables de entorno",
        );
    }

    if (!to || !to.trim()) {
        throw new Error("El correo destino es obligatorio");
    }

    if (!code || !code.trim()) {
        throw new Error("El código de recuperación es obligatorio");
    }

    const resend = new Resend(RESEND_API_KEY);
    const { subject, text, html } = buildRecoveryTemplate(
        code,
        names,
        expiresInMinutes,
    );

    const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: to.trim().toLowerCase(),
        subject,
        text,
        html,
    });

    if (error) {
        throw new Error(`Error al enviar correo: ${error.message}`);
    }

    if (!data?.id) {
        throw new Error("Resend no devolvió un identificador de envío");
    }

    return { id: data.id };
};
