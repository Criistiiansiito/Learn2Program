const nodemailer = require("nodemailer");
const enviarRecordatorio = require("../servicios/enviarRecordatorio");

jest.mock("nodemailer");

describe("Pruebas de enviarRecordatorio", () => {
    let sendMailMock;

    beforeEach(() => {
        process.env.GMAIL_USER = "test@email.com";
        process.env.GMAIL_PASS = "password123";
        sendMailMock = jest.fn().mockResolvedValue("Correo enviado");
        nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
    });

    it("Debe enviar un correo con los datos correctos", async () => {
        await enviarRecordatorio("test@email.com", "Asunto Test", "Mensaje de prueba");

        expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith({
            from: expect.any(String),
            to: "test@email.com",
            subject: "Asunto Test",
            text: "Mensaje de prueba",
        });
    });

    it("Debe manejar errores en el envío de correo", async () => {
        sendMailMock.mockRejectedValue(new Error("Fallo en el envío"));

        await expect(
            enviarRecordatorio("test@email.com", "Asunto Test", "Mensaje de prueba")
        ).rejects.toThrow("Fallo en el envío");
    });
});
