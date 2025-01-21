document.addEventListener("DOMContentLoaded", () => {
    const fechaInput = document.getElementById("fecha");
    const boletaInput = document.getElementById("boleta");

    // Establecer la fecha actual
    const fechaActual = new Date().toLocaleDateString();
    fechaInput.value = fechaActual;

    // Obtener y establecer el número de boleta ascendente
    boletaInput.value = getNextBoleta();
});

function getNextBoleta() {
    const lastBoleta = localStorage.getItem("lastBoleta");
    const nextBoleta = lastBoleta ? parseInt(lastBoleta) + 1 : 1; // Inicia en 1 si no hay boleta previa
    localStorage.setItem("lastBoleta", nextBoleta); // Guardar el nuevo número
    return nextBoleta.toString().padStart(6, "0"); // Asegurar 6 dígitos
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const fecha = document.getElementById("fecha").value;
    const destino = document.getElementById("destino").value;
    const direccion = document.getElementById("direccion").value;
    const boleta = document.getElementById("boleta").value;
    const ciRuc = document.getElementById("ciRuc").value; // Captura el valor del campo C.I./RUC

    if (!nombre || !telefono || !destino || !direccion || !ciRuc) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }

    const pdf = new jsPDF();
    const logoUrl = 'https://raw.githubusercontent.com/alaskaenc/codigos/main/ALASKA%20FASHION%20-%20PNG%202023%20NEGRO.png';
    const img = new Image();

    img.onload = function () {
        pdf.addImage(img, 'PNG', 10, 10, 30, 30);
        pdf.setFontSize(15);
        pdf.setFont("helvetica", "bold");
        pdf.text("TICKET DE ENVIO", 80, 22);

        // Agregar cajas y contenido
        const startX = 10; // Coordenada X inicial
        const startY = 50; // Coordenada Y inicial
        const boxWidth = 190; // Ancho de las cajas
        const rowHeight = 13; // Altura de las filas

        const fields = [
            { label: "FECHA:", value: fecha },
            { label: "NÚMERO DE BOLETA:", value: boleta },
            { label: "DESTINATARIO:", value: nombre },
            { label: "C.I./RUC:", value: ciRuc }, // Agregar el nuevo campo al PDF
            { label: "TELÉFONO:", value: telefono },
            { label: "DESTINO:", value: destino },
            { label: "DIRECCIÓN:", value: direccion }
        ];

        let currentY = startY;

        // Dibujar las filas con contenido
        fields.forEach((field) => {
            const y = currentY;

            // Ajustar el texto
            pdf.setFont("helvetica", "normal");
            const text = field.value;
            const textWidth = pdf.getTextWidth(text);
            const maxTextWidth = boxWidth - 80; // Espacio disponible para el texto
            let lines = [];
            let extraHeight = 0;

            // Si el texto excede el límite, dividir en líneas
            if (textWidth > maxTextWidth) {
                lines = pdf.splitTextToSize(text, maxTextWidth);
                extraHeight = lines.length * rowHeight;
            } else {
                lines.push(text);
            }

            // Dibujar la caja para cada campo
            pdf.rect(startX, y, boxWidth, rowHeight + extraHeight); // Ajustar la caja dependiendo del texto

            // Etiqueta de campo
            pdf.setFont("helvetica", "bold");
            pdf.text(field.label, startX + 2, y + 7);

            // Dibujar el texto (en varias líneas si es necesario)
            pdf.setFont("helvetica", "normal");
            lines.forEach((line, i) => {
                pdf.text(line, startX + 80, y + 7 + (i * rowHeight));
            });

            currentY += rowHeight + extraHeight; // Ajustar la posición para el siguiente campo
        });

        // Texto dinámico para "DE: ALASKA FASHION"
        const staticText = [
            "ALASKA FASHION  RUC:803138.800-7",
            "0984 11 33 77  - ENCARNACION, PY",
            "¡MUCHAS GRACIAS POR LA PREFERENCIA!"
        ];

        // Dibujar caja dinámica alrededor del texto estático
        let dynamicY = currentY + 10; // Posición inicial
        const lineHeight = 7; // Altura entre líneas
        const dynamicBoxPadding = 5; // Espacio alrededor del texto

        // Calcular la altura total de la caja
        const dynamicBoxHeight = staticText.length * lineHeight + dynamicBoxPadding * 2;

        // Dibujar el rectángulo
        pdf.rect(startX, dynamicY, boxWidth, dynamicBoxHeight);

        // Agregar el texto dentro de la caja
        pdf.setFont("helvetica", "bold");
        staticText.forEach((line, i) => {
            const textY = dynamicY + dynamicBoxPadding + (i + 1) * lineHeight;
            pdf.text(line, startX + 2, textY);
        });

        pdf.save(`ticket_envio_${boleta}.pdf`);

        // Asegurarse de que el número de boleta se actualice correctamente
        const nextBoleta = getNextBoleta();
        document.getElementById("boleta").value = nextBoleta;

        document.getElementById("ticketForm").reset();
        document.getElementById("boleta").value = nextBoleta; // Restablecer número de boleta en el formulario
        updatePreview();
    };

    img.onerror = function () {
        alert("No se pudo cargar el logo. Asegúrate de que la URL sea correcta.");
    };

    img.src = logoUrl;
}
