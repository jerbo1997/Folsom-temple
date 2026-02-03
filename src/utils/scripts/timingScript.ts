import { PrismaClient } from '@prisma/client';

export async function temple() {
    const prisma = new PrismaClient();
    const temple = await prisma.temple.findUnique({ where: { templeId: 'Temple-1' } })
    const data = [
        {
            title: "Summer(From 1st March)",
            templeId: temple.id,
            timing: [
                {
                    "type": "Mon-Fri",
                    "morning": {
                        "startTime": "6.30 AM",
                        "endTime": "10.30 AM"
                    },
                    "evening": {
                        "startTime": "5.30 PM",
                        "endTime": "8.30 PM"
                    }
                },
                {
                    "type": "Sat-Sun",
                    "morning": {
                        "startTime": "6.30 AM",
                        "endTime": "11.00 AM"
                    },
                    "evening": {
                        "startTime": "5.30 PM",
                        "endTime": "9.00 PM"
                    }
                },
            ]
        },
        {
            title: "Winter(From 1st November)",
            templeId: temple.id,
            timing: [
                {
                    "type": "Mon-Fri",
                    "morning": {
                        "startTime": "7.00 AM",
                        "endTime": "11.00 AM"
                    },
                    "evening": {
                        "startTime": "5.00 PM",
                        "endTime": "8.00 PM"
                    }
                },
                {
                    "type": "Sat-Sun",
                    "morning": {
                        "startTime": "7.00 AM",
                        "endTime": "11.30 AM"
                    },
                    "evening": {
                        "startTime": "5.00 PM",
                        "endTime": "8.30 PM"
                    }
                }
            ]
        }
    ]
    const timing = await prisma.timing.createMany({
        data: data
    })
    console.log('timings created successfully >>>>>', timing)
}
temple()