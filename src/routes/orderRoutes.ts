import { FastifyInstance, FastifyRequest } from 'fastify';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const controller = new OrderController();

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post('/orders', { preHandler: authenticateToken }, async (request, reply) => {
    return controller.createOrder(request as FastifyRequest, reply);
  });
  fastify.get('/orders', { preHandler: authenticateToken }, controller.listOrders.bind(controller));
}


