import { Module } from '@nestjs/common';
import { FirebaseService } from './fireBase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
