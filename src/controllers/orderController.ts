import { FastifyReply, FastifyRequest } from 'fastify';
import { OrderService } from '../services/orderService';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.status(401).send({ success: false, message: 'Authentication required' });
      }
      const body = (request.body as { customer: any; paymentMethod?: string; selectedDate?: string; selectedTime?: string }) || {};
      const order = await this.orderService.createOrder({
        userId,
        customer: body.customer,
        paymentMethod: body.paymentMethod || 'card',
        selectedDate: body.selectedDate,
        selectedTime: body.selectedTime,
      });
      return reply.status(201).send({ success: true, order });
    } catch (error: any) {
      console.error('Create order error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({ success: false, message: isDev ? String(error?.message || error) : 'Failed to place order' });
    }
  }

  async listOrders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.status(401).send({ success: false, message: 'Authentication required' });
      }
      const orders = await this.orderService.getOrders(userId);
      return reply.send({ success: true, orders });
    } catch (error: any) {
      console.error('List orders error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      return reply.status(500).send({ success: false, message: isDev ? String(error?.message || error) : 'Failed to fetch orders' });
    }
  }
}


