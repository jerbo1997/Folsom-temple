import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from '../auth/fcm.json';
import { v4 } from 'uuid';

@Injectable()
export class FirebaseService {
  constructor() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
      });
    }
  }

  async sendPushNotifications({
    token,
    title,
    body,
    payload = {},
    category = 'normal',
    sub_category = 'generic',
  }: {
    token: string | string[];
    title: string;
    body: string;
    payload?: any;
    category?: string;
    sub_category?: string;
  }) {
    const message: any = {};
    if (typeof token === 'string') {
      message.token = token;
    } else {
      message.tokens = token;
    }
    message.notification = { title, body };
    message.data = { title, body, id: v4() };
    if (payload) {
      message.data.payload = JSON.stringify(payload);
    }

    if (sub_category) {
      message.data.sub_category = sub_category;
    }

    if (category) {
      message.data.category = category;
    }
    message.apns = {
      payload: {
        aps: {
          'mutable-content': 1,
          categoryIdentifier: category || 'normal',
          category: category || 'normal',
          alert: {
            title,
            subtitle: sub_category,
            body,
          },
        },
      },
    };

    try {
      let messageResponse;

      if (message.token) {
        messageResponse = await admin.messaging().send(message);
      } else {
        messageResponse = await admin.messaging().sendMulticast(message);
      }
      console.log('notify res >>>', JSON.stringify(messageResponse));
      return messageResponse;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async verifyToken(token: string) {
    const decodedIdToken = await admin.auth().verifyIdToken(token);
    return decodedIdToken;
  }
}
