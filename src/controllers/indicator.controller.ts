import envConfig from '@/config'
import { OrderStatus } from '@/constants/type'
import prisma from '@/database'
import { formatInTimeZone } from 'date-fns-tz'

export const dashboardIndicatorController = async ({ fromDate, toDate }: { fromDate: Date; toDate: Date }) => {
  const [orders, guests, dishes] = await Promise.all([
    prisma.order.findMany({
      include: {
        dishSnapshot: true,
        table: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      }
    }),
    prisma.guest.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        },
        orders: {
          some: {
            status: OrderStatus.Paid
          }
        }
      }
    }),
    prisma.dish.findMany()
  ])

  // Revenue
  let revenue = 0
  // Number of guests successfully ordered
  const guestCount = guests.length
  // Number of orders
  const orderCount = orders.length
  // Dish indicators
  const dishIndicatorObj: Record<
    number,
    {
      id: number
      name: string
      price: number
      description: string
      image: string
      status: string
      createdAt: Date
      updatedAt: Date
      successOrders: number // Number of successful orders
    }
  > = dishes.reduce((acc, dish) => {
    acc[dish.id] = { ...dish, successOrders: 0 }
    return acc
  }, {} as any)
  // Revenue by day
  // Create object revenueByDateObj with key from fromDate -> toDate and value is total income
  const revenueByDateObj: { [key: string]: number } = {}

  // Loop fromDate -> toDate
  for (let i = fromDate; i <= toDate; i.setDate(i.getDate() + 1)) {
    revenueByDateObj[formatInTimeZone(i, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy')] = 0
  }

  // Number of tables in use
  const tableNumberObj: { [key: number]: boolean } = {}
  orders.forEach((order) => {
    if (order.status === OrderStatus.Paid) {
      revenue += order.dishSnapshot.price * order.quantity
      if (order.dishSnapshot.dishId && dishIndicatorObj[order.dishSnapshot.dishId]) {
        dishIndicatorObj[order.dishSnapshot.dishId].successOrders++
      }
      const date = formatInTimeZone(order.createdAt, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy')
      revenueByDateObj[date] = (revenueByDateObj[date] ?? 0) + order.dishSnapshot.price * order.quantity
    }
    if (
      [OrderStatus.Processing, OrderStatus.Pending, OrderStatus.Delivered].includes(order.status as any) &&
      order.tableNumber !== null
    ) {
      tableNumberObj[order.tableNumber] = true
    }
  })
  // Number of tables in use
  const servingTableCount = Object.keys(tableNumberObj).length

  // revenue by date
  const revenueByDate = Object.keys(revenueByDateObj).map((date) => {
    return {
      date,
      revenue: revenueByDateObj[date]
    }
  })
  const dishIndicator = Object.values(dishIndicatorObj)
  return {
    revenue,
    guestCount,
    orderCount,
    servingTableCount,
    dishIndicator,
    revenueByDate
  }
}
