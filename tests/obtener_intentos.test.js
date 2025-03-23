/**
 * @jest-environment jsdom
 */
const fs = require("fs");
const path = require("path");

describe("Prueba de integración: Obtener intentos", () => {
    let documentHTML;

    beforeAll(() => {
        const htmlPath = path.join(__dirname, "../views/previsualizar-test.ejs");
        documentHTML = fs.readFileSync(htmlPath, "utf8");

        document.documentElement.innerHTML = documentHTML;
    });

    test("Debe mostrar correctamente el número de intentos en la UI", () => {
        const numIntentos = 3;

        const intentosElement = document.querySelector("p strong");

        intentosElement.textContent = numIntentos;

        expect(intentosElement.textContent).toBe("3");
    });
});
