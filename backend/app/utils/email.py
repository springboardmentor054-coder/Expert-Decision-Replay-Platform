import os
import resend

from dotenv import load_dotenv


load_dotenv()


RESEND_API_KEY = os.getenv("RESEND_API_KEY")


if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_password_reset_email(
    recipient_email: str,
    reset_link: str
):

    if not RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is not configured."
        )

    resend.Emails.send(
        {
            "from": "Expert Decision Replay <onboarding@resend.dev>",
            "to": [recipient_email],
            "subject": "Reset Your Expert Decision Replay Password",
            "html": f"""
                <h2>Password Reset</h2>

                <p>
                    We received a request to reset your
                    Expert Decision Replay Platform password.
                </p>

                <p>
                    Click the button below to create a new password:
                </p>

                <p>
                    <a
                        href="{reset_link}"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in 30 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>
            """
        }
    )