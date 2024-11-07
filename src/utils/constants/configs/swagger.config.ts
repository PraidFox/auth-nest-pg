import { DocumentBuilder } from '@nestjs/swagger';

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Authentication')
    .setDescription('The authentication API description')
    .setVersion('1.0')
    .build();
};
