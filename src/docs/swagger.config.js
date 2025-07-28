import swaggerJSDoc from 'swagger-jsdoc';
import { envVariables } from '../constant.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'YouTube Backend API',
        version: '1.0.0',
        description: 'API documentation for YouTube Backend project',
    },
    servers: [
        {
            url: envVariables.environment === 'PROD' 
                ? 'https://cloudlearner.duckdns.org:1124/api/v1'
                : 'http://localhost:' + (envVariables.port || 8088) + '/api/v1',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/controllers/*.js', './src/docs/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec; 