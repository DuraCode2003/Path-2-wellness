const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const packageJson = require('../../package.json');

// API metadata
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Path2Wellness API',
      version: packageJson.version,
      description: 'API documentation for Path2Wellness healthcare application',
      contact: {
        name: 'API Support',
        email: 'support@path2wellness.com',
        url: 'https://path2wellness.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://path2wellness.com/terms',
      },
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:5000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer &lt;token&gt;',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for external services',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Not authorized to access this route',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Validation Error',
                errors: [
                  {
                    field: 'email',
                    message: 'Email is required',
                  },
                ],
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '5f8d0f3d5c1e2b3d4c5e6f7a',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['patient', 'doctor', 'admin'],
              description: 'User role',
              example: 'patient',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active',
              example: true,
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              example: '2023-06-15T10:30:00Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2023-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2023-01-02T12:30:00Z',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'An error occurred',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that caused the error',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field',
                    example: 'Email is required',
                  },
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the error occurred',
              example: '2023-06-15T10:30:00Z',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10,
            },
            currentPage: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            itemsPerPage: {
              type: 'integer',
              description: 'Number of items per page',
              example: 10,
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true,
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false,
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              description: 'Next page number',
              example: 2,
            },
            previousPage: {
              type: 'integer',
              nullable: true,
              description: 'Previous page number',
              example: null,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'Path2Wellness API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
  },
};

// Serve Swagger UI
const serveSwaggerUI = (app) => {
  // Serve Swagger UI at /api-docs
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
  serveSwaggerUI,
};
