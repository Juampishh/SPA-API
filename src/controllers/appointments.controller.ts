import { Request, Response } from "express";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
export const getAppointmentByUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const user_id = req.params.id as string;
    if (!user_id) return handleApiResponse(res, 400, "Falta el id del usuario");
    if (user_id) {
      const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
        user_id,
      ]);
      if (user.length === 0) {
        return handleApiResponse(res, 404, "El usuario no existe");
      }
    }
    const query = "SELECT * FROM appointments WHERE user_id = ?";
    const [rows]: any = await conn.query(query, [user_id]);

    for (const appointment of rows) {
      const [service]: any = await conn.query(
        "SELECT * FROM spa_services WHERE id = ?",
        [appointment.service_id]
      );
      appointment.service = service[0];
    }

    return handleApiResponse(res, 200, "Lista de citas", rows);
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al obtener citas");
  }
};
export const getAllAppointments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const user_id = req.params.id as string;
    if (!user_id) return handleApiResponse(res, 400, "Falta el id del usuario");

    // Verifica la existencia del usuario
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 404, "El usuario no existe");
    }

    const userType = user[0].type;
    let query = `
      SELECT a.*, s.*, u.*
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
      LEFT JOIN users u ON a.user_id = u.id
    `;

    // Ajusta la consulta según el tipo de usuario
    if (userType === "masseuse") {
      query += " WHERE s.category != 'Belleza'";
    } else if (userType === "beautician") {
      query += " WHERE s.category = 'Belleza'";
    }

    // Ordena las citas por fecha
    query += " ORDER BY a.appointment_date";

    const [rows]: any = await conn.query(query);

    // Formatea los datos para incluir el servicio y el usuario en cada cita
    const appointments = rows.map((row: any) => ({
      ...row,
    }));

    return handleApiResponse(res, 200, "Lista de citas", appointments);
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al obtener citas");
  }
};
const paymentMethod = (payment_method: string) => {
  if (payment_method === "tarjetaCredito") {
    return "Tarjeta de Crédito";
  } else if (payment_method === "tarjetaDebito") {
    return "Tarjeta de Débito";
  } else {
    return "Efectivo";
  }
};
const formatedDate = (date: string) => {
  const dateFormated = new Date(date);
  return dateFormated.toLocaleDateString();
};
export const createAppointment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const { user_id, service_id, appointment_date, payment_method } = req.body;
    console.log(req.body);

    if (!user_id || !service_id || !appointment_date || !payment_method) {
      return handleApiResponse(res, 400, "Faltan datos");
    }
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 404, "El usuario no existe");
    }
    const [service]: any = await conn.query(
      "SELECT * FROM spa_services WHERE id = ?",
      [service_id]
    );
    if (service.length === 0) {
      return handleApiResponse(res, 404, "El servicio no existe");
    }
    const query =
      "INSERT INTO appointments (user_id, service_id, appointment_date,status, payment_method) VALUES (?, ?, ?, 'pending', ?)";
    await conn.query(query, [
      user_id,
      service_id,
      appointment_date,
      payment_method,
    ]);

    // Create a PDF invoice
    const doc = new PDFDocument({ margin: 50 });
    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // Configure nodemailer transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "zepcion@gmail.com", // Replace with your email
          pass: "wxlq cvle wsel cvyq", // Replace with your app password
        },
      });

      // Configure email with PDF attachment
      const mailOptions = {
        from: "zepcion@gmail.com",
        to: user[0].email,
        subject: "Confirmación de Cita",
        text: `Hola ${user[0].firstName} ${user[0].lastName}, tu cita para el servicio ${service[0].name} ha sido creada para el ${appointment_date}.`,
        attachments: [
          {
            filename: "invoice.pdf",
            content: pdfData,
          },
        ],
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
        } else {
          console.log("Correo enviado:", info.response);
        }
      });
    });

    // Add company logo
    doc.image("https://ibb.co/kBvfvxj", 50, 45, { width: 100 }); // Adjust the path and size as needed

    // Add content to the PDF
    doc.fontSize(20).text("Spa Sentirse Bien", { align: "center" });
    doc
      .fontSize(10)
      .text("French 444, Resistencia/Chaco, Argentina", { align: "center" });
    doc.text("Tel: +54 362 444-4444", { align: "center" });
    doc.moveDown();

    // Invoice details
    doc
      .fontSize(12)
      .text(`Factura No: ${Math.floor(Math.random() * 1000000)}`, {
        align: "right",
      });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.moveDown();

    // Customer details
    doc.text(`Cliente: ${user[0].firstName} ${user[0].lastName}`);
    doc.text(`Email: ${user[0].email}`);
    doc.moveDown();

    // Appointment details
    doc.text("Detalles de la Cita", { underline: true });
    doc.moveDown();
    doc.text(`Servicio: ${service[0].service_name}`);
    doc.text(`Descripción: ${service[0].description}`);
    doc.text(`Fecha de Cita: ${formatedDate(appointment_date)}`);
    doc.text(`Método de Pago: ${paymentMethod(payment_method)}`);
    doc.moveDown();

    // Footer
    doc.moveDown();
    doc.fontSize(10).text("Gracias por su preferencia.", { align: "center" });
    doc.text("Por favor, conserve este ticket como comprobante.", {
      align: "center",
    });

    doc.end();

    return handleApiResponse(res, 201, "Cita creada");
  } catch (err) {
    console.error(err);
    console.log(err);
    return handleApiResponse(res, 500, "Error al crear cita");
  }
};

