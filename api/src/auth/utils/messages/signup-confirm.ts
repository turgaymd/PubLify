export const signup_confirm_message = (
  full_name: string,
  confirm_code: number,
) => {
  return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #2e3ecc;">Confirm Your Registration</h2>
            <p>Hello <strong>${full_name}</strong>,</p>
            <p>Thank you for registering with us! To complete your registration process, please use the following confirmation code:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2e3ecc; background: #f1f8ff; padding: 10px; border-radius: 5px; margin: 20px 0;">
              ${confirm_code}
            </div>
            <p>Please enter this code on the confirmation page to verify your email address and finish signing up.</p>
            <p>If you didn't request this code, you can ignore this email.</p>
            <p>If you have any questions or need assistance, feel free to contact our support team at 
              <a href="mailto:publify.team@gmail.com" style="color: #2e3ecc; text-decoration: none;">publify.team@gmail.com</a>.
            </p>
            <p>Best regards,</p>
            <p style="text-align: center; font-weight: bold; color: #2e3ecc;">Publify Team</p>
          </div>
        </body>
      </html>
    `;
};
