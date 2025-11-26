import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
    return prisma.trip.findMany({
        include: {
            currency: true,
        },
        orderBy: {
            startDate: 'asc',
        },
    })
})
