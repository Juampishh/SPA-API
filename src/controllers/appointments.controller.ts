import { Request, Response } from "express";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
export const addPDFHeader = (doc: any) => {
  doc.fontSize(20).text("SPA Sentirse Bien", { align: "center" });
  doc
    .fontSize(10)
    .text("French 444, Resistencia/Chaco, Argentina", { align: "center" });
  doc.text("Tel: +54 362 444-4444", { align: "center" });
  doc.moveDown();
};

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
    const userType = req.query.userType as string;

    if (!user_id) return handleApiResponse(res, 400, "Falta el id del usuario");

    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 404, "El usuario no existe");
    }

    const today = new Date().toISOString().split("T")[0];

    await conn.query(
      "UPDATE appointments SET status = 'completed' WHERE appointment_date < ?",
      [today]
    );

    let query = `
      SELECT a.id AS appointmentId, a.*, s.*, u.*
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.appointment_date >= ?
    `;

    if (userType === "masseuse") {
      query += " AND s.category != 'Belleza'";
    } else if (userType === "beautician") {
      query += " AND s.category = 'Belleza'";
    }

    query += " ORDER BY a.appointment_date ASC";

    const [rows]: any = await conn.query(query, [today]);

    const appointments = rows.map((row: any) => ({
      appointmentId: row.appointmentId, // Use the alias for appointmentId
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
    const status =
      payment_method === "tarjetaCredito" || payment_method === "tarjetaDebito"
        ? "completed"
        : "pending";
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
      "INSERT INTO appointments (user_id, service_id, appointment_date,status, payment_method) VALUES (?, ?, ?, ?, ?)";
    await conn.query(query, [
      user_id,
      service_id,
      appointment_date,
      status,
      payment_method,
    ]);

    const doc = new PDFDocument({ margin: 50 });
    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "zepcion@gmail.com",
          pass: "wxlq cvle wsel cvyq",
        },
      });

      const mailOptions = {
        from: "zepcion@gmail.com",
        to: user[0].email,
        subject: "Confirmación de Cita",
        text: `Hola ${user[0].firstName} ${user[0].lastName},Adjunto a este correo encontrarás tu factura de la cita para el servicio.`,
        attachments: [
          {
            filename: "invoice.pdf",
            content: pdfData,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
        } else {
          console.log("Correo enviado:", info.response);
        }
      });
    });

    doc.fontSize(20).text("Spa Sentirse Bien", { align: "center" });
    doc
      .fontSize(10)
      .text("French 444, Resistencia/Chaco, Argentina", { align: "center" });
    doc.text("Tel: +54 362 444-4444", { align: "center" });
    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Factura No: ${Math.floor(Math.random() * 1000000)}`, {
        align: "right",
      });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.moveDown();

    doc.text(`Cliente: ${user[0].firstName} ${user[0].lastName}`);
    doc.text(`Email: ${user[0].email}`);
    doc.moveDown();

    doc.text("Detalles de la Cita", { underline: true });
    doc.moveDown();
    doc.text(`Servicio: ${service[0].service_name}`);
    doc.text(`Descripción: ${service[0].description}`);
    doc.text(`Fecha de Cita: ${formatedDate(appointment_date)}`);
    doc.text(`Método de Pago: ${paymentMethod(payment_method)}`);
    doc.moveDown();

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
    const { period, userType } = req.body;
    let startDate, endDate;

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

    let query = `
SELECT a.*, s.service_name, s.cost, s.category, 
       u.firstName AS user_firstName, u.lastName AS user_lastName,
       p.firstName AS professional_firstName, p.lastName AS professional_lastName
FROM appointments a
LEFT JOIN spa_services s ON a.service_id = s.id
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN users p ON p.type = ?
WHERE a.appointment_date BETWEEN ? AND ?
`;

    if (userType === "beautician") {
      query += " AND s.category = 'Belleza'";
    } else if (userType === "masseuse") {
      query += " AND s.category != 'Belleza'";
    }

    query += " ORDER BY a.appointment_date ASC LIMIT 20";

    const [rows]: any = await conn.query(query, [userType, startDate, endDate]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reservations_report.pdf"
    );

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(res);

    doc.addPage();

    addPDFHeader(doc);

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

    const addHeader = (y: number) => {
      doc.fontSize(10);
      doc.text("Fecha", 50, y);
      doc.text("Servicio", 120, y);
      doc.text("Precio", 320, y);
      doc.text("Profesional", 400, y);
      return y + 20;
    };

    let y = addHeader(doc.y);

    let totalRevenue = 0;
    const maxRows = 20;
    let rowCount = 0;

    rows.forEach((row: any) => {
      if (rowCount >= maxRows) {
        return;
      }

      const formattedDate = new Date(row.appointment_date).toLocaleDateString(
        "es-AR",
        {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      doc.text(formattedDate, 50, y, { width: 60, ellipsis: true });
      doc.text(row.service_name, 120, y, { width: 180, ellipsis: true });
      doc.text(`$${row.cost}`, 320, y, { width: 60, ellipsis: true });

      const professionalName = `${row.professional_firstName} ${row.professional_lastName}`;
      doc.text(professionalName, 400, y, { width: 150, ellipsis: true });

      const cost = parseFloat(row.cost);
      if (!isNaN(cost)) {
        totalRevenue += cost;
      }

      y += 20;
      rowCount += 1;
    });

    const formattedTotalRevenue = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(totalRevenue);

    doc.moveDown();
    doc.text(`Total Recaudado: ${formattedTotalRevenue}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al generar el reporte");
  }
};

