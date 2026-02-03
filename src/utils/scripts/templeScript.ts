import { PrismaClient } from '@prisma/client';
import { JsonObject } from '@prisma/client/runtime/library';

export async function temple() {
  const prisma = new PrismaClient();
  const temple = await prisma.temple.upsert({
    where: { templeId: 'Temple-1' },
    create: {
      name: 'Sri Ram Mandir',
      mobile: ['9312247576', '9968093927', '9953617517', '9810874834'],
      phone: [],
      state: 'New Delhi',
      country: 'India',
      postalCode: '110075',
      about: {} as JsonObject,
      address:
        'HAF Pocket 2, Sri Ram Mandir Marg, Sector 7, Dwarka, New Delhi 75',
      isPremium: false,
      history:
        '<h1 class="entry-title">About Sri Ram Mandir</h1></header><div class="entry-content"><p><strong><u>About Sri Ram Mandir</u></strong></p><p>The Delhi Bhajana Samaj (Regd) one of the oldest organizations in Delhi is pleased to dedicate the&nbsp;<strong>SRI RAM MANDIR</strong>&nbsp;situated at HAF Pocket 2, Sri Ram Mandir MArg, (Behind Siddharth Kunj Apartment, Plot No 17), Near Dada Dev Mandir Mela Ground, Sector 7, Dwarka, New Delhi to the people of Dwarka and nearby areas.</p><p><strong>SRI RAM MANDIR</strong>&nbsp;complex consists of Lord Sri Ram Darbar, Lord Kameshwar (Shiva in Ling form), Devi Kameshwari, Lord Ganesh, Lord Hanuman and Navagraha in the Ground floor and Lord Ranganathar (Lord Vishnu in sleeping mode) in the first floor</p><p><strong>Uniqueness of the Temple</strong></p><ul><li><strong>Kumbhabhishekam (Pranpratishta)&nbsp;</strong>has been performed by learned pundits from and graced by the presence of&nbsp;<strong>His holiness Sankaracharya Sri Sri Jayendra Saraswati Swamigal of Kanchi Kamakotee Peetam on 4<sup>th</sup>&nbsp;June 2012</strong></li><li><strong>Kumbhabhishekam</strong>&nbsp;of Noothana Rajagopuram was performed with the benign blessings of His Holiness Jagadguru Sri Sri Jayendra Saraswati Swamigal of Kanchi Kamakotee Peetam on 18<sup>th</sup>&nbsp;March 2016</li><li>Regular pujas are being conducted by learned Pujaris having undergone Gurukul Vedic training at Veda Patashala in Tamil Nadu and well versed with Sastras and rituals</li><li>Abhishekam / Pujas / Archanas / Homams (Havans) are conducted regularly to all deities</li><li>On Saturdays Special Archanas to Lord Shani Devta is performed on behalf of the devotees</li><li>On Every 1<sup>st</sup>&nbsp;Sunday&nbsp;<strong>Ganapathy Homam&nbsp;</strong>/&nbsp;<strong>Navagraha Homam (Havan)&nbsp;</strong>is performed against booking</li><li>On Every 2<sup>nd</sup>&nbsp;Sunday&nbsp;<strong>Lagunyasa Rudra Japam &amp; Abhishekam</strong>&nbsp;is performed to all deities</li><li>On Every 3<sup>rd</sup>&nbsp;Sunday Special Abhishekam is done to&nbsp;<strong>Lord Ranganathar</strong></li></ul><p><strong><u>How to reach the temple :</u></strong></p><p><strong><u>BY ROAD</u></strong></p><ul><li><strong><u>If coming via Sector 1 / 2</u></strong>&nbsp;:- Cross the Sector 1,2,6,7 Signal and Turn left from Air Force Naval Apartment signal and go straight crossing the CCRT Signal. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming via Sector 6 / 10 market</u></strong>&nbsp;:- Cross the Air Force Naval Apartment signal and go straight crossing the CCRT Signal. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming via Ramphal Chowk market</u></strong>&nbsp;:- Turn left from CCRT Signal and go straight. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming From Sector 22 / 23</u></strong>&nbsp;:- Cross through Sector 9 Metro Station go straight, Turn right in the T-point (after Queens Valley School) and go straight. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li></ul><p><strong><u>BY METRO</u></strong></p><ul><li>Get down at Sector 9 Metro Station and come out of Gate No 2. Take a rickshaw by telling either Sri Ram Mandir or Shukar Bazar (Friday Market). The temple is just behind Siddhartha Kunj Apartment, Plot No 17, Sector 7, Dwarka, New Delhi</li></ul></div>',
      timingMeta: { footer: '', header: '*wef 01/03/2023*' } as JsonObject,
      email: ['mandir.dwarka@gmail.com'],
      websiteUrl: ['https://rammandirdwarka.org/site/'],
    },
    update: {
      name: 'Sri Ram Mandir',
      mobile: [
        '9312247576',
        '9968093927',
        '9810138189',
        '9953617517',
        '9810874834',
      ],
      phone: ['0422-2412373'],
      state: 'New Delhi',
      country: 'India',
      postalCode: '110075',
      about: {} as JsonObject,
      address:
        'HAF Pocket 2, Sri Ram Mandir Marg, Sector 7, Dwarka, New Delhi 75',
      isPremium: false,
      history:
        '<h1 class="entry-title">About Sri Ram Mandir</h1></header><div class="entry-content"><p><strong><u>About Sri Ram Mandir</u></strong></p><p>The Delhi Bhajana Samaj (Regd) one of the oldest organizations in Delhi is pleased to dedicate the&nbsp;<strong>SRI RAM MANDIR</strong>&nbsp;situated at HAF Pocket 2, Sri Ram Mandir MArg, (Behind Siddharth Kunj Apartment, Plot No 17), Near Dada Dev Mandir Mela Ground, Sector 7, Dwarka, New Delhi to the people of Dwarka and nearby areas.</p><p><strong>SRI RAM MANDIR</strong>&nbsp;complex consists of Lord Sri Ram Darbar, Lord Kameshwar (Shiva in Ling form), Devi Kameshwari, Lord Ganesh, Lord Hanuman and Navagraha in the Ground floor and Lord Ranganathar (Lord Vishnu in sleeping mode) in the first floor</p><p><strong>Uniqueness of the Temple</strong></p><ul><li><strong>Kumbhabhishekam (Pranpratishta)&nbsp;</strong>has been performed by learned pundits from and graced by the presence of&nbsp;<strong>His holiness Sankaracharya Sri Sri Jayendra Saraswati Swamigal of Kanchi Kamakotee Peetam on 4<sup>th</sup>&nbsp;June 2012</strong></li><li><strong>Kumbhabhishekam</strong>&nbsp;of Noothana Rajagopuram was performed with the benign blessings of His Holiness Jagadguru Sri Sri Jayendra Saraswati Swamigal of Kanchi Kamakotee Peetam on 18<sup>th</sup>&nbsp;March 2016</li><li>Regular pujas are being conducted by learned Pujaris having undergone Gurukul Vedic training at Veda Patashala in Tamil Nadu and well versed with Sastras and rituals</li><li>Abhishekam / Pujas / Archanas / Homams (Havans) are conducted regularly to all deities</li><li>On Saturdays Special Archanas to Lord Shani Devta is performed on behalf of the devotees</li><li>On Every 1<sup>st</sup>&nbsp;Sunday&nbsp;<strong>Ganapathy Homam&nbsp;</strong>/&nbsp;<strong>Navagraha Homam (Havan)&nbsp;</strong>is performed against booking</li><li>On Every 2<sup>nd</sup>&nbsp;Sunday&nbsp;<strong>Lagunyasa Rudra Japam &amp; Abhishekam</strong>&nbsp;is performed to all deities</li><li>On Every 3<sup>rd</sup>&nbsp;Sunday Special Abhishekam is done to&nbsp;<strong>Lord Ranganathar</strong></li></ul><p><strong><u>How to reach the temple :</u></strong></p><p><strong><u>BY ROAD</u></strong></p><ul><li><strong><u>If coming via Sector 1 / 2</u></strong>&nbsp;:- Cross the Sector 1,2,6,7 Signal and Turn left from Air Force Naval Apartment signal and go straight crossing the CCRT Signal. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming via Sector 6 / 10 market</u></strong>&nbsp;:- Cross the Air Force Naval Apartment signal and go straight crossing the CCRT Signal. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming via Ramphal Chowk market</u></strong>&nbsp;:- Turn left from CCRT Signal and go straight. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li><li><strong><u>If coming From Sector 22 / 23</u></strong>&nbsp;:- Cross through Sector 9 Metro Station go straight, Turn right in the T-point (after Queens Valley School) and go straight. Turn left at the T-point near the Siddharth Kunj Apartment (Friday market area), then again turn left in Sri Ram Mandir Marg (behind the Apartment). The temple is situated on the Right hand side just few yards away</li></ul><p><strong><u>BY METRO</u></strong></p><ul><li>Get down at Sector 9 Metro Station and come out of Gate No 2. Take a rickshaw by telling either Sri Ram Mandir or Shukar Bazar (Friday Market). The temple is just behind Siddhartha Kunj Apartment, Plot No 17, Sector 7, Dwarka, New Delhi</li></ul></div>',
      timingMeta: { footer: '', header: '*wef 01/03/2023*' } as JsonObject,
      email: ['mandir.dwarka@gmail.com'],
      websiteUrl: ['https://rammandirdwarka.org/site/'],
    },
  });
  console.log(temple);
}
temple();