export const getReservationsReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const conn = await getConnection();
    const { period } = req.body; // 'week', 'month', 'year'
    let startDate, endDate;

    // Determine the date range based on the period
    const currentDate = new Date();
    if (period === "week") {
      startDate = new Date(
        currentDate.setDate(currentDate.getDate() - currentDate.getDay())
      );
      endDate = new Date(currentDate.setDate(currentDate.getDate() + 6));
    } else if (period === "month") {
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
    } else if (period === "year") {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
    } else {
      res.status(400).send("Periodo no válido");
      return;
    }

    // Query to get all reservations within the date range
    const query = `
      SELECT a.*, s.service_name, s.cost, s.category, u.firstName AS professional_firstName, u.lastName AS professional_lastName
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
      LEFT JOIN users u ON (
        (s.category = 'Belleza' AND u.type = 'beautician') OR
        (s.category != 'Belleza' AND u.type = 'masseuse')
      )
      WHERE a.appointment_date BETWEEN ? AND ?
    `;
    const [rows]: any = await conn.query(query, [startDate, endDate]);

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reservations_report.pdf"
    );

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(20).text("Reporte de Reservas", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Periodo: ${
          period === "week" ? "Semana" : period === "month" ? "Mes" : "Año"
        }`,
        { align: "center" }
      );
    doc.moveDown();

    // Table header
    doc.fontSize(10).text("Fecha", 50, 150);
    doc.text("Servicio", 120, 150);
    doc.text("Precio", 320, 150); // Adjusted x position for "Precio"
    doc.text("Profesional", 400, 150); // Adjusted x position for "Profesional"
    doc.moveDown();

    // Table content
    let y = 170;
    let totalRevenue = 0;
    rows.forEach((row: any) => {
      const formattedDate = new Date(row.appointment_date).toLocaleDateString(
        "es-AR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      doc.text(formattedDate, 50, y, { width: 60, ellipsis: true });
      doc.text(row.service_name, 120, y, { width: 180, ellipsis: true }); // Increased width for "Servicio"
      doc.text(`$${row.cost}`, 320, y, { width: 60, ellipsis: true });
      doc.text(
        `${row.professional_firstName} ${row.professional_lastName}`,
        400,
        y,
        { width: 150, ellipsis: true }
      );

      // Ensure cost is a number before adding
      const cost = parseFloat(row.cost);
      if (!isNaN(cost)) {
        totalRevenue += cost;
      }

      y += 20; // Increment y position for the next row
    });

    // Format total revenue in Argentine currency
    const formattedTotalRevenue = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(totalRevenue);

    // Total revenue
    doc.moveDown();
    doc.text(`Total Recaudado: ${formattedTotalRevenue}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al generar el reporte");
  }
};