export const getWeeklyPendingAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const conn = await getConnection();
    const { userType } = req.body;
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );
    const endDate = new Date(currentDate.setDate(currentDate.getDate() + 6));

    let query = `
      SELECT a.*, s.service_name, s.cost, s.category, 
             u.firstName AS user_firstName, u.lastName AS user_lastName
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.appointment_date BETWEEN ? AND ?
      AND a.status = 'pending'
    `;

    if (userType === "beautician") {
      query += " AND s.category = 'Belleza'";
    } else if (userType === "masseuse") {
      query += " AND s.category != 'Belleza'";
    }

    query += " ORDER BY a.appointment_date ASC";

    const [rows]: any = await conn.query(query, [startDate, endDate]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pending_weekly_appointments.pdf"
    );

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(res);

    doc.addPage();

    addPDFHeader(doc);

    doc.fontSize(20).text("Citas Semanales Pendientes", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Categoría: ${userType === "beautician" ? "Belleza" : "Masajes"}`, {
        align: "center",
      });
    doc.moveDown();

    const addHeader = (y: number) => {
      doc.fontSize(10);
      doc.text("Fecha", 50, y);
      doc.text("Servicio", 120, y);
      doc.text("Cliente", 320, y);
      return y + 20;
    };

    let y = addHeader(doc.y);

    rows.forEach((row: any) => {
      const formattedDate = new Date(row.appointment_date).toLocaleDateString(
        "es-AR",
        {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
      doc.text(formattedDate, 50, y, { width: 60, ellipsis: true });
      doc.text(row.service_name, 120, y, { width: 180, ellipsis: true });
      const clientName = `${row.user_firstName} ${row.user_lastName}`;
      doc.text(clientName, 320, y, { width: 150, ellipsis: true });

      y += 20;
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener citas semanales pendientes");
  }
};

export const getIncomeReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const conn = await getConnection();
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      res.status(400).send("Faltan las fechas de inicio o fin");
      return;
    }

    const query = `
      SELECT a.appointment_date, a.payment_method, s.service_name, s.category, SUM(s.cost) as total_income
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
      WHERE a.appointment_date BETWEEN ? AND ?
      GROUP BY a.appointment_date, a.payment_method, s.service_name, s.category
      ORDER BY a.appointment_date ASC
      LIMIT 20
    `;

    const [rows]: any = await conn.query(query, [startDate, endDate]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=income_report.pdf"
    );

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(res);

    doc.addPage();

    addPDFHeader(doc);

    doc.fontSize(20).text("Informe de Ingresos", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Rango de Fechas: ${startDate} a ${endDate}`, { align: "center" });
    doc.moveDown();

    const addHeader = (y: number) => {
      doc.fontSize(10);
      doc.text("Fecha", 50, y);
      doc.text("Categoría", 120, y);
      doc.text("Servicio", 270, y);
      doc.text("Método de Pago", 420, y);
      doc.text("Total", 512, y);
      return y + 20;
    };

    let y = addHeader(doc.y);
    let grandTotal = 0;

    rows.forEach((row: any) => {
      const formattedDate = new Date(row.appointment_date).toLocaleDateString();
      doc.text(formattedDate, 50, y, { width: 60, ellipsis: true });
      doc.text(row.category, 120, y, { width: 140, ellipsis: true });
      doc.text(row.service_name, 270, y, { width: 140, ellipsis: true });
      doc.text(row.payment_method, 420, y, { width: 80, ellipsis: true });
      doc.text(`$${row.total_income}`, 520, y, { width: 120, ellipsis: true });
      grandTotal += parseFloat(row.total_income);
      y += 20;
    });

    doc.moveDown();
    doc.fontSize(12).text(`TOTAL: $${grandTotal.toFixed(2)}`, 50, y + 20, {
      align: "left",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al generar el informe de ingresos");
  }
};
export const completeAppointment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const appointment_id = req.params.id as string;

    if (!appointment_id) {
      return handleApiResponse(res, 400, "Falta el id de la cita");
    }

    const [appointment]: any = await conn.query(
      "SELECT * FROM appointments WHERE id = ?",
      [appointment_id]
    );

    if (appointment.length === 0) {
      return handleApiResponse(res, 404, "La cita no existe");
    }

    await conn.query(
      "UPDATE appointments SET status = 'completed' WHERE id = ?",
      [appointment_id]
    );

    return handleApiResponse(res, 200, "Cita completada exitosamente");
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al completar la cita");
  }
};
