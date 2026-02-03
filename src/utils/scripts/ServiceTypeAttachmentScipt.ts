import { Prisma, PrismaClient } from '@prisma/client';

export async function serviceTypeAttachment() {
  const prisma = new PrismaClient();
  const serviceTypes = await prisma.serviceType.findMany();
  const services = await prisma.service.findMany();
  if (services.length) {
    const images = {
      0: 'service/abishegam1.jpg',
      1: 'service/abishegam2.jpg',
      2: 'service/abishegam3.jpg',
      3: 'service/abishegam4.png',
      4: 'service/abishegam5.jpg',
    };
    let j = 0;
    const attachmentUrls = [];
    for (let i = 0; i < services.length * Object.keys(images).length; i++) {
      const index = i % Object.keys(images).length;
      attachmentUrls.push(Object.values(images)[index]);
    }
    for (const service of services) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          imageUrl: {
            create: {
              mime: attachmentUrls[j].split('.')[1],
              url: attachmentUrls[j],
            },
          },
        },
      });
      j++;
    }
  }
  if (serviceTypes.length) {
    for (const serviceType of serviceTypes) {
      const serviceTypeUrls = {
        abhishekams: 'serviceType/Abhishekams.png',
        allHomam: 'serviceType/AllHomam.png',
        vadamalai: 'serviceType/Vadamalai.png',
        archanai: 'serviceType/Archanai.jpg',
        VahanaPuja: 'serviceType/VahanaPuja.png',
        annadhanam: 'serviceType/Annadhanam.png',
        eveningPrasadam: 'serviceType/EveningPrasadam.png',
        vastram: 'serviceType/Vastram.png',
      };
      const data: Prisma.ServiceTypeUpdateInput = {};
      if (serviceType.type === 'Abhishekams') {
        data.description =
          'The Abhishekam ceremony holds significant spiritual and symbolic importance. It is believed that by performing Abhishekam, devotees express their devotion, seek the blessings of the deity, and purify themselves from sins';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.abhishekams },
        };
      }
      if (serviceType.type === 'All Homam') {
        data.description =
          ' "Homam," also known as "Havan" or "Yajna," is a sacred fire ritual in Hinduism that involves making offerings into a consecrated fire. It is a ritualistic practice with deep spiritual and symbolic significance.';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.allHomam },
        };
      }
      if (serviceType.type === 'Vadamalai') {
        data.description =
          '"Vadamalai" is a term associated with Hindu Tamil culture, it might be a regional or community-specific practice, deity, temple, or festival.';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.vadamalai },
        };
      }
      if (serviceType.type === 'Archanai') {
        data.description =
          '"Archanai," also known as "Archana" or "Aradhana," is a Hindu ritual of worship where devotees offer prayers and hymns to a deity, often accompanied by the ritualistic offering of various items.';
        data.imageUrl = {
          create: { mime: 'jpg', url: serviceTypeUrls.archanai },
        };
      }
      if (serviceType.type === 'Vahana Puja') {
        data.description =
          '"Vahana Puja" is a Hindu ritual where devotees perform worship or puja dedicated to their vehicles or mode of transportation. In this ceremony, individuals seek the blessings of the divine for the safety, well-being, and smooth functioning of their vehicles. ';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.VahanaPuja },
        };
      }
      if (serviceType.type === 'Annadhanam') {
        data.description =
          '"Annadhanam" is a charitable act in Hinduism that involves the selfless offering of food to others, especially those in need. The term "Annadhanam" is derived from the Sanskrit words "Anna," meaning food or grain, and "Dhanam," meaning donation or gift.';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.annadhanam },
        };
      }
      if (serviceType.type === 'Evening Prasadam') {
        data.description =
          '"Evening Prasadham" refers to the offering of blessed food or consecrated items that are distributed to devotees during the evening hours as part of a religious or spiritual practice. The term "Prasadham" or "Prasadam" signifies food that is first offered to a deity during worship and then distributed to the devotees, symbolizing the divine blessings received through the act of worship.';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.eveningPrasadam },
        };
      }
      if (serviceType.type === 'Vastram') {
        data.description =
          '"Vastram" refers to clothing or fabric, and in the context of Hindu religious rituals and ceremonies, it specifically signifies the offering of clothing to deities as part of worship. The act of offering Vastram is a common practice in temples and during various religious ceremonies';
        data.imageUrl = {
          create: { mime: 'png', url: serviceTypeUrls.vastram },
        };
      }
      await prisma.serviceType.update({ where: { id: serviceType.id }, data });
    }
  }
  console.log('service type & service imageUrl created >>>>>>>>');
}
serviceTypeAttachment();
