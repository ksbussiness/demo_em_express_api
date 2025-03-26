import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default function setupSwagger(app) {
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "EVENT MANAGEMENT ROLE-BASED API",
      description:
        "API Documentation for User Authentication and Event Management System",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3033",
        description: "Local Server",
      },
    ],
    tags: [
      {
        name: "FOR REGISTRATION/LOGIN/LOGOUT",
        description:
          "Endpoints for the user/admin registration, login, logout, and forgot password",
      },
      {
        name: "EVENT-MANAGEMENT-ADMIN",
        description: "Admin endpoints for managing events",
      },
      {
        name: "BOOKING-USER",
        description: "User endpoints for booking events",
      },
      { name: "GENERAL OPERATIONS", description: "General info routes" },
      { name: "DEMO ROUTES", description: "Demo routes" },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: 'Enter JWT token as "Bearer <token>"',
        },
      },
    },
  };

  const swaggerOptions = {
    swaggerDefinition,
    apis: [
      path.resolve(__dirname, "../routes/v1/authroutes.js"),
      path.resolve(__dirname, "../routes/v1/eventroutes.js"),
      path.resolve(__dirname, "../routes/v1/BookingsRoutes.js"),
      path.resolve(__dirname, "../routes/v1/generalroutes.js"),
    ],
    //apis: ['../routes/v1/**/*.js'],
    //apis:['../routes/v1/authroutes.js','../routes/v1/eventroutes.js','../routes/v1/BookingsRoutes.js','../routes/v1/generalroutes.js'],
  };
  console.log(swaggerOptions.apis);

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  //console.log(JSON.stringify(swaggerDocs, null, 2));
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      explorer: true,
      swaggerOptions: {
        docExpansion: "list",
        deepLinking: true,
        displayRequestDuration: true,
        examples: true,
      },
    })
  );

  console.log("Swagger docs available at http://localhost:3033/docs");
}
